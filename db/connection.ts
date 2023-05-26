import { Sequelize } from 'sequelize';

const db = new Sequelize('complaints-book', 'root', 'albz9131@M', {
  host: 'localhost',
  dialect: 'mysql',
  // logging: false,

});

export default db;
