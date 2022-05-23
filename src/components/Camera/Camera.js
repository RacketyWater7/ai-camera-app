import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import html2canvas from "html2canvas";
import * as tf from "@tensorflow/tfjs";
import draw from "../../utilities";
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
  const squareCanvasRef = useRef(null);
  const blazeface = require("@tensorflow-models/blazeface");
  const [selectedFeature, setSelectedFeature] = useState(1);
  const [selectedFrame, setSelectedFrame] = useState(frames[0]);
  const [recordedChunks, setRecordedChunks] = React.useState([]);
  const [capturing, setCapturing] = React.useState(false);

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

  const handleDownloadBoomerang = React.useCallback(() => {
    if (recordedChunks.length) {
      // let frames = [];
      // frames = recordedChunks;
      // frames = [...frames, ...frames.slice(0).reverse()];

      const reversedChunks = [];
      // // for (let i = 0; i < recordedChunks.length; i++) {
      // //   const chunk = recordedChunks[i];
      // //   boomerang.push(boomerangChunk);
      // // }
      // // push reverse of boomerang in boomerang
      for (let i = recordedChunks.length - 2; i >= 0; i--) {
        reversedChunks.push(recordedChunks[i]);
      }
      const boomerang = recordedChunks.concat(reversedChunks);

      const blob = new Blob(boomerang, {
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

  // detection area
  const runFacedetection = async () => {
    const model = await blazeface.load();
    console.log("FaceDetection Model is Loaded..");
    setInterval(() => {
      detect(model);
    }, 100);
  };

  const returnTensors = false;

  const detect = async (model) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      // const videoWidth = canvasRef.current.width;
      // const videoHeight = canvasRef.current.height;

      //Set video height and width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      //Set canvas height and width
      squareCanvasRef.current.width = videoWidth;
      squareCanvasRef.current.height = videoHeight;

      // Make detections

      const prediction = await model.estimateFaces(video, returnTensors);

      // console.log(prediction);

      const ctx = squareCanvasRef.current.getContext("2d");
      // draw an image and give it src as /images/ann1.png
      ctx.drawImage(
        video,
        0,
        0,
        squareCanvasRef.current.width,
        squareCanvasRef.current.height
      );

      draw(prediction, ctx);
    }
  };

  // runFacedetection();
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
          className="webcam"
        />
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
          <button
            style={{ top: "75%" }}
            className="btn-download-video"
            onClick={handleDownloadBoomerang}
          >
            Download Boomerang
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
