import { getConnection } from '../dbConnect.js';

export async function createTask(req, res) {
    const { name, description, priority, dueDate, category, user, status } = req.body;

    getConnection(async (db) => {
        try {
            // Find category
            db.query('SELECT ID FROM CATEGORY WHERE NAME = ?', [category], (catErr, catResult) => {
                if (catErr || catResult.length === 0) {
                    db.detach();
                    return res.status(400).json({ error: "Category non existing" });
                }

                const categoryId = catResult[0].ID;

                // Find user
                db.query('SELECT ID FROM USERS WHERE EMAIL = ?', [user], (userErr, userResult) => {
                    if (userErr || userResult.length === 0) {
                        db.detach();
                        return res.status(400).json({ error: "User does not exist" });
                    }

                    const userId = userResult[0].ID;



                    // Insert task
                    db.query(
                        `INSERT INTO TASKS (NAME, DESCRIPTION, PRIORITY, DUE_DATE, CATEGORY_ID, USER_ID, STATUS)
                         VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING ID`,
                        [name, description, priority, dueDate, categoryId, userId, status],
                        (insertErr, insertResult) => {
                            db.detach();
                            if (insertErr) {
                                console.error(insertErr);
                                return res.status(500).json({ error: "Task creation failed" });
                            }
                            res.status(200).json({ task: {  name, description, priority, dueDate, status } });
                        }
                    );
                });
            });
        } catch (e) {
            db.detach();
            res.status(500).json({ error: "Server error" });
        }
    });
}
export async function updateTask(req, res) {
    const { id, name, description, priority, dueDate, category, user, status } = req.body;

    getConnection(async (db) => {
        try {
            db.query('SELECT ID FROM CATEGORIES WHERE NAME = ?', [category], (catErr, catResult) => {
                if (catErr || catResult.length === 0) {
                    db.detach();
                    return res.status(400).json({ error: "Category non existing" });
                }

                const categoryId = catResult[0].ID;

                db.query('SELECT ID FROM USERS WHERE EMAIL = ?', [user], (userErr, userResult) => {
                    if (userErr || userResult.length === 0) {
                        db.detach();
                        return res.status(400).json({ error: "User does not exist" });
                    }

                    const userId = userResult[0].ID;

                    db.query(
                        `UPDATE TASKS SET 
                            NAME = ?, DESCRIPTION = ?, PRIORITY = ?, DUEDATE = ?, 
                            CATEGORY_ID = ?, USER_ID = ?, STATUS = ? 
                         WHERE ID = ?`,
                        [name, description, priority, dueDate, categoryId, userId, status, id],
                        (updateErr) => {
                            db.detach();
                            if (updateErr) {
                                return res.status(500).json({ error: "Task update failed" });
                            }
                            res.status(200).json({ message: "Task updated" });
                        }
                    );
                });
            });
        } catch (e) {
            db.detach();
            res.status(500).json({ error: "Server error" });
        }
    });
}
export async function deleteTask(req, res) {
    const { id } = req.body;

    getConnection((db) => {
        db.query('DELETE FROM TASKS WHERE ID = ?', [id], (err) => {
            db.detach();
            if (err) {
                return res.status(500).json({ error: "Task deletion failed" });
            }
            res.status(200).json({ message: "Task deleted successfully" });
        });
    });
}
export async function getTasks(req, res) {
    console.log("getting tasks")
    getConnection((db) => {
        db.query('SELECT * FROM TASKS', (err, result) => {
            db.detach();
            if (err) {
                return res.status(500).json({ error: "Failed to retrieve tasks" });
            }
            console.log(result)
            res.status(200).json(result);
        });
    });
}
