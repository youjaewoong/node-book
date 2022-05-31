
#### 기본 설치
    - `npm init -y`
    - `npm i cookie-parser dotenv express express-session morgan multer nunjucks`
    - `npm i mysql2 sequelize sequelize-cli`
    - `npm i bcrypt passport passport-local`
    - `npm i sse socket.io`
    - `npm i node-schedule`

### 폴더 생성
- `npx sequelize init`
- routes
    - auth.js
    - index.js
    - middlewares.js
- view
- .env
- app.js
- models
    - user.js 사용자
    - auction.js 입찰
    - good.js 상품에는 입찰내역이 있다.
    - index.js model 주입

### 구성
- confing.json file 셋업 후 database 생성
    - `npx sequelize db:create`

### DB관계
- 한 사용자가 여러 상품을 등록 가능(user-good, as:ownner)
- 한 사용자가 여러 상품을 낙찰 가능(user-good, as:sold)
- 한 사용자가 여러 번 경매 입찰 가능(user-auction)
- 한 상품에 대해 여러 번 경매 입찰 가능(good-auctuin)
- as로 설정한 것은 OwnerId, SoldId로 상품 모델에 컬럼이 추가됨

### 서버센트 이벤트 사용
경매는 시간이 생명
- 모든 사람이 같은 시간에 경매가 종료되어야 함
- 모든 사람에게 같은 시간이 표시되어야 함
- 클라이언트 시간은 믿을 수 없음(조작 가능)
- 따라서 서버 시간을 주기적으로 클라이언트로 내려보내줌
- 이 때 서버에서 클라이언트로 단방향 통신을 하기 때문에 서버센트 이벤트(Server Sent Events, SSE) 가적합
- 웹 소켓은 실시간으로 입찰할 때 사용

### 운영체제의 스케줄러
node-schedule로 등록한 스케줄은 노드 서버가 종료될 때 같이 종료됨
- 운영체제의 스케줄러를 사용하는 것이 좋음
- 윈도에서는 schtasks
- 맥과 리눅스에서는 cron 추천
- 노드에서는 이 두명령어를 child_process를 통해호출 할수 있음

### http://localhost:8010/