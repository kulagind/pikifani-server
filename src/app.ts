import express, { Application, Request, Response } from 'express';
import VARIABLES from './var/var';
import wordRoutes from './routes/word';
import chatRoutes from './routes/word';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Chat, Message } from './models/chat';

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/api/word', wordRoutes);
// app.use('/api/chat', chatRoutes);

// app.use(Chat.create('/api/sse'));
app.get('/api/sse/:id', (req: Request, res: Response) => {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
    });

    res.on('close', () => {
        res.end();
    });

    setTimeout(() => {
        res.write(`data: ${JSON.stringify(new Message(Math.random(), 'asd', new Date(), 0))}\n\n`);
    }, 5000)
});

const PORT = process.env.PORT || VARIABLES.PORT;

app.listen(+PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// function send() {
//     setTimeout(() => {
//         Chat.sendMessage(new Message(Math.random(), 'asd', new Date(), 0))
//     }, 5000)
// }

// send()

