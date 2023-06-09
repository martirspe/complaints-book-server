'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tipo_usuarios', [{
      descripcion: 'Administrador',
    },
    {
      descripcion: 'Cliente',
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tipo_usuarios', null, {});
  }
};
