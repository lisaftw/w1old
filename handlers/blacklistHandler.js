const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const fs = require("fs")
const crypto = require("crypto")

let sessions = null

function setSessions(sessionsMap) {
  sessions = sessionsMap
}

module.exports = async (member) => {
  console.log("[v0] Blacklist check triggered for:", member.user.tag)

  let blacklist = []
  if (fs.existsSync("./blacklist.json")) {
    blacklist = JSON.parse(fs.readFileSync("./blacklist.json", "utf8"))
    console.log("[v0] Loaded blacklist:", blacklist)
  }

  if (blacklist.length === 0) {
    console.log("[v0] No blacklisted servers configured")
    return
  }

  const pendingRoleId = process.env.PENDING_ROLE_ID
  if (!pendingRoleId) {
    console.log("[v0] No PENDING_ROLE_ID configured, skipping verification")
    return
  }

  const verificationChannelId = process.env.VERIFICATION_CHANNEL_ID
  if (!verificationChannelId) {
    console.log("[v0] No VERIFICATION_CHANNEL_ID configured, skipping verification")
    return
  }

  try {
    await member.roles.add(pendingRoleId)
    console.log("[v0] Assigned pending role to:", member.user.tag)

    const state = crypto.randomBytes(16).toString("hex")

    if (!sessions) {
      console.error("[v0] Sessions not initialized! Cannot create verification session.")
      return
    }

    sessions.set(state, { guildId: member.guild.id, userId: member.id })
    console.log("[v0] Created session with state:", state)
    console.log("[v0] Total sessions:", sessions.size)

    setTimeout(() => {
      sessions.delete(state)
      console.log("[v0] Session expired for state:", state)
    }, 600000)

    const verifyEmbed = new EmbedBuilder()
      .setColor("#00D9FF")
      .setTitle("🔒 Verification Required")
      .setDescription(
        `${member.user}, welcome to MM2Plug! Verify below to access other channels, join giveaways, and take part in special events with the community!`,
      )
      .setFooter({ text: "This verification link expires in 10 minutes" })
      .setTimestamp()

    const verifyButton = new ButtonBuilder()
      .setLabel("Verify Account")
      .setStyle(ButtonStyle.Link)
      .setURL(`${process.env.REDIRECT_URI.replace("/callback", "")}/verify?state=${state}`)

    const row = new ActionRowBuilder().addComponents(verifyButton)

    const verificationChannel = member.guild.channels.cache.get(verificationChannelId)
    if (verificationChannel) {
      await verificationChannel.send({ embeds: [verifyEmbed], components: [row] })
      console.log("[v0] Sent verification message to channel for:", member.user.tag)
    } else {
      console.log("[v0] Verification channel not found")
    }
  } catch (error) {
    console.error("[v0] Error checking blacklist:", error)
  }
}

module.exports.setSessions = setSessions
