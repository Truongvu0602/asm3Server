const Chat = require("../../models/chat");
const User = require("../../models/user");

exports.getChatRooms = async (req, res, next) => {
  try {
    const chats = await Chat.find();
    if (!chats) {
      return res.status(404).json({ status: 404, message: "Chats not found" });
    }
    res.status(200).json({ chats: chats });
  } catch (error) {
    console.log("Get chat rooms error: ", error);
    next(error);
  }
};
