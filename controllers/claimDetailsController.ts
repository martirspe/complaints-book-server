import { Request, Response } from 'express';
import DetalleReclamos from '../models/detalleReclamoModel';

export const postClaimDetails = async (req: Request, res: Response) => {
  const { body } = req;

  try {
    const claimDetails = DetalleReclamos.build(body);
    await claimDetails.save();
    res.json(claimDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: 'Hable con el administrador.'
    })
  }
}
