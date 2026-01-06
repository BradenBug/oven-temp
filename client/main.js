import $ from 'jquery';
import 'bootstrap';
import { updateTemperatureText } from './model-viewer.js';

const host = 'wss://api.bradenwicker.com/oven-temp/';
const port = '443';
var currentTempF = 80;
var currentTempC = 26.7;

const ws = new WebSocket(host + ':' + port);

$('#fbutton').on('click', () => {
    selectTemp(currentTempF);
    updateTemperatureText(currentTempF, 'F');
});
$('#cbutton').on('click', () => {
    selectTemp(currentTempC);
    updateTemperatureText(currentTempC, 'C');
});

ws.onmessage = (message) => {
    console.log(message);
    var jsonMessage = JSON.parse(message.data);

    if (jsonMessage['type'] == 'temp') {
        updateTemp(jsonMessage['data']);
    }
}

function selectTemp(currentTemp) {
    $('#temp').text(`${currentTemp}`);
    // get rid of the focus
    $('#fbutton').on('blur');
    $('#cbutton').on('blur');
}

const updateTemp = (data) => {
    currentTempF = data.f;
    currentTempC = data.c;

    if ($('#fbutton').hasClass('active')) {
        selectTemp(currentTempF);
        updateTemperatureText(currentTempF, 'F');
    } else if ($('#cbutton').hasClass('active')) {
        selectTemp(currentTempC);
        updateTemperatureText(currentTempC, 'C');
    }
}