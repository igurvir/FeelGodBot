require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
const { Client, GatewayIntentBits } = require('discord.js');

// Create a new client instance for Spotify
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

// Create a new client instance for Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

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

function handleMood(message, mood) {
    switch (mood) {
        case 'happy':
            getSpotifyPlaylist('happy').then(playlistUrl => {
                message.channel.send(`Here's an upbeat playlist for your happy mood: ${playlistUrl}`);
            });
            break;
        case 'stressed':
            getSpotifyPlaylist('relax').then(playlistUrl => {
                message.channel.send(`Here's a calming playlist to help you relax: ${playlistUrl}`);
            });
            break;
        case 'bored':
            getSpotifyPlaylist('fun').then(playlistUrl => {
                message.channel.send(`Feeling bored? Here's a fun playlist: ${playlistUrl}`);
            });
            break;
        default:
            message.channel.send('I’m not sure what to suggest for that mood, but I’m here to help!');
    }
}

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

client.login(process.env.DISCORD_TOKEN);
