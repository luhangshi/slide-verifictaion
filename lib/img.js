/**
 * @description: 滑动验证码
 * @param {Object}
 */
function ImgCaptcha(config) {
  const { width: canvasWidth, height: canvasHeight, el: target, imgUrl } = config;
  target.innerHTML = `<div class="slider-verification" style="width:${canvasWidth}px">
      <div class="img-container">
          <canvas id="clip-piece" width="${canvasWidth}" height="${canvasHeight}">

          </canvas>
          <canvas id="clip-gap"  width="${canvasWidth}" height="${canvasHeight}">

          </canvas>
          <div class="img-tips-success" style="width:${canvasWidth}px" >
              验证通过
          </div>
          <div class="img-tips-error" style="width:${canvasWidth}px;">
              请正确拼合图像
          </div>
          <img src="${imgUrl}" alt="" style="width:${canvasWidth}px;;height:${canvasHeight}px">
      </div>
      <div class="slider-box">
          <span>
              请拖动滑块的解锁
          </span>
          <div class="slider-progress"></div>
          <div class="slider-point">
              <span>&gt;&gt;</span>
          </div>
</div></div>`;
  const pointer = document.querySelector('.slider-point');
  const progress = document.querySelector('.slider-progress');
  let isMouseDown = false;
  let startX;
  let selectable = true;

  // 画布
  const p_cvs = document.querySelector('#clip-piece');
  const p_ctx = p_cvs.getContext('2d');
  const g_cvs = document.querySelector('#clip-gap');
  const g_ctx = g_cvs.getContext('2d');
  let posX; let
    posY;

  function isSuitable(result) {
    return Math.abs(result - posX) < 5;
  }

  function makeGap(ctx, x, y, border) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 13, y);
    ctx.bezierCurveTo(x + 5, y - 15, x + 35, y - 15, x + 27, y);
    ctx.lineTo(x + 40, y);
    ctx.lineTo(x + 40, y + 13);
    ctx.bezierCurveTo(x + 55, y + 5, x + 55, y + 35, x + 40, y + 27);
    ctx.lineTo(x + 40, y + 40);
    ctx.lineTo(x, y + 40);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fill();
    if (border) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.clip();
  }

  function getPiecePostion(sX, eX, sY, eY) {
    return {
      x: Math.ceil(Math.random() * (eX - sX)) + sX,
      y: Math.ceil(Math.random() * (eY - sY)) + sY,
    };
  }

  function generatePic() {
    const posObj = getPiecePostion(canvasWidth / 4, 2 * canvasWidth / 3, 20, canvasHeight - 50);
    posY = posObj.y;
    posX = posObj.x;
    p_cvs.width = canvasWidth;
    p_cvs.height = canvasHeight;
    g_cvs.width = canvasWidth;
    g_cvs.height = canvasHeight;
    makeGap(g_ctx, posX, posY);
    p_cvs.style.left = `-${posX}px`;
    const img = new Image();
    img.src = imgUrl;
    img.style.width = `${canvasWidth}px`;
    img.style.height = `${canvasHeight}px`;
    img.onload = function tmp() {
      p_ctx.drawImage(this, 0, 0, canvasWidth, canvasHeight);
    };
    makeGap(p_ctx, posX, posY, 1);
  }
  function mouseDown(e) {
    if (selectable) {
      isMouseDown = true;
      startX = e.pageX;
    }
  }
  function goback(callback) {
    if (!pointer.classList.contains('mouseup') && pointer) {
      pointer.classList.add('mouseup');
      progress.classList.add('mouseup');
      p_cvs.classList.add('mouseup');
      pointer.style.left = 0;
      progress.style.width = 0;
      p_cvs.style.transform = '';
      callback && callback();
      setTimeout(() => {
        selectable = true;
        p_cvs.classList.remove('mouseup');
        pointer.classList.remove('mouseup');
        progress.classList.remove('mouseup');
      }, 300);
    }
  }
  function mouseUp() {
    if(!isMouseDown) {
      return;
    }
    isMouseDown = false;
    const result = parseInt(pointer.style.left, 10);
    selectable = false;
    if (isSuitable(result)) {
      !document.querySelector('.img-tips-success').classList.contains('active')
        && document.querySelector('.img-tips-success').classList.add('active');
      setTimeout(() => {
        document.querySelector('.img-tips-error') && document.querySelector('.img-tips-success').classList.remove('active');
        goback(config.success);
      }, 500);
    } else {
      !document.querySelector('.img-tips-error').classList.contains('active')
        && document.querySelector('.img-tips-error').classList.add('active');
      setTimeout(() => {
        document.querySelector('.img-tips-error') && document.querySelector('.img-tips-error').classList.remove('active');
        goback();
      }, 1000);
    }
  }

  function mouseMove(e) {
    if (isMouseDown) {
      let left = e.pageX - startX;
      if (left < 0) {
        left = 0;
      }
      if (left > canvasWidth - 36) {
        left = canvasWidth - 36;
      }
      pointer.style.left = `${left}px`;
      progress.style.width = `${left}px`;
      p_cvs.style.transform = `translateX(${left}px)`;
    }
  }

  function init() {
    pointer.addEventListener('mousedown', mouseDown);
    pointer.addEventListener('mousemove', mouseMove);
    pointer.addEventListener('mouseup', mouseUp);
    pointer.addEventListener('mouseleave', mouseUp);
    generatePic();
  }

  function removeListeners() {
    pointer.removeEventListener('mousedown', mouseDown);
    pointer.removeEventListener('mousemove', mouseMove);
    pointer.removeEventListener('mouseup', mouseUp);
    pointer.removeEventListener('mouseleave', mouseUp);
  }

  this.init = init;
  this.reset = generatePic;
  this.detory = removeListeners;
  this.init();
}


export default ImgCaptcha
