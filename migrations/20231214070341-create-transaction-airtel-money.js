/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transaction_airtel_moneys', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      mq_txn_id: {
        type: Sequelize.STRING,
      },
      reference_id: {
        type: Sequelize.STRING,
      },
      airtel_money_id: {
        type: Sequelize.STRING,
      },
      transaction_airtel_money_id: {
        type: Sequelize.STRING,
      },
      transaction_airtel_money_status: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('transaction_airtel_moneys');
  },
};
