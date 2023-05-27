import { DataTypes } from "sequelize";
import db from "../db/connection";
import User from "./userModel";

const UserTypes = db.define('tipo_usuarios', {
  id_tipo_usuario: {
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

UserTypes.hasMany(User, { as: 'usuarios', foreignKey: 'id_tipo_usuario' });

export default UserTypes;
