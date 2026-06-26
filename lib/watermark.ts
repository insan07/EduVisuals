export async function downloadWithWatermark(imageUrl: string, filename: string, watermarkText = "EDUVISUALS") {
  return new Promise<void>((resolve, reject) => {
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = proxyUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Configure watermark styling to match reference image
      const fontSize = Math.max(img.width * 0.035, 24); // responsive font size
      ctx.font = `800 ${fontSize}px "Inter", Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Faint grey/black text without shadow
      ctx.fillStyle = "rgba(100, 100, 100, 0.15)";
      
      // Draw repeating diagonal watermark
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6); // 30 degrees rotation
      
      const stepX = img.width * 0.7; // Wider horizontal spacing
      const stepY = fontSize * 12; // Much wider vertical spacing
      const extent = Math.max(canvas.width, canvas.height) * 2;
      
      for (let x = -extent; x <= extent; x += stepX) {
        for (let y = -extent; y <= extent; y += stepY) {
          // Add letter spacing by drawing characters individually if needed, 
          // but for simplicity we'll just add spaces between letters to mimic the tracking in the image
          const spacedText = watermarkText.split('').join(' ');
          ctx.fillText(spacedText, x, y);
        }
      }
      
      // Export and trigger download
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas toBlob failed"));
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // Ensure filename has an extension
        const safeFilename = filename.includes('.') ? filename : `${filename}.jpg`;
        link.download = safeFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/jpeg', 0.95);
    };
    img.onerror = () => {
      reject(new Error("Failed to load image for watermarking"));
    };
  });
}
