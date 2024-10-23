import mongoose from "mongoose";

const EconomyUser = new mongoose.Schema({
  GuildId: String,
  Registro: String,
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
      Banco: Number,
      Efectivo: Number,
      Sat: Boolean,
      LastCobro: Date,
      DineroNegro: Number,
      Deuda: Number,
    },
  ],
});

export default new mongoose.model("EconomyUser", EconomyUser);
