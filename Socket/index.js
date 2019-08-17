const groupHandler = require('../App');
const api = require('../Api');

module.exports = io => {

    io.on('connection', function (socket) {
        console.log(`${socket.id} has connected to the server`);

        socket.on('create', (formData) => {
            let roomName = formData.name;
            console.log(`attempting to create ${roomName}`)
            if (!groupHandler.exists(roomName)) {
                groupHandler.addGroup(formData);
                socket.join(roomName);
                socket.emit('success-group-made',formData);
                console.log(`${socket.id} has joined and create ${roomName}`)
                for(let i = 0; i< formData.users.length; i++)
                {
                    let request = {
                        user: formData.users[i],
                        latitude: formData.latitude,
                        longitude: formData.longitude
                    }
                    api(request);
                }
            }
            else {
                console.log("Room already exists");
            }
        });

        socket.on('disconnect', function(){
            console.log('user disconnected');
        });

        socket.on('update', (roomName) => {
            let data = []; //user routes to destination
            io.sockets.in(roomName).emit('routes', data);
        });
    });
}

