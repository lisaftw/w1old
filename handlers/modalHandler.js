const {
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js")
const fs = require("fs")
const process = require("process")

module.exports = async (interaction) => {
  if (interaction.customId === "claim_modal") {
    await handleClaimModal(interaction)
  } else if (interaction.customId === "support_modal") {
    await handleSupportModal(interaction)
  }
}

async function handleClaimModal(interaction) {
  try {
    const robloxUsername = interaction.fields.getTextInputValue("roblox_username")
    const email = interaction.fields.getTextInputValue("email")
    const itemBought = interaction.fields.getTextInputValue("item_bought")

    const guild = interaction.guild
    const ticketCategory = guild.channels.cache.get(process.env.TICKET_CATEGORY_ID)

    if (!ticketCategory) {
      console.log("[v0] TICKET_CATEGORY_ID:", process.env.TICKET_CATEGORY_ID)
      console.log(
        "[v0] Available categories:",
        guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).map((c) => `${c.name}: ${c.id}`),
      )
      return interaction.reply({
        content: "Ticket category not found! Please make sure TICKET_CATEGORY_ID is set correctly in .env",
        flags: MessageFlags.Ephemeral,
      })
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const ticketChannel = await guild.channels.create({
      name: `claim-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: ticketCategory.id,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels,
          ],
        },
      ],
    })

    console.log("[v0] Claim ticket channel created:", ticketChannel.id)

    const embed = new EmbedBuilder()
      .setColor("#00D9FF")
      .setTitle("🎁 Claim Ticket")
      .addFields(
        { name: "What's your Roblox Username?", value: robloxUsername, inline: false },
        { name: "What's your Email?", value: email, inline: false },
        { name: "What item did you buy?", value: itemBought, inline: false },
      )
      .setDescription("Please wait for a Claim Manager to assist you.")
      .setTimestamp()
      .setFooter({ text: `Ticket created by ${interaction.user.tag}` })

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("claim_ticket").setLabel("Claim").setEmoji("✅").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("delete_ticket").setLabel("Delete").setEmoji("🗑️").setStyle(ButtonStyle.Danger),
    )

    try {
      const message = await ticketChannel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] })
      console.log("[v0] Ticket message sent successfully:", message.id)
    } catch (sendError) {
      console.error("[v0] Error sending message to ticket channel:", sendError)
      throw sendError
    }

    const ticketData = {
      channelId: ticketChannel.id,
      userId: interaction.user.id,
      type: "claim",
      data: { robloxUsername, email, itemBought },
      createdAt: new Date().toISOString(),
    }

    saveTicketData(ticketData)

    await interaction.editReply({ content: `Your claim ticket has been created: ${ticketChannel}` })
  } catch (error) {
    console.error("[v0] Error creating claim ticket:", error)
    if (interaction.deferred) {
      await interaction.editReply({ content: "An error occurred while creating your ticket. Please try again." })
    } else {
      await interaction.reply({
        content: "An error occurred while creating your ticket. Please try again.",
        flags: MessageFlags.Ephemeral,
      })
    }
  }
}

async function handleSupportModal(interaction) {
  try {
    const supportReason = interaction.fields.getTextInputValue("support_reason")

    const guild = interaction.guild
    const ticketCategory = guild.channels.cache.get(process.env.TICKET_CATEGORY_ID)

    if (!ticketCategory) {
      console.log("[v0] TICKET_CATEGORY_ID:", process.env.TICKET_CATEGORY_ID)
      console.log(
        "[v0] Available categories:",
        guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).map((c) => `${c.name}: ${c.id}`),
      )
      return interaction.reply({
        content: "Ticket category not found! Please make sure TICKET_CATEGORY_ID is set correctly in .env",
        flags: MessageFlags.Ephemeral,
      })
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const ticketChannel = await guild.channels.create({
      name: `support-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: ticketCategory.id,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels,
          ],
        },
      ],
    })

    console.log("[v0] Support ticket channel created:", ticketChannel.id)

    const embed = new EmbedBuilder()
      .setColor("#00D9FF")
      .setTitle("🛠️ Support Ticket")
      .addFields({ name: "Describe the reason you're contacting Support", value: supportReason, inline: false })
      .setDescription("Please wait for the moderators to check the ticket.")
      .setTimestamp()
      .setFooter({ text: `Ticket created by ${interaction.user.tag}` })

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("claim_ticket").setLabel("Claim").setEmoji("✅").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("delete_ticket").setLabel("Delete").setEmoji("🗑️").setStyle(ButtonStyle.Danger),
    )

    try {
      const message = await ticketChannel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] })
      console.log("[v0] Ticket message sent successfully:", message.id)
    } catch (sendError) {
      console.error("[v0] Error sending message to ticket channel:", sendError)
      throw sendError
    }

    const ticketData = {
      channelId: ticketChannel.id,
      userId: interaction.user.id,
      type: "support",
      data: { supportReason },
      createdAt: new Date().toISOString(),
    }

    saveTicketData(ticketData)

    await interaction.editReply({ content: `Your support ticket has been created: ${ticketChannel}` })
  } catch (error) {
    console.error("[v0] Error creating support ticket:", error)
    if (interaction.deferred) {
      await interaction.editReply({ content: "An error occurred while creating your ticket. Please try again." })
    } else {
      await interaction.reply({
        content: "An error occurred while creating your ticket. Please try again.",
        flags: MessageFlags.Ephemeral,
      })
    }
  }
}

function saveTicketData(ticketData) {
  let tickets = {}
  if (fs.existsSync("./tickets.json")) {
    tickets = JSON.parse(fs.readFileSync("./tickets.json", "utf8"))
  }
  tickets[ticketData.channelId] = ticketData
  fs.writeFileSync("./tickets.json", JSON.stringify(tickets, null, 2))
}
