require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');
const { getDatabase, getProfile, updateProfile } = require('./db'); // Import the database functions

// Create a new client instance for Spotify
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

// Create a new client instance for Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// TMDb API base URL and key
const tmdbApi = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    params: {
        api_key: process.env.TMDB_API_KEY,
    },
});

// YouTube API setup
const youtubeApi = axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3/',
    params: {
        key: process.env.YOUTUBE_API_KEY,
        part: 'snippet',
        type: 'video'
    },
});

client.once('ready', async () => {
    console.log('FeelGoodBot is online!');

    // Retrieve an access token from Spotify
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body['access_token']);
    } catch (err) {
        console.error('Error retrieving access token', err);
    }

    // Connect to MongoDB
    try {
        await getDatabase(); // Ensure connection to the database
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    if (command === '!mood') {
        const mood = args.join(' ');
        await handleMood(message, mood);
    } else if (command === '!setprofile') {
        const genre = args[0];
        const artist = args[1];
        const movieGenre = args[2];
        await handleSetProfile(message, genre, artist, movieGenre);
    }
});

async function handleSetProfile(message, genre, artist, movieGenre) {
    try {
        await updateProfile(message.author.id, { genre, artist, movieGenre });
        message.reply('Profile updated! Now use `!mood <mood>` to get personalized recommendations.');
    } catch (error) {
        console.error('Error updating profile:', error);
        message.reply('There was an error updating your profile. Please try again.');
    }
}

async function handleMood(message, mood) {
    const userProfile = await getProfile(message.author.id);
    const { genre, artist, movieGenre } = userProfile || {};

    try {
        // Fetch Spotify recommendations
        const spotifyTracks = await spotifyApi.searchTracks(`mood:${mood} genre:${genre}`, { limit: 5 });
        const spotifyRecommendations = spotifyTracks.body.tracks.items.map(track => ({
            title: track.name,
            url: track.external_urls.spotify
        }));

        // Fetch movie recommendations
        const tmdbMovies = await tmdbApi.get('discover/movie', {
            params: { with_genres: movieGenre, sort_by: 'popularity.desc', page: 1 }
        });
        const movieRecommendations = tmdbMovies.data.results.slice(0, 5).map(movie => ({
            title: movie.title,
            url: `https://www.themoviedb.org/movie/${movie.id}`
        }));

        // Fetch YouTube videos
        const youtubeVideos = await youtubeApi.get('search', {
            params: { q: mood, maxResults: 5 }
        });
        const youtubeRecommendations = youtubeVideos.data.items.map(video => ({
            title: video.snippet.title,
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`
        }));

        // Format and send the response
        let response = `**Recommendations for mood "${mood}":**\n\n`;

        response += '**Spotify Tracks:**\n';
        spotifyRecommendations.forEach((track, index) => {
            response += `${index + 1}. [${track.title}](${track.url})\n`;
        });

        response += '\n**Movies:**\n';
        movieRecommendations.forEach((movie, index) => {
            response += `${index + 1}. [${movie.title}](${movie.url})\n`;
        });

        response += '\n**YouTube Videos:**\n';
        youtubeRecommendations.forEach((video, index) => {
            response += `${index + 1}. [${video.title}](${video.url})\n`;
        });

        // Ensure the message is within Discord's 2000 character limit
        while (response.length > 2000) {
            message.channel.send(response.slice(0, 2000));
            response = response.slice(2000);
        }
        message.channel.send(response);

    } catch (error) {
        console.error('Error handling mood:', error);
        message.reply('There was an error processing your request. Please try again.');
    }
}

client.login(process.env.DISCORD_BOT_TOKEN);
