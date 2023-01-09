import { GraphQLScalarType } from 'graphql';
import { photo } from '../models/photo.js';
import { user } from '../models/user.js';
import { authorizeWithGithub } from '../lib.js';
import dotenv from 'dotenv';
const config = dotenv.config();

// root: 親オブジェクトへの参照
// args: クエリに渡された引数(name, description(optional) ...etc)

// TODO: Query, Mutation, Typesのファイル分割

const resolvers = {
  Query: {
    totalPhotos: async(root, args) => await photo.countDocuments(),
    allPhotos: async(root, args) => await photo.find({}),
    totalUsers: async(root, args) => await user.countDocuments(),
    allUsers: async(root, args) => await user.find({}),
  },

  Mutation: {
    postPhoto: async(root, args, context) => {
      const { id, name, description, category } = args.input;
      const created = new Date();
      const newPhoto = new photo({
        id, name, description, category, created,
      })

      await newPhoto.save();
      return newPhoto;
    },
    async githubAuth(root, { code }, context) {
      // fetch user data from github
      let { message, access_token, avatar_url, login, name }
        = await authorizeWithGithub({
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          code,
      });
      // if error, throw error
      if (message) {
        throw new Error(message);
      }

      // combine user data
      let latestUserInfo = {
        name: name,
        githubLogin: login,
        githubToken: access_token,
        avatar: avatar_url,
      }

      const { ops:[user] } = await context.db
        .collection('users')
        .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

      return { user, token: access_token };
    }
  },

  Photo: {
    url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: async(root, args) => await user.find(u => u.githubLogin === root.githubUser),
    // postedBy: parent => {
    //   return users.find(u => u.githubLogin === parent.githubUser)
    // },
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


}

export default resolvers
