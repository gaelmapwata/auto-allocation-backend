/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'branchId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'branches',
        key: 'id',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'branchId');
  },
};
