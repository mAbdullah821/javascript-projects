'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  #id;
  #coords;
  #map;
  #center;
  #marker;
  #line;
  color;
  markerText;
  date;
  type;
  icon;
  #app;
  edit;
  constructor(app, map, center, coords, duration) {
    this.#app = app;
    this.#id = Date.now();
    this.date = new Date();
    this.#map = map;
    this.#center = center;
    this.#coords = coords;
    this.duration = duration;
    this.edit = false;
  }

  _createWorkout() {
    this._addWorkoutToList();
    this.createMarker();
  }
  _getHtmlContnet() {
    return `
    <li class="workout workout--${this.type}" data-id="${this.#id}">
    <h2 class="workout__title">${this.markerText}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        this.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${this.calcDistance()}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${this.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;
  }

  calcDistance() {
    return (this.#coords.distanceTo(this.#center) / 1000).toFixed(3);
  }

  static getMonthName(monthNum) {
    return [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ][monthNum];
  }

  getMarker() {
    return this.#marker;
  }

  getLine() {
    return this.#line;
  }

  getId() {
    return this.#id;
  }

  getCoords() {
    return this.#coords;
  }

  _createEditDeleteButtons(textAboveButtons) {
    const container = L.DomUtil.create('div');
    const p = L.DomUtil.create('p', '', container);
    p.style = 'margin: 5px 0px';
    p.innerText = textAboveButtons;

    const btnEdit = this._createButton('edit', container);
    const btnDelete = this._createButton('delete', container);

    // const editFunc = function () {
    //   console.log('edit');
    // };

    // const deleteFunc = function () {
    //   console.log('delete');
    // };

    L.DomEvent.on(btnEdit, 'click', this._editWorkout.bind(this));
    L.DomEvent.on(btnDelete, 'click', this._deleteWorkout.bind(this));

    return container;
  }

  _loadWorkoutInfo() {
    form.querySelector('.form__input--distance').value = this.calcDistance();
    form.querySelector('.form__input--duration').value = this.duration;
    form.querySelector('.form__input--type').value = this.type;
    this.#app._switchWorkoutType();
  }

  _editWorkout() {
    //TODO:
    this.edit = true;
    // Add the current workout to the app using [attacedWorkout] variable;
    this.#app.setAttachedWorkout(this);
    // add the current workout info to the form
    form.style.display = 'grid';
    this._loadWorkoutInfo();
    this.#app.setCoords(this.#coords);
    // Remove the workout
    this._deleteVisualWorkout();
    // display The form
    App.displayForm();
  }

  _deleteVisualWorkout() {
    // Remove the workout Marke
    this.#map.removeLayer(this.#marker);
    // Remove The attached line
    this.#map.removeLayer(this.#line);
    // Remove the workout from the visual list
    containerWorkouts.querySelectorAll('li').forEach((ele) => {
      if (+ele.dataset.id === this.#id) ele.remove();
    });
  }

  _deleteWorkout() {
    this._deleteVisualWorkout();
    // Remove it from [APP] workout array
    this.#app._deleteWorkout(this.#id);
  }

  _createButton(label, container) {
    let btn = L.DomUtil.create('button', '', container);
    btn.type = 'button';
    btn.innerHTML = label;
    btn.style = 'margin: 0px 5px;';
    return btn;
  }

  createMarker() {
    if (!this.icon) {
      this.icon = L.icon({
        iconUrl: `${this.type}-icon.png`,
        iconSize: [42, 42],
        popupAnchor: [0, -10],
      });
    }

    this.#marker = L.marker(this.#coords, {
      draggable: true, // Create a draggable marker.
      icon: this.icon,
    })
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: true,
          closeOnClick: false,
          className: `${this.type}-popup`,
        }).setContent(this._createEditDeleteButtons(this.markerText))
      )
      .addTo(this.#map)
      .openPopup()
      .on('dragend', (e) => {
        this.#app._hideForm();
        this.#coords = e.target.getLatLng();
        containerWorkouts
          .querySelector(`li[data-id='${this.#id}']`)
          .querySelectorAll('div')[0]
          .querySelector('.workout__value').textContent = this.calcDistance();
        this._createDashedLine.call(this);
      })
      .on('click', this.#app._hideForm.bind(this.#app));

    this._createDashedLine();
  }

  _createDashedLine() {
    if (this.#line) this.#map.removeLayer(this.#line);
    this.#line = L.polyline([this.#center, this.#coords], {
      stroke: true,
      color: this.color,
      dashArray: '20, 20',
      dashOffset: '0',
      weight: 5,
    })
      .bindPopup(`${this.calcDistance()} km`)
      .addTo(this.#map)
      .openPopup()
      .on('click', this.#app._hideForm.bind(this.#app));
  }

  _addWorkoutToList() {
    // console.log(this._getHtmlContnet());
    form.insertAdjacentHTML('afterend', this._getHtmlContnet());
  }
}

class RunWorkout extends Workout {
  constructor(app, map, center, coords, duration, cadence) {
    super(app, map, center, coords, duration);
    this.markerText = `🏃‍♂️ Running on ${Workout.getMonthName(
      this.date.getMonth()
    )} ${this.date.getDate()}`;
    this.color = '#472183';
    this.type = 'running';
    this.cadence = cadence;
    this._createWorkout();
  }

  _getHtmlContnet() {
    return (
      super._getHtmlContnet() +
      `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${(
              this.duration / this.calcDistance()
            ).toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${this.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`
    );
  }

  _loadWorkoutInfo() {
    super._loadWorkoutInfo();
    form.querySelector('.form__input--cadence').value = this.cadence;
  }
}

class CycleWorkout extends Workout {
  constructor(app, map, center, coords, duration, elevation) {
    super(app, map, center, coords, duration);
    this.markerText = `🚴‍♀️ Cycling on ${Workout.getMonthName(
      this.date.getMonth()
    )} ${this.date.getDate()}`;
    this.color = '#850000';
    this.type = 'cycling';
    this.elevation = elevation;
    this._createWorkout();
  }

  _getHtmlContnet() {
    return (
      super._getHtmlContnet() +
      `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${(
              this.calcDistance() /
              (this.duration / 60)
            ).toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${this.elevation}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`
    );
  }

  _loadWorkoutInfo() {
    super._loadWorkoutInfo();
    form.querySelector('.form__input--elevation').value = this.elevation;
  }
}

class App {
  center;
  #map;
  #zoomLevel;
  #centralMark;
  // #centralMarkMask;
  #icon;
  #defaultCenter;
  #coords;
  #workouts;
  #attachedWorkout;
  constructor() {
    this.#defaultCenter = [51.5, -0.09];
    this.#workouts = [];
    this.#zoomLevel = 13;
    this._getUserPosition();
    containerWorkouts.addEventListener(
      'click',
      this.goToWorkoutMarker.bind(this)
    );
  }

  getMap() {
    return this.#map;
  }

  setAttachedWorkout(workout) {
    this.#attachedWorkout = workout;
  }

  setCoords(coords) {
    this.#coords = coords;
  }

  goToWorkoutMarker(e) {
    if (!e.target.closest('li')) return;
    let id = e.target.closest('li').dataset.id;
    // this.#workouts.forEach((ele) =>
    //   console.log(ele.getId(), typeof ele.getId(), id, typeof id)
    // );
    let workout = this.#workouts.find((ele) => ele.getId() === +id);
    // console.log(workout);
    this.#map.setView(workout.getCoords(), this.#zoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    // console.log(e.target.closest('li').classList.contains('workout'));
    // if (!e.target.classList.includes('workout')) return;
    // console.log(id);
  }

  _getUserPosition() {
    // if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.center = L.latLng([pos.coords.latitude, pos.coords.longitude]);
        this._loadMap(true);
      },
      () => {
        this.center = L.latLng(this.#defaultCenter);
        this._loadMap(false);
        alert('We are not able to get your position');
      }
    );
  }

  _loadMap(ableToGetTheLocation) {
    this.#map = L.map('map').setView(this.center, this.#zoomLevel);
    this.#map.on('click', this._displayTheForm.bind(this));
    inputType.addEventListener('change', this._switchWorkoutType);
    form.addEventListener('submit', this._addMarkOnTheMap.bind(this));

    if (ableToGetTheLocation) this._createTheCentralMark();

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);
  }

  _createTheCentralIcon() {
    this.#icon = L.icon({
      iconUrl: 'icon.png',
      iconSize: [38, 38],
      popupAnchor: [0, -10],
    });
  }
  _createTheCentralMark() {
    this._createTheCentralIcon();

    this.#centralMark = L.marker(this.center, { icon: this.#icon })
      .bindPopup('Your current location')
      .addTo(this.#map)
      .openPopup()
      .on('click', this._hideForm.bind(this));

    // this.#centralMarkMask = L.circleMarker(this.center, {
    //   color: '#850000',
    //   fillColor: '#DC0000',
    //   fillOpacity: 0.5,
    //   radius: 25,
    // }).addTo(this.#map);
  }

  // Function to reCreate the visual workout using[this.#attachedWorkout]
  _reCreateAttachedWorkout() {
    if (!this.#attachedWorkout || !this.#attachedWorkout.edit) return false;
    this.#attachedWorkout.edit = false;
    this.#attachedWorkout._createWorkout();
    this._hideForm();
    return true;
  }

  _switchWorkoutType() {
    inputCadence.value = '';
    inputElevation.value = '';

    inputCadence.closest('div').classList.add('form__row--hidden');
    inputElevation.closest('div').classList.add('form__row--hidden');

    if (inputType.value === 'running')
      inputCadence.closest('div').classList.remove('form__row--hidden');
    else inputElevation.closest('div').classList.remove('form__row--hidden');
  }

  _displayTheForm(e) {
    if (this._reCreateAttachedWorkout()) return;
    // console.log(123);
    this.#coords = e.latlng;
    inputDuration.value = inputCadence.value = inputElevation.value = '';
    App.displayForm();
    inputDistance.value = (this.#coords.distanceTo(this.center) / 1000).toFixed(
      3
    );
  }

  _addMarkOnTheMap(e) {
    e.preventDefault();
    if (this.#attachedWorkout && this.#attachedWorkout.edit) {
      this.#attachedWorkout.edit = false; //TODO: Delete the attached workout
      this._deleteWorkout(this.#attachedWorkout.getId());
    }
    if (!this._validFormInputs()) return;
    let workout;
    if (inputType.value === 'running') {
      workout = new RunWorkout(
        this,
        this.#map,
        this.center,
        this.#coords,
        +inputDuration.value,
        +inputCadence.value
      );
    } else {
      workout = new CycleWorkout(
        this,
        this.#map,
        this.center,
        this.#coords,
        +inputDuration.value,
        +inputElevation.value
      );

      form.querySelector('.form__input--type').value = 'running';
      this._switchWorkoutType();
    }
    this.#workouts.push(workout);
    this._hideForm();
    // form.classList.add('hidden');
    // this.#map.on('click', this._displayTheForm.bind(this));
  }

  _hideForm() {
    form.querySelector('.form__input--type').value = 'running';
    this._switchWorkoutType();

    this._reCreateAttachedWorkout();
    form.style.display = 'none';
    form.classList.add('hidden');
  }

  static displayForm() {
    form.style.display = 'grid';
    inputDuration.focus();
    setTimeout(() => form.classList.remove('hidden'), 0);
    // form.classList.remove('hidden');
  }

  _deleteWorkout(id) {
    this.#workouts = this.#workouts.filter((ele) => ele.getId() !== id);
  }

  _validFormInputs() {
    // Return false if there is a field that has no value
    if (!inputDuration.value || (!inputCadence.value && !inputElevation.value))
      return false;
    //Return false if there is a non-numerical value entered
    if (
      !Number.isFinite(+inputDuration.value) ||
      !Number.isFinite(+inputCadence.value) ||
      !Number.isFinite(+inputElevation.value)
    )
      return false;
    return true;
  }

  getWorkouts() {
    return this.#workouts;
  }
}

const app = new App();
document.querySelector('.btn--test').addEventListener('click', function () {
  console.log(app.getWorkouts());
});
