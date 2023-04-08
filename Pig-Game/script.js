'use strict';
const player0El = document.querySelector('.player--0');
const player1El = document.querySelector('.player--1');

const totalScore0El = document.getElementById('score--0');
const totalScore1El = document.getElementById('score--1');

const score0El = document.getElementById('current--0');
const score1El = document.getElementById('current--1');

const lastDice0El = document.querySelector('#last-dice--0');
const lastDice1El = document.querySelector('#last-dice--1');

const remainingScore0El = document.querySelector('#remaining-score--0');
const remainingScore1El = document.querySelector('#remaining-score--1');

const diceEl = document.querySelector('.dice');

const btnNewGame = document.querySelector('.btn--new');
const btnRoll = document.querySelector('.btn--roll');
const btnHold = document.querySelector('.btn--hold');
const maximumScore = 100;

let won, currentPlayer, prevRoll, totalScore, diceValue, scoreSoFar;

function displayUpdatedLastDiceValue(value) {
  currentPlayer == 0
    ? (lastDice0El.textContent = value)
    : (lastDice1El.textContent = value);
}

function displayUpdatedCurrentScore(value) {
  currentPlayer == 0
    ? (score0El.textContent = value)
    : (score1El.textContent = value);
}

function displayUpdatedTotalScore() {
  currentPlayer == 0
    ? (totalScore0El.textContent = totalScore[0])
    : (totalScore1El.textContent = totalScore[1]);
}

function displayUpdatedRemainingScore(value) {
  currentPlayer == 0
    ? (remainingScore0El.textContent = value)
    : (remainingScore1El.textContent = value);
}

function winTheGame() {
  currentPlayer == 0
    ? player0El.classList.add('player--winner')
    : player1El.classList.add('player--winner');
}

function resetValuesForUserSwitching() {
  player0El.classList.toggle('player--active');
  player1El.classList.toggle('player--active');
  displayUpdatedLastDiceValue(0);
  displayUpdatedCurrentScore(0);
  // Common With resetTheGame() Function
  scoreSoFar = 0;
  prevRoll = -1;
  diceEl.classList.add('hidden');
}

function switchUser() {
  currentPlayer = (currentPlayer + 1) % 2;
  resetValuesForUserSwitching();
}

function resetTheGame() {
  resetValuesForUserSwitching();
  player0El.classList.add('player--active');
  player1El.classList.remove('player--active');
  player0El.classList.remove('player--winner');
  player1El.classList.remove('player--winner');
  totalScore = [0, 0];
  won = false;
  currentPlayer = 0;
  score0El.textContent = '0';
  score1El.textContent = '0';
  totalScore0El.textContent = '0';
  totalScore1El.textContent = '0';
  lastDice0El.textContent = '0';
  lastDice1El.textContent = '0';
  remainingScore0El.textContent = maximumScore;
  remainingScore1El.textContent = maximumScore;
}

function rollTheDice() {
  if (!won) {
    diceValue = Math.ceil(Math.random() * 6);
    diceEl.src = `dice-${diceValue}.png`;
    diceEl.classList.remove('hidden');

    displayUpdatedLastDiceValue(diceValue);

    if (diceValue >= prevRoll) {
      scoreSoFar += diceValue;
      displayUpdatedCurrentScore(scoreSoFar);
      prevRoll = diceValue;
    } else {
      switchUser();
    }
  }
}

function holdTheScore() {
  if (!won) {
    if (totalScore[currentPlayer] + scoreSoFar <= maximumScore) {
      totalScore[currentPlayer] += scoreSoFar;
      displayUpdatedTotalScore();
      if (totalScore[currentPlayer] === maximumScore) {
        won = true;
        winTheGame();
      } else {
        displayUpdatedRemainingScore(maximumScore - totalScore[currentPlayer]);
        switchUser();
      }
    } else {
      switchUser();
    }
  }
}

resetTheGame();
btnNewGame.addEventListener('click', resetTheGame);
btnRoll.addEventListener('click', rollTheDice);
btnHold.addEventListener('click', holdTheScore);
