import express, { Application } from 'express';
import mongoose from 'mongoose';
import VARIABLES from './var/var';
import wordRoutes from './routes/word';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import friendRoutes from './routes/friend';
import gameInvitesRoutes from './routes/game';
import chatRoutes from './routes/chat';
import bodyParser from 'body-parser';
import {auth} from './middlewares/auth';

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(auth);

app.use('/api/word', wordRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/invites', gameInvitesRoutes);
app.use('/api/games', chatRoutes);

// app.use(Chat.create('/api/sse/:id'));

const PORT = process.env.PORT || VARIABLES.PORT;

async function start() {
    try {
        const mongo: typeof mongoose = await mongoose.connect(VARIABLES.MONGODB_URI, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });
    
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();

function clearMongo(mongo: typeof mongoose): void {
    mongo.connection.collections['users'].drop();
}
