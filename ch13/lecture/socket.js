const SocketIO = require('socket.io');

module.exports = (server, app) => {
  const io = SocketIO(server, { path: '/socket.io' });
  app.set('io', io);
  io.on('connection', (socket) => { // 웹 소켓 연결 시
    const req = socket.request;
    const { headers: { referer } } = req;
    const roomId = referer.split('/')[referer.split('/').length - 1]; //roomId는 Good 테이블의 로우 ID가 된다.
    socket.join(roomId); //방에 참가하고
    socket.on('disconnect', () => {
      socket.leave(roomId); //연결 끊켰을때 경매 방에서 나감
    });
  });
};
