const Transaction = require('../models/transaction');

exports.renderHome = async (req, res) => {
    try {
        const monthlyTotal = await Transaction.getMonthlyTotal();
        const recentTransactions = await Transaction.fetchAll();

        const income = monthlyTotal.income || 0;
        const expenses = monthlyTotal.expenses || 0;
        const balance = income - expenses;

        res.render('home', {
            monthlyTotal,
            transactions: recentTransactions.slice(0, 5), // Show only last 5 transactions
            balance: balance,
            pageTitle: 'Dashboard'
        });
    } catch (error) {
        console.error('Error in renderHome:', error);
        res.status(500).render('error', { 
            error: 'Failed to load dashboard',
            pageTitle: 'Error'
        });
    }
};

exports.renderAddTransaction = async (req, res) => {
    res.render('addtransaction', {
        pageTitle: 'Add Transaction',
        editing: false
    });
};

exports.addTransaction = async (req, res) => {
    try {
        const { amount, category, description, date } = req.body;
        const transaction = new Transaction(
            parseFloat(amount),
            category,
            description,
            date
        );
        await transaction.save();
        res.redirect('/transactions');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { error: 'Failed to add transaction' });
    }
};

exports.renderEditTransaction = async (req, res) => {
    try {
        const transId = req.params.id;
        const transaction = await Transaction.getTransaction(transId);

        if (!transaction) {
            return res.redirect('/transactions');
        }

        res.render('addtransaction', {
            pageTitle: 'Edit Transaction',
            editing: true,
            transaction: transaction
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { error: 'Failed to load transaction' });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const { amount, category, description, date } = req.body;
        const transId = req.params.id;

        const updatedTransaction = {
            amount: parseFloat(amount),
            category,
            description,
            date
        };

        await Transaction.updateTransaction(transId, updatedTransaction);
        res.redirect('/transactions');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { error: 'Failed to update transaction' });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const transId = req.params.id;
        await Transaction.delete(transId);
        res.status(200).json({ message: 'Transaction deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
};

// Additional helper method to render transactions page
exports.renderTransactions = async (req, res) => {
    try {
        const selectedCategory = req.query.category;
        let transactions;
        
        if (selectedCategory) {
            transactions = await Transaction.getTransactionsByCategory(selectedCategory);
        } else {
            transactions = await Transaction.fetchAll();
        }

        const monthlyTotal = await Transaction.getMonthlyTotal();
        
        // Get unique categories for the filter dropdown
        const categories = [
            'Salary',
            'Investment',
            'Other Income',
            'Food',
            'Transportation',
            'Utilities',
            'Entertainment',
            'Other Expense'
        ];

        res.render('transactions', {
            transactions,
            monthlyTotal,
            balance: (monthlyTotal.income || 0) - (monthlyTotal.expenses || 0),
            categories,
            selectedCategory
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { error: 'Failed to load transactions' });
    }
}; 