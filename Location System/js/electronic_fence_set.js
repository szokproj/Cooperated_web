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
var mapArray = [];
var fenceArray = [];
var fenceDotArray = [];
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
        $("#block_fence_dot_setting").hide();
        $("#label_fence_info").css('background-color', 'rgb(40, 108, 197)');
        $("#menu_fence_info").on('click', function () {
            $("#block_fence_dot_setting").hide();
            $("#block_fence_setting").show();
            $("#label_fence_info").css('background-color', 'rgb(40, 108, 197)');
            $("#label_fence_dot_list").css('background-color', 'rgb(57, 143, 255)');
        });
        $("#menu_fence_dot_list").on('click', function () {
            $("#block_fence_setting").hide();
            $("#block_fence_dot_setting").show();
            $("#label_fence_dot_list").css('background-color', 'rgb(40, 108, 197)');
            $("#label_fence_info").css('background-color', 'rgb(57, 143, 255)');
        });
        $("#menu_resize").on('click', resizeCanvas);
        $("#select_map").on('change', function () {
            setMapById($(this).val());
        });
        loadMaps();
    });
}

function loadMaps() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var revInfo = revObj.Values;
                mapArray = [];
                revInfo.forEach(v => {
                    mapArray.push({
                        id: v.map_id,
                        name: v.map_name,
                        file: v.map_file,
                        file_ext: v.map_file_ext,
                        scale: v.map_scale
                    });
                });
                $("#select_map").append(displayNameOptions(mapArray, mapArray[0].id));
                //初始化
                map_id = mapArray[0].id;
                setMapById(map_id);
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function setMapById(id) { //選擇地圖(下拉選單)後，依據map_id抓取對應資訊
    var index = mapArray.findIndex(function (map_info) {
        return map_info.id == id;
    });
    if (index > -1) {
        var path = getFileName(mapArray[index].path);
        var scale = mapArray[index].scale;
        setMap(path, scale);
    } else {
        return;
    }
}

function setMap(map_path, map_scale) { //接收Server發送的地圖資料並導入
    serverImg.src = '../image/map/' + getFileName(map_path);
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
        console.log(cvs_width + "," + cvs_height);
        var cvsSize = cvs_width / cvs_height;
        if (serImgSize > cvsSize) { //原圖比例寬邊較長
            fitZoom = cvs_width / serverImg.width;
            setCanvas(this.src, cvs_width, serverImg.height * fitZoom);
        } else {
            fitZoom = cvs_height / serverImg.height;
            setCanvas(this.src, serverImg.width * fitZoom, cvs_height);
        }
        inputFences();
    };
}

function getFileName(src) {
    var pos1 = src.lastIndexOf("\\");
    var pos2 = src.lastIndexOf("/");
    var pos = -1;
    if (pos1 < 0) pos = pos2;
    else pos = pos1;
    return src.substring(pos + 1);
}

function resetCanvas() {
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
        document.getElementById("label_resize").title = "符合視窗大小";
    } else { //依比例拉伸(Fit in Window)
        var cvs_width = parseFloat($("#mapBlock").css("width")) - 2;
        var cvs_height = parseFloat($("#mapBlock").css("height")) - 2;
        if ((serverImg.width / serverImg.height) > (cvs_width / cvs_height)) //原圖比例寬邊較長
            fitZoom = cvs_width / serverImg.width;
        else
            fitZoom = cvs_height / serverImg.height;
        isFitWindow = true; //目前狀態:依比例拉伸
        document.getElementById("label_resize").innerHTML = "<i class=\"fas fa-expand\" style='font-size:20px;'></i>";
        document.getElementById("label_resize").title = "恢復原比例";
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

function handleMouseMove(event) {
    //滑鼠移動事件
    var x = event.pageX;
    var y = event.pageY;
    var loc = getPointOnCanvas(x, y);
    if (canvasImg.isPutImg) {
        lastX = loc.x;
        lastY = loc.y;
        document.getElementById('x').value = (lastX * Zoom / fitZoom * canvasImg.scale).toFixed(2); //parseInt(lastX * Zoom / fitZoom);
        document.getElementById('y').value = (lastY * Zoom / fitZoom * canvasImg.scale).toFixed(2); //parseInt(lastY * Zoom / fitZoom);
    }
}

function getPointOnCanvas(x, y) {
    //獲取滑鼠在Canvas上的座標(座標起始點從左上換到左下)
    var BCR = canvas.getBoundingClientRect();
    var width = canvas.width;
    var height = canvas.height;
    return {
        x: x - BCR.left * (width / BCR.width),
        y: height - (y - BCR.top * (height / BCR.height))
    };
}


function inputFences() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetFences"],
        "Value": {
            "map_id": map_id
        }
    };
    var xmlHttp = createJsonXmlHttp("GetFences");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var revList = revObj.Values;
                fenceArray = [];
                revList.forEach(v => {
                    fenceArray.push({
                        id: v.id,
                        name: v.name
                    });
                });
                updateFenceArr();
                inputFenceDots(map_id);
            } else {
                alert("獲取圍籬資訊失敗，請再試一次!");
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function inputFenceDots() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetFenceDots"],
        "Value": {
            "map_id": map_id
        }
    };
    var xmlHttp = createJsonXmlHttp("GetFenceDots");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var revList = revObj.Values;
            if (revObj.success > 0) {
                fenceDotArray = [];
                revList.forEach(v => {
                    fenceDotArray.push({
                        fence_id: v.fence_id,
                        id: v.id,
                        x: v.x,
                        y: v.y
                    });
                });
                updateFenceDotsArr();
                setSize();
                drawFences(fenceArray, fenceDotArray);
                fenceDotArray.forEach(function (v) {
                    drawDot(ctx, v.fence_id, v.x, v.y);
                });
            } else {
                alert("獲取圍籬座標點失敗，請再試一次!");
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function updateFenceArr() {
    $("#table_fence_setting tbody").empty();
    for (i = 0; i < fenceArray.length; i++) {
        var tr_id = "tr_fence_setting_" + (i + 1);
        $("#table_fence_setting tbody").append("<tr id=\"" + tr_id + "\"><td>" +
            "<input type=\"checkbox\" name=\"chkbox_fence_setting\" value=\"" + fenceArray[i].id + "\"" +
            " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + (i + 1) + "</td>" +
            "<td><label name=\"fence_id\">" + fenceArray[i].id + "</label></td>" +
            "<td><label name=\"fence_name\">" + fenceArray[i].name + "</label></td></tr>");
    }
    //return fenceArray;
}

function updateFenceDotsArr() {
    $("#table_fence_dot_setting tbody").empty();
    for (j = 0; j < fenceDotArray.length; j++) {
        var tr_id = "tr_fence_dot_setting_" + (j + 1);
        $("#table_fence_dot_setting tbody").append("<tr id=\"" + tr_id + "\"><td>" +
            "<input type=\"checkbox\" name=\"chkbox_fence_dot_setting\" value=\"" + fenceDotArray[j].id +
            "\" onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + (j + 1) + "</td>" +
            "<td><label name=\"dot_fence_id\">" + fenceDotArray[j].fence_id + "</label></td>" +
            "<td><label name=\"dot_x\">" + fenceDotArray[j].x + "</label></td>" +
            "<td><label name=\"dot_y\">" + fenceDotArray[j].y + "</label></td></tr>");
    }
    //return fenceDotArray;
}

function Fence() {
    var fence_dot_array = [];
    this.setFenceDot = function (id, x, y) {
        fence_dot_array.push({
            id: id,
            x: x,
            y: y
        });
    };
    this.drawFence = function () {
        var canvas = document.getElementById("canvas_map");
        var ctx = canvas.getContext("2d");
        var len = fence_dot_array.length;
        var displace = 5 / canvasImg.scale;
        ctx.beginPath();
        fence_dot_array.forEach(function (v, i, arr) {
            if (i == len - 1) {
                ctx.lineTo(v.x + displace, v.y + displace);
                ctx.lineTo(arr[0].x + displace, arr[0].y + displace);
            } else {
                ctx.lineTo(v.x + displace, v.y + displace);
            }
        });
        ctx.strokeStyle = "rgb(255, 123, 0)";
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 153, 0, 0.61)";
        ctx.fill();
        //在圍籬中間畫出群組名稱
        ctx.fillStyle = "blue";
        ctx.font = 60 / canvasImg.scale + 'px serif';
        var arr = fence_dot_array;
        var displace_x = (arr[2].x - arr[0].x) / 2;
        var displace_y = (arr[2].y - arr[0].y) / 2;
        ctx.fillText(arr[0].id, arr[0].x + displace_x - 15, arr[0].y + displace_y - 6);
        ctx.closePath();
    };
}

function drawFences(fen_arr, fen_dot_arr) {
    /*var fenceArray = updateFenceArr();
    var fenceDotArray = updateFenceDotsArr();*/
    fen_arr.forEach(function (fence_info) {
        var fence = new Fence();
        fen_dot_arr.forEach(dot_info => {
            if (dot_info.fence_id == fence_info.id) {
                fence.setFenceDot(
                    fence_info.name,
                    dot_info.x / canvasImg.scale,
                    canvasImg.height - dot_info.y / canvasImg.scale
                );
            }
        });
        fence.drawFence();
    });
}

function draw() {
    var arr = fenceArray;
    var dot_arr = fenceDotArray;
    setSize();
    drawFences(arr, dot_arr);
    dot_arr.forEach(function (v) {
        drawDot(ctx, v.fence_id, v.x, v.y);
    });
}

function drawDot(dctx, id, x, y) {
    x = x / canvasImg.scale;
    y = canvasImg.height - y / canvasImg.scale; //因為Server回傳的座標為左下原點
    dctx.fillStyle = "blue";
    //dctx.font = 39 / canvasImg.scale + 'px serif'; //13*3
    //dctx.fillText(id, x - 15, y - 6); //dot ID
    dctx.fillRect(x - 5, y - 5, 30 / canvasImg.scale, 30 / canvasImg.scale); //10*3
}

function drawDotPosition(dctx, x, y) {
    x = x / canvasImg.scale;
    y = canvasImg.height - y / canvasImg.scale; //因為Server回傳的座標為左下原點
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

function addDotArray(id, x, y) {
    anchorArray.push({
        id: id,
        x: x / canvasImg.scale,
        y: canvasImg.height - y / canvasImg.scale
    });
    draw();
}

function handleDotPosition() {
    $(function () {
        $("#add_dot_fence_id").val("");
        $("#add_dot_x").val($("#x").val());
        $("#add_dot_y").val($("#y").val());
        $("#dialog_add_fence_dot").dialog("open");
    });
}

function startFencePosition() {
    if (!isPosition) {
        isPosition = true;
        document.getElementById("label_fence_position").innerHTML = "<i class='fas fa-map-marked' style='font-size:20px;'></i>";
        document.getElementById("label_fence_position").title = "Stop fence position set";
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
        document.getElementById("label_fence_position").innerHTML = "<i class='fas fa-map-marked-alt' style='font-size:20px;'></i>";
        document.getElementById("label_fence_position").title = "Start fence position set";
        for (var each in pageTimer)
            clearTimeout(pageTimer[each]);
        draw();
        canvas.removeEventListener("click", handleAnchorPosition);
    }
}