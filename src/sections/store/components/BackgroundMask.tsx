"use client";

interface BackgroundMaskProps {
  url: string;
  height: string;
  maskWidth: string;
}

export default function BackgroundMask({url, height, maskWidth}: BackgroundMaskProps) {
  return (
    <>
      <div
        className={`absolute inset-0 bg-cover bg-top`}
        style={{
          backgroundImage: `url(${url})`,
          top: '-87px',
          zIndex: -1,
          height: height
        }}
      ></div>

      {/* Mask effect */}
      <div
        className={`absolute inset-0`}
        style={{
          background:
            `linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${maskWidth}, rgba(0,0,0,0) 100%)`,
            top: '-87px',
            zIndex: -1,
            height: height
        }}
      ></div>
    </>
  );
}
