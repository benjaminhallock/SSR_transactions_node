const db = require('../util/database');

module.exports = class Transaction {
    constructor(amount, category, description, date, id = null) {
        this.amount = amount;
        this.type = amount < 0 ? 'expense' : 'income';
        this.category = category;
        this.description = description;
        this.date = date;
        this.id = id;
    }

    save() {
        if (this.id) {
            // Update existing transaction
            return db.execute(
                'UPDATE transactions SET amount = ?, type = ?, category = ?, description = ?, date = ? WHERE id = ?',
                [this.amount, this.type, this.category, this.description, this.date, this.id]
            );
        } else {
            // Insert new transaction
            return db.execute(
                'INSERT INTO transactions (amount, type, category, description, date) VALUES (?, ?, ?, ?, ?)',
                [this.amount, this.type, this.category, this.description, this.date]
            );
        }
    }

    static fetchAll() {
        return db.execute('SELECT * FROM transactions ORDER BY date DESC')
            .then(([rows]) => {
                return rows;
            });
    }

    static updateTransaction(id, updatedTransaction) {
        id = parseInt(id, 10);
        if (typeof id !== 'number' || isNaN(id)) {
            return Promise.reject(new Error('Invalid ID type'));
        }
        return db.execute(
            'UPDATE transactions SET amount = ?, category = ?, description = ?, date = ? WHERE id = ?',
            [updatedTransaction.amount, updatedTransaction.category, updatedTransaction.description, updatedTransaction.date, id]
        );
    }

    static delete(id) {
        id = parseInt(id, 10);
        if (typeof id !== 'number' || isNaN(id)) {
            return Promise.reject(new Error('Invalid ID type'));
        }
        return db.execute('DELETE FROM transactions WHERE id = ?', [id]);
    }

    static getTransaction(id) {
        id = parseInt(id, 10);
        if (typeof id !== 'number' || isNaN(id)) {
            return Promise.reject(new Error('Invalid ID type'));
        }
        return db.execute('SELECT * FROM transactions WHERE id = ?', [id])
            .then(([rows]) => {
                if (rows.length === 0) {
                    return null;
                }
                return rows[0];
            });
    }

    static getTransactionsByCategory(category) {
        return db.execute(
            'SELECT * FROM transactions WHERE category = ? ORDER BY date DESC',
            [category]
        )
        .then(([rows]) => {
            return rows;
        })
        .catch(err => {
            console.error('Error in getTransactionsByCategory:', err);
            throw err;
        });
    }

    static getMonthlyTotal() {
        return db.execute(`
            SELECT 
                COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as expenses
            FROM transactions 
            WHERE MONTH(date) = MONTH(CURRENT_DATE()) 
            AND YEAR(date) = YEAR(CURRENT_DATE())
        `)
        .then(([rows]) => {
            return {
                income: parseFloat(rows[0].income),
                expenses: parseFloat(rows[0].expenses)
            };
        });
    }
};
