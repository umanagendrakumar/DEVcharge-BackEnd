const { Server } = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const { ConnectionRequest } = require("../models/connectionRequest");


const getSecretRoomId = (userId, targetUserId) => {
    return (
        crypto
            .createHash("sha256")
            .update([userId, targetUserId].sort().join("@$^*)"))
            .digest("hex")
    )
};

const initializeSocket = (server, allowedOrigins) => {
    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        }
    });

    io.on("connection", (socket) => {
        socket.on("joinChat", ({ userId, targetUserId }) => {
            const roomId = getSecretRoomId(userId, targetUserId);
            // console.log("join room : " + roomId);
            socket.join(roomId);
        });

        socket.on("sendMessage", async ({ firstName, lastName, photoUrl, userId, targetUserId, text }) => {
            try {
                let chat = await Chat.findOne({
                    participants: { $all: [userId, targetUserId] }
                });
                if (!chat) {
                    chat = new Chat({
                        participants: [userId, targetUserId],
                        messages: []
                    });
                }
                chat.messages.push({
                    senderId: userId,
                    text,
                });
                await chat.save();

                const roomId = getSecretRoomId(userId, targetUserId)
                io.to(roomId).emit("receiveMessage", {
                    firstName,
                    lastName,
                    photoUrl,
                    text,
                });

            } catch (err) {
                res.status(500).send(err);
            }



        });

        socket.on("disconnect", () => { });
    });
}

module.exports = initializeSocket;