document.addEventListener("DOMContentLoaded", function () {
  let animationContainer = document.getElementById("animationContainer");
  let jsonFileInput = document.getElementById("jsonFileInput");
  let statusMessage = document.getElementById("statusMessage");
  let animationInstance = null;

  jsonFileInput.addEventListener("change", function (event) {
    let file = event.target.files[0];

    if (file && file.type === "application/json") {
      let reader = new FileReader();

      reader.onload = function (e) {
        let jsonData = JSON.parse(e.target.result);

        // Remove any existing animation before loading a new one
        if (animationInstance) {
          animationInstance.destroy();
        }

        // Load Lottie Animation
        animationInstance = lottie.loadAnimation({
          container: animationContainer,
          renderer: "canvas", // Use 'canvas' for higher quality
          loop: true,
          autoplay: true,
          animationData: jsonData,
        });

        statusMessage.textContent = "Lottie JSON Loaded Successfully!";
        statusMessage.classList.remove("error");
        statusMessage.style.display = "block";

        createDownloadButton();
      };

      reader.readAsText(file);
    } else {
      statusMessage.textContent =
        "Invalid file. Please upload a valid Lottie JSON file.";
      statusMessage.classList.add("error");
      statusMessage.style.display = "block";
    }
  });

  function createDownloadButton() {
    let existingButton = document.getElementById("downloadGifButton");
    if (existingButton) existingButton.remove(); // Remove existing button if already present

    let button = document.createElement("button");
    button.id = "downloadGifButton";
    button.textContent = "Download as High-Quality GIF";
    button.className = "custom-file-upload"; // Apply same styling as upload button
    button.addEventListener("click", convertLottieToGif);

    animationContainer.after(button);
  }

  function convertLottieToGif() {
    if (!animationInstance) return;

    let canvas = animationContainer.querySelector("canvas"); // Get the canvas for rendering
    let gif = new GIF({
      workers: 4, // Use multiple workers for better performance
      quality: 1, // 1 = highest quality (lower number = better)
      width: 1024, // Increase width for higher resolution
      height: 1024, // Increase height for better clarity
      background: "#ffffff", // Set a white background (optional)
      workerScript:
        "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js",
    });

    let framesCaptured = 0;
    let totalFrames = 60; // Higher frame count for smoother animation

    function captureFrame() {
      if (framesCaptured >= totalFrames) {
        gif.on("finished", function (blob) {
          let a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "high_quality_animation.gif";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
        gif.render();
        return;
      }

      animationInstance.goToAndStop(
        (framesCaptured / totalFrames) * animationInstance.totalFrames,
        true
      );

      let ctx = canvas.getContext("2d");
      let frame = document.createElement("canvas");
      frame.width = 1024; // High resolution
      frame.height = 1024;
      let frameCtx = frame.getContext("2d");
      frameCtx.drawImage(canvas, 0, 0, 1024, 1024); // Scale up

      gif.addFrame(frame, { delay: 100 });
      framesCaptured++;
      requestAnimationFrame(captureFrame);
    }

    captureFrame();
  }
});
