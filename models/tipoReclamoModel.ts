import { DataTypes } from "sequelize";
import db from "../db/connection";
import Claim from "./claimModel";

const TipoReclamos = db.define('tipo_reclamos', {
  id_tipo_reclamo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: false });

TipoReclamos.hasOne(Claim, { as: 'reclamos', foreignKey: 'id_tipo_reclamo' });

export default TipoReclamos;
