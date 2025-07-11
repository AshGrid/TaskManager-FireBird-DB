import Router from 'express';
import {createUser, getAllUsers,} from '../controllers/userController.js'
import  upload  from '../middlewares/multerConfig.js';
import {verifyToken, verifySuperAdmin} from '../middlewares/authMiddleware.js';
const router = Router();




router.get("/", verifySuperAdmin, getAllUsers);
router.post("/create",verifySuperAdmin, createUser)
export default router;
