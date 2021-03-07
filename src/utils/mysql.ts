import {Sequelize} from 'sequelize';
import VARIABLES from '../var/var';

const sequelize = new Sequelize(
    VARIABLES.MYSQL.DB_NAME,
    VARIABLES.MYSQL.USER_NAME,
    VARIABLES.MYSQL.USER_PASSWORD,
    {
        host: VARIABLES.MYSQL.HOST,
        dialect: 'mysql'
    }
);

export default sequelize;