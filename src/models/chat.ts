import { SSEMessage } from './../interfaces/chat';
import express, { Application, Request, Response } from 'express';

const app: Application = express();

export class Chat {
    public static res: Response;

    public static create(url: string): Application {
        return app.get(url, (req: Request, res: Response) => {
            this.res = res;

            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            });
    
            res.on('close', () => {
                res.end();
            });
        });
    }

    public static sendMessage(message: SSEMessage): void {
        this.res.write(`data: ${JSON.stringify(message)}\n\n`);
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
