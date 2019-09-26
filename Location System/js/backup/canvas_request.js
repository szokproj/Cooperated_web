var PIXEL_RATIO, // 獲取瀏覽器像素比
    cvsBlock, canvas, ctx,
    serverImg = new Image(),
    canvasImg = {
        isPutImg: false,
        width: 0,
        height: 0,
        scale: 1 //預設比例尺為1:1,
    },
    // View parameters
    lastX = 0, //滑鼠最後位置的X座標
    lastY = 0, //滑鼠最後位置的Y座標
    xleftView = 0, //canvas的X軸位移(負值向左，正值向右)
    ytopView = 0, //canvas的Y軸位移(負值向上，正值向下)
    Zoom = 1.0, //縮放比例
    isFitWindow = true,
    isFocus = false,
    locating_id = "",
    // Data parameters
    Map_id = "",
    mapArray = [],
    groupfindMap = {},
    anchorArray = [],
    tagArray = [],
    alarmArray = [],
    alarmFilterArr = [],
    alarm_count = 0,
    MemberList = {},
    pageTimer = {}, //定義計時器全域變數 
    RedBling = true,
    display_setting = {
        lock_window: false,
        fit_window: true
    },
    dot_size = {
        anchor: 10,
        tag: 10,
        alarm: 14
    };

$(function () {
    //Check this page's permission and load navbar
    token = getUser() ? getUser().api_token : "";
    if (!getPermissionOfPage("index")) {
        alert("Permission denied!");
        history.back();
    }
    setNavBar("index", "");

    //https://www.minwt.com/webdesign-dev/js/16298.html
    var h = document.documentElement.clientHeight;
    var w = document.documentElement.clientWidth;
    $(".cvsBlock").css("height", h * 0.9 + "px");
    $(".member-table").css("max-height", h * 0.8 + "px");
    $(".alarm-table").css("max-height", h * 0.8 + "px");
    $(".search-table").css("max-height", h * 0.8 + "px");
    //預設彈跳視窗載入後隱藏
    $("#member_dialog").dialog({
        autoOpen: false
    });
    $("#alarm_dialog").dialog({
        autoOpen: false
    });
    $("#canvas").on("mousedown", function (e) {
        if (display_setting.lock_window && isFocus)
            return;
        e.preventDefault();
        var canvas_left = parseInt($("#canvas").css("margin-left"));
        var canvas_top = parseInt($("#canvas").css("margin-top"));
        //e.pageX,e.pageY:獲取滑鼠按下時的坐標
        var downx = e.pageX;
        var downy = e.pageY;
        $("#canvas").on("mousemove", function (es) {
            //滑鼠按下時=>div綁定事件
            //es.pageX,es.pageY:獲取滑鼠移動後的坐標 
            xleftView = es.pageX - downx + canvas_left;
            ytopView = es.pageY - downy + canvas_top;
            //計算div的最終位置,加上單位
            $("#canvas").css("margin-left", xleftView + "px").css("margin-top", ytopView + "px");
        });
        $("#canvas").on("mouseup", function () {
            //滑鼠彈起時=>div取消事件 
            $("#canvas").off("mousemove");
        });
    });
    $("#canvas").on("touchstart", function (e) {
        e.preventDefault();
        var canvas_left = parseInt($("#canvas").css("margin-left"));
        var canvas_top = parseInt($("#canvas").css("margin-top"));
        //獲取手指觸摸時的坐標 ex: event.targetTouches[0].pageX;
        var downx = e.targetTouches[0].pageX;
        var downy = e.targetTouches[0].pageY;
        $("#canvas").on("touchmove", function (es) {
            //手指觸摸時=>div綁定事件 
            xleftView = es.targetTouches[0].pageX - downx + canvas_left;
            ytopView = es.targetTouches[0].pageY - downy + canvas_top;
            $("#canvas").css("margin-left", xleftView + "px").css("margin-top", ytopView + "px");
        });
        $("#canvas").on("touchend", function () {
            //手指離開時=>div取消事件 
            $("#canvas").off("touchmove");
        });
    });
    setup();
});

function loading() {
    $('#canvas').hide();
    $('#transition').show();
    pageTimer["loading"] = setTimeout(function () {
        $('#transition').hide();
        $('#canvas').show();
        clearTimeout(pageTimer["transition"]);
    }, 200);
}

function setup() {
    //從Cookie中取出顯示設定&圖標尺寸
    dot_size = getSizeFromCookie();
    display_setting = getFocusSetFromCookie();
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
    canvas.addEventListener("mousemove", handleMouseMove, false); //滑鼠在畫布中移動的座標
    canvas.addEventListener("touchstart", handleMobileTouch, { //手指點擊畫布中座標，跳出tag的訊息框
        passive: true
    });
    canvas.addEventListener("mousewheel", handleMouseWheel, { //畫布縮放
        passive: true
    });
    canvas.addEventListener("DOMMouseScroll", handleMouseWheel, false); // 畫面縮放(for Firefox)
    canvas.addEventListener('click', handleMouseClick, false); //點擊地圖上的tag，跳出tag的訊息框
    //canvas.addEventListener("dblclick", handleDblClick, false); // 快速放大點擊位置

    getMemberData();
    getMapGroup();
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var MapList = revObj.Values;
                mapArray = MapList.slice(0); //Copy array
                var html = "";
                for (i = 0; i < MapList.length; i++) {
                    html += "<li><input type=\"button\" id=\"map_btn_" + MapList[i].map_id + "\" " +
                        "value=\"" + MapList[i].map_name + "\"" +
                        "onclick=\"addMapTab(\'" + MapList[i].map_id + "\',\'" + MapList[i].map_name +
                        "\')\"></li>";
                }
                document.getElementById("loadMapButtonGroup").innerHTML = html;
                selectMapFromCookie();
            } else {
                alert($.i18n.prop('i_failed_loadMap'));
            }
        }
    };
    xmlHttp.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"],
        "api_token": [token]
    })); //接收並載入Server的地圖設定到按鈕

    Start();

    pageTimer["timer2"] = setInterval('changeAlarmLight()', 1000);
}

function addMapTab(map_id, map_name) {
    var tab_map_id = "map_tab_" + map_id;
    $("#input_map").before("<button type=\"button\" name=\"map_tab\" class=\"btn btn-primary\" id=\"" +
        tab_map_id + "\" onclick=\"setMap(\'" + map_id + "\')\">" + map_name + "</button></li>");
    setMap(map_id);
    $("#map_btn_" + map_id).prop('disabled', true).css('color', 'lightgray');
}

function closeMapTag() {
    $("#map_tab_" + Map_id).remove();
    $("#map_btn_" + Map_id).prop('disabled', false).css('color', 'black');
    deleteMapToCookie(Map_id);
    if (Map_id == "")
        return false;
    if ($("button[name=map_tab]").length > 0) {
        var tab_map_id = $("button[name=map_tab]").eq(0).attr("id"); //"map_tab_" + map_id
        $("#" + tab_map_id).addClass("selected");
        setMap(tab_map_id.substring(8));
    } else { //reset
        resetCanvas_Anchor();
    }
}

function setMap(map_id) {
    //loading();
    isFocus = false;
    var index = mapArray.findIndex(function (info) {
        return info.map_id == map_id;
    });
    if (index < 0)
        return;
    var map_url = "data:image/" + mapArray[index].map_file_ext + ";base64," + mapArray[index].map_file;
    var map_scale = typeof (mapArray[index].map_scale) != 'undefined' && mapArray[index].map_scale != "" ? mapArray[index].map_scale : 1;
    $("button[name=map_tab]").removeClass("selected");
    $("#map_tab_" + map_id).addClass("selected");
    addMapToCookie(map_id);
    serverImg.src = map_url; //"data:image/" + revInfo.file_ext + ";base64," + revInfo.map_file;
    serverImg.onload = function () {
        cvsBlock.style.background = "none";
        canvasImg.isPutImg = true;
        canvasImg.width = serverImg.width;
        canvasImg.height = serverImg.height;
        canvasImg.scale = map_scale;
        document.getElementById("scale_visible").innerText = map_scale;
        setCanvas(this.src, serverImg.width, serverImg.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!display_setting.lock_window || !isFocus) {
            xleftView = 0;
            ytopView = 0;
            Zoom = 1.0;
            ctx.save(); //紀錄原比例
            $("#canvas").css("margin-left", "0px").css("margin-top", "0px");
            var serImgSize = serverImg.width / serverImg.height;
            var cvsBlock_width = parseFloat($("#cvsBlock").css("width"));
            var cvsBlock_height = parseFloat($("#cvsBlock").css("height"));
            var cvsSize = cvsBlock_width / cvsBlock_height;
            if (serImgSize > cvsSize) { //原圖比例寬邊較長
                Zoom = cvsBlock_width / serverImg.width;
                setCanvas(this.src, cvsBlock_width, serverImg.height * Zoom);
            } else {
                Zoom = cvsBlock_height / serverImg.height;
                setCanvas(this.src, serverImg.width * Zoom, cvsBlock_height);
            }
        }
        //在設定好地圖後，導入Anchors & Tags' setting
        Map_id = map_id;
        getAnchors(map_id);
        Start();
    };
}

function addMapToCookie(map_id) {
    var cookie = Cookies.get("recent_map");
    var currentMaps = typeof (cookie) === 'undefined' ? [] : JSON.parse(cookie);
    //从cookie中还原数组
    if (typeof (currentMaps) !== 'object') {
        Cookies.set("recent_map", JSON.stringify([]));
        Cookies.set("select_map", "");
        currentMaps = [];
    }
    var repeat = currentMaps.indexOf(map_id);
    if (repeat == -1)
        currentMaps.push(map_id); //新增地圖id
    Cookies.set("recent_map", JSON.stringify(currentMaps));
    Cookies.set("select_map", map_id);
    //将数组转换为Json字符串保存在cookie中
}

function deleteMapToCookie(map_id) {
    var cookie = Cookies.get("recent_map");
    var currentMaps = typeof (cookie) === 'undefined' ? [] : JSON.parse(cookie);
    //从cookie中还原数组
    if (typeof (currentMaps) !== 'object') {
        Cookies.set("recent_map", JSON.stringify([]));
        Cookies.set("select_map", "");
        return;
    }
    var repeat = currentMaps.indexOf(map_id);
    if (repeat > -1)
        currentMaps.splice(repeat, 1); //刪除地圖id
    Cookies.set("recent_map", JSON.stringify(currentMaps));
    Cookies.set("select_map", "");
    //将数组转换为Json字符串保存在cookie中
}

function selectMapFromCookie() {
    var selectedMap = Cookies.get("select_map");
    var cookie = Cookies.get("recent_map");
    var recentMaps = typeof (cookie) === 'undefined' ? [] : JSON.parse(cookie);
    if (typeof (recentMaps) !== 'object') {
        Cookies.set("recent_map", JSON.stringify([]));
        Cookies.set("select_map", "");
        return;
    }
    for (i in recentMaps) {
        var index = mapArray.findIndex(function (info) {
            return info.map_id == recentMaps[i];
        });
        if (index > -1)
            addMapTab(mapArray[index].map_id, mapArray[index].map_name);
    }
    setMap(selectedMap);
}

function setSizeToCookie(Size) {
    Cookies.set("anchor_size", Size.anchor);
    Cookies.set("tag_size", Size.tag);
    Cookies.set("alarm_size", Size.alarm);
    dot_size = getSizeFromCookie();
}

function setFocusSetToCookie(Setting) {
    Cookies.set("display_setting", JSON.stringify(Setting));
    display_setting = getFocusSetFromCookie();
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
    Map_id = "";
    anchorArray = [];
    document.getElementById('scale_visible').innerText = "";
    document.getElementById('x').value = "";
    document.getElementById('y').value = "";
    Stop();
}

function getAnchors(map_id) {
    Map_id = map_id;
    anchorArray = [];
    setSize();
    var request_anc = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAnchorsInMap"],
        "Value": {
            "map_id": map_id
        },
        "api_token": [token]
    };
    var ancXmlHttp = createJsonXmlHttp("sql");
    ancXmlHttp.onreadystatechange = function () {
        if (ancXmlHttp.readyState == 4 || ancXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var anchorList = revObj.Values;
            if (revObj.success > 0) {
                var x, y;
                for (i in anchorList) {
                    x = anchorList[i].set_x / canvasImg.scale;
                    y = canvasImg.height - anchorList[i].set_y / canvasImg.scale; //因為Server回傳的座標為左下原點
                    anchorArray.push({
                        id: anchorList[i].anchor_id,
                        type: "",
                        x: x,
                        y: y
                    });
                    drawAnchor(ctx, anchorList[i].anchor_id, "", x, y, dot_size.anchor, 1 / Zoom); //畫出點的設定
                }
            }
        }
    };
    ancXmlHttp.send(JSON.stringify(request_anc));

    var request_main = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMainAnchorsInMap"],
        "Value": {
            "map_id": map_id
        },
        "api_token": [token]
    };
    var mainXmlHttp = createJsonXmlHttp("sql");
    mainXmlHttp.onreadystatechange = function () {
        if (mainXmlHttp.readyState == 4 || mainXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var anchorList = revObj.Values;
            if (revObj.success > 0) {
                var x, y;
                for (i in anchorList) {
                    x = anchorList[i].set_x / canvasImg.scale;
                    y = canvasImg.height - anchorList[i].set_y / canvasImg.scale;
                    anchorArray.push({
                        id: anchorList[i].main_anchor_id,
                        type: "main",
                        x: x,
                        y: y
                    });
                    drawAnchor(ctx, anchorList[i].main_anchor_id, "main", x, y, dot_size.anchor, 1 / Zoom);
                }
            }
        }
    };
    mainXmlHttp.send(JSON.stringify(request_main));
}

function getMapGroup() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps_Groups"],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var revInfo = "Values" in revObj ? revObj.Values.slice(0) : [];
                revInfo.forEach(element => {
                    groupfindMap[element.group_id] = element.map_id;
                });
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function getMemberData() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetStaffs"],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0 && revObj.Values) {
                revObj.Values.forEach(element => {
                    MemberList[element.tag_id] = element;
                });
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function setMemberPhoto(img_id, number_id, number) {
    if (number == "") {
        $("#" + img_id).attr('src', "");
    } else {
        var request = {
            "Command_Type": ["Read"],
            "Command_Name": ["GetOneStaff"],
            "Value": {
                "number": number
            },
            "api_token": [token]
        };
        var xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj && revObj.success > 0 && "Values" in revObj) {
                    var revInfo = revObj.Values[0];
                    if ($("#" + number_id).text() != number)
                        return;
                    if (revInfo.file_ext != "" && revInfo.photo != "")
                        $("#" + img_id).attr('src', "data:image/" + revInfo.file_ext + ";base64," + revInfo.photo);
                    else
                        $("#" + img_id).attr('src', "");
                }
            }
        };
        xmlHttp.send(JSON.stringify(request));
    }
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

function restoreCanvas() {
    if (!canvasImg.isPutImg)
        return;
    var cvsBlock_width = parseFloat($("#cvsBlock").css("width"));
    var cvsBlock_height = parseFloat($("#cvsBlock").css("height"));
    xleftView = 0;
    ytopView = 0;
    Zoom = 1.0;
    if (isFitWindow) {
        isFitWindow = false; //目前狀態:原比例
        ctx.restore();
        ctx.save();
        document.getElementById("label_restore").innerHTML = "<i class=\"fas fa-expand\"" +
            " style='font-size:20px;' title=\"" + $.i18n.prop('i_fit_window') + "\"></i>";
    } else {
        isFitWindow = true; //目前狀態:依比例拉伸(Fit in Window)
        if ((serverImg.width / serverImg.height) > (cvsBlock_width / cvsBlock_height)) //原圖比例寬邊較長
            Zoom = cvsBlock_width / serverImg.width;
        else
            Zoom = cvsBlock_height / serverImg.height;
        document.getElementById("label_restore").innerHTML = "<i class=\"fas fa-compress\"" +
            " style='font-size:20px;' title=\"" + $.i18n.prop('i_restore_scale') + "\"></i>";
    }
    $("#canvas").css("margin-left", 0 + "px").css("margin-top", 0 + "px");
    draw();
}

function handleMouseWheel(event) { //滑鼠滾輪事件
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
    if (display_setting.lock_window && isFocus)
        return;
    draw();
    var Next_x = lastX * Zoom; //縮放後滑鼠位移後的位置(x坐標)
    var Next_y = (canvasImg.height - lastY) * Zoom; //縮放後滑鼠位移後的位置(y坐標)
    //var canvas_left = parseFloat($("#canvas").css("margin-left")); //canvas目前相對於div的位置(x坐標)
    //var canvas_top = parseFloat($("#canvas").css("margin-top")); //canvas目前相對於div的位置(y坐標)
    xleftView += pos_x - Next_x;
    ytopView += pos_y - Next_y;
    $("#canvas").css("margin-left", xleftView + "px").css("margin-top", ytopView + "px");
}

/*function handleDblClick(event) {
    var targetX = lastX; //滑鼠目前在canvas中的位置(x坐標)
    var targetY = lastY; //滑鼠目前在canvas中的位置(y坐標)
    var scale = event.shiftKey == 1 ? 0.5 : 1.5; // shrink (1.5) if shift key pressed
    Zoom *= scale; //縮放比例
    $(function () {
        var canvas_left = parseFloat($("#canvas").css("margin-left")); //canvas目前相對於div的位置(x坐標)
        var canvas_top = parseFloat($("#canvas").css("margin-top")); //canvas目前相對於div的位置(y坐標)
        xleftView = (targetX / scale - targetX); //得出最終偏移量X
        ytopView = (targetY / scale - targetY); //得出最終偏移量Y
        var end_x = canvas_left + xleftView;
        var end_y = canvas_top + ytopView;
        $("#canvas").css("margin-left", end_x + "px").css("margin-top", end_y + "px");
        draw();
    });
}*/

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

function handleMouseClick(event) { //滑鼠點擊事件
    var p = getEventPosition(event);
    tagArray.forEach(function (v) {
        if (v.type == "alarm")
            return;
        drawInvisiblePoints(ctx, v.id, v.x, v.y, dot_size.tag, 1 / Zoom);
        //如果傳入了事件坐標，就用isPointInPath判斷一下
        if (p && ctx.isPointInPath(p.x, p.y)) {
            $("#member_dialog_tag_id").text(parseInt(v.id.substring(8), 16));
            $("#member_dialog_number").text(v.number);
            $("#member_dialog_name").text(v.name);
            setMemberPhoto("member_dialog_image", "member_dialog_number", v.number);
            $("#member_dialog").dialog("open");
        }
    });
    alarmArray.forEach(function (v) {
        drawInvisiblePoints(ctx, v.id, v.x, v.y, dot_size.tag, 1 / Zoom);
        //如果傳入了事件坐標，就用isPointInPath判斷一下
        if (p && ctx.isPointInPath(p.x, p.y))
            //setAlarmDialog(v);
            setAlarmDialog({
                order: v.order,
                id: v.id,
                number: v.id in MemberList ? MemberList[v.id].number : "",
                name: v.id in MemberList ? MemberList[v.id].Name : "",
                status: v.status,
                time: v.time
            });
    });
}

function handleMobileTouch(event) { //手指觸碰事件
    if (canvasImg.isPutImg) {
        var x = event.changedTouches[0].pageX;
        var y = event.changedTouches[0].pageY;
        var p = getPointOnCanvas(x, y);
        var range = 10 / Zoom;
        tagArray.forEach(function (v) {
            if (v.type == "alarm")
                return;
            var distance = Math.sqrt(Math.pow(v.x - p.x, 2) + Math.pow(v.y - (p.y + 20 / Zoom), 2));
            if (distance <= range) {
                $("#member_dialog_tag_id").text(parseInt(v.id.substring(8), 16));
                $("#member_dialog_number").text(v.number);
                $("#member_dialog_name").text(v.name);
                setMemberPhoto("member_dialog_image", "member_dialog_number", v.number);
                $("#member_dialog").dialog("open");
            }
        });
        alarmArray.forEach(function (v) {
            var distance = Math.sqrt(Math.pow(v.x - p.x, 2) + Math.pow(v.y - (p.y + 28 / Zoom), 2));
            if (distance <= range)
                //setAlarmDialog(v);
                setAlarmDialog({
                    order: v.order,
                    id: v.id,
                    number: v.id in MemberList ? MemberList[v.id].number : "",
                    name: v.id in MemberList ? MemberList[v.id].Name : "",
                    status: v.status,
                    time: v.time
                });
        });
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
    document.getElementById('x').value = (lastX).toFixed(2);
    document.getElementById('y').value = (lastY).toFixed(2);
    return {
        x: pos_x,
        y: pos_y
    }
}

function updateAlarmList() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAlarmTop50List"],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("request");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj && revObj.length > alarm_count) {
                alarm_count = revObj.length;
                alarmFilterArr = [];
                var list = "";
                for (var i = 0; i < revObj.length; i++) {
                    var tag_id = revObj[i].tag_id;
                    var number = tag_id in MemberList ? MemberList[tag_id].number : "";
                    var name = tag_id in MemberList ? MemberList[tag_id].Name : "";
                    list += "<tr><td>" + (i + 1) +
                        "</td><td>" + number +
                        "</td><td>" + name +
                        "</td><td>" + parseInt(tag_id.substring(8), 16) +
                        "</td><td>" + revObj[i].tag_alarm_type +
                        "</td><td>" + revObj[i].tag_time +
                        "</td></tr>";
                    var repeat = alarmFilterArr.findIndex(function (info) {
                        return info.id == tag_id && info.alarm_type == revObj[i].tag_alarm_type;
                    });
                    if (repeat > -1)
                        alarmFilterArr.splice(repeat, 1);
                    alarmFilterArr.push({ //添加元素到陣列的開頭
                        order: i + 1,
                        id: tag_id,
                        number: number,
                        name: name,
                        alarm_type: revObj[i].tag_alarm_type,
                        time: revObj[i].tag_time
                    });
                }
                $("#table_rightbar_alarm_list tbody").html(list);

                //Alarm Card & Dialog
                $(".thumbnail_columns").empty();
                alarmFilterArr.forEach(function (element, i) {
                    inputAlarmData(element, i);
                });

                //Focus the newest alarm tag
                locateTag(alarmFilterArr[alarmFilterArr.length - 1].id);
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function changeAlarmLight() {
    if (alarmFilterArr.length > 0) {
        RedBling = !RedBling;
        if (RedBling)
            $("#alarmSideBar_icon").css("color", "red");
        else
            $("#alarmSideBar_icon").css("color", "white");
    } else {
        $("#alarmSideBar_icon").css("color", "white");
    }
}

function updateTagList() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetTagList"],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("requestTagList_json");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            if (!this.responseText)
                return;
            var revObj = JSON.parse(this.responseText);
            if (!revObj)
                return false;
            //if (canvasImg.isPutImg) {
            var temp_arr = tagArray;
            var update = 0;
            var focus_data = null;
            tagArray = [];
            for (var i = 0; i < revObj.length; i++) {
                var tag_id = revObj[i].tag_id;
                var number = tag_id in MemberList ? MemberList[tag_id].number : "";
                var name = tag_id in MemberList ? MemberList[tag_id].Name : "";
                var color = tag_id in MemberList ? MemberList[tag_id].color : "";
                //update tag array
                if (tag_id == locating_id) {
                    focus_data = {
                        id: tag_id,
                        x: revObj[i].tag_x / canvasImg.scale, // * Zoom,
                        y: canvasImg.height - revObj[i].tag_y / canvasImg.scale, // * Zoom,
                        system_time: revObj[i].tag_time,
                        color: color,
                        number: number,
                        name: name,
                        type: "normal",
                        group_id: revObj[i].group_id
                    }
                } else {
                    tagArray.push({
                        id: tag_id,
                        x: revObj[i].tag_x / canvasImg.scale, // * Zoom,
                        y: canvasImg.height - revObj[i].tag_y / canvasImg.scale, // * Zoom,
                        group_id: revObj[i].group_id,
                        system_time: revObj[i].tag_time,
                        color: color,
                        number: number,
                        name: name,
                        type: "normal"
                    });
                }
                update += temp_arr.findIndex(function (info) {
                    return info.id == tag_id;
                }) > -1 ? 0 : 1;
            }

            if (focus_data != null)
                tagArray.push(focus_data);

            if (update > 0) {
                //update member list
                $("#table_rightbar_member_list tbody").empty();
                tagArray.sort(function (a, b) {
                    var A = parseInt(a.id.substring(8), 16);
                    var B = parseInt(b.id.substring(8), 16);
                    return A - B;
                });
                tagArray.forEach(function (v, i) {
                    $("#table_rightbar_member_list tbody").append("<tr><td>" + (i + 1) +
                        "</td><td>" + parseInt(v.id.substring(8), 16) +
                        "</td><td>" + v.number +
                        "</td><td>" + v.name +
                        "</td><td><button class=\"btn btn-default\"" +
                        " onclick=\"locateTag(\'" + v.id + "\')\">" +
                        "<img class=\"icon-image\" src=\"../image/target.png\"></button>" +
                        "</td></tr>");
                });
            }
            tableFilter("table_filter_member", "table_rightbar_member_list");

            //定時比對tagArray更新alarmArray
            alarmArray = []; //每次更新都必須重置alarmArray
            if (alarmFilterArr.length > 0) {
                for (var j = 0; j < alarmFilterArr.length; j++) {
                    var alarmIndex = tagArray.findIndex(function (tag) {
                        return tag.id == alarmFilterArr[j].id; //比對Alarm與Tag的ID
                    });
                    if (alarmIndex > -1) {
                        alarmArray.push({ //依序將Tag資料放入AlarmArray中
                            order: alarmFilterArr[j].order,
                            id: tagArray[alarmIndex].id,
                            x: tagArray[alarmIndex].x,
                            y: tagArray[alarmIndex].y,
                            group_id: tagArray[alarmIndex].group_id,
                            status: alarmFilterArr[j].alarm_type,
                            time: alarmFilterArr[j].time
                        });
                        tagArray[alarmIndex].type = "alarm";
                    }
                }
            }
            //}
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function locateTag(tag_id) {
    var index = tagArray.findIndex(function (info) { //抓取指定AlarmTag的位置
        return info.id == tag_id;
    });
    if (index > -1) {
        locating_id = tag_id;
        changeFocusMap(tagArray[index].group_id);
    } else {
        showMyModel();
    }
}

function changeFocusMap(group_id) {
    var map_id = group_id in groupfindMap ? groupfindMap[group_id] : "";
    if (map_id == "") {
        isFocus = false;
        showMyModel();
    } else if (map_id == Map_id) {
        isFocus = true;
        //在同一張地圖內，所以不用切換地圖
    } else {
        if ($("#map_btn_" + map_id).prop("disabled")) {
            $("#map_tab_" + map_id).click();
        } else {
            var i = mapArray.findIndex(function (info) {
                return info.map_id == map_id;
            });
            if (i > -1)
                addMapTab(mapArray[i].map_id, mapArray[i].map_name);
        }
        isFocus = true;
    }
}

function focusAlarmTag(x, y) {
    if (display_setting.lock_window && isFocus) {
        var cvsBlock_width = parseFloat($("#cvsBlock").css("width"));
        var cvsBlock_height = parseFloat($("#cvsBlock").css("height"));
        //Zoom = 2.0;
        var focus_x = cvsBlock_width / 2 - parseFloat(x) * Zoom;
        var focus_y = cvsBlock_height / 2 - parseFloat(y) * Zoom;
        $("#canvas").css("margin-left", focus_x + "px").css("margin-top", focus_y + "px");
    }
}

function changeFocusAlarm(alarm_order) { //改變鎖定定位的Alarm目標
    var index = alarmFilterArr.findIndex(function (info) { //抓取指定AlarmTag的位置
        return info.order == alarm_order;
    });
    if (index == -1)
        return alert("此警報已解除或逾時，可在事件處理紀錄中查詢!");
    var temp = alarmFilterArr[index];
    alarmFilterArr.slice(index, 1);
    alarmFilterArr.push(temp);
    locateTag(temp.id);
}

function releaseFocusAlarm(alarm_order) { //解除指定的alarm
    var index = alarmFilterArr.findIndex(function (info) {
        return info.order == alarm_order;
    });
    if ($("#alarm_dialog_id").text() == parseInt(alarmFilterArr[index].id.substring(8), 16))
        $("#alarm_dialog").dialog("close");
    alarmFilterArr.splice(index, 1);
}

function unlockFocusAlarm() { //解除定位
    isFocus = false;
    if (display_setting.lock_window) {
        var cvsBlock_width = parseFloat($("#cvsBlock").css("width"));
        var cvsBlock_height = parseFloat($("#cvsBlock").css("height"));
        xleftView = 0; //恢復原比例
        ytopView = 0;
        Zoom = 1.0;
        ctx.restore();
        ctx.save();
        isFitWindow = false;
        $("#canvas").css("margin-left", "0px").css("margin-top", "0px");
        if ((serverImg.width / serverImg.height) > (cvsBlock_width / cvsBlock_height)) //原圖比例寬邊較長
            Zoom = cvsBlock_width / serverImg.width;
        else
            Zoom = cvsBlock_height / serverImg.height;
        setSize();
    }
}

function draw() {
    setSize();
    anchorArray.forEach(function (v) {
        drawAnchor(ctx, v.id, v.type, v.x, v.y, dot_size.anchor, 1 / Zoom);
    });
    tagArray.forEach(function (v) {
        //if (v.id == "00000000000000A8")
        //    console.log("group_id: " + v.group_id);
        if (groupfindMap[v.group_id] == Map_id)
            drawTags(ctx, v.id, v.x, v.y, v.color, dot_size.tag, 1 / Zoom);
    });
    alarmArray.forEach(function (v) {
        if (groupfindMap[v.group_id] == Map_id)
            drawAlarmTags(ctx, v.id, v.x, v.y, v.status, dot_size.alarm, 1 / Zoom);;
    });
    //Focus the position of this locating tag.
    if (isFocus) {
        var index = tagArray.findIndex(function (info) {
            return info.id == locating_id;
        });
        if (index > -1) {
            //console.log("focus_index: " + index);
            var target = tagArray[index];
            //console.log("group_id: " + target.group_id);
            var target_map_id = target.group_id in groupfindMap ? groupfindMap[target.group_id] : "";
            if (target_map_id != Map_id)
                changeFocusMap(target.group_id);
            focusAlarmTag(target.x, target.y);
            if (target.type == "alarm")
                drawAlarmFocusFrame(ctx, target.x, target.y, dot_size.alarm, 1 / Zoom);
            else
                drawFocusFrame(ctx, target.x, target.y, dot_size.tag, 1 / Zoom);
            //drawFocusMark(ctx, target.x, target.y, 1 / Zoom);
        }
    }
}

function Start() {
    //if (canvasImg.isPutImg) {
    var delaytime = 100; //設定計時器
    clearInterval(pageTimer["timer1"]);
    pageTimer["timer1"] = setInterval(function () {
        updateAlarmList();
        updateTagList();
        draw();
    }, delaytime);
    //}
}

function Stop() {
    for (var each in pageTimer) {
        clearInterval(pageTimer[each]);
    }
}