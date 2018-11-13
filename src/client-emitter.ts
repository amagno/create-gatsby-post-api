import { Server, Socket } from 'socket.io';
interface IClient {
  socketId: string;
  token: string;
}
export class ClientEmitter {
  private clients: IClient[] = [];
  constructor(private server: Server) {}

  public addClient(client: IClient) {
    this.clients.push(client);
  }
  public removeClient(socketId: string) {
    this.clients = this.clients.filter((c) => c.socketId !== socketId);
  }

  public createEmitter(token: string) {
    const client = this.clients.find((c) => c.token === token);

    if (!client) {
      throw new Error('client not found');
    }

    const socket = this.server.sockets.connected[client.socketId];

    if (!socket) {
      throw new Error('socket not found');
    }

    return new Emitter(socket);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class Emitter {
  constructor(private socket: Socket) {}
  public emit(type: string, data?: any) {
    this.socket.emit(type, data);
  }
}
