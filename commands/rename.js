const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rename")
    .setDescription("Rename the current ticket channel")
    .addStringOption((option) => option.setName("name").setDescription("New name for the ticket").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const channel = interaction.channel

    if (
      !channel.name.startsWith("ticket-") &&
      !channel.name.startsWith("claim-") &&
      !channel.name.startsWith("support-")
    ) {
      return interaction.reply({ content: "This is not a ticket channel!", flags: MessageFlags.Ephemeral })
    }

    const newName = interaction.options.getString("name")
    const prefix = channel.name.startsWith("claim-") ? "claim-" : "support-"

    await channel.setName(`${prefix}${newName}`)
    await interaction.reply({ content: `Ticket renamed to ${prefix}${newName}`, flags: MessageFlags.Ephemeral })
  },
}
