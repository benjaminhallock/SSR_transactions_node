const express = require('express');
const bodyParser = require('body-parser');
const budgetRoutes = require('./routes/budget'); // Import the routes file
const pool = require('./util/database'); // Import the MySQL connection pool
const app = express();
const expressHbs = require('express-handlebars');

// Setup Handlebars with helper functions
const hbs = expressHbs.create({
    helpers: {
        formatDate: function (date) {
            return new Date(date).toLocaleDateString();
        },
        formatDateInput: function (date) {
            if (!date) return '';
            return new Date(date).toISOString().split('T')[0];
        },
        formatAmount: function (amount) {
            return parseFloat(amount || 0).toFixed(2);
        },
        isNegative: function (amount) {
            return parseFloat(amount) < 0;
        },
        eq: function (v1, v2) {
            return v1 === v2;
        },
        formatAbsAmount: function(amount) {
            return Math.abs(parseFloat(amount || 0)).toFixed(2);
        }
    },
    defaultLayout: 'main-layout',
    extname: '.hbs',
    layoutsDir: 'views/layouts'
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the "public" folder

// Use the routes
app.use('/', budgetRoutes); // Use the routes defined in routes.js

// Error handling (optional)
app.use((req, res) => { 
    res.status(404).render('404', { message: 'Page Not Found' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});