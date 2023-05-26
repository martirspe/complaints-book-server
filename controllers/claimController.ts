import { Request, Response } from 'express';
import Claims from '../models/claimModel';

export const getClaims = async (req: Request, res: Response) => {
  const claims = await Claims.findAll();
  res.json(claims);
}

export const getClaim = async (req: Request, res: Response) => {
  const { id } = req.params;
  const claim = await Claims.findByPk(id);

  if (claim) {
    res.json(claim);
  } else {
    res.status(404).json({
      msg: `No existe un reclamo con el ID: ${id}`
    })
  }
}

export const postClaim = async (req: Request, res: Response) => {
  const { body } = req;

  try {
    const claim = Claims.build(body);
    await claim.save();
    res.json(claim);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: 'Hable con el administrador.'
    })
  }
}

export const putClaim = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { body } = req;

  try {
    const claim = await Claims.findByPk(id);
    if (!claim) {
      return res.status(404).json({
        msg: `No existe un reclamo con el ID: ${id}`
      })
    }
    await claim.update(body);
    res.json(claim);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: 'Hable con el administrador.'
    })
  }
}

export const deleteClaim = async (req: Request, res: Response) => {
  const { id } = req.params;
  const claim = await Claims.findByPk(id);

  if (!claim) {
    return res.status(404).json({
      msg: `No existe un reclamo con el ID: ${id}`
    })
  }

  // Actualiza el estado del registro en la db.
  await claim.update({ estado: 0 })

  // Elimina el registro de la db.
  // await claim.destroy();

  res.json(claim);
}
