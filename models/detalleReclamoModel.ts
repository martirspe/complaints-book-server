import { DataTypes } from "sequelize";
import db from "../db/connection";

const DetalleReclamos = db.define('detalle_reclamos', {
  id_detalle: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  monto_reclamado: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  detalles_reclamo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pedido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  documento_adjunto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  respuesta: {
    type: DataTypes.STRING,
    allowNull: true
  },
  correo_enviado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 0
  }
}, { timestamps: false });

export default DetalleReclamos;
