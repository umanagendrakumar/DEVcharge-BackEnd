const express = require('express');
const userRouter = express.Router();

const { User } = require("../models/user.js")
const { userAuth } = require("../middlewares/auth.js");
const { ConnectionRequest } = require('../models/connectionRequest.js');


userRouter.get("/user/request/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const requestsReceived = await ConnectionRequest.find({
            toId: loggedInUser._id,
            status: "interested"
        }).populate("fromId", "firstName lastName age gender photoUrl about skills");

        if (requestsReceived.length === 0) throw new Error("No requests Recieved");

        res.send(requestsReceived);
    }
    catch (err) {
        res.status(500).send({ Error: err.message });
    }

})

userRouter.get("/user/request/sent", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const requestsSent = await ConnectionRequest.find({
            fromId: loggedInUser._id,
            status: "interested"
        }).populate("toId", "firstName lastName age gender photoUrl about skills");

        if (requestsSent.length === 0) throw new Error("No requests sent");

        res.send(requestsSent);
    }
    catch (err) {
        res.status(500).send({ Error: err.message });
    }
});

userRouter.get("/user/ignoredProfiles", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const ignoredProfiles = await ConnectionRequest.find({
            $or: [
                { fromId: loggedInUser._id, status: "ignore" },
                { toId: loggedInUser._id, status: "rejected" }
            ]

        });

        const populatedignoredProfiles = await Promise.all(ignoredProfiles.map(async (profile) => {
            if (profile.fromId.equals(loggedInUser._id)) {
                return await profile.populate("toId", "firstName lastName age gender photoUrl about skills");
            } else {
                return await profile.populate("fromId", "firstName lastName age gender photoUrl about skills");
            }
        }))

        if (populatedignoredProfiles.length === 0) throw new Error("No profiles ignored");

        res.send(populatedignoredProfiles);
    }
    catch (err) {
        res.status(500).send({ Error: err.message });
    }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connections = await ConnectionRequest.find({
            $or: [
                { fromId: loggedInUser._id, status: "accepted" },
                { toId: loggedInUser._id, status: "accepted" }
            ]
        });

        const populatedConnections = await Promise.all(connections.map(async (connection) => {
            if (connection.fromId.equals(loggedInUser._id)) {
                return await connection.populate("toId", "firstName lastName age gender photoUrl about skills");
            } else {
                return await connection.populate("fromId", "firstName lastName age gender photoUrl about skills");
            }
        }))

        if (populatedConnections.length === 0) throw new Error("No connections found");

        res.send(populatedConnections);
    }
    catch (err) {
        res.status(500).send({ Error: err.message });
    }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const requests = await ConnectionRequest.find({
            $or: [
                { fromId: loggedInUser._id },
                { toId: loggedInUser._id }
            ]
        });

        const hideUsersFromFeed = new Set();
        requests.forEach((req) => {
            hideUsersFromFeed.add(req.fromId.toString());
            hideUsersFromFeed.add(req.toId.toString());
        })

        const usersInFeed = await User.find({
            _id: { $nin: Array.from(hideUsersFromFeed) }
        }).select("firstName lastName age gender photoUrl about skills");

        if (usersInFeed.length === 0) throw new Error("No more new users");

        res.send(usersInFeed);
    }
    catch (err) {
        res.status(500).send({ Error: err.message });
    }

});

module.exports = { userRouter };