const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const DEFAULT_PHOTO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSElFjB0svPk4QlPgD_85gMfQI2FrInr3ZfIA&s";
const DEFAULT_ABOUT = "No description provided";

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
            default: DEFAULT_PHOTO_URL,
            validate(value) {
                if (!validator.isURL(value) && !(value === "")) {
                    throw new Error("Invalid URL");
                }
            }
        },
        about: {
            type: String,
            default: DEFAULT_ABOUT,
        },
        skills: {
            type: [String]
        }
    },
    {
        timestamps: true
    }
);

// Automatically use default if empty string is passed
userSchema.pre("save", function (next) {
  if (!this.photoUrl) this.photoUrl = DEFAULT_PHOTO_URL;
  if (!this.about) this.about = DEFAULT_ABOUT;
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = { User };