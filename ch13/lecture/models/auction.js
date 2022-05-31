const Sequelize = require('sequelize');

module.exports = class Auction extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      bid: { //얼마에 입찰했는지
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      msg: { //모두가 볼수있는 메시지
        type: Sequelize.STRING(100),
        allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      paranoid: true,
      modelName: 'Auction',
      tableName: 'auctions',
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Auction.belongsTo(db.User); //어떤 유저에 속해있다.
    db.Auction.belongsTo(db.Good); //어떤 상품에 속해있다.
  }
};
