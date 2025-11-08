const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete the current ticket")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const deleteHandler = require("../handlers/deleteTicketHandler")
    await deleteHandler(interaction)
  },
}
