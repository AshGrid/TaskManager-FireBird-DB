// import mongoose from 'mongoose';
//
// //mongoose.connect('mongodb+srv://ayoub1:ayoub1@pdm.vwwjbxe.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
//
// mongoose.connect('mongodb://127.0.0.1:27017/userdb')
//
// //mongoose.connect('mongodb://localhost:27017/flutter');
//
// const connection = mongoose.connection;
//
// connection.on('error', (err) => console.log(err));
// connection.on('connected', () => console.log('Connection successful'));
//
// export default connection;

// db.js
import firebird from 'node-firebird';

// Connection options
const options = {
    host: '127.0.0.1',
    port: 3050,
    database: 'C:/projects/TaskManager-Nodejs/task-manager.fdb',
    user: 'SYSDBA',
    password: 'masterkey',
    lowercase_keys: false,
    role: null,
    pageSize: 4096,
};

// Export a connection pool
export function getConnection(callback) {
    firebird.attach(options, (err, db) => {
        if (err) throw err;
        callback(db);
    });
}
