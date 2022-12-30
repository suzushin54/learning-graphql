// 写真を格納するための配列を定義する(後ほどDBに置き換える)
var _id = 1;
var photos = [];

export default {
  // parent: 親オブジェクトへの参照
  // args: クエリに渡された引数(name, description(optional))
  postPhoto(parent, args) {
    var newPhoto = {
      id: _id++,
      ...args.input,
      created: new Date(),
    };
    photos.push(newPhoto);
    return newPhoto;
  },
};
