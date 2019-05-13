var posMoniCanvas;//画布
var posMoniCtx;//画笔

var imgX = 0, imgY = 0, imgScale = 1, minScale = 1, maxScale = 8,
    destWidth, destHeight;
var bgImg;

//chrome firefox浏览器兼容  滚轮事件
posMoniCanvas.onmousewheel = posMoniCanvas.onwheel = function (e) {

    e.wheelDelta = e.wheelDelta ? e.wheelDelta : (e.deltaY * (-40));

    if (e.wheelDelta > 0 && imgScale < maxScale) {//放大              
        imgScale *= 2;
        imgX = imgX * 2 - mousePos.x;
        imgY = imgY * 2 - mousePos.y;
        drawAllComponent();
    }

    if (e.wheelDelta < 0 && imgScale > minScale) {//缩小              
        imgScale *= 0.5;
        imgX = imgX * 0.5 + mousePos.x * 0.5;
        imgY = imgY * 0.5 + mousePos.y * 0.5;
        drawAllComponent();
    }
}

function drawAllComponent() {

    //清空面板
    posMoniCtx.clearRect(0, 0, posMoniCanvas.width, posMoniCanvas.height);
    //重绘背景图 
    destWidth = posMoniCanvas.width * imgScale;
    destHeight = posMoniCanvas.height * imgScale;
    posMoniCtx.drawImage(bgImg, 0, 0, bgImg.width, bgImg.height, imgX, imgY, destWidth, destHeight);
}