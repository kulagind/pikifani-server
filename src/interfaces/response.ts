export interface Response {
    
}

export interface CustomError {
    status: number,
    message: string
}

export interface SentGameInvitesForRes {
    _id: string,
    word: string,
    friend: string
}

export interface ReceivedGameInvitesForRes {
    _id: string,
    friend: string
}

export interface WaitingGameInvitesForRes {
    _id: string
    word: string
}