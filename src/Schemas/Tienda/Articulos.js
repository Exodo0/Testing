import mongoose from "mongoose";

const TiendaSchema = new mongoose.Schema({
  GuildId: String,
  Tipo: {
    type: String,
    enum: ['legal', 'ilegal'],
    required: true
  },
  Inventario: [{
    Articulo: String,
    Precio: Number,
    Cantidad: Number,
    Identificador: String,
    FechaAgregado: {
      type: Date,
      default: Date.now
    }
  }]
});

export default mongoose.model("Tienda", TiendaSchema);