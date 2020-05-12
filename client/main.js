// const host = 'ws://3.21.39.82';
const host = 'ws://localhost';
const port = '5000';
var curentTempF = 80;
var curentTempC = 26.7;

const ws = new WebSocket(host + ':' + port);

ws.onmessage = (message) => {
    console.log(message.data);
    var jsonMessage = JSON.parse(message.data);

    if (jsonMessage['type'] === 'userAck') {
        validateUsername(jsonMessage['data']);
    } else if (jsonMessage['type'] === 'temp') {
        updateTemp(jsonMessage['data']);
    } else if (jsonMessage['type'] === 'chat') {
        updateChat(jsonMessage['data']);
    } else if (jsonMessage['type'] === 'userList') {
        updateUserData(jsonMessage['data']);
    }
}

function constructMessage(type, data) {
    return `{"type": "${type}", "data": "${data}"}`;
}

function updateTemp(data) {
    currentTempF = data.f;
    currentTempC = data.c;

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

function switchPage(shown, hidden) {
    $(`#${shown}`).css('display', 'block');
    $(`#${hidden}`).css('display', 'none');

    return false;
}

function requestUsername() {
    var username = $('#username-input').val();
    console.log(username);
    ws.send(`{"type": "username", "data": "${username}"}`);
    return false;
}

function validateUsername(ackValue) {
    if (ackValue === true) {
        switchPage('main-page', 'intro-page');
    } else {
        $('#username-input').addClass('is-invalid');
    }
}

function updateChat(chatData) {
    $('#chatbox').append(`<div class="row justify-content-start no-gutters">`
        + `<p style="color: crimson">${chatData.username}:&nbsp;</p>`
        + `<p>${chatData.message}</p>`
        + `</div>`);
    $('#chatbox').scrollTop($('#chatbox').height());
}

function sendMessage() {
    ws.send(constructMessage('message', $('#chat-input').val()));
    $('#chat-input').val('');
    $('#chat-input').focus();
}

function updateUserData(userList) {
    $('#user-count').text(userList.length);
}