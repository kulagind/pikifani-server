import { Variables } from './../interfaces/variables';

const variables: Variables = {
    MONGODB_URI: 'mongodb://mongodb:27017/pikifani',
    MYSQL: {
        DB_NAME: 'pfWords',
        USER_NAME: 'admin',
        USER_PASSWORD: 'admin',
        HOST: 'mysql',
    },
    PORT: 8000,
    SSL_PORT: 8001,
    SSL_CERT: 'assets/cert/server.crt',
    SSL_KEY: 'assets/cert/server.key',
    VAPID_PUBLIC: 'assets/cert/server.crt',
    VAPID_PRIVATE: 'assets/cert/server.crt',
    DOMAIN: 'localhost'
};

export default variables;