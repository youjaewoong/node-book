### aws  Lightsail 인스턴스 ubunt 환경

### node 설치
```
sudo su
sudo apt-get 설치가능한 리스트를 업데이트한다.
sudo apt-get install -y build-essential 기본적인 필요한 리스트를 설치한다.
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash --
sudo apt-get install -y nodejs
```

### MySQL 설치
우분투에서는 GUI를 사용하지 않으므로 다음 명령어를 순서대로 입력하여 MySQL을 설치한다.
```
sudo apt-get update
sudo apt-get install -y mysql-server
sudo mysql_secure_installation
```
비밀번호 설정 화면이 나오지 않고 설치가 완료된다면 비밀번호가 없는 상태가 됩니다. 이럴 경우에는 mysqladmin -u root -p password 비밀번호 명령어로 비밀번호를 설정할 수 있다. 

### MySQL 접속확인
`mysql -uroot -p`

### pw setup
database pw setup
`ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'my_pw';`

### bitnami 확인
- Lightsail에서는 기본적으로 비트나미 아파치(Bitnami apache) 서버가 켜져 있다. 노드 서버와 같이 쓸 수는 없으므로 아파치 서버를 종료하는 명령어를 입력한다.
- `cd /opt/bitnami` 디렉토리가 없을 경우 무시한다.
```
cd /opt/bitnami
sudo ./ctlscript.sh stop apache
```

### port 확인
lsof 는 열려있는 파일들 그리고 그 파일을 사용하는 프로세스를 출력한다.
`sudo lsof -i tcp:80`

### 대상 git clone
`git clone <주소>`

### .env file 생성
git에 .env file을 생성하지 않았을 경우 작성해준다.
`vim .env`

작성 후 확인
`cat .env`

### database 생성
- package install
- 중간에 시퀄라이즈로 MySQL 데이터베이스도 생성했습니다.
```
npm i
npx sequelize db:create --env production
```

### 해당 프로젝트 실행
```
sudo npm start && sudo npx pm2 monit
```

### etc
#### 보안상 위협되는 package install
`npm audit fix`

#### error 발생
우분투에서 ERROR 2002
```
service mysql stop
service mysql start
service mysql resrart
```