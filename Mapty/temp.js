// window.addEventListener('beforeunload', ()) => {
//   console.log('helll-----------5555555');
// });

// const marker = L.marker([51.5, -0.09], {
//   draggable: true, // Create a draggable marker.
// })
//   .addTo(map)
//   .on('dragend', e => console.log(e.target.getLatLng()));
// var circle = L.circle([51.508, -0.11], {
//   color: 'red',
//   fillColor: '#f03',
//   fillOpacity: 0.5,
//   radius: 500,
// }).addTo(map);
// var polygon = L.polygon([
//   [51.509, -0.08],
//   [51.503, -0.06],
//   [51.51, -0.047],
// ]).addTo(map);

// marker.bindPopup('<b>Hello world!</b><br>I am a popup.').openPopup();
// circle.bindPopup('I am a circle.');
// polygon.bindPopup('I am a polygon.');

// var popup = L.popup()
//   .setLatLng([51.513, -0.09])
//   .setContent('I am a standalone popup.')
//   .openOn(map);

// function onMapClick(e) {
//   alert('You clicked the map at ' + e.latlng);
// }

// map.on('click', onMapClick);

// function onMapClick(e) {
//   map.addLayer(
//     L.popup({
//       autoClose: false,
//       closeOnClick: false,
//       // keepInView: true,
//     })
//       .setLatLng(e.latlng)
//       .setContent('You clicked the map at ' + e.latlng.toString())
//   );
// }

// map.on('click', onMapClick);
document.querySelector('.btn--test').addEventListener('click', function () {
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      console.log(layer.getLatLng());
    }
  });
});
// create a red polyline from an array of LatLng points
// const from = [51.5, -0.09];
// const to = [51.527144, -0.153669];
// let x = L.latLng(from);
// let y = L.latLng(to);
// var latlngs = [x, y];

// var polyline = L.polyline(latlngs, {
//   stroke: true,
//   color: 'red',
//   dashArray: '20, 20',
//   dashOffset: '0',
//   weight: 5,
// })
//   .bindPopup(`${(x.distanceTo(y) / 1000).toFixed(3)} km`)
//   .addTo(map)
//   .openPopup();

// mymap.eachLayer(function (layer) {
//   if (layer instanceof L.Marker) {
//     alert(layer.getLatLng());
//   }
// });

// map.on('baselayerchange', alert('Hell'));

// const maro = mero._geocodeMarker._latlng;

class Marker {
  #coord;
  #line;
  #map;
  #latLngs;
  #color;
  #center;
  #marker;
  constructor(map, center, coord, color) {
    this.#map = map;
    this.#center = L.latLng(center);
    this.#coord = L.latLng(coord);
    this.#latLngs = [this.#center, this.#coord];
    this.#color = color;
    this.createMarker();
    this._createDashedLine();
  }

  getMarker() {
    return this.#marker;
  }

  createMarker() {
    this.#marker = L.marker(this.#coord, {
      draggable: true, // Create a draggable marker.
    })
      .bindPopup('<b>Hello world!</b><br>I am a popup.')
      .openPopup()
      .addTo(map)
      .on('dragend', (e) => {
        this.#latLngs[1] = this.#coord = e.target.getLatLng();
        this._createDashedLine.call(this);
      });
  }

  _createDashedLine() {
    if (this.#line) this.#map.removeLayer(this.#line);
    this.#line = L.polyline(this.#latLngs, {
      stroke: true,
      color: this.#color,
      dashArray: '20, 20',
      dashOffset: '0',
      weight: 5,
    })
      .bindPopup(
        `${(this.#coord.distanceTo(this.#center) / 1000).toFixed(3)} km`
      )
      .addTo(map)
      .openPopup();
  }
}

// let center;
// if (navigator.geolocation)
//   navigator.geolocation.getCurrentPosition(
//     (pos) => (center = [pos.coords.latitude, pos.coords.longitude]),
//     () => alert('Could not get your position')
//   );

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
        () => reject(Error('Could not get your position'))
      );
    } else {
      reject(Error('Geolocation is not supported by this browser'));
    }
  });
}

let center;
let map;
let mark;
async function main() {
  try {
    center = await getCurrentPosition();
  } catch {
    console.log('Some error');
  }

  // try {
  //   center = await getCurrentPosition();
  // } catch (error) {
  //   console.error(error);
  // }

  map = L.map('map').setView(center, 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const mero = L.Control.geocoder({
    defaultMarkGeocode: false,
    position: 'topleft',
  }).addTo(map);
  console.log(mero);

  mero.on('markgeocode', function (e) {
    console.log('------------------');
    const pos = [e.geocode.center.lat, e.geocode.center.lng];
    new Marker(map, center, pos, 'red');
    map.setView(pos, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    console.log(e);
    console.log('------------------ ');
  });

  const coord = [30.083316660823865, 31.25040372118186];
  mark = new Marker(map, center, coord, 'blue');
  console.log(mark);
}

main();

// const yourEventHandler = function (result) {
//   console.log(result.location);
// };

// map.on('geosearch/showlocation', yourEventHandler);
//
