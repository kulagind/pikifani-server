export enum SSEType {
    'game' = 'game',
    'games' = 'games',
    'friends' = 'friends',
    'invites' = 'invites',
    'user' = 'user',
}

export interface SSETick {
    type: SSEType,
    payload: any
}