import { User } from '../models/user';
import { GameDB, UserDBWithMethods } from './../interfaces/mongo-models';

export interface ChatForRes {
    word: string,
    turnId: string,
    friend: string,
    gameId?: string
}

export async function getChat(chat: GameDB, clientId: string): Promise<ChatForRes> {
    let user;
    let friendId;
    if (chat.user1.id.toString() === clientId.toString()) {
        user = chat.user1;
        friendId = chat.user2.id;
    } else {
        user = chat.user2;
        friendId = chat.user1.id;
    }

    const friend: UserDBWithMethods = await User.findById(friendId);

    return {
        word: user.word,
        turnId: chat.turnId,
        friend: friend.name
    }
}