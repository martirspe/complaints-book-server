import { Request, Response } from 'express';
import ClaimDetails from '../models/claimDetailsModel';

export const postClaimDetails = async (req: Request, res: Response) => {
  const { body } = req;

  try {
    const claimdetails = ClaimDetails.build(body);
    await claimdetails.save();
    res.json(claimdetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: 'Hable con el administrador.'
    })
  }
}
