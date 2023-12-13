/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transaction_finacles', {
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
        type: Sequelize.DECIMAL(18, 9),
      },
      processingCode: {
        type: Sequelize.INTEGER,
      },
      tranCrncyCode: {
        type: Sequelize.STRING,
      },
      countryCode: {
        type: Sequelize.STRING,
      },
      valueDate: {
        type: Sequelize.DATE,
      },
      drAcctNum: {
        type: Sequelize.STRING,
      },
      crAcctNum: {
        type: Sequelize.STRING,
      },
      reservedFld1: {
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
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transaction_finacles');
  },
};
