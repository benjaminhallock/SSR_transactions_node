const mysql2 = require('mysql2');

const pool = mysql2.createPool({
    host: '45.55.136.114',
    user: 'hallock_f2024',
    password: 'take8break!',
    database: 'hallock_f2024',
});

module.exports = pool.promise(); // returns a promise