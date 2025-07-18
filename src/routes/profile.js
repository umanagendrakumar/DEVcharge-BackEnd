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

profileRouter.patch("/profile/edit/password",  async (req, res) => {
    try {
        const { emailId, newPassword, confirmNewPassword } = req.body;

        const user = await User.findOne({ emailId });
        if(!user) {
            throw new Error("User not found with this emailId");
        }

        //confirm password should be same as new password.
        if (newPassword !== confirmNewPassword) {
            throw new Error("Passwords must match");
        }
        
        const oldPassword = user.password;

        //new password should not be same as old password.
        const isnewPasswordOldPassword = await bcrypt.compare(newPassword, oldPassword);
        if (isnewPasswordOldPassword) {
            throw new Error("New password can't be same as old one");
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        user.password = newPasswordHash;
        user.save();
        res.send("Password updated successfully");

    }
    catch (err) {
        res.status(500).send("Error: " + err.message)
    }
});


module.exports = { profileRouter };