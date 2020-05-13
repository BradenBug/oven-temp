const host = 'ws://3.21.39.82';
const port = '5000';
var curentTempF = 80;
var curentTempC = 26.7;
var userList = [];
var userListUpdated = false;

const ws = new WebSocket(host + ':' + port);

$('#username-form').on('submit', requestUsername);
$('#fbutton').on('click', () => selectTemp(currentTempF));
$('#cbutton').on('click', () => selectTemp(currentTempC));
$('#chat-button').on('click', sendMessage);
$('#user-list-button').on('click', createUserListView);

ws.onmessage = (message) => {
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

function requestUsername() {
    let username = $('#username-input').val();
    ws.send(`{"type": "username", "data": "${username}"}`);
    return false;
}

function selectTemp(currentTemp) {
    $('#temp').text(`${currentTemp}`);
}

function sendMessage() {
    ws.send(constructMessage('message', $('#chat-input').val()));
    $('#chat-input').val('');
    $('#chat-input').focus();
}

function createUserListView() {
    if (userListUpdated) {
        $('#user-list').empty();
        userList.forEach((username) => {
            $('#user-list').append(`<li class="list-group-item">${username}</li>`)
        });
        userListUpdated = false;
    }
}

const validateUsername = (ackValue) => {
    if (ackValue === true) {
        switchPage('main-page', 'intro-page');
        $(`#intro-page`).empty();
    } else {
        $('#username-input').addClass('is-invalid');
    }
}

const updateTemp = (data) => {
    currentTempF = data.f;
    currentTempC = data.c;

    if ($('#fbutton').hasClass('active')) {
        selectTemp(currentTempF);
    } else if ($('#cbutton').hasClass('active')) {
        selectTemp(currentTempC);
    }
}

const updateChat = (chatData) => {
    $('#chatbox').append(`<div class="row justify-content-start no-gutters">`
        + `<p style="color: ${chatData.color}">${chatData.username}:&nbsp;</p>`
        + `<p>${chatData.message}</p>`
        + `</div>`);
    $('#chatbox').scrollTop($('#chatbox').height());
}

const updateUserData = (newUserList) => {
    $('#user-count').text(newUserList.length);
    userList = newUserList;
    userListUpdated = true;
}

const constructMessage = (type, data) =>
    `{"type": "${type}", "data": "${data}"}`;

const switchPage = (shown, hidden) => {
    $(`#${shown}`).css('display', 'block');
    $(`#${hidden}`).css('display', 'none');
    
    $('#chat-input').keyup((event) => {
        if ($('#chat-input').is(':focus') && event.key === 'Enter') {
            sendMessage();
        }
    })

    return false;
}