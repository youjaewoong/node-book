const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
app.set('port', process.env.PORT || 3000);

app.use(morgan('dev'));

app.use('/', express.static(path.join(__dirname, 'public'))); //정적파일 설정

//미들웨어 확장법
// app.use('/', (req, res, next) => {
//   if (req.session.id) {
//     express.static(__dirname, 'public')(req, res, next)
//   } else {
//     next();
//   }
// })

app.use(express.json()); //json data 파싱용
app.use(express.urlencoded({ extended: false })); //form data 파싱용
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false, //요청이 왔을 때 세션에 수정사항이 생기지 않아도 다시 저장할지 여부
  saveUninitialized: false, //세션에 저장할 내역이 없더라도  세션을 저장할지
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  name: 'session-cookie',
}));

const multer = require('multer');
const fs = require('fs');

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}
const upload = multer({ //multer 설정
  storage: multer.diskStorage({
    destination(req, file, done) { //어디에 저장할지
      done(null, 'uploads/'); //첫째자리는 error 리턴용
    },
    filename(req, file, done) { //파일이름
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },//5mb 이하 설정
});
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'multipart.html'));
});
app.post('/upload', upload.single('image'), (req, res) => {
  console.log(req.file);
  res.send('ok');
});

//같은 이름 여러 파일
app.post('/upload-array', upload.array('image'), (req, res) => {
  console.log(req.file);
  res.send('ok');
});

//같은 이름 여러 파일
app.post('/upload-fields', upload.fields([{name: 'image1'}, {name: 'image2'}]), (req, res) => {
  console.log(req.file.image1);
  console.log(req.file.image2);
  res.send('ok');
});

//이미지가 없는 fomr 방식일경우
app.post('/upload-none', upload.none(), (req, res) => {
  console.log(req.body.title);
  res.send('ok');
});


//cookie
app.get('/cookie', (req, res, next) => {
  //cookie 등록
  res.cookie('name', encodeURIComponent('title'), {
    expires: new Date(),
    httpOnly: true,
    path: '/',
  })

  //cookie 제거
  res.clearCookie('name', encodeURIComponent('title'), {
    httpOnly:true,
    path: '/',
  })
  res.send('ok');
})

//session
app.get('/session', (req, res, next) => {
  req.session.data = 'jwo_ong비번';
  res.send('ok');
})

//data 공유
app.get('/data0',(req, res, next) => {
  req.data = 'data';
  res.send('ok data0');
})
app.get('/data1',(req, res, next) => {
  console.log('data ::', req.data);
  res.send('ok data1');
})


app.get('/', (req, res, next) => {
  console.log('GET / 요청에서만 실행됩니다.');
  next();
}, (req, res) => {
  throw new Error('에러는 에러 처리 미들웨어로 갑니다.')
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});
