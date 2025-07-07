import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: console.log,
        timezone: '+05:30',
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

sequelize
    .authenticate()
    .then(() => {
        console.log('✅ Connection to MySQL has been established successfully.');
    })
    .catch((error) => {
        console.error('❌ Unable to connect to the database:', error);
    });

export default sequelize;