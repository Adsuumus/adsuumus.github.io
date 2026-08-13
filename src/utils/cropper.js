const noiseWidth = 512;
const noiseHeight = 512;

const noiseMap = new Uint8ClampedArray(noiseWidth * noiseHeight * 3);

for (let i = 0; i < noiseMap.length; i++) {
  noiseMap[i] = Math.random() * 255;
}

function applyMultiplyOverlay(data, strength) {
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    const noiseIdx = ((i / 4) % (noiseWidth * noiseHeight)) * 3;

    const rNoise = noiseMap[noiseIdx];
    const gNoise = noiseMap[noiseIdx + 1];
    const bNoise = noiseMap[noiseIdx + 2];

    data[i] = data[i] * (1 - strength) + rNoise * strength;

    data[i + 1] = data[i + 1] * (1 - strength) + gNoise * strength;

    data[i + 2] = data[i + 2] * (1 - strength) + bNoise * strength;
  }
}

export function processImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const cropSize = 200;

        const canvas = document.createElement("canvas");

        canvas.width = cropSize;
        canvas.height = cropSize;

        const ctx = canvas.getContext("2d");

        const aspectRatio = img.width / img.height;

        let srcW;
        let srcH;

        if (aspectRatio > 1) {
          srcH = img.height;
          srcW = img.height;
        } else {
          srcW = img.width;
          srcH = img.width;
        }

        const sx = (img.width - srcW) / 2;

        const sy = (img.height - srcH) / 2;

        ctx.drawImage(img, sx, sy, srcW, srcH, 0, 0, cropSize, cropSize);

        ctx.globalCompositeOperation = "destination-in";

        ctx.beginPath();

        ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);

        ctx.fill();

        ctx.globalCompositeOperation = "source-over";

        resolve(canvas);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

export function applyNoise(canvas, strength) {
  const tempCanvas = document.createElement("canvas");

  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  const ctx = tempCanvas.getContext("2d");

  ctx.drawImage(canvas, 0, 0);

  const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

  applyMultiplyOverlay(imageData.data, strength);

  ctx.putImageData(imageData, 0, 0);

  return tempCanvas.toDataURL("image/png");
}
