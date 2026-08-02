import React from 'react';

const MAX_DIMENSION = 900; // px, keeps payload reasonable for Apps Script / Sheets cell limits
const JPEG_QUALITY = 0.6;

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ label, images, onChange, multiple = true }) {
  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    const compressed = await Promise.all(files.map(compressImage));
    onChange(multiple ? [...images, ...compressed] : [compressed[0]]);
  };

  const removeAt = (idx) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple={multiple}
        onChange={(e) => e.target.files.length && handleFiles(e.target.files)}
      />
      {images.length > 0 && (
        <div className="thumb-row">
          {images.map((src, idx) => (
            <div className="thumb" key={idx}>
              <img src={src} alt={`${label} ${idx + 1}`} />
              <button type="button" onClick={() => removeAt(idx)} aria-label="Remove photo">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
