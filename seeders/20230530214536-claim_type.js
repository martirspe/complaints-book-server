'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tipo_reclamos', [{
      descripcion: 'Queja',
    },
    {
      descripcion: 'Reclamo',
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tipo_reclamos', null, {});
  }
};
