import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Server } from 'ws';
import { IncomingMessage } from 'http';
import { PrismaService } from '../prisma/prisma.service';

export type NotificationEvent =
  | 'goal_reached'
  | 'goal_warning'
  | 'goal_halfway'
  | 'goal_exceeded'
  | 'new_domain';

interface AuthenticatedClient {
  socket: import('ws').WebSocket;
  apiTokenId: string;
}

@Injectable()
@WebSocketGateway({ path: '/ws' })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients: AuthenticatedClient[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async handleConnection(socket: import('ws').WebSocket, req: IncomingMessage) {
    const url = new URL(req.url || '', 'http://localhost');
    const token = url.searchParams.get('token');

    if (!token) {
      socket.close(4001, 'Token required');
      return;
    }

    const apiToken = await this.prisma.apiToken.findUnique({
      where: { token },
    });

    if (!apiToken) {
      socket.close(4003, 'Invalid token');
      return;
    }

    this.clients.push({ socket, apiTokenId: apiToken.id });
  }

  handleDisconnect(socket: import('ws').WebSocket) {
    this.clients = this.clients.filter((c) => c.socket !== socket);
  }

  notify(apiTokenId: string, event: NotificationEvent, data: Record<string, any>) {
    const message = JSON.stringify({ event, data });

    for (const client of this.clients) {
      if (client.apiTokenId === apiTokenId && client.socket.readyState === 1) {
        client.socket.send(message);
      }
    }
  }
}
