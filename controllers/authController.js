import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validationResult } from 'express-validator';
import { getConnection } from '../dbConnect.js';
import jwt from 'jsonwebtoken';

export async function signUp(req, res) {
    try {
        const { name, email, password, password_confirmation } = req.body;
        console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.mapped() });
        }

        if (!name || !email || !password) {
            if (req.file) deleteUploadedFile(req.file.filename);
            return res.status(400).json({ error: "All fields are required" });
        }

        // if (password !== password_confirmation) {
        //     if (req.file) deleteUploadedFile(req.file.filename);
        //     return res.status(400).json({ error: "Passwords do not match" });
        // }

        getConnection(async (db) => {
            // Check if user already exists
            db.query('SELECT ID FROM USERS WHERE EMAIL = ?', [email], async (err, result) => {
                if (err) {
                    db.detach();
                    return res.status(500).json({ error: "DB error" });
                }

                if (result.length > 0) {
                    db.detach();
                    if (req.file) deleteUploadedFile(req.file.filename);
                    return res.status(400).json({ error: "User already exists" });
                }

                const image = req.file?.filename || req.body.image || '';
                const hashedPassword = await bcrypt.hash(password, 10);

                db.query(
                    `INSERT INTO USERS (NAME, EMAIL, PASSWORD, IMAGE)
                     VALUES (?, ?, ?, ?) RETURNING ID`,
                    [name, email, hashedPassword, image],
                    (insertErr, insertResult) => {
                        db.detach();

                        if (insertErr) {
                            console.error(insertErr);
                            if (req.file) deleteUploadedFile(req.file.filename);
                            return res.status(500).json({ error: 'User creation failed' });
                        }

                        res.status(201).json({ message: 'User created successfully' });
                    }
                );
            });
        });
    } catch (err) {
        console.error('Signup error:', err);
        if (req.file) deleteUploadedFile(req.file.filename);
        res.status(500).json({ error: 'Server error' });
    }
}

function deleteUploadedFile(filename) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, "../uploads", filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}



export async function logIn(req, res) {
    const { email, password } = req.body;

    getConnection((db) => {
        db.query(
            `SELECT ID, NAME, EMAIL, PASSWORD, ROLE FROM USERS WHERE EMAIL = ?`,
            [email],
            async (err, result) => {
                db.detach();

                if (err || result.length === 0) {
                    return res.status(401).json({ error: 'Authentication failed' });
                }

                const user = result[0];
                const passwordMatch = await bcrypt.compare(password, user.PASSWORD);

                if (!passwordMatch) {
                    return res.status(401).json({ error: 'Authentication failed' });
                }

                const payload = {
                    id: user.ID,
                    email: user.EMAIL,
                    username: user.NAME,
                    role: user.ROLE
                };

                const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '60m'
                });

                const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
                    expiresIn: '1d'
                });

                res.cookie('jwt', refreshToken, {
                    httpOnly: true,
                    sameSite: 'None',
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000
                });

                res.json({ accessToken,refreshToken });
            }
        );
    });
}


export async function refreshToken(req, res) {
    try {
        const refreshToken = req.cookies?.jwt;
        if (!refreshToken) {
            return res.status(406).json({ message: 'Unauthorized' });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(406).json({ message: 'Unauthorized' });
            }

            const accessToken = jwt.sign({
                id: decoded.id,
                email: decoded.email,
                username: decoded.username,
                role: decoded.role
            }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '10m'
            });

            res.json({ accessToken });
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Refresh failed' });
    }
}
