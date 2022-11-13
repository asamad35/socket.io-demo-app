const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const http = require("http");

const app = express();
const port = process.env.PORT || 4500;
const server = http.createServer(app);
const io = socketIO(server);

const users = {};

app.use(cors());

app.get("/", (req, res) => {
  res.send("I am running");
});

io.on("connection", (socket) => {
  console.log("New connection");

  socket.on("message", ({ message, id }) => {
    io.emit("sendMessage", { user: users[id], message, id });
  });

  socket.on("joined", ({ user }) => {
    users[socket.id] = user;
    console.log(`${user} has joined the room`);

    socket.emit("welcome", {
      user: user,
      message: "welcome to the chat",
    });

    socket.broadcast.emit("user joined", {
      user: user,
      message: `${user} has joined the chat room`,
    });
  });

  socket.on("disconnect", (user) => {
    socket.broadcast.emit("leave", {
      user: "admin",
      message: `${users[socket.id]} left the chat room`,
    });
    console.log(`user left the chat`);
  });
});

server.listen(port, () => {
  console.log(`port is running at ${port}`);
});
