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
//var anchorArray = [];
var anchorGroupArray = [];
var groupArray = [];
var fenceArray = [];
var fenceDotArray = [];
var addFenceDotArray = [];
var addFenceContainGroup = [];

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
        resetBlockDisplay();
        $("#block_fence_info").show();
        loadMaps();
        getMemberList();
        $("#menu_fence_info").on('click', function () {
            resetBlockDisplay();
            $("#block_fence_info").show();
        });
        $("#menu_BW_list").on('click', function () {
            resetBlockDisplay();
            $("#block_BW_list").show();
        });
        $("#menu_resize").on('click', resizeCanvas);
        $("#select_map").on('change', function () {
            setMapById($(this).val());
        });
        $("#btn_fence_dot_position").on('click', startFencePosition);
        $("#btn_BW_list_add").on('click', addMembers);
    });
}

function resetBlockDisplay() {
    $("#block_fence_info").hide();
    $("#block_BW_list").hide();
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
                var revInfo = 'Values' in revObj == true ? revObj.Values.slice(0) : [];
                mapArray = [];
                $("#select_map").empty()
                revInfo.forEach(v => {
                    mapArray.push({
                        id: v.map_id,
                        name: v.map_name,
                        file: v.map_file,
                        file_ext: v.map_file_ext,
                        scale: v.map_scale
                    });
                    $("#select_map").append("<li><input type=\"button\" id=\"map_btn_" + v.map_id + "\" " +
                        "value=\"" + v.map_name + "\"" +
                        "onclick=\"setMapById(\'" + v.map_id + "\')\"></li>");
                });
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}


function setMapById(id) { //選擇地圖(下拉選單)後，依據map_id抓取對應資訊
    map_id = id;
    var index = mapArray.findIndex(function (map_info) {
        return map_info.id == id;
    });
    if (index > -1) {
        var dataUrl = "data:image/" + mapArray[index].file_ext + ";base64," + mapArray[index].file;
        setMap(dataUrl, mapArray[index].scale);
        $("#select_map_id").val(mapArray[index].id);
        $("#select_map_name").val(mapArray[index].name);
    } else {
        resetCanvas();
        $("#select_map_id").val('');
        $("#select_map_name").val('');
    }
}

function setMap(map_url, map_scale) {
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
        var cvs_height = parseFloat($("#mapBlock").css("height")) - 7;
        var cvsSize = cvs_width / cvs_height;
        if (serImgSize > cvsSize) { //原圖比例寬邊較長
            fitZoom = cvs_width / serverImg.width;
            setCanvas(this.src, cvs_width, serverImg.height * fitZoom);
        } else {
            fitZoom = cvs_height / serverImg.height;
            setCanvas(this.src, serverImg.width * fitZoom, cvs_height);
        }
        getGroups();
        updateFenceTable();
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
    if (map_id == '') {
        alert($.i18n.prop('i_alarmAlert_29'));
        return;
    }
    xleftView = 0;
    ytopView = 0;
    Zoom = zoomOriginal;
    if (isFitWindow) { //恢復原比例
        fitZoom = 1;
        ctx.restore();
        ctx.save();
        isFitWindow = false; //目前狀態:原比例 
        document.getElementById("menu_resize").innerHTML = "<i class=\"fas fa-compress\" style='font-size:20px;'></i>";
        document.getElementById("menu_resize").title = $.i18n.prop('i_fit_window');
    } else { //依比例拉伸(Fit in Window)
        var cvs_width = parseFloat($("#mapBlock").css("width")) - 2;
        var cvs_height = parseFloat($("#mapBlock").css("height")) - 7;
        if ((serverImg.width / serverImg.height) > (cvs_width / cvs_height)) //原圖比例寬邊較長
            fitZoom = cvs_width / serverImg.width;
        else
            fitZoom = cvs_height / serverImg.height;
        isFitWindow = true; //目前狀態:依比例拉伸
        document.getElementById("menu_resize").innerHTML = "<i class=\"fas fa-expand\" style='font-size:20px;'></i>";
        document.getElementById("menu_resize").title = $.i18n.prop('i_restore_scale');
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

function updateFenceTable() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetFencesInMap"],
        "Value": {
            "map_id": map_id
        }
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                fenceArray = 'Values' in revObj == true ? revObj.Values.slice(0) : [];
                $("#table_fence_setting tbody").empty();
                fenceDotArray = [];
                for (i = 0; i < fenceArray.length; i++) {
                    var tr_id = "tr_fence_setting_" + (i + 1);
                    $("#table_fence_setting tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                        "<input type=\"checkbox\" name=\"chkbox_fence_setting\" value=\"" + fenceArray[i].fence_id + "\"" +
                        " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + (i + 1) + "</td>" +
                        "<td name=\"fence_id\">" + fenceArray[i].fence_id + "</td>" +
                        "<td name=\"fence_name\">" + fenceArray[i].fence_name + "</td>" +
                        "<td><label for=\"btn_edit_fence_" + i + "\" class='btn-edit' title='" + $.i18n.prop('i_editFence') + "'>" +
                        "<i class='fas fa-edit' style='font-size:18px;'></i></label><input id=\"btn_edit_fence_" + i + "\"" +
                        " type='button' class='btn-hidden' onclick=\"editFenceInfo(\'" + fenceArray[i].fence_id + "\');\" />" +
                        "</td></tr>");
                    getFencePointArray(fenceArray[i].fence_id);
                }
            } else {
                alert($.i18n.prop('i_alarmAlert_30'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function getFencePointArray(fence_id) {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetFence_point"],
        "Value": {
            "fence_id": fence_id
        }
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var arr = 'Values' in revObj == true ? revObj.Values.slice(0) : [];
                for (i = 0; i < arr.length; i++)
                    fenceDotArray.push(arr[i]);
                draw();
            } else {
                alert($.i18n.prop('i_alarmAlert_30'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function updateFenceDotsArr() {
    $("#table_fence_dot_setting tbody").empty();
    for (j = 0; j < addFenceDotArray.length; j++) {
        var tr_id = "tr_fence_dot_setting_" + addFenceDotArray[j].number;
        $("#table_fence_dot_setting tbody").append("<tr id=\"" + tr_id + "\"><td>" +
            "<input type=\"checkbox\" name=\"chkbox_fence_dot_setting\" value=\"" + addFenceDotArray[j].number +
            "\" onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + (j + 1) + "</td>" +
            "<td><label name=\"dot_x\">" + addFenceDotArray[j].x + "</label></td>" +
            "<td><label name=\"dot_y\">" + addFenceDotArray[j].y + "</label></td></tr>");
    }
}

function getGroups() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps_Groups"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var mapGroups = ('Values' in revObj) ? revObj.Values : [];
                groupArray = [];
                mapGroups.forEach(element => {
                    if (element.map_id == map_id)
                        groupArray.push(element.group_id);
                });
                getAnchor_Group();
            } else {
                alert($.i18n.prop('i_alarmAlert_31'));
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function getAnchor_Group() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAnchorsInMap"],
        "Value": {
            "map_id": map_id
        }
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                anchorGroupArray = ('Values' in revObj) ? revObj.Values.slice(0) : [];
            } else {
                alert($.i18n.prop('i_alarmAlert_31'));
                return;
            }
            draw();
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function draw() {
    setSize();
    drawAnchor_Group();
    drawFences();
    drawSettingFence();
    inputFenceGroup();
    /*dot_arr.forEach(function (v) {
        drawDot(ctx, v.fence_id, v.x, v.y);
    });*/
}

function drawAnchor_Group() {
    groupArray.forEach(function (group_id) {
        var group = new Group();
        var group_pos_arr = [];
        var containDots = 0;
        var containPolygon = 0;
        var group_name = "";
        anchorGroupArray.forEach(element => {
            if (element.group_id == group_id) {
                group_name = element.group_name;
                var point = {
                    x: element.set_x,
                    y: element.set_y
                };
                var x = element.set_x / canvasImg.scale;
                var y = canvasImg.height - element.set_y / canvasImg.scale
                group.setAnchor(element.anchor_id, x, y);
                if (addFenceDotArray.length >= 3)
                    containDots += checkInside(point, addFenceDotArray) == true ? 1 : 0;
                group_pos_arr.push(point);
            }
        });
        containPolygon += checkPP(group_pos_arr, addFenceDotArray) == true ? 1 : 0;
        if (containDots > 0 || containPolygon > 0) {
            //console.log("contain groups : " + group_id);
            var repeat = addFenceContainGroup.findIndex(function (groupInfo) {
                return groupInfo.g_id == group_id;
            });
            if (repeat == -1)
                addFenceContainGroup.push({
                    g_id: group_id,
                    g_name: group_name
                });
        }
        group.drawGroup();
    });
    /*anchorArray.forEach(function (v) {
        drawAnchor(ctx, v.id, v.type, v.x, v.y);
    });*/
}

function drawFences() {
    fenceArray.forEach(fence_info => {
        var fence = new Fence();
        var count = 0;
        fenceDotArray.forEach(dot_info => {
            if (dot_info.fence_id == fence_info.fence_id) {
                fence.setFenceDot(
                    fence_info.fence_name,
                    dot_info.point_x / canvasImg.scale,
                    canvasImg.height - dot_info.point_y / canvasImg.scale
                );
                count++;
            }
        });
        if (count > 0)
            fence.drawFence();
    });
}

function drawSettingFence() {
    var s_fence = new SettingFence();
    addFenceDotArray.forEach(dot_info => {
        s_fence.setFenceDot(
            dot_info.x / canvasImg.scale,
            canvasImg.height - dot_info.y / canvasImg.scale
        );
        var point = {
            x: dot_info.x,
            y: dot_info.y
        };
        groupArray.forEach(function (group_id) {
            var containDots = 0;
            var polygon = [];
            var group_name = "";
            anchorGroupArray.forEach(element => {
                if (element.group_id == group_id) {
                    group_name = element.group_name;
                    polygon.push({
                        x: element.set_x,
                        y: element.set_y
                    });
                    if (polygon.length >= 3)
                        containDots += checkInside(point, polygon) == true ? 1 : 0;
                }
            });
            if (containDots > 0) {
                //console.log("contain groups : " + group_id);
                var repeat = addFenceContainGroup.findIndex(function (groupInfo) {
                    return groupInfo.g_id == group_id;
                });
                if (repeat == -1)
                    addFenceContainGroup.push({
                        g_id: group_id,
                        g_name: group_name
                    });
            }
        });
    });
    s_fence.drawFence();
    s_fence.drawFenceDots();
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

function startFencePosition() {
    if (!isPosition) {
        isPosition = true;
        document.getElementById("label_fence_dot_position").innerHTML = "<i class='fas fa-map-marked' style='font-size:20px;'></i>";
        document.getElementById("label_fence_dot_position").title = $.i18n.prop('i_stopFencePointPos');
        var delaytime = 100; //0.1s
        pageTimer["timer1"] = setTimeout(function request() {
            draw();
            var posX = lastX * Zoom / fitZoom * canvasImg.scale;
            var posY = lastY * Zoom / fitZoom * canvasImg.scale;
            drawDotPosition(ctx, posX, posY);
            pageTimer["timer1"] = setTimeout(request, delaytime);
        }, delaytime);
        canvas.addEventListener("click", handleDotPosition);
    } else {
        isPosition = false;
        document.getElementById("label_fence_dot_position").innerHTML = "<i class='fas fa-map-marked-alt' style='font-size:20px;'></i>";
        document.getElementById("label_fence_dot_position").title = $.i18n.prop('i_startFencePointPos');
        for (var each in pageTimer)
            clearTimeout(pageTimer[each]);
        draw();
        canvas.removeEventListener("click", handleDotPosition);
    }
}

function resetFencePosition() {
    if (isPosition) {
        isPosition = false;
        document.getElementById("label_fence_dot_position").innerHTML = "<i class='fas fa-map-marked-alt' style='font-size:20px;'></i>";
        document.getElementById("label_fence_dot_position").title = $.i18n.prop('i_startFencePointPos');
        for (var each in pageTimer)
            clearTimeout(pageTimer[each]);
        draw();
        canvas.removeEventListener("click", handleDotPosition);
    }
}


function Fence() {
    var fence_dot_array = [];
    this.setFenceDot = function (fence_name, x, y) {
        fence_dot_array.push({
            fence_name: fence_name,
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
            ctx.lineTo(v.x + displace, v.y + displace);
            if (i == len - 1)
                ctx.lineTo(arr[0].x + displace, arr[0].y + displace);
        })
        ctx.strokeStyle = "rgb(0, 153, 51)";
        ctx.stroke();
        ctx.fillStyle = "rgba(0, 153, 51, 0.61)";
        ctx.fill();
        //在圍籬中間畫出群組名稱
        ctx.fillStyle = "blue";
        ctx.font = 60 / canvasImg.scale + 'px serif';
        var arr = fence_dot_array;
        var displace_x = (arr[2].x - arr[0].x) / 2;
        var displace_y = (arr[2].y - arr[0].y) / 2;
        ctx.fillText(arr[0].fence_name, arr[0].x + displace_x - 15, arr[0].y + displace_y - 6);
        ctx.closePath();
    };
}

function SettingFence() {
    var fence_dot_array = [];
    var canvas = document.getElementById("canvas_map");
    var ctx = canvas.getContext("2d");
    var displace = 5 / canvasImg.scale;
    this.setFenceDot = function (x, y) {
        fence_dot_array.push({
            x: x,
            y: y
        });
    };
    this.drawFence = function () {
        var len = fence_dot_array.length;
        ctx.beginPath();
        fence_dot_array.forEach(function (v, i, arr) {
            if (i == len - 1) {
                ctx.lineTo(v.x + displace, v.y + displace);
                ctx.lineTo(arr[0].x + displace, arr[0].y + displace);
            } else {
                ctx.lineTo(v.x + displace, v.y + displace);
            }
        })
        ctx.strokeStyle = "rgb(255, 80, 80)";
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 80, 80, 0.61)";
        ctx.fill();
        ctx.closePath();
    };
    this.drawFenceDots = function () {
        fence_dot_array.forEach(function (v) {
            ctx.fillStyle = "rgb(255, 80, 80)";
            ctx.fillRect(v.x - displace, v.y - displace, 30 / canvasImg.scale, 30 / canvasImg.scale); //10*3
        });
    };
}

function addDotArray(num, x, y) {
    addFenceDotArray.push({
        id: num,
        x: x,
        y: y
    });
    updateFenceDotsArr();
    draw();
}

function deleteDotArray(id) {
    var del_index = addFenceDotArray.findIndex(function (info) {
        return id == info.id;
    });
    addFenceDotArray.splice(del_index, 1);
    addFenceContainGroup = [];
}

function resetDotArray() {
    addFenceDotArray = [];
}

function resetDotGroup() {
    addFenceContainGroup = [];
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

function drawAnchor(dctx, id, type, x, y) {
    if (type == "main")
        dctx.fillStyle = "red";
    else
        dctx.fillStyle = "blue";
    dctx.font = 13 * 3 / canvasImg.scale + 'px serif';
    dctx.fillText(id, x - 15, y - 6); //anchorID
    dctx.fillRect(x - 5, y - 5, 10 * 3 / canvasImg.scale, 10 * 3 / canvasImg.scale);
}

function handleDotPosition() {
    $("#add_dot_x").val($("#x").val());
    $("#add_dot_y").val($("#y").val());
    $("#dialog_add_fence_dot").dialog("open");
}

function inputFenceGroup() {
    $("#table_fence_group tbody").empty();
    addFenceContainGroup.forEach(function (groupInfo, index) {
        $("#table_fence_group tbody").append("<tr><td>" + (index + 1) + "</td>" +
            "<td name=\"fence_groups\">" + groupInfo.g_name + "</td></tr>");
    });
    updateFenceGroup(addFenceContainGroup);
}