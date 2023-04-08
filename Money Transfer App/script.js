'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  // userName: 'js',
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  // userName: 'jd',
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

let currentUser;
let timer;
const countdownStarterValue = '10:00';
let sorted = false;
// nFormatter --> Number Formatter
// dFormatter --> Date Formatter
let nFormatter;
let dFormatter;

const inputFields = [
  inputLoginUsername,
  inputLoginPin,
  inputTransferAmount,
  inputTransferTo,
  inputLoanAmount,
  inputCloseUsername,
  inputClosePin,
];

const createUserNames = function (accounts) {
  accounts.forEach(
    (acc) =>
      (acc.userName = acc.owner
        .split(' ')
        .map((name) => name[0].toLowerCase())
        .join(''))
  );
};

const getAccount = function (accounts, userName, usePin = false, pin = '****') {
  return accounts.find(
    (acc) => acc.userName === userName && (!usePin || acc.pin === pin)
  );
};

const displayBalance = function (movements, nFormatter) {
  let balance = movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = nFormatter.format(balance);
  return balance;
};

const displaySummary = function (movements, interestRate, nFormatter) {
  let inCome = movements.reduce((acc, mov) => acc + (mov > 0 ? mov : 0), 0);
  let outCome = movements.reduce((acc, mov) => acc + (mov < 0 ? mov : 0), 0);
  let interest = ((inCome * interestRate) / 100).toFixed(2);

  labelSumIn.textContent = nFormatter.format(inCome);
  labelSumOut.textContent = nFormatter.format(outCome);
  labelSumInterest.textContent = nFormatter.format(interest);
};

const getDate = function (transactionDate, dFormatter) {
  let currentDate = Date.now();
  let daysMiliseconds = 1000 * 60 * 60 * 24;
  let diff = Math.abs(currentDate - new Date(transactionDate));

  let diffDays = Math.ceil(diff / daysMiliseconds);

  if (diffDays <= 1) return 'Today';
  else if (diffDays <= 2) return 'Yesterday';
  else if (diffDays <= 7) return `${diffDays} days ago`;
  else return dFormatter.format(new Date(transactionDate));
};

// nFormatter --> Number Formatter
// dFormatter --> Date Formatter
const displayMovements = function (movements, dates, nFormatter, dFormatter) {
  containerMovements.innerHTML = '';
  movements.forEach((mov, idx) => {
    let type = mov > 0 ? 'deposit' : 'withdrawal';
    containerMovements.insertAdjacentHTML(
      'afterbegin',
      `<div class="movements__row">
      <div class="movements__type movements__type--${type}">${
        idx + 1
      } ${type}</div>
      <div class="movements__date">${getDate(dates[idx], dFormatter)}</div>
      <div class="movements__value">${nFormatter.format(mov)}</div>
    </div>`
    );
  });
};

// nFormatter --> Number Formatter
// dFormatter --> Date Formatter
const sortMovements = function (
  movements,
  dates,
  nFormatter,
  dFormatter,
  sorted
) {
  let movementsArr = [];

  movements.forEach((mov, idx) =>
    movementsArr.push({
      movement: mov,
      date: dates[idx],
    })
  );

  movementsArr = sorted
    ? movementsArr
    : movementsArr.sort((a, b) => a.movement - b.movement);

  movements = [];
  dates = [];
  movementsArr.forEach((transaction) => {
    movements.push(transaction.movement);
    dates.push(transaction.date);
  });

  displayMovements(movements, dates, nFormatter, dFormatter);
  return !sorted;
};

const resetInputFields = function (inputFields) {
  inputFields.forEach((inputF) => {
    inputF.value = '';
    inputF.blur();
  });
};

// nFormatter --> Number Formatter
// dFormatter --> Date Formatter
const updateUI = function (account, nFormatter, dFormatter, inputFields) {
  displayBalance(account.movements, nFormatter);
  displaySummary(account.movements, account.interestRate, nFormatter);
  if (sorted) {
    sortMovements(
      account.movements,
      account.movementsDates,
      nFormatter,
      dFormatter,
      !sorted
    );
  } else {
    displayMovements(
      account.movements,
      account.movementsDates,
      nFormatter,
      dFormatter
    );
  }
  resetInputFields(inputFields);
};

const transferMoney = function (
  from,
  to,
  money,
  nFormatter,
  dFormatter,
  inputFields
) {
  from.movements.push(-money);
  to.movements.push(money);

  let now = new Date();
  from.movementsDates.push(now.toISOString());
  to.movementsDates.push(now.toISOString());

  updateUI(from, nFormatter, dFormatter, inputFields);
};

const createCountdownTimer = function (timeStr) {
  let [minutes, seconds] = timeStr.split(':').map((str) => +str);
  let time = minutes * 60 + seconds;

  const displayTime = function (time) {
    let minutes = String(Math.trunc(time / 60)).padStart(2, '0');
    let seconds = String(time % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  let interval = setInterval(() => {
    labelTimer.textContent = displayTime(time);
    if (!time) {
      clearInterval(interval);
      resetInputFields(inputFields);
      containerApp.style.opacity = '0';
    }
    time--;
  }, 1000);
  return interval; // Return a Number refers To The Interval Object
};

// sTime --> Timer Starter Value
const loginUser = function (account, inputFields, sTime) {
  sorted = false;
  let nOptions = {
    style: 'currency',
    currency: account.currency,
  };

  let dOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  nFormatter = new Intl.NumberFormat(account.locale, nOptions);
  dFormatter = new Intl.DateTimeFormat(account.locale, dOptions);

  labelWelcome.textContent = `Welcome ${account.owner.split(' ')[0]}`;
  labelDate.textContent = dFormatter.format(new Date());

  containerApp.style.opacity = '1';
  clearInterval(timer);
  timer = createCountdownTimer(sTime);
  resetInputFields(inputFields);
  updateUI(account, nFormatter, dFormatter, inputFields);
};

btnLogin.addEventListener('click', (e) => {
  e.preventDefault();
  let userName = inputLoginUsername.value;
  let pin = inputLoginPin.value;

  if (userName && pin) {
    // Valid User Data
    currentUser = getAccount(accounts, userName, true, +pin);
    if (currentUser) loginUser(currentUser, inputFields, countdownStarterValue);
  }
});

btnSort.addEventListener('click', (e) => {
  e.preventDefault();
  sorted = sortMovements(
    currentUser.movements,
    currentUser.movementsDates,
    nFormatter,
    dFormatter,
    sorted
  );
});

// x = '55'
// +x ---> 55 Like Number(x)
btnTransfer.addEventListener('click', (e) => {
  e.preventDefault();
  let money = +inputTransferAmount.value;
  let to = inputTransferTo.value;
  let balance = displayBalance(currentUser.movements, nFormatter);

  if (to && money >= 100 && balance >= 100 && money <= balance) {
    to = getAccount(accounts, to);
    if (to && to !== currentUser)
      transferMoney(
        currentUser,
        to,
        money,
        nFormatter,
        dFormatter,
        inputFields
      );
  }
});

const closeAccount = function (accounts, userName, pin, inputFields) {
  // Delete Account
  accounts.splice(
    accounts.findIndex((acc) => acc.userName === userName && acc.pin === +pin),
    1
  );
  // Reset The app
  currentUser = undefined;
  containerApp.style.opacity = 0;
  resetInputFields(inputFields);
  labelWelcome.textContent = 'Log in to get started';
};

btnClose.addEventListener('click', (e) => {
  e.preventDefault();
  let userName = inputCloseUsername.value;
  let pin = inputClosePin.value;
  if (
    userName &&
    pin &&
    currentUser?.userName === userName &&
    currentUser?.pin === +pin
  )
    closeAccount(accounts, userName, pin, inputFields);
});

btnLoan.addEventListener('click', (e) => {
  e.preventDefault();
  let loan = +inputLoanAmount.value;
  if (currentUser.movements.some((mov) => mov >= loan * 0.1)) {
    let now = new Date();
    currentUser.movements.push(loan);
    currentUser.movementsDates.push(now.toISOString());
    resetInputFields(inputFields);
    updateUI(currentUser, nFormatter, dFormatter, inputFields);
  }
});
createUserNames(accounts);
console.log(accounts);

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// // LECTURES
// console.log(23 === 23.0);
// console.log(0.1 + 0.2 + 0.3);
// console.log('--> ', +'23.5');

// // Must Be At The Beginning OF the String
// let str = '   2.5 Hello 3.5  ';

// console.log('+++++++');
// console.log(Number.parseInt(str));
// console.log(parseInt(str));

// console.log('*******');

// console.log(Number.parseFloat(str));
// console.log(parseFloat(str));
// console.log('+++++++');

// // Not So Good For Checking If The Type Is A Number
// console.log(1, Number.isNaN(20));
// console.log(2, Number.isNaN(+'20'));
// console.log(3, Number.isNaN(+''));
// console.log(4, Number.isNaN(+'20s'));
// console.log(5, Number.isNaN(20 / 0));
// console.log('----------');
// // Only checking The Number Type, So We Must Convert The Variable Type To Number Before Useing This Method
// console.log(1, Number.isFinite(20));
// console.log(2, Number.isFinite(+'20'));
// console.log(3, Number.isFinite(+''));
// console.log(4, Number.isFinite(+'20s'));
// console.log(5, Number.isFinite(20 / 0));
// console.log('--------+++++-------');

// console.log('1 -->', Math.sqrt(25));
// console.log('2 -->', 25 ** (1 / 2));
// console.log('3 -->', 27 ** (1 / 3));
// console.log('4 -->', 625 ** (1 / 4));

// let arr = [1, 2, -3, 4, 5];
// console.log(arr);
// console.log('Max --> ', Math.max(...arr));
// console.log('Min --> ', Math.min(...arr));
// console.log('PI --> ', Math.PI);
// console.log('-----------');
// let num = 2.49;
// console.log('Number --> ', num);
// console.log('1 Number After Decimal Point --> ', num.toFixed(1));
// console.log('Trunc --> ', Math.trunc(num));
// console.log('Ceil --> ', Math.ceil(num));
// console.log('Floor --> ', Math.floor(num));
// console.log('Round --> ', Math.round(num));
// const getRandomNumber = function (min, max) {
//   return Math.ceil(Math.random() * (max - min + 1)) + min - 1;
// };
// let mapp = new Map();
// for (let i = 0; i < 10 ** 6; i++) {
//   let x = getRandomNumber(6, 12);
//   mapp.set(x, 1 + (mapp.get(x) ?? 0));
// }
// // console.log(mapp.entries());
// // console.log('555555');
// // console.log(mapp);
// // for (const [key, value] of mapp) console.log(1);
// // for (const [key, value] of mapp) mapp[key] = value / 10 ** 6;

// mapp.forEach((value, key) => {
//   console.log(key, value);
//   mapp.set(key, value / 10 ** 6);
// });
// console.log('1/7 --> ', 1 / 7);
// console.log(mapp);

// console.log((23.35).toFixed(0));
// console.log((23.35).toFixed(1));
// console.log((23.35).toFixed(2));

// num = 251_664_546_546;
// console.log(BigInt(num));
// let a = 6546546546n;
// let b = 5464654684624n;
// console.log('a --> ', a);
// console.log('b --> ', b);
// console.log('b / a --> ', b / a);
// console.log('a * b --> ', a * b);
// console.log('a + b --> ', a + b);
// console.log('a - b --> ', a - b);

// console.log(Number.MAX_SAFE_INTEGER);
// console.log(20n > 12);
// console.log(20n === 20);
// console.log(typeof 20n);
// console.log(20n == '20');

// console.log('-------------------------');

// const now = new Date();
// console.log('0 --> ', new Date(Date.now()));
// console.log('1 --> ', now);
// console.log('2 --> ', now.getFullYear());
// console.log('3 --> ', now.getMonth());
// console.log('4 --> ', now.getDate());
// console.log('5 --> ', now.getDay());
// console.log('6 --> ', now.getHours());
// console.log('7 --> ', now.getMinutes());
// console.log('8 --> ', now.getSeconds());
// console.log('9 --> ', now.getMilliseconds());

// // now.setFullYear(2025);
// const calcSecondsPassed = function (d1, d2) {
//   return Math.abs(d1 - d2) / 1000;
// };
// console.log(`${calcSecondsPassed(+now, Date.now())}s`);

// console.log(navigator.language);
// let options = {
//   style: 'currency',
//   currency: 'usd',
// };

// let int = new Intl.NumberFormat(navigator.language, options);
// console.log(int.format(16556235));

// let timer1 = setTimeout(
//   (a, b) => {
//     console.log(`${a.trimEnd()} + ${b.trimStart()} = ${a + b.trim()}`);
//   },
//   3000,
//   'Hello ',
//   ' World'
// );

// setTimeout(() => {
//   console.log('Clear Time1');
//   clearTimeout(timer1);
// }, 2900);
// const createCountdownTimer = function (minutes = 1, seconds = 0) {
//   let time = minutes * 60 + seconds;
//   const displayTime = function (time) {
//     let minutes = String(Math.trunc(time / 60)).padStart(2, '0');
//     let seconds = String(time % 60).padStart(2, '0');
//     return `${minutes}:${seconds}`;
//   };

//   let interval = setInterval(() => {
//     console.log(displayTime(time));
//     if (!time) clearInterval(interval);
//     time--;
//   }, 1000);
//   return interval; // Return a Number refers To The Interval Object
// };
// // let time = 10;
// // let inter = createCountdownTimer();
// // console.log(typeof inter);
// // setTimeout((int) => clearInterval(int), 5000, inter);

// // setInterval((a, b) => console.log(a + b), 1000, 5, 3);
// // year: 'numeric', month: 'numeric', day: 'numeric',
// //   hour: 'numeric', minute: 'numeric', second: 'numeric',
// // options = {
// //   year: 'numeric',
// //   month: 'long',
// //   day: 'numeric',
// //   weekday: 'long',
// //   hour: 'numeric',
// //   minute: 'numeric',
// //   second: 'numeric',
// // };
// options = {
//   year: 'numeric',
//   month: 'numeric',
//   day: 'numeric',
//   hour: 'numeric',
//   minute: 'numeric',
// };
// let date = new Intl.DateTimeFormat('default', options).format(new Date());
// console.log(date);
