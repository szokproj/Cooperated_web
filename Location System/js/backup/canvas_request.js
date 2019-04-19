var PIXEL_RATIO; // 獲取瀏覽器像素比
var cvsBlock, canvas, ctx;
var canvasImg = {
    isPutImg: false,
    width: 0,
    height: 0
};
var anchorMainArray = [];
var anchorArray = [];
var tagArray = [];
var alarmArray = [];
var lastX = 0; //滑鼠最後位置的X座標
var lastY = 0; //滑鼠最後位置的Y座標
var mouseDown = false;

// View parameters
var xleftView = 0;
var ytopView = 0;
var zoomOriginal = 1.0;
var Zoom = zoomOriginal; //actual width and height of zoomed and panned display
var fitZoom = 1;

var AnchorPosition = false,
    AnchorDisplay = true,
    isStart = false; //設定Anchor座標中

var tag_image_isOnload = false;
var tag_image = new Image();
var tag_img_size = 0;

var map_id = "";

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

    //canvas.addEventListener("dblclick", handleDblClick, false);  // dblclick to zoom in at point, shift dblclick to zoom out.
    //因為雙擊滑鼠放大的偏移過大，需花較多時間研究，暫時先擱置
    canvas.addEventListener("mousedown", handleMouseDown, false); // click and hold to pan
    canvas.addEventListener("mousemove", handleMouseMove, false);
    canvas.addEventListener("mouseup", handleMouseUp, false);
    cvsBlock.addEventListener("mousewheel", handleMouseWheel, false); // mousewheel duplicates dblclick function
    cvsBlock.addEventListener("DOMMouseScroll", handleMouseWheel, false); // for Firefox
    canvas.addEventListener('click', handleMouseClick, false);

    //設定並載入tag圖案
    tag_image.src = '../image/location.png';
    tag_image.onload = function () {
        tag_image_isOnload = true;
        tag_img_size = tag_image.height / tag_image.width;
    }
}

function loadImage(file) {
    var src = URL.createObjectURL(file);
    var serverImg = new Image();
    serverImg.src = src;
    serverImg.onload = function () {
        cvsBlock.style.background = "none";
        canvasImg.isPutImg = true;
        canvasImg.width = serverImg.width;
        canvasImg.height = serverImg.height;
        setCanvas(src, serverImg.width, serverImg.height);
        //canvas.style.position = "absolute"; //可以不設定
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        xleftView = 0;
        ytopView = 0;
        Zoom = zoomOriginal;
        ctx.save(); //紀錄原比例

        var serImgSize = serverImg.width / serverImg.height;
        var cvsSize = 1340 / 500;
        if (serImgSize > cvsSize) { //原圖比例寬邊較長
            fitZoom = 1340 / serverImg.width;
            setCanvas(src, 1350, serverImg.height * fitZoom);
        } else {
            fitZoom = 500 / serverImg.height;
            setCanvas(src, serverImg.width * fitZoom, 500);
        }
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
        canvas.style.backgroundSize = (canvasImg.width * fitZoom / Zoom) + "px " + (canvasImg.height * fitZoom / Zoom) + "px";
        canvas.width = canvasImg.width * fitZoom * PIXEL_RATIO / Zoom;
        canvas.height = canvasImg.height * fitZoom * PIXEL_RATIO / Zoom;
        canvas.style.width = canvasImg.width * fitZoom / Zoom + 'px';
        canvas.style.height = canvasImg.height * fitZoom / Zoom + 'px';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(PIXEL_RATIO * fitZoom, 0, 0, PIXEL_RATIO * fitZoom, 0, 0);
        ctx.scale(1 / Zoom, 1 / Zoom);
        ctx.translate(-xleftView, -ytopView);
    }
}

function restoreCanvas() {
    //恢復原比例
    xleftView = 0;
    ytopView = 0;
    Zoom = zoomOriginal;
    fitZoom = 1;
    setSize();
    ctx.restore();
    ctx.save();
}

function handleMouseWheel(event) {
    var targetX = lastX;
    var targetY = lastY;
    var x = targetX + xleftView; // View coordinates
    var y = targetY + ytopView;

    var scale = (event.wheelDelta < 0 || event.detail > 0) ? 1.1 : 0.9;

    Zoom *= scale; //縮放比例

    // scale about center of view, rather than mouse position. This is different than dblclick behavior.
    xleftView = x - targetX;
    ytopView = y - targetY;
    draw();
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
    return {
        x: x,
        y: y
    };
    //注：如果使用此方法無效的話，需要給Canvas元素的position設為absolute。
}

function clickEvent(p) { //滑鼠點擊事件
    var url; //開啟新視窗並傳送值進去
    tagArray.forEach(function (v, i) {
        drawTags(ctx, v.id, v.x, v.y);
        if (p && ctx.isPointInPath(p.x, p.y)) {
            //如果傳入了事件坐標，就用isPointInPath判斷一下
            $(function () {
                $("#member_dialog_tag_id").text(v.id);
                $("#member_dialog_name").text(v.name);
                $("#member_dialog_image").text(v.image);
                $("#member_dialog").dialog("open");
            });
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

/******************傳送要求到Server端************************/

function GetXmlHttpObject() {
    var xmlHttp = null;
    try { // Firefox, Opera 8.0+, Safari
        xmlHttp = new XMLHttpRequest();
    } catch (e) { //Internet Explorer
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    return xmlHttp;
}

/*------------------------------------*/
/*            接收並處理Alarm          */
/*------------------------------------*/

var alarm_dialog_count = 0;

function updateAlarmList() {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var list = "",
                items;
            var alarmIndex = -1;
            var tbody = document.getElementsByTagName("tbody");
            for (var i = 0; i < revObj.id.length; i++) {
                items = i + 1;
                list += "<tr><td>" + items +
                    "</td><td>" + revObj.id[i] +
                    "</td><td>" + revObj.alarm_status[i] +
                    "</td><td>" + revObj.time[i] +
                    "</td><td>" + revObj.name[i] +
                    "</td><td>" + revObj.image[i] +
                    "</td></tr>";
            }
            tbody[3].innerHTML = list; //此tbody在html文件中所有tbody標籤的排序(0開頭)-->3

            if (items > alarm_dialog_count) {
                var time_arr = TimeToArray(revObj.time[items - 1]);
                var thumb_id = "alarmCard_" + items;
                var color = "";
                switch (revObj.alarm_status[items - 1]) {
                    case "Low Power Alarm":
                        color = "#33cc00";
                        break;
                    case "Help Alarm":
                        color = "#ff3333";
                        break;
                    case "Still Alarm":
                        color = "#FF6600";
                        break;
                    case "Active Alarm":
                        color = "#FF6600";
                        break;
                    default:
                        color = "#FFFFFF"; //unknown
                }
                $(".thumbnail_columns").append("<div class=\"thumbnail\" id=\"" + thumb_id + "\"" +
                    "style=\"background:" + color + "\">" +
                    "<table>" +
                    "<tr>" +
                    "<td>" +
                    "<img src=\"../image/user2.png\">" +
                    "</td>" +
                    "<td>" +
                    "<p>Number:" + items + "</p>" +
                    "<p>Name:" + revObj.name[items - 1] + "</p>" +
                    "<p>ID:" + revObj.id[items - 1] + "</p>" +
                    "<p>Date:" + time_arr.date + "</p>" +
                    "<p>Time:" + time_arr.time + "</p>" +
                    "<p>Status:" + revObj.alarm_status[items - 1] + "</p>" +
                    "<p><a href=\"#\" class=\"btn btn-success\" role=\"button\">進行處理</a>" +
                    "<a href=\"#\" class=\"btn btn-info\" role=\"button\" style=\"margin-left: 10px;\">定位</a></p>" +
                    "</td>" +
                    "</tr>" +
                    "</table>" +
                    "</div>");
                document.getElementById(thumb_id).addEventListener("click", function () {
                    $("#" + thumb_id).hide(); //點下警告卡片會消失
                });
                alarmIndex = tagArray.findIndex(function (tags) {
                    return tags.id == revObj.id[items - 1]; // 比對Alarm與Tag的ID
                });
                if (alarmIndex > -1) {
                    alarmArray.push(tagArray[alarmIndex]); //將Tag資料放入AlarmArray中
                }
                changeAlarmLight();
            }
            alarm_dialog_count = items;
        }
    };
    xmlHttp.open("POST", "requestAlarmList", true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send();
}

function TimeToArray(time_str) {
    if (time_str.length > 0) {
        var break_index = time_str.lastIndexOf("/");
        /*var date = time_str.substring(0, break_index);
        var time = time_str.substring(break_index, time_str.length);*/
        return {
            date: time_str.substring(0, break_index),
            time: time_str.substring(break_index + 1, time_str.length)
        };
    }
}

function changeAlarmLight() {
    if (alarmArray.length > 0) {
        document.getElementById("sideBarLeft_light").src = "../image/alarm1.png";
    } else {
        document.getElementById("sideBarLeft_light").src = "../image/alarm3.png";
    }
}

/*------------------------------------*/

function updateMemberList() {

    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var list = "",
                items;
            var tbody = document.getElementsByTagName("tbody");
            for (var i = 0; i < revObj.tag_list.length; i++) {
                items = i + 1;
                list += "<tr><td>" + items +
                    "</td><td>" + " " +
                    "</td><td>" + revObj.name[i] +
                    "</td><td>" + revObj.tag_list[i].substring(14) +
                    "</td></tr>";
            }
            tbody[2].innerHTML = list; //此tbody在html文件中所有tbody標籤的排序(0開頭)-->2
        }
    };
    xmlHttp.open("POST", "requestMemberList", true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send();
}

function updateTagList() {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (canvasImg.isPutImg) {
                //setSize();
                var id, x, y;
                tagArray = [];
                for (i in revObj.x) {
                    id = revObj.tag_list[i];
                    x = revObj.x[i];
                    y = canvasImg.height - revObj.y[i]; //因為Server回傳的座標為左下原點 
                    //drawTags(dctx, id, x, y); //畫出點的設定
                    tagArray.push({
                        x: x,
                        y: y,
                        id: id,
                        name: "",
                        image: ""
                    });
                }
                //tagArray.sort(); //陣列排序
            }
        }
    };
    xmlHttp.open("POST", "requestTagList", true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send("map_id=" + map_id);
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
                    anchorMainArray.push({
                        id: id,
                        x: x,
                        y: y
                    });
                }
            }
        }
    };
    xmlHttp.open("POST", "requestMainAnchorPosition", true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
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
                    anchorArray.push({
                        id: id,
                        x: x,
                        y: y
                    });
                }
            }
        }
    };
    xmlHttp.open("POST", "requestAnchorPosition", true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send();
}

function getServerImage(map) {
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
    oReq.send("map_id=" + map);
    map_id = map;
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

function drawTags(dctx, id, x, y) {
    //var tagID = id.substring(13);
    if (tag_image_isOnload) {
        dctx.beginPath();
        dctx.drawImage(tag_image, x - 10, y - 20, 20, 20 * tag_img_size);
        //dctx.fillStyle = '#000000';
        //dctx.font = '15px serif';
        //dctx.fillText(tagID, x - 10, y - 20); //tagID
        dctx.fillStyle = '#ffffff00';
        dctx.arc(x, y - 10, 10, 0, Math.PI * 2, true); // circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
        dctx.fill(); //填滿圓形
        dctx.closePath();
    }
    //dctx.beginPath();
    //dctx.fillStyle = '#ffffff00';
    //dctx.arc(x, y, 10, 0, Math.PI * 2, true); // circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
    //dctx.fill(); //填滿圓形
    //dctx.stroke(); //畫圓形的線
    //dctx.closePath();
    //dctx.font = '10px serif';
    //dctx.strokeText(id, x, y); //tagID
}

function drawAlarmTags(dctx, id, x, y) {
    var alarm_image = new Image();
    alarm_image.src = '../image/alarm_dot.png';
    alarm_image.onload = function () {
        dctx.drawImage(this, x, y, 20, 20);
        //dctx.fillStyle = '#ff8c1a';
        //dctx.font = '10px serif';
        //dctx.strokeText(id, x, y); //tagID
    };
}

function drawAnchorPosition(dctx, x, y) {
    dctx.fillStyle = '#99cc00';
    dctx.beginPath();
    dctx.arc(x, y, 4, 0, Math.PI * 2, true);
    dctx.fill();
}

function draw() {
    setSize();
    anchorMainArray.forEach(function (v) {
        drawMainAnchor(ctx, v.id, v.x, v.y);
    });
    anchorArray.forEach(function (v) {
        drawAnchor(ctx, v.id, v.x, v.y);
    });
    tagArray.forEach(function (v) {
        drawTags(ctx, v.id, v.x, v.y);
    });
    alarmArray.forEach(function (v) {
        drawAlarmTags(ctx, v.id, v.x, v.y);
    });
}

function clickAnchorPosition() {
    AnchorPosition = !AnchorPosition;
}

function handleAnchorPosition() {
    setAddAnchorDialog(); //函式內容在dialog_anchor_setting.js中
    document.getElementById("anchor_x").value = lastX;
    document.getElementById("anchor_y").value = lastY;
}

function autoSendRequest() {
    if (isStart) {
        if (!AnchorPosition) {
            updateAlarmList()
            updateMemberList();
            updateTagList();
            draw();
            canvas.removeEventListener("click", handleAnchorPosition);
        } else {
            draw();
            var posX = lastX * Zoom;
            var posY = (canvas.height - lastY) * Zoom;
            drawAnchorPosition(ctx, posX, posY);
            canvas.addEventListener('click', handleAnchorPosition);
        }
    } else {
        draw();
    }
}

function StartClick() {
    if (canvasImg.isPutImg) {
        readMainAnchorSet();
        readAnchorSet();
        isStart = !isStart;
        if (isStart) {
            document.getElementById("btn_start").innerHTML = "Close <i class=\"fas fa-pause\" ></i >";
        } else {
            document.getElementById("btn_start").innerHTML = "Start <i class=\"fas fa-play\" ></i >";
        }
    }
}

//setInterval('autoSendRequest()', 100);

let delay = 100;
let timerOut = setTimeout(function request() {
    autoSendRequest();
    //if (request failed due to server overload) {
    //   //increase the interval to the next run
    //   delay *= 2;
    //}
    timerOut = setTimeout(request, delay);
}, delay);