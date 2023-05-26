import { Request, Response } from 'express';
import TipoUsuarios from '../models/tipoUsuarioModel';

export const getUsersTypes = async (req: Request, res: Response) => {
  const tipo_usuarios = await TipoUsuarios.findAll();
  res.json(tipo_usuarios);
}
