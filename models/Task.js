import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            maxlength: 500,
        },
        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            default: "MEDIUM",
        },
        dueDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
            default: "PENDING",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category", // Reference to the Category model
        },
    },
    { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
