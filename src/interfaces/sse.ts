export enum SSEType {
    'game' = 'game',
    'games' = 'games',
    'friends' = 'friends',
    'invites' = 'invites',
}

export interface SSETick {
    type: SSEType,
    payload: any
}