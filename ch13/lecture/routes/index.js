const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');

const { Good, Auction, User, sequelize } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

//로그인 했으면 랜더할때 유저정보를 넣는다.
router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

router.get('/', async (req, res, next) => {
  try {
    //진행중인 상품찾아서 화면에 랜더링 (낙찰되지 않은 상품만)
    const goods = await Good.findAll({ where: { SoldId: null } });
    res.render('main', {
      title: 'NodeAuction',
      goods,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', {
    title: '회원가입 - NodeAuction',
  });
});

router.get('/good', isLoggedIn, (req, res) => {
  res.render('good', { title: '상품 등록 - NodeAuction' });
});

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}
//이미지작업으로 multer 사용
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

//상품등록 할때
router.post('/good', isLoggedIn, upload.single('img'), async (req, res, next) => {
  try {
    const { name, price } = req.body;
    const good = await Good.create({ //누가 상품을 올렸는지
      OwnerId: req.user.id,
      name,
      img: req.file.filename,
      price,
    });
    const end = new Date(); //현재시간
    end.setDate(end.getDate() + 1); // 24시간뒤 (하루 뒤)
    schedule.scheduleJob(end, async () => { //끝나때 어떻게 할지

      const t = await sequelize.transaction(); // 트랜잭션 처리
      try {
        const success = await Auction.findOne({ //상품의 경매내역을 가져온다.
          where: { GoodId: good.id },
          order: [['bid', 'DESC']], //가장높은 가격을 불러오기위해서
          transaction: t
        });
        await Good.update(
          { SoldId: success.UserId }, { where: { id: good.id }, transaction: t }); //상품에 낙찰자ID 업데이트
        await User.update({ //내 정보의 자산 업데이트
          money: sequelize.literal(`money - ${success.bid}`), //sequelize에서는 literal 사용하여 빼주어야한다.
        }, {
          where: { id: success.UserId },
          transaction: t
        });
        await t.commit();
      } catch(error) {
        await t.rollback();
      }
    });

    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//입찰화면
router.get('/good/:id', isLoggedIn, async (req, res, next) => {
  try {
    const [good, auction] = await Promise.all([
      Good.findOne({
        where: { id: req.params.id },
        include: {
          model: User,
          as: 'Owner',
        },
      }),
      Auction.findAll({
        where: { goodId: req.params.id },
        include: { model: User },
        order: [['bid', 'ASC']],
      }),
    ]);
    res.render('auction', {
      title: `${good.name} - NodeAuction`,
      good,
      auction,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//입찰 하는 엑션
router.post('/good/:id/bid', isLoggedIn, async (req, res, next) => {
  try {
    const { bid, msg } = req.body;
    const good = await Good.findOne({
      where: { id: req.params.id },
      include: { model: Auction },
      order: [[{ model: Auction }, 'bid', 'DESC']],
    });
    if (good.price >= bid) {
      return res.status(403).send('시작 가격보다 높게 입찰해야 합니다.');
    }

    //24시간안에 입찰했는지
    if (new Date(good.createdAt).valueOf() + (24 * 60 * 60 * 1000) < new Date()) {
      return res.status(403).send('경매가 이미 종료되었습니다');
    }
    //내 입찰가가 높은지
    if (good.Auctions[0] && good.Auctions[0].bid >= bid) {
      return res.status(403).send('이전 입찰가보다 높아야 합니다');
    }
    const result = await Auction.create({
      bid,
      msg,
      UserId: req.user.id,
      GoodId: req.params.id,
    });
    // 실시간으로 입찰 내역 전송
    req.app.get('io').to(req.params.id).emit('bid', {
      bid: result.bid,
      msg: result.msg,
      nick: req.user.nick,
    });
    return res.send('ok');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

//낙찰내역 리스트
router.get('/list', isLoggedIn, async (req, res, next) => {
  try {
    const goods = await Good.findAll({ //내가 낙찰받은 상품들
      where: { SoldId: req.user.id }, //낙찰받은사람
      include: { model: Auction },
      order: [[{ model: Auction }, 'bid', 'DESC']],
    });
    res.render('list', { title: '낙찰 목록 - NodeAuction', goods });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;