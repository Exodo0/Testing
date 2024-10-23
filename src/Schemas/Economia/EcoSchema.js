import mongoose from "mongoose";

const EcoSchema = new mongoose.Schema({
  GuildId: String,
  Registro: String,
});

export default new mongoose.model("EcoSchemas", EcoSchema);
