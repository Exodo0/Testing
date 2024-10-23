import EcoUsuarios from "../Schemas/Economia/EcoUsuarios.js";

export default (client) => {
  client.FetchBalance = async (userId, guildId, isSat = false) => {
    let Balance = await EcoUsuarios.findOne({
      GuildId: guildId,
      ...(isSat ? { "Usuario.Sat": true } : { "Usuario.UserId": userId }),
    });

    if (!Balance) {
      if (isSat) {
        return null;
      }
      Balance = await EcoUsuarios.findOneAndUpdate(
        { GuildId: guildId },
        {
          $push: {
            Usuario: {
              UserId: userId,
              Banco: 0,
              Efectivo: 0,
              LastCobro: null,
              DineroNegro: 0,
              Deuda: 0,
            },
          },
        },
        { new: true, upsert: true }
      ).catch((error) => console.error("Error guardando el balance:", error));
    }

    const userBalance = isSat
      ? Balance.Usuario.find((u) => u.Sat === true)
      : Balance.Usuario.find((u) => u.UserId === userId);

    return userBalance;
  };
};
