const host = 'wss://api.bradenwicker.com/oven-temp/';
const port = '443';
var curentTempF = 80;
var curentTempC = 26.7;
var userList = [];
var userListUpdated = false;
var scrollDown = true;
const escMap = new Map([
    ['&', '&amp;'],
    ['<', '&lt;'], 
    ['>','&gt;'],
    ['"', '&quot;'],
    ["'", '&#x27;'],
    ["/", '&#x2F;'],
    ["`", '&grave;']]
);

const ws = new WebSocket(host + ':' + port);

$(document).ready(function() {
    $('#fbutton').addClass('active');
});

// $('#username-form').on('submit', requestUsername);
$('#fbutton').on('click', () => selectTemp(currentTempF));
$('#cbutton').on('click', () => selectTemp(currentTempC));
// $('#chat-button').on('click', sendMessage);
// $('#chatbox').on('scroll', setChatScroll);
// $('#user-list-button').on('click', createUserListView);

ws.onmessage = (message) => {
    console.log(message);
    var jsonMessage = JSON.parse(message.data);

    if (jsonMessage['type'] == 'temp') {
        updateTemp(jsonMessage['data']);
    }

    // if (jsonMessage['type'] === 'userAck') {
    //     validateUsername(jsonMessage['data']);
    // } else if (jsonMessage['type'] === 'temp') {
    //     updateTemp(jsonMessage['data']);
    // } else if (jsonMessage['type'] === 'chat') {
    //     updateChat(jsonMessage['data']);
    // } else if (jsonMessage['type'] === 'userList') {
    //     updateUserData(jsonMessage['data']);
    // }
}

// function requestUsername() {
//     let username = $('#username-input').val();
//     ws.send(`{"type": "username", "data": "${username}"}`);
//     return false;
// }

function selectTemp(currentTemp) {
    $('#temp').text(`${currentTemp}`);
    // get rid of the focus
    $('#fbutton').blur();
    $('#cbutton').blur();
}

// function sendMessage() {
//     let message = sanitize($('#chat-input').val());
//     if (message.length > 0) {
//         ws.send(constructMessage('message', message)); 
//         $('#chat-input').val('');
//         $('#chat-input').focus();
//     }
// }

// function setChatScroll() {
//     if ($('#chatbox').scrollTop() + $('#chatbox').innerHeight()
//         >= $('#chatbox')[0].scrollHeight) {
//         scrollDown = true;
//     } else {
//         scrollDown = false;
//     }
// }

// function createUserListView() {
//     if (userListUpdated) {
//         $('#user-list').empty();
//         userList.forEach((username) => {
//             $('#user-list').append(`<li class="list-group-item">${username}</li>`)
//         });
//         userListUpdated = false;
//     }
// }

// const validateUsername = (ackValue) => {
//     if (ackValue === true) {
//         switchPage('main-page', 'intro-page');
//         $(`#intro-page`).empty();
//     } else {
//         $('#username-input').addClass('is-invalid');
//     }
// }

const updateTemp = (data) => {
    currentTempF = data.f;
    currentTempC = data.c;

    if ($('#fbutton').hasClass('active')) {
        selectTemp(currentTempF);
    } else if ($('#cbutton').hasClass('active')) {
        selectTemp(currentTempC);
    }
}

// const updateChat = (chatData) => {
//     $('#chatbox').append(`<div class="row justify-content-start no-gutters">`
//         + `<p style="color: ${chatData.color}">${chatData.username}:&nbsp;</p>`
//         + `<p>${chatData.message}</p>`
//         + `</div>`);
//     // scroll to the bottom if not scrolled up
//     if (scrollDown) {
//         $('#chatbox').scrollTop($('#chatbox')[0].scrollHeight);
//     }
// }

// const updateUserData = (newUserList) => {
//     $('#user-count').text(newUserList.length);
//     userList = newUserList;
//     userListUpdated = true;
// }

const constructMessage = (type, data) =>
    `{"type": "${type}", "data": "${data}"}`;

// const switchPage = (shown, hidden) => {
//     $(`#${shown}`).css('display', 'block');
//     $(`#${hidden}`).css('display', 'none');
    
//     $('#chat-input').keyup((event) => {
//         if ($('#chat-input').is(':focus') && event.key === 'Enter') {
//             sendMessage();
//         }
//     })

//     return false;
// }

// function sanitize(text) {
//     const reg = /[&<>"'/]/ig;
//     return text.replace(reg, (match) => {
//         return escMap.get(match);
//     });
// }