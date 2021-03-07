import { GamesInviteDB, UserDB } from './../interfaces/mongo-models';
import { ReceivedGameInvitesForRes, SentGameInvitesForRes } from "../interfaces/response";
import { User } from '../models/user';

export async function getSentGameInvite(gameInvite: GamesInviteDB): Promise<SentGameInvitesForRes> {
    const friend: UserDB = (await User.findById(gameInvite.recepientId)) as UserDB;
    return {
        _id: gameInvite._id,
        word: gameInvite.word,
        friend: friend.name
    };
}

export async function getReceivedGameInvite(gameInvite: GamesInviteDB): Promise<ReceivedGameInvitesForRes> {
    const friend: UserDB = (await User.findById(gameInvite.authorId)) as UserDB;
    return {
        _id: gameInvite._id,
        friend: friend.name
    };
}