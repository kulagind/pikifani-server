import { SSEConnection } from './models/sse';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import VARIABLES from './var/var';
import wordRoutes from './routes/word';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import friendRoutes from './routes/friend';
import messageRoutes from './routes/message';
import gameInvitesRoutes from './routes/game';
import notificationRoutes from './routes/push';
import gamesRoutes from './routes/chat';
import bodyParser from 'body-parser';
import {auth} from './middlewares/auth';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import { Notification } from './models/notification';

const app: Application = express();

const options = {
    key: fs.readFileSync('assets/cert/server.key'),
    cert: fs.readFileSync('assets/cert/server.crt')
};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(auth);
Notification.init();

app.use('/api/public', express.static('assets/icon'));
app.use('/api/word', wordRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/invites', gameInvitesRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/chat', messageRoutes);
app.use('/api/notification', notificationRoutes);
app.use(SSEConnection.create('/api/sse/:id'));

const PORT = process.env.PORT || VARIABLES.PORT;

async function start() {
    try {
        const mongo: typeof mongoose = await mongoose.connect(VARIABLES.MONGODB_URI, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });

        // clearMongo(mongo);
    
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        https.createServer(options, app).listen(VARIABLES.SSL_PORT, () => {
            console.log(`Https is running on port ${VARIABLES.SSL_PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();

function clearMongo(mongo: typeof mongoose): void {
    mongo.connection.collections['users'].drop();
}
