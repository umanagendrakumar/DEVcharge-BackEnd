const jwt = require("jsonwebtoken");
const {User} = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).send("Please login to access");
        }

        const decodedMessage = await jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decodedMessage._id);
        if (!user) {
            throw new Error("User not found");
        }

        req.user = user;
        next();
    }
    catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

module.exports = { userAuth };