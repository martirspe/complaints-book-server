import { DataTypes } from "sequelize";
import db from "../db/connection";
import DetalleReclamos from "./detalleReclamoModel";

const Claims = db.define('reclamos', {
  id_reclamo: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  estado: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1
  }
}, { timestamps: false });

Claims.hasOne(DetalleReclamos, { as: 'detalle_reclamos', foreignKey: 'id_reclamo' });

export default Claims;
