


export function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        getConnection((db) => {
            db.query(sql, params, (err, result) => {
                db.detach();
                if (err) return reject(err);
                resolve(result);
            });
        });
    });
}
