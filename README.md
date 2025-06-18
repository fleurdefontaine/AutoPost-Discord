# Auto Post Discord Bot

A Discord bot that helps you manage and automate message posting across multiple Discord accounts and channels.

## Features

- 🤖 Manage multiple Discord accounts
- ⏱️ Customizable posting delay for each account
- 📝 Easy-to-use interface with Discord embeds
- 🔄 Real-time status updates
- ✏️ Edit account settings on the fly
- ⚡ Start/Stop auto-posting with one click

## Setup

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```env
TOKEN=your_discord_bot_token
MONGODB_URI=your_mongodb_connection_string
CHANNEL_ID=your_control_channel_id
```

### Environment Variables

- `TOKEN`: Your Discord bot token from [Discord Developer Portal](https://discord.com/developers/applications)
- `MONGODB_URI`: MongoDB connection string, [Register MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
- `CHANNEL_ID`: The Discord channel ID where the bot control panel will appear

## Running the Bot

```bash
node index.js
```

## Usage

1. The bot will create a control panel in the specified channel
2. Use the dropdown menu to:
   - Add new accounts
   - Edit existing accounts
   - Start/Stop auto-posting

### Account Configuration

When adding or editing an account, you'll need to provide:
- `Token`: Discord account token
- `Message`: The message to be posted
- `Channel ID`: Target channel for posting
- `Delay`: Time between posts (in milliseconds)

## Features

### Real-time Status
- Shows bot uptime in relative time format
- Displays total number of configured accounts
- Updates automatically every 10 seconds

### Account Management
- Add unlimited accounts
- Edit account settings
- Start/Stop posting for each account independently

## Technical Details

- Built with Discord.js v14
- Uses MongoDB for data persistence
- Implements efficient caching for Discord messages
- Supports Discord's relative timestamp format

## Author

Created by Rvnaa

## License

MIT License