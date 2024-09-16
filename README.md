# FeelGoodBot

## Overview

FeelGoodBot is a Discord bot that provides personalized recommendations for music, movies, and YouTube videos based on user mood and profile preferences. The bot integrates with Spotify, TMDb (The Movie Database), and YouTube APIs to deliver tailored content to users.

## Features

- **Personalized Recommendations**: The bot offers music tracks, movies, and YouTube videos based on the user's mood and profile preferences.
- **User Profile Management**: Users can set their favorite music genre and artist, and preferred movie genre, which the bot uses to provide more accurate recommendations.
- **Mood-Based Recommendations**: The bot provides recommendations based on the mood specified by the user.

## Setup

### Prerequisites

- Node.js
- npm (Node Package Manager)
- MongoDB (or any other database you prefer)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/igurvir/FeelGoodBot
    ```

2. Navigate to the project directory:
    ```bash
    cd FeelGoodBot
    ```

3. Install the required dependencies:
    ```bash
    npm install
    ```

4. Create a `.env` file in the root directory and add the following environment variables:
    ```plaintext
    SPOTIFY_CLIENT_ID=your_spotify_client_id
    SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
    TMDB_API_KEY=your_tmdb_api_key
    YOUTUBE_API_KEY=your_youtube_api_key
    ```

5. Ensure MongoDB (or your chosen database) is running and properly configured. Make sure the `getDatabase` function in `db.js` connects to your database.

### Running the Bot

To start the bot, run:
```bash
node index.js
```

Commands
```
!setprofile <music-genre> <artist> <movie-genre>: Sets the user's profile with their preferred music genre, artist, and movie genre.
!mood <mood>: Provides personalized recommendations based on the specified mood. Recommendations include:
Spotify Tracks: Music tracks that match the mood and user profile.
Movies: Movies related to the user's preferred genre.
YouTube Videos: YouTube videos related to the mood.
```
### Example Usage

Setting Up Profile:
```
!setprofile hiphop drake action
```
This command sets the user's music preferences to hiphop with artist Drake and movie genre to action.
Getting Recommendations:
```
!mood happy
```
This command fetches music tracks, movies, and YouTube videos related to the mood "happy" and the user's profile preferences.
Development

To Add More Features: Modify the index.js file to include additional functionalities or integrate other APIs.
To Update Profile Management: Ensure the updateProfile function in db.js correctly handles user preferences.
Contributing

Feel free to fork the repository and submit pull requests with improvements or new features. For any issues or feature requests, please open an issue on GitHub.

For any questions or support, please contact gurvirsingh0504@gmail.com







