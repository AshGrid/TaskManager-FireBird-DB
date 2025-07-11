
import Router from "express";
import {createCategory, getCategories, updateCategory,getCategoryById} from "../controllers/categoryController.js";
import {verifyToken, verifyAdmin} from "../middlewares/authMiddleware.js";
import validator from '../middlewares/validator.js';
import{check} from "express-validator";
const router = Router();

// router.post("/addCat",
//     check("name")
//         .notEmpty()
//         .withMessage("Category Name is required"),
//     validator,
//     verifyAdmin,
//     createCategory);
router.post("/addCat", createCategory);
router.get("/getCats", getCategories);
router.get("/getCat/:id", getCategoryById);
router.patch("/updateCat/:id",updateCategory);

export default router;