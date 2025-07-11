import Router from 'express';
import {verifyToken, verifyAdmin, verifySuperAdmin} from "../middlewares/authMiddleware.js";

import {generateTaskPdf,generateStudentReport} from "../middlewares/pdfGen.js";
import {generatePDF} from "../middlewares/puppeteer.js";
const router = new Router();

router.post("/taskPdf",generateTaskPdf)
router.post("/report",generateStudentReport)
router.post("/puppet",generatePDF)


export default router;