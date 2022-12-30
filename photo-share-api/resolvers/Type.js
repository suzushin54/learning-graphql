import { GraphQLScalarType } from 'graphql';

export default {
  Photo: {
    url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: parent => {
      return users.find(u => u.githubLogin === parent.githubUser);
    },
    taggedUsers: parent => tags
      // 対象の写真が関係しているタグの配列を取得
      .filter(tag => tag.photoID === parent.id)
      // タグの配列からユーザーIDの配列に変換
      .map(tag => tag.userID)
      // ユーザーIDからユーザー情報を取得
      .map(userID => users.find(u => u.githubLogin === userID)),
  },
  User: {
    postedPhotos: parent => {
      return photos.filter(p => p.githubUser === parent.githubLogin);
    },
    inPhotos: parent => tags
      // 対象のユーザーが関係しているタグの配列を取得
      .filter(tag => tag.userID === parent.id)
      // タグの配列から写真IDの配列に変換
      .map(tag => tag.photoID)
      // 写真IDから写真情報を取得
      .map(photoID => photos.find(p => p.id === photoID)),
  },
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value.',
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value,
  }),
};
