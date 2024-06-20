let io;
const {v4: uuidv4 } = require("uuid")
const Chat = require("./src/models/chat");

const getRoomChatData = async (roomId) => {
  const chat = await Chat.findOne({ roomId: roomId });
  return chat;
};

module.exports = {
  init: (server) => {
    io = require("socket.io")(server);

    io.on("connection", (socket) => {
      console.log("New client connected");

      let roomId;

      socket.on("joinRoom", async (data) => {
        console.log("JOINROOM : ", data);
        roomId = data.roomId;
        socket.join(roomId);
        const chat = await Chat.findOne({ roomId: roomId });
        data.msg && chat.messages.push(data.msg);
        await chat.save();
        io.to(roomId).emit("receiveChat", chat);
      });

      socket.on("getChats", async (data) => {
        const chat = await getRoomChatData(data.roomId);
        socket.emit("receiveChat", chat);
      })

      socket.on("createRoom", async (data) => {
        console.log(" CREATE ROOM: ", data);
        roomId = uuidv4();
        socket.join(roomId);
        console.log("id:", roomId);
        await Chat.create({ roomId: roomId, messages: [{ ...data }] });
        socket.emit("receiveRoom", { roomId: roomId });
        io.emit("newRoom", { roomId: roomId });
      });

      socket.on("disconect", (roomId) => {
        socket.leave(roomId);
      });

      socket.on("endChat", async (data) => {
        console.log("End chat action is sent!!!!");
        // await Chat.findOneAndDelete({ roomId: data.roomId });
        io.emit("receiveMsg", {message: "End chat", from: "system"});
        io.to(roomId).emit("endChat", data);
        socket.leave(roomId);
      });




      socket.on("sendMsg", async (data) => {
        console.log("SEND MESSAGE: ",data);
        const roomId = data.roomId;
        socket.join(roomId);
        const chat = await getRoomChatData(roomId);
        chat.messages.push(data.msg);
        await Chat.updateOne({ roomId: roomId }, chat);
        io.to(roomId).emit("receiveMsg", data.msg);
      });
    });
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
