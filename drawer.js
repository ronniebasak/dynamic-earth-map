// Since our map is in miller's projection, we need a mechanism to convert X,Y coordinates into Lat, Long pairs
// Formula taken from Wikipedia
// X-Y should be normalized to 0-1
function miller2map(x,y){
	var lat = x;
	var lng = 	1.25*Math.atan(Math.sinh(0.8*y))
	return {lat, lng}
}


// Inverse of that, it takes lat, lng and returns X,Y between ranges 0-1
function map2miller(lat, lng){
	x = lat
	y = 1.25*Math.asinh(0.8*tan(lng))
	return {x,y};
}

var cc;	var cinfo;

// Load the country code keyed cache
$.get('cc.json', function(data){
		cc = data;
		//alert(data["IN"]);
	});

// get the beast, the countries.json, contains all information about all countries in JSON
$.get('countries.json', function(data){
		cinfo = data;
		//alert(data[0]["cca2"])
	})

// Parse out the map width and height
var maph = parseFloat($("#vga").attr('height'));
var mapw = parseFloat($("#vga").attr('width'));

window.onload = function(){
	
	// On mouseover, highlight countries, and show their names
	$('path').hover(function(){
			$('#ocean').css('fill', 'white');
			y = $(this).parent() // Checking the parent
			x = y.prop('tagName'); // get the parent tagname
			if(x == "g"){ // if its a group
				
				if(y.attr('id').length == 2) {
					// COUNTRY
					cc2 = y.attr('id')
					$(this).css('fill', 'green');
					$('#cc').html(cc[cc2.toUpperCase()]);
					
				} else {
					// GREENLAND
					$(this).css('fill', 'green');
					$('#cc').html(cc[y.parent().attr('id').toUpperCase()]);
				}
			} else if($(this).attr('id')!='ocean' ){
				// COUNTRY
				cc2 = $(this).attr('id')
				$(this).css('fill', 'green');
				$('#cc').html(cc[cc2.toUpperCase()]);
			} else{
				$('#cc').html($(this).attr('id'));
			}
		});
		
	// On mouseout, revert
	$('path').mouseout(function(){
			y = $(this).parent() // Checking the parent
			x = y.prop('tagName'); // get the parent tagname
			if(x == "g"){ // if its a group
				
				if(y.attr('id').length == 2) {
					// COUNTRY
					$(this).css('fill', 'rgb(185,185,185)');
					//console.log("Country");
				}
				 else {
					// GREENLAND
					$(this).css('fill', 'rgb(185,185,185)');
					
				}
			} else if($(this).attr('id')!="ocean") {
				
				// COUNTRY
				$(this).css('fill', 'rgb(185,185,185)');
			}
		});
		
	
	// Clicking a country yields the info bar
	// And in case you're wondering why? I've reverse engineered
	// the svg file and built up the conditions
	$('path').click(function(){
			y = $(this).parent() // Checking the parent
			x = y.prop('tagName'); // get the parent tagname
			if(x == "g"){ // if its a group
				
				if(y.attr('id').length == 2) {
					// COUNTRY
					PullInfo($(this).parent().attr('id'));
					// This function fulls from JSON and puts into their places;
				}
				 else {
					// GREENLAND
					PullInfo($(this).parent().parent().attr('id'));
				}
			} else if($(this).attr('id')!="ocean") {
				PullInfo($(this).attr('id'));
			}
			$('#info').fadeIn();
		});
}


// This function finds the country object given one of it's properties, only cca2 and cca3 can be used 
// Primary key. Others will return the first occurance in alphabetical order
function findCn(ccn, n){
	obj = null;
	for(i=0; i<cinfo.length; i++){
		if(cinfo[i][n] == ccn){
			obj = cinfo[i];
			///console.log(obj);
			break;
		}
	}
	return obj;
}

// This function pulls info about a country, given it's 2 letter country code
function PullInfo(cc2){
	cc2 = cc2.toUpperCase();
	var obj = findCn(cc2, "cca2");
	
	$('#countryName').html(obj["name"]["common"]);
	$('#cca2').html(obj["cca2"]);
	$('#cca3').html(obj["cca3"]);
	$('#tld').html(obj["tld"]);
	
	tmp = ""
	for(i=0; i<obj["currency"].length; i++){
		tmp+=obj["currency"][i]+" "
	}
	$('#currency').html(tmp);
	tmp = ""
	for(i=0; i<obj["callingCode"].length; i++){
		tmp+="+"+obj["callingCode"][i].toString();
	}
	$('#callingCode').html(tmp);
	$('#capital').html(obj["capital"]);
	$('#region').html(obj["region"]);
	$('#subregion').html(obj["subregion"]);
	
	tmp = "";
	
	if(obj["latlng"][1]<0)
		tmp+= Math.abs(obj["latlng"][1]).toString()+" &deg;S, ";
	else
		tmp+= Math.abs(obj["latlng"][1]).toString()+" &deg;N, ";
	if(obj["latlng"][0]<0)
		tmp+= Math.abs(obj["latlng"][0]).toString()+" &deg;W ";
	else
		tmp+= Math.abs(obj["latlng"][0]).toString()+" &deg;E " ;
		
	$('#latlng').html(tmp);
	$('#demonym').html(obj["demonym"]);
	$('#landlocked').html(obj["landlocked"].toString());
	
	tmp="";
	//console.log(obj["borders"].length);
	for(k=0; k < obj["borders"].length; k++){
		objx = findCn(obj["borders"][k], "cca3")
		if(k<obj["borders"].length-1)
			tmp+= objx["name"]["common"]+", ";
		else
			tmp+= objx["name"]["common"];

	}
	$('#border').html(tmp);
	$('#area').html(obj["area"].toString()+"km<sup>2</sup>");
	
}

// This positions the element relative to mouse
// also, updates the coordinates
window.onmousemove = function (ev) {
	document.getElementById("alge").style.top = (ev.clientY+5).toString()+"px";
	document.getElementById("alge").style.left = (ev.clientX+5).toString()+"px";
	
	cX = (ev.clientX+window.scrollX)/mapw;
	cY = (ev.clientY+window.scrollY)/maph;
	var ll = miller2map(cX, cY);
	lat = ll['lat']*360-180;
	lng = ll['lng']*180-90;
	$('#cord').html("Lat: "+lat.toFixed(4).toString()+" Long: "+lng.toFixed(4).toString() );s
}
