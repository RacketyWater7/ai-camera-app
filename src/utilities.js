// Drawing function
const draw = (predictions, ctx) => {
  if (predictions.length > 0) {
    for (let i = 0; i < predictions.length; i++) {
      const start = predictions[i].topLeft;
      const end = predictions[i].bottomRight;
      const size = [end[0] - start[0], end[1] - start[1]];

      // Render a rectangle over each detected face.
      const img = document.createElement("img");
      img.src = `/images/mustache1.png`;
      // add width and height in pixels
      img.width = "100px";
      img.height = "50px";
      // add z-index to the image
      img.style.zIndex = "5";

      ctx.beginPath();
      ctx.lineWidth = "6";
      ctx.strokeStyle = "red";
      ctx.rect(end[0], end[1], start[0], start[1]);
      // draw an mustache image at the detected face
      // ctx.drawImage(img, end[0], end[1], start[0], start[1]);

      ctx.rect(start[0], start[1], size[0], size[1]);
      ctx.stroke();
    }
  }
};

export default draw;
