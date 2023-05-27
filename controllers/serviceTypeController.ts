import { Request, Response } from 'express';
import TipoBienes from '../models/serviceTypeModel';

export const getServiceTypes = async (req: Request, res: Response) => {
  const tipo_bienes = await TipoBienes.findAll();
  res.json(tipo_bienes);
}
