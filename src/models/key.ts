// @ts-ignore
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

export class Encrypter {
    private static active = new Map<string, Encrypter>();

    private publicKey: string;
    private privateKey: string;
    private phrase: string;

    constructor() {
        this.phrase = fs.readFileSync(path.join(__dirname, '..', 'assets', 'pass-phrase.txt'), {encoding: 'utf-8'}) + Date.now().toString();
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 1024,
            publicKeyEncoding: {
              type: 'pkcs1',
              format: 'pem'
            },
            privateKeyEncoding: {
              type: 'pkcs1',
              format: 'pem',
              cipher: 'aes-256-cbc',
              passphrase: this.phrase
            }
        });
        this.privateKey = privateKey;
        this.publicKey = publicKey;

        Encrypter.init(this);
    }

    public static getInstanceByPublicKey(publicKey: string): Encrypter | null {
        return Encrypter.active.get(publicKey) || null;
    }

    private static init(instance: Encrypter): void {
        Encrypter.active.set(instance.key, instance);

        setTimeout(() => {
            if (Encrypter.active.has(instance.key)) {
                Encrypter.active.delete(instance.key);
            }
        }, 60000);
    }

    decrypt(encryptedBuffer: Buffer): string | null {
        if (this.privateKey) {
            const result = crypto.privateDecrypt({
                key: this.privateKey,
                passphrase: this.phrase,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
            }, encryptedBuffer);
            return result.toString('utf-8');
        }
        return null;
    }

    clearKey(): void {
        Encrypter.active.delete(this.publicKey);
        this.privateKey = '';
        this.publicKey = '';
        this.phrase = '';
    }

    get key(): string {
        return this.publicKey;
    }
}