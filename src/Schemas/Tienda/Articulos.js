import mongoose from "mongoose";

const Tienda = new mongoose.Schema({
  GuildId: String,
  Tipo: {
    type: String,
    enum: ["legal", "ilegal"],
    required: true,
  },
  Inventario: [
    {
      Articulo: String,
      Cantidad: Number,
      Precio: Number,
      Identificador: String,
    },
  ],
});

export default new mongoose.model("Tienda", Tienda);
