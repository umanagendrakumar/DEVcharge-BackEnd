const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            trim: true
        },
        emailId: {
            type: String,
            required: true,
            unique: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid email address");
                }
            }
        },
        password: {
            type: String,
            required: true,
            trim: true,
            validate(value) {
                if (!validator.isStrongPassword(value)) {
                    throw new Error("Password is not strong enough");
                }
            }
        },
        age: {
            type: Number
        },
        gender: {
            type: String,
            min: 10
        },
        photoUrl: {
            type: String,
            validate(value) {
                if (!validator.isURL(value)) {
                    throw new Error("Invalid URL");
                }
            }
        },
        about: {
            type: String,
            default: "No description provided"
        },
        skills: {
            type: [String]
        }


    },
    {
        timestamps: true
    }
);


const User = mongoose.model("User", userSchema);

module.exports = { User };