const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Home page route
router.get('/', transactionController.renderHome);

// List all transactions
router.get('/transactions', transactionController.renderTransactions);

// Add transaction routes
router.get('/add-transaction', transactionController.renderAddTransaction);
router.post('/add-transaction', transactionController.addTransaction);

// Edit transaction routes
router.get('/edit-transaction/:id', transactionController.renderEditTransaction);
router.post('/edit-transaction/:id', transactionController.updateTransaction);

// Delete transaction route
router.delete('/transactions/:id', transactionController.deleteTransaction);

module.exports = router;
