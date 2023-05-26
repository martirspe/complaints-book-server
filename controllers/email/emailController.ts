import nodemailer from 'nodemailer';

export const sendMail = async () => {
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
    from: '"Node Foo 👻" <admin@alka.cloud>',
    to: "mrojas@alka.cloud",
    subject: "Hello ✔",
    html: "<b>Hello world?</b>"
  };

  try {
    const transport = nodemailer.createTransport(config);
    await transport.verify(); // Verify connection configuration

    const info = await transport.sendMail(message);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
}

sendMail();
