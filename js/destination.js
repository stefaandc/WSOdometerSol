class Location {
  constructor(lat, long, accuracy) {
    this.lat = lat;
    this.long = long;
    this.accuracy = accuracy;
    this.time = new Date();
  }
}
class PositionComponent {
  constructor() {
    this.status = "";
    this.destination = new Location(51.034306, 3.701102);
    this.currentPosition = null;
    this.zoomLevel = 13;
    this.map = new StreetMap();
    this.getLocation();
  }
  getLocation() {
    const settings = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
    navigator.geolocation.watchPosition(
      position => this.updateLocation(position),
      error => this.handleLocationError(error),
      settings
    );
  }
  updateLocation(position) {
    if (position.coords.accuracy >= 5000) {
      this.status = "Need more accurate values to calculate distance.";
    } 
    else {
      this.currentPosition = new Location(
        position.coords.latitude,
        position.coords.longitude,
        position.coords.accuracy
      );
      this.status = "Location retrieved.";
      this.toHtml();
    }
    this.showStatus();
  }

  handleLocationError(error) {
    const errorTypes = {
      0: "There was an error while retrieving your location.",
      1: "The user opted not to share his or her location.",
      2: "The browser was unable to determine your location.",
      3: "The browser timed out before retrieving the location."
    };
    this.status = errorTypes[error.code];
    if (error.code === 0 || error.code === 2)
      this.status += " - " + error.message;
    this.showStatus();
  }

  showStatus() {
    document.getElementById("status").innerHTML = `Status: ${this.status}`;
  }

  toHtml() {
    document.getElementById("latdest").innerHTML = `Latitude: ${this.destination.lat.toFixed(6)}`;
    document.getElementById("longdest").innerHTML = `Longitude: ${this.destination.long.toFixed(6)}`;
    document.getElementById("time").innerHTML = `Timestamp: ${new Date(this.currentPosition.time).ddmmyyyy()}`;
    document.getElementById("lat").innerHTML = `Latitude: ${this.currentPosition.lat.toFixed(6)}`;
    document.getElementById("long").innerHTML = `Longitude: ${this.currentPosition.long.toFixed(6)}`;
    document.getElementById("acc").innerHTML = `Accuracy: ${this.currentPosition.accuracy} meter`;
    let distance = (calcDistance(this.destination, this.currentPosition) / 1000).toFixed(3);
    document.getElementById("distance").innerHTML = `Distance to destination: ${distance} km`;   
    this.map.setMarker(this.destination,this.zoomLevel);
    this.map.setMarker(this.currentPosition,this.zoomLevel);
  }
}

class StreetMap {
  constructor() {
    this.map = null;
    this.createMap();
  }
  createMap() {
    //Create Tile layer
    let osmLayer = new ol.layer.Tile({
      source: new ol.source.OSM()
    });
    // Create latitude and longitude and convert them to default projection
    const dest = ol.proj.fromLonLat([0, 0]);
    // Create a View, set it center and zoom level
    let view = new ol.View({
      center: dest,
      zoom: 12//zoomLevel
    });
    // Instanciate a Map, set the object target to the map DOM id
    this.map = new ol.Map({
      target: "map"
    });
    // Add the created layers to the Map
    this.map.addLayer(osmLayer);
    // Set the view for the map
    this.map.setView(view);
  }

  setMarker(loc,zl) {
    let marker = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([loc.long, loc.lat]))
    });
    marker.setStyle(
      new ol.style.Style({
        image: new ol.style.Icon(
          /** @type {olx.style.IconOptions} */({
            color: "#FF71AE",
            src: "images/dot.png"
          })
        )
      })
    );
    //create vector layer
    let vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [marker]
      })
    });
    const pos = ol.proj.fromLonLat([loc.long, loc.lat]);
    let view = new ol.View({
      center: pos,
      zoom: zl
    });
    this.map.addLayer(vectorLayer);
    // Set the view for the map
    this.map.setView(view);
  }
}

window.onload = () => {
  let pc = new PositionComponent();
  let slider = document.getElementById("myRange");
  slider.oninput = function() {
    pc.zoomLevel = this.value;
    pc.toHtml();
}
};

function calcDistance(l1, l2) {
  // R is the radius of the earth in meters
  const R = 6371000;
  const deltaLatitude = (l2.lat - l1.lat).toRadians();
  const deltaLongitude = (l2.long - l1.long).toRadians();
  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(l1.lat.toRadians()) *
    Math.cos(l2.lat.toRadians()) *
    Math.sin(deltaLongitude / 2) *
    Math.sin(deltaLongitude / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
Number.prototype.toRadians = function () {
  return (this * Math.PI) / 180;
};
Date.prototype.ddmmyyyy = function () {
  let dd = this.getDate().toString();
  let mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
  const yyyy = this.getFullYear().toString();
  let hh = this.getHours().toString();
  let min = this.getMinutes().toString();
  return (
    (dd[1] ? dd : "0" + dd[0]) +
    "-" +
    (mm[1] ? mm : "0" + mm[0]) +
    "-" +
    yyyy +
    "    -     " +
    (hh[1] ? hh : "0" + hh[0]) +
    ":" +
    (min[1] ? min : "0" + min[0])
  );
};
