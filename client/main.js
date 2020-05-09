ws = new WebSocket('ws://localhost:8080');

var curentTempF = 0;
var curentTempC = 0;

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

function boob() {
    console.log('boob');
}