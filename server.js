var config = require('./config.json');
const mongo = require('mongodb').MongoClient;
const io = require('socket.io').listen(config.socketPort).sockets;
var dateTime = require('node-datetime');

var chatrooms = "#Axinom";
var nicknames = [];
var dbPort = config.dbPort;
var dbHost = config.dbHost;
var dbName = config.dbName;
var room = "";

mongo.connect(dbHost + dbPort, { useNewUrlParser: true }, function (err, db) {
    if (err) {
        throw err;
    }
    console.log('connected to mongodb...');
    var dbo = db.db(dbName);
    let nickNames = dbo.collection('nickNames');
    let msgHistory = dbo.collection('msgHistory');

    nickNames.find({}, { nickName: 1, _id: 0 }).toArray(function (error, res) {
        if (error) throw err;

        res.forEach(function (element) {
            nicknames.push(element.nickName);
        });
    });

    io.on('connection', function (socket) {
        console.log('connected to socket : ', socket.id);

        socket.on('room', function(selectedroom) {
            console.log('Join to room');
            socket.join(selectedroom);
            room = selectedroom;
        });

        socket.on('nickname', function (nick, fn) {
            if (nicknames.includes(nick)) {
                fn(true);
            } else {
                fn(false);
                socket.nickname = nick;
                socket.broadcast.to(room).emit('announcement', 'User ' + nick + " entered chatroom #Axinom");
                socket.emit('default-nicknames', nicknames);
                socket.broadcast.to(room).emit('nickname', nick);
                nicknames.push(nick);
                nickNames.insert({ nickName: nick, socketID: socket.id });
            }
        });

        socket.on('disconnect', function () {
            if (!socket.nickname) return;

            nicknames.pop(socket.nickname);
            socket.broadcast.to(room).emit('announcement', socket.nickname + ' disconnected');
            socket.broadcast.to(room).emit('nicknames', nicknames);
            var myquery = { nickName: socket.nickname };
            nickNames.deleteOne(myquery);
        });

        socket.on('user message', function (msg) {
            var dt = dateTime.create();
            var dtNow = dt.format('d.m.Y H:M:S');
            socket.to(room).emit('user message', socket.nickname, msg, dtNow);
            msgHistory.insert({ name: socket.nickname, message: msg, dateTime: dtNow });
        });

        socket.on('privateMessage', function (to, message) {
            nickNames.find({ nickName: to }).toArray(function (error, res) {
                if (error) throw err;
                res.forEach(function (element) {
                    //io.to(element.socketID).emit('hey', 'I just met you');
                    io.sockets.socket(element.socketID).emit('updatechat', socket.username, message);
                });
            });
        });

    });
});