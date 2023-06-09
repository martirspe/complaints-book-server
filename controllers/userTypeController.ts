import { Request, Response } from 'express';
import UserTypes from '../models/userTypeModel';

export const getUsersTypes = async (req: Request, res: Response) => {
  const usertypes = await UserTypes.findAll();
  res.json(usertypes);
}
