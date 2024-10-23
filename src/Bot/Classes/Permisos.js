import Permisos from "../../Schemas/Staff/Permisos.js";
import { EmbedBuilder } from "discord.js";

class PermisosManager {
  constructor(guildId) {
    this.guildId = guildId;
    this.permisosData = null;
    this.highRoles = [];
    this.mediumRoles = [];
  }

  async loadPermisos() {
    this.permisosData = await Permisos.findOne({ GuildId: this.guildId });
    if (!this.permisosData) {
      const noPermisosEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("⚠️ No se encontraron permisos configurados.");
      return { loaded: false, embed: noPermisosEmbed };
    }

    this.highRoles = [
      this.permisosData.Comite,
      this.permisosData.Developer,
      this.permisosData.OficinaAdm,
      this.permisosData.Administrador,
      this.permisosData.ProyectManager,
      this.permisosData.HeadStaff,
      this.permisosData.Vinculacion,
    ].filter(Boolean);

    this.mediumRoles = [
      this.permisosData.Moderador,
      this.permisosData.HeadStaff,
      this.permisosData.ProyectManager,
      this.permisosData.AI,
      this.permisosData.RH,
      this.permisosData.Trial,
      this.permisosData.EquipoAdministrativo,
    ].filter(Boolean);

    return { loaded: true };
  }

  async checkPermissions(member, levels = []) {
    const rolesUsuario = member.roles.cache.map((role) => role.id);

    const allowedRoles = [];
    if (levels.includes("high")) allowedRoles.push(...this.highRoles);
    if (levels.includes("medium")) allowedRoles.push(...this.mediumRoles);

    const tienePermiso = rolesUsuario.some((roleId) =>
      allowedRoles.includes(roleId)
    );

    if (!tienePermiso) {
      const noPermisoEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("⚠️ No tienes permiso para ejecutar este comando.");
      return { allowed: false, embed: noPermisoEmbed };
    }

    return { allowed: true };
  }
}

export default PermisosManager;
