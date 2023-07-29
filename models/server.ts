import express, { Application } from 'express';
import db from '../db/connection';
import cors from 'cors';
import fileUpload from 'express-fileupload';

// Routes
import claimRoutes from '../routes/claimRoute';
import uploadsRoute from '../routes/uploadsRoute';
import emailRoute from '../routes/email/emailRoute';

// Data models
import './claimModel';

class Server {
  private app: Application;
  private port: string;
  private apiPaths = {
    claims: '/api/claims',
    uploads: '/api/uploads',
    sendmail: '/api/sendmail'
  }

  constructor() {
    this.app = express();
    this.port = process.env.PORT || '8000';
    this.dbConnection();
    this.middlewares();
    this.routes();
  }

  async dbConnection() {
    try {
      await db.authenticate();
      await db.sync();
      await db.sync({ alter: true });
      console.log('Database online.');
    } catch (error) {
      throw new Error('Failed to connect to the database.');
    }
  }

  middlewares() {
    // CORS
    this.app.use(cors());
    // Body reading
    this.app.use(express.json());
    // Public source
    this.app.use(express.static('public'));
    // Upload file
    this.app.use(fileUpload({
      useTempFiles: true,
      tempFileDir: '/tmp/'
    }));
  }

  routes() {
    this.app.use(this.apiPaths.claims, claimRoutes),
      this.app.use(this.apiPaths.uploads, uploadsRoute),
      this.app.use(this.apiPaths.sendmail, emailRoute)
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log('Server on port', this.port);
    });
  }
}

export default Server;
