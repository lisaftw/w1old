# Your .env file should look exactly like this with line breaks:

\`\`\`
BOT_TOKEN=MTQzNjM1OTY1MTU5NDczNTY2OA.G1JpT1._t_N2lFccARaCXXrF7e6VUEbXxAkDHkg-qRTTs
CLIENT_ID=1436359651594735668
CLIENT_SECRET=KrJzEj_esL3HDnPtVBPRNIZEH9qTD2g5
REDIRECT_URI=http://45.90.99.17:3000/callback
PORT=3000
LOG_CHANNEL_ID=1436359418395623515
CLAIMS_CATEGORY_ID=1436389471812583575
SUPPORT_CATEGORY_ID=1436389515706110024
PENDING_ROLE_ID=1436408085248741547
VERIFIED_ROLE_ID=1436407951891103784
\`\`\`

**IMPORTANT: After pasting this, you MUST regenerate your BOT_TOKEN and CLIENT_SECRET from Discord Developer Portal since they were exposed publicly!**

**Steps to fix on your VPS:**
1. SSH into your server
2. Go to Discord Developer Portal and regenerate tokens
3. Run: `nano /home/w1oldswebserver/.env`
4. Delete everything and paste the corrected format above with NEW tokens
5. Save with Ctrl+X, Y, Enter
6. Run: `npm run deploy`
7. Run: `pm2 start start.js --name discord-bot`
