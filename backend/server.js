// start server
require('dotenv').config();
const app = require('./src/app.js'); 
const connectDB = require('./src/config/db.js');

const PORT = process.env.PORT || 5001;

// connecting to database
connectDB();

// Run Server
app.listen(PORT, () => {
    console.log(`Example app listening on port http://127.0.0.1:${PORT}`);
});