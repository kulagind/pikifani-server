import mongoose, {Schema} from 'mongoose';
import {UserDB} from '../interfaces/mongo-models';

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

user.methods.addSentFriendInvite = function(inviteId: string) {
    this.sentFriendInvites.push(inviteId);
    return this.save();
};

user.methods.addReceivedFriendInvite = function(inviteId: string) {
    this.receivedFriendInvites.push(inviteId);
    return this.save();
};

user.methods.removeSentFriendInvite = function(inviteId: string) {
    this.sentFriendInvites = this.sentFriendInvites.filter(invite => invite._id !== inviteId);
    return this.save();
};

user.methods.removeReceivedFriendInvite = function(inviteId: string) {
    this.receivedFriendInvites = this.receivedFriendInvites.filter(invite => invite._id !== inviteId);
    return this.save();
};

export const User = mongoose.model<UserDB>('User', user);