var PIXEL_RATIO; // 獲取瀏覽器像素比
var cvsBlock, canvas, ctx;
var canvasImg = {
    isPutImg: false,
    width: 0,
    height: 0,
    scale: 1
}; //預設比例尺為1:1
var lastX = 0; //滑鼠最後位置的X座標
var lastY = 0; //滑鼠最後位置的Y座標
var mouseDown = false;
// View parameters
var xleftView = 0;
var ytopView = 0;
var zoomOriginal = 1.0;
var Zoom = zoomOriginal; //actual width and height of zoomed and panned display
var fitZoom = 1;
var isFitWindow = true;

var isPosition = false;
var serverImg = new Image();
var map_id = "";
var anchorArray = [];

var displayMapInfo = true;
var pageTimer = {}; //定義計時器全域變數

window.addEventListener("load", setupCanvas, false);

function setupCanvas() {
    cvsBlock = document.getElementById("mapBlock");
    canvas = document.getElementById("canvas_map");
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
    canvas.addEventListener("mousemove", handleMouseMove, false);
    canvas.addEventListener("mousewheel", handleMouseWheel, false);
    cvsBlock.addEventListener("mousewheel", handleMouseWheel, false); // mousewheel duplicates dblclick function
    cvsBlock.addEventListener("DOMMouseScroll", handleMouseWheel, false); // for Firefox

    $(function () {
        $("#map_info_scale").on("change", function () {
            canvasImg.scale = $(this).val();
            catchAnchors();
            draw();
        });
    });
}

function setMap(map_url, map_scale) { //接收Server發送的地圖資料並導入
    map_scale = typeof (map_scale) != 'undefined' && map_scale != "" ? map_scale : 1;
    serverImg.src = map_url;
    serverImg.onload = function () {
        cvsBlock.style.background = "none";
        canvasImg.isPutImg = true;
        canvasImg.width = serverImg.width;
        canvasImg.height = serverImg.height;
        canvasImg.scale = map_scale;
        setCanvas(this.src, serverImg.width, serverImg.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        xleftView = 0;
        ytopView = 0;
        Zoom = zoomOriginal;
        ctx.save(); //紀錄原比例

        var serImgSize = serverImg.width / serverImg.height;
        var cvs_width = parseFloat($("#mapBlock").css("width")) - 2;
        var cvs_height = parseFloat($("#mapBlock").css("height")) - 2;
        var cvsSize = cvs_width / cvs_height;
        if (serImgSize > cvsSize) { //原圖比例寬邊較長
            fitZoom = cvs_width / serverImg.width;
            setCanvas(this.src, cvs_width, serverImg.height * fitZoom);
        } else {
            fitZoom = cvs_height / serverImg.height;
            setCanvas(this.src, serverImg.width * fitZoom, cvs_height);
        }
    };
}

function resetCanvas_Anchor() {
    cvsBlock.style.background = '#ccc';
    canvasImg.isPutImg = false;
    canvasImg.width = 0;
    canvasImg.height = 0;
    canvasImg.scale = 1;
    setCanvas("", 1, 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    xleftView = 0;
    ytopView = 0;
    Zoom = zoomOriginal;
    anchorArray = [];
}

function loadImage(dataUrl) { //新增或更換地圖
    var src = dataUrl;
    serverImg.src = src;
    serverImg.onload = function () {
        cvsBlock.style.background = "none";
        canvasImg.isPutImg = true;
        canvasImg.width = serverImg.width;
        canvasImg.height = serverImg.height;
        canvasImg.scale = 1;
        setCanvas(src, serverImg.width, serverImg.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        xleftView = 0;
        ytopView = 0;
        Zoom = zoomOriginal;
        ctx.save(); //紀錄原比例

        var serImgSize = serverImg.width / serverImg.height;
        var cvs_width = parseFloat($("#mapBlock").css("width")) - 2;
        var cvs_height = parseFloat($("#mapBlock").css("height")) - 2;
        var cvsSize = cvs_width / cvs_height;
        if (serImgSize > cvsSize) { //原圖比例寬邊較長
            fitZoom = cvs_width / serverImg.width;
            setCanvas(src, cvs_width, serverImg.height * fitZoom);
        } else {
            fitZoom = cvs_height / serverImg.height;
            setCanvas(src, serverImg.width * fitZoom, cvs_height);
        }
        draw();
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

function resizeCanvas() {
    xleftView = 0;
    ytopView = 0;
    Zoom = zoomOriginal;
    if (isFitWindow) { //恢復原比例
        fitZoom = 1;
        ctx.restore();
        ctx.save();
        isFitWindow = false; //目前狀態:原比例 
        document.getElementById("label_resize").innerHTML = "<i class=\"fas fa-compress\" style='font-size:20px;'></i>";
        document.getElementById("label_resize").title = "Fit in window";
    } else { //依比例拉伸(Fit in Window)
        var cvs_width = parseFloat($("#mapBlock").css("width")) - 2;
        var cvs_height = parseFloat($("#mapBlock").css("height")) - 2;
        if ((serverImg.width / serverImg.height) > (cvs_width / cvs_height)) //原圖比例寬邊較長
            fitZoom = cvs_width / serverImg.width;
        else
            fitZoom = cvs_height / serverImg.height;
        isFitWindow = true; //目前狀態:依比例拉伸
        document.getElementById("label_resize").innerHTML = "<i class=\"fas fa-expand\" style='font-size:20px;'></i>";
        document.getElementById("label_resize").title = "Restore the original size";
    }
    draw();
}

function handleMouseWheel(event) {
    window.event ? window.event.cancelBubble = true : event.stopPropagation();
    if (event.preventDefault)
        event.preventDefault();
    var targetX = lastX;
    var targetY = lastY;
    var x = targetX + xleftView; // View coordinates
    var y = targetY + ytopView;
    var scale = (event.wheelDelta < 0 || event.detail > 0) ? 1.1 : 0.9;
    Zoom *= scale; //縮放比例
    xleftView = x - targetX;
    ytopView = y - targetY;
    draw();
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
    var loc = getPointOnCanvas(event.pageX, event.pageY);
    if (canvasImg.isPutImg) {
        lastX = loc.x;
        lastY = loc.y;
        var x = (lastX * Zoom / fitZoom * canvasImg.scale).toFixed(2);
        var y = (lastY * Zoom / fitZoom * canvasImg.scale).toFixed(2);
        document.getElementById('x').innerText = x > 0 ? x : 0; //parseInt(lastX * Zoom / fitZoom);
        document.getElementById('y').innerText = y > 0 ? y : 0; //parseInt(lastY * Zoom / fitZoom);
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


function getAnchors(map_allAnchorsID) {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAnchors"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var revInfo = revObj.Values;
                var canvas = document.getElementById("canvas_map");
                var ctx = canvas.getContext("2d");
                var id, type, x, y;
                var anchorList = [];
                var mainAnchorID = [];
                var anchorID = [];
                anchorArray = [];
                setSize();
                if (revInfo) {
                    for (i in revInfo) {
                        var hasAnc = map_allAnchorsID.indexOf(revInfo[i].anchor_id);
                        if (hasAnc > -1) {
                            anchorList.push(revInfo[i]);
                            id = revInfo[i].anchor_id;
                            type = revInfo[i].anchor_type;
                            x = revInfo[i].set_x / canvasImg.scale;
                            y = canvasImg.height - revInfo[i].set_y / canvasImg.scale; //因為Server回傳的座標為左下原點
                            anchorArray.push({
                                id: id,
                                type: type,
                                x: x,
                                y: y
                            });
                            drawAnchor(ctx, id, type, x, y); //畫出點的設定
                        }

                        if (revInfo[i].anchor_type == "main")
                            mainAnchorID.push(revInfo[i].anchor_id);
                        else
                            anchorID.push(revInfo[i].anchor_id);
                    }
                }
                draw();
                inputAnchorList(anchorList);
                setGrouplist_mainAnchor(mainAnchorID);
                setAnchorgroup_anchor(anchorID);
            } else {
                alert("獲取AnchorList失敗，請再試一次!");
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function draw() {
    setSize();
    drawGroups(anchorArray);
    anchorArray.forEach(function (v) {
        drawAnchor(ctx, v.id, v.type, v.x, v.y);
    });
}

function drawAnchor(dctx, id, type, x, y) {
    if (type == "main")
        dctx.fillStyle = "red";
    else
        dctx.fillStyle = "blue";
    dctx.font = 13 * 3 / canvasImg.scale + 'px serif';
    dctx.fillText(id, x - 15, y - 6); //anchorID
    dctx.fillRect(x - 5, y - 5, 10 * 3 / canvasImg.scale, 10 * 3 / canvasImg.scale);
}

function drawAnchorPosition(dctx, x, y) {
    dctx.fillStyle = '#99cc00';
    dctx.beginPath();
    dctx.arc(x, y, 4, 0, Math.PI * 2, true);
    dctx.fill();
}

function catchAnchors() {
    var main_id = document.getElementsByName("list_main_anchor_id"),
        main_x = document.getElementsByName("list_main_anchor_x"),
        main_y = document.getElementsByName("list_main_anchor_y"),
        a_id = document.getElementsByName("list_anchor_id"),
        a_x = document.getElementsByName("list_anchor_x"),
        a_y = document.getElementsByName("list_anchor_y");
    anchorArray = [];
    for (i = 0; i < main_id.length; i++) {
        anchorArray.push({
            id: main_id[i].value,
            type: "main",
            x: main_x[i].value / canvasImg.scale,
            y: canvasImg.height - main_y[i].value / canvasImg.scale //因為Server回傳的座標為左下原點
        });
    }
    for (j = 0; j < a_id.length; j++) {
        anchorArray.push({
            id: a_id[j].value,
            type: "",
            x: a_x[j].value / canvasImg.scale,
            y: canvasImg.height - a_y[j].value / canvasImg.scale //因為Server回傳的座標為左下原點
        });
    }
    draw();
}

function addAnchorArray(type, id, x, y) {
    anchorArray.push({
        id: id,
        type: type,
        x: x / canvasImg.scale,
        y: canvasImg.height - y / canvasImg.scale
    });
    draw();
}

function handleAnchorPosition() {
    $(function () {
        $("#anchor_type").val("");
        $("#anchor_id").val("");
        $("#anchor_x").val($("#x").text());
        $("#anchor_y").val($("#y").text());
        setDropdown_Group();
        $("#dialog_add_new_anchor").dialog("open");
    });
}

function startAnchorPosition() {
    if (!isPosition) {
        isPosition = true;
        document.getElementById("label_anchor_position").innerHTML = "<i class='fas fa-map-marked' style='font-size:20px;'></i>";
        document.getElementById("label_anchor_position").title = "Stop anchor position";
        //設定計時器 pageTimer["timer1"] = setInterval("autoSendRequest()", delaytime);
        var delaytime = 100; //0.1s
        pageTimer["timer1"] = setTimeout(function request() {
            draw();
            var posX = lastX * Zoom / fitZoom;
            var posY = ((canvas.height - lastY) * Zoom / fitZoom);
            drawAnchorPosition(ctx, posX, posY);
            pageTimer["timer1"] = setTimeout(request, delaytime);
        }, delaytime);
        canvas.addEventListener("click", handleAnchorPosition);
    } else {
        isPosition = false;
        document.getElementById("label_anchor_position").innerHTML = "<i class='fas fa-map-marked-alt' style='font-size:20px;'></i>";
        document.getElementById("label_anchor_position").title = "Start anchor position";
        //清除計時器 clearInterval(pageTimer[each]);
        //clearTimeout(pageTimer["timer1"]);
        for (var each in pageTimer) {
            clearTimeout(pageTimer[each]);
        }
        draw();
        canvas.removeEventListener("click", handleAnchorPosition);
    }
}



function Group() {
    var anchor_array = [];
    this.setAnchor = function (id, x, y) {
        anchor_array.push({
            id: id,
            x: x,
            y: y
        });
    }
    this.drawGroup = function () {
        var canvas = document.getElementById("canvas_map");
        var ctx = canvas.getContext("2d");
        var len = anchor_array.length;
        ctx.beginPath();
        anchor_array.forEach(function (v, i, arr) {
            if (i == len - 1) {
                ctx.lineTo(v.x, v.y);
                ctx.lineTo(arr[0].x, arr[0].y);
            } else {
                ctx.lineTo(v.x, v.y);
            }
        });
        ctx.strokeStyle = "rgb(255, 123, 0)";
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 153, 0, 0.61)";
        ctx.fill();
        ctx.closePath();
    }
}