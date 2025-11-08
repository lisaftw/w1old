const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  MessageFlags,
} = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Setup ticket panels in two separate channels")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("claims-channel")
        .setDescription("Channel for claims ticket panel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("support-channel")
        .setDescription("Channel for support ticket panel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),
  async execute(interaction) {
    const claimsChannel = interaction.options.getChannel("claims-channel")
    const supportChannel = interaction.options.getChannel("support-channel")

    const claimEmbed = new EmbedBuilder()
      .setColor("#00D9FF")
      .setTitle("🎁 Claims")
      .setDescription(
        "Need to claim your reward or order? Open a ticket here and provide the necessary details. Our team will review your claim as soon as possible!",
      )
      .setTimestamp()

    const claimRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create_claim")
        .setLabel("Create Claim Ticket")
        .setEmoji("🎁")
        .setStyle(ButtonStyle.Primary),
    )

    const supportEmbed = new EmbedBuilder()
      .setColor("#00D9FF")
      .setTitle("🛠️ Support")
      .setDescription(
        "Need help or have a question? Create a support ticket and our staff will assist you shortly. Please describe your issue clearly for faster support!",
      )
      .setTimestamp()

    const supportRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create_support")
        .setLabel("Create Support Ticket")
        .setEmoji("🛠️")
        .setStyle(ButtonStyle.Secondary),
    )

    await claimsChannel.send({ embeds: [claimEmbed], components: [claimRow] })
    await supportChannel.send({ embeds: [supportEmbed], components: [supportRow] })

    await interaction.reply({
      content: `Ticket panels created!\n🎁 Claims: ${claimsChannel}\n🛠️ Support: ${supportChannel}`,
      flags: MessageFlags.Ephemeral,
    })
  },
}
