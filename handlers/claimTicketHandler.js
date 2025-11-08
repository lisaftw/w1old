const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js")

module.exports = async (interaction) => {
  const modal = new ModalBuilder().setCustomId("claim_modal").setTitle("Claim Ticket")

  const robloxInput = new TextInputBuilder()
    .setCustomId("roblox_username")
    .setLabel("What's your Roblox Username?")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("EX: Woldery")
    .setRequired(true)

  const emailInput = new TextInputBuilder()
    .setCustomId("email")
    .setLabel("What's your Email?")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("EX: MM2Plug@gmail.com")
    .setRequired(true)

  const itemInput = new TextInputBuilder()
    .setCustomId("item_bought")
    .setLabel("What item did you buy?")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("EX: 3x Corrupt")
    .setRequired(true)

  const row1 = new ActionRowBuilder().addComponents(robloxInput)
  const row2 = new ActionRowBuilder().addComponents(emailInput)
  const row3 = new ActionRowBuilder().addComponents(itemInput)

  modal.addComponents(row1, row2, row3)

  await interaction.showModal(modal)
}
