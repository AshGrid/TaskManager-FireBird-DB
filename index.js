
import userRoute from "./routes/userRoute.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import express from 'express';
import { join } from 'path';
import json from 'express';
import bodyParser from 'body-parser';
import {getConnection} from './dbConnect.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import categoryRoute from "./routes/categoryRoute.js";
import taskRoute from "./routes/taskRoute.js";
import authRoute from "./routes/authRoute.js";
import pdfRoute from "./routes/pdfRoute.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.use('/api/users',userRoute)
app.use('/api/auth',authRoute)
app.use('/api/categories',categoryRoute);
app.use('/api/tasks',taskRoute)
app.use('/api/pdfs',pdfRoute)

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});



