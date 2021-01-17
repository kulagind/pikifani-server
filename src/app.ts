import express, { Application } from 'express';
import mongoose from 'mongoose';
import VARIABLES from './var/var';
import wordRoutes from './routes/word';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import bodyParser from 'body-parser';
import { Chat, Message } from './models/chat';

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/api/word', wordRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use(Chat.create('/api/sse/:id'));

const PORT = process.env.PORT || VARIABLES.PORT;

async function start() {
    try {
        await mongoose.connect(VARIABLES.MONGODB_URI, {
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
