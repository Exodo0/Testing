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
              TipoCuenta: "personal",
              CuentaSalario: { Balance: 0, Activa: true },
              CuentaCorriente: { Balance: 0, Activa: true },
              CuentaGobierno: { Balance: 0, Activa: false },
              Efectivo: 0,
              DineroNegro: 0,
              Deuda: 0,
              LastCobro: null,
              Sat: false,
            },
          },
        },
        { new: true, upsert: true }
      ).catch((error) => console.error("Error guardando el balance:", error));
    }

    const userBalance = isSat
      ? Balance.Usuario.find((u) => u.Sat === true)
      : Balance.Usuario.find((u) => u.UserId === userId);

    // Si es cuenta SAT, limpiar campos innecesarios
    if (userBalance && userBalance.Sat) {
      userBalance.CuentaSalario = undefined;
      userBalance.CuentaCorriente = undefined;
      userBalance.Efectivo = undefined;
      userBalance.DineroNegro = undefined;
      userBalance.Deuda = undefined;
      userBalance.LastCobro = undefined;
    }

    return userBalance;
  };
};
