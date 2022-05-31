### morgan
개발용으로 설정된 익스프레스 미들웨어를 배포용으로 전환
- process.env.NODE_ENV는 배포 환경인지 개발 환경인지를 판단할 수 있는 환경 변수
- 배포 환경일 때는 combined 사용(더 많은 사용자 정보를 로그로 남김)
- NODE_ENV는 뒤에 나오는 cross-env에서 설정해줌
```
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}
```

### express-session
- 설정들을 배포용과 개발용으로 분기 처리
- production일 때는 proxy를 true, secure를 true로
- 단, https를 적용할 경우에만 secure를 true로 하고, 노드 앞에 다른 서버를 두었을 때 proxy를 true로 함

```
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false, //https 적용했으면 true
  },
  store: new RedisStore({ client: redisClient }),
};
if (process.env.NODE_ENV === 'production') {
  app.enable('truest proxy');
  sessionOption.proxy = true; //앞단에 nginx 와같은 서버가 있기떄문에 tru를 설정한다.
  // sessionOption.cookie.secure = true;  //https 적용했으면 주석제거
}
app.use(session(sessionOption));

https 사용 시
secure: true 변경
app.enable('truest proxy');

```
### helmet, hpp로 보안 관리하기
모든 취약점을 방어해주진 않지만 실무에서 필수인 패키지
- 배포 환경일 때만 사용하면 됨
`npm i helmet hpp`
```
const helmet = require('helmet'); //보안관련
const hpp = require('hpp'); //보안관련
if (process.env.NODE_ENV === 'production') {
  app.enable('truest proxy');
  app.use(morgan('combined'));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(hpp());
} else {
  app.use(morgan('dev'));
}
```

### sequelize
- 시퀄라이즈 설정도 하드코딩 대신 process.env로 변경
- JSON 파일은 변수를 사용할 수 없으므로 JS 파일을 설정 파일로 써야 함
- config.json을 지우고 config.js 사용

### cross-env
- 동적으로 process.env 변경 가능
- 운영체제 상관 없이 일괄 적용 가능(맥, 윈도, 리눅스)
- package.json을 다음과 같이 수정(배포용과 개발용 스크립트 구분)
- 문제점: 윈도에서는 NODE_ENV를 위와 같이 설정할 수 없음
- 이 때 cross-env가 필요

```
npm i cross-env
```

```
  "scripts": {
    "start": "cross-env NODE_ENV=production PORT=80 node server",
    "dev": "nodemon server",
    "test": "jest"
  },
```

### sanitize-html
XSS(Cross Site Scripting) 공격 방어
- npm i sanitize-html
- 허용하지 않은 html 입력을 막음
- 아래처럼 빈 문자열로 치환됨
```
const sanitizeHtml = require('sanitize-html');
const html = "<script>location.href = 'https://gilbut.co.kr '</script>"
console.log(sanitizeHtml(html)); //''
```

### csurf
CSRF(Cross Site Request Forgery) 공격 방어
- npm i csurf
- csrfToken을 생성해서 프런트로 보내주고(쿠키로)
- Form 등록 시 csrfToken을 같이 받아 일치하는지 비교
```
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true})
app.get('/form', csrfProtection, (req, res) => {
    res.render('csrf', { csrfToken: req.csrfToken()});
})

app.post('/form', csrfProtection, (req, res) => {
    res.send('ok');
})
```

### pm2 소개
- 원활한 서버 운영을 위한 패키지
- 서버를 1에서 2로 변경할때 매끄럽게 변경해줌
- 서버가 에러로 인해 꺼졌을 때 서버를 다시 켜 줌
- 멀티 프로세싱 지원(노드 프로세스 수를 1개 이상으로 늘릴 수 있음)
- 요청을 프로세스들에 고르게 분배
- 단점: 프로세스간 서버의 메모리 같은 자원 공유 불가
- 극복: memcached나 redis같은 메모리 DB 사용(공유 메모리를 별도 DB에 저장)
  - 서버 1, 2, 3, 4에 로그인 공유는 redis로 할수 있다.

### pm2 사용하기
- pm2 전역 설치 후, 명령어 사용
`npm i pm2`
- package.json 스크립트 수정
```
  "scripts": {
    "start": "cross-env NODE_ENV=production PORT=80 pm2 start server.js -i 0",
  },
```
- pm2 start 파일명으로 실행
```
npx pm2 start server.js
```

### pm2 프로세스 목록 확인하기
pm2 list로 프로세스 목록 확인 가능
- 프로세스가 백그라운드로 돌아가기 때문에 콘솔에 다른 명령어 입력 가능
`npx pm2 list` 동작중인 서버 확인 가능

### pm2 멀티 프로세싱하기
pm2 start [파일명] –i [프로세스 수] 명령어로 멀티 프로세싱 가능
- 프로세스 수에 원하는 프로세스의 수 입력
- 0이면 CPU 코어 개수만큼 생성, -1이면 CPU 코어 개수보다 1개 적게 생성
- -1은 하나의 프로세스를 노드 외의 작업 수행을 위해 풀어주는 것
```
  "scripts": {
    "start": "cross-env NODE_ENV=production PORT=80 pm2 start server.js -i 0",
  },
```
### pm2 서버 종료 후 멀티 프로세싱 하기
pm2 kill로 프로세스 전체 종료 가능
`npx pm2 kill && npm start`

### pm2 전체서버 재시작
`npx pm2 reload all`

### pm2 프로세스 모니터링하기
pm2 monit으로 프로세스 모니터링
- 프로세스별로 로그를 실시간으로 볼 수 있음
`npx pm2 monit`

### pm2 history
`pm2 logs --err` 에러로그 확인

### winston
console.log와 console.error를 대체하기 위한 모듈
- 위 두 메서드는 휘발성
- 로그를 파일에 기록하는 것이 좋음
- 윈스턴 설치 후 logger.js 작성
`npm i winston`
```
// logger.js

const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.File({ filename: 'combined.log' }),
    new transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({ format: format.simple() }));
}

module.exports = logger;
```

### winston 메서드
createLogger로 로거 인스턴스를 생성
- level은 로그의 심각도(error, warn, info, verbose, debug, silly 순, 중요도 순)
- info를 고른 경우 info보다 심각한 단계 로그도 같이 기록됨
- format은 로그의 형식(json, label, timestamp, printf, combine, simple 등 지원)
- 기본적으로는 JSON으로 기록하지만 로그 시간을 표시하려면 timestamp를 쓰는 게 좋음
- transports는 로그 저장 방식
- new transports.File은 파일로 저장한다는 뜻, new transports.Console은 콘솔에 출력한다는 뜻
- 인자로 filename(파일명), level(심각도) 제공

### winston setup
```
const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.File({ filename: 'combined.log' }),
    new transports.File({ filename: 'error.log', level: 'error' })
  ],
})
```

### winston 적용하기
기존의 console 대신 logger로 사용한다 생각하면 됨
```
// app.js
const { sequelize } = require('./models');
const passportConfig = require('./passport');
const logger = require('./logger');

app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  logger.info('hello');
  logger.error(error.message);
  next(error);
});
```
### winston 로그 확인하기
npm run dev로 개발용 서버 실행
- http://localhost:8001/abcd 에 접속
- 각각의 로그가 파일에 기록됨
```
combined.log
{"message":"hello", "level":"info"}
{"message":"GET /abcd 라우터가 없습니다.", "level":"error"}
```
```
error.log
{"message":"GET /abcd 라우터가 없습니다.", "level":"error"}
```
- 파일에 로그가 저장되어 관리 가능
- winston-daily-rotate-file이라는 패키지로 날짜별로 관리 가능
