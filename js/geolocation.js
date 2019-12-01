class GeolocationService {
  static getPosition(settings) {
    return new Promise(function(resolve, reject) {
      navigator.geolocation.getCurrentPosition(
        // On Success
        function(position) {
          resolve(position);
        },
        // On Error
        function(error) {
          reject(error);
        },
        settings
      );
    });
  }
}

class GeoviewComponent {
  constructor() {
    this.getLocation();
  }
  getLocation() {
    const settings = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
    GeolocationService.getPosition(settings)
      .then(position => {
        this.showPosition(position);
        this.showOnMap(position);
      })
      .catch(error => this.showError(error));
  }
  showPosition(position) {
	document.getElementById("time").innerHTML = 
		`Timestamp: ${new Date(position.timestamp).toLocaleDateString()}`;
	document.getElementById("lat").innerHTML = 
		`Latitude: ${position.coords.latitude.toFixed(6)}`;
	document.getElementById("long").innerHTML = 
		`Longitude: ${position.coords.longitude.toFixed(6)}`;
	document.getElementById("acc").innerHTML = 
		`Accuracy: ${position.coords.accuracy} meter`;
  }
  showOnMap(position) {
    //marker & markerstyle
    const marker = new ol.Feature({
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
            color: "#4271AE",
            crossOrigin: "anonymous",
            src: "https://openlayers.org/en/v4.6.5/examples/data/dot.png"
          })
        )
      })
    );
    //map creation with two layers: Tile - Vector (marker) - view centered on coords from position
    const map = new ol.Map({
      target: "map",
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        }),
        new ol.layer.Vector({
          source: new ol.source.Vector({
            features: [marker]
          })
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([
          position.coords.longitude,
          position.coords.latitude
        ]),
        zoom: 18
      })
    });
  }
  showError(error) {
    const errorTypes = {
      0: "There was an error while retrieving your location.",
      1: "The user opted not to share his or her location.",
      2: "The browser was unable to determine your location.",
      3: "The browser timed out before retrieving the location."
    };
    let errorMessage = errorTypes[error.code];
    if (error.code === 0 || error.code === 2)
      errorMessage += " - " + error.message;
    alert(`Error: ${errorMessage}`);
  }
}

window.onload = () => new GeoviewComponent();
