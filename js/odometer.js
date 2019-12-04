var odometer, map = null;
class Location {
  constructor(lat, long, accuracy) {
    this.lat = lat;
    this.long = long;
    this.accuracy = accuracy;
    this.time = new Date();
  }
}

class Odometer {
  constructor() {
    this.locations = new Array();
  }
  addLocation(lat, long, accuracy) {
    this.locations.push(new Location(lat, long, accuracy));
  }
  getCurrentLocation() {
    return this.locations[this.locations.length - 1];
  }
  getTotalDistance() {
    var total = 0;
    for (var i = 0; i < this.locations.length - 1; i++) {
      total += calcDistance(this.locations[i], this.locations[i + 1]);
    }
    return total;
  }
}

class OdometerComponent {
  constructor() {
    this.status = "";
    this.odometer = new Odometer();
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
    
      this.odometer.addLocation(
        position.coords.latitude,
        position.coords.longitude,
        position.coords.accuracy
      );
      this.status = "Location retrieved.";
      this.toHtml(position);
   
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
    document.getElementById("status").innerHTML = "Status: " + this.status;
  }

  toHtml(position) {
    this.map.setMarker(position);
    const cLoc = this.odometer.getCurrentLocation();
    document.getElementById("latitude").innerHTML =
      "Latitude: " + cLoc.lat.toFixed(4);
    document.getElementById("longitude").innerHTML =
      "Longitude: " + cLoc.long.toFixed(4);
    document.getElementById("accuracy").innerHTML =
      "Accuracy: " + cLoc.accuracy;
    document.getElementById("totalDist").innerHTML =
      "Total distance traveled: " + this.odometer.getTotalDistance().toFixed(0) + " m";
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
      zoom: 15
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

  setMarker(position) {
    let marker = new ol.Feature({
      geometry: new ol.geom.Point(
        ol.proj.fromLonLat([
          position.coords.longitude,
          position.coords.latitude
        ])
      )
    });
    marker.setStyle(
      new ol.style.Style({
        image: new ol.style.Icon(
          /** @type {olx.style.IconOptions} */ ({
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
    const pos = ol.proj.fromLonLat([
      position.coords.longitude,
      position.coords.latitude
    ]);
    let view = new ol.View({
      center: pos,
      zoom: 18
    });
    this.map.addLayer(vectorLayer);
    // Set the view for the map
    this.map.setView(view);
  }
}

window.onload = () => {
  new OdometerComponent();
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

Number.prototype.toRadians = function() {
  return this * Math.PI / 180;
};

Date.prototype.hhmmss = function() {
  const hh = this.getHours().toString();
  const mm = this.getMinutes().toString(); // getMonth() is zero-based
  const ss = this.getSeconds().toString();
  return (
    (hh[1] ? hh : "0" + hh[0]) +
    ":" +
    (mm[1] ? mm : "0" + mm[0]) +
    ":" +
    (ss[1] ? ss : "0" + ss[0])
  ); // padding
};
