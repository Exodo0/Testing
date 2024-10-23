import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("🛠️ Revisa el estado del bot"),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const shard = interaction.client.shard;
    const shardId = shard ? shard.ids[0] : "N/A";
    const ping = interaction.client.ws.ping;

    const pingEmoji =
      ping <= 180
        ? "<:PingGood:1294343532466933851>"
        : "<:vtlvdiscord:1294343560086294549>";

    const totalUsers = await interaction.client.shard
      .broadcastEval((client) => client.users.cache.size)
      .then((results) => results.reduce((acc, users) => acc + users, 0));

    const botPing = Math.abs(Date.now() - interaction.createdTimestamp);

    const botPingEmoji =
      botPing <= 180
        ? "<:PingGood:1294343532466933851>"
        : "<:vtlvdiscord:1294343560086294549>";

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setThumbnail(client.user.displayAvatarURL())
      .setTitle("📶 Estado del Bot")
      .setFields(
        { name: "Latencia de Discord", value: `${ping}ms ${pingEmoji}` },
        { name: "Shard", value: `<:Shard:1294343522161528832> #${shardId}` },
        { name: "Usuarios Totales", value: `${totalUsers}` },
        {
          name: "Ping del Bot",
          value: `${botPing}ms ${botPingEmoji}`,
        }
      )
      .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
