import { Request, Response } from 'express';
import ClaimTypes from '../models/claimTypeModel';

export const getClaimTypes = async (req: Request, res: Response) => {
  const claimtypes = await ClaimTypes.findAll();
  res.json(claimtypes);
}
