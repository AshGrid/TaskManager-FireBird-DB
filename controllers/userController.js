import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getConnection } from '../dbConnect.js'; // adjust path as needed

export async function createUser(req, res) {
    try {
        const { name, email, password, password_confirmation, role } = req.body;

        if (!name || !email || !password || !password_confirmation || !role) {
            if (req.file) deleteUploadedFile(req.file.filename);
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password !== password_confirmation) {
            if (req.file) deleteUploadedFile(req.file.filename);
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        getConnection(async (db) => {
            // Check for existing user
            db.query('SELECT ID FROM USERS WHERE EMAIL = ?', [email], async (err, result) => {
                if (err) {
                    db.detach();
                    console.error(err);
                    return res.status(500).json({ error: 'Database error' });
                }

                if (result.length > 0) {
                    db.detach();
                    if (req.file) deleteUploadedFile(req.file.filename);
                    return res.status(400).json({ error: 'User already exists' });
                }

                const image = req.file?.filename || req.body.image || '';
                const hashedPassword = await bcrypt.hash(password, 10);

                const insertSql = `
                    INSERT INTO USERS (NAME, EMAIL, PASSWORD, IMAGE, ROLE)
                    VALUES (?, ?, ?, ?, ?)
                    RETURNING ID
                `;

                db.query(insertSql, [name, email, hashedPassword, image, role], (insertErr, insertResult) => {
                    db.detach();

                    if (insertErr) {
                        console.error('Insert error:', insertErr);
                        if (req.file) deleteUploadedFile(req.file.filename);
                        return res.status(500).json({ error: 'Failed to create user' });
                    }

                    const userId = insertResult[0]?.ID;

                    res.status(201).json({
                        message: 'User created successfully',
                        user: { id: userId, name, email, image, role }
                    });
                });
            });
        });
    } catch (err) {
        console.error('Error during signup:', err);
        if (req.file) deleteUploadedFile(req.file.filename);
        res.status(500).json({ error: 'Server error' });
    }
}

function deleteUploadedFile(filename) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../uploads', filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
export async function getAllUsers(req, res) {
    getConnection((db) => {
        const sql = 'SELECT ID, NAME, EMAIL, IMAGE, ROLE FROM USERS';

        db.query(sql, [], (err, result) => {
            db.detach();

            if (err) {
                console.error('Error fetching users:', err);
                return res.status(500).json({ error: 'Server error' });
            }

            res.status(200).json(result);
        });
    });
}