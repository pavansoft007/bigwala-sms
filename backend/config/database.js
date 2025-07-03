import {Sequelize} from "sequelize";
import dotenv from 'dotenv';
dotenv.config({});

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        timezone: '+05:30',
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port:process.env.DB_PORT
    }
);

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection to MySQL has been established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });

export default sequelize;
