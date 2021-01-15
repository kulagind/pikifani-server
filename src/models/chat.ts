import { SSEMessage } from './../interfaces/chat';
import express, { Application, Request, Response } from 'express';

const app: Application = express();

export class Chat {
    public static connections = new Map<number, Response[]>();

    public static create(url: string): Application {
        return app.get(url, (req: Request, res: Response) => {
            const id: number = +req.params.id;

            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            });

            if (!this.connections.has(id)) {
                Chat.connections.set(id, [res]);
            } else {
                const responses = Chat.connections.get(id) || [];
                Chat.connections.set(id, [...responses, res]);
            }
        });
    }

    public static sendMessage(connectionId: number, message: SSEMessage): void {
        if (this.connections.has(connectionId)) {
            this.connections.get(connectionId)?.forEach(res => {
                res.write(`data: ${JSON.stringify(message)}\n\n`);
            });
        }
    }
}

export class Message implements SSEMessage{
    chatId: number;
    word: string;
    creationTime: Date;
    winnerId: number;

    constructor(
        chatId: number,
        word: string,
        creationTime: Date,
        winnerId: number
    ) {
        this.chatId = chatId;
        this.word = word;
        this.creationTime = creationTime;
        this.winnerId = winnerId;
    }
}
