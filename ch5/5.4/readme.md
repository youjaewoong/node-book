
### 자주사용하는 명령어

- `npm i rimraf -D`
    - `npx rimraf node_modules` 삭제명령어로 주로 사용

- `npm outdated` 패키지의 기능 변화 확인
- `npm search` npm 패키지 검색(npmjs.com에서도 가능)
- `npm info <pacakge>` 패키지의 세부 정보 
- `npm adduser` 회원가입
- `npm login` 로그인
- `npm whoami` 접속대상자
- `npm logout` 로그아웃
- `npm version <버전명>` package.json 버전을 올림
    - major(주 버전), minor(부 버전), patch(수 버전)
- `npm deprecate [패키지명][버전][메시지]`
- `npm publish` 내가만든 패키지를 배포
- `npm unpublish --force` 내가만든 패키지를 배포 중단(배포후 72시간 내에만 가능)
    - 다른 사람이 내패키지를 사용하고 있는데 배포가 중단되면 문제가 생기기 떄문
- `npm ls <package>` 