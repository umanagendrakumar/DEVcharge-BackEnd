const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://umaevolve:tHaBVmivhltFWcQu@devconn.oz1lwnq.mongodb.net/DEVconnDB");
}

module.exports = { connectDB };

