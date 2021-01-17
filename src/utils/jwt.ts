import {verify} from 'jsonwebtoken';
import fs from 'fs';
import path from 'path'

export function getUserIdByJWT(jwt: string): string {
    const decoded = verify(jwt, fs.readFileSync(path.join(__dirname, '..', 'assets', 'key.txt'))) as {_id: string};
    return decoded['_id'];
}