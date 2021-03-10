import { UserDBWithMethods } from './../interfaces/mongo-models';
import mongoose, {Schema} from 'mongoose';
import {GameDB, GamesInviteDB, UserDB, WaitingGameDB} from '../interfaces/mongo-models';
import { ReceivedGameInvitesForRes, SentGameInvitesForRes, WaitingGameInvitesForRes } from '../interfaces/response';
import { SSEType } from '../interfaces/sse';
import { UserForRes } from '../interfaces/user';
import { ChatForRes, getChat } from '../utils/chat';
import { getReceivedGameInvite, getSentGameInvite } from '../utils/game';
import { getUser } from '../utils/user';
import { GameChat } from './chat';
import { GameInvite, WaitingGame } from './game';
import { SSEConnection } from './sse';

export enum Invite {
    friends = 'friends',
    games = 'games',
    receivedGameInvites = 'receivedGameInvites',
    sentGameInvites = 'sentGameInvites',
    receivedFriendInvites = 'receivedFriendInvites',
    sentFriendInvites = 'sentFriendInvites',
    waitingGames = 'waitingGames',
}

const user: Schema<UserDB> = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    gamesQuantity: {
        type: Number,
        required: true
    },
    winsQuantity: {
        type: Number,
        required: true
    },
    sub: {
        type: Object,
        required: false
    },
    friends: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    games: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    receivedGameInvites: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    sentGameInvites: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    receivedFriendInvites: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    sentFriendInvites: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    waitingGames: {
        type: [Schema.Types.ObjectId],
        required: true
    }
});

user.methods.addFriend = function(friendId: string): Promise<UserDB> {
    let inviteIndex: number = this.receivedFriendInvites.findIndex(value => value.toString() === friendId.toString());    
    let isInviteFound: boolean = false;
    if (inviteIndex >= 0) {
        this.receivedFriendInvites.splice(inviteIndex, 1);
        isInviteFound = true;
    }
    inviteIndex = this.sentFriendInvites.findIndex(value => value.toString() === friendId.toString());
    if (inviteIndex >= 0) {
        this.sentFriendInvites.splice(inviteIndex, 1);
        isInviteFound = true;
    }

    if (!this.friends.includes(friendId.toString()) && isInviteFound) {
        this.friends.push(friendId.toString());
    }
    return this.save();
};

user.methods.joinTheQueue = function(id: string): Promise<UserDB> {
    this.waitingGames.push(id.toString());
    return this.save();
}

user.methods.removeInvite = function(id: string, inviteType: Invite): Promise<UserDB> {
    this[inviteType] = this[inviteType].filter(invite => invite.toString() !== id.toString());
    return this.save();
};

user.methods.removeChat = function(id: string): Promise<UserDB> {
    this.games = this.games.filter(game => game.toString() !== id.toString());
    return this.save();
};

user.methods.receiveInvite = function(id: string, inviteType: Invite): Promise<UserDB> {
    if (!this[inviteType].includes(id.toString())) {
        this[inviteType].push(id.toString());
    }
    return this.save();
};

user.methods.startGame = function(id: string): Promise<UserDB> {
    if (!this.games.includes(id.toString())) {
        this.games.push(id.toString());
        this.gamesQuantity++;
        SSEConnection.send(this._id.toString(), {type: SSEType.user, payload: getUser(this)})
    }
    return this.save();
}

user.methods.getInvites = async function(): Promise<{
    waiting: WaitingGameInvitesForRes[], 
    received: ReceivedGameInvitesForRes[], 
    sent: SentGameInvitesForRes[]
}> {
    const foundWaiting: WaitingGameInvitesForRes[] = [];
    for (let i=0; i<this.waitingGames.length; i++) {
        const candidate: WaitingGameDB = (await WaitingGame.findById(this.waitingGames[i])) as WaitingGameDB;
        foundWaiting.push(candidate as WaitingGameInvitesForRes);
    }

    const foundSent: SentGameInvitesForRes[] = [];
    for (let i=0; i<this.sentGameInvites.length; i++) {
        const candidate: GamesInviteDB = (await GameInvite.findById(this.sentGameInvites[i])) as GamesInviteDB;
        const invite = await getSentGameInvite(candidate);
        foundSent.push(invite);
    }

    const foundReceived: ReceivedGameInvitesForRes[] = [];
    for (let i=0; i<this.receivedGameInvites.length; i++) {
        const candidate: GamesInviteDB = (await GameInvite.findById(this.receivedGameInvites[i])) as GamesInviteDB;            
        const invite = await getReceivedGameInvite(candidate);
        foundReceived.push(invite);
    }

    return {waiting: foundWaiting, received: foundReceived, sent: foundSent};
};

user.methods.getFriends = async function(): Promise<{
    friends: UserForRes[], 
    received: UserForRes[], 
    sent: UserForRes[]
}> {
    const foundFriends: UserForRes[] = [];
    for (let i=0; i<this.friends.length; i++) {
        const candidate: UserDBWithMethods = (await User.findById(this.friends[i])) as UserDBWithMethods;
        foundFriends.push(getUser(candidate));
    }

    const foundSent: UserForRes[] = [];
    for (let i=0; i<this.sentFriendInvites.length; i++) {
        const candidate: UserDBWithMethods = (await User.findById(this.sentFriendInvites[i])) as UserDBWithMethods;
        foundSent.push(getUser(candidate));
    }

    const foundReceived: UserForRes[] = [];
    for (let i=0; i<this.receivedFriendInvites.length; i++) {
        const candidate: UserDBWithMethods = (await User.findById(this.receivedFriendInvites[i])) as UserDBWithMethods;
        foundReceived.push(getUser(candidate));
    }

    return {friends: foundFriends, received: foundReceived, sent: foundSent};
};

user.methods.getChats = async function(): Promise<ChatForRes[]> {
    const chats: ChatForRes[] = [];
    const chatsToRemove: string[] = [];
    for (let item of this.games) {
        const chat: GameDB = (await GameChat.findById(item)) as GameDB;
        if (chat) {
            const chatForRes = await getChat(chat, this._id);            
            chats.push({gameId: item, ...chatForRes});
        } else {
            chatsToRemove.push(item.toString());
        }
    }
    this.games = this.games.filter(game => !chatsToRemove.includes(game.toString()));
    await this.save();
    return chats;
}

user.methods.subscribeToPush = function(sub: any): Promise<UserDB> {
    this.sub = sub;
    return this.save();
}

user.methods.unsubscribeFromPush = function(): Promise<UserDB> {
    if (this.sub) {
        delete this.sub;
    }
    return this.save();
}

export const User = mongoose.model<UserDB>('User', user);