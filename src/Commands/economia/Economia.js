import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("economia")
    .setDescription("💵 Revisa los comandos de economia")
    .addSubcommand((sub) =>
      sub
        .setName("añadir")
        .setDescription("💵 Agrega dinero a los usuarios")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("👤 Escoje al Usuario")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("cantidad")
            .setDescription("💲 Ingresa la cantida a otorgar")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("razon")
            .setDescription("📝 Ingresa la razon por la cual agregas")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("remover")
        .setDescription("💵 Remueve dinero a los usuarios")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("👤 Escoje al Usuario")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("cantidad")
            .setDescription("💲 Ingresa la cantida a remover")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("lugar")
            .setDescription("💳 Escoje el lugar donde agregaras el dinero")
            .addChoices(
              { name: "💵 Efectivo", value: "Efectivo" },
              { name: "🏦 Banco", value: "Banco" }
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("razon")
            .setDescription("📝 Ingresa la razon por la cual remueves")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("reiniciar")
        .setDescription("🔄️ Reinicia la economia de un usuario")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("👤 Escoje al Usuario")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("lugar")
            .setDescription("💳 Escoje el lugar donde removeras el dinero")
            .addChoices(
              { name: "💵 Efectivo", value: "Efectivo" },
              { name: "🏦 Banco", value: "Banco" }
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("razon")
            .setDescription(
              "📝 Ingresa la razon por la cual reinicias la economia del usuario"
            )
            .setRequired(true)
        )
    ),
};
