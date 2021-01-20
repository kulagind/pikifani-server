import { WaitingGameInvitesForRes, SentGameInvitesForRes, ReceivedGameInvitesForRes } from './../interfaces/response';
import { WaitingGameDB } from './../interfaces/mongo-models';
import { findUserBySomething, getUser } from './../utils/user';
import { Request, Response, Router } from 'express';
import { GamesInviteDB, UserDBWithMethods } from '../interfaces/mongo-models';
import { Invite, User } from '../models/user';
import { sendError } from '../utils/error';
import { wordValidators } from '../validators/validators';
import { validationResult } from 'express-validator';
import { GameInvite, WaitingGame } from '../models/game';
import { getReceivedGameInvite, getSentGameInvite } from '../utils/game';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const id = res.locals._id;
        const user: UserDBWithMethods = await User.findById(id);
        if (!user) {
            return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
        }

        const sent = user.sentGameInvites;
        const received = user.receivedGameInvites;
        const waiting = user.waitingGames;

        const foundWaiting: WaitingGameInvitesForRes[] = [];
        for (let i=0; i<waiting.length; i++) {
            const candidate: WaitingGameDB = await WaitingGame.findById(waiting[i]);
            foundWaiting.push(candidate as WaitingGameInvitesForRes);
        }

        const foundSent: SentGameInvitesForRes[] = [];
        for (let i=0; i<sent.length; i++) {
            const candidate: GamesInviteDB = await GameInvite.findById(sent[i]);
            const invite = await getSentGameInvite(candidate);
            foundSent.push(invite);
        }

        const foundReceived: ReceivedGameInvitesForRes[] = [];
        for (let i=0; i<received.length; i++) {
            const candidate: GamesInviteDB = await GameInvite.findById(received[i]);
            const invite = await getReceivedGameInvite(candidate);
            foundReceived.push(invite);
        }

        return res.status(200).json({waiting: foundWaiting, received: foundReceived, sent: foundSent});
    } catch(e) {
        console.log(e);
    }
});

router.post('/create', wordValidators, async (req: Request, res: Response) => {
    try {
        const id = res.locals._id;
        const user: UserDBWithMethods = await User.findById(id);
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
            if (friend) {
                const gameInvite: GamesInviteDB = new GameInvite({
                    word,
                    recepientId: friend._id,
                    authorId: id
                });

                await gameInvite.save();
                await user.receiveInvite(gameInvite._id, Invite.sentGameInvites);
                await friend.receiveInvite(gameInvite._id, Invite.receivedGameInvites);

                return res.status(201).json(gameInvite);
            }
            return res.status(422).json(sendError(422, 'Друг не найден'));
        } else {
            const waitingGame: WaitingGameDB = new WaitingGame({
                word,
                authorId: id
            });

            await waitingGame.save();
            await user.receiveInvite(waitingGame._id, Invite.waitingGames);

            return res.status(201).json(waitingGame);
        }
    } catch(e) {
        console.log(e);
    }
});

export default router;