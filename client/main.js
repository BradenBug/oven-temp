// const host = 'ws://3.21.39.82';
const host = 'ws://localhost';
const port = '5000';
var curentTempF = 80;
var curentTempC = 26.7;

const ws = new WebSocket(host + ':' + port);

ws.onmessage = (message) => {
    console.log(message);
    console.log(message.data);
    var json = JSON.parse(message.data);
    currentTempF = json.f;
    currentTempC = json.c;

    updateTempDisplay();
}

function updateTempDisplay() {
    if ($('#fbutton').hasClass('active')) {
        $('#temp').text(currentTempF);
    } else if ($('#cbutton').hasClass('active')) {
        $('#temp').text(currentTempC);
    }
}

function selectF() {
    $('#temp').text(currentTempF);
}

function selectC() {
    $('#temp').text(currentTempC);
}

function bowBoat() {
    console.log('bowBoat');
}