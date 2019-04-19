var cvsBlock, canvas, ctx;
var serverImg = new Image();
var canvasImg = { haveImg: false, width: 0, height: 0 };
var tagArray = [];
var lastX = 0; //滑鼠最後位置的X座標
var lastY = 0; //滑鼠最後位置的Y座標
var mouseDown = false;

// View parameters
var xleftView = 0;
var ytopView = 0;
var widthViewOriginal = 1.0;           //actual width and height of zoomed and panned display
var heightViewOriginal = 1.0;
var widthView = widthViewOriginal;           //actual width and height of zoomed and panned display
var heightView = heightViewOriginal;


window.addEventListener("load", setup, false);

function setup() {
    cvsBlock = document.getElementById("cvsBlock");
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.addEventListener("dblclick", handleDblClick, false);  // dblclick to zoom in at point, shift dblclick to zoom out.
    canvas.addEventListener("mousedown", handleMouseDown, false); // click and hold to pan
    canvas.addEventListener("mousemove", handleMouseMove, false);
    canvas.addEventListener("mouseup", handleMouseUp, false);
    cvsBlock.addEventListener("mousewheel", handleMouseWheel, false); // mousewheel duplicates dblclick function
    canvas.addEventListener("DOMMouseScroll", handleMouseWheel, false); // for Firefox
    canvas.addEventListener('click', handleMouseClick, false);
}

function loadFile(file) {
    var src = URL.createObjectURL(file);
    serverImg.src = src;
    serverImg.onload = function () {
        canvasImg.haveImg = true;
        canvasImg.width = serverImg.width;
        canvasImg.height = serverImg.height;
        canvas.width = canvasImg.width;
        canvas.height = canvasImg.height;
        canvas.style.width = canvasImg.width + 'px';
        canvas.style.height = canvasImg.height + 'px';
        ctx.clearRect(0, 0, canvasImg.width, canvasImg.height);
        ctx.drawImage(serverImg, 0, 0, canvasImg.width, canvasImg.height);
        xleftView = 0;
        ytopView = 0;
        widthView = widthViewOriginal;
        heightView = heightViewOriginal;
        ctx.save();
    };
}


function putBackground(img) {
    canvas.style.width = canvasImg.width / widthView + 'px';
    canvas.style.height = canvasImg.height / heightView + 'px';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(1 / widthView, 1 / heightView);
    ctx.translate(-xleftView, -ytopView);
    ctx.drawImage(img, 0, 0, canvasImg.width, canvasImg.height);
}

function handleDblClick(event) {
    //var X = lastX;
    //var Y = lastY;

    var X = event.clientX - this.offsetLeft - this.clientLeft + this.scrollLeft; //Canvas coordinates
    var Y = event.clientY - this.offsetTop - this.clientTop + this.scrollTop;
    var scale = event.shiftKey == 1 ? 1.5 : 0.5; // shrink (1.5) if shift key pressed
    widthView *= scale;
    heightView *= scale;

    if (widthView > widthViewOriginal || heightView > heightViewOriginal) {
        widthView = widthViewOriginal;
        heightView = heightViewOriginal;
        xleftView = 0;
        ytopView = 0;
    } else {
        xleftView = X * widthView + xleftView; // widthView;
        ytopView = Y * heightView + ytopView; // heightView;
    }

    //canvas.width = canvasImg.width;
    //canvas.height = canvasImg.height;
    putBackground(serverImg);

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
    //注：使用上面这个函数，需要给Canvas元素的position设为absolute。(但我沒設...)
}

function clickEvent(p) { //滑鼠點擊事件
    var url; //開啟新視窗並傳送值進去
    putBackground(serverImg);
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
    if (canvasImg.haveImg) {
        if (mouseDown) {
            var dx = (loc.x - lastX) / canvasImg.width * widthView;
            var dy = (loc.y - lastY) / canvasImg.height * heightView;
            xleftView -= dx;
            ytopView -= dy;
        }
        document.getElementById('x').value = loc.x * widthView;
        document.getElementById('y').value = loc.y * heightView;
        lastX = loc.x;
        lastY = loc.y;
    }
    //draw();
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

    widthView *= scale; //x軸的縮放比例
    heightView *= scale; //y軸的縮放比例

    /*if (widthView > widthViewOriginal || heightView > heightViewOriginal) {
        //只能放大
        widthView = widthViewOriginal;
        heightView = heightViewOriginal;
        x = targetX;
        y = targetY;
    }*/

    // scale about center of view, rather than mouse position. This is different than dblclick behavior.
    xleftView = x - targetX;
    ytopView = y - targetY;

    canvas.width = canvasImg.width / widthView;
    canvas.height = canvasImg.height / heightView;

    putBackground(serverImg);

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

            if (canvasImg.haveImg) {
                putBackground(serverImg);
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

function draw(dctx, x, y) {
    //dctx.fillStyle = "red";
    //dctx.fillRect(x, y, 10, 10);
    dctx.fillStyle = "red";
    dctx.beginPath();
    dctx.arc(x, y, 2, 0, Math.PI * 2, true); // circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
    dctx.fill(); //填滿圓形
    //dctx.stroke(); //畫線圓形
    //dctx.font = '10px serif';
    //dctx.strokeText(text, x, y); //tagID
}

function autoChangeHint() {
    update2("request2", "txtHint2");
    update3("request3");
    update3("request3");
}

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
