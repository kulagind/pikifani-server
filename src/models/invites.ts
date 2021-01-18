import mongoose, {Schema} from 'mongoose';
import {FriendsInvitesDB} from '../interfaces/mongo-models';

const friendInvite: Schema = new Schema({
    authorId: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    recepientId: {
        type: [Schema.Types.ObjectId],
        required: true
    }
});

export const FriendInvite = mongoose.model<FriendsInvitesDB>('FriendInvite', friendInvite);