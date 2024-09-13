/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'isAuthorized', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('transactions', 'isAuthorized');
  },
};
