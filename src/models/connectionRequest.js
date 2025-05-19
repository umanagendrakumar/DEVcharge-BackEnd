const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
    {
        fromId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        toId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ["ignore", "interested", "accepted", "rejected"],
                message: "{VALUE} is not a valid status"
            }
        },
    },
    {
        timestamps: true
    }
);

connectionRequestSchema.index({ fromId: 1, toId: 1 });

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);
module.exports = { ConnectionRequest };