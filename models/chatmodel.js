const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
    room:Number,
    messages:[{
        from:String,
        message:String
    }]
});

ChatModel=mongoose.model("Chat",ChatSchema);

module.exports=ChatModel;