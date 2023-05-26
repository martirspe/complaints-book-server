import { Request, Response } from 'express';
import Users from '../models/userModel';

export const getUsers = async (req: Request, res: Response) => {
  const users = await Users.findAll();
  res.json(users);
}

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const users = await Users.findByPk(id);

  if (users) {
    res.json(users);
  } else {
    res.status(404).json({
      msg: `No existe un usuario con el ID: ${id}`
    })
  }
}

export const postUsers = async (req: Request, res: Response) => {
  const { body } = req;

  try {
    const users = Users.build(body);
    await users.save();
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: 'Hable con el administrador.'
    })
  }
}

export const putUsers = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { body } = req;

  try {
    const users = await Users.findByPk(id);
    if (!users) {
      return res.status(404).json({
        msg: `No existe un usuario con el ID: ${id}`
      })
    }
    await users.update(body);
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: 'Hable con el administrador.'
    })
  }
}

export const deleteUsers = async (req: Request, res: Response) => {
  const { id } = req.params;
  const users = await Users.findByPk(id);

  if (!users) {
    return res.status(404).json({
      msg: `No existe un usuario con el ID: ${id}`
    })
  }

  // Actualiza el estado del registro en la db.
  await users.update({ estado: 0 })

  // Elimina el registro de la db.
  // await users.destroy();

  res.json(users);
}
