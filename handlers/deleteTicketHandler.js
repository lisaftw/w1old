const { EmbedBuilder, MessageFlags } = require("discord.js")
const fs = require("fs")

module.exports = async (interaction) => {
  const channel = interaction.channel

  if (!channel.name.startsWith("claim-") && !channel.name.startsWith("support-")) {
    return interaction.reply({ content: "This is not a ticket channel!", flags: MessageFlags.Ephemeral })
  }

  if (!interaction.member.permissions.has("ManageChannels")) {
    return interaction.reply({ content: "Only staff can delete tickets!", flags: MessageFlags.Ephemeral })
  }

  await interaction.reply({ content: "Saving transcript and deleting ticket...", flags: MessageFlags.Ephemeral })

  let tickets = {}
  if (fs.existsSync("./tickets.json")) {
    tickets = JSON.parse(fs.readFileSync("./tickets.json", "utf8"))
  }

  const ticketData = tickets[channel.id]

  if (!ticketData) {
    await channel.delete()
    return
  }

  const messages = await channel.messages.fetch({ limit: 100 })
  const transcript = messages
    .reverse()
    .map((msg) => {
      return `[${msg.createdAt.toISOString()}] ${msg.author.tag}: ${msg.content}`
    })
    .join("\n")

  const transcriptBuffer = Buffer.from(transcript, "utf-8")

  const user = await interaction.client.users.fetch(ticketData.userId)
  const ticketCreator = user

  const transcriptEmbed = new EmbedBuilder()
    .setColor("#00D9FF")
    .setTitle("Ticket Closed")
    .setDescription(`Your ticket has been closed. Here is the transcript.`)
    .addFields(
      { name: "Ticket Type", value: ticketData.type, inline: true },
      { name: "Closed By", value: interaction.user.tag, inline: true },
    )
    .setTimestamp()

  try {
    await ticketCreator.send({
      embeds: [transcriptEmbed],
      files: [{ attachment: transcriptBuffer, name: `transcript-${channel.name}.txt` }],
    })
  } catch (error) {
    console.error("Could not send DM to user:", error)
  }

  const logChannelId = process.env.LOG_CHANNEL_ID
  if (logChannelId) {
    const logChannel = interaction.guild.channels.cache.get(logChannelId)
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor("#00D9FF")
        .setTitle("Ticket Deleted")
        .addFields(
          { name: "Ticket", value: channel.name, inline: true },
          { name: "Ticket Type", value: ticketData.type, inline: true },
          { name: "Created By", value: ticketCreator.tag, inline: true },
          { name: "Deleted By", value: interaction.user.tag, inline: true },
        )
        .setTimestamp()

      await logChannel.send({
        embeds: [logEmbed],
        files: [{ attachment: transcriptBuffer, name: `transcript-${channel.name}.txt` }],
      })
    }
  }

  delete tickets[channel.id]
  fs.writeFileSync("./tickets.json", JSON.stringify(tickets, null, 2))

  await channel.delete()
}
