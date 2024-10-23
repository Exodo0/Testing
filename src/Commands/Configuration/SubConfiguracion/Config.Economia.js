import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import EconomiaConfig from "../../../Schemas/Economia/EcoUsuarios.js";

export default {
  subCommand: "config.economia",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, guild } = interaction;
    const logChannel = options.getChannel("log");
    const sat = options.getUser("sat");
    const salario2k = options.getRole("2k");
    const salario5k = options.getRole("5k");
    const salario7k = options.getRole("7k");
    const salario10k = options.getRole("10k");
    const salario15k = options.getRole("15k");
    const salario20k = options.getRole("20k");
    const salario25k = options.getRole("25k");

    let economiaConfig = await EconomiaConfig.findOne({ GuildId: guild.id });

    if (!economiaConfig) {
      economiaConfig = new EconomiaConfig({ GuildId: guild.id, Usuario: [] });
    }

    const satIndex = economiaConfig.Usuario.findIndex(
      (u) => u.UserId === sat.id
    );
    if (satIndex !== -1) {
      economiaConfig.Usuario[satIndex] = {
        UserId: sat.id,
        Banco: economiaConfig.Usuario[satIndex].Banco || 0,
        Sat: true,
      };
    } else {
      economiaConfig.Usuario.push({ UserId: sat.id, Banco: 0, Sat: true });
    }

    economiaConfig.Registro = logChannel.id;
    economiaConfig.Salario2k = salario2k.id;
    economiaConfig.Salario5k = salario5k.id;
    economiaConfig.Salario7k = salario7k.id;
    economiaConfig.Salario10k = salario10k.id;
    economiaConfig.Salario15k = salario15k.id;
    economiaConfig.Salario20k = salario20k.id;
    economiaConfig.Salario25k = salario25k.id;

    await economiaConfig.save();

    const confirmEmbed = new EmbedBuilder()
      .setTitle("Configuración de Economía Actualizada")
      .setThumbnail(client.user.displayAvatarURL())
      .setColor("Green")
      .setDescription(
        `La configuración para la economía del servidor ha sido ${
          economiaConfig.__v === 0 ? "creada" : "actualizada"
        } exitosamente.`
      )
      .setFields(
        {
          name: "🛠️ Canal de Logs de economía",
          value: `<#${logChannel.id}>`,
        },
        { name: "👤 Usuario SAT", value: `<@${sat.id}>` },
        { name: "2.5K", value: `<@&${salario2k.id}>` },
        { name: "5K", value: `<@&${salario5k.id}>` },
        { name: "7.5K", value: `<@&${salario7k.id}>` },
        { name: "10K", value: `<@&${salario10k.id}>` },
        { name: "15K", value: `<@&${salario15k.id}>` },
        { name: "20K", value: `<@&${salario20k.id}>` },
        { name: "25K", value: `<@&${salario25k.id}>` }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
  },
};
