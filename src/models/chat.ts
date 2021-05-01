import mongoose, { Schema } from 'mongoose';
import { GameDB } from '../interfaces/mongo-models';

const gameChat: Schema<GameDB> = new Schema({
    user1: {
        id: {
            type: Schema.Types.ObjectId,
            required: true
        },
        word: {
            type: String,
            required: true
        }
    },
    user2: {
        id: {
            type: Schema.Types.ObjectId,
            required: true
        },
        word: {
            type: String,
            required: true
        }
    },
    turnId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    winner: Schema.Types.ObjectId,
    toRemove: Schema.Types.ObjectId,
    messages: [{
        creationTime: {
            type: Date,
            required: true
        },
        word: {
            type: String,
            required: true
        },
        p: {
            type: Number,
            required: true
        },
        f: {
            type: Number,
            required: true
        },
        authorId: {
            type: Schema.Types.ObjectId,
            required: true
        }
    }]
});

gameChat.methods.sendMessage = async function(authorId: string, word: string): Promise<boolean> {
    if (this.messages.length > 0 && this.messages[this.messages.length - 1].authorId.toString() === authorId) {
        return false;
    }

    let opponent: {
        id: string,
        word: string
    };

    if (this.user1.id.toString() === authorId) {
        opponent = this.user2;
    } else {
        opponent = this.user1;
    }

    this.turnId = opponent.id;

    if (word === opponent.word) {
        this.winner = authorId;
        await this.save();
        return word === opponent.word;
    }

    let p: number = 0;
    let f: number = 0;
    let i: number = 0;
    let j: number = 0;

    const word1 = opponent.word.split('');
    const word2 = word.split('');
    
    for (;j < word2.length; i++) {        
        if (word1[i] === word2[j]) {
            if (i === j) {
                p++;
            } else {
                f++;
            }
        }
        if (i === (word2.length - 1)) {
            j++;
            i = 0;
        }
    };

    this.messages.push({
        creationTime: new Date(),
        word,
        p,
        f,
        authorId: authorId
    });

    await this.save();
    return word === opponent.word;
}

export const GameChat = mongoose.model<GameDB>('GameChat', gameChat);