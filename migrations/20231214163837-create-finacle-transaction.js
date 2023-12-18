/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('finacle_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      stan: {
        type: Sequelize.INTEGER,
      },
      tranDateTime: {
        type: Sequelize.DATE,
      },
      tranAmt: {
        allowNull: false,
        type: Sequelize.DECIMAL(18, 9),
      },
      processingCode: {
        type: Sequelize.INTEGER,
      },
      tranCrncyCode: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      countryCode: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      valueDate: {
        type: Sequelize.DATE,
      },
      drAcctNum: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      crAcctNum: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      reservedFld1: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      drAcctNo: {
        type: Sequelize.STRING,
      },
      crAcctNo: {
        type: Sequelize.STRING,
      },
      amount: {
        type: Sequelize.DECIMAL(18, 9),
      },
      transactionId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'transactions',
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('finacle_transactions');
  },
};
