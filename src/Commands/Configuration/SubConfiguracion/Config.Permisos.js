import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import Permisos from "../../../Schemas/Staff/Permisos.js";

export default {
  subCommand: "config.permisos",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, guild } = interaction;
    const comite = options.getRole("comite");
    const developer = options.getRole("developer");
    const oficinaAdm = options.getRole("oficina");
    const administrador = options.getRole("administrador");
    const community = options.getRole("community");
    const staff = options.getRole("staff");
    const moderador = options.getRole("moderador");
    const ai = options.getRole("ai");
    const rh = options.getRole("rh");
    const trial = options.getRole("trial");
    const equipoAdm = options.getRole("equipo");
    const vinculacion = options.getRole("vinculacion");
    const direccion = options.getRole("direccion");

    let permisosConfig = await Permisos.findOne({ GuildId: guild.id });

    if (permisosConfig) {
      permisosConfig.Comite = comite.id;
      permisosConfig.Developer = developer.id;
      permisosConfig.OficinaAdm = oficinaAdm.id;
      permisosConfig.Administrador = administrador.id;
      permisosConfig.ProyectManager = community.id;
      permisosConfig.HeadStaff = staff.id;
      permisosConfig.Moderador = moderador.id;
      permisosConfig.AI = ai.id;
      permisosConfig.RH = rh.id;
      permisosConfig.Trial = trial.id;
      permisosConfig.EquipoAdministrativo = equipoAdm.id;
      permisosConfig.Vinculacion = vinculacion.id;
      permisosConfig.DRVinculacion = direccion.id;

      await permisosConfig.save();
    } else {
      permisosConfig = new Permisos({
        GuildId: guild.id,
        Comite: comite.id,
        Developer: developer.id,
        OficinaAdm: oficinaAdm.id,
        Administrador: administrador.id,
        ProyectManager: community.id,
        HeadStaff: staff.id,
        Moderador: moderador.id,
        AI: ai.id,
        RH: rh.id,
        Trial: trial.id,
        EquipoAdministrativo: equipoAdm.id,
        Vinculacion: vinculacion.id,
        DRVinculacion: direccion.id,
      });

      await permisosConfig.save();
    }

    const confirmEmbed = new EmbedBuilder()
      .setTitle("Configuración de Permisos Actualizada")
      .setThumbnail(client.user.displayAvatarURL())
      .setColor("Green")
      .setDescription(
        `La configuración de permisos para los roles administrativos ha sido ${
          permisosConfig ? "actualizada" : "creada"
        } correctamente.`
      )
      .addFields(
        { name: "Comité", value: `<@&${comite.id}>`, inline: true },
        { name: "Developer", value: `<@&${developer.id}>`, inline: true },
        {
          name: "Oficina Administrativa",
          value: `<@&${oficinaAdm.id}>`,
          inline: true,
        },
        {
          name: "Administrador",
          value: `<@&${administrador.id}>`,
          inline: true,
        },
        {
          name: "Community Manager",
          value: `<@&${community.id}>`,
          inline: true,
        },
        { name: "Head Staff", value: `<@&${staff.id}>`, inline: true },
        { name: "Moderador", value: `<@&${moderador.id}>`, inline: true },
        { name: "Asuntos Internos (AI)", value: `<@&${ai.id}>`, inline: true },
        { name: "Recursos Humanos (RH)", value: `<@&${rh.id}>`, inline: true },
        { name: "Trial Mods", value: `<@&${trial.id}>`, inline: true },
        {
          name: "Equipo Administrativo",
          value: `<@&${equipoAdm.id}>`,
          inline: true,
        },
        {
          name: "Vinculación Administrativa",
          value: `<@&${vinculacion.id}>`,
          inline: true,
        },
        { name: "Dirección", value: `<@&${direccion.id}>`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
  },
};
