import cryptico from 'cryptico';
import path from 'path';
import fs from 'fs';

export class Key {
    private static active = new Map<string, any>();

    private publicKey: string;
    private privateKey: any;

    constructor() {
        const phrase: string = fs.readFileSync(path.join(__dirname, '..', 'assets', 'pass-phrase.txt'), {encoding: 'utf-8'}) + Date.now().toString();
        this.privateKey = cryptico.generateRSAKey(phrase, 1024);
        this.publicKey = cryptico.publicKeyString(this.privateKey);
        Key.init(this.publicKey, this.privateKey);
    }

    public static getInstanceByPublicKey(publicKey: string): Key | null {
        return Key.active.get(publicKey) || null;
    }

    private static init(publicKey: string, privateKey: any): void {
        Key.active.set(publicKey, privateKey);

        setTimeout(() => {
            if (Key.active.has(publicKey)) {
                Key.active.delete(publicKey);
            }
        }, 60000);
    }

    decrypt(phrase: string): string | null {
        if (this.privateKey) {
            const result = cryptico.decrypt(phrase, this.privateKey);
            this.clearKey();
            return result;
        }
        return null;
    }

    private clearKey(): void {
        Key.active.delete(this.publicKey);
        this.privateKey = '';
        this.publicKey = '';
    }

    get key(): string {
        return this.publicKey;
    }
}