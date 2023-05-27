import express, { Application } from 'express';
import db from '../db/connection';
import cors from 'cors';

// Routes
import userRoutes from '../routes/userRoute';
import claimRoutes from '../routes/claimRoute';
import userTypeRoute from '../routes/userTypeRoute';
import claimTypeRoute from '../routes/claimTypeRoute';
import serviceTypeRoute from '../routes/serviceTypeRoute';
import claimDetailsRoute from '../routes/claimDetailsRoute';
import emailRoute from '../routes/email/emailRoute';

// Data models
import './claimModel';
import './claimDetailsModel';
import './serviceTypeModel';
import './claimTypeModel';
import './userTypeModel';
import './userModel';

class Server {
  private app: Application;
  private port: string;
  private apiPaths = {
    claims: '/api/claims',
    users: '/api/users',
    userTypes: '/api/user_types',
    claimTypes: '/api/claim_types',
    claimDetails: '/api/claim_details',
    serviceTypes: '/api/service_types',
    sendMail: '/api/sendmail'
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
      // await db.sync({ force: true });
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
  }

  routes() {
    this.app.use(this.apiPaths.claims, claimRoutes),
      this.app.use(this.apiPaths.users, userRoutes),
      this.app.use(this.apiPaths.userTypes, userTypeRoute),
      this.app.use(this.apiPaths.claimTypes, claimTypeRoute),
      this.app.use(this.apiPaths.claimDetails, claimDetailsRoute),
      this.app.use(this.apiPaths.serviceTypes, serviceTypeRoute),
      this.app.use(this.apiPaths.sendMail, emailRoute)
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log('Server on port', this.port);
    });
  }
}

export default Server;
