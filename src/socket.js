
let io;
exports.socketConnection = (server) => {
    const io = require('socket.io')(server, {
        cors: {
            //TODO: refactor origin adress
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });
    io.on("connection", socket => {
        console.info(`Client connected [id=${socket.id}]`);

        // listeners
        socket.on("new user message", data => {
            console.log(data)
            //db write operation
            //if successful
            socket.emit("return user message", data)
            socket.broadcast.emit("return user message", data)
        })

        socket.on('disconnect', () => {
            console.info(`Client disconnected [id=${socket.id}]`);
        });
    });
}

// Emitters