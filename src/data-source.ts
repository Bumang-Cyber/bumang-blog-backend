// src/data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [__dirname + '/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.ts'],
  synchronize: process.env.NODE_ENV === 'development',
});

// type: 'postgres',
// host: process.env.DB_HOST,
// port: parseInt(process.env.DB_PORT || '5432'),
// username: process.env.POSTGRES_USER,
// password: process.env.POSTGRES_PASSWORD,
// database: process.env.POSTGRES_DB,
// entities: [__dirname + '/**/*.entity.{ts,js}'],
// // nest.js의 typeorm 코드와 실제 db환경을 연동할 것인가?
// synchronize: process.env.NODE_ENV === 'development',
// // synchronize: false
