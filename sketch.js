let tumblrTag = "aesthetic";

let tumblrApiKey = "0J0PSSVhZk9NywfQifZAFNKn0icMCsLIjkBlIxw1XfBV5oqFdD";

// 実行中フラグ
let processing = false;

async function startApp() {
  if (modelsReady == false) {
    return;
  }

  // 連打防止
  if (processing) {
    return;
  }

  processing = true;

  // URL取得
  let urls = await getTumblrPhotos(tumblrTag, tumblrApiKey);

  // 2枚未満は終了
  if (urls.length < 2) {
    processing = false;
    return;
  }

  // 要素取得
  let image1 = document.getElementById("img1");
  let image2 = document.getElementById("img2");

  // 1枚目
  image1.onload = function() {
    // 2枚目
    image2.onload = async function() {
      // スコア
      let scores1 = await getScores(image1);
      let scores2 = await getScores(image2);

        document.getElementById("scores1").textContent =
          "L " + scores1.luminance.toFixed(2) + "   " +
          "C " + scores1.chroma.toFixed(2) + "   " +
          "X " + scores1.comp.toFixed(2) + "   " +
          "O " + scores1.org.toFixed(2) + "   " +
          "F " + scores1.face.toFixed(2);

        document.getElementById("scores2").textContent =
          "L " + scores2.luminance.toFixed(2) + "   " +
          "C " + scores2.chroma.toFixed(2) + "   " +
          "X " + scores2.comp.toFixed(2) + "   " +
          "O " + scores2.org.toFixed(2) + "   " +
          "F " + scores2.face.toFixed(2);

        document.getElementById("score").textContent = "SCORE  " + calculateDifference(scores1, scores2).toFixed(2);

      processing = false;
    };

    image2.src = urls[1];
  };

  image1.src = urls[0];
}

function setup() {
  noCanvas();
  // 最初にモデル3つを読み込む
  initModels();
}

function draw() {
}

function keyPressed() {
  if (keyCode == 32) {
    startApp();
  }
}
