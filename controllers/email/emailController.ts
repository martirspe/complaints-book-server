import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

export const sendMail = async (req: Request, res: Response) => {
  const data = req.body;

  const config = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'rosonoem@gmail.com',
      pass: 'joqdciqrfinxnnop'
    }
  };

  const message = {
    from: `${data.from}`,
    to: `${data.to}`,
    subject: `${data.subject}`,
    html: `${data.html}`,
  };

  try {
    const transport = nodemailer.createTransport(config);
    const info = await transport.sendMail(message);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }

}