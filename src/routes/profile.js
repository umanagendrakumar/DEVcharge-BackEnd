const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require('../middlewares/auth.js');
const { User } = require('../models/user.js');
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    }
    catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

profileRouter.put("/profile/edit", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        // Check if the user is trying to update their emailID & password.
        const NOT_ALLOWED = ["emailId", "password"];
        const isNotSafeToUpdate = Object.keys(req.body).some((key) => {
             return NOT_ALLOWED.includes(key);
        });
        if (isNotSafeToUpdate) {
            throw new Error("You are not allowed to update emailId or/and password");
        }

        //if not 
        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        })
        await loggedInUser.save()
        res.send(loggedInUser);
    }
    catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

profileRouter.patch("/profile/edit/password", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const oldPassword = loggedInUser.password;
        const { newPassword, confirmNewPassword } = req.body;

        //confirm password should be same as new password.
        if (newPassword !== confirmNewPassword) {
            throw new Error("New password and confirm password do not match");
        }

        //new password should not be same as old password.
        const isnewPasswordOldPassword = await bcrypt.compare(newPassword, oldPassword);
        if (isnewPasswordOldPassword) {
            throw new Error("New password should not be same as old password");
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        loggedInUser.password = newPasswordHash;
        loggedInUser.save();
        res.send("Password updated successfully");

    }
    catch (err) {
        res.status(500).send("Error: " + err.message)
    }
});


module.exports = { profileRouter };