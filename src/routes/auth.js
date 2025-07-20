const express = require('express');
const authRouter = express.Router();

const { User } = require("../models/user.js");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, emailId, password } = req.body;

        if (!firstName || !lastName || !emailId || !password) 
            return res.status(400).send("All Fields Required");


        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(400).send("User with this email already exists");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
        });

        const savedUser = await user.save();
        const token = await jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });
        res.json({ message: "User added successfully", data: savedUser });

    } catch (err) {
        res.send("Error adding user: " + err.message);
    }
})

authRouter.post("/login", async (req, res) => {
    const { emailId, password } = req.body;

    if (!emailId || !password) 
            return res.status(400).send("All Fields Required");

    try {
        const user = await User.findOne({ emailId });
        if (!user) {
            throw new Error("Invalid Credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {

            const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none"
            });
            res.send(user);

        } else {
            throw new Error("Invalid Credentials");
        }
    }
    catch (err) {
        res.status(400).send("Error: " + err.message);
    }
})

authRouter.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,        // very important on production (https)
        sameSite: "None",    // must match how you set the cookie
    });
    res.send("Logout successful");
})

module.exports = { authRouter };