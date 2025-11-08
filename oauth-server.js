const express = require("express")
const axios = require("axios")
const { EmbedBuilder } = require("discord.js")
const fs = require("fs")
const net = require("net")

let sessions = null

module.exports = (client, sharedSessions) => {
  sessions = sharedSessions

  const PORT = process.env.PORT || 3000

  const tester = net.createServer()

  tester.once("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`⚠️ Port ${PORT} is already in use. Skipping OAuth server start.`)
      console.log(`This is normal if the bot restarted. The OAuth server is already running.`)
      return
    }
  })

  tester.once("listening", () => {
    tester.close()
    startOAuthServer()
  })

  tester.listen(PORT)

  function startOAuthServer() {
    const app = express()

    app.get("/verify", (req, res) => {
      const state = req.query.state
      if (!state) {
        return res.send("Invalid verification link")
      }

      console.log("[v0] Verify request received, state:", state)
      console.log("[v0] Session exists:", sessions.has(state))
      console.log("[v0] Total sessions in oauth-server:", sessions.size)

      const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=identify%20guilds&state=${state}`
      res.redirect(authUrl)
    })

    app.get("/callback", async (req, res) => {
      const { code, state } = req.query

      console.log("[v0] Callback received, state:", state)
      console.log("[v0] Session exists:", sessions.has(state))
      console.log("[v0] Total sessions:", sessions.size)

      if (!code || !state || !sessions.has(state)) {
        return res.send("Verification failed. Please try again.")
      }

      try {
        const tokenResponse = await axios.post(
          "https://discord.com/api/oauth2/token",
          new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: process.env.REDIRECT_URI,
          }),
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          },
        )

        const accessToken = tokenResponse.data.access_token

        const userResponse = await axios.get("https://discord.com/api/users/@me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        const guildsResponse = await axios.get("https://discord.com/api/users/@me/guilds", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        const userGuilds = guildsResponse.data
        console.log("[v0] User guilds fetched:", userGuilds.length)

        const sessionData = sessions.get(state)
        const { guildId, userId } = sessionData

        let blacklist = []
        if (fs.existsSync("./blacklist.json")) {
          blacklist = JSON.parse(fs.readFileSync("./blacklist.json", "utf8"))
        }

        const guild = await client.guilds.fetch(guildId)
        const member = await guild.members.fetch(userId)

        let isBlacklisted = false
        let blacklistedServer = null

        for (const userGuild of userGuilds) {
          if (blacklist.includes(userGuild.id)) {
            isBlacklisted = true
            blacklistedServer = userGuild
            break
          }
        }

        if (isBlacklisted) {
          try {
            const appealEmbed = new EmbedBuilder()
              .setColor("#00D9FF")
              .setTitle("🚫 Banned from Server")
              .setDescription(
                `You have been banned from **${guild.name}** for being in a blacklisted server.\n\n` +
                  `If you think your ban was a mistake, please make an appeal ticket in this server:\n` +
                  `https://discord.gg/8mhqwKNkf3`,
              )
              .setTimestamp()
            await member.send({ embeds: [appealEmbed] })
          } catch (dmError) {
            console.log("[v0] Could not DM user before ban:", dmError.message)
          }

          await member.ban({ reason: `Member is in blacklisted server: ${blacklistedServer.name}` })

          const logChannelId = process.env.LOG_CHANNEL_ID
          if (logChannelId) {
            const logChannel = guild.channels.cache.get(logChannelId)
            if (logChannel) {
              const embed = new EmbedBuilder()
                .setColor("#00D9FF")
                .setTitle("🚫 Member Auto-Banned")
                .addFields(
                  { name: "User", value: `${member.user.tag} (${member.id})`, inline: true },
                  { name: "Reason", value: "Member is in a blacklisted server", inline: false },
                  {
                    name: "Blacklisted Server",
                    value: `${blacklistedServer.name} (${blacklistedServer.id})`,
                    inline: true,
                  },
                )
                .setTimestamp()
              await logChannel.send({ embeds: [embed] })
            }
          }

          sessions.delete(state)
          return res.send("You have been banned from the server for being in a blacklisted server.")
        }

        const pendingRoleId = process.env.PENDING_ROLE_ID
        const verifiedRoleId = process.env.VERIFIED_ROLE_ID

        if (pendingRoleId && member.roles.cache.has(pendingRoleId)) {
          await member.roles.remove(pendingRoleId)
        }

        if (verifiedRoleId) {
          await member.roles.add(verifiedRoleId)
        }

        try {
          const dmEmbed = new EmbedBuilder()
            .setColor("#00D9FF")
            .setTitle("✅ Verification Successful")
            .setDescription(`You have been verified in **${guild.name}**! You now have full access to the server.`)
            .setTimestamp()
          await member.send({ embeds: [dmEmbed] })
        } catch (err) {
          console.log("Could not DM user:", err.message)
        }

        const logChannelId = process.env.LOG_CHANNEL_ID
        if (logChannelId) {
          const logChannel = guild.channels.cache.get(logChannelId)
          if (logChannel) {
            const embed = new EmbedBuilder()
              .setColor("#00D9FF")
              .setTitle("✅ Member Verified")
              .addFields(
                { name: "User", value: `${member.user.tag} (${member.id})`, inline: true },
                { name: "Status", value: "Passed verification - No blacklisted servers found", inline: false },
              )
              .setTimestamp()
            await logChannel.send({ embeds: [embed] })
          }
        }

        sessions.delete(state)
        res.send("Verification successful! You can now close this page and return to Discord.")
      } catch (error) {
        console.error("OAuth error:", error)
        res.send("Verification failed. Please try again.")
      }
    })

    app.locals.sessions = sessions

    const server = app.listen(PORT, () => {
      console.log(`✅ OAuth2 server running on port ${PORT}`)
    })

    server.on("error", (error) => {
      console.error("OAuth server error:", error)
    })

    return server
  }

  return sessions
}
