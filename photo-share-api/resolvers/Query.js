export default {
    // 写真を格納するための配列を定義
    totalPhotos: () => photos.length,
    allPhotos: (parent, args) => {
      return photos;
    },
};
