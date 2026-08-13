import { useState } from "react";
import { processImage, applyNoise } from "./utils/cropper";
import { useNavigate, NavLink } from "react-router-dom";
import icon from "./assets/maya.webp";

export function CropperPage() {
  const [images, setImages] = useState([]);
  const [noiseStrength, setNoiseStrength] = useState(0.04);
  const navigate = useNavigate();
  async function handlePaste(e) {
    const items = e.clipboardData.items;
    const files = [];

    for (const item of items) {
      if (item.type.startsWith("image")) {
        files.push(item.getAsFile());
      }
    }

    const canvases = await Promise.all(files.map(processImage));

    const newImages = canvases.map((canvas) => ({
      canvas,
      url: applyNoise(canvas, noiseStrength),
    }));

    setImages((prev) => [...prev, ...newImages]);
  }

  function handleNoiseChange(value) {
    setNoiseStrength(value);

    setImages((prev) =>
      prev.map((item) => ({
        ...item,
        url: applyNoise(item.canvas, value),
      })),
    );
  }

  function downloadAll() {
    images.forEach((item, index) => {
      const a = document.createElement("a");

      a.href = item.url;
      a.download = `image_${index + 1}.png`;

      a.click();
    });
  }

  return (
    <div onPaste={handlePaste} tabIndex={0} className="min-h-screen">
      <div className="header">
        <NavLink to={"/"}>
          <img src={icon} className="icon" alt="" />
        </NavLink>

        <button onClick={downloadAll} className="button download-button">
          Скачать все
        </button>

        <div className="noise-control">
          <p className="noise-value">Шум: {noiseStrength.toFixed(2)}</p>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={noiseStrength}
            onChange={(e) => handleNoiseChange(Number(e.target.value))}
          />
        </div>
        <button
          className="button crp-button"
          onClick={() => {
            navigate("");
          }}
        >
          Майя →
        </button>
      </div>

      <div className="drop-zone">
        <p>Вставь картинки из буфера</p>

        <div className="results-container">
          {images.map((item, index) => (
            <div key={index} className="result-item">
              <button
                className="delete-btn"
                onClick={() => {
                  setImages((prev) => prev.filter((_, i) => i !== index));
                }}
              >
                ×
              </button>

              <img
                src={item.url}
                className="result-image"
                alt={`image_${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
