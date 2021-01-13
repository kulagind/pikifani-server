import {Sequelize} from 'sequelize';
import VARIABLES from '../var/var';

const sequelize = new Sequelize(
    VARIABLES.MYSQL.DB_NAME,
    VARIABLES.MYSQL.USER_NAME,
    VARIABLES.MYSQL.USER_PASSWORD,
    {
        host: 'localhost',
        dialect: 'mysql'
    }
);

export default sequelize;