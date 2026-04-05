import React, { useRef, useState, useEffect } from 'react';
import './CameraUpload.css';

const CameraUpload = ({ onImageCapture, selectedImage, loading }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const galleryInputRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const getCameraErrorMessage = (err) => {
    const errorName = err?.name || '';

    if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
      return 'Camera permission is blocked. Enable camera access for this site in browser settings.';
    }

    if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
      return 'Camera is already in use by another app or browser tab. Close it and retry.';
    }

    if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
      return 'No camera device was found on this system.';
    }

    if (errorName === 'OverconstrainedError' || errorName === 'ConstraintNotSatisfiedError') {
      return 'Requested camera mode is not available on this device.';
    }

    if (errorName === 'SecurityError') {
      return 'Camera is blocked due to browser security policy. Use localhost or HTTPS.';
    }

    return 'Camera access failed. Please retry or upload a photo.';
  };

  const requestCameraStream = async () => {
    const constraintsList = [
      { video: { facingMode: { ideal: 'environment' } }, audio: false },
      { video: true, audio: false },
    ];

    let lastError = null;
    for (const constraints of constraintsList) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  };

  const startCamera = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not available in this browser. Please upload a photo.');
      return;
    }

    stopCamera();

    try {
      const stream = await requestCameraStream();
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(getCameraErrorMessage(err));
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const file = new File([blob], 'captured_leaf.jpg', { type: 'image/jpeg' });
          const imageUrl = URL.createObjectURL(blob);
          onImageCapture(file, imageUrl);
          stopCamera();
        },
        'image/jpeg',
        0.95
      );
    }
  };

  const handleGalleryUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onImageCapture(file, imageUrl);
      stopCamera();
    }
  };

  const triggerGallery = () => galleryInputRef.current?.click();

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="camera-upload-card">
      <div className="preview-area">
        {isCameraActive ? (
          <div className="camera-viewfinder">
            <video ref={videoRef} autoPlay playsInline className="live-video" />
            <div className="camera-controls-overlay">
              <button className="capture-trigger" onClick={capturePhoto} disabled={loading}>
                Capture
              </button>
              <button className="close-camera" onClick={stopCamera} disabled={loading}>
                Close
              </button>
            </div>
          </div>
        ) : selectedImage ? (
          <div className="image-wrapper">
            <img src={selectedImage} alt="Crop preview" className="image-preview" />
            <div className="preview-overlay">Selected image</div>
          </div>
        ) : (
          <div className="placeholder-content">
            <h3>Upload crop leaf image</h3>
            <p>Use camera for real-time capture or pick an image from your device.</p>
            {cameraError && <p className="camera-error">{cameraError}</p>}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="upload-controls">
        <input
          type="file"
          accept="image/*"
          onChange={handleGalleryUpload}
          ref={galleryInputRef}
          style={{ display: 'none' }}
        />

        {!selectedImage && !isCameraActive ? (
          <div className="button-group">
            <button className="primary-btn" onClick={startCamera} disabled={loading}>
              Open Camera
            </button>
            <button className="secondary-btn" onClick={triggerGallery} disabled={loading}>
              Upload Photo
            </button>
          </div>
        ) : (
          !isCameraActive && (
            <div className="button-group">
              <button className="secondary-btn outline" onClick={startCamera} disabled={loading}>
                Take New Photo
              </button>
              <button className="secondary-btn outline" onClick={triggerGallery} disabled={loading}>
                Pick Different
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CameraUpload;
