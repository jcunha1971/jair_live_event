const express = require("express");
const socketIo = require("socket.io");
const http = require("http");
const app = express();
const cors = require("cors");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getRoomUsers,
  userLeave
} = require("./utils/users")

const port = process.env.PORT || 3000;
const JOIN_ROOM = "joinRoom";
const ROOM_INFO = "roomInfo";
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

app.use(express.json());
app.use(cors());


const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", socket => {
  const { roomId } = socket.handshake.query;

  socket.on(JOIN_ROOM, ({ username, room = roomId }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Send users and room info
    io.in(user.room).emit(ROOM_INFO, {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  })

  socket.on(NEW_CHAT_MESSAGE_EVENT, data => {
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data)
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if(user) {
      io.in(user.room).emit(ROOM_INFO, {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }

    socket.leave(roomId);
  });
});

app.use("/", require("./routes/index"));

app.use("/auth", require("./routes/jwtAuth"));


server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});