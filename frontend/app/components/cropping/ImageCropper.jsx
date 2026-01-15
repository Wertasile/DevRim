import React, { useEffect, useState } from 'react';
import Cropper from "react-easy-crop";

export default function ImageCropper({image,onCropDone,onCropCancel,AR}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(Number(AR));

  useEffect(() => {
    console.log(aspectRatio)
  },[aspectRatio])

  const handleCropComplete = (croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  return (
    <div className="cropper-wrapper" style={{ width: '100%', maxWidth: '100%' }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "100%",
          height: 400,
          background: "#000000",
          borderRadius: 8,
          overflow: "hidden"
        }}
      >
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>

      <div className="flex gap-2 mt-3">
        <button type="button" className='secondary-btn' onClick={onCropCancel} >CANCEL</button>
        <button
          type='button'
          className='primary-btn bg-[#E95444]'
          onClick={() => onCropDone(croppedAreaPixels)}
        >
          APPLY CHANGES
        </button>
      </div>
    </div>
  );
}
