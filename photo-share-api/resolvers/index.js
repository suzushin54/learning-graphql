import { GraphQLScalarType } from 'graphql';
import { photo } from '../models/photo.js';
import { user } from '../models/user.js';

const tags = [
  {'photoID': '1', 'userID': 'gPlake'},
  {'photoID': '2', 'userID': 'sSchmidt'},
  {'photoID': '2', 'userID': 'mHattrup'},
  {'photoID': '2', 'userID': 'gPlake'},
];

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
      const newPhoto = new photo({
        id, name, description, category,
      })

      await newPhoto.save();
      return newPhoto;
    }

    // postPhoto(parent, args) {
    //   var newPhoto = {
    //     id: _id++,
    //     ...args.input,
    //     created: new Date(),
    //   }
    //   photos.push(newPhoto);
    //   return newPhoto
    // }
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


}

export default resolvers
