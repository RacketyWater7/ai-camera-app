import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import html2canvas from "html2canvas";
import "./Camera.css";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};
const frames = [
  "ann1.png",
  "ann2.png",
  "cm.png",
  "cm1.png",
  "newYear1.png",
  "newYear2.png",
  "newYear3.png",
  "party1.png",
  "party2.png",
  "party3.png",
  "party4.png",
];

const Camera = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(0);
  const [selectedFrame, setSelectedFrame] = useState(frames[0]);

  const capture = React.useCallback(() => {
    html2canvas(canvasRef.current, {
      useCORS: true,
      allowTaint: false,
      scale: 1,
      width: canvasRef.current.width,
      height: canvasRef.current.height,
      logging: true,
      backgroundColor: "transparent",
    }).then((canvas) => {
      const img = canvas.toDataURL("image/png");
      // console.log(img);
      window.open(img);
    });
  }, [canvasRef]);
  return (
    <>
      <div ref={canvasRef} className="container">
        <Webcam
          audio={false}
          height={"100%"}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={"100%"}
          videoConstraints={videoConstraints}
        />
        {selectedFeature === 0 && (
          <img
            className="overlay-image"
            src={`/images/${selectedFrame}`}
            alt={selectedFrame}
          />
        )}
      </div>
      <div className="photo-button" onClick={capture}>
        <div className="circle"></div>
        <div className="ring"></div>
      </div>
      <div className="features">
        <span
          style={selectedFeature === 0 ? { color: "#fff" } : { color: "#000" }}
          onClick={() => setSelectedFeature(0)}
          className="feature"
        >
          Frames
        </span>
        <span
          style={selectedFeature === 1 ? { color: "#fff" } : { color: "#000" }}
          onClick={() => setSelectedFeature(1)}
          className="feature"
        >
          Props
        </span>
      </div>
      {selectedFeature === 0 && (
        <div className="frames">
          {frames.map((frame, index) => (
            <img
              key={index}
              className="frame"
              src={`/images/${frame}`}
              alt={frame.split(".")[0]}
              onClick={() => {
                setSelectedFrame(frame);
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default Camera;
