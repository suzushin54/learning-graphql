// 1. Expressを読み込んで利用する(ApolloServerV4から統合されている)
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import { readFileSync } from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';
import expressPlayground from 'graphql-playground-middleware-express';
const graphQLPlayground = expressPlayground.default

// リゾルバを定義
// クエリを作成する場合はスキーマと同名のリゾルバ関数を定義する必要がある
import resolvers from './resolvers/index.js';

// GraphQL Schema
// NOTE: GraphQLのRoot TypeはQuery, Mutation, Subscriptionの3つ
// `totalPhotos`をQuery型に追加した
const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');


// Example data for testing
var users = [
  {'githubLogin': 'mHattrup', 'name': 'Mike Hattrup'},
  {'githubLogin': 'gPlake', 'name': 'Glen Plake'},
  {'githubLogin': 'sSchmidt', 'name': 'Scot Schmidt'},
];

var photos = [
  {
    'id': '1',
    'name': 'Dropping the Heart Chute',
    'description': 'The heart chute is one of my favorite chutes',
    'category': 'ACTION',
    'githubUser': 'gPlake',
    'created': '3-28-1977',
  },
  {
    'id': '2',
    'name': 'Enjoying the sunshine',
    'category': 'SELFIE',
    'githubUser': 'sSchmidt',
    'created': '1-2-1985',
  },
  {
    'id': '3',
    'name': 'Gunbarrel 25',
    'description': '25 laps on gunbarrel today',
    'category': 'LANDSCAPE',
    'githubUser': 'sSchmidt',
    'created': '2018-04-15T19:09:57.308Z',
  },
];

const tags = [
  {'photoID': '1', 'userID': 'gPlake'},
  {'photoID': '2', 'userID': 'sSchmidt'},
  {'photoID': '2', 'userID': 'mHattrup'},
  {'photoID': '2', 'userID': 'gPlake'},
];

// 2. Create an express application
const app = express();
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
app.get('/playground', graphQLPlayground({ endpoint: '/graphql' }));

app.listen({port: 4000}, () =>
  console.log('🚀 GraphQL Server running at http://localhost:4000/graphql'),
);
