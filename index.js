require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios');
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

// YouTube API setup
const youtubeApiKey = process.env.YOUTUBE_API_KEY;
const youtubeApi = axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3/',
    params: {
        key: youtubeApiKey,
        part: 'snippet',
        type: 'video'
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

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    if (command === '!mood') {
        const mood = args[0];
        await handleMood(message, mood);
    }
});

async function getSpotifyPlaylist(query) {
    try {
        const data = await spotifyApi.searchPlaylists(query, { limit: 1 });
        const playlist = data.body.playlists.items[0];
        return playlist ? playlist.external_urls.spotify : 'No playlist found.';
    } catch (error) {
        console.error('Error fetching Spotify playlist', error);
        return 'Sorry, I couldn\'t fetch a playlist at the moment.';
    }
}

async function getTMDbRecommendation(genreId) {
    try {
        const response = await tmdbApi.get('discover/movie', {
            params: {
                with_genres: genreId,
                sort_by: 'popularity.desc',
                page: 1,
            },
        });
        const movie = response.data.results[0];
        return movie ? `https://www.themoviedb.org/movie/${movie.id}` : 'No movie found.';
    } catch (error) {
        console.error('Error fetching TMDb movie', error);
        return 'Sorry, I couldn\'t fetch a movie recommendation at the moment.';
    }
}

async function getYouTubeVideo(query) {
    try {
        const response = await youtubeApi.get('search', {
            params: {
                q: query,
                order: 'viewCount',
                maxResults: 1,
            },
        });
        const video = response.data.items[0];
        return video ? `https://www.youtube.com/watch?v=${video.id.videoId}` : 'No video found.';
    } catch (error) {
        console.error('Error fetching YouTube video', error);
        return 'Sorry, I couldn\'t fetch a YouTube video at the moment.';
    }
}

async function handleMood(message, mood) {
    switch (mood) {
        case 'happy':
            const happyPlaylist = await getSpotifyPlaylist('happy');
            const comedyMovie = await getTMDbRecommendation('35'); // Genre ID for Comedy
            const happyVideo = await getYouTubeVideo('happy');
            message.channel.send(`Here's an upbeat playlist for your happy mood: ${happyPlaylist}`);
            message.channel.send(`Here's a fun comedy movie to keep you smiling: ${comedyMovie}`);
            message.channel.send(`Here's a fun YouTube video for your mood: ${happyVideo}`);
            break;
        case 'stressed':
            const relaxPlaylist = await getSpotifyPlaylist('relax');
            const dramaMovie = await getTMDbRecommendation('18'); // Genre ID for Drama
            const stressReliefVideo = await getYouTubeVideo('stress relief');
            message.channel.send(`Here's a calming playlist to help you relax: ${relaxPlaylist}`);
            message.channel.send(`Here's a drama movie to help you unwind: ${dramaMovie}`);
            message.channel.send(`Here's a stress-relief YouTube video for you: ${stressReliefVideo}`);
            break;
        case 'sad':
            const sadPlaylist = await getSpotifyPlaylist('sad');
            const romanceMovie = await getTMDbRecommendation('10749'); // Genre ID for Romance
            const sadVideo = await getYouTubeVideo('sad');
            message.channel.send(`Here's a playlist to match your mood: ${sadPlaylist}`);
            message.channel.send(`Here's a romantic movie to cheer you up: ${romanceMovie}`);
            message.channel.send(`Here's a sad YouTube video: ${sadVideo}`);
            break;
        default:
            message.channel.send('Sorry, I don\'t have recommendations for that mood. Try "happy", "stressed", or "sad".');
            break;
    }
}

client.login(process.env.DISCORD_BOT_TOKEN);
