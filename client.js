var socket = io.connect('http://localhost:4000');
var txtUserName = $('#txtUserName');
var chatRooms = $('#chatrooms');
var btnSubmitChat = $('#btnSubmitChat');
var textarea = $('#textarea');
var messages = $('#messages');
var room = "Axinom";

var privateChatArea = $('#privateChatArea');
var privateChatrooms = $('#privateChatrooms');
var privateMessages = $("#privateMessages");


var prvChatTo;

$(document).ready(function () {
    $("#alert").hide();
    $("#chatArea").hide();
    $('#privateChatArea').hide();
});

var alert = function (message) {
    $("#alertMessage").text(message);
    $("#alert").fadeTo(2000, 500).slideUp(500, function () {
        $("#alert").slideUp(500);
    });
}

$('#btnNickName').click(function () {
    var length = txtUserName.val().length;
    if (length != 0 && length < 13) {
        if (txtUserName.val().indexOf('#') == -1) {
            socket.emit('room', room);
            socket.emit('nickname', txtUserName.val(), function (set) {
                console.log(set);
                if (!set) {
                    //clear();
                    chatRooms.append('<label type="button" class="form-control" style="background-color: gold" id="'+ txtUserName.val() +'">' + txtUserName.val() + '</label>');
                    //privateChatrooms.append('<label type="button" class="form-control" style="background-color: gold" >' + txtUserName.val() + '</label>');
                    $("#chatArea").show();
                    $("#login").hide();
                    socket.on('default-nicknames', function (res) {
                        console.log(res);
                        res.forEach(function (element) {
                            chatRooms.append('<label type="button" class="form-control" id="'+element+'">' + element + '</label>');
                            privateChatrooms.append('<label type="button" class="form-control" id="pv'+element+'">' + element + '</label>');
                        });
                    });
                }
                else {
                    alert('Nickname already used');
                }
                $('#nickname-err').css('visibility', 'visible');
            });
        }
        else {
            alert("Username can not use character ‘#’");
        }
    }
    else {
        alert('Username can not be empty and length should be less than 12')
    }
});

socket.on('nickname', function (res) {
    console.log(res);
    chatRooms.append('<label type="button" class="form-control" id="'+res+'">' + res + '</label>');
    privateChatrooms.append('<label type="button" class="form-control" id="pv'+res+'">' + res + '</label>');
});

socket.on('nicknames', function (res) {
    console.log(res);
    chatRooms.empty();
    privateChatrooms.empty();
    chatRooms.append('<label type="button" class="form-control" style="background-color: gold" id="'+ txtUserName.val() +'">' + txtUserName.val() + '</label>');
    //privateChatrooms.append('<label type="button" class="form-control" style="background-color: gold" id="pv'+ txtUserName.val() +'">' + txtUserName.val() + '</label>');
    res.forEach(function (element) {
        chatRooms.append('<label type="button" class="form-control" id="'+element+'">' + element + '</label>');
        privateChatrooms.append('<label type="button" class="form-control" id="pv'+element+'">' + element + '</label>');
    });
});

socket.on('announcement', function (res) {
    console.log('loged user data :' + res);
    var messages = $("#messages");

    var message = document.createElement('div');
    message.setAttribute('class', 'chat-message');
    message.textContent = res;
    messages.append(message);

});

socket.on('user message', message);

btnSubmitChat.click(function () {
    if (textarea.val() != "") {
        socket.emit('user message', textarea.val());
        message('me', textarea.val(),new Date($.now()).toLocaleString("en-GB"));
        textarea.val("");
    }
});

function message(from, msg, dateTime) {
    // Build out message div
    var message = document.createElement('div');
    message.setAttribute('class', 'chat-message');
    message.textContent = dateTime + '- ' + from + ": " + msg;
    messages.append(message);
}

// chatRooms.each(function(){
//     var $element = $(this)
//     $element.click(function(){
//         alert($(this).val());
//     });
// }); 

chatRooms.on("click","label", function(){
    alert("Start private chat with : "+$(this).text());
    prvChatTo = $(this).text();

    if(prvChatTo != room && prvChatTo != txtUserName.val()){
        console.log(prvChatTo);
        $("#chatArea").hide();
        privateChatArea.show();
        privateMessages.empty();
        var divID = 'pv'+prvChatTo;
        $("#divID").css("background-color", "green");
    }
//socket.emit('privateMessage', nick, )
});

$("#prvAxinom").click(function(){
    alert("Back to :"+room);
    $("#chatArea").show();
    privateChatArea.hide();
});