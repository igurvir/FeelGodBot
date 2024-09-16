require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios');  // For making requests to TMDb
const { Client, GatewayIntentBits } = require('discord.js');

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

client.once('ready', () => {
    console.log('FeelGoodBot is online!');

    // Retrieve an access token from Spotify
    spotifyApi.clientCredentialsGrant().then(data => {
        spotifyApi.setAccessToken(data.body['access_token']);
    }).catch(err => {
        console.error('Error retrieving access token', err);
    });
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    if (command === '!mood') {
        const mood = args[0];
        handleMood(message, mood);
    }
});

// Function to handle mood responses with both Spotify and TMDb suggestions
function handleMood(message, mood) {
    switch (mood) {
        case 'happy':
            getSpotifyPlaylist('happy').then(playlistUrl => {
                message.channel.send(`Here's an upbeat playlist for your happy mood: ${playlistUrl}`);
            });
            getTMDbRecommendation('comedy').then(movieUrl => {
                message.channel.send(`Here's a fun comedy movie to keep you smiling: ${movieUrl}`);
            });
            break;
        case 'stressed':
            getSpotifyPlaylist('relax').then(playlistUrl => {
                message.channel.send(`Here's a calming playlist to help you relax: ${playlistUrl}`);
            });
            getTMDbRecommendation('drama').then(movieUrl => {
                message.channel.send(`Here's a gripping drama to help you unwind: ${movieUrl}`);
            });
            break;
        case 'bored':
            getSpotifyPlaylist('fun').then(playlistUrl => {
                message.channel.send(`Feeling bored? Here's a fun playlist: ${playlistUrl}`);
            });
            getTMDbRecommendation('action').then(movieUrl => {
                message.channel.send(`Here's an action movie to get your adrenaline going: ${movieUrl}`);
            });
            break;
        default:
            message.channel.send('I’m not sure what to suggest for that mood, but I’m here to help!');
    }
}

// Function to fetch Spotify playlist based on mood
async function getSpotifyPlaylist(query) {
    try {
        const data = await spotifyApi.searchPlaylists(query, { limit: 1 });
        const playlist = data.body.playlists.items[0];
        return playlist ? playlist.external_urls.spotify : 'No playlist found.';
    } catch (error) {
        console.error('Error fetching playlist:', error);
        return 'Error fetching playlist.';
    }
}

// Function to fetch movie recommendations from TMDb based on genre
async function getTMDbRecommendation(genre) {
    try {
        const genreResponse = await tmdbApi.get('genre/movie/list');
        const genres = genreResponse.data.genres;
        const genreId = genres.find(g => g.name.toLowerCase() === genre.toLowerCase())?.id;

        if (!genreId) return 'No movies found for this genre.';

        const movieResponse = await tmdbApi.get('discover/movie', {
            params: {
                with_genres: genreId,
                sort_by: 'popularity.desc',
                language: 'en-US',
            },
        });

        const movie = movieResponse.data.results[0];
        return movie ? `https://www.themoviedb.org/movie/${movie.id}` : 'No movie found.';
    } catch (error) {
        console.error('Error fetching movie from TMDb:', error);
        return 'Error fetching movie.';
    }
}

client.login(process.env.DISCORD_TOKEN);
