const express = require("express");
const { Chat } = require("../models/chat");
const { userAuth } = require("../middlewares/auth");
const { ConnectionRequest } = require("../models/connectionRequest");
const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
    const userId = req.user._id;
    const targetUserId = req.params.targetUserId;

    try {
        const connection = await ConnectionRequest.findOne({
            $or: [{
                fromId: userId,
                toId: targetUserId,
                status: "accepted",
            },
            {
                fromId: targetUserId,
                toId: userId,
                status: "accepted",
            }]
        });
        console.log(connection);
        if (!connection) {
            return res.status(404).json("Connection not found");
        }

        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
        }).populate({
            path: "messages.senderId",
            select: "firstName lastName photoUrl",
        });
        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: []
            });
            await chat.save();
        }
        res.json(chat);

    } catch (err) {
        res.status(400).send("Bad Request");
    }

});

module.exports = chatRouter;