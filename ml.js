// Teachable Machine

// URL
let compUrl = "https://teachablemachine.withgoogle.com/models/CEVqOKlpY/";
let orgUrl = "https://teachablemachine.withgoogle.com/models/WaOes3z-Z/";
let faceUrl = "https://teachablemachine.withgoogle.com/models/qsSVaHLOW/";

let compModel = null;
let orgModel = null;
let faceModel = null;
let modelsReady = false;

async function initModels() {
  console.log("モデル読み込み開始");

  compModel = await tmImage.load(compUrl + "model.json", compUrl + "metadata.json");
  orgModel = await tmImage.load(orgUrl + "model.json", orgUrl + "metadata.json");
  faceModel = await tmImage.load(faceUrl + "model.json", faceUrl + "metadata.json");

  modelsReady = true;
  console.log("モデル読み込みおわり");
}

// ピクセル平均
function getPixelStats(imageElement) {
  let canvasArea = createGraphics(100, 100);
  canvasArea.drawingContext.drawImage(imageElement, 0, 0, 100, 100);

  // エリア取得
  let area = canvasArea.get(0, 0, 100, 100);
  area.loadPixels();

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;

  for (let y = 0; y < area.height; y++) {
    for (let x = 0; x < area.width; x++) {
      let i = (y * area.width + x) * 4;
      let r = area.pixels[i + 0];
      let g = area.pixels[i + 1];
      let b = area.pixels[i + 2];

      sumR = sumR + r;
      sumG = sumG + g;
      sumB = sumB + b;
    }
  }

  let totalPixels = area.width * area.height;
  let avgR = sumR / totalPixels;
  let avgG = sumG / totalPixels;
  let avgB = sumB / totalPixels;

  // 明るさ
  let brightness = (avgR + avgG + avgB) / 3;

  // 色差
  let maxRGB = avgR;
  if (avgG > maxRGB) {
    maxRGB = avgG;
  }
  if (avgB > maxRGB) {
    maxRGB = avgB;
  }

  let minRGB = avgR;
  if (avgG < minRGB) {
    minRGB = avgG;
  }
  if (avgB < minRGB) {
    minRGB = avgB;
  }

  let colorDiff = maxRGB - minRGB;

  brightness = brightness / 255;
  colorDiff = colorDiff / 255;

  let result = {};
  result.luminance = brightness;
  result.chroma = colorDiff;
  return result;
}

// スコア作成
async function getScores(imageElement) {
  let pixelData = getPixelStats(imageElement);

  let compPrediction = await compModel.predict(imageElement);
  let compScore = 0;
  for (let i = 0; i < compPrediction.length; i++) {
    if (compPrediction[i].className == "high") {
      compScore = compPrediction[i].probability;
    }
  }

  let orgPrediction = await orgModel.predict(imageElement);
  let orgScore = 0;
  for (let i = 0; i < orgPrediction.length; i++) {
    if (orgPrediction[i].className == "high") {
      orgScore = orgPrediction[i].probability;
    }
  }

  let facePrediction = await faceModel.predict(imageElement);
  let faceScore = 0;
  for (let i = 0; i < facePrediction.length; i++) {
    if (facePrediction[i].className == "high") {
      faceScore = facePrediction[i].probability;
    }
  }

  let result = {};
  result.luminance = pixelData.luminance;
  result.chroma = pixelData.chroma;
  result.comp = compScore;
  result.org = orgScore;
  result.face = faceScore;
  return result;
}

// 差分
function calculateDifference(score1, score2) {
  let diffL = score1.luminance - score2.luminance;
  if (diffL < 0) {
    diffL = diffL * -1;
  }
  
  let diffC = score1.chroma - score2.chroma;
  if (diffC < 0) {
    diffC = diffC * -1;
  }

  let diffX = score1.comp - score2.comp;
  if (diffX < 0) {
    diffX = diffX * -1;
  }

  let diffO = score1.org - score2.org;
  if (diffO < 0) {
    diffO = diffO * -1;
  }

  let diffF = score1.face - score2.face;
  if (diffF < 0) {
    diffF = diffF * -1;
  }

  let total = diffL + diffC + diffX + diffO + diffF;
  return total;
}
