import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import html2canvas from "html2canvas";
import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import { drawMesh } from "../../utilities";
import "./Camera.css";

tf.getBackend();

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
  const mediaRecorderRef = React.useRef(null);
  const canvasRef = useRef(null);
  const captureRef = useRef(null);
  const squareCanvasRef = useRef(null);
  const propRef = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(1);
  const [selectedFrame, setSelectedFrame] = useState(frames[0]);
  const [recordedChunks, setRecordedChunks] = React.useState([]);
  const [capturing, setCapturing] = React.useState(false);

  useEffect(() => {
    runFacemesh();
  }, []);

  const capture = React.useCallback(() => {
    html2canvas(captureRef.current, {
      useCORS: true,
      allowTaint: false,
      scale: 1,
      width: captureRef.current.width,
      height: captureRef.current.height,
      logging: true,
      backgroundColor: "transparent",
    }).then((canvas) => {
      const img = canvas.toDataURL("image/png");
      // console.log(img);
      window.open(img);
    });
  }, [captureRef]);

  const handleStartCaptureClick = React.useCallback(() => {
    let b = [1, 2, 3];
    b = [...b, ...b.slice(0).reverse()];
    console.log(b);
    setRecordedChunks([]);
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef]);
  const handleDataAvailable = React.useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );
  const handleStopCaptureClick = React.useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  const handleDownload = React.useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  //  Load posenet
  const runFacemesh = async () => {
    // const model = facemesh.SupportedModels.MediaPipeFaceMesh;
    // const detectorConfig = {
    //   runtime: "tfjs", // or 'tfjs'
    //   solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
    // };
    // const detector = await facemesh.createDetector(model, detectorConfig);
    // OLD MODEL
    // const net = await facemesh.load({
    //   inputResolution: { width: 640, height: 480 },
    //   scale: 0.8,
    // });
    // NEW MODEL
    const net = await facemesh.load(
      facemesh.SupportedPackages.mediapipeFacemesh
    );
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      // OLD MODEL
      //       const face = await net.estimateFaces(video);
      // NEW MODEL
      // video.addEventListener("loadeddata", async (e) => {
      const face = await net.estimateFaces({ input: video });

      // console.log(face[0].annotations.lipsUpperOuter);
      // draw mustache1.png on the lipsUpperOuter coordinates
      // make an image with src = "mustache1.png"
      // draw the image on the canvas
      const img = propRef.current;
      // img.style.width = "1000px";

      // img.src = "/images/mustache1.png";
      img.style.zIndex = "10";
      // reduce the size of the image to fit the lipsUpperOuter coordinates
      img.style.width = `${
        face[0].annotations.lipsUpperOuter[10][0] -
        face[0].annotations.lipsUpperOuter[0][0] +
        20
      }px`;
      img.style.height = `${
        face[0].annotations.lipsUpperOuter[10][1] -
        face[0].annotations.lipsUpperOuter[0][1] +
        20
      }px`;
      img.style.top = `${face[0].annotations.lipsUpperOuter[0][1] - 20}px`;
      img.style.left = `${face[0].annotations.lipsUpperOuter[0][0]}px`;
      //  0 be start and 10 be end
      // const ctx = canvasRef.current.getContext("2d");
      // ctx.drawImage(
      //   img,
      //   face[0].annotations.lipsUpperOuter[0][0],
      //   face[0].annotations.lipsUpperOuter[0][1]
      // );

      // Get canvas context
      // const ctx = canvasRef.current.getContext("2d");
      // requestAnimationFrame(() => {
      //   drawMesh(face, ctx);
      // });
      // });
    }
  };

  return (
    <>
      <div ref={captureRef} className="container">
        <Webcam
          audio={false}
          height={"100%"}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={"100%"}
          videoConstraints={videoConstraints}
          className="webcam"
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            // marginLeft: "auto",
            // marginRight: "auto",
            left: 0,
            right: 0,

            textAlign: "center",
            zindex: 9,
            width: "100%",
            height: "100%",
          }}
        />
        {selectedFeature === 1 && (
          <img
            className="overlay-props"
            src={`/images/mustache1.png`}
            alt="mustache"
            ref={propRef}
          />
        )}
        {selectedFeature === 0 && (
          <img
            className="overlay-image"
            src={`/images/${selectedFrame}`}
            alt={selectedFrame}
          />
        )}
      </div>
      <div className="btn-photo" onClick={capture}>
        <div className="circle"></div>
        <div className="ring"></div>
      </div>
      <button
        onClick={
          capturing === true ? handleStopCaptureClick : handleStartCaptureClick
        }
        className="btn-record-video"
      >
        {capturing === true ? "Stop Recording" : "Start Recording"}
      </button>
      {recordedChunks.length > 0 && (
        <>
          {" "}
          <button className="btn-download-video" onClick={handleDownload}>
            Download
          </button>
        </>
      )}
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

      <canvas
        ref={squareCanvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          top: 100,
          left: 0,
          right: 80,
          textAlign: "center",
          zIndex: 9,
          width: 640,
          height: 480,
        }}
      />
    </>
  );
};

export default Camera;
