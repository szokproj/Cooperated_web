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

var operate = ""; //暫用，等在Linux上測試時刪除
function setOperate(type) {
    operate = type;
}

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
}

function readImage(files) {
    //測試丟出base64的資料
    if (files && files[0]) {
        var FR = new FileReader();
        FR.onload = function (e) {
            //e.target.result = base64 format picture
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
                    var reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = function () {
                        var base64data = reader.result;
                        console.log(base64data);
                        //console.log(base64data.substr(base64data.indexOf(',') + 1));
                    }
                }
            }
            oReq.send(e.target.result); //e.target.result
        };
        FR.readAsBinaryString(files[0]);
        //FR.readAsDataURL(files[0]);
    }
}

function setMap(map_path, map_scale) { //接收Server發送的地圖資料並導入
    map_scale = typeof (map_scale) != 'undefined' && map_scale != "" ? map_scale : 1;
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

function loadImage(file) { //新增或更換地圖
    var src = URL.createObjectURL(file);
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
        $("#map_info_path").text(getFileName($("#menu_load_map").val()));
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
    xleftView = 0;
    ytopView = 0;
    Zoom = zoomOriginal;
    if (isFitWindow) { //恢復原比例
        fitZoom = 1;
        ctx.restore();
        ctx.save();
        isFitWindow = false; //目前狀態:原比例 
        document.getElementById("label_restore").innerHTML = "<i class=\"fas fa-compress\" style='font-size:20px;'></i>";
        document.getElementById("label_restore").title = "Fit in window";
    } else { //依比例拉伸(Fit in Window)
        var cvs_width = parseFloat($("#mapBlock").css("width")) - 2;
        var cvs_height = parseFloat($("#mapBlock").css("height")) - 2;
        if ((serverImg.width / serverImg.height) > (cvs_width / cvs_height)) //原圖比例寬邊較長
            fitZoom = cvs_width / serverImg.width;
        else
            fitZoom = cvs_height / serverImg.height;
        isFitWindow = true; //目前狀態:依比例拉伸
        document.getElementById("label_restore").innerHTML = "<i class=\"fas fa-expand\" style='font-size:20px;'></i>";
        document.getElementById("label_restore").title = "Restore the original size";
    }
    draw();
}

function handleMouseWheel(event) {
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
    //獲取滑鼠在Canvas物件上座標(座標起始點從左上換到左下)
    var BCR = canvas.getBoundingClientRect();
    var width = canvas.width;
    var height = canvas.height;
    return {
        x: x - BCR.left * (width / BCR.width),
        y: height - (y - BCR.top * (height / BCR.height))
    };
}


function getAnchors(map_id) {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAnchors"],
        "Value": {
            "map_id": map_id
        }
    };
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var anchorList = revObj.Values;
                var canvas = document.getElementById("canvas_map");
                var ctx = canvas.getContext("2d");
                var id, type, x, y;
                anchorArray = [];
                setSize();
                for (i in anchorList) {
                    id = anchorList[i].anchor_id;
                    type = anchorList[i].anchor_type;
                    x = anchorList[i].set_x / canvasImg.scale;
                    y = canvasImg.height - anchorList[i].set_y / canvasImg.scale; //因為Server回傳的座標為左下原點
                    anchorArray.push({
                        id: id,
                        type: type,
                        x: x,
                        y: y
                    });
                    drawAnchor(ctx, id, type, x, y); //畫出點的設定
                }
                inputAnchorList(anchorList);
                inputAnchorGroup(anchorArray);
            } else {
                alert("獲取AnchorList失敗，請再試一次!");
            }
        }
    };
    xmlHttp.open("POST", "sql", true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send(JSON.stringify(requestArray));
}

function draw() {
    const anc_arr = anchorArray;
    setSize();
    drawGroups(anc_arr);
    anc_arr.forEach(function (v) {
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
        $("#anchor_x").val($("#x").val());
        $("#anchor_y").val($("#y").val());
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

function hiddenBlock() {
    $("#block_info").hide();
    $("#block_anchor_list").hide();
    $("#block_group_list").hide();
    $("#block_anchor_group").hide();
    $("#block_map_group").hide();
    $(".sidebar-menu .btn-sidebar").css('background-color', 'rgb(57, 143, 255)');
}


$(function () {
    $("#map_info_scale").on("change", function () {
        canvasImg.scale = $(this).val();
        catchAnchors();
        draw();
    })
    $("#menu_load_map").on("change", function () {
        loadImage($(this).prop('files')[0]);
        //readImage($(this).prop('files'));
    });
    $("#menu_restore").on("click", function () {
        restoreCanvas();
    });

    hiddenBlock();
    $("#block_info").show();
    $("#label_map_info").css('background-color', 'rgb(40, 108, 197)');

    $("#menu_map_info").on("click", function () {
        hiddenBlock();
        $("#block_info").show();
        $("#label_map_info").css('background-color', 'rgb(40, 108, 197)');
    });
    $("#menu_anchor_list").on("click", function () {
        hiddenBlock();
        $("#block_anchor_list").show();
        $("#label_anchor_list").css('background-color', 'rgb(40, 108, 197)');
    });
    $("#menu_group_list").on("click", function () {
        resetMainAncSelect();
        hiddenBlock();
        $("#block_group_list").show();
        $("#label_group_list").css('background-color', 'rgb(40, 108, 197)');
    });
    $("#menu_anchor_group").on("click", function () {
        resetAncSelect();
        var row_group = $("[name=anchorgroup_group_id]");
        var row_main_anchor = $("[name=anchorgroup_main_anchor_id]");
        var array = catchGroupList();
        for (j = 0; j < row_group.length; j++) {
            var i = array.findIndex(function (anchor) {
                return anchor.group_id == row_group.eq(j).val();
            });
            if (i > -1)
                row_main_anchor.eq(j).text(array[i].main_anchor_id);
            else
                row_main_anchor.eq(j).text("");
        }
        hiddenBlock();
        $("#block_anchor_group").show();
        $("#label_anchor_group").css('background-color', 'rgb(40, 108, 197)');
    });
    $("#menu_map_group").on("click", function () {
        updateMapGroupList();
        hiddenBlock();
        $("#block_map_group").show();
        $("#label_map_group").css('background-color', 'rgb(40, 108, 197)');
    });
    $("#btn_anchor_position").on("click", function () {
        startAnchorPosition();
    });


    /**
     * Map Setting Dialog
     */
    var dialog, form,
        //map info
        map_block = $("#mapBlock"),
        mapinfo_id = $("#map_info_id"),
        mapinfo_name = $("#map_info_name"),
        mapinfo_scale = $("#map_info_scale"),
        //anchors
        main_id = document.getElementsByName("list_main_anchor_id"),
        main_x = document.getElementsByName("list_main_anchor_x"),
        main_y = document.getElementsByName("list_main_anchor_y"),
        id = document.getElementsByName("list_anchor_id"),
        x = document.getElementsByName("list_anchor_x"),
        y = document.getElementsByName("list_anchor_y"),
        //groupList
        group_id_row = $("[name=grouplist_id]"),
        group_name_row = $("[name=grouplist_name]"),
        main_anchor_row = $("[name=grouplist_main_anchor]"),
        //anchor group
        group_row = $("[name=anchor_group_id]"),
        main_anchor_row = $("[name=group_main_anchor]"),
        anchor_row = $("[name=group_anchor]"),
        //map group
        map_id = $("[name=mapgroup_map]"),
        group_id = $("[name=mapgroup_group]"),
        allFields = $([]).add(map_block, mapinfo_id, mapinfo_name, mapinfo_scale, main_id, main_x, main_y, id, x, y,
            group_id_row, group_name_row, main_anchor_row, group_row, main_anchor_row, anchor_row, map_id, group_id);
    //tips = $( ".validateTips" );


    function SendResult() {
        allFields.removeClass("ui-state-error");
        var valid = true,
            anchor_array = [],
            grouplist_array = [],
            anchorgroup_array = [],
            mapgroup_array = [],
            count_total_anchors = 0,
            grouplist_count = 0,
            anchorgroup_count = 0,
            mapgroup_count = 0;

        if (!canvasImg.isPutImg) {
            map_block.addClass("ui-state-error");
            alert("請導入地圖");
            return;
        }

        valid = valid && checkLength(mapinfo_id, "Please enter the ID of this map.", 1, 5);
        valid = valid && checkLength(mapinfo_name, "Please enter the name of this map.", 1, 50);
        valid = valid && checkLength(mapinfo_scale, "Please enter the scale of this map.", 1, 3);

        for (i = 0; i < main_id.length; i++) {
            valid = valid && checkLengthByDOM(main_id[i], "mapScale", 1, 5);
            valid = valid && checkLengthByDOM(main_x[i], "mapScale", 1, 10);
            valid = valid && checkLengthByDOM(main_y[i], "mapScale", 1, 10);
            anchor_array.push({
                "anchor_id": main_id[i].value,
                "anchor_type": "main",
                "set_x": main_x[i].value,
                "set_y": main_y[i].value
            });
            count_total_anchors++
        }

        for (j = 0; j < id.length; j++) {
            valid = valid && checkLengthByDOM(id[i], "mapScale", 1, 5);
            valid = valid && checkLengthByDOM(x[i], "mapScale", 1, 10);
            valid = valid && checkLengthByDOM(y[i], "mapScale", 1, 10);
            anchor_array.push({
                "anchor_id": id[i].value,
                "anchor_type": "",
                "set_x": x[i].value,
                "set_y": y[i].value
            });
            count_total_anchors++
        }

        for (var i = 0; i < group_id_row.length; i++) {
            valid = valid && checkLength(group_id_row.eq(i), "GroupList", 1, 5);
            //valid = valid && checkLength(group_name_row.eq(i), "GroupList", 1, 10);
            valid = valid && checkLength(main_anchor_row.eq(i), "GroupList", 1, 5);
            grouplist_array.push({
                "group_id": group_id_row.eq(i).val(),
                "group_name": group_name_row.eq(i).val(),
                "main_anchor_id": main_anchor_row.eq(i).val()
            });
            grouplist_count++;
        }

        for (i = 0; i < group_row.length; i++) {
            valid = valid && checkLength(group_row.eq(i), "Should be more than 0 and less than 65535.", 1, 5);
            //valid = valid && checkLength(main_anchor_row.eq(i), "Should be more than 0 and less than 65535.", 1, 5);
            valid = valid && checkLength(anchor_row.eq(i), "Should be more than 0 and less than 65535.", 1, 5);
            anchorgroup_array.push({
                "group_id": group_row.eq(i).val(),
                //"main_anchor_id": main_anchor_row.eq(i).val(),
                "anchor_id": anchor_row.eq(i).val()
            });
            anchorgroup_count++;
        }

        for (var i = 0; i < map_id.length; i++) {
            valid = valid && checkLength(map_id.eq(i), "Please select the number more than 0 and less than 6.", 1, 5);
            valid = valid && checkLength(group_id.eq(i), "Please select the number more than 0 and less than 6.", 1, 5);
            mapgroup_array.push({
                "map_id": map_id.eq(i).val(),
                "group_id": group_id.eq(i).val(),
            });
            mapgroup_count++;
        }

        function sendMapInfoRequest() {
            var mapInfoReq = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["ClearAllMaps", "AddMap"],
                "Value": {
                    "map_id": mapinfo_id.val(),
                    "map_name": mapinfo_name.val(),
                    "map_path": $("#map_info_path").text(),
                    "map_scale": mapinfo_scale.val(),
                }
            });
            var mapHttp = createJsonXmlHttp("sql");
            mapHttp.onreadystatechange = function () {
                if (mapHttp.readyState == 4 || mapHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        alert("地圖資訊設定完成"); //reload
                        /*
                        $("#maps_gallery").empty();
                        loadMap();
                        */
                    }
                }
            };
            mapHttp.send(mapInfoReq);
        }

        function sendAnchorsRequest() {
            var setAnchorsReq = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["ClearListAnchor", "AddListAnchor"],
                "Value": anchor_array
            });
            var ancHttp = createJsonXmlHttp("sql");
            ancHttp.onreadystatechange = function () {
                if (ancHttp.readyState == 4 || ancHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        alert("AnchorList更新成功:" + revObj.success + "筆,\n" +
                            "AnchorList更新失敗:" + (count_total_anchors - revObj.success) + "筆");
                        /*
                        $("#maps_gallery").empty();
                        loadMap();
                        */
                    }
                }
            };
            ancHttp.send(setAnchorsReq);
        }

        function sendGroupListRequest() {
            var setGroupListReq = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["ClearAllGroups", "AddListGroup"],
                "Value": grouplist_array
            });
            var groupListHttp = createJsonXmlHttp("sql");
            groupListHttp.onreadystatechange = function () {
                if (groupListHttp.readyState == 4 || groupListHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        alert("GroupList更新成功:" + revInfo.length + "筆,\n" +
                            "GroupList更新失敗:" + (grouplist_count - revInfo.length) + "筆");
                        /*
                        $("#maps_gallery").empty();
                        loadMap();
                        */
                    }
                }
            };
            groupListHttp.send(setGroupListReq);
        }

        function sendAncGroupRequest() {
            var setGroupListReq = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["ClearAllGroup_Anchors", "AddListGroup_Anchor"],
                "Value": anchorgroup_array
            });
            var ancGroupHttp = createJsonXmlHttp("sql");
            ancGroupHttp.onreadystatechange = function () {
                if (ancGroupHttp.readyState == 4 || ancGroupHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        alert("AnchorGroup更新成功:" + revInfo.length + "筆,\n" +
                            "AnchorGroup更新失敗:" + (anchorgroup_count - revInfo.length) + "筆");
                        /*
                        $("#maps_gallery").empty();
                        loadMap();
                        */
                    }
                }
            };
            ancGroupHttp.send(setGroupListReq);
        }

        function sendMapGroupRequest() {
            var setGroupListReq = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["ClearAllMap_Groups", "AddListMap_Group"],
                "Value": mapgroup_array
            });
            var mapGroupHttp = createJsonXmlHttp("sql");
            mapGroupHttp.onreadystatechange = function () {
                if (mapGroupHttp.readyState == 4 || mapGroupHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        alert("AnchorGroup更新成功:" + revInfo.length + "筆,\n" +
                            "AnchorGroup更新失敗:" + (mapgroup_count - revInfo.length) + "筆");
                        /*
                        $("#maps_gallery").empty();
                        loadMap();
                        */
                    }
                }
            };
            mapGroupHttp.send(setGroupListReq);
        }

        if (valid) {
            sendMapInfoRequest();
            sendAnchorsRequest();
            sendGroupListRequest();
            sendAncGroupRequest();
            sendMapGroupRequest();
            dialog.dialog("close");
            resetDialog();
        }
        return valid;
    }

    function resetDialog() {
        hiddenBlock();
        $("#block_info").show();
        $("#label_map_info").css('background-color', 'rgb(40, 108, 197)');
        isPosition = true;
        startAnchorPosition();
        form[0].reset();
        allFields.removeClass("ui-state-error");
    }


    dialog = $("#dialog_map_setting").dialog({
        autoOpen: false,
        height: 640,
        width: 980,
        modal: true,
        buttons: {
            "Confirm": function () {
                var r = confirm("Confirm delivery?");
                if (r == true)
                    SendResult();
                else
                    return;
            },
            Cancel: function () {
                dialog.dialog("close");
                resetDialog();
            }
        },
        close: function () {
            resetDialog();
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        SendResult();
    });
});