import mongoose from "mongoose";

const EconomyUser = new mongoose.Schema({
  GuildId: String,
  Registro: String,
  RolSat: String,
  Salario2k: String,
  Salario5k: String,
  Salario7k: String,
  Salario10k: String,
  Salario15k: String,
  Salario20k: String,
  Salario25k: String,
  Usuario: [
    {
      UserId: String,
      TipoCuenta: {
        type: String,
        enum: ["personal", "gobierno"],
        default: "personal",
      },
      CuentaSalario: {
        Balance: { type: Number, default: 0 },
        Activa: { type: Boolean, default: true },
      },
      CuentaCorriente: {
        Balance: { type: Number, default: 0 },
        Activa: { type: Boolean, default: true },
      },
      CuentaGobierno: {
        Balance: { type: Number, default: 0 },
        Activa: { type: Boolean, default: false },
      },
      Efectivo: { type: Number, default: 0 },
      DineroNegro: { type: Number, default: 0 },
      Deuda: { type: Number, default: 0 },
      LastCobro: Date,
      Sat: { type: Boolean, default: false },
    },
  ],
});

export default mongoose.model("EconomyUser", EconomyUser);
