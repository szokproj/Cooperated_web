var canvas, ctx, widthCanvas, heightCanvas;
var serverImg = new Image();
var canvasImg = { width: "", height: "" };
var tagArray = [];

// View parameters
var dot_scale = 1;
var xleftView = 0;
var ytopView = 0;
var widthViewOriginal = 1.0;           //actual width and height of zoomed and panned display
var heightViewOriginal = 1.0;
var widthView = widthViewOriginal;           //actual width and height of zoomed and panned display
var heightView = heightViewOriginal;

var view = { x: 0, y: 0, zoom: 1 };

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
}//注：使用上面这个函数，需要给Canvas元素的position设为absolute。

function handleMouseWheel(event) {
    //滑鼠座標位置
    var loc = getPointOnCanvas(canvas, event.pageX, event.pageY);
    if (!canvas.style.background == "") {
    }

    var x = loc.x;
    var y = loc.y;
    var direction = (event.wheelDelta < 0 || event.detail > 0) ? 0.9 : 1.1;
    var factor = 0.05;
    var zoom = 1 * direction * factor;
    var width = canvas.width; //畫布全寬
    var height = canvas.height; //畫布全長

    var wx = (x - view.x) / (width * view.zoom); //到原點的水平距離/縮放後的畫布寬
    var wy = (y - view.y) / (height * view.zoom); //到原點的垂直距離/縮放後的畫布長

    view.x -= wx * width * zoom; //X軸原點座標(預設0)
    view.y -= wy * height * zoom; //Y軸原點座標(預設0)
    view.zoom += zoom; //縮放倍率

    tagArray.forEach(function (v, i) {
        draw(ctx, v.x, v.y);
    });
}


function update3(url) {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);

            if (!canvas.style.background == "") {
                var full_height = canvas.height;
                ctx.clearRect(0, 0, canvas.width, full_height);
                var text, x, y;
                tagArray = [];
                for (i in revObj.x) {
                    text = revObj.tag_list[i].substring(14);
                    x = revObj.x[i];
                    y = full_height - revObj.y[i]; //因為Server回傳的座標為左下原點
                    draw(ctx, x, y); //畫出點的設定
                    tagArray.push({ x: x, y: y, tag_id: text, name: "", image: "" });
                }
            }
        }
    };
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.send();
}

function draw(dctx, x, y) {
    //dctx.fillStyle = "red";
    //dctx.fillRect(x, y, 10, 10);
    dctx.setTransform(1, 0, 0, 1, 0, 0);
    dctx.scale(view.x, view.y);
    dctx.translate(view.zoom, view.zoom);

    //dctx.translate(controls.view.x, controls.view.y); //原點位移
    //dctx.scale(controls.view.zoom, controls.view.zoom); //圖片(形)縮放
    dctx.fillStyle = "red";
    dctx.beginPath();
    dctx.arc(x, y, 2, 0, Math.PI * 2, true); // circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
    dctx.fill(); //填滿圓形
    //dctx.stroke(); //畫線圓形
    //dctx.font = '10px serif';
    //dctx.strokeText(text, x, y); //tagID
}

window.addEventListener("load", setup, false);

function setup() {
    cvsBlock = document.getElementById("cvsBlock");
    PIXEL_RATIO = (function () {
        var dpr = window.devicePixelRatio || 1,
            bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
        return dpr / bsr;
    })();
}


var img = new Image();
var imgSize = { width: 0, height: 0 };

function getServerImage() {
    var oReq = new XMLHttpRequest();
    oReq.open("POST", "requestImage", true);
    oReq.responseType = "blob";
    oReq.onreadystatechange = function () {
        if (oReq.readyState == oReq.DONE) {
            var blob = oReq.response;
            loadFile(blob);
        }
    }
    oReq.send();
}

function loadImage(file) {
    var src = URL.createObjectURL(file);
    img.src = src;
    imgSize.width = img.width;
    imgSize.height = img.height;
}

function imageZoom(imgID, resultID) {
    var lens, result, cx, cy;
    //img = document.getElementById(imgID);
    result = document.getElementById(resultID);
    /*create lens:*/
    lens = document.createElement("DIV");
    lens.style.width = imgSize.width + 'px';
    lens.style.height = imgSize.height + 'px';
    /*calculate the ratio between result DIV and lens:*/
    cx = result.offsetWidth / lens.offsetWidth;
    cy = result.offsetHeight / lens.offsetHeight;
    /*set background properties for the result DIV:*/
    result.style.backgroundImage = "url('" + img.src + "')";
    result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
    /*execute a function when someone moves the cursor over the image, or the lens:*/
    lens.addEventListener("mousemove", moveLens);
    img.addEventListener("mousemove", moveLens);
    /*and also for touch screens:*/
    lens.addEventListener("touchmove", moveLens);
    img.addEventListener("touchmove", moveLens);
    function moveLens(e) {
        var pos, x, y;
        /*prevent any other actions that may occur when moving over the image:*/
        e.preventDefault();
        /*get the cursor's x and y positions:*/
        pos = getCursorPos(e);
        /*calculate the position of the lens:*/
        x = pos.x - (lens.offsetWidth / 2);
        y = pos.y - (lens.offsetHeight / 2);
        /*prevent the lens from being positioned outside the image:*/
        if (x > img.width - lens.offsetWidth) { x = img.width - lens.offsetWidth; }
        if (x < 0) { x = 0; }
        if (y > img.height - lens.offsetHeight) { y = img.height - lens.offsetHeight; }
        if (y < 0) { y = 0; }
        /*set the position of the lens:*/
        lens.style.left = x + "px";
        lens.style.top = y + "px";
        /*display what the lens "sees":*/
        result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
    }
    function getCursorPos(e) {
        var a, x = 0, y = 0;
        e = e || window.event;
        /*get the x and y positions of the image:*/
        a = img.getBoundingClientRect();
        /*calculate the cursor's x and y coordinates, relative to the image:*/
        x = e.pageX - a.left;
        y = e.pageY - a.top;
        /*consider any page scrolling:*/
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return { x: x, y: y };
    }
}