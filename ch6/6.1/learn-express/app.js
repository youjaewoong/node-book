const express = require('express');
const path = require('path');

const app = express();

//설정
app.set('port', process.env.PORT || 3000);

//공통 미들웨어
app.use((req, res, next) => {
  console.log('1 요청에 실행하고 싶어요');
  next();
}, (req, res, next) => {
  console.log('2 요청에 실행하고 싶어요');
  next();
}, (req, res, next) => {
   next();
  //throw new Error('에러가 났어요');
});

//라우터
app.get('/', (req, res) => {
  // res.send('Hello, Express');
  //res.json({hello: 'jwo_ong'}); json 형태
  res.sendFile(path.join(__dirname, '/index.html'));
  if (true) {
    next('route');
  } else {
    next();
  }
}, (req, res) => {
  console.log('실행되나요?');
});


app.get('/about', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`hello express`);
});

// app.get('*', (req, res) => {
//   res.send(`hello everybody`);
// });

//404 custom
app.use((req, res, nexct) => {
   res.status(404).send('404지롱')
})

//에러 미들웨어 (err, req, res, next 매개변수 필수)
app.use((err, req, res, next) => {
  console.error(err);
})

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});
