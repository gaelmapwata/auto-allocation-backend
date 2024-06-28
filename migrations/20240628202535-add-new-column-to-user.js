/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'totalLoginAttempt', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn('users', 'locked', {
      type: Sequelize.BOOLEAN,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'totalLoginAttempt');
    await queryInterface.removeColumn('users', 'locked');
  },
};
