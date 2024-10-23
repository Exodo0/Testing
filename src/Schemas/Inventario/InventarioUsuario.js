import mongoose from "mongoose";

const InventarioUsuario = new mongoose.Schema({
  GuildId: String,
  UserId: String,
  Inventario: [{
    Articulo: String,
    Cantidad: Number,
    Identificador: String,
    FechaCompra: Date
  }]
});

export default mongoose.model("InventarioUsuario", InventarioUsuario);