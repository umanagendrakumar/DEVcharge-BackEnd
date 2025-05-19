const express = require('express');
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth.js");
const { User } = require('../models/user.js');
const { ConnectionRequest } = require('../models/connectionRequest.js');


requestRouter.post("/request/send/:status/:toId", userAuth, async (req, res) => {
    try {

        const fromId = req.user._id;

        const toId = req.params.toId;
        const status = req.params.status;

        if (fromId == toId) throw new Error("You cannot connect with yourself");

        const toUser = await User.findById(toId);
        if (!toUser) throw new Error("User you trying to connect does not exist");

        const ALLOWED_STATUSES = ["ignore", "interested"];
        if (!ALLOWED_STATUSES.includes(status)) throw new Error("Invalid status :" + status);

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                {
                    fromId,
                    toId
                },
                {
                    fromId: toId,
                    toId: fromId
                }
            ]
        });
        if (existingConnectionRequest) throw new Error("Connection request already sent");

        const connectionRequest = new ConnectionRequest({
            fromId,
            toId,
            status
        });
        await connectionRequest.save();

        res.send(req.user.firstName + " " + status + " " + toUser.firstName);
    }
    catch (err) {

        res.status(500).send({ Error: err.message });
    }

});

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const requestId = req.params.requestId;
        const status = req.params.status;

        const request = await ConnectionRequest.findById(requestId);
        if (!request) throw new Error("Request does not exist");

        const ALLOWED_STATUSES = ["accepted", "rejected"];
        if (!ALLOWED_STATUSES.includes(status)) throw new Error("Invalid status :" + status);

        if (request.status === "interested" && request.toId.equals(loggedInUser._id)) {
            request.status = status;
        }
        else {
            throw new Error("Invalid Request");
        }
        await request.save();

        res.send(loggedInUser.firstName + " " + status + " the request");
    }
    catch (err) {
        res.status(500).send({ Error: err.message });
    }
});

module.exports = { requestRouter };