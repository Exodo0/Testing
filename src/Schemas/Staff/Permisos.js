import mongoose from "mongoose";

const PermisosSchema = new mongoose.Schema({
  GuildId: String,
  Comite: String,
  Developer: String,
  OficinaAdm: String,
  Administrador: String,
  ProyectManager: String,
  EquipoAdministrativo: String,
  HeadStaff: String,
  Moderador: String,
  DRVinculacion: String,
  AI: String,
  RH: String,
  Vinculacion: String,
  Trial: String,
});

export default new mongoose.model("Permisos", PermisosSchema);
