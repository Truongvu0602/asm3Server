const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  roomId: {
    type: String,
    required: true
  },
  messages:[
    {
      from : {
        type: String,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      time: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = mongoose.model("Chat", ChatSchema);