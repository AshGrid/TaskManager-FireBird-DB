import { getConnection } from './dbConnect.js';

getConnection((db) => {
    db.query('SELECT 1 FROM RDB$DATABASE', (err, result) => {
        db.detach();
        if (err) console.error('Query error:', err.message);
        else console.log('Query successful:', result);
    });
});