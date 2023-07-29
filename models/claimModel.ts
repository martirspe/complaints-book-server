import { DataTypes } from "sequelize";
import db from "../db/connection";

const Claims = db.define('reclamos', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  t_documento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  n_documento: {
    type: DataTypes.STRING,
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
    type: DataTypes.STRING,
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  m_edad: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  t_documento_tutor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  n_documento_tutor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nombres_tutor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  apellidos_tutor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email_tutor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  celular_tutor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  t_reclamo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  t_consumo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  n_pedido: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  m_reclamado: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  detalle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pedido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  a_adjunto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resuelto: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  a_condiciones: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  estado: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1
  }
}, { timestamps: false });

export default Claims;
