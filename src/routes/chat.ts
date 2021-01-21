import { ChatForRes } from './../utils/chat';
import { GameChat } from './../models/chat';
import { GameDB, UserDB, UserDBWithMethods } from './../interfaces/mongo-models';
import { Router } from "express";
import { User } from "../models/user";
import { sendError } from "../utils/error";
import { getChat } from '../utils/chat';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const clientId = res.locals._id;
        const client: UserDBWithMethods = await User.findById(clientId);
        if (!client) {
            res.status(401).json(sendError(401, 'Неавторизованный пользователь'));
        } 

        const gameIds: string[] = client.games;
        const chats: ChatForRes[] = [];
        gameIds.forEach(async gameId => {
            const chat: GameDB = await GameChat.findById(gameId);
            const chatForRes = await getChat(chat, clientId);
            chats.push(chatForRes);
        });

        res.status(200).json({chats});
    } catch(e) {
        console.log(e);
    }
})

export default router;