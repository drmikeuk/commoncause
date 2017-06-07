// init map with marker clusterer

    // define tiles 
    var StamenTonerLite = L.tileLayer('http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20
    });

    var StamenTerrain = L.tileLayer('http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20
    });

    var EsriWorldTopoMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    });

    var EsriWorldGrayCanvas = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
    });

    // create a map in the "map" div, center on a given place (center uk) and zoom to country level
    // max zoom to city level (10) not street level (15) as geolocations only for given city, not actual address
    var map = L.map('map', {
        zoom: 6,
        minZoom: 6,
        maxZoom: 9,
        center: [54.00366,-2.547855],
        layers: [EsriWorldTopoMap]
    });


    // add layers control
    var baseMaps = {
        "Esri Topo": EsriWorldTopoMap,
        "StamenTerrain": StamenTerrain,
        "Stamen Toner Lite": StamenTonerLite,
        "Esri Gray Canvas": EsriWorldGrayCanvas
        // "Acetate": Acetate_all
    };



    // map categories (people) to FA icon colours
    var colours = {
      "GovernmentOrganisation":'darkblue',
      "LearnedSociety":'blue',
      "ResearchOrganisation":'lightblue',
      "ThirdSector":'darkgreen',
      "University":'green',
      "Other":'lightgray',
      "":'lightgray'
    }   


    // read data from CSV and add to map
    $.get('/commoncause2partner.tsv', function(csvContents)
    // NB attribute names always lowercase eg Title -> feature.properties.title
    {
      var i = 1;
      // create markerClusterGroup (NB add markers to subgroups)
      var markersgroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyDistanceMultiplier: 1.5
      }),
      // add subgroups too - will add markers to these
      GovernmentOrganisation = L.featureGroup.subGroup(markersgroup),
      LearnedSociety = L.featureGroup.subGroup(markersgroup),
      ResearchOrganisation = L.featureGroup.subGroup(markersgroup),
      ThirdSector = L.featureGroup.subGroup(markersgroup),
      University = L.featureGroup.subGroup(markersgroup),
      Other = L.featureGroup.subGroup(markersgroup);

      var geoLayer = L.geoCsv(csvContents, {
        firstLineTitles: true, 
        fieldSeparator: '|',
        onEachFeature: function (feature, layer) {
          // nicer way to template this??
          var popup = '<div class="popup-content">';
          //popup += i;
          popup += "<h2>" + feature.properties.projecttitle + "</h2>";
          popup += '<div class="city">' + feature.properties.lead + ', ' + feature.properties.org + ', ' + feature.properties.city + '</div>';
          popup += "<p>" + feature.properties.partners + "</p>";
          popup += "<p>" + feature.properties.aims + "</p>";
          popup += "</div>";
          layer.bindPopup(popup);
          i ++;

          // add to subgroups...
          // ***********************************************************************************

          if (feature.properties.category == "GovernmentOrganisation") {
              layer.addTo(GovernmentOrganisation);
              //console.log("    -> GovernmentOrganisation");
          } else if (feature.properties.category == "LearnedSociety") {
              layer.addTo(LearnedSociety);
              //console.log("    -> LearnedSociety");
          } else if (feature.properties.category == "ResearchOrganisation") {
              layer.addTo(ResearchOrganisation);
              //console.log("    -> ResearchOrganisation");
          } else if (feature.properties.category == "ThirdSector") {
              layer.addTo(ThirdSector);
              //console.log("    -> ThirdSector");
          } else if (feature.properties.category == "University") {
              layer.addTo(University);
              //console.log("    -> University");         
          } else {
              layer.addTo(Other);
              //console.log("    -> Other");
          } 
          // ***********************************************************************************
        },
        pointToLayer: function (feature, latlng) {
          //console.log(i + ". " + feature.properties.city + " - " + feature.properties.person);
          return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon: 'circle-o', prefix: 'fa', markerColor: colours[feature.properties.category]}) })
        }
      });

      // add to map
      map.addLayer(markersgroup);
      // add subgroups too
      // ***********************************************************************************
      map.addLayer(GovernmentOrganisation);
      map.addLayer(LearnedSociety);
      map.addLayer(ResearchOrganisation);
      map.addLayer(ThirdSector);
      map.addLayer(University);
      map.addLayer(Other);     
      // ***********************************************************************************


      // CONTROLS
      // maybe colours["BoxBrown"] etc so cant get out of step??
      var overlays = {
      "<i class='fa fa-circle darkblue'></i> Government Organisation": GovernmentOrganisation,
      "<i class='fa fa-circle blue'></i> Learned Society": LearnedSociety,
      "<i class='fa fa-circle lightblue'></i> Research Organisation": ResearchOrganisation,
      "<i class='fa fa-circle darkgreen'></i> Third Sector": ThirdSector,
      "<i class='fa fa-circle green'></i> University": University,
      "<i class='fa fa-circle lightgray'></i> Other": Other
      };
      L.control.layers(baseMaps, overlays, {collapsed: false}).addTo(map);

    // add intro sidebar
    var sidebar = L.control.sidebar('sidebar', {
        position: 'left'
    });
    map.addControl(sidebar);
    // show on startup
    setTimeout(function () {
      sidebar.show();
    }, 500);

    // add button to toggle sidebar
    L.easyButton( 'fa-question', function(){
      sidebar.toggle();
    }).addTo(map);

    // handle close sidebar button 
    $('#sidebarOK').click(function(){
        sidebar.hide();
    });


    });
