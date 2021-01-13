import { WordAttributes, WordCreationAttributes } from './../interfaces/models-attributes';
import { DataTypes, Model } from 'sequelize';
import mySequelize from '../utils/mysql';

export class Word extends Model<WordAttributes, WordCreationAttributes> implements WordAttributes {
    public id!: number;
    public word!: string;
}

Word.init(
    {
        id: {
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            type: DataTypes.INTEGER
        },
        word: {
            type: DataTypes.STRING(4),
            allowNull: false,
        }
    },
    {
        tableName: 'wfour',
        sequelize: mySequelize,
        createdAt: false,
        updatedAt: false
    }
);