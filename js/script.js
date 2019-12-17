// Create a new Leaflet map centered on the continental US
var map = L.map("map", { zoomControl: false }).setView([37.8, -96], 3);

// This is the Carto Positron basemap
var basemap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
basemap.addTo(map);

// legend
var legend = L.control({ position: 'bottomright' });

// added initial zoom
var zoomHome = L.Control.zoomHome();
zoomHome.setHomeCoordinates([54.082356, -121.324631]);
zoomHome.setHomeZoom(4);
zoomHome.addTo(map);

var attribution = map.attributionControl;
attribution.setPrefix('&copy; <a target="_blank" href="http://geocadder.bg/en/portfolio.html">GEOCADDER</a>');


// These are declared outisde the functions so that the functions can check if they already exist
var polygonLayer;
// var pointGroupLayer;

// here we declare an array just for the zip codes from the Google Sheets table
var googleSheetsStateArray = [];

// var googleSheetsAttributesNamesArray = [];
var googleSheetsCarriersArray = [];

// http request to Google Sheets API
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
	if (xhttp.readyState == 4 && xhttp.status == 200) {
		googleSheetsData = JSON.parse(xhttp.responseText);

		// here we take all states codes from the Google Sheets table
		googleSheetsData["values"][0].forEach(element => {
			if ((element !== "State") && (!element.includes("Total"))) {
				googleSheetsStateArray.push(element);
			}
		});
		var googleSheetsStateArrayLength = googleSheetsStateArray.length;


		// addded states to all empty cells in the states columns
		for (i = 1; i < googleSheetsStateArrayLength; i++) {
			if (googleSheetsStateArray[i] == "") {
				googleSheetsStateArray[i] = googleSheetsStateArray[i - 1];
			}
		}
		console.log(googleSheetsStateArray);

		// here we take all the names ot attribute data from the Google Sheets table
		googleSheetsData["values"][1].forEach(element => {
			if ((element !== "Carrier Name") && (element !== "")) {
				googleSheetsCarriersArray.push(element);
			}
		});
		console.log(googleSheetsCarriersArray);

		// create a dictionary for states (keys) and carriers (values)
		var dict = {};
		var key = googleSheetsStateArray[0];
		dict[key] = new Array();
		dict[key].push(googleSheetsCarriersArray[0]);
		console.log(googleSheetsCarriersArray[0]);
		for (i = 1; i < googleSheetsStateArray.length; i++) {
			if (googleSheetsStateArray[i] === googleSheetsStateArray[i - 1]) {
				key = googleSheetsStateArray[i];
				dict[key].push(googleSheetsCarriersArray[i]);
			}
			else {
				key = googleSheetsStateArray[i];
				dict[key] = new Array();
				dict[key].push(googleSheetsCarriersArray[i]);
			}
		}
		console.log(dict);




		(function addPolygons(googleSheetsData) {
			// The polygons are styled slightly differently on mouse hovers
			var poylygonStyle = { "color": "#e6250b", "weight": 1, fillOpacity: 0.6 };
			// var polygonHoverStyle = { "color": "#e6250b", "fillColor": "#969393", "weight": 3 };
			var polygonHoverStyle = { "color": "#e6250b", "weight": 3, fillOpacity: 0.8 };

			function getColorValue(d) {
				return d > 14 ? '#800026' :
					d > 12 ? '#BD0026' :
						d > 10 ? '#E31A1C' :
							d > 8 ? '#FC4E2A' :
								d > 6 ? '#FD8D3C' :
									d > 4 ? '#FEB24C' :
										d > 2 ? '#FED976' :
											'#FFEDA0';
			}

			function getColorFill(stateAbbr) {
				for (prop in dict) {
					if (prop === stateAbbr) {
						return dict[prop].length;
					}
				}
			}

			$.getJSON("data/states.geojson", function (data) {
				// add GeoJSON layer to the map once the file is loaded
				var datalayer = L.geoJson(data, {
					style: function (feature) {
						return {
							// fillColor: "#f5a4f2",
							fillColor: getColorValue(getColorFill(feature.properties.STATE_ABBR)),
							color: "#e6250b",
							weight: 1,
							opacity: 1,
							fillOpacity: 0.6
						}
					},
					onEachFeature: function (feature, layer) {
						layer.on({
							mouseout: function (e) {
								e.target.setStyle(poylygonStyle);
							},
							mouseover: function (e) {
								e.target.setStyle(polygonHoverStyle);
							},
							click: function (e) {
								// This zooms the map to the clicked polygon
								map.fitBounds(e.target.getBounds());

								for (var i = 0; i < googleSheetsStateArrayLength; i++) {
									if (googleSheetsStateArray[i] == feature.properties["STATE_ABBR"]) {
										currentStateIndex = i;
									}
								}

								var popupContent = "<b><u>" + feature.properties["STATE_NAME"] + "</u></b>";

								for (prop in dict) {
									console.log(prop);
									if (prop === feature.properties["STATE_ABBR"]) {
										dict[prop].forEach(element => {
											if(!element.includes("*")){
												popupContent += "</br>" + element;
											}											
										});
									}
								}

								feature.properties["STATE_ABBR"] ==

									layer.bindPopup(popupContent).openPopup();
							}
						});
					}
				}).addTo(map);
				map.fitBounds(datalayer.getBounds());
			});
		})();
	}
};

xhttp.open("GET", "https://sheets.googleapis.com/v4/spreadsheets/1RUPyd4i_ydBKyV9oFqht1QbgDn4fY_zdXWulq8b_lP8/values/Sheet2!A1:B357?majorDimension=COLUMNS&key=AIzaSyBmqofMdHP-jzXGrPTeXEvsDhTRYbMPWGI", true);

xhttp.send()





