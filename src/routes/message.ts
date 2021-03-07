import { ChatMessageForRes, GameResult } from './../interfaces/chat';
import { GameDBWithMethods } from './../interfaces/mongo-models';
import { GameChat } from './../models/chat';
import { Router, Request, Response } from 'express';
import { UserDBWithMethods } from '../interfaces/mongo-models';
import { User } from '../models/user';
import { sendError } from '../utils/error';
import { wordValidators } from '../validators/validators';
import { ChatForRes, getChat, getOpponentId, getResult } from '../utils/chat';
import { validationResult } from 'express-validator';
import { SSEConnection } from '../models/sse';
import { SSEType } from '../interfaces/sse';
import { getUser } from '../utils/user';

const router: Router = Router();

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = res.locals._id;
        const user: UserDBWithMethods = (await User.findById(id)) as UserDBWithMethods;
        if (!user) {
            return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
        }

        const gameId: string = req.params.id;
        const chat: GameDBWithMethods = (await GameChat.findById(gameId)) as GameDBWithMethods;
        
        const openedChat: ChatMessageForRes = {
            info: await getChat(chat, id),
            messages: chat.messages,
            winner: chat.winner
        };

        res.status(200).json(openedChat);
    } catch(e) {
        console.log(e);
    }
});

router.get('/result/:id', async (req: Request, res: Response) => {
    try {
        const id = res.locals._id;
        const user: UserDBWithMethods = (await User.findById(id)) as UserDBWithMethods;
        if (!user) {
            return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
        }
        
        const gameId: string = req.params.id;
        const chat: GameDBWithMethods = (await GameChat.findById(gameId)) as GameDBWithMethods;
        
        if (chat.toRemove && chat.toRemove.toString() !== id) {
            chat.delete();
        } else if (!chat.toRemove) {
            chat.toRemove = id;
            await user.removeChat(chat._id);
        }

        const friend: UserDBWithMethods = (await User.findById(getOpponentId(chat, id))) as UserDBWithMethods;
        const userChats: ChatForRes[] = await user.getChats();
        const friendChats: ChatForRes[] = await friend.getChats();
        SSEConnection.send(user._id.toString(), {type: SSEType.games, payload: userChats});
        SSEConnection.send(friend._id.toString(), {type: SSEType.games, payload: friendChats});
        
        const result: GameResult = await getResult(chat, id);

        res.status(200).json(result);
    } catch(e) {
        console.log(e);
    }
});

router.post('/:id', wordValidators, async (req: Request, res: Response) => {
    try {
        const id = res.locals._id;
        const user: UserDBWithMethods = (await User.findById(id)) as UserDBWithMethods;
        if (!user) {
            return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(sendError(422, errors.array()[0].msg));
        }

        const gameId: string = req.params.id;
        const word: string = req.body.word;

        const chat: GameDBWithMethods = (await GameChat.findById(gameId)) as GameDBWithMethods;
        const isFinished = await chat.sendMessage(id, word);

        const friend: UserDBWithMethods = (await User.findById(getOpponentId(chat, id))) as UserDBWithMethods;

        if (isFinished) {
            user.winsQuantity++;
            SSEConnection.send(user._id.toString(), {type: SSEType.user, payload: getUser(user)});
        }

        const userChats: ChatForRes[] = await user.getChats();
        const friendChats: ChatForRes[] = await friend.getChats();
        SSEConnection.send(user._id.toString(), {type: SSEType.games, payload: userChats});
        SSEConnection.send(friend._id.toString(), {type: SSEType.games, payload: friendChats});

        const openedUserChat: ChatMessageForRes = {
            info: await getChat(chat, id),
            messages: chat.messages,
            winner: chat.winner
        };
        const openedFriendChat: ChatMessageForRes = {
            info: await getChat(chat, friend._id.toString()),
            messages: chat.messages,
            winner: chat.winner
        };
        SSEConnection.send(user._id.toString(), {type: SSEType.game, payload: openedUserChat});
        SSEConnection.send(friend._id.toString(), {type: SSEType.game, payload: openedFriendChat});

        res.status(201).json({});
    } catch(e) {
        console.log(e);
    }
});

export default router;