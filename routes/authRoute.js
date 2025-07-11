import Router from 'express';
import {logIn, refreshToken, signUp} from '../controllers/authController.js'
import  upload  from '../middlewares/multerConfig.js';
import validator from '../middlewares/validator.js';
import{check} from "express-validator";

const router = Router();


router.post('/signup',
    upload.single('image'),
    signUp);
router.post('/login',logIn);
router.post('/refresh',refreshToken);

export default router;
