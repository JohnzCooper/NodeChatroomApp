# NodeChatroomApp

A Real Time Chat Application built using Node.js, Mongodb, Socket.io, Jquery and Bootstrap.

## Features<a name="features"></a>

	+ Uses Nodejs as the application Framework.
    + Authenticates via username and password using JQuery.
    + Real-time communication between a client and a server using Socket.io.
    + Uses MongoDB for storing and querying data.

## Installation<a name="installation"></a>
### Running Locally
Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.


1. Clone or Download the repository

	```
	$ git clone https://github.com/JohnzCooper/NodeChatBox.git
	```
2. Install Dependencies

	```
	$ npm install
	```
3. Edit configuration file in /config.json_ with your localhost and ports.

4. Download and Install [mongodb](https://www.mongodb.com/mongodb-3.6).

5. Start the server application

	```
	$ node server.js
	```
	Your app should now be running on [localhost:4000]

### Database<a name="database"></a>
Robo 3T is used to interact with a MongoDB. 

### Sockets<a name="sockets"></a>
Having an active connection opened between the client and the server so client can send and receive data. This allows real-time communication using TCP sockets. This is made possible by [Socket.io](https://github.com/socketio/socket.io).

The client starts by connecting to the server through a socket. Once connections is successful, client and server can emit and listen to events.
	
