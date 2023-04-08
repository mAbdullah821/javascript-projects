'use strict';

///////////////////////////////////////
// Modal window

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const navLinks = document.querySelector('.nav__links');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const headerNav = document.querySelector('.nav');
const header = document.querySelector('.header');
const sections = document.querySelectorAll('.section');
const section1Images = document
  .querySelector('#section--1')
  .querySelectorAll('img');
const operations = document.querySelector('.operations');
const operationsTabContainer = document.querySelector(
  '.operations__tab-container'
);

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach((btn) => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

// Navigation Bar Hover
navLinks.addEventListener('mouseover', function (e) {
  if (!e.target.classList.contains('nav__link')) return;
  this.querySelectorAll('.nav__link').forEach(
    (ele) => (ele.style.opacity = '0.5')
  );
  e.target.style.opacity = '1';
  this.parentElement.children[0].style.opacity = '0.5';
});

navLinks.addEventListener('mouseout', function () {
  this.querySelectorAll('.nav__link').forEach(
    (ele) => (ele.style.opacity = '1')
  );
  this.parentElement.children[0].style.opacity = '1';
});

// Smooth Scrolling To Section--1
btnScrollTo.addEventListener('click', function () {
  const section1 = document.querySelector('#section--1');
  section1.scrollIntoView({ behavior: 'smooth' });
});

// Add Sticky To Navigation Bar After Finishing Pass Through Header Section
const headerCallback = function (entries, observer) {
  const entry = entries[0];
  if (entry.isIntersecting) headerNav.classList.remove('sticky');
  else headerNav.classList.add('sticky');
};
const navHeight = headerNav.getBoundingClientRect().height;
const headerOptions = {
  root: null,
  threshold: 0,
  rootMargin: `-${navHeight}px`,
};
const headerObserver = new IntersectionObserver(headerCallback, headerOptions);
headerObserver.observe(header);

// Add Section Transition

const sectionCallback = function (entries, observer) {
  const [entry] = entries;
  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target);
};
const sectionOption = {
  root: null,
  threshold: 0.15,
};
const sectionObserver = new IntersectionObserver(
  sectionCallback,
  sectionOption
);
sections.forEach(function (sec) {
  sec.classList.add('section--hidden');
  sectionObserver.observe(sec);
});

// Add Lazy Loading To Section--1 Images

const imgCallback = function (entries, observer) {
  const entry = entries[0];
  if (!entry.isIntersecting) return;

  entry.target.src = entry.target.dataset.src;
  entry.target.addEventListener('load', function () {
    this.classList.remove('lazy-img');
  });
  observer.unobserve(entry.target);
};
const imgOptions = {
  root: null,
  threshold: 0.05,
  rootMargin: `250px`,
};

const imgObserver = new IntersectionObserver(imgCallback, imgOptions);

section1Images.forEach((img) => imgObserver.observe(img));

// Operation Section--2

operationsTabContainer.addEventListener('click', function (e) {
  // only Pass The Buttons Clicks
  if (!e.target.classList.contains('btn')) return;
  // Remove Active class From Every Button
  [...this.children].forEach((btn) =>
    btn.classList.remove('operations__tab--active')
  );
  // Add Active class To The Clicked Button
  e.target.classList.add('operations__tab--active');
  // Remove Active class From Every Contnet
  operations
    .querySelectorAll('.operations__content')
    .forEach((contentEle) =>
      contentEle.classList.remove('operations__content--active')
    );
  // Add Active class To The Correct Contnet
  operations
    .querySelector(`.operations__content--${e.target.dataset.tab}`)
    .classList.add('operations__content--active');
});

// Add The Functionality To The Slider Section

const btnMoveSliderRight = document.querySelector('.slider__btn--right');
const btnMoveSliderLeft = document.querySelector('.slider__btn--left');
const slides = document.querySelectorAll('#section--3 .slider .slide');
const sliderDots = document.querySelector('.dots');
let currentOrigin = 0;

const addSliderDots = function (slides) {
  slides.forEach((_, idx) =>
    sliderDots.insertAdjacentHTML(
      'beforeend',
      `<button class="dots__dot" data-slide="${idx}"></button>`
    )
  );
};

const activateSliderDot = function (dotsContainer, sliderNum) {
  const selectedDot = dotsContainer.querySelector(
    `.dots__dot[data-slide="${sliderNum}"]`
  );
  // Unactivate Every Dot
  [...dotsContainer.children].forEach((dot) =>
    dot.classList.remove('dots__dot--active')
  );
  // activate Selected Dot (The Dot We Want To activate)
  selectedDot.classList.add('dots__dot--active');
};

const setSliderOrigin = function (slides, dots, origin) {
  slides.forEach((slide, idx) => {
    slide.style.transform = `translateX(${(idx - origin) * 100}%)`;
  });
  activateSliderDot(dots, origin);
};

const moveSliderRight = function (slides) {
  currentOrigin = (currentOrigin + 1) % slides.length;
  setSliderOrigin(slides, sliderDots, currentOrigin);
};

const moveSliderLeft = function (slides) {
  currentOrigin = (slides.length + currentOrigin - 1) % slides.length;
  setSliderOrigin(slides, sliderDots, currentOrigin);
};

const initializeSlider = function (slides) {
  addSliderDots(slides);
  setSliderOrigin(slides, sliderDots, currentOrigin);
};

initializeSlider(slides);

btnMoveSliderRight.addEventListener('click', () => moveSliderRight(slides));

btnMoveSliderLeft.addEventListener('click', () => moveSliderLeft(slides));

sliderDots.addEventListener('click', function (e) {
  if (!e.target.classList.contains('dots__dot')) return;
  currentOrigin = +e.target.dataset.slide;
  setSliderOrigin(slides, sliderDots, currentOrigin);
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowLeft') moveSliderLeft(slides);
  else if (e.key === 'ArrowRight') moveSliderRight(slides);
});
