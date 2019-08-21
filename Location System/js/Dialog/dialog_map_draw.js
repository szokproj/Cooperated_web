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
    canvas.addEventListener("mousedown", handleMouseDown, false);
    cvsBlock.addEventListener("mousewheel", handleMouseWheel, false); // mousewheel duplicates dblclick function
    cvsBlock.addEventListener("DOMMouseScroll", handleMouseWheel, false); // for Firefox

    $(function () {
        $("#map_info_scale").on("change", function () {
            canvasImg.scale = $(this).val();
            catchMap_Anchors();
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
        var cvs_width = parseFloat($("#mapBlock").css("width"));
        var cvs_height = parseFloat($("#mapBlock").css("height"));
        var cvsSize = cvs_width / cvs_height;
        if (serImgSize > cvsSize) { //原圖比例寬邊較長
            Zoom = cvs_width / serverImg.width;
            setCanvas(this.src, cvs_width, serverImg.height * Zoom);
        } else {
            Zoom = cvs_height / serverImg.height;
            setCanvas(this.src, serverImg.width * Zoom, cvs_height);
        }
        getAllDataOfMap(); //在設定好地圖後，導入Groups & Anchors
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
        var serImgSize = serverImg.width / serverImg.height;
        var cvs_width = parseFloat($("#mapBlock").css("width"));
        var cvs_height = parseFloat($("#mapBlock").css("height"));
        var cvsSize = cvs_width / cvs_height;
        if (serImgSize > cvsSize) { //原圖比例寬邊較長
            Zoom = cvs_width / serverImg.width;
            setCanvas(this.src, cvs_width, serverImg.height * Zoom);
        } else {
            Zoom = cvs_height / serverImg.height;
            setCanvas(this.src, serverImg.width * Zoom, cvs_height);
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
    var cvsBlock_width = parseFloat($("#mapBlock").css("width"));
    var cvsBlock_height = parseFloat($("#mapBlock").css("height"));
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

function handleMouseDown(event) { //滑鼠按下綁定事件    
    if (!isPosition) {
        var downx = event.pageX;
        var downy = event.pageY;
        var pos = {
            x: event.offsetX, //downx - BCR.left,
            y: event.offsetY //downy - BCR.top
        }
        if (!pos.x || !pos.y)
            return;
        var index = anchorArray.findIndex(function (v) {
            var zoom = 1 / Zoom;
            ctx.beginPath();
            ctx.rect(v.x - 5 * zoom, v.y - 5 * zoom, 10 * zoom, 10 * zoom);
            ctx.closePath();
            return ctx.isPointInPath(pos.x, pos.y) == true;
        });
        if (index > -1) {
            $(function () {
                $("#canvas_map").on("mousemove", function (e) {
                    var zoom = 1 / Zoom;
                    anchorArray[index].x += (e.pageX - downx) * zoom;
                    anchorArray[index].y += (e.pageY - downy) * zoom;
                    downx = e.pageX;
                    downy = e.pageY;
                    draw();
                    ctx.fillStyle = "#7600c5";
                    ctx.fillRect(anchorArray[index].x - 5 * zoom, anchorArray[index].y - 5 * zoom, 10 * zoom, 10 * zoom);
                });
                $("#canvas_map").on("mouseup", function () {
                    $("#canvas_map").off("mousemove");
                    $("#canvas_map").off("mouseup");
                    var set_x = anchorArray[index].x.toFixed(2);
                    var set_y = (canvasImg.height - anchorArray[index].y).toFixed(2);
                    if (anchorArray[index].type == "main") {
                        editGroupList(anchorArray[index].id, set_x, set_y)
                    } else {
                        editGroup_Anchor(anchorArray[index].id, set_x, set_y);
                    }
                });
            });
        }
    }
}

function handleMouseMove(event) { //滑鼠移動事件
    if (canvasImg.isPutImg) {
        getPointOnCanvas(event.offsetX, event.offsetY);
    }
}

function getPointOnCanvas(x, y) {
    //獲取滑鼠在Canvas物件上座標(座標起始點從左上換到左下)
    //var BCR = canvas.getBoundingClientRect();
    var pos_x = x * (canvasImg.width / canvas.width);
    var pos_y = y * (canvasImg.height / canvas.height);
    lastX = pos_x;
    lastY = canvasImg.height - pos_y;
    document.getElementById('x').innerText = lastX > 0 ? (lastX).toFixed(2) : 0;
    document.getElementById('y').innerText = lastY > 0 ? (lastY).toFixed(2) : 0;
    return {
        x: pos_x,
        y: pos_y
    }
}

function getAllDataOfMap() {
    anchorArray = [];
    getMaps_Groups();
    getAnchorList();
    getAnchor_Group();
    getGroupList();
}

function draw() {
    setSize();
    drawGroups(anchorArray);
    anchorArray.forEach(function (v) {
        drawAnchor(ctx, v.id, v.type, v.x, v.y, 1 / Zoom);
    });
}

function drawAnchor(dctx, id, type, x, y, zoom) {
    var size = 10 * zoom;
    if (type == "main")
        dctx.fillStyle = "red";
    else
        dctx.fillStyle = "blue";
    dctx.font = 13 * zoom + 'px serif';
    dctx.fillText(id, x - 5 * zoom, y - 7 * zoom); //anchorID
    dctx.fillRect(x - 5 * zoom, y - 5 * zoom, size, size);
}

function drawAnchorPosition(dctx, x, y, zoom) {
    var size = 4 * zoom;
    dctx.fillStyle = '#99cc00';
    dctx.beginPath();
    dctx.arc(x, y, size, 0, Math.PI * 2, true);
    dctx.fill();
}

function catchMap_Anchors() {
    anchorArray = [];
    var main_id = document.getElementsByName("grouplist_main_anchor_id"),
        main_x = document.getElementsByName("grouplist_main_anchor_x"),
        main_y = document.getElementsByName("grouplist_main_anchor_y"),
        main_group = document.getElementsByName("chkbox_group_list"),
        a_id = document.getElementsByName("anchorgroup_anchor_id"),
        a_x = document.getElementsByName("anchorgroup_anchor_x"),
        a_y = document.getElementsByName("anchorgroup_anchor_y"),
        a_group = document.getElementsByName("anchorgroup_group_id");
    for (i = 0; i < main_id.length; i++) {
        inputAnchorArray({
            id: main_id[i].value,
            type: "main",
            x: main_x[i].value,
            y: main_y[i].value,
            group_id: main_group[i].value
        });
    }
    for (j = 0; j < a_id.length; j++) {
        inputAnchorArray({
            id: a_id[j].value,
            type: "",
            x: a_x[j].value,
            y: a_y[j].value,
            group_id: a_group[j].value
        });
    }
    draw();
}

function inputAnchorArray(anchor_info) {
    var repeat = anchorArray.findIndex(function (v) {
        return v.id == anchor_info.id;
    });
    if (repeat > -1)
        anchorArray.splice(repeat, 1);
    anchorArray.push({
        id: anchor_info.id,
        type: anchor_info.type,
        x: anchor_info.x / canvasImg.scale,
        y: canvasImg.height - anchor_info.y / canvasImg.scale, //因為Server回傳的座標為左下原點
        group_id: anchor_info.group_id //只有副基站需要用group_id
    });
    draw();
}

function handleMainAnchorPosition() {
    $(function () {
        $("#add_grouplist_id").val("");
        $("#add_group_id_alert").empty();
        $("#add_grouplist_name").val("");
        $("#add_grouplist_main_anchor").html(getMainAnchorDropdown(""));
        $("#add_grouplist_main_anchor_x").val($("#x").text());
        $("#add_grouplist_main_anchor_y").val($("#y").text());
        $("#dialog_add_group_list").dialog("open");
    });
}

function handleAnchorPosition() {
    $(function () {
        $("#label_edit_group_add").show();
        $("#label_edit_group_delete").show();
        $("#table_edit_group_ids tbody").empty();
        $("#edit_group_anchor").html(getAnchorDropdown("")).prop("disabled", false);
        $("#edit_group_anchor_x").val($("#x").text());
        $("#edit_group_anchor_y").val($("#y").text());
        $("#dialog_edit_anchor_group").dialog("open");
    });
}

function startMainAnchorPosition() {
    if (!isPosition) {
        isPosition = true;
        document.getElementById("label_pos_group").innerHTML = "<i class='fas fa-map-marked' style='font-size:20px;'></i>";
        document.getElementById("label_pos_group").title = $.i18n.prop('i_mapAlert_7');
        canvas.addEventListener("click", handleMainAnchorPosition);
        var delaytime = 100; //0.1s
        pageTimer["timer1"] = setTimeout(function request() {
            draw();
            drawAnchorPosition(ctx, lastX, canvasImg.height - lastY, 1 / Zoom);
            pageTimer["timer1"] = setTimeout(request, delaytime);
        }, delaytime);
    } else {
        isPosition = false;
        document.getElementById("label_pos_group").innerHTML = "<i class='fas fa-map-marked-alt' style='font-size:20px;'></i>";
        document.getElementById("label_pos_group").title = $.i18n.prop('i_mapAlert_8');
        canvas.removeEventListener("click", handleMainAnchorPosition);
        for (each in pageTimer) {
            clearTimeout(pageTimer[each]);
        }
        draw();
    }
}


function startAnchorPosition() {
    if (!isPosition) {
        isPosition = true;
        document.getElementById("label_pos_anchor_group").innerHTML = "<i class='fas fa-map-marked' style='font-size:20px;'></i>";
        document.getElementById("label_pos_anchor_group").title = $.i18n.prop('i_mapAlert_7');
        canvas.addEventListener("click", handleAnchorPosition);
        var delaytime = 100; //0.1s
        pageTimer["timer1"] = setTimeout(function request() {
            draw();
            drawAnchorPosition(ctx, lastX, canvasImg.height - lastY, 1 / Zoom);
            pageTimer["timer1"] = setTimeout(request, delaytime);
        }, delaytime);
    } else {
        isPosition = false;
        document.getElementById("label_pos_anchor_group").innerHTML = "<i class='fas fa-map-marked-alt' style='font-size:20px;'></i>";
        document.getElementById("label_pos_anchor_group").title = $.i18n.prop('i_mapAlert_8');
        canvas.removeEventListener("click", handleAnchorPosition);
        for (each in pageTimer) {
            clearTimeout(pageTimer[each]);
        }
        draw();
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