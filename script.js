const WebSocket = require('ws');

// You can register for an app_id here https://developers.deriv.com/docs/app-registration/.
const app_id = 1089; // Replace with your app_id or leave as 1089 for testing.

const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=' + app_id);

// You can get your token here https://app.deriv.com/account/api-token. 
const token = ''; // Replace with your API token.

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
        console.log("Last 1000 Prices: %s", data.history.prices);
    } else if (data.msg_type == 'tick') {
        console.log("New Tick Price: %s", data.tick.ask);
    }
};