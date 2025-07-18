const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { connectDB } = require("./database.js");


require("dotenv").config();


const allowedOrigins = ["http://localhost:5173", "https://devcharge.netlify.app"];

app.use(cors({
    origin: function (origin, callback) {
        console.log("Origin received by CORS:", origin); // 👈 Add this
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            console.log("❌ CORS blocked:", origin); // 👈 Add this
            return callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));


app.use(express.json());
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
