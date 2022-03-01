//Step 1. Create the Leaflet map
//declare map var in global scope
var map;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        //map parameters
        center: [20, 40],
        zoom: 4
    });
    //add the basemap.
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

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //Conditional if attValue is greater than 0, do the function. If it is zero, return zero.
    if (attValue === 0){
        return 0;
    } else {
        //constant factor adjusts symbol sizes evenly
        var minRadius = 5;
        //Flannery Apperance Compensation formula, with minValue manually set to 1 to avoid dividing by 0.
        var radius = 1.0083 * Math.pow(attValue/1,0.5715) * minRadius

        return radius;
    }
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
     //Assign the current attribute based on the first index of the attributes array
     var attribute = attributes[0];

    //create marker options
    if (feature.properties[attributes[12]] === 'O'){
        var options = {
            fillColor: "#ffb703",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7
        }} else {
        var options = {
            fillColor: "#219ebc",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7
        }}

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer   
        var layer = L.circleMarker(latlng, options);
        
         //build popup content string
        var popupContent = "<p><b>City:</b> " + feature.properties.City + ", " + feature.properties.Country + "</p><p><b>" + "Number of cheetahs" + ":</b> " + feature.properties[attribute] + "</p>";
        
        //bind the popup to the circle marker
        layer.bindPopup(popupContent);

        //return the circle marker to the L.geoJson pointToLayer option
        return layer;
    };

//Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.City + ", " + props.Country;

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "</p><p><b>" + "Number of cheetahs" + ":</b> " + props[attribute] + "</p>";

            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent).update();
        };
    });
};

//Create new sequence controls
function createSequenceControls(attributes){
    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
    
    //set slider attributes
    document.querySelector(".range-slider").max = 9;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    //below Example 3.6...add step buttons
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse"></button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward"></button>')

    //replace button content with images
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/noun-backward.png'>")
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/noun-forward.png'>")

    //click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;
            
            //increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //if past the last attribute, wrap around to first attribute
                index = index > 9 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //if past the first attribute, wrap around to last attribute
                index = index < 0 ? 9 : index;
            };

            //update slider
            document.querySelector('.range-slider').value = index;
            //pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })
    })
    
    //input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){            
        //get the new index value
        var index = this.value;
        //pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
};

//Build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        attributes.push(attribute);
        };

    return attributes;
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data
    fetch("data/cheetah_data.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create an attributes array
           var attributes = processData(json);
           createPropSymbols(json, attributes);
           createSequenceControls(attributes);
    });       
};

document.addEventListener('DOMContentLoaded',createMap)