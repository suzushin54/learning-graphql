// Expressを読み込んで利用する(ApolloServerV4から統合されている)
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import { readFileSync } from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';
import expressPlayground from 'graphql-playground-middleware-express';
const graphQLPlayground = expressPlayground.default;
import mongoose from 'mongoose';
mongoose.set('strictQuery', false);
import dotenv from 'dotenv';
const config = dotenv.config();

// NOTE: Queryを作成する場合はSchemaと同名のResolver関数を定義する必要がある
import resolvers from './resolvers/index.js';

// NOTE: GraphQL Schema. Root TypeはQuery, Mutation, Subscriptionの3つ
const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');

async function start() {
  const app = express();

  try {
    await mongoose.connect(process.env.DB_HOST);
  } catch (error) {
    console.log(`
      Mongo DB Host not found! please add DB_HOST environment variable to .env file.
      exiting...
    `);
    process.exit(1)
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Note you must call `server.start()` on the `ApolloServer`
  // instance before passing the instance to `expressMiddleware`
  await server.start();

  // Specify the path where we'd like to mount our server
  app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server));

  app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'));
  app.get('/playground', graphQLPlayground({endpoint: '/graphql'}));

  app.listen({port: 4000}, () =>
    console.log('🚀 GraphQL Server running at http://localhost:4000/graphql'),
  );
}

start();
