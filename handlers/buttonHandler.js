const { EmbedBuilder, MessageFlags } = require("discord.js")
const claimTicketHandler = require("./claimTicketHandler")
const supportTicketHandler = require("./supportTicketHandler")
const fs = require("fs")

module.exports = async (interaction) => {
  if (interaction.customId === "create_claim") {
    await claimTicketHandler(interaction)
  } else if (interaction.customId === "create_support") {
    await supportTicketHandler(interaction)
  } else if (interaction.customId === "claim_ticket") {
    await handleClaimButton(interaction)
  } else if (interaction.customId === "delete_ticket") {
    const deleteHandler = require("./deleteTicketHandler")
    await deleteHandler(interaction)
  }
}

async function handleClaimButton(interaction) {
  if (!interaction.member.permissions.has("ManageChannels")) {
    return interaction.reply({ content: "You do not have permission to claim tickets!", flags: MessageFlags.Ephemeral })
  }

  const embed = new EmbedBuilder()
    .setColor("#00D9FF")
    .setDescription(`✅ Ticket claimed by ${interaction.user}`)
    .setTimestamp()

  await interaction.reply({ embeds: [embed] })

  const logChannelId = process.env.LOG_CHANNEL_ID
  if (logChannelId) {
    const logChannel = interaction.guild.channels.cache.get(logChannelId)
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor("#00D9FF")
        .setTitle("Ticket Claimed")
        .addFields(
          { name: "Ticket", value: `${interaction.channel}`, inline: true },
          { name: "Claimed By", value: `${interaction.user.tag}`, inline: true },
        )
        .setTimestamp()
      await logChannel.send({ embeds: [logEmbed] })
    }
  }
}
