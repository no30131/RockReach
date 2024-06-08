function onOpenCvReady() {
  let imgElement = null;

  document.getElementById('imageInput').addEventListener('change', function(e) {
    let file = e.target.files[0];
    let reader = new FileReader();

    reader.onload = function(event) {
      imgElement = new Image();
      imgElement.onload = function() {
        document.getElementById('processButton').disabled = false;
      };
      imgElement.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });

  document.getElementById('processButton').addEventListener('click', function() {
    if (imgElement) {
      let canvasInput = document.getElementById('canvasInput');
      let ctx = canvasInput.getContext('2d');
      canvasInput.width = imgElement.width;
      canvasInput.height = imgElement.height;
      ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

      let src = cv.imread(canvasInput);
      cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
      let dst = new cv.Mat();
      let ksize = new cv.Size(5, 5);
      let M = cv.getStructuringElement(cv.MORPH_CROSS, ksize);
      cv.morphologyEx(src, dst, cv.MORPH_GRADIENT, M);
      cv.imshow('canvasOutput', dst);

      // 釋放資源
      src.delete();
      dst.delete();
      M.delete();
    }
  });
}
