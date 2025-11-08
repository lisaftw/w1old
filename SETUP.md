# Discord Bot Setup Guide

## Prerequisites
- Node.js installed on your VPS
- Discord Bot Token
- Discord Application Client ID and Client Secret
- Public IP or domain name

## Installation Steps

1. **Upload files to your VPS**
   - Upload all bot files to your VPS

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in all required values:
     - `DISCORD_TOKEN` - Your bot token from Discord Developer Portal
     - `CLIENT_ID` - Your application ID
     - `CLIENT_SECRET` - Your OAuth2 client secret
     - `OAUTH_REDIRECT_URI` - Your callback URL (e.g., `http://45.90.99.17:3000/callback`)
     - `LOG_CHANNEL_ID` - Channel ID for logging
     - `CLAIMS_CATEGORY_ID` - Category ID for claim tickets
     - `SUPPORT_CATEGORY_ID` - Category ID for support tickets
     - `VERIFIED_ROLE_ID` - Role ID to give verified members
     - `PENDING_ROLE_ID` - Role ID for unverified members

4. **Discord Developer Portal Setup**
   - Go to https://discord.com/developers/applications
   - Select your application
   - Go to OAuth2 → General
   - Add redirect URI: `http://45.90.99.17:3000/callback` (or your domain)
   - Save changes

5. **Deploy Slash Commands**
   \`\`\`bash
   npm run deploy
   \`\`\`

6. **Start the Bot and OAuth Server**
   \`\`\`bash
   npm start
   \`\`\`
   This runs both the Discord bot and OAuth verification server together.

   Or run them separately:
   \`\`\`bash
   npm run bot      # Run only the Discord bot
   npm run server   # Run only the OAuth server
   \`\`\`

7. **Keep Running with PM2 (Recommended)**
   \`\`\`bash
   npm install -g pm2
   pm2 start start.js --name discord-bot
   pm2 save
   pm2 startup
   \`\`\`

## Firewall Configuration

Make sure port 3000 is open:
\`\`\`bash
sudo ufw allow 3000
\`\`\`

## How the Verification System Works

1. New member joins → Receives "Pending" role with limited access
2. Bot sends verification message with a button
3. User clicks "Verify" → Redirected to Discord OAuth2
4. User authorizes bot to see their servers
5. Bot checks their server list against blacklist
6. If clean: Removes pending role, adds verified role
7. If in blacklisted server: User gets banned

## Commands

- `/setup claims-channel:#channel support-channel:#channel` - Setup ticket panels
- `/blacklist add server_id:123456789` - Add server to blacklist
- `/blacklist list` - View blacklisted servers
- `/blacklist remove server_id:123456789` - Remove from blacklist
- `/ticket claim` - Open claim ticket
- `/ticket support` - Open support ticket
- `/rename new-name` - Rename ticket channel
- `/delete` - Delete ticket

## Troubleshooting

- Check logs in your LOG_CHANNEL_ID for detailed information
- Verify all environment variables are set correctly
- Ensure bot has Administrator permissions in your server
- Check that redirect URI matches exactly in both .env and Discord Developer Portal
