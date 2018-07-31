var config = require('./config.json');
const mongo = require('mongodb').MongoClient;
const io = require('socket.io').listen(config.socketPort).sockets;
var dateTime = require('node-datetime');

var nicknames = [];
var room = "";
//get bc connection details from config.json
var dbPort = config.dbPort;
var dbHost = config.dbHost;
var dbName = config.dbName;

//Connect to mongodb
mongo.connect(dbHost + dbPort, { useNewUrlParser: true }, function (err, db) {
    if (err) {
        throw err;
    }
    console.log('connected to mongodb...');
    var dbo = db.db(dbName);
    let nickNames = dbo.collection('nickNames');
    let msgHistory = dbo.collection('msgHistory');
    let pvtMsgHistory = dbo.collection('pvtMsgHistory');
    //Get all users from db
    nickNames.find({}, { nickName: 1, _id: 0 }).toArray(function (error, res) {
        if (error) throw err;

        res.forEach(function (element) {
            nicknames.push(element.nickName);
        });
    });
    //crete socket connection using socket.io
    io.on('connection', function (socket) {
        console.log('connected to socket : ', socket.id);
        //join to a chat romm
        socket.on('room', function(selectedroom) {
            console.log('Join to room');
            socket.join(selectedroom);
            room = selectedroom;
        });
        //nickname validation 
        socket.on('nickname', function (nick, fn) {
            if (nicknames.includes(nick)) {
                fn(true);
            } else {
                fn(false);
                socket.nickname = nick;
                //broadcast login someone
                socket.broadcast.to(room).emit('announcement', 'User ' + nick + " entered chatroom #Axinom");
                socket.emit('default-nicknames', nicknames);
                socket.broadcast.to(room).emit('nickname', nick);
                nicknames.push(nick);
                nickNames.insert({ nickName: nick, socketID: socket.id });
            }
        });
        //get disconnected users
        socket.on('disconnect', function () {
            if (!socket.nickname) return;
            //remove disconnected users from server
            nicknames.pop(socket.nickname);
            socket.broadcast.to(room).emit('announcement', socket.nickname + ' disconnected');
            socket.broadcast.to(room).emit('nicknames', nicknames);
            //remove disconnected users from db
            var myquery = { nickName: socket.nickname };
            nickNames.deleteOne(myquery);
        });
        //listinig input mesages from clients
        socket.on('user message', function (msg) {
            var dt = dateTime.create();
            var dtNow = dt.format('d.m.Y H:M:S');
            socket.to(room).emit('user message', socket.nickname, msg, dtNow);
            msgHistory.insert({ name: socket.nickname, message: msg, dateTime: dtNow });
        });
        //listning private messages from client
        socket.on('privateMessage', function (uname,socID, message) {
            var dt = dateTime.create();
            var dtNow = dt.format('d.m.Y H:M:S');
            // io.to(socID).emit('privateMessage', socket.nickname, uname , message,dtNow);
            // io.socket(socID).emit();
            pvtMsgHistory.insert({ fromName: socket.nickname, toName: uname , message: message, dateTime: dtNow });
            var qry = { $match: {$or: [{fromName: socket.nickname}, {toName: uname}]}}
            pvtMsgHistory.find({qry}).toArray(function (error, res){
                io.to(socID).emit('privateMessage', res);
            });
        });
        
        socket.on('getprivateMessage', function (uname , fn) {
            // io.to(socID).emit('privateMessage', socket.nickname, uname , message,dtNow);
            // io.socket(socID).emit();
            console.log('hithistory');
            var qry = { $match: {$or: [{fromName: socket.nickname}, {toName: uname}]}}
            //pvtMsgHistory.find({fromName: socket.nickname , toName: uname, toName: socket.nickname, fromName: uname}).toArray(function (error, res){
            pvtMsgHistory.find({qry}).toArray(function (error, res){
                fn(res);
            });

        });

        socket.on('socketid', function (name, fn) {
            nickNames.find({ nickName: name }).toArray(function (error, res) {
                if (error) throw err;
                res.forEach(function (element) {
                    console.log('Socket :'+element.socketID);
                    fn(element.socketID)
                    //socket.emit('socketid', element.socketID);
                    //io.to(element.socketID).emit('hey', 'I just met you');
                    //io.sockets.socket(element.socketID).emit('updatechat', socket.username, message);
                });
            });
        });

    });
});