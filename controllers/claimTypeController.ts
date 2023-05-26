import { Request, Response } from 'express';
import TipoReclamos from '../models/tipoReclamoModel';

export const getClaimTypes = async (req: Request, res: Response) => {
  const tipo_reclamo = await TipoReclamos.findAll();
  res.json(tipo_reclamo);
}
