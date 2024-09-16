const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db('feelgoodbot'); // Your database name
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
}

async function getDatabase() {
    if (!db) {
        await connectToDatabase();
    }
    return db;
}

// Function to get a user's profile
async function getProfile(userId) {
    const database = await getDatabase();
    const profiles = database.collection('profiles');
    return profiles.findOne({ userId: userId });
}

// Function to update a user's profile
// In db.js
async function updateProfile(userId, genre, artist, movieGenre) {
    const database = await getDatabase();
    const profiles = database.collection('profiles');
    return profiles.updateOne(
        { userId: userId },
        { $set: { genre: genre, artist: artist, movieGenre: movieGenre } },
        { upsert: true }
    );
}


module.exports = { getDatabase, getProfile, updateProfile };
