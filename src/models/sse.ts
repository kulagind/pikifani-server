import express, { Application, Request, Response } from 'express';
import { UserDBWithMethods } from '../interfaces/mongo-models';
import { User } from './user';
import { sendError } from '../utils/error';
import { SSETick } from '../interfaces/sse';

const app: Application = express();

export class SSEConnection {
    public static map = new Map<string, Response[]>();

    public static create(url: string): Application {
        return app.get(url, async (req: Request, res: Response) => {
            try {
                const id = req.params.id;
                const user: UserDBWithMethods = (await User.findById(id)) as UserDBWithMethods;
                if (!user) {
                    return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
                }
    
                res.socket?.on('close', () => {
                    if (SSEConnection.map.has(id)) {
                        let responses = SSEConnection.map.get(id);
                        if (responses?.length && responses?.length <= 1) {
                            SSEConnection.close(id);
                        } else {
                            responses = responses?.filter(response => response != res);
                        }
                    }
                });
    
                res.writeHead(200, {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive"
                });
    
                if (!SSEConnection.map.has(id)) {
                    SSEConnection.map.set(id, [res]);
                } else {
                    const responses = SSEConnection.map.get(id) || [];
                    SSEConnection.map.set(id, [...responses, res]);
                }
            } catch(e) {
                console.log(e);
            }
        });
    }

    public static send(userId: string, payload: SSETick): void {
        if (SSEConnection.map.has(userId)) {
            SSEConnection.map.get(userId)?.forEach(res => {
                res.write(`data: ${JSON.stringify(payload)}\n\n`);
            });
        }
    }

    private static close(userId: string): void {
        if (SSEConnection.map.has(userId)) {
            SSEConnection.map.delete(userId);
        }
    }
}
