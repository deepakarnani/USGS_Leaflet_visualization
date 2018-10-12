// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
// Tectonic plates link
var tectonic_link = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});


function createFeatures(earthquakeData) {
  var earthquakes = L.geoJson(earthquakeData, {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place + "<br> Magnitude: " + feature.properties.mag +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")
    },
    pointToLayer: function(feature, latlng) {
      return new L.circle(latlng,
          {radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: 0.75,
          stroke: true,
          color: "red",
          weight: 0.45
      })
    }
  });

// Sending our earthquakes layer to the createMap function
  createMap(earthquakes)
};


// Sending our earthquakes layer to the createMap function
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });
  // Creat a layer for the tectonic plates
  var tectonicPlates = new L.LayerGroup();


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satellite": satellitemap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes, tectonicPlates]
  });
  //Parse mag data from json and feature into the circles object
  d3.json(tectonic_link, function(plates) {
    // Adding our geoJSON data, along with style information, to the tectonicplates
    // layer.
    L.geoJson(plates, {
      color: "green",
      weight: 1.5
    })
    .addTo(tectonicPlates);
  });


  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);
};


// Create legend


var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (myMap) {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 1, 2, 3, 4, 5],
                labels = [],
                from, to;

            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];

                labels.push(
                    '<i style="background:' + getColor(from + 1) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(myMap);

function getRadius(value){
  return value*20000
  };
function getColor(d) {
  return d > 5 ? '#F30' :
        d > 4  ? '#F60' :
        d > 3  ? '#F90' :
        d > 2  ? '#FC0' :
        d > 1   ? '#FF0' :
            '#9F3';
  };



