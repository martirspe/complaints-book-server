import { DataTypes } from "sequelize";
import db from "../db/connection";
import Claim from "./claimModel";

const serviceTypes = db.define("tipo_bienes", {
  id_tipo_bien: {
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

serviceTypes.hasOne(Claim, { as: 'reclamos', foreignKey: 'id_tipo_bien' });

export default serviceTypes;
