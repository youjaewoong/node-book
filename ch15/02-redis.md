### redis
- https://redis.com/
- https://app.redislabs.com/ 나의 DB
- https://thebook.io/080229/ch15/01/08/ 참고
- https://www.electronjs.org/apps/p3x-redis-ui 관련 툴

### info
- name:default
- pw:5MECL7QcyIbDgBbupvWuRwBunfwynddS
- db: Free-db
- host: redis-15217.c244.us-east-1-2.ec2.cloud.redislabs.com:15217

### npm setup
`npm i connect-redis redis`

### redis 사용법
```
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
});

const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  store: new RedisStore({ client: redisClient }),
};

```

### note
```
dos 공격에 필요한 express-rate-limit 패키지도 사용량을 메모리에 기록하므로 서버를 재시작하면
사용량이 초기화된다. 이것도 레디스에 기록하는것이 좋다. rate-limit-redis라는 패키지와 express-rate-limit
패키지를 같이 사용하면 된다.
```