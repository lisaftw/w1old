const { Client, GatewayIntentBits, Partials, Collection, MessageFlags } = require("discord.js")
const fs = require("fs")
require("dotenv").config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildInvites, // Added intent for invite tracking
  ],
  partials: [Partials.Channel, Partials.Message],
})

client.commands = new Collection()
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.data.name, command)
}

const guildInvites = new Map()

let oauthServerStarted = false

client.once("clientReady", async () => {
  console.log(`Logged in as ${client.user.tag}`)

  try {
    const guilds = client.guilds.cache
    for (const guild of guilds.values()) {
      try {
        const invites = await guild.invites.fetch()
        guildInvites.set(guild.id, new Map(invites.map((invite) => [invite.code, invite.uses])))
      } catch (err) {
        if (err.code === 50013) {
          console.log(
            `⚠️ Missing "Manage Server" permission in ${guild.name} - Invite tracking disabled for this server`,
          )
          console.log("   To enable auto-verification via invite link, grant the bot 'Manage Server' permission")
        } else {
          console.error(`Error caching invites for ${guild.name}:`, err.message)
        }
      }
    }
    if (guildInvites.size > 0) {
      console.log("[v0] Cached invites for invite tracking")
    }
  } catch (error) {
    console.error("Error initializing invite tracking:", error)
  }

  if (!oauthServerStarted) {
    oauthServerStarted = true
    try {
      const sessions = new Map()

      require("./oauth-server")(client, sessions)

      const blacklistHandler = require("./handlers/blacklistHandler")
      blacklistHandler.setSessions(sessions)
      console.log("[v0] Sessions shared between OAuth server and blacklist handler")
    } catch (error) {
      if (error.code === "EADDRINUSE") {
        console.log("⚠️ OAuth server port already in use - another instance may be running")
        console.log("Run: sudo lsof -i :8080 to check what's using the port")
      } else {
        console.error("OAuth server error:", error)
      }
    }
  }
})

client.on("inviteCreate", async (invite) => {
  const cachedInvites = guildInvites.get(invite.guild.id) || new Map()
  cachedInvites.set(invite.code, invite.uses)
  guildInvites.set(invite.guild.id, cachedInvites)
})

client.on("inviteDelete", async (invite) => {
  const cachedInvites = guildInvites.get(invite.guild.id)
  if (cachedInvites) {
    cachedInvites.delete(invite.code)
  }
})

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName)
    if (!command) return

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "There was an error executing this command!", flags: MessageFlags.Ephemeral })
    }
  } else if (interaction.isButton()) {
    const buttonHandler = require("./handlers/buttonHandler")
    await buttonHandler(interaction)
  } else if (interaction.isModalSubmit()) {
    const modalHandler = require("./handlers/modalHandler")
    await modalHandler(interaction)
  }
})

client.on("guildMemberAdd", async (member) => {
  let autoVerified = false

  try {
    const invitesBefore = guildInvites.get(member.guild.id)

    if (invitesBefore) {
      const invitesAfter = await member.guild.invites.fetch()

      let usedInvite = null

      for (const [code, invite] of invitesAfter) {
        const beforeUses = invitesBefore.get(code) || 0
        if (invite.uses > beforeUses) {
          usedInvite = invite
          break
        }
      }

      guildInvites.set(member.guild.id, new Map(invitesAfter.map((invite) => [invite.code, invite.uses])))

      if (usedInvite && usedInvite.code === "TyCRzCxEdT") {
        console.log(`[v0] Member ${member.user.tag} joined with verified invite link`)
        const verifiedRoleId = process.env.VERIFIED_ROLE_ID
        if (verifiedRoleId) {
          const role = member.guild.roles.cache.get(verifiedRoleId)
          if (role) {
            await member.roles.add(role)
            console.log(`[v0] Auto-verified ${member.user.tag}`)
            autoVerified = true
          }
        }
      }
    }
  } catch (error) {
    if (error.code !== 50013) {
      console.error("Error tracking invite:", error.message)
    }
  }

  if (!autoVerified) {
    const blacklistHandler = require("./handlers/blacklistHandler")
    await blacklistHandler(member)
  }
})

client.login(process.env.BOT_TOKEN)
