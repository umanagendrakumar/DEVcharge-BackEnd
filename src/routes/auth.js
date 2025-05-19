const express = require('express');
const authRouter = express.Router();

const { User } = require("../models/user.js");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
    const { firstName, lastName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
        firstName,
        lastName,
        emailId,
        password: passwordHash,
    });

    await user.save()
        .then(() => {
            res.send("User added successfully");
        })
        .catch((err) => {
            res.send("Error adding user: " + err.message);
        })
})

authRouter.post("/login", async (req, res) => {
    const { emailId, password } = req.body;
    try {
        const user = await User.findOne({ emailId });
        if (!user) {
            throw new Error("Invalid Credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {

            const token = await jwt.sign({ _id: user._id }, "privateKey", {expiresIn: "7d"});
            res.cookie("token", token);
            res.send("Login successful");

        } else {
            throw new Error("Invalid Credentials");
        }
    }
    catch (err) {
        res.send("Error: " + err.message);
    }
})

authRouter.post("/logout", (req, res) => {
    res.cookie("token", null, {expires: new Date(Date.now())});
    res.send("Logout successful");
})

module.exports = { authRouter };