import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import html2canvas from "html2canvas";
import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
// import { drawMesh } from "../../utilities";
import "./Camera.css";
import { Loader } from "../common/Loader";

tf.getBackend();

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};
const frames = [
  "none",
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
  "party5.png",
];
const imageProps = [
  "none",
  "mustache1.png",
  "glasses1.png",
  "glasses2.png",
  "tie1.png",
  "tie2.png",
  "tie3.png",
];

const Camera = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = React.useRef(null);
  const canvasRef = useRef(null);
  const captureRef = useRef(null);
  // const squareCanvasRef = useRef(null);
  const propRef = useRef(null);
  const selectedPropRef = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(1);
  const [selectedFrame, setSelectedFrame] = useState(frames[0]);
  const [selectedImageProp, setSelectedImageProp] = useState(imageProps[0]);
  const [recordedChunks, setRecordedChunks] = React.useState([]);
  const [capturing, setCapturing] = React.useState(false);
  const [loader, setLoader] = useState(false);
  // const [faces, setFaces] = useState(0);

  useEffect(() => {
    runFacemesh();
  }, []);
  useEffect(() => {
    selectedPropRef.current = selectedImageProp;
  }, [selectedImageProp]);

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
    setLoader(true);
    // NEW MODEL
    const net = await facemesh.load(
      facemesh.SupportedPackages.mediapipeFacemesh
    );
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net, imageProp) => {
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

      // Making Detections
      // video.addEventListener("loadeddata", async (e) => {
      const face = await net.estimateFaces({ input: video });
      setLoader(false);
      if (face[0] && propRef.current !== null) {
        // setFaces(face.length);
        // console.log("faces:", face);
        const img = propRef.current;
        img.style.zIndex = "1";
        img.style.visibility = "visible";
        switch (selectedPropRef.current) {
          case "mustache1.png":
            // console.log("im here bamby", selectedPropRef.current);
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
            img.style.top = `${
              face[0].annotations.lipsUpperOuter[0][1] - 25
            }px`;
            img.style.left = `${
              face[0].annotations.lipsUpperOuter[0][0] - 10
            }px`;
            break;
          case "glasses1.png":
            img.style.width = `${
              face[0].annotations.leftEyeUpper0[6][0] -
              face[0].annotations.rightEyeUpper0[6][0] +
              250
            }px`;
            img.style.height = `${
              face[0].annotations.rightEyeLower2[0][1] -
              face[0].annotations.rightEyeUpper2[0][1] +
              200
            }px`;
            img.style.top = `${
              face[0].annotations.rightEyeUpper2[0][1] - 95
            }px`;
            img.style.left = `${
              face[0].annotations.rightEyeUpper0[6][0] - 125
            }px`;
            break;
          case "glasses2.png":
            // console.log("im in 2nd bamby", selectedPropRef.current);
            img.style.width = `${
              face[0].annotations.leftEyeUpper0[6][0] -
              face[0].annotations.rightEyeUpper0[6][0] +
              150
            }px`;
            img.style.height = `${
              face[0].annotations.rightEyeLower2[0][1] -
              face[0].annotations.rightEyeUpper2[0][1] +
              30
            }px`;
            img.style.top = `${
              face[0].annotations.rightEyeUpper2[0][1] - 20
            }px`;
            img.style.left = `${
              face[0].annotations.rightEyeUpper0[6][0] - 75
            }px`;
            break;
          case "tie1.png":
            img.style.width = `${
              face[0].annotations.leftEyeUpper0[6][0] -
              face[0].annotations.rightEyeUpper0[6][0] +
              150
            }px`;
            img.style.height = `${
              face[0].annotations.rightEyeLower2[0][1] -
              face[0].annotations.rightEyeUpper2[0][1] +
              300
            }px`;
            img.style.top = `${face[0].annotations.silhouette[19][1] + 20}px`;
            img.style.left = `${face[0].annotations.silhouette[0][0] - 90}px`;
            break;
          case "tie2.png":
            img.style.width = `${
              face[0].annotations.leftEyeUpper0[6][0] -
              face[0].annotations.rightEyeUpper0[6][0] +
              100
            }px`;
            img.style.height = `${
              face[0].annotations.rightEyeLower2[0][1] -
              face[0].annotations.rightEyeUpper2[0][1] +
              100
            }px`;
            img.style.top = `${face[0].annotations.silhouette[19][1] + 20}px`;
            img.style.left = `${face[0].annotations.silhouette[0][0] - 80}px`;
            break;
          case "tie3.png":
            // console.log("im in 2nd bamby", selectedPropRef.current);
            img.style.width = `${
              face[0].annotations.leftEyeUpper0[6][0] -
              face[0].annotations.rightEyeUpper0[6][0] +
              175
            }px`;
            img.style.height = `${
              face[0].annotations.rightEyeLower2[0][1] -
              face[0].annotations.rightEyeUpper2[0][1] +
              400
            }px`;
            img.style.top = `${face[0].annotations.silhouette[19][1]}px`;
            img.style.left = `${face[0].annotations.silhouette[0][0] - 90}px`;
            break;

          default:
            break;
        }

        // Drawing Mesh
        // const ctx = canvasRef.current.getContext("2d");
        // requestAnimationFrame(() => {
        //   drawMesh(face, ctx);
        // });
        // });
      } else {
        if (propRef.current !== null) {
          propRef.current.style.visibility = "hidden";
        }
      }
    }
  };

  return (
    <>
      <div ref={captureRef} className="container">
        <Loader display={loader} />
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

        {/* // make array with length equal to the number of faces
          // and fill it with false

            // faces > 0 &&
            // for(let i = 0; i < faces; i++) { */}
        {selectedImageProp !== "none" && (
          <img
            // key={i}
            className="overlay-props"
            src={`/images/props/${selectedImageProp}`}
            alt={selectedImageProp}
            ref={propRef}
          />
        )}

        {/* // } */}
        {selectedFrame !== "none" && (
          <img
            className="overlay-image"
            src={`/images/frames/${selectedFrame}`}
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
            <div key={index}>
              {frame === "none" ? (
                <div
                  style={{ textAlign: "center" }}
                  onClick={() => {
                    setSelectedFrame(frame);
                  }}
                  className="frame"
                >
                  None
                </div>
              ) : (
                <img
                  key={index}
                  className="frame"
                  src={`/images/frames/${frame}`}
                  alt={frame.split(".")[0]}
                  onClick={() => {
                    setSelectedFrame(frame);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
      {selectedFeature === 1 && (
        <div className="frames">
          {imageProps.map((image, index) => (
            <div key={index}>
              {image === "none" ? (
                <div
                  style={{
                    textAlign: "center",
                  }}
                  onClick={() => {
                    setSelectedImageProp(image);
                  }}
                  className="frame"
                >
                  None
                </div>
              ) : (
                <img
                  key={index}
                  className="frame"
                  src={`/images/props/${image}`}
                  alt={image.split(".")[0]}
                  onClick={() => {
                    setSelectedImageProp(image);
                    console.log("selectedImageProp", selectedImageProp);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Camera;
