import mongoose, { Schema, model } from "mongoose";

const CategorySchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
    },
    { timestamps: true } // Automatically add createdAt and updatedAt
);

const Category = model("Category", CategorySchema);
export default Category;
