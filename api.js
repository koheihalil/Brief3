// Tumblr API

async function getTumblrPhotos(tag, apiKey) {
  let data = await (
    await fetch(
      "https://api.tumblr.com/v2/tagged?tag=" +
      tag +
      "&api_key=" +
      apiKey +
      "&limit=20&before=" +
      Math.floor(Math.random() * 2000000000)
    )
  ).json();

  // URL配列
  let photoUrls = [];

  if (data.response) {
    for (let i = 0; i < data.response.length; i++) {
      let post = data.response[i];

      // 写真あり
      if (post.photos) {
        for (let j = 0; j < post.photos.length; j++) {
          let p = post.photos[j];

          if (p.original_size) {
            if (p.original_size.url) {
              photoUrls.push(p.original_size.url);
            }
          }
        }
      }
    }
  }

  return photoUrls;
}
