import { ChatForRes } from './../utils/chat';
import { GameChat } from './../models/chat';
import { GameDB, UserDBWithMethods, GamesInviteDB } from './../interfaces/mongo-models';
import { Request, Response, Router } from "express";
import { Invite, User } from "../models/user";
import { sendError } from "../utils/error";
import { getChat } from '../utils/chat';
import { wordValidators } from '../validators/validators';
import { validationResult } from 'express-validator';
import { GameInvite } from '../models/game';
import { randomNumber } from '../utils/random-int';
import { SSEConnection } from '../models/sse';
import { SSEType } from '../interfaces/sse';
import { Notification, NotificationMessage } from '../models/notification';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const clientId = res.locals._id;
        const client: UserDBWithMethods = (await User.findById(clientId)) as UserDBWithMethods;
        if (!client) {
            res.status(401).json(sendError(401, 'Неавторизованный пользователь'));
        }

        const chats: ChatForRes[] = await client.getChats();

        res.status(200).json({chats});
    } catch(e) {
        console.log(e);
    }
});

router.post('/', wordValidators, async (req: Request, res: Response) => {
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

        const {inviteId, word} = req.body;

        if (inviteId) {
            const gameInvite: GamesInviteDB = (await GameInvite.findByIdAndDelete(inviteId)) as GamesInviteDB;
            const friend: UserDBWithMethods = (await User.findById(gameInvite.authorId)) as UserDBWithMethods;
            if (gameInvite && friend) {
                const game: GameDB = new GameChat({
                    user1: {
                        id: gameInvite.authorId,
                        word: gameInvite.word
                    },
                    user2: {
                        id,
                        word
                    },
                    turnId: randomNumber(0, 1) ? gameInvite.authorId : id,
                    messages: []
                });

                await game.save();
                await user.removeInvite(gameInvite._id, Invite.receivedGameInvites);
                await friend.removeInvite(gameInvite._id, Invite.sentGameInvites);
                await user.startGame(game._id);
                await friend.startGame(game._id);

                const responseJson = await getChat(game, id);

                const userChats: ChatForRes[] = await user.getChats();
                const friendChats: ChatForRes[] = await friend.getChats();
                SSEConnection.send(user._id.toString(), {type: SSEType.games, payload: userChats});
                SSEConnection.send(friend._id.toString(), {type: SSEType.games, payload: friendChats});

                const invitesUser = await user.getInvites();
                const invitesFriend = await friend.getInvites();
                SSEConnection.send(user._id.toString(), {type: SSEType.invites, payload: invitesUser});
                SSEConnection.send(friend._id.toString(), {type: SSEType.invites, payload: invitesFriend});

                Notification.send(friend.sub, new NotificationMessage('Игра началась', `Начало партии с ${user.name}`));

                return res.status(201).json(responseJson);
            }
            return res.status(422).json(sendError(422, 'Игра не найдена'));
        }
        return res.status(422).json(sendError(422, 'Необходимо отправить запрос с телом {inviteId: string, word: string}'));
    } catch(e) {
        console.log(e);
    }
});

export default router;