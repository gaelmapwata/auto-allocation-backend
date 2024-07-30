/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'createdByUserId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    });

    await queryInterface.addColumn('users', 'deletedByUserId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    });

    await queryInterface.addColumn('users', 'validationAskedByUserId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    });

    await queryInterface.addColumn('users', 'validatedByUserId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'createdByUserId');
    await queryInterface.removeColumn('users', 'deletedByUserId');
    await queryInterface.removeColumn('users', 'validatedByUserId');
    await queryInterface.removeColumn('users', 'validationAskedByUserId');
  },
};
