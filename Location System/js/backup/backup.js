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


// 或取瀏覽器像素比
var PIXEL_RATIO;

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
        //canvas.style.position = "absolute";
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

    setSize();

    tagArray.forEach(function (v, i) {
        draw(ctx, v.x, v.y);
    });
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
    setSize();
    tagArray.forEach(function (v, i) {
        draw(ctx, v.x, v.y);
        if (p && ctx.isPointInPath(p.x, p.y)) {
            //如果传入了事件坐标，就用isPointInPath判断一下
            url = 'http://localhost/Location%20System/php/createWindow.php?tag_id=' + v.tag_id +
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

    setSize();

    tagArray.forEach(function (v, i) {
        draw(ctx, v.x, v.y);
    });
}


/******************傳送要求到Server端************************/

setInterval('autoChangeHint()', 500);

function GetXmlHttpObject() {
    var xmlHttp = null;
    try {// Firefox, Opera 8.0+, Safari
        xmlHttp = new XMLHttpRequest();
    }
    catch (e) {//Internet Explorer
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    return xmlHttp;
}

function update1(url, locationID) {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var table1 = "<table><tr style=\"background:lightgray;\">" +
                "<th>Items</th>" +
                "<th>Name</th>" +
                "<th>ID</th>" +
                "<th>Time</th>" +
                "<th>Alarm Status</th>" +
                "<th>Image</th></tr>";
            var revObj = JSON.parse(this.responseText);
            for (i in revObj.items) {
                table1 += "<tr><td>" + revObj.items[i] +
                    "</td><td>" + revObj.name[i] +
                    "</td><td>" + revObj.id[i] +
                    "</td><td>" + revObj.time[i] +
                    "</td><td>" + revObj.alarm_status[i] +
                    "</td><td>" + revObj.image[i] +
                    "</td></tr>";
            }
            table1 += "</table>";
            document.getElementById(locationID).innerHTML = table1;
        }
    };
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.send();
}

function update2(url, locationID) {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var table2 = "<table><tr style=\"background:lightgray;\">" +
                "<th>Items</th>" +
                "<th>Display ID</th>" +
                "<th>Name</th>" +
                "<th>Tag List</th></tr>";
            var revObj = JSON.parse(this.responseText);
            var id;
            for (var i = 0; i < revObj.tag_list.length; i++) {
                id = i + 1;
                table2 += "<tr><td>" + id +
                    "</td><td>" + " " +
                    "</td><td>" + revObj.name[i] +
                    "</td><td>" + revObj.tag_list[i].substring(14) +
                    "</td></tr>";
            }
            table2 += "</table>";
            document.getElementById(locationID).innerHTML = table2;
        }
    };
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.send();
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
            if (canvasImg.isPutImg) {
                setSize();
                var text, x, y;
                tagArray = [];
                for (i in revObj.x) {
                    text = revObj.tag_list[i].substring(14);
                    x = revObj.x[i];
                    y = canvasImg.height - revObj.y[i]; //因為Server回傳的座標為左下原點
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

function readMainAnchorSet() {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (canvasImg.isPutImg) {
                setSize();
                var id, x, y;
                anchorMainArray = [];
                for (i in revObj.main_id) {
                    id = revObj.main_id[i];
                    x = revObj.main_x[i] / 3;
                    y = canvasImg.height - revObj.main_y[i] / 3; //因為Server回傳的座標為左下原點
                    drawMainAnchor(ctx, id, x, y); //畫出點的設定
                    anchorMainArray.push({ id: id, x: x, y: y });
                }
            }
        }
    };
    xmlHttp.open("POST", "requestMainAnchorPosition", true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.send();
}

function readAnchorSet() {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (canvasImg.isPutImg) {
                setSize();
                var id, x, y;
                anchorArray = [];
                for (i in revObj.id) {
                    id = revObj.id[i];
                    x = revObj.x[i] / 3;
                    y = canvasImg.height - revObj.y[i] / 3; //因為Server回傳的座標為左下原點
                    drawAnchor(ctx, id, x, y); //畫出點的設定
                    anchorArray.push({ id: id, x: x, y: y });
                }
            }
        }
    };
    xmlHttp.open("POST", "requestAnchorPosition", true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.send();
}


function drawMainAnchor(dctx, id, x, y) {
    dctx.fillStyle = "red";
    dctx.font = '13px serif';
    dctx.fillText(id, x, y); //MainAnchorID
    dctx.fillRect(x, y, 10, 10);
}

function drawAnchor(dctx, id, x, y) {
    dctx.fillStyle = "blue";
    dctx.font = '13px serif';
    dctx.fillText(id, x, y); //anchorID
    dctx.fillRect(x, y, 10, 10);
}

function draw(dctx, x, y) {
    anchorMainArray.forEach(function (v) {
        drawMainAnchor(dctx, v.id, v.x, v.y);
    });
    anchorArray.forEach(function (v) {
        drawAnchor(dctx, v.id, v.x, v.y);
    });
    dctx.fillStyle = '#ff8c1a';
    dctx.beginPath();
    dctx.arc(x, y, 2, 0, Math.PI * 2, true); // circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
    dctx.fill(); //填滿圓形
    //dctx.stroke(); //畫線圓形
    //dctx.closePath();
    //dctx.font = '10px serif';
    //dctx.strokeText(text, x, y); //tagID
}

function autoChangeHint() {
    update2("request2", "txtHint2");
    update3("requestTagList");
}

function getServerImage() {
    var oReq = new XMLHttpRequest();
    if (oReq == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    oReq.open("POST", "requestImage", true);
    oReq.responseType = "blob";
    oReq.onreadystatechange = function () {
        if (oReq.readyState == oReq.DONE) {
            var blob = oReq.response;
            loadImage(blob);
        }
    }
    oReq.send();
}