'use strict';
const ALARM_TYPE = ["low_power", "help", "still", "active", "Fence", "stay", "hidden"];
var token = "",
    userName = "",
    PIXEL_RATIO, // 獲取瀏覽器像素比
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
    tagArray = {},
    alarmArray = [],
    alarmFilterArr = [],
    MemberList = {},
    pageTimer = {}, //定義計時器全域變數 
    RedBling = true,
    display_setting = {
        lock_window: false,
        fit_window: true,
        display_fence: true,
        display_no_position: true
    },
    dot_size = {
        anchor: 10,
        tag: 10,
        alarm: 14
    },
    fenceArray = [],
    fenceDotArray = [],
    mouse = {
        canvasLeft: 0,
        canvasTop: 0,
        downX: 0,
        downY: 0
    };

$(function () {
    //Check this page's permission and load navbar
    let userInfo = getUser();
    token = getToken();
    userName = userInfo ? userInfo.cname : "";
    if (!getPermissionOfPage("index")) {
        alert("Permission denied!");
        history.back();
    }
    setNavBar("index", "");

    //https://www.minwt.com/webdesign-dev/js/16298.html
    /*let h = document.documentElement.clientHeight * 0.9,
     w = document.documentElement.clientWidth;
    $(".cvsBlock").css("height", h + "px");
    $(".member-table").css("max-height", h + "px");
    $(".alarm-table").css("max-height", h + "px");
    $(".search-table").css("max-height", h + "px");*/
    //預設彈跳視窗載入後隱藏

    $("#member_dialog").dialog({
        autoOpen: false
    });
    $("#alarm_dialog").dialog({
        autoOpen: false
    });
    $('#myModal').modal({
        backdrop: false,
        show: false
    });
    $("#search_start").on("click", search);
    setup();
});

/*window.onload = function () {
    setup();
}*/

function loading() {
    let transition = document.getElementById("transition");
    canvas.style.visibility = "hidden";
    transition.style.visibility = "visible";
    pageTimer["loading"] = setTimeout(function () {
        transition.style.visibility = "hidden";
        canvas.style.visibility = "visible";
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
        let dpr = window.devicePixelRatio || 1,
            bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;
        return dpr / bsr;
    })();
    canvas.addEventListener("mousemove", handleMouseMove, false); //滑鼠在畫布中移動的座標
    canvas.addEventListener("mousedown", handleCanvasDown); //滑鼠按住畫布綁定畫布拖移事件
    canvas.addEventListener("touchstart", handleMobileTouch, { //手指點擊畫布中座標，跳出tag的訊息框
        passive: true
    });
    canvas.addEventListener("mousewheel", handleMouseWheel, { //畫布縮放
        passive: true
    });
    canvas.addEventListener("DOMMouseScroll", handleMouseWheel, false); // 畫面縮放(for Firefox)
    canvas.addEventListener('click', handleMouseClick, false); //點擊地圖上的tag，跳出tag的訊息框
    setMobileEvents(); //Hammer.js
    document.getElementById("member_dialog_btn_unlock").onclick = function () {
        unlockFocusAlarm();
        $("#member_dialog").dialog("close");
    };
    document.getElementById("alarm_dialog_btn_unlock").onclick = function () {
        unlockFocusAlarm();
        $("#alarm_dialog").dialog("close");
    };
    if (token != "") {
        getMemberData();
        getMapGroup();
        getMaps();
        Start();
        clearInterval(pageTimer["bling"]);
        pageTimer["bling"] = setInterval('changeAlarmLight()', 1000);
    }
}

function getMaps() {
    const json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"],
        "api_token": [token]
    });
    let jxh = createJsonXmlHttp("sql");
    jxh.onreadystatechange = function () {
        if (jxh.readyState == 4 || jxh.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                let MapList = revObj.Value[0].Values || [];
                mapArray = MapList.slice(0); //Copy array
                let html = "";
                for (let i = 0; i < MapList.length; i++) {
                    html += "<a id=\"map_btn_" + MapList[i].map_id + "\" style=\"color:#000000;\" " +
                        "href=\"javascript: addMapTab(\'" + MapList[i].map_id + "\',\'" +
                        MapList[i].map_name + "\');\">" + MapList[i].map_name + "</a>";
                }
                document.getElementById("loadMapButtonGroup").innerHTML = html;
                selectMapFromCookie(); //接收並載入Server的地圖設定到按鈕
            } else {
                alert($.i18n.prop('i_failed_loadMap'));
            }
        }
    };
    jxh.send(json_request);
}

function addMapTab(map_id, map_name) {
    let map_btn = document.getElementById("map_btn_" + map_id);
    let map_pages = document.getElementById("map_pages");
    if (colorToHex(map_btn.style.color) == "#000000") {
        map_pages.innerHTML += "<button type=\"button\" name=\"map_tab\" class=\"btn btn-map-tab\"" +
            " id=\"map_tab_" + map_id + "\" onclick=\"setMap(\'" + map_id + "\')\">" + map_name +
            "</button></li>";
        setMap(map_id);
        map_btn.style.color = '#D3D3D3';
    }
}

function closeMapTag() {
    let tab_index = null;
    let map_btn = document.getElementById("map_btn_" + Map_id);
    let map_tabs = document.getElementsByName("map_tab");
    if (Map_id == "")
        return false;
    for (let i = 0; i < map_tabs.length; i++) {
        if (map_tabs[i].id == "map_tab_" + Map_id)
            tab_index = i;
    }
    document.getElementById("map_tab_" + Map_id).remove();
    map_btn.style.color = '#000000';
    deleteMapToCookie(Map_id);
    if (map_tabs.length > 0) {
        let tab_map_id = "";
        if (map_tabs.length <= tab_index)
            tab_map_id = map_tabs[tab_index - 1].id;
        else
            tab_map_id = map_tabs[tab_index].id;
        document.getElementById(tab_map_id).classList.add("selected");
        setMap(tab_map_id.substring(8));
    } else { //reset
        resetCanvas_Anchor();
    }
}

function setMap(map_id) {
    //loading();
    isFocus = false;
    let index = mapArray.findIndex(function (info) {
        return info.map_id == map_id;
    });
    if (index < 0)
        return;
    let map_url = "data:image/" + mapArray[index].map_file_ext + ";base64," + mapArray[index].map_file,
        map_scale = typeof (mapArray[index].map_scale) != 'undefined' &&
        mapArray[index].map_scale != "" ? mapArray[index].map_scale : 1,
        map_tabs = document.getElementsByName("map_tab");
    for (let i = 0; i < map_tabs.length; i++) {
        let tab_id = map_tabs[i].id;
        if (tab_id == "map_tab_" + map_id)
            document.getElementById(tab_id).classList.add("selected")
        else
            document.getElementById(tab_id).classList.remove("selected");
    }
    //$("button[name=map_tab]").remove("selected");
    //$("#map_tab_" + map_id).addClass("selected");
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
            canvas.style.marginLeft = "0px";
            canvas.style.marginTop = "0px";
            let serImgSize = serverImg.width / serverImg.height,
                cvsBlock_width = parseFloat(cvsBlock.clientWidth),
                cvsBlock_height = parseFloat(cvsBlock.clientHeight),
                cvsSize = cvsBlock_width / cvsBlock_height;
            if (serImgSize > cvsSize) { //原圖比例寬邊較長
                Zoom = (cvsBlock_width / serverImg.width).toFixed(2);
                setCanvas(this.src, cvsBlock_width, serverImg.height * Zoom);
            } else {
                Zoom = (cvsBlock_height / serverImg.height).toFixed(2);
                setCanvas(this.src, serverImg.width * Zoom, cvsBlock_height);
            }
        }
        //在設定好地圖後，導入Anchors & Tags' setting
        Map_id = map_id;
        getAnchors(map_id);
        getFences(map_id);
        Start();
    };
}

function addMapToCookie(map_id) {
    let cookie = Cookies.get("recent_map"),
        currentMaps = typeof (cookie) === 'undefined' ? [] : JSON.parse(cookie);
    //从cookie中还原数组
    if (typeof (currentMaps) !== 'object') {
        Cookies.set("recent_map", JSON.stringify([]));
        Cookies.set("select_map", "");
        currentMaps = [];
    }
    let repeat = currentMaps.indexOf(map_id);
    if (repeat == -1)
        currentMaps.push(map_id); //新增地圖id
    Cookies.set("recent_map", JSON.stringify(currentMaps));
    Cookies.set("select_map", map_id);
    //将数组转换为Json字符串保存在cookie中
}

function deleteMapToCookie(map_id) {
    let cookie = Cookies.get("recent_map"),
        currentMaps = typeof (cookie) === 'undefined' ? [] : JSON.parse(cookie);
    //从cookie中还原数组
    if (typeof (currentMaps) !== 'object') {
        Cookies.set("recent_map", JSON.stringify([]));
        Cookies.set("select_map", "");
        return;
    }
    let repeat = currentMaps.indexOf(map_id);
    if (repeat > -1)
        currentMaps.splice(repeat, 1); //刪除地圖id
    Cookies.set("recent_map", JSON.stringify(currentMaps));
    Cookies.set("select_map", "");
    //将数组转换为Json字符串保存在cookie中
}

function selectMapFromCookie() {
    let selectedMap = Cookies.get("select_map"),
        cookie = Cookies.get("recent_map"),
        recentMaps = typeof (cookie) === 'undefined' ? [] : JSON.parse(cookie);
    if (typeof (recentMaps) !== 'object') {
        Cookies.set("recent_map", JSON.stringify([]));
        Cookies.set("select_map", "");
        return;
    }
    for (let i in recentMaps) {
        let index = mapArray.findIndex(function (info) {
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

    //get anchor
    const jr = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetAnchorsInMap"],
        "Value": {
            "map_id": map_id
        },
        "api_token": [token]
    });
    let jxh = createJsonXmlHttp("sql");
    jxh.onreadystatechange = function () {
        if (jxh.readyState == 4 || jxh.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                let anchorList = revObj.Value[0].Values,
                    x, y;
                for (let i in anchorList) {
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
    jxh.send(jr);

    //get main anchor
    const jr_main = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetMainAnchorsInMap"],
        "Value": {
            "map_id": map_id
        },
        "api_token": [token]
    });
    let jxh_main = createJsonXmlHttp("sql");
    jxh_main.onreadystatechange = function () {
        if (jxh_main.readyState == 4 || jxh_main.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                let anchorList = revObj.Value[0].Values,
                    x, y;
                for (let i in anchorList) {
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
    jxh_main.send(jr_main);
}

function getMapGroup() {
    const json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps_Groups"],
        "api_token": [token]
    });
    let jxh = createJsonXmlHttp("sql");
    jxh.onreadystatechange = function () {
        if (jxh.readyState == 4 || jxh.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                let revInfo = revObj.Value[0].Values || [];
                revInfo.forEach(element => {
                    groupfindMap[element.group_id] = element.map_id;
                });
            }
        }
    };
    jxh.send(json_request);
}

function getMemberData() {
    const json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetStaffs"],
        "api_token": [token]
    });
    let jxh = createJsonXmlHttp("sql");
    jxh.onreadystatechange = function () {
        if (jxh.readyState == 4 || jxh.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                let revInfo = revObj.Value[0].Values || [];
                revInfo.forEach(element => {
                    let user_id = parseInt(element.tag_id.substring(8), 16);
                    MemberList[user_id] = {
                        tag_id: element.tag_id,
                        card_id: element.card_id,
                        number: element.number,
                        name: element.Name,
                        dept: element.department,
                        job_title: element.jobTitle,
                        type: element.type,
                        color: element.color,
                        alarm_group_id: element.alarm_group_id
                    };
                });
            }
        }
    };
    jxh.send(json_request);
}

function setMemberPhoto(img_id, number_id, number) {
    if (number == "") {
        $("#" + img_id).attr('src', "");
    } else {
        const json_request = JSON.stringify({
            "Command_Type": ["Read"],
            "Command_Name": ["GetOneStaff"],
            "Value": {
                "number": number
            },
            "api_token": [token]
        });
        let jxh = createJsonXmlHttp("sql");
        jxh.onreadystatechange = function () {
            if (jxh.readyState == 4 || jxh.readyState == "complete") {
                let revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0 && revObj.Value[0].Values) {
                    let revInfo = revObj.Value[0].Values[0];
                    if (document.getElementById(number_id).innerText != number)
                        return;
                    if (revInfo.file_ext != "" && revInfo.photo != "")
                        document.getElementById(img_id).setAttribute("src", "data:image/" + revInfo.file_ext + ";base64," + revInfo.photo);
                    else
                        document.getElementById(img_id).setAttribute("src", "");
                }
            }
        };
        jxh.send(json_request);
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
    let cvsBlock_width = parseFloat(cvsBlock.clientWidth),
        cvsBlock_height = parseFloat(cvsBlock.clientHeight);
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
            Zoom = (cvsBlock_width / serverImg.width).toFixed(2);
        else
            Zoom = (cvsBlock_height / serverImg.height).toFixed(2);
        document.getElementById("label_restore").innerHTML = "<i class=\"fas fa-compress\"" +
            " style='font-size:20px;' title=\"" + $.i18n.prop('i_restore_scale') + "\"></i>";
    }
    canvas.style.marginLeft = "0px";
    canvas.style.marginTop = "0px";
    draw();
}

function handleMouseWheel(event) { //滑鼠滾輪事件
    let BCR = canvas.getBoundingClientRect(),
        pos_x = event.clientX - BCR.left,
        pos_y = event.clientY - BCR.top,
        scale = 1.0;
    if (event.wheelDelta < 0 || event.detail > 0) {
        if (Zoom > 0.1)
            scale = 0.9;
    } else {
        scale = 1.1;
    }
    Zoom = (Zoom * scale).toFixed(2); //縮放比例
    if (display_setting.lock_window && isFocus)
        return;
    draw();
    let Next_x = lastX * Zoom, //縮放後滑鼠位移後的位置(x坐標)
        Next_y = (canvasImg.height - lastY) * Zoom; //縮放後滑鼠位移後的位置(y坐標)
    //let canvas_left = parseFloat(canvas.style.marginLeft); //canvas目前相對於div的位置(x坐標)
    //let canvas_top = parseFloat(canvas.style.marginTop); //canvas目前相對於div的位置(y坐標)
    xleftView += pos_x - Next_x;
    ytopView += pos_y - Next_y;
    canvas.style.marginLeft = xleftView + "px";
    canvas.style.marginTop = ytopView + "px";
}

function handleMouseClick(event) { //滑鼠點擊事件
    let x = event.clientX,
        y = event.clientY,
        p = getPointOnCanvas(x, y);
    /*let p = {
        x: lastX,
        y: canvasImg.height - lastY
    };*/
    for (let each in tagArray) {
        let v = tagArray[each];
        if (v.type == "normal" && groupfindMap[v.group_id] == Map_id) {
            let radius = dot_size.tag / Zoom,
                distance = Math.sqrt(Math.pow(v.x - p.x, 2) + Math.pow(v.y - (p.y + 20 / Zoom), 2));
            if (distance <= radius) {
                setTagDialog(v);
            }
        }
    }
    alarmArray.forEach(function (v) {
        if (groupfindMap[v.group_id] == Map_id) {
            let radius = dot_size.alarm / Zoom,
                distance = Math.sqrt(Math.pow(v.x - p.x, 2) + Math.pow(v.y - (p.y + 28 / Zoom), 2));
            if (distance <= radius) {
                setAlarmDialog({
                    id: v.id,
                    number: v.id in MemberList ? MemberList[v.id].number : "",
                    name: v.id in MemberList ? MemberList[v.id].name : "",
                    status: v.status,
                    alarm_time: v.alarm_time
                });
            }
        }
    });
}

function handleMobileTouch(event) { //手指觸碰事件
    if (canvasImg.isPutImg) {
        let x = event.changedTouches[0].pageX,
            y = event.changedTouches[0].pageY,
            p = getPointOnCanvas(x, y);
        for (let each in tagArray) {
            let v = tagArray[each];
            if (v.type == "normal" && groupfindMap[v.group_id] == Map_id) {
                let radius = dot_size.tag / Zoom,
                    distance = Math.sqrt(Math.pow(v.x - p.x, 2) + Math.pow(v.y - (p.y + 20 / Zoom), 2));
                if (distance <= radius) {
                    document.getElementById("member_dialog_tag_id").innerText = parseInt(v.id.substring(8), 16);
                    document.getElementById("member_dialog_number").innerText = v.number;
                    document.getElementById("member_dialog_name").innerText = v.name;
                    setMemberPhoto("member_dialog_image", "member_dialog_number", v.number);
                    $("#member_dialog").dialog("open");
                }
            }
        }
        alarmArray.forEach(function (v) {
            if (groupfindMap[v.group_id] == Map_id) {
                let radius = dot_size.alarm / Zoom,
                    distance = Math.sqrt(Math.pow(v.x - p.x, 2) + Math.pow(v.y - (p.y + 28 / Zoom), 2));
                if (distance <= radius) {
                    setAlarmDialog({
                        id: v.id,
                        number: v.id in MemberList ? MemberList[v.id].number : "",
                        name: v.id in MemberList ? MemberList[v.id].name : "",
                        status: v.status,
                        alarm_time: v.alarm_time
                    });
                }
            }
        });
    }
}

function handleMouseMove(event) { //滑鼠移動事件
    if (canvasImg.isPutImg)
        getPointOnCanvas(event.clientX, event.clientY);
    //抓取在物件上的點擊位置用clientX和clientY比較準確(位置不受滾動條影響)
}

function getPointOnCanvas(x, y) {
    //獲取滑鼠在Canvas物件上座標(座標起始點從左上換到左下)
    let BCR = canvas.getBoundingClientRect(),
        pos_x = (x - BCR.left) / Zoom,
        pos_y = (y - BCR.top) / Zoom;
    lastX = pos_x;
    lastY = canvasImg.height - pos_y;
    document.getElementById('x').innerText = (lastX).toFixed(2);
    document.getElementById('y').innerText = (lastY).toFixed(2);
    return {
        x: pos_x,
        y: pos_y
    }
}

function handleCanvasDown(event) {
    if (display_setting.lock_window && isFocus)
        return;
    event.preventDefault();
    mouse.canvasLeft = parseInt(canvas.style.marginLeft);
    mouse.canvasTop = parseInt(canvas.style.marginTop);
    //event.pageX, event.pageY:獲取滑鼠按下時的坐標
    mouse.downX = event.pageX;
    mouse.downY = event.pageY;
    canvas.addEventListener("mousemove", handleCanvasMove);
    canvas.addEventListener("mouseup", function () {
        //滑鼠彈起時=>div取消事件 
        canvas.removeEventListener("mousemove", handleCanvasMove);
    });
}

function handleCanvasMove(event) {
    //滑鼠按下時=>div綁定事件
    //event.pageX, event.pageY:獲取滑鼠移動後的坐標 
    xleftView = event.pageX - mouse.downX + mouse.canvasLeft;
    ytopView = event.pageY - mouse.downY + mouse.canvasTop;
    //計算div的最終位置,加上單位
    canvas.style.marginLeft = xleftView + "px";
    canvas.style.marginTop = ytopView + "px";
}

function sortAlarm() {
    let btn = document.getElementById("btn_sort_alarm");
    if (btn.children[0].classList.contains("fa-sort-amount-up")) {
        btn.title = $.i18n.prop('i_oldestTop');
        btn.innerHTML = "<i class=\"fas fa-sort-amount-down\"></i>";
    } else {
        btn.title = $.i18n.prop('i_lastestTop');
        btn.innerHTML = "<i class=\"fas fa-sort-amount-up\"></i>";
    }
    alarmFilterArr = [];
}

function changeAlarmLight() {
    let alarmSideBar_icon = document.getElementById("alarmSideBar_icon");
    if (alarmFilterArr.length > 0) {
        RedBling = !RedBling;
        if (RedBling)
            alarmSideBar_icon.style.color = "red";
        else
            alarmSideBar_icon.style.color = "white";
    } else {
        alarmSideBar_icon.style.color = "white";
    }
}

function updateAlarmHandle() {
    const json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["gethandlerecordall"],
        "api_token": [token]
    });
    let jxh = createJsonXmlHttp("alarmhandle");
    jxh.onreadystatechange = function () {
        if (jxh.readyState == 4 || jxh.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0]) {
                let length = revObj.Value[0].Values.length || 0,
                    revInfo = length > 0 ? revObj.Value[0].Values.slice(length - 100) : [];
                if (revObj.Value[0].success == 0)
                    return;
                let html = "";
                for (let i = 0; i < revInfo.length; i++) {
                    let tag_id = revInfo[i].tagid,
                        number = tag_id in MemberList ? MemberList[tag_id].number : "",
                        name = tag_id in MemberList ? MemberList[tag_id].name : "";
                    html = "<tr><td>" + (revInfo.length - i) +
                        "</td><td>" + revInfo[i].alarmtype +
                        "</td><td>" + parseInt(tag_id.substring(8), 16) +
                        "</td><td>" + number +
                        "</td><td>" + name +
                        "</td><td>" + revInfo[i].alarmhelper +
                        "</td><td>" + revInfo[i].endtime +
                        "</td></tr>" + html;
                }
                document.getElementById("table_rightbar_alarm_list").children[1].innerHTML = html;
            }
        }
    };
    jxh.send(json_request);
}

var xmlHttp = {
    getTag: GetXmlHttpObject(),
    getAlarm: GetXmlHttpObject()
};

function updateAlarmList() {
    const json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetAlarmTop50List"],
        "api_token": [token]
    });
    xmlHttp["getAlarm"].open("POST", "request", true);
    xmlHttp["getAlarm"].setRequestHeader("Content-type", "application/json");
    xmlHttp["getAlarm"].onreadystatechange = function () {
        if (xmlHttp["getAlarm"].readyState == 4 || xmlHttp["getAlarm"].readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value) {
                let revInfo = revObj.Value[0] || [],
                    update = 0,
                    temp_arr = alarmFilterArr;
                alarmFilterArr = [];
                revInfo.forEach(element => {
                    if (ALARM_TYPE.indexOf(element.tag_alarm_type) > -1) {
                        let tag_id = element.tag_id,
                            number = tag_id in MemberList ? MemberList[tag_id].number : "",
                            name = tag_id in MemberList ? MemberList[tag_id].name : "";
                        alarmFilterArr.push({ //添加元素到陣列的開頭
                            id: tag_id,
                            number: number,
                            name: name,
                            alarm_type: element.tag_alarm_type,
                            alarm_time: element.tag_time,
                            count: element.counter
                        });
                        update += temp_arr.findIndex(function (info) {
                            return info.id == tag_id && info.alarm_type == element.tag_alarm_type;
                        }) > -1 ? 0 : 1; //計算新增筆數
                    }
                });

                if (update > 0 || alarmFilterArr.length != temp_arr.length) {
                    //Alarm Card & Dialog
                    document.getElementsByClassName("thumbnail_columns")[0].innerHTML = "";
                    alarmFilterArr.forEach(function (element, i) {
                        inputAlarmData(element, i);
                    });
                    //Focus the newest alarm tag
                    locateTag(alarmFilterArr[alarmFilterArr.length - 1].id);
                } else {
                    alarmFilterArr.forEach(function (element) {
                        let tagid_alarm = element.id + element.alarm_type,
                            time_arr = TimeToArray(element.alarm_time);
                        document.getElementById("count_" + tagid_alarm).innerText = element.count;
                        document.getElementById("date_" + tagid_alarm).innerText = time_arr.date;
                        document.getElementById("time_" + tagid_alarm).innerText = time_arr.time;
                    });
                }
            }
        }
    };
    xmlHttp["getAlarm"].send(json_request);
}

function updateTagList() {
    const json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetTagList"],
        "api_token": [token]
    });
    //let xh = xmlHttp.getTag;
    xmlHttp["getTag"].open("POST", "requestTagList_json", true);
    xmlHttp["getTag"].setRequestHeader("Content-type", "application/json");
    xmlHttp["getTag"].onreadystatechange = function () {
        if (xmlHttp["getTag"].readyState == 4 || xmlHttp["getTag"].readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (!checkTokenAlive(token, revObj)) {
                let revInfo = revObj, //.Value[0];
                    temp_arr = tagArray,
                    update = 0,
                    focus_data = null;
                tagArray = {};
                revInfo.forEach(element => {
                    let number = element.tag_id in MemberList ? MemberList[element.tag_id].number : "",
                        name = element.tag_id in MemberList ? MemberList[element.tag_id].name : "",
                        color = element.tag_id in MemberList ? MemberList[element.tag_id].color : "";
                    //update tag array
                    if (element.tag_id == locating_id) {
                        focus_data = {
                            id: element.tag_id,
                            x: element.tag_x / canvasImg.scale, // * Zoom,
                            y: canvasImg.height - element.tag_y / canvasImg.scale, // * Zoom,
                            system_time: element.tag_time,
                            color: color,
                            number: number,
                            name: name,
                            type: "normal",
                            group_id: element.group_id
                        }
                    } else {
                        tagArray[element.tag_id] = {
                            id: element.tag_id,
                            x: element.tag_x / canvasImg.scale, // * Zoom,
                            y: canvasImg.height - element.tag_y / canvasImg.scale, // * Zoom,
                            group_id: element.group_id,
                            system_time: element.tag_time,
                            color: color,
                            number: number,
                            name: name,
                            type: "normal"
                        };
                    }
                    element["number"] = number;
                    element["name"] = name;
                    update += temp_arr[element.tag_id] ? 0 : 1;
                });
                if (focus_data != null)
                    tagArray[locating_id] = focus_data;
                if (update > 0) {
                    //update member list
                    //$("#table_rightbar_member_list tbody").empty();
                    let html = "";
                    revInfo.sort(function (a, b) {
                        let A = parseInt(a.tag_id.substring(8), 16),
                            B = parseInt(b.tag_id.substring(8), 16);
                        return A - B;
                    });
                    revInfo.forEach(function (v, i) {
                        html += "<tr><td>" + (i + 1) +
                            "</td><td>" + parseInt(v.tag_id.substring(8), 16) +
                            "</td><td>" + v.number +
                            "</td><td>" + v.name +
                            "</td><td><button class=\"btn btn-default btn-focus\"" +
                            " onclick=\"locateTag(\'" + v.tag_id + "\')\">" +
                            "<img class=\"icon-image\" src=\"../image/target.png\"></button>" +
                            "</td></tr>";
                        /*$("#table_rightbar_member_list tbody").append("<tr><td>" + (i + 1) +
                            "</td><td>" + parseInt(v.tag_id.substring(8), 16) +
                            "</td><td>" + v.number +
                            "</td><td>" + v.name +
                            "</td><td><button class=\"btn btn-default btn-focus\"" +
                            " onclick=\"locateTag(\'" + v.tag_id + "\')\">" +
                            "<img class=\"icon-image\" src=\"../image/target.png\"></button>" +
                            "</td></tr>");*/
                    });
                    document.getElementById("table_rightbar_member_list").children[1].innerHTML = html; //tbody
                }
                tableFilter("table_filter_member", "table_rightbar_member_list");

                //定時比對tagArray更新alarmArray
                alarmArray = []; //每次更新都必須重置alarmArray
                alarmFilterArr.forEach(element => {
                    if (element.id in tagArray) {
                        alarmArray.push({ //依序將Tag資料放入AlarmArray中
                            id: element.id,
                            x: tagArray[element.id].x,
                            y: tagArray[element.id].y,
                            group_id: tagArray[element.id].group_id,
                            status: element.alarm_type,
                            alarm_time: element.alarm_time
                        });
                        tagArray[element.id].type = "alarm";
                    }
                });
            }
        }
    };
    xmlHttp["getTag"].send(json_request);
}

function locateTag(tag_id) {
    if (tag_id in tagArray) {
        locating_id = tag_id;
        changeFocusMap(tagArray[tag_id].group_id);
    } else {
        showMyModel();
    }
}

function changeFocusMap(group_id) {
    let map_id = group_id in groupfindMap ? groupfindMap[group_id] : "";
    if (map_id == "") {
        isFocus = false;
        showMyModel();
    } else if (map_id == Map_id) { //在同一張地圖內，所以不用切換地圖
        isFocus = true;
    } else {
        let color = colorToHex(document.getElementById("map_btn_" + map_id).style.color);
        if (color == "#D3D3D3") {
            document.getElementById("map_tab_" + map_id).click();
        } else {
            let i = mapArray.findIndex(function (info) {
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
        let cvsBlock_width = parseFloat(cvsBlock.clientWidth),
            cvsBlock_height = parseFloat(cvsBlock.clientHeight),
            focus_x = cvsBlock_width / 2 - parseFloat(x) * Zoom,
            focus_y = cvsBlock_height / 2 - parseFloat(y) * Zoom;
        canvas.style.marginLeft = focus_x + "px";
        canvas.style.marginTop = focus_y + "px";
    }
}

function changeFocusAlarm(tag_id, alarm_type) { //改變鎖定定位的Alarm目標
    let index = alarmFilterArr.findIndex(function (info) { //抓取指定AlarmTag的位置
        return info.id == tag_id && info.alarm_type == alarm_type;
    });
    if (index == -1) return alert("此警報已解除或逾時，可在事件處理紀錄中查詢!");
    let temp = alarmFilterArr[index];
    alarmFilterArr.splice(index, 1);
    alarmFilterArr.push(temp);
    locateTag(temp.id);
}

function releaseFocusAlarm(tag_id, alarm_type) { //解除指定的alarm
    let index = alarmFilterArr.findIndex(function (info) { //抓取指定AlarmTag的位置
        return info.id == tag_id && info.alarm_type == alarm_type;
    });
    if (index > -1) {
        let tag_id = alarmFilterArr[index].id;
        const json_request = JSON.stringify({
            "Command_Name": ["addhandlerecord"],
            "Value": [{
                "alarmtype": alarmFilterArr[index].alarm_type,
                "alarmhelper": userName,
                "tagid": tag_id
            }],
            "api_token": [token]
        });
        let jxh = createJsonXmlHttp("alarmhandle");
        jxh.onreadystatechange = function () {
            if (jxh.readyState == 4 || jxh.readyState == "complete") {
                let revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj)) {
                    let revInfo = revObj.Value[0];
                    if (revInfo.success == 1) {
                        if (document.getElementById("alarm_dialog_id").innerText == parseInt(tag_id.substring(8), 16))
                            $("#alarm_dialog").dialog("close");
                    }
                }
            }
        };
        jxh.send(json_request);
    }
}

function unlockFocusAlarm() { //解除定位
    isFocus = false;
    if (display_setting.lock_window) {
        let cvsBlock_width = parseFloat(cvsBlock.clientWidth),
            cvsBlock_height = parseFloat(cvsBlock.clientHeight);
        xleftView = 0; //恢復原比例
        ytopView = 0;
        Zoom = 1.0;
        ctx.restore();
        ctx.save();
        isFitWindow = false;
        canvas.style.marginLeft = "0px";
        canvas.style.marginTop = "0px";
        if ((serverImg.width / serverImg.height) > (cvsBlock_width / cvsBlock_height)) //原圖比例寬邊較長
            Zoom = (cvsBlock_width / serverImg.width).toFixed(2);
        else
            Zoom = (cvsBlock_height / serverImg.height).toFixed(2);
        setSize();
    }
}

function draw() {
    setSize();
    if (display_setting.display_fence)
        drawFences();
    anchorArray.forEach(function (v) {
        drawAnchor(ctx, v.id, v.type, v.x, v.y, dot_size.anchor, 1 / Zoom);
    });
    for (let each in tagArray) {
        let v = tagArray[each];
        if (groupfindMap[v.group_id] == Map_id)
            drawTags(ctx, v.id, v.x, v.y, v.color, dot_size.tag, 1 / Zoom);
    }
    alarmArray.forEach(function (v) {
        if (groupfindMap[v.group_id] == Map_id)
            drawAlarmTags(ctx, v.id, v.x, v.y, v.status, dot_size.alarm, 1 / Zoom);
    });
    //Focus the position of this locating tag.
    if (isFocus) {
        if (locating_id in tagArray) {
            let target = tagArray[locating_id],
                target_map_id = target.group_id in groupfindMap ? groupfindMap[target.group_id] : "";
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
    let delaytime = 200; //設定計時器
    clearInterval(pageTimer["timer1"]);
    pageTimer["timer1"] = setInterval(function () {
        updateAlarmList();
        updateTagList();
        draw();
    }, delaytime);

    clearInterval(pageTimer["timer2"]);
    pageTimer["timer2"] = setInterval(function () {
        updateAlarmHandle();
    }, 1000);
}

function Stop() {
    for (let each in pageTimer) {
        clearInterval(pageTimer[each]);
    }
}

function drawFences() {
    fenceArray.forEach(fence_info => {
        let fence = new Fence(ctx),
            count = 0;
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

function getFences(map_id) {
    fenceArray = [];
    fenceDotArray = [];
    const json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetFencesInMap"],
        "Value": {
            "map_id": map_id
        },
        "api_token": [token]
    });
    let jxh = createJsonXmlHttp("sql");
    jxh.onreadystatechange = function () {
        if (jxh.readyState == 4 || jxh.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                fenceArray = "Values" in revObj.Value[0] ? revObj.Value[0].Values.slice(0) : [];
                for (let i = 0; i < fenceArray.length; i++)
                    getFencePointArray(fenceArray[i].fence_id);
            } else {
                alert($.i18n.prop('i_alarmAlert_30'));
            }
        }
    };
    jxh.send(json_request);
}

function getFencePointArray(fence_id) {
    const json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetFence_point"],
        "Value": {
            "fence_id": fence_id
        },
        "api_token": [token]
    });
    let jxh = createJsonXmlHttp("sql");
    jxh.onreadystatechange = function () {
        if (jxh.readyState == 4 || jxh.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                let arr = "Values" in revObj.Value[0] ? revObj.Value[0].Values.slice(0) : [];
                for (let i = 0; i < arr.length; i++)
                    fenceDotArray.push(arr[i]);
            } else {
                alert($.i18n.prop('i_alarmAlert_30'));
            }
        }
    };
    jxh.send(json_request);
}

function showMyModel() {
    let myModal = document.getElementById("myModal");
    if (display_setting.display_no_position) {
        //myModal.style.display = 'block';
        $('#myModal').modal('show');
        //console.log("display:" + myModal.style.display);
        pageTimer["model"] = setTimeout(function () {
            //myModal.style.display = 'none';
            $('#myModal').modal('hide');
            //console.log("display:" + myModal.style.display);
            clearTimeout(pageTimer["model"]);
        }, 1200);
    }
}


var panPos = {
    canvasLeft: 0,
    canvasTop: 0
};

function setMobileEvents() {
    const hammer_pan = new Hammer(canvas); //Canvas位移
    const hammer_pinch = new Hammer(canvas); //Canvas縮放

    hammer_pan.get('pan').set({
        direction: Hammer.DIRECTION_ALL
    });
    hammer_pinch.get('pinch').set({
        enable: true
    });

    hammer_pan.on('panstart', ev => {
        panPos.canvasLeft = parseInt(canvas.style.marginLeft);
        panPos.canvasTop = parseInt(canvas.style.marginTop);
    });
    hammer_pan.on('panmove', ev => {
        xleftView = panPos.canvasLeft + ev.deltaX;
        ytopView = panPos.canvasTop + ev.deltaY;
        canvas.style.marginLeft = xleftView + "px";
        canvas.style.marginTop = ytopView + "px";
        document.getElementById("centerX").value = ev.center.x;
        document.getElementById("centerY").value = ev.center.y;
    });
    hammer_pinch.on('pinchstart pinchmove', ev => {
        let BCR = canvas.getBoundingClientRect(),
            pos_x = ev.center.x - BCR.left,
            pos_y = ev.center.y - BCR.top,
            scale = 1;
        if (ev.scale < 1) {
            if (Zoom >= 0.1)
                scale = 0.95;
        } else if (ev.scale > 1) {
            if (Zoom <= 1.5)
                scale = 1.05;
        }
        Zoom *= scale; //縮放比例
        if (display_setting.lock_window && isFocus)
            return;
        draw();
        let Next_x = pos_x * scale, //縮放後的位置(x坐標)
            Next_y = pos_y * scale; //縮放後的位置(y坐標)
        xleftView += pos_x - Next_x;
        ytopView += pos_y - Next_y;
        canvas.style.marginLeft = xleftView + "px";
        canvas.style.marginTop = ytopView + "px";
    });
}

function clamp(value, min, max) {
    return Math.min(Math.max(min, value), max);
}

function clampScale(newScale) {
    return clamp(newScale, minScale, maxScale);
}

function search() {
    let html = "";
    let key = $("#search_select_type").val();
    let value = $("#search_input_target").val();
    if (key == "map") {
        let index = mapArray.findIndex(function (info) {
            return info.map_name == value || info.map_id == value;
        });
        if (index > -1) {
            let group_arr = [];
            for (let i in groupfindMap) {
                if (groupfindMap[i] == mapArray[index].map_id)
                    group_arr.push(groupfindMap[i]);
            }
            for (let j in tagArray) {
                let v = tagArray[j];
                group_arr.forEach(group_id => {
                    if (v.group_id == group_id) {
                        let user_id = parseInt(v.tag_id.substring(8), 16);
                        let member_data = MemberList[user_id] ? MemberList[user_id] : {
                            dept: "",
                            job_title: "",
                            type: ""
                        };
                        html += "<tr>" +
                            "<td>" + user_id + "</td>" +
                            "<td>" + v.number + "</td>" +
                            "<td>" + v.name + "</td>" +
                            "<td>" + member_data.dept + "</td>" +
                            "<td>" + member_data.job_title + "</td>" +
                            "<td>" + member_data.type + "</td>" +
                            //"<td>" + member_data.alarm_group_id + "</td>" +
                            "<td><button class=\"btn btn-default\"" +
                            " onclick=\"locateTag(\'" + v.tag_id + "\')\">" +
                            "<img class=\"icon-image\" src=\"../image/target.png\">" +
                            "</button></td></tr>";
                    }
                });
            }
        }
        return;
    } else {
        let memberArray = [];
        for (let each in MemberList) {
            if (key == "user_id") {
                if (each == value)
                    memberArray.push(element);
            } else if (MemberList[key]) {
                if (MemberList[key] == value)
                    memberArray.push(element);
            }
        }
        memberArray.forEach(element => {
            html += "<tr>" +
                "<td>" + parseInt(element.tag_id.substring(8), 16) + "</td>" +
                "<td>" + element.number + "</td>" +
                "<td>" + element.name + "</td>" +
                "<td>" + element.dept + "</td>" +
                "<td>" + element.job_title + "</td>" +
                "<td>" + element.type + "</td>" +
                //"<td>" + memberArray[i].alarm_group_id + "</td>" +
                "<td><button class=\"btn btn-default\"" +
                " onclick=\"locateTag(\'" + element.tag_id + "\')\">" +
                "<img class=\"icon-image\" src=\"../image/target.png\">" +
                "</button></td></tr>";
        });
    }
    document.getElementById("table_sidebar_search").children[1].innerHTML = html;
}