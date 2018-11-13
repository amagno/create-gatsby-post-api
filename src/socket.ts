import * as http from 'http';
import * as socket from 'socket.io';
import { deploy, IDeployOptions } from './queue';

const server = http.createServer();
const io = socket(server);

const deploySocket = io.of('/deploy');

deploySocket.on('connection', (connection) => {
  connection.on('start', (data: IDeployOptions) => {
    connection.emit('deploy-started');
    deploy(connection, data);
  });

});

server.listen(4001);
