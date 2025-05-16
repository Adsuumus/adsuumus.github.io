const noiseWidth = 512, noiseHeight = 512;
const noiseMap = new Uint8ClampedArray(noiseWidth * noiseHeight * 3);

for (let i = 0; i < noiseMap.length; i++) {
    noiseMap[i] = Math.random() * 255;
}

function applyMultiplyOverlay(data, noiseMap, strength) {
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
        const noiseIdx = (i / 4) % (noiseWidth * noiseHeight) * 3;
        const rNoise = noiseMap[noiseIdx];
        const gNoise = noiseMap[noiseIdx + 1];
        const bNoise = noiseMap[noiseIdx + 2];

        data[i] = data[i] * (1 - strength) + rNoise * strength;
        data[i + 1] = data[i + 1] * (1 - strength) + gNoise * strength;
        data[i + 2] = data[i + 2] * (1 - strength) + bNoise * strength;
    }
}

const noiseSlider = document.getElementById('noiseStrength');
const noiseDisplay = document.getElementById('noiseValue');
noiseSlider.addEventListener('input', () => {
    noiseDisplay.textContent = noiseSlider.value;
    redrawAllImages();
});

const originalImages = [];

function processImage(file) {
    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = function (e) {
            img.onload = function () {
                const cropSize = 200;
                const canvas = document.createElement('canvas');
                canvas.width = cropSize;
                canvas.height = cropSize;
                const ctx = canvas.getContext('2d');

                const aspectRatio = img.width / img.height;
                const targetRatio = 1;

                let srcW, srcH;
                if (aspectRatio > targetRatio) {
                    srcH = img.height;
                    srcW = img.height * targetRatio;
                } else {
                    srcW = img.width;
                    srcH = img.width / targetRatio;
                }

                const sx = (img.width - srcW) / 2;
                const sy = (img.height - srcH) / 2;

                ctx.clearRect(0, 0, cropSize, cropSize);
                ctx.drawImage(img, sx, sy, srcW, srcH, 0, 0, cropSize, cropSize);

                ctx.globalCompositeOperation = 'destination-in';
                ctx.beginPath();
                ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';

                resolve({
                    original: canvas.toDataURL("image/png"), canvas: canvas, ctx: ctx
                });
            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    });
}

function applyNoiseToImage(imageData, strength) {
    const {canvas, ctx} = imageData;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(canvas, 0, 0);

    const imageDataObj = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageDataObj.data;

    applyMultiplyOverlay(data, noiseMap, strength);
    tempCtx.putImageData(imageDataObj, 0, 0);

    return tempCanvas.toDataURL("image/png");
}

function redrawAllImages() {
    const strength = parseFloat(noiseSlider.value);
    const results = document.querySelectorAll('.result-item');

    results.forEach((result, index) => {
        const img = result.querySelector('img');
        const imageData = originalImages[index];
        img.src = applyNoiseToImage(imageData, strength);
    });
}

document.addEventListener('paste', async function (event) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    const resultsContainer = document.getElementById('results-container');

    const imageFiles = [];
    for (const item of items) {
        if (item.type.indexOf("image") === 0) {
            imageFiles.push(item.getAsFile());
        }
    }

    const processedImages = await Promise.all(imageFiles.map(file => processImage(file)));

    processedImages.forEach((imageData, index) => {
        const strength = parseFloat(noiseSlider.value);
        const resultUrl = applyNoiseToImage(imageData, strength);

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        const imageContainer = document.createElement('div');
        imageContainer.className = 'result-image-container';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            resultsContainer.removeChild(resultItem);
            originalImages.splice(index, 1);
        };

        const img = document.createElement('img');
        img.className = 'result-image';
        img.src = resultUrl;
        img.alt = `image_${index + 1}`;

        imageContainer.appendChild(deleteBtn);
        imageContainer.appendChild(img);
        resultItem.appendChild(imageContainer);
        resultsContainer.appendChild(resultItem);

        originalImages.push(imageData);
    });
});

document.getElementById('downloadAll').addEventListener('click', () => {
    const links = document.querySelectorAll('.result-item img');
    links.forEach((img, i) => {
        const a = document.createElement('a');
        a.href = img.src;
        a.download = `image_${i + 1}.png`;
        a.click();
    });
});
