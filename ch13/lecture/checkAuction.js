const { Op } = require('Sequelize');
const schedule = require('node-schedule')
const { Good, Auction, User, sequelize } = require('./models');

module.exports = async () => {
  console.log('checkAuction');
  const t = await sequelize.transaction(); // 트랜잭션 처리
  try {

    //이미 24시간 지난애들은 낙찰
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // 어제 시간
    const targets = await Good.findAll({ //경매가 낙찰되었어야 하는데 서버가 종료되서 낙찰되지 않은 유저를 찾는다.
      where: {
        SoldId: null,
        createdAt: { [Op.lte]: yesterday },
      },
    });
    targets.forEach(async (target) => { //해당 유저들 낙찰을 시켜준다.
      const success = await Auction.findOne({
        where: { GoodId: target.id },
        order: [['bid', 'DESC']],
        transaction: t
      });
      await Good.update({ SoldId: success.UserId }, { where: { id: target.id }, transaction: t });
      await User.update({
        money: sequelize.literal(`money - ${success.bid}`),
      }, {
        where: { id: success.UserId },
        transaction: t
      });
    });

    //24시간 안지난 애들은 스케줄링
    const unsold = await Good.findAll({
      where: {
        SoldId: null,
        createdAt: { [Op.gt]: yesterday },
      },
    });
    unsold.forEach(async (target) => {
      const end = new Date(unsold.createdAt);
      end.setDate(end.getDate() + 1);
      schedule.scheduleJob(end, async () => {
        const success = await Auction.findOne({
          where: { GoodId: target.id },
          order: [['bid', 'DESC']],
          transaction: t
        });
        await Good.update({ SoldId: success.UserId }, { where: { id: target.id }, transaction: t });
        await User.update({
          money: sequelize.literal(`money - ${success.bid}`),
        }, {
          where: { id: success.UserId },
          transaction: t
        });
      })
    });

  } catch (error) {
    console.error(error);
    await t.rollback();
  }
};
