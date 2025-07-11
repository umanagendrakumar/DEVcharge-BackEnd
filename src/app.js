const express = require("express");
const app = express();

const { connectDB } = require("./database.js");

app.use(express.json());

require("dotenv").config();

const cors = require("cors");

const allowedOrigins = ["http://localhost:5173", "https://devcharge.netlify.app/"];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const { authRouter } = require("./routes/auth.js");
const { profileRouter } = require("./routes/profile.js");
const { requestRouter } = require("./routes/request.js");
const { userRouter } = require("./routes/user.js");
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);


connectDB()
    .then(() => {
        console.log("Database connected successfully");
        app.listen(process.env.PORT, () => {
            console.log("Server is listening at port 7777...");
        })
    })
    .catch((err) => {
        console.error("Database connection failed : ", err);
    })
