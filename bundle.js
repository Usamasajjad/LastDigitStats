(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

// var WebSocketClient = require('websocket').client;
// const WebSocket = require('ws');

// You can register for an app_id here https://developers.deriv.com/docs/app-registration/.
const app_id = 31861; // Replace with your app_id or leave as 1089 for testing.

const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=' + app_id);

let prices = [];
let currentPrice;
let lastDigit = [];
let lastDigitCount = {};
let occurrences = [];
let percentages = [];
let roundedPercentages = []
let numericPercentages = []
let max = 0.00;
let min = 0.00;
// You can get your token here https://app.deriv.com/account/api-token. 
const token = "IeFrwa9FmIMVgPB"; // Replace with your API token.

ws.onopen = function (evt) {
    ws.send(JSON.stringify({ "authorize": token })) // First send an authorize call.
};

ws.onmessage = function (msg) {
    var data = JSON.parse(msg.data);
    // console.log('Response: %o', data); // Uncomment this to see full response data. 
    if (data.error !== undefined) {
        console.log(data.error.message);
        ws.close();
    } else if (data.msg_type == 'authorize') {
        /*
        * Since we can not ensure calls to websocket are made in order we must wait for 
        * the response to the authorize call before sending the buy request. 
        */
        ws.send(JSON.stringify({
            "ticks_history": "R_50",
            "subscribe": 1,
            "count": 1000,
            "end": "latest",
            "style": "ticks"
        }));
    } else if (data.msg_type == 'history') { // Our buy request was successful let's print the results. 
        // console.log("Last 1000 Prices: ", data.history.prices + '\n');
        for (i in data.history.prices) {
            prices[i] = parseFloat(data.history.prices[i])
        }
        // prices.push(data.history.prices);
        console.log(prices);
        document.getElementById("history").innerHTML = prices.join('<br>');

        getLastDigit(prices);
        console.log(lastDigit);
        calculateOccurrence(lastDigit);
        console.log(lastDigitCount);
        occurrences = Object.values(lastDigitCount);
        console.log(occurrences);
        calculatePercentage(occurrences);
        console.log(percentages);
        roundedPercentages = percentages.map(String);
        console.log(roundedPercentages)
        roundedPercentages = roundedPercentages.map(function(element){
            return element.substring(0,4);
        });
        console.log(roundedPercentages)

        for(i=0; i < 9; i++) {
            let box = document.getElementById('box' + (i+1));
            box.innerHTML += '<br>' + roundedPercentages[i] + '%';
        }
        convertToNumeric(roundedPercentages)
        min = Math.min(...numericPercentages);
        max = Math.max(...numericPercentages);
        console.log(min)
        console.log(max)

        for(i=0; i < 9; i++) {
            let box = document.getElementById('box' + (i+1));
            if(roundedPercentages[i] == max) {
                box.style.color = "green";
            }
            if(roundedPercentages[i] == min) {
                box.style.color = "red";
            }
        }
        console.log(window.location.href)
        if(window.location.href != 'https://derivapp.netlify.app/'){
            document.getElementById('button').style.display = 'none';
        }

    } else if (data.msg_type == 'tick') {
        // console.log("New Tick Price: %s", data.tick.ask);
        currentPrice = parseFloat(data.tick.ask)
        document.getElementById("ticker").innerHTML = "Current Price: " + currentPrice;
        getMarker(currentPrice);
        // console.log(currentPrice)
    }

    // let occurence;
    // let percentage = (occurrence/1000)*100;

function getLastDigit(value) {
    for (let i = 0; i < value.length; i++) {
        let lastDigit1Str = String(prices[i]).slice(-1);
        lastDigit[i] = lastDigit1Str;
    }
}

function calculateOccurrence(value) {
    for (const element of value) {
        if (lastDigitCount[element]) {
            lastDigitCount[element] += 1;
        } else {
            lastDigitCount[element] = 1;
        }
    }
}
   
function calculatePercentage(value) {
    for (i=0; i < value.length; i++) {
        percentages[i] = (value[i] / 1000) * 100;
    }
}

function getMarker(value) {
    let lastChar = String(value).slice(-1);
    
    let box = document.getElementById('box' + (lastChar));
    
    box.classList.add('notransition'); // Disable transitions
    box.style.animation = "highlight 1s";
    box.offsetHeight; // Trigger a reflow, flushing the CSS changes
    box.classList.remove('notransition'); // Re-enable transitions
}

function convertToNumeric(value) {
    for (i in value) {
        numericPercentages[i] = parseFloat(roundedPercentages[i]);
    }
    console.log(numericPercentages)
}

};


},{"ws":2}],2:[function(require,module,exports){
'use strict';

module.exports = function () {
  throw new Error(
    'ws does not work in the browser. Browser clients must use the native ' +
      'WebSocket object'
  );
};

},{}]},{},[1]);
