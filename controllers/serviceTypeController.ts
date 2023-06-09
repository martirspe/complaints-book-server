import { Request, Response } from 'express';
import ServiceTypes from '../models/serviceTypeModel';

export const getServiceTypes = async (req: Request, res: Response) => {
  const servicetypes = await ServiceTypes.findAll();
  res.json(servicetypes);
}
