import Category from "../models/Category.js";
import {validationResult} from "express-validator";
import {getConnection} from "../dbConnect.js";




export async function createCategory(req, res) {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        getConnection((db) => {
            // Get next ID from generator
            db.query('SELECT GEN_ID(GEN_CATEGORY_ID, 1) AS NEW_ID FROM RDB$DATABASE', [], (err, idResult) => {
                if (err) {
                    db.detach();
                    console.error('Generator error:', err);
                    return res.status(500).json({ error: 'Failed to generate ID' });
                }

                const newId = idResult[0].NEW_ID;

                const insertSql = `
          INSERT INTO CATEGORY (ID, NAME, DESCRIPTION, CREATED_AT, UPDATED_AT)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;

                db.query(insertSql, [newId, name, description || null], (err2) => {
                    db.detach();

                    if (err2) {
                        console.error('Insert error:', err2);
                        return res.status(500).json({ error: 'Insert failed' });
                    }

                    res.status(201).json({
                        id: newId,
                        name,
                        description,
                    });
                });
            });
        });
    } catch (e) {
        console.error('Catch error:', e);
        return res.status(500).json({ error: e.message });
    }
}



export function getCategories(req, res) {
    getConnection((db) => {
        db.query('SELECT * FROM category', (err, result) => {
            db.detach();
            if (err) return res.status(500).json({ error: err.message });
            res.json(result);
        });
    });
}


export async function updateCategory(req, res) {
    try {
        const { name, description } = req.body;
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Category ID is required' });
        }

        getConnection((db) => {
            // First, fetch the current category
            db.query('SELECT * FROM CATEGORY WHERE ID = ?', [id], (err, rows) => {
                if (err) {
                    db.detach();
                    console.error('Select error:', err);
                    return res.status(500).json({ error: 'Failed to retrieve category' });
                }

                if (rows.length === 0) {
                    db.detach();
                    return res.status(404).json({ error: 'Category not found' });
                }

                const existing = rows[0];

                // Use existing values if not provided
                const updatedName = name ?? existing.NAME;
                const updatedDescription = (description !== undefined) ? description : existing.DESCRIPTION;

                const sql = `
                    UPDATE CATEGORY 
                    SET NAME = ?, DESCRIPTION = ?, UPDATED_AT = CURRENT_TIMESTAMP
                    WHERE ID = ?
                `;

                db.query(sql, [updatedName, updatedDescription, id], (err2) => {
                    db.detach();

                    if (err2) {
                        console.error('Update error:', err2);
                        return res.status(500).json({ error: 'Failed to update category' });
                    }

                    return res.status(200).json({
                        id,
                        name: updatedName,
                        description: updatedDescription,
                    });
                });
            });
        });
    } catch (e) {
        console.error('Catch error:', e);
        return res.status(500).json({ error: e.message });
    }
}

export async function getCategoryById(req,res){


    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'Category ID is required' });
        }
        getConnection((db) => {
            db.query('SELECT NAME FROM CATEGORY WHERE ID = ?', [id], (err, result) => {
                db.detach();
                if (err) return res.status(500).json({ error: err.message });
                res.json(result);
            });
        });
    }
    catch (e) {

    }
}
