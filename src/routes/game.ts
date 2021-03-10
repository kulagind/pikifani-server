import { GameChat } from './../models/chat';
import { GameDB, WaitingGameDB } from './../interfaces/mongo-models';
import { findUserBySomething } from './../utils/user';
import { Request, Response, Router } from 'express';
import { GamesInviteDB, UserDBWithMethods } from '../interfaces/mongo-models';
import { Invite, User } from '../models/user';
import { sendError } from '../utils/error';
import { wordValidators } from '../validators/validators';
import { validationResult } from 'express-validator';
import { GameInvite, WaitingGame } from '../models/game';
import { randomNumber } from '../utils/random-int';
import { ChatForRes, getChat } from '../utils/chat';
import { SSEConnection } from '../models/sse';
import { SSEType } from '../interfaces/sse';
import { Notification, NotificationMessage } from '../models/notification';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const id = res.locals._id;
        const user: UserDBWithMethods = (await User.findById(id)) as UserDBWithMethods;
        if (!user) {
            return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
        }
        
        const invites = await user.getInvites();

        return res.status(200).json(invites);
    } catch(e) {
        console.log(e);
    }
});

router.post('/create', wordValidators, async (req: Request, res: Response) => {
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

        const {name, word} = req.body;

        if (name) {
            const friend = await findUserBySomething(name);
            if (friend && friend._id != id) {
                const gameInvite: GamesInviteDB = new GameInvite({
                    word,
                    recepientId: friend._id,
                    authorId: id
                });

                await gameInvite.save();
                await user.receiveInvite(gameInvite._id, Invite.sentGameInvites);
                await friend.receiveInvite(gameInvite._id, Invite.receivedGameInvites);

                const invitesUser = await user.getInvites();
                const invitesFriend = await friend.getInvites();
                SSEConnection.send(user._id.toString(), {type: SSEType.invites, payload: invitesUser});
                SSEConnection.send(friend._id.toString(), {type: SSEType.invites, payload: invitesFriend});

                Notification.send(friend.sub, new NotificationMessage('Давай сыграем?', `Запрос от ${user.name}`));

                return res.status(201).json(gameInvite);
            }
            return res.status(422).json(sendError(422, 'Друг не найден'));
        } else {
            const foundWaiting: WaitingGameDB = (await WaitingGame.findOneAndDelete({
                authorId: {
                    $ne: user._id
                }
            })) as WaitingGameDB;
            
            if (foundWaiting) {
                const friend: UserDBWithMethods = (await User.findById(foundWaiting.authorId)) as UserDBWithMethods;
                const game: GameDB = new GameChat({
                    user1: {
                        id: foundWaiting.authorId,
                        word: foundWaiting.word
                    },
                    user2: {
                        id,
                        word
                    },
                    turnId: randomNumber(0, 1) ? foundWaiting.authorId : id,
                    messages: []
                });

                await game.save();
                await friend.removeInvite(foundWaiting._id, Invite.waitingGames);
                await user.startGame(game._id);
                await friend.startGame(game._id);
                
                const invitesFriend = await friend.getInvites();
                SSEConnection.send(friend._id.toString(), {type: SSEType.invites, payload: invitesFriend});
                
                const userChats: ChatForRes[] = await user.getChats();
                const friendChats: ChatForRes[] = await friend.getChats();
                SSEConnection.send(user._id.toString(), {type: SSEType.games, payload: userChats});
                SSEConnection.send(friend._id.toString(), {type: SSEType.games, payload: friendChats});

                Notification.send(friend.sub, new NotificationMessage('Игра началась', `Начало партии с ${user.name}`));

                return res.status(201).json(getChat(game, id));
            } else {
                const waitingGame: WaitingGameDB = new WaitingGame({
                    word,
                    authorId: id
                });
    
                await waitingGame.save();
                await user.receiveInvite(waitingGame._id, Invite.waitingGames);

                const invitesUser = await user.getInvites();
                SSEConnection.send(user._id.toString(), {type: SSEType.invites, payload: invitesUser});
    
                return res.status(201).json(waitingGame);
            }
        }
    } catch(e) {
        console.log(e);
    }
});

export default router;