// Loading actual SVG image into HTML canvas
$("#actualSVG").load("w.svg");

// Since our map is in miller's projection, we need a mechanism to convert X,Y coordinates into Lat, Long pairs
// Formula taken from Wikipedia
// X-Y should be normalized to 0-1
function miller2map(x, y) {
	var lat = x;
	var lng = 1.25 * Math.atan(Math.sinh(0.8 * y))
	return {
		lat,
		lng
	}
}


// Inverse of that, it takes lat, lng and returns X,Y between ranges 0-1
function map2miller(lat, lng) {
	x = lat
	y = 1.25 * Math.asinh(0.8 * tan(lng))
	return {
		x,
		y
	};
}

var cc;
var cinfo;

// Load the country code keyed cache
$.get('cc.json', function (data) {
	cc = data;
	//alert(data["IN"]);
});

// get the beast, the countries.json, contains all information about all countries in JSON
$.get('countries.json', function (data) {
	cinfo = data;
	//alert(data[0]["cca2"])
})

// Parse out the map width and height
var maph = parseFloat($("#vga").attr('height'));
var mapw = parseFloat($("#vga").attr('width'));

window.onload = function () {

	// On mouseover, highlight countries, and show their names
	$('#actualSVG').on("mouseover", "path", function () {
		$('#ocean').css('fill', 'white');
		y = $(this).parent() // Checking the parent
		x = y.prop('tagName'); // get the parent tagname
		if (x == "g") { // if its a group

			if (y.attr('id').length == 2) {
				// COUNTRY
				cc2 = y.attr('id')
				$(this).css('fill', 'green');
				$('#cc').html(cc[cc2.toUpperCase()]);

			} else {
				// GREENLAND
				$(this).css('fill', 'green');
				$('#cc').html(cc[y.parent().attr('id').toUpperCase()]);
			}
		} else if ($(this).attr('id') != 'ocean') {
			// COUNTRY
			cc2 = $(this).attr('id')
			$(this).css('fill', 'green');
			$('#cc').html(cc[cc2.toUpperCase()]);
		} else {
			$('#cc').html($(this).attr('id'));
		}
	});

	// On mouseout, revert
	$('#actualSVG').on("mouseout", "path", function () {
		y = $(this).parent() // Checking the parent
		x = y.prop('tagName'); // get the parent tagname
		if (x == "g") { // if its a group

			if (y.attr('id').length == 2) {
				// COUNTRY
				$(this).css('fill', 'rgb(185,185,185)');
				//console.log("Country");
			} else {
				// GREENLAND
				$(this).css('fill', 'rgb(185,185,185)');

			}
		} else if ($(this).attr('id') != "ocean") {

			// COUNTRY
			$(this).css('fill', 'rgb(185,185,185)');
		}
	});


	// Clicking a country yields the info bar
	// And in case you're wondering why? I've reverse engineered
	// the svg file and built up the conditions
	$('#actualSVG').on("click", "path", function () {
		var immediateParent = $(this).parent() // Checking the parent
		var parentTag = y.prop('tagName'); // get the parent tagname
		var _id_to_pull="";
		
		if (parentTag == "g") { // if its a group
			if (immediateParent.attr('id').length == 2) {
				// COUNTRY
				_id_to_pull=immediateParent.attr('id');				
			} else {
				// GREENLAND
				_id_to_pull=immediateParent.parent().attr('id');
			}
		} else if ($(this).attr('id') != "ocean") {
			_id_to_pull=$(this).attr('id');
		}
		
		// This function pulls from JSON and puts into their places;
		if(_id_to_pull!=""){ // Just a precaution. We dont want jibberish-gibberish on our window, are we?
			PullInfo(_id_to_pull);
			$('#info').slideDown();
		}
	});
}

$("#close-info").click(function (evt) {
	evt.preventDefault();
	$('#info').slideUp()
});

// This function finds the country object given one of it's properties, only cca2 and cca3 can be used 
// Primary key. Others will return the first occurance in alphabetical order
function findCn(ccn, n) {
	var result=cinfo.find(function(element){
		return element[n]==ccn;
	});
	return result!==undefined?result:null;
}

// This function pulls info about a country, given it's 2 letter country code
function PullInfo(cc2) {
	cc2 = cc2.toUpperCase();
	var obj = findCn(cc2, "cca2");

	$('#countryName').html(obj["name"]["common"]);
	$('#cca2').html(obj["cca2"]);
	$('#cca3').html(obj["cca3"]);
	$('#tld').html(obj["tld"]);

	
	$('#currency').html(obj['currency'].join(' '));
	$('#callingCode').html(
		(obj['callingCode'].length>0?"+":"") + 
		(obj["callingCode"].join(", +"))
	);
	$('#capital').html(obj["capital"]);
	$('#region').html(obj["region"]);
	$('#subregion').html(obj["subregion"]);

	$('#latlng').html(
		Math.abs(obj['latlng'][1]).toString() + " &deg;" + (obj['latlng'][1]<0?'S':'N') + " " + // Latitude
		Math.abs(obj['latlng'][0]).toString() + " &deg;" + (obj['latlng'][0]<0?'W':'E') // Longitude
 	);
	$('#demonym').html(obj["demonym"]);
	$('#landlocked').html(obj["landlocked"].toString());

	var borders=[];	
	obj['borders'].forEach(function(value,index){
		objx = findCn(value, "cca3")
		borders.push(objx['name']['common']);
	});
	
	$('#border').html(borders.join(", "));
	$('#area').html(obj["area"].toString() + "km<sup>2</sup>");

}

// This positions the element relative to mouse
// also, updates the coordinates
window.onmousemove = function (ev) {
	if (isNaN(mapw)) {
		mapw = parseFloat($("#vga").attr('width'));
	}
	if (isNaN(maph)) {
		maph = parseFloat($("#vga").attr('height'));
	}
	document.getElementById("alge").style.top = (ev.clientY + 5).toString() + "px";
	document.getElementById("alge").style.left = (ev.clientX + 5).toString() + "px";

	cX = (ev.clientX + window.scrollX) / mapw;
	cY = (ev.clientY + window.scrollY) / maph;
	var ll = miller2map(cX, cY);
	lat = ll['lat'] * 360 - 180;
	lng = ll['lng'] * 180 - 90;
	$('#cord').html("Lat: " + lat.toFixed(4).toString() + " Long: " + lng.toFixed(4).toString());
}