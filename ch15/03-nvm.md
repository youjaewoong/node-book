## windows
### nvm install
윈도에서는 https://github.com/coreybutler/nvm-windows/releases에  접속하여 nvm-setup.zip을 내려받습니다. 내려받은 파일을 압축 해제한 후 실행시켜 설치합니다.

### nvm list
이제 콘솔에 nvm 명령어를 입력할 수 있습니다. 설치된 노드 버전을 확인하는 명령어는 nvm list입니다
`nvm list`

### node install
새로운 버전을 설치하고 싶다면 nvm install [버전]을 입력한다. nvm install 14.1.0처럼 특정 버전을 입력하거나 nvm install latest처럼 최신 버전을 설치하게 하면 됩니다.
```
$ nvm install 14.1.0
Downloading node.js version 14.1.0 (64-bit).. .
Complete
Creating C:\Users\zerocho\AppData\Roaming\nvm\temp

Downloading npm version 6.14.4.. . Complete
Installing npm v6.14.4...

Installation complete. If you want to use this version, type

nvm use 14.1.0
```

### node version change
설치된 버전을 사용하려면 nvm use [버전명]을 입력한다.
```
$ nvm use 14.1.0
Now using node v14.1.0 (64-bit)
$ node -v
v14.1.0
```

## mac, linux
### n install
맥과 리눅스에서는 n 패키지를 사용하면 편리하다 .
`sudo npm i -g n`

### n list
이제 n 명령어를 사용할 수 있게 되었습니다. 콘솔에 n을 입력하면 현재 설치된 노드 버전을 볼 수 있습니다. 나중에 설치된 버전을 선택할 때도 이 명령어를 사용합니다.
```
$ n
node/14.0.0
```

### node version change && install
새로운 버전을 설치하고 싶다면 n 버전을 입력한다. n 10.1.0처럼 특정 버전을 입력하거나 n latest처럼 최신 버전을 설치하게 하면 된다.
```
$ n 14.1.0
installed v14.1.0
$ node -v
v14.1.0
```
