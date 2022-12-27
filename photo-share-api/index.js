import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { GraphQLScalarType } from 'graphql';

// GraphQL Schema

// NOTE: GraphQLのRoot TypeはQuery, Mutation, Subscriptionの3つ
// `totalPhotos`をQuery型に追加した
const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')

// 写真を格納するための配列を定義する(後ほどDBに置き換える)
var _id = 1;
// var photos = [];

// Example data for testing
var users = [
  { "githubLogin": "mHattrup", "name": "Mike Hattrup" },
  { "githubLogin": "gPlake", "name": "Glen Plake" },
  { "githubLogin": "sSchmidt", "name": "Scot Schmidt" }
];

var photos = [
  {
    "id": "1",
    "name": "Dropping the Heart Chute",
    "description": "The heart chute is one of my favorite chutes",
    "category": "ACTION",
    "githubUser": "gPlake",
    "created": "3-28-1977",
  },
  {
    "id": "2",
    "name": "Enjoying the sunshine",
    "category": "SELFIE",
    "githubUser": "sSchmidt",
    "created": "1-2-1985",
  },
  {
    "id": "3",
    "name": "Gunbarrel 25",
    "description": "25 laps on gunbarrel today",
    "category": "LANDSCAPE",
    "githubUser": "sSchmidt",
    "created": "2018-04-15T19:09:57.308Z",
  }
]

const tags = [
  { "photoID": "1", "userID": "gPlake" },
  { "photoID": "2", "userID": "sSchmidt" },
  { "photoID": "2", "userID": "mHattrup" },
  { "photoID": "2", "userID": "gPlake" },
]

// リゾルバを定義
// クエリを作成する場合はスキーマと同名のリゾルバ関数を定義する必要がある
const resolvers = {
  Query: {
    // 写真を格納するための配列を定義
    totalPhotos: () => photos.length,
    allPhotos: (parent, args) => {
      return photos
    },
  },

  // postPhotoと対応するresolver
  Mutation: {
    // parent: 親オブジェクトへの参照
    // args: クエリに渡された引数(name, description(optional))
    postPhoto(parent, args) {
      var newPhoto = {
        id: _id++,
        ...args.input,
        created: new Date(),
      }
      photos.push(newPhoto);
      return newPhoto
    }
  },

  Photo: {
    url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: parent => {
      return users.find(u => u.githubLogin === parent.githubUser)
    },
    taggedUsers: parent => tags
      // 対象の写真が関係しているタグの配列を取得
      .filter(tag => tag.photoID === parent.id)
      // タグの配列からユーザーIDの配列に変換
      .map(tag => tag.userID)
      // ユーザーIDからユーザー情報を取得
      .map(userID => users.find(u => u.githubLogin === userID))
  },
  User: {
    postedPhotos: parent => {
      return photos.filter(p => p.githubUser === parent.githubLogin)
    },
    inPhotos: parent => tags
      // 対象のユーザーが関係しているタグの配列を取得
      .filter(tag => tag.userID === parent.id)
      // タグの配列から写真IDの配列に変換
      .map(tag => tag.photoID)
      // 写真IDから写真情報を取得
      .map(photoID => photos.find(p => p.id === photoID))
  },
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value.',
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  })
};

// Create a server instance
const s = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(s);
console.log(`🚀 Server ready at ${url}`);
