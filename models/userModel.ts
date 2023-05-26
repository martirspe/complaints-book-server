import { DataTypes } from "sequelize";
import db from "../db/connection";
import Claim from "./claimModel";

const Users = db.define('usuarios', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  tipo_documento: {
    type: DataTypes.STRING,
    allowNull: false
  },
  num_documento: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false
  },
  nombres: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  celular: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  menor_edad: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0
  },
  apoderado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  id_tipo_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estado: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1
  }
}, { timestamps: false });

Users.hasOne(Claim, { as: 'reclamos', foreignKey: 'id_usuario' });

export default Users;
