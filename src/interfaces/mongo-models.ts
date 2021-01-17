import { Document } from 'mongoose';

export interface FromDB {
    _doc: any
}

export interface UserDB extends Document {
    name: string,
    password: string,
    gamesQuantity: number,
    winsQuantity: number,
    friends: UserDB['_id'][],
    games: GameDB['_id'][],
    receivedGameInvites: GamesInvitesDB['_id'][],
    sentGameInvites: GamesInvitesDB['_id'][],
    receivedFriendInvites: FriendsInvitesDB['_id'][],
    sentFriendInvites: FriendsInvitesDB['_id'][],
    waitingGames: WaitingGamesDB['_id'][]
}

export interface FriendsInvitesDB extends Document {
    authorId: UserDB['_id'],
    recepientId: UserDB['_id']
}

export interface GamesInvitesDB extends Document {
    authorId: UserDB['_id'],
    word: string,
    recepientId: UserDB['_id']
}

export interface WaitingGamesDB extends Document {
    authorId: UserDB['_id'],
    word: string
}

export interface GameDB extends Document {
    user1: UserDB['_id'],
    user2: UserDB['_id'],
    userWord1: string,
    userWord2: string,
    turnId: UserDB['_id'],
    messages: MessageDB[]
}

export interface MessageDB {
    creationTime: Date,
    word: string,
    p: number,
    f: number,
    authorId: UserDB['_id']
}