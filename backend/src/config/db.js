const mongoose = require('mongoose');
const dns = require('dns');

// Replit's default resolver can fail SRV lookups for mongodb+srv URIs.
// Force a public DNS resolver that supports SRV records.
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    console.warn('Could not override DNS servers:', e.message);
}

async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is not set');
        return;
    }
    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000,
            family: 4,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`MongoDB connection Error: ${error}`);
    }
}

module.exports = connectDB;
