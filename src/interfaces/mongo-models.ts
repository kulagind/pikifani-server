import { Document } from 'mongoose';
import { Invite } from '../models/user';

export interface FromDB {
    _doc: any
}

export interface UserDB extends Document {
    name: string,
    email: string,
    password: string,
    gamesQuantity: number,
    winsQuantity: number,
    friends: UserDB['_id'][],
    games: GameDB['_id'][],
    sub?: any,
    receivedGameInvites: GamesInviteDB['_id'][],
    sentGameInvites: GamesInviteDB['_id'][],
    receivedFriendInvites: UserDB['_id'][],
    sentFriendInvites: UserDB['_id'][],
    waitingGames: WaitingGameDB['_id'][]
}

export interface UserDBWithMethods extends UserDB, Document {
    addFriend(id: string): Promise<UserDB>,
    addWaitingGame(id: string): Promise<UserDB>,
    receiveInvite(id: string, inviteType: Invite): Promise<UserDB>,
    removeInvite(id: string, inviteType: Invite): Promise<UserDB>,
    startGame(id: string): Promise<UserDB>,
    getInvites(): Promise<any>;
    getFriends(): Promise<any>;
    getChats(): Promise<any>;
    removeChat(id: string): Promise<UserDB>;
    subscribeToPush(sub: any): Promise<UserDB>;
    unsubscribeFromPush(): Promise<UserDB>;
}

export interface GamesInviteDB extends Document {
    authorId: UserDB['_id'],
    word: string,
    recepientId: UserDB['_id']
}

export interface WaitingGameDB extends Document {
    authorId: UserDB['_id'],
    word: string
}

export interface GameDB extends Document {
    user1: {
        id: UserDB['_id'],
        word: string
    },
    user2: {
        id: UserDB['_id'],
        word: string
    },
    winner: UserDB['_id'],
    toRemove: UserDB['_id'],
    turnId: UserDB['_id'],
    messages: MessageDB[]
}

export interface GameDBWithMethods extends GameDB, Document {
    sendMessage(userId: string, word: string): Promise<boolean>;
}

export interface MessageDB {
    creationTime: Date,
    word: string,
    p: number,
    f: number,
    authorId: UserDB['_id']
}
