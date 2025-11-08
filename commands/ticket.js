const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Ticket system management")
    .addSubcommand((subcommand) => subcommand.setName("claim").setDescription("Open a claim ticket"))
    .addSubcommand((subcommand) => subcommand.setName("support").setDescription("Open a support ticket")),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()

    if (subcommand === "claim") {
      const claimHandler = require("../handlers/claimTicketHandler")
      await claimHandler(interaction)
    } else if (subcommand === "support") {
      const supportHandler = require("../handlers/supportTicketHandler")
      await supportHandler(interaction)
    }
  },
}
