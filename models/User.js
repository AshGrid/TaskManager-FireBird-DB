import mongoose, { Schema, model } from "mongoose";

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    password_confirmation: { type: String, required: false },
    image: {
        type: String,
        required: false,
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task", // Reference to the Task model
        },
    ],
    role: {
        type: String,
        enum: ["SIMPLE_USER", "ADMIN", "SUPER_ADMIN"],
        default: "SIMPLE_USER",
    },
});

const User = model("User", UserSchema);
export default User;
