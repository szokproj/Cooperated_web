var PIXEL_RATIO; // 獲取瀏覽器像素比
var cvsBlock, canvas, ctx;
var canvasImg = { isPutImg: false, width: 0, height: 0 };
var anchorMainArray = [];
var anchorArray = [];
var tagArray = [];
var lastX = 0; //滑鼠最後位置的X座標
var lastY = 0; //滑鼠最後位置的Y座標
var mouseDown = false;

// View parameters
var xleftView = 0;
var ytopView = 0;
var zoomOriginal = 1.0;
var Zoom = zoomOriginal;  //actual width and height of zoomed and panned display

var AnchorPosition = false; //設定Anchor座標中

window.addEventListener("load", setup, false);

function setup() {
    cvsBlock = document.getElementById("cvsBlock");
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    PIXEL_RATIO = (function () {
        var dpr = window.devicePixelRatio || 1,
            bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
        return dpr / bsr;
    })();

    canvas.addEventListener("dblclick", handleDblClick, false);  // dblclick to zoom in at point, shift dblclick to zoom out.
    canvas.addEventListener("mousedown", handleMouseDown, false); // click and hold to pan
    canvas.addEventListener("mousemove", handleMouseMove, false);
    canvas.addEventListener("mouseup", handleMouseUp, false);
    cvsBlock.addEventListener("mousewheel", handleMouseWheel, false); // mousewheel duplicates dblclick function
    cvsBlock.addEventListener("DOMMouseScroll", handleMouseWheel, false); // for Firefox
    canvas.addEventListener('click', handleMouseClick, false);
}

function loadImage(file) {
    var src = URL.createObjectURL(file);
    var serverImg = new Image();
    serverImg.src = src;
    serverImg.onload = function () {
        canvasImg.isPutImg = true;
        canvasImg.width = serverImg.width;
        canvasImg.height = serverImg.height;
        setCanvas(src, serverImg.width, serverImg.height);
        //canvas.style.position = "absolute"; //可以不設定
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        xleftView = 0;
        ytopView = 0;
        Zoom = zoomOriginal;
        ctx.save();
    };
}

function setCanvas(img_src, width, height) {
    canvas.style.backgroundImage = "url(" + img_src + ")";
    canvas.style.backgroundSize = width + "px " + height + "px";
    canvas.width = width * PIXEL_RATIO;
    canvas.height = height * PIXEL_RATIO;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

function setSize() {
    //縮放canvas與背景圖大小
    if (canvasImg.isPutImg) {
        canvas.style.backgroundSize = (canvasImg.width / Zoom) + "px " + (canvasImg.height / Zoom) + "px";
        canvas.width = canvasImg.width * PIXEL_RATIO / Zoom;
        canvas.height = canvasImg.height * PIXEL_RATIO / Zoom;
        canvas.style.width = canvasImg.width / Zoom + 'px';
        canvas.style.height = canvasImg.height / Zoom + 'px';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
        ctx.scale(1 / Zoom, 1 / Zoom);
        ctx.translate(-xleftView, -ytopView);
    }
}


function restoreCanvas() {
    //恢復原比例
    xleftView = 0;
    ytopView = 0;
    Zoom = zoomOriginal;
    setSize();
    ctx.restore();
    ctx.save();
}


function handleDblClick(event) {
    //var X = lastX;
    //var Y = lastY;

    var X = event.clientX - this.offsetLeft - this.clientLeft + this.scrollLeft; //Canvas coordinates
    var Y = event.clientY - this.offsetTop - this.clientTop + this.scrollTop;
    var scale = event.shiftKey == 1 ? 1.5 : 0.5; // shrink (1.5) if shift key pressed
    Zoom *= scale;

    if (Zoom > zoomOriginal) {
        Zoom = zoomOriginal;
        xleftView = 0;
        ytopView = 0;
    } else {
        xleftView = X * Zoom + xleftView; // widthView;
        ytopView = Y * Zoom + ytopView; // heightView;
    }
    draw();
}

function handleMouseDown(event) {
    mouseDown = true;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function getEventPosition(ev) { //獲取滑鼠點擊位置
    var x, y;
    if (ev.layerX || ev.layerX == 0) {
        x = ev.layerX;
        y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
        x = ev.offsetX;
        y = ev.offsetY;
    }
    return { x: x, y: y };
    //注：如果使用此方法無效的話，需要給Canvas元素的position設為absolute。
}

function clickEvent(p) { //滑鼠點擊事件
    var url; //開啟新視窗並傳送值進去
    tagArray.forEach(function (v, i) {
        drawTags(ctx, v.id, v.x, v.y)
        if (p && ctx.isPointInPath(p.x, p.y)) {
            //如果傳入了事件坐標，就用isPointInPath判斷一下
            url = 'http://localhost/Location%20System/php/createWindow.php?tag_id=' + v.id +
                '&name=' + v.name + '&image=' + v.image;
            window.open(url, 'newwindow', 'width=200,height=200');
        }
    });
}

function handleMouseClick(event) {
    var p = getEventPosition(event);
    clickEvent(p);
}

function handleMouseMove(event) {
    //滑鼠移動事件
    var x = event.pageX;
    var y = event.pageY;
    var loc = getPointOnCanvas(x, y);
    if (canvasImg.isPutImg) {
        if (mouseDown) {
            var dx = (loc.x - lastX) / canvasImg.width * Zoom;
            var dy = (loc.y - lastY) / canvasImg.height * Zoom;
            xleftView -= dx;
            ytopView -= dy;
        }
        document.getElementById('x').value = loc.x * Zoom;
        document.getElementById('y').value = loc.y * Zoom;
        lastX = loc.x;
        lastY = loc.y;
    }
}

function getPointOnCanvas(x, y) {
    //獲取滑鼠在Canvas物件上座標(座標起始點從左上換到左下)
    var BCR = canvas.getBoundingClientRect();
    var width = canvas.width;
    var height = canvas.height;
    return {
        x: x - BCR.left * (width / BCR.width),
        y: height - (y - BCR.top * (height / BCR.height))
    };
}

function handleMouseWheel(event) {
    var targetX = lastX;
    var targetY = lastY;
    var x = targetX + xleftView;  // View coordinates
    var y = targetY + ytopView;

    var scale = (event.wheelDelta < 0 || event.detail > 0) ? 1.1 : 0.9;

    Zoom *= scale; //縮放比例

    // scale about center of view, rather than mouse position. This is different than dblclick behavior.
    xleftView = x - targetX;
    ytopView = y - targetY;
    draw();
}