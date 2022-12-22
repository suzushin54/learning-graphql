import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// GraphQL Schema

// NOTE: GraphQLのRoot TypeはQuery, Mutation, Subscriptionの3つ
// `totalPhotos`をQuery型に追加した
const typeDefs = `

  # Photoの型定義
  type Photo {
    id: ID!
    name: String!
    url: String!
    description: String
  }
  
  # Query型の定義
  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }
    
  type Mutation {
    postPhoto(name: String! description: String): Photo!
  }
`;

// 写真を格納するための配列を定義する(後ほどDBに置き換える)
var _id = 1;
var photos = [];

// リゾルバを定義
// クエリを作成する場合はスキーマと同名のリゾルバ関数を定義する必要がある
const resolvers = {
  Query: {
    // 写真を格納するための配列を定義
    totalPhotos: () => photos.length,
    allPhotos: () => photos,
  },

  // postPhotoと対応するresolver
  Mutation: {
    // parent: 親オブジェクトへの参照
    // args: クエリに渡された引数(name, description(optional))
    postPhoto(parent, args) {
      var newPhoto = {
        id: _id++,
        ...args
      }

      photos.push(newPhoto);
      return newPhoto
    }
  }
};

// Create a server instance
const s = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(s);
console.log(`🚀 Server ready at ${url}`);
