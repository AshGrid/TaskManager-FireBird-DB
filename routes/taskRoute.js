import Router from 'express';
import {verifyToken, verifyAdmin, verifySuperAdmin} from "../middlewares/authMiddleware.js";
import {createTask, deleteTask, updateTask,getTasks} from "../controllers/taskController.js";
const router = new Router();

router.post("/addTask",verifySuperAdmin,createTask)
router.put("/updateTask",verifyAdmin,updateTask)
router.delete("/deleteTask",verifyAdmin,deleteTask)
router.get("/getTasks",verifyToken,getTasks)

export default router;