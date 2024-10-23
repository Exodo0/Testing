import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("📂 Despliega configuraciones al servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("gulags")
        .setDescription("📂 Configura el sistema de Gulags")
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("📂 Donde enviare el log de cada gulag")
            .addChannelTypes(
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
              ChannelType.GuildForum
            )
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("gulag")
            .setDescription("📂 Ingresa el rol que Otorgare")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("verificacion")
        .setDescription("📂 Configura el sistema de Verificacion")
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("📂 Agrega el canal donde se verifican usuarios")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("ciudadano")
            .setDescription(
              "📂 Ingresa el rol de ciudadano que otorgare despues"
            )
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("indocumentado")
            .setDescription(
              "📂 Ingresa el rol de indocumentado que otorgare despues"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("entradas")
        .setDescription("📂 Configura el sistema de Bienvenidas")
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("📂 Ingresa el canal donde enviare la notificacion")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("unverify")
            .setDescription("📂 Ingresa el rol de unverify que Agregare")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("whitelist")
            .setDescription("📂 Ingresa el rol de WhiteList que Agregare")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("arrestos")
        .setDescription("📂 Configura el sistema de Arrestos")
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("📂 Donde enviare el registro de Arrestos")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )

        .addRoleOption((option) =>
          option
            .setName("prision")
            .setDescription("📂 Agrega el rol asignado Prision")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("permiso")
            .setDescription("📂 Ingresa el rol permitido para usarlo")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("multas")
        .setDescription("📂 Configura el sistema de Multas")
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("📂 Ingresa donde enviare el registro de multas")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("permiso")
            .setDescription("📂 Ingresa el rol permitido para usarlo")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("calificaciones")
        .setDescription("📂 Configura el sistema de Calificaciones")
        .addChannelOption((option) =>
          option
            .setName("registro")
            .setDescription(
              "📂 Ingresa donde enviare los registros de calificaciones"
            )
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("api")
        .setDescription("📂 Configura el sistema de API-Keys ERLC")
        .addStringOption((option) =>
          option
            .setName("servidor")
            .setDescription("📂 Ingresa a que servidor voy agregar")
            .setRequired(true)
            .addChoices(
              { name: "Servidor A", value: "a" },
              { name: "Servidor B", value: "b" },
              { name: "Servidor C", value: "c" },
              { name: "Servidor D", value: "d" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("key")
            .setDescription("📂 Ingresa el API-Key del servidor seleccionado")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("registro")
            .setDescription("📂 Ingresa donde enviare el log de comandos")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("usuarios")
            .setDescription("📂 Ingresa el VC donde se mostraran Usuarios")
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("protocolos")
        .setDescription("📂 Configura el sistema de Protocolos")
        .addChannelOption((option) =>
          option
            .setName("panel")
            .setDescription("📂 Ingresa donde enviare el panel")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("registro")
            .setDescription("📂 Ingresa donde enviare el registro")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("vc-a")
            .setDescription("📂 Ingresa el VC del Servidor A")
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)
        )

        .addChannelOption((option) =>
          option
            .setName("vc-b")
            .setDescription("📂 Ingresa el VC del Servidor B")
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("vc-c")
            .setDescription("📂 Ingresa el VC del Servidor C")
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("vc-d")
            .setDescription("📂 Ingresa el VC del Servidor D")
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("estado")
        .setDescription("📂 Configura el sistema de Estado de los Servidores")
        .addChannelOption((option) =>
          option
            .setName("panel")
            .setDescription("📂 Ingresa donde enviare el panel")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("notificacion")
            .setDescription("📂 Ingresa donde enviare los muestreos")
            .addChannelTypes(ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("registro")
            .setDescription("📂 Ingresa donde enviare el registro")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("tickets")
        .setDescription("📂 Configura el sistema de Tickets")
        .addChannelOption((option) =>
          option
            .setName("panel")
            .setDescription("📂 Ingresa donde enviare el panel de tickets")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("registro")
            .setDescription("📂 Ingresa Donde enviare los logs de tickets")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("soporte")
            .setDescription("📂 Ingresa la categoria de soporte tecnico")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("peticion-rol")
            .setDescription("📂 Ingresa la categoria para peticiones de rol")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("servicios")
            .setDescription("📂 Ingresa la categoria para servicios de MXRP")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("reporte-usuarios")
            .setDescription("📂 Ingresa la categoria para reportes de usuarios")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("warns")
            .setDescription(
              "📂 Ingresa la categoria para solicitudes de remoción de warns"
            )
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("solicitar-ck")
            .setDescription("📂 Ingresa la categoria para solicitudes de CK")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("quejas")
            .setDescription(
              "📂 Ingresa la categoria para quejas generales/preguntas"
            )
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("reporte-staff")
            .setDescription("📂 Ingresa la categoria para reportes de staff")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("remover-rol")
            .setDescription(
              "📂 Ingresa la categoria para solicitudes de remoción de rol"
            )
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("otros")
            .setDescription("📂 Ingresa la categoria para otros temas")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("diseñadores")
            .setDescription("📂 Ingresa la categoria para diseñadores")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("reclamar")
            .setDescription(
              "📂 Ingresa la categoria para reclamar recompensas/robux"
            )
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("compras")
            .setDescription("📂 Ingresa la categoria para compras")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("compras-irl")
            .setDescription("📂 Ingresa la categoria para compras IRL")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("robos")
            .setDescription("📂 Ingresa la categoria para robos de MXRP")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("liverys")
            .setDescription(
              "📂 Ingresa la categoria para solicitudes de liverys"
            )
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("faccionario")
            .setDescription(
              "📂 Ingresa la categoria para solicitudes de faccionario"
            )
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("soporte-prioritario")
            .setDescription(
              "📂 Ingresa la categoria para solicitudes de Soporte prioritario"
            )
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("warns")
        .setDescription("🔗 Configura los warns administrativos")
        .addChannelOption((option) =>
          option
            .setName("registro")
            .setDescription("📁 Donde guardare los registros de los warns")
            .addChannelTypes(ChannelType.GuildForum)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("permisos")
        .setDescription("📂 Configura los roles de tipo administrativo")
        .addRoleOption((option) =>
          option
            .setName("comite")
            .setDescription("📂 Selecciona el rol para Comité")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("developer")
            .setDescription("📂 Selecciona el rol para Developer")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("oficina")
            .setDescription("📂 Selecciona el rol para Oficina Administrativa")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("administrador")
            .setDescription("📂 Selecciona el rol para Administrador")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("community")
            .setDescription("📂 Selecciona el rol para Community Manager")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("staff")
            .setDescription("📂 Selecciona el rol para Head Staff")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("moderador")
            .setDescription("📂 Selecciona el rol para Moderador")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("ai")
            .setDescription("📂 Selecciona el rol para Asuntos Internos")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("rh")
            .setDescription("📂 Selecciona el rol para Recursos Humanos")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("trial")
            .setDescription("📂 Selecciona el rol para Trial Mods")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("equipo")
            .setDescription("📂 Selecciona el rol para Equipo Administrativo")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("vinculacion")
            .setDescription(
              "📂 Selecciona el rol para Vinculacion Administrativa"
            )
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("direccion")
            .setDescription(
              "📂 Selecciona el rol para Vinculacion Administrativa"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("jornadas")
        .setDescription("📂 Configura el sistema de jornadas")
        .addChannelOption((option) =>
          option
            .setName("registro")
            .setDescription("📂 Escoje donde mandare el log de Jornadas")
            .addChannelTypes(
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
              ChannelType.GuildForum
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription(
              "📁 Selecciona el canal donde enviare el staff activo"
            )
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("suscripciones")
        .setDescription("📂 Configura el sistema de suscripciones")
        .addRoleOption((option) =>
          option
            .setName("rol")
            .setDescription("📂 Escoje el rol de MXRP Pass")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("twitter")
        .setDescription("📂 Configura el sistema de tweets")
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("📂 Escoje donde enviare los tweets")
            .addChannelTypes(ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("alertas")
        .setDescription("📂 Configura el sistema de Alertas de los Servidores")
        .addChannelOption((option) =>
          option
            .setName("panel")
            .setDescription("📂 Ingresa donde enviare el panel")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("notificacion")
            .setDescription("📂 Ingresa donde enviare los muestreos")
            .addChannelTypes(ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("registro")
            .setDescription("📂 Ingresa donde enviare el registro")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("narco")
        .setDescription(
          "📁 Configura el canal donde se enviaran todos los anuncios del narco"
        )
        .addChannelOption((option) =>
          option
            .setName("notificacion")
            .setDescription("📁 Donde estaran los narco blog")
            .addChannelTypes(ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("registro")
            .setDescription("📁 Donde estaran los registros de narco blog")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("facciones")
        .setDescription("📁 Configura el entorno de facciones")
        .addRoleOption((option) =>
          option
            .setName("permiso")
            .setDescription(
              "📁 Configura el permiso que solo podra Publicar Empresas, etc"
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("judicial")
            .setDescription("🔍 Donde enviare las notificaciones de cada rama")
            .addChannelTypes(
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
              ChannelType.GuildForum
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("militar")
            .setDescription("🔍 Donde enviare las notificaciones de cada rama")
            .addChannelTypes(
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
              ChannelType.GuildForum
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("policial")
            .setDescription("🔍 Donde enviare las notificaciones de cada rama")
            .addChannelTypes(
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
              ChannelType.GuildForum
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("medica")
            .setDescription("🔍 Donde enviare las notificaciones de cada rama")
            .addChannelTypes(
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
              ChannelType.GuildForum
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("investigativa")
            .setDescription("🔍 Donde enviare las notificaciones de cada rama")
            .addChannelTypes(
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
              ChannelType.GuildForum
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("tecnica")
            .setDescription("🔍 Donde enviare las notificaciones de cada rama")
            .addChannelTypes(
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
              ChannelType.GuildForum
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("proteccion")
            .setDescription("🔍 Donde enviare las notificaciones de cada rama")
            .addChannelTypes(
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
              ChannelType.GuildForum
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("legislativa")
            .setDescription("🔍 Donde enviare las notificaciones de cada rama")
            .addChannelTypes(
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
              ChannelType.GuildForum
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("empresa-ilegal")
            .setDescription(
              "🔍 Donde enviare las notificaciones de nuevas empresas ilegales"
            )
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("empresa")
            .setDescription(
              "🔍 Donde enviare las notificaciones de nuevas empresas"
            )
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("periodicos")
        .setDescription("📰 Ingresa los datos para los periodicos")
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("📰 Ingresa el canal donde enviare las noticias")
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
              ChannelType.GuildForum
            )
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("reportero")
            .setDescription("🤓 Ingresa el rol que solo enviara noticias")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("televisa")
            .setDescription("🤓 Ingresa el rol que solo enviara noticias")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("ck")
        .setDescription("Configura el canal donde enviare los CK")
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("📰 Ingresa el canal donde enviare los CK")
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
              ChannelType.GuildForum
            )
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("economia")
        .setDescription("🛠️ Configura los registros para la economia")
        .addChannelOption((option) =>
          option
            .setName("log")
            .setDescription(
              "🛠️ Donde enviare el registro al Agregarse o Remover dinero"
            )
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("sat")
            .setDescription("👤 Selecciona la cuenta que recaudara impuestos")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("2k")
            .setDescription("📂 Ingresa el salario marcado como: 2.5K")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("5k")
            .setDescription("📂 Ingresa el salario marcado como: 5K")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("7k")
            .setDescription("📂 Ingresa el salario marcado como: 7.5K")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("10k")
            .setDescription("📂 Ingresa el salario marcado como: 10K")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("15k")
            .setDescription("📂 Ingresa el salario marcado como: 15K")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("20k")
            .setDescription("📂 Ingresa el salario marcado como: 20K")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("25k")
            .setDescription("📂 Ingresa el salario marcado como: 25K")
            .setRequired(true)
        )
    ),
};
