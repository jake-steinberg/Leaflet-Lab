/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [20, 40],
        zoom: 4
    });

    var CartoDB_DarkMatterNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	    subdomains: 'abcd',
	    maxZoom: 20
    }).addTo(map);

    //call getData function
    getData();
};

function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data
    fetch("data/cheetahsO.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){            
            //create marker options
            var originMarkerOptions = {
                radius: 8,
                fillColor: "#ffb703",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, originMarkerOptions);
                },
            onEachFeature:onEachFeature    
            }).addTo(map);
        });
        fetch("data/cheetahsTD.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){            
            //create marker options
            var transitDestMarkerOptions = {
                radius: 8,
                fillColor: "#219ebc",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, transitDestMarkerOptions);
                },
            onEachFeature:onEachFeature    
            }).addTo(map);
        });
};

document.addEventListener('DOMContentLoaded',createMap)