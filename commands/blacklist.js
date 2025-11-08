const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js")
const fs = require("fs")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription("Manage blacklisted servers")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a server to the blacklist")
        .addStringOption((option) =>
          option.setName("server_id").setDescription("The server ID to blacklist").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a server from the blacklist")
        .addStringOption((option) =>
          option.setName("server_id").setDescription("The server ID to remove").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) => subcommand.setName("list").setDescription("List all blacklisted servers"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()
    let blacklist = []

    if (fs.existsSync("./blacklist.json")) {
      blacklist = JSON.parse(fs.readFileSync("./blacklist.json", "utf8"))
    }

    if (subcommand === "add") {
      const serverId = interaction.options.getString("server_id")
      if (!blacklist.includes(serverId)) {
        blacklist.push(serverId)
        fs.writeFileSync("./blacklist.json", JSON.stringify(blacklist, null, 2))
        await interaction.reply({ content: `Server ${serverId} added to blacklist!`, flags: MessageFlags.Ephemeral })
      } else {
        await interaction.reply({ content: "This server is already blacklisted!", flags: MessageFlags.Ephemeral })
      }
    } else if (subcommand === "remove") {
      const serverId = interaction.options.getString("server_id")
      blacklist = blacklist.filter((id) => id !== serverId)
      fs.writeFileSync("./blacklist.json", JSON.stringify(blacklist, null, 2))
      await interaction.reply({ content: `Server ${serverId} removed from blacklist!`, flags: MessageFlags.Ephemeral })
    } else if (subcommand === "list") {
      if (blacklist.length === 0) {
        await interaction.reply({ content: "No servers are blacklisted!", flags: MessageFlags.Ephemeral })
      } else {
        await interaction.reply({
          content: `Blacklisted servers:\n${blacklist.join("\n")}`,
          flags: MessageFlags.Ephemeral,
        })
      }
    }
  },
}
