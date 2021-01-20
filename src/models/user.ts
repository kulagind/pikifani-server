import mongoose, {Schema} from 'mongoose';
import {UserDB} from '../interfaces/mongo-models';

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
    this[inviteType] = this.sentGameInvites.filter(invite => invite.toString() !== id.toString());
    return this.save();
};

user.methods.receiveInvite = function(id: string, inviteType: Invite): Promise<UserDB> {
    if (!this[inviteType].includes(id.toString())) {
        this[inviteType].push(id.toString());
    }
    return this.save();
};

export const User = mongoose.model<UserDB>('User', user);