import { GameResult } from '../interfaces/chat';
import { User } from '../models/user';
import { GameDB, UserDBWithMethods } from './../interfaces/mongo-models';

export interface ChatForRes {
    word: string,
    turnId: string,
    friend: string,
    gameId?: string,
    winner?: string
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
        friend: friend.name,
        winner: chat.winner,
        gameId: chat._id
    }
}

export async function getResult(chat: GameDB, clientId: string): Promise<GameResult> {
    let user, friendId, friendWord;
    if (chat.user1.id.toString() === clientId.toString()) {
        user = chat.user1;
        friendId = chat.user2.id;
        friendWord = chat.user2.word;
    } else {
        user = chat.user2;
        friendId = chat.user1.id;
        friendWord = chat.user1.word;
    }

    const friend: UserDBWithMethods = await User.findById(friendId);

    return {
        word: user.word,
        gameId: chat._id,
        friend: friend.name,
        winner: chat.winner,
        friendWord
    }
}

export function getOpponentId(chat: GameDB, clientId: string): string {
    if (chat.user1.id.toString() === clientId.toString()) {
        return chat.user2.id;
    } else {
        return chat.user1.id;
    }
}