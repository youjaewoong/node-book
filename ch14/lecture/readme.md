### 초기 셋팅
```
npm i -g
npm i -g force
npm rm -g
npm i commander inquirer chalk
```

### command 방식
```
#현재경로의 test.html 생성됨
cli tmpl html -f test

#public폴더안에 api.js 생성됨
cli template express-router -f api -d public 
```

### inquirer 선택방식
```
cli
```

### 프로그램 공유방법
5장의 과정대로 npm에 배포하면 됨
- 다른 사용자가 npm i -g <패키지명>을 한다면 다운로드 받아 사용할수 있음