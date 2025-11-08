const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js")

module.exports = async (interaction) => {
  const modal = new ModalBuilder().setCustomId("support_modal").setTitle("Support Ticket")

  const reasonInput = new TextInputBuilder()
    .setCustomId("support_reason")
    .setLabel("Describe the reason you're contacting Support")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMinLength(10)
    .setMaxLength(1000)

  const row = new ActionRowBuilder().addComponents(reasonInput)

  modal.addComponents(row)

  await interaction.showModal(modal)
}
