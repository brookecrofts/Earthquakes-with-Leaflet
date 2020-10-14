// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
createFeatures(data.features);
});

function createFeatures(earthquakeData) {

// Give each feature a popup describing the place and time of the earthquake
function onEachFeature(feature, layer) {
  layer.bindPopup("<h3>" + feature.properties.place +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
}
function magColors(mag) {

  switch (true) {
    case mag >= 5.0:
      return 'purple';
      break;
    case mag >= 4.0:
      return 'blue';
      break;
    case mag >= 3.0:
      return 'red';
      break;
    case mag >= 2.0:
      return 'orange';
      break;
    case mag >= 1.0:
      return 'yellow';
      break;      
    // default:
    //   return 'white';  
  };
  };

// // Function to determine marker size based on magnitude???
function markerSize(mag) {
    return mag * 2;
  };

var earthquakes = L.geoJSON(earthquakeData, {

  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: magColors(feature.properties.mag),
        color: "white",
        weight: 0.5,
        opacity: 0.5,
        fillOpacity: 1.0
    });  
  },
  onEachFeature: onEachFeature
});
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
    var quakemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",  
      maxZoom: 8,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 15,
      id: "dark-v10",
      accessToken: API_KEY
    });

  // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Quakes Map": quakemap,
      "Dark Map": darkmap
    };

  // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };

    // Create our map, giving it the earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        1, -83
      ],
      zoom: 2,
      layers: [quakemap, earthquakes]
    });

// Create a layer control, Pass in our baseMaps and overlayMaps, Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);

// Set up the legend
var legend = L.control({position: "bottomright"});
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var limits = ["<1", "<2", "<3", "<4", "<5"];
  var colors = ["#ffff00", "#ffa500", "#ff0000", "#0000ff", "#a020f0"];
  var labels = [];

  // Add min & max
  var legendInfo = "<h1>Earthquake Magnitude</h1>";
    "<div class=\"labels\">" +
      "<div class=\"min\">" + limits[0] + "</div>" +
      "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
    "</div>";

div.innerHTML = legendInfo;

limits.forEach(function(limits, index) {
  labels.push(`<li style = "background-color: ${colors[index]}">${limits}</li>`);
  });

div.innerHTML += "<ul>" + labels.join("") + "</ul>";
return div;
};

// Adding legend to the map
legend.addTo(myMap);
};