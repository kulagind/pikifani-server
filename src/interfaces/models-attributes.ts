import { Optional } from "sequelize";

export interface WordAttributes {
    id: number,
    word: string
}

export interface WordCreationAttributes extends Optional<WordAttributes, 'id'> {}