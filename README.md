# Discord Ticket Bot

## Setup Instructions

1. Install dependencies:
\`\`\`
npm install
\`\`\`

2. Create a `.env` file based on `.env.example`:
\`\`\`
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
LOG_CHANNEL_ID=your_log_channel_id_here
\`\`\`

3. Create two categories in your Discord server:
   - "Claims" - for claim tickets
   - "Support" - for support tickets

4. Deploy slash commands:
\`\`\`
npm run deploy
\`\`\`

5. Start the bot:
\`\`\`
npm start
\`\`\`

## Commands

- `/setup` - Create the ticket panel with buttons
- `/ticket claim` - Open a claim ticket (alternative to button)
- `/ticket support` - Open a support ticket (alternative to button)
- `/rename <name>` - Rename the current ticket (staff only)
- `/delete` - Delete the current ticket (staff only)
- `/blacklist add <server_id>` - Add a server to the blacklist
- `/blacklist remove <server_id>` - Remove a server from the blacklist
- `/blacklist list` - List all blacklisted servers

## Features

- Auto-ban users who are in blacklisted servers
- Claim tickets with Roblox username, email, and item purchased
- Support tickets with detailed reason field
- Ticket claiming and deletion with buttons
- Complete logging system
- Transcript saving and DM delivery
- All messages in embeds
