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
var Zoom = 1.0; //actual width and height of zoomed and panned display
var isFitWindow = true;

var isPosition = false;
var serverImg = new Image();
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
    canvas.addEventListener("dblclick", handleMouseDBClick, false);
    canvas.addEventListener("mousedown", handleMouseDown, false);
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
        Zoom = 1.0;
        ctx.save(); //紀錄原比例

        var serImgSize = serverImg.width / serverImg.height;
        var cvs_width = parseFloat($("#mapBlock").css("width")) - 2;
        var cvs_height = parseFloat($("#mapBlock").css("height")) - 2;
        var cvsSize = cvs_width / cvs_height;
        if (serImgSize > cvsSize) { //原圖比例寬邊較長
            Zoom = cvs_width / serverImg.width;
            setCanvas(this.src, cvs_width, serverImg.height * Zoom);
        } else {
            Zoom = cvs_height / serverImg.height;
            setCanvas(this.src, serverImg.width * Zoom, cvs_height);
        }
        getMapGroups(); //在設定好地圖後，導入Groups & Anchors
        catchAnchors();
        draw();
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
    Zoom = 1.0;
    anchorArray = [];
}

function loadImage(dataUrl) { //新增或更換地圖
    serverImg.src = dataUrl;
    serverImg.onload = function () {
        cvsBlock.style.background = "none";
        canvasImg.isPutImg = true;
        canvasImg.width = serverImg.width;
        canvasImg.height = serverImg.height;
        canvasImg.scale = 1;
        setCanvas(this.src, serverImg.width, serverImg.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        xleftView = 0;
        ytopView = 0;
        Zoom = 1.0;
        ctx.save(); //紀錄原比例
        //$("#canvas_map").css("margin-left", "0px").css("margin-top", "0px");
        var serImgSize = serverImg.width / serverImg.height;
        var cvs_width = parseFloat($("#mapBlock").css("width")) - 2;
        var cvs_height = parseFloat($("#mapBlock").css("height")) - 2;
        var cvsSize = cvs_width / cvs_height;
        if (serImgSize > cvsSize) { //原圖比例寬邊較長
            Zoom = cvs_width / serverImg.width;
            setCanvas(this.src, cvs_width, serverImg.height * Zoom);
        } else {
            Zoom = cvs_height / serverImg.height;
            setCanvas(this.src, serverImg.width * Zoom, cvs_height);
        }
        getMapGroups();
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

function setSize() { //縮放canvas與背景圖大小
    if (canvasImg.isPutImg) {
        canvas.style.backgroundSize = (canvasImg.width * Zoom) + "px " + (canvasImg.height * Zoom) + "px";
        canvas.width = canvasImg.width * PIXEL_RATIO * Zoom;
        canvas.height = canvasImg.height * PIXEL_RATIO * Zoom;
        canvas.style.width = canvasImg.width * Zoom + 'px';
        canvas.style.height = canvasImg.height * Zoom + 'px';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
        ctx.scale(Zoom, Zoom);
        ctx.translate(0, 0);
    }
}

function resizeCanvas() {
    if (!canvasImg.isPutImg)
        return;
    var cvsBlock_width = parseFloat($("#mapBlock").css("width")) - 2;
    var cvsBlock_height = parseFloat($("#mapBlock").css("height")) - 2;
    xleftView = 0;
    ytopView = 0;
    Zoom = 1.0;
    if (isFitWindow) { //恢復原比例
        isFitWindow = false; //目前狀態:原比例
        ctx.restore();
        ctx.save();
        document.getElementById("label_resize").innerHTML = "<i class=\"fas fa-compress\" style='font-size:20px;'></i>";
        document.getElementById("label_resize").title = $.i18n.prop('i_fit_window');
    } else { //依比例拉伸(Fit in Window)
        isFitWindow = true; //目前狀態:依比例拉伸(Fit in Window)
        if ((serverImg.width / serverImg.height) > (cvsBlock_width / cvsBlock_height)) //原圖比例寬邊較長
            Zoom = cvsBlock_width / serverImg.width;
        else
            Zoom = cvsBlock_height / serverImg.height;
        document.getElementById("label_resize").innerHTML = "<i class=\"fas fa-expand\" style='font-size:20px;'></i>";
        document.getElementById("label_resize").title = $.i18n.prop('i_restore_scale');
    }
    //$("#canvas_map").css("margin-left", 0 + "px").css("margin-top", 0 + "px");
    draw();
}

function handleMouseWheel(event) { //滑鼠滾輪事件
    event.preventDefault();
    var BCR = canvas.getBoundingClientRect();
    var pos_x = event.pageX - BCR.left;
    var pos_y = event.pageY - BCR.top;
    var scale = 1.0;
    if (event.wheelDelta < 0 || event.detail > 0) {
        if (Zoom > 0.1)
            scale = 0.9;
    } else {
        scale = 1.1;
    }
    Zoom *= scale; //縮放比例
    draw();
    /*
    var Next_x = lastX * Zoom; //縮放後滑鼠位移後的位置(x坐標)
    var Next_y = (canvasImg.height - lastY) * Zoom; //縮放後滑鼠位移後的位置(y坐標)
    xleftView += pos_x - Next_x;
    ytopView += pos_y - Next_y;
    $("#canvas_map").css("margin-left", xleftView + "px").css("margin-top", ytopView + "px");*/
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
    }; //注：如果使用此方法無效的話，需要給Canvas元素的position設為absolute。
}

function handleMouseDBClick(event) { //滑鼠雙擊事件
    event.preventDefault();
    var zoom = 1 / Zoom;
    var BCR = canvas.getBoundingClientRect();
    var pos = {
        x: event.pageX - BCR.left,
        y: event.pageY - BCR.top
    }
    anchorArray.forEach(function (v) {
        ctx.beginPath();
        ctx.rect(v.x - 5 * zoom, v.y - 5 * zoom, 10 * zoom, 10 * zoom);
        if (pos && ctx.isPointInPath(pos.x, pos.y)) {
            //如果傳入了事件坐標，就用isPointInPath判斷一下
            ctx.fillStyle = "#2bff00";
            ctx.fill();
            $(function () {
                $("#edit_anchor_type").text(v.type == "main" ? "Main" : "Secondary");
                $("#edit_anchor_id").text(v.id);
                $("#edit_anchor_x").val(v.x);
                $("#edit_anchor_y").val(v.y);
                $("#dialog_edit_anchor").dialog("open");
            });
        }
        ctx.closePath();
    });
}

function handleMouseDown(event) { //滑鼠按下綁定事件
    if (!isPosition) {
        event.preventDefault();
        var downx = event.pageX;
        var downy = event.pageY;
        var BCR = canvas.getBoundingClientRect();
        var pos = {
            x: downx - BCR.left,
            y: downy - BCR.top
        }
        if (!pos)
            return;
        var index = anchorArray.findIndex(function (v) {
            var zoom = 1 / Zoom;
            ctx.beginPath();
            ctx.rect(v.x - 5 * zoom, v.y - 5 * zoom, 10 * zoom, 10 * zoom);
            ctx.closePath();
            return ctx.isPointInPath(pos.x, pos.y) == true;
        });
        if (index > -1) {
            $("#canvas_map").on("mousemove", function (e) {
                ctx.fillStyle = "#2bff00";
                ctx.fill();
                $(function () {
                    var zoom = 1 / Zoom;
                    anchorArray[index].x += (e.pageX - downx) * zoom;
                    anchorArray[index].y += (e.pageY - downy) * zoom;
                    downx = e.pageX;
                    downy = e.pageY;
                });
                draw();
            });
            $("#canvas_map").on("mouseup", function () {
                $("#canvas_map").off("mousemove");
            });
        }
        /*anchorArray.forEach(function (v) {
            var zoom = 1 / Zoom;
            ctx.beginPath();
            ctx.rect(v.x - 5 * zoom, v.y - 5 * zoom, 10 * zoom, 10 * zoom);
            ctx.closePath();
            if (ctx.isPointInPath(pos.x, pos.y)) {
                //如果傳入了事件坐標，就用isPointInPath判斷一下
                $("#canvas_map").on("mousemove", function (e) {
                    ctx.fillStyle = "#2bff00";
                    ctx.fill();
                    $(function () {
                        v.x += e.pageX - downx;
                        v.y += e.pageY - downy;
                    });
                    draw();
                });
                $("#canvas_map").on("mouseup", function () {
                    //滑鼠彈起時=>div取消事件 
                    $("#canvas_map").off("mousemove");
                });
            }
        });*/
    }
}

function handleMouseMove(event) { //滑鼠移動事件
    if (canvasImg.isPutImg) {
        var x = event.pageX;
        var y = event.pageY;
        getPointOnCanvas(x, y);
    }
}

function getPointOnCanvas(x, y) {
    //獲取滑鼠在Canvas物件上座標(座標起始點從左上換到左下)
    var BCR = canvas.getBoundingClientRect();
    var pos_x = (x - BCR.left) * (canvasImg.width / BCR.width);
    var pos_y = (y - BCR.top) * (canvasImg.height / BCR.height);
    lastX = pos_x;
    lastY = canvasImg.height - pos_y;
    document.getElementById('x').innerText = lastX > 0 ? (lastX).toFixed(2) : 0;
    document.getElementById('y').innerText = lastY > 0 ? (lastY).toFixed(2) : 0;
    return {
        x: pos_x,
        y: pos_y
    }
}


function getAnchors(map_anchors) {
    var map_id = $("#map_info_id").val();
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMainAnchorsInMap"],
        "Value": {
            "map_id": map_id
        }
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var id, type, x, y;
                var anchorID = [];
                var mainAnchorID = [];
                var anchorList = map_anchors.slice(0);
                var mainAnchorList = [];
                var revInfo = 'Values' in revObj == true ? revObj.Values : [];
                revInfo.forEach(element => {
                    var repect = mainAnchorList.findIndex(function (info) {
                        return info.main_anchor_id == element.main_anchor_id;
                    });
                    if (repect == -1)
                        mainAnchorList.push(element);
                });
                setSize();
                //Anchor
                anchorList.forEach(element => {
                    id = element.anchor_id;
                    type = "";
                    x = element.set_x / canvasImg.scale;
                    y = canvasImg.height - element.set_y / canvasImg.scale;
                    anchorArray.push({
                        id: id,
                        type: type,
                        x: x,
                        y: y
                    });
                    drawAnchor(ctx, id, type, x, y, 1 / Zoom);
                    anchorID.push(id);
                });
                //Main Anchor
                mainAnchorList.forEach(element => {
                    anchorList.push({
                        anchor_id: element.main_anchor_id,
                        anchor_type: "main",
                        set_x: element.set_x,
                        set_y: element.set_y
                    });
                    id = element.main_anchor_id;
                    type = "main";
                    x = element.set_x / canvasImg.scale;
                    y = canvasImg.height - element.set_y / canvasImg.scale;
                    anchorArray.push({
                        id: id,
                        type: type,
                        x: x,
                        y: y
                    });
                    drawAnchor(ctx, id, type, x, y, 1 / Zoom);
                    mainAnchorID.push(id);
                });
                draw();
                inputAnchorList(anchorList);
                setGrouplist_mainAnchor(mainAnchorID);
                setAnchorgroup_anchor(anchorID);
            } else {
                alert($.i18n.prop('i_mapAlert_6'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function draw() {
    setSize();
    drawGroups(anchorArray);
    anchorArray.forEach(function (v) {
        drawAnchor(ctx, v.id, v.type, v.x, v.y, 1 / Zoom);
    });
}

function drawAnchor(dctx, id, type, x, y, zoom) {
    var size = 10 * zoom; // zoom = 1 / Zoom
    if (type == "main")
        dctx.fillStyle = "red";
    else
        dctx.fillStyle = "blue";
    dctx.font = 13 * zoom + 'px serif';
    dctx.fillText(id, x - 5 * zoom, y - 7 * zoom); //anchorID
    dctx.fillRect(x - 5 * zoom, y - 5 * zoom, size, size);
}

function drawP(dctx, x, y, zoom) {
    var size = 10 * zoom;
    dctx.fillStyle = "green";
    dctx.fillRect(x, y, 2, 2);
}

function drawAnchorPosition(dctx, x, y) {
    var size = 4 * 3 / canvasImg.scale;
    x = x / canvasImg.scale;
    y = canvasImg.height - y / canvasImg.scale;
    dctx.fillStyle = '#99cc00';
    dctx.beginPath();
    dctx.arc(x, y, size, 0, Math.PI * 2, true);
    dctx.fill();
}

function catchAnchors() {
    anchorArray = [];
    var main_id = document.getElementsByName("list_main_anchor_id"),
        main_x = document.getElementsByName("list_main_anchor_x"),
        main_y = document.getElementsByName("list_main_anchor_y"),
        a_id = document.getElementsByName("list_anchor_id"),
        a_x = document.getElementsByName("list_anchor_x"),
        a_y = document.getElementsByName("list_anchor_y");
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
        document.getElementById("label_anchor_position").title = $.i18n.prop('i_mapAlert_7');
        var delaytime = 100; //0.1s
        pageTimer["timer1"] = setTimeout(function request() {
            draw();
            var posX = lastX * Zoom / fitZoom * canvasImg.scale;
            var posY = lastY * Zoom / fitZoom * canvasImg.scale;
            drawAnchorPosition(ctx, posX, posY);
            pageTimer["timer1"] = setTimeout(request, delaytime);
        }, delaytime);
        canvas.addEventListener("click", handleAnchorPosition);
    } else {
        isPosition = false;
        document.getElementById("label_anchor_position").innerHTML = "<i class='fas fa-map-marked-alt' style='font-size:20px;'></i>";
        document.getElementById("label_anchor_position").title = $.i18n.prop('i_mapAlert_8');
        for (each in pageTimer) {
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