"use client";

import React, { useEffect, useRef } from "react";

const WatermarkComponent: React.FC = () => {
  // Create refs for each canvas
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    // Loop through each ref and draw the watermark on each canvas
    canvasRefs.current.forEach((canvas) => {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Set width and height
          canvas.width = 200;
          canvas.height = 60;

          // Optional: Set background color
          ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw text
          ctx.font = "2.5rem Arial";
          ctx.fillStyle = "rgba(136, 136, 136, 0.5)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Reblium", canvas.width / 2, canvas.height / 2);
        }
      }
    });
  }, []);

  return (
    <div id="watermarkContainer">
      {[...Array(5)].map((_, index) => (
        <canvas
          key={index}
          ref={(el) => {
            if (el) canvasRefs.current[index] = el;
          }}
          className="watermark_item"
        ></canvas>
      ))}
    </div>
  );
};

export default WatermarkComponent;
