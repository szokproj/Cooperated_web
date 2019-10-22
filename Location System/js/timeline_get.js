var token = "";
var PIXEL_RATIO; // 獲取瀏覽器像素比
var cvsBlock, canvas, ctx;
var canvasImg = {
    isPutImg: false,
    width: 0,
    height: 0,
    scale: 1 //預設比例尺為1:1
};
var serverImg = new Image();
// View parameters
var lastX = 0; //滑鼠最後位置的X座標
var lastY = 0; //滑鼠最後位置的Y座標
var xleftView = 0; //canvas的X軸位移(負值向左，正值向右)
var ytopView = 0; //canvas的Y軸位移(負值向上，正值向下)
var Zoom = 1.0; //縮放比例
var isFitWindow = true;
var map_id = "";
var mapCollection = {};
var historyData = {};
var times = 0;
var max_times = 0;
var isContinue = false;
var timeDelay = {
    search: [],
    draw: [],
    model: ""
};
var group_color = "#ff9933";
var timeslot_array = [];
var locate_tag = "";

$(function () {
    //Check this page's permission and load navbar
    token = getUser() ? getUser().api_token : "";
    if (!getPermissionOfPage("Timeline")) {
        alert("Permission denied!");
        window.location.href = '../index.html';
    }
    setNavBar("Timeline", "");

    $("#timeline_dialog").dialog({
        autoOpen: false
    });

    var dialog = $("#add_target_dialog");
    dialog.dialog({
        autoOpen: false,
        height: 180,
        width: 300,
        modal: true,
        buttons: {
            Confirm: function () {
                var target_id = $("#add_target_tag_id"),
                    targrt_color = $("#add_target_color");
                target_id.removeClass("ui-state-error");
                var valid = true && checkLength(target_id, $.i18n.prop('i_targetIdLangth'), 1, 16);
                if (valid) {
                    $("#table_target tbody").append("<tr><td><input type=\"checkbox\" name=\"chk_target_id\"" +
                        " value=\"" + fullOf4Byte(target_id.val()) + "\"/> " + target_id.val() + "</td>" +
                        "<td><input type=\"color\" name=\"input_target_color\" value=\"" + targrt_color.val() + "\" /></td>" +
                        "<td><button class=\"btn btn-default btn-focus\" onclick=\"locateTag(\'" + target_id.val() +
                        "\')\"><img class=\"icon-image\" src=\"../image/target.png\"></button></td></tr>");
                    dialog.dialog("close");
                }
            },
            Cancel: function () {
                dialog.dialog("close");
            }
        }
    });
    $("#btn_target_add").on('click', function () {
        stopTimeline();
        $("#add_target_tag_id").val("");
        $("#add_target_color").val("#00cc66");
        dialog.dialog("open");
    });
    $("#btn_target_delete").on('click', function () {
        stopTimeline();
        var save_array = [];
        $("input[name='chk_target_id']").each(function (i, tag_id) {
            if (!$(this).prop("checked"))
                save_array.push($(this).parents("tr").html());
        });
        $("#table_target tbody").empty();
        save_array.forEach(html => {
            $("#table_target tbody").append("<tr>" + html + "</tr>");
        });
    });

    $('#myModal').modal({
        backdrop: false,
        show: false
    });

    $("#canvas").on("mousedown", function (e) {
        e.preventDefault();
        var canvas_left = parseInt($("#canvas").css("margin-left"));
        var canvas_top = parseInt($("#canvas").css("margin-top"));
        var downx = e.pageX;
        var downy = e.pageY;
        $("#canvas").on("mousemove", function (es) {
            xleftView = es.pageX - downx + canvas_left;
            ytopView = es.pageY - downy + canvas_top;
            $("#canvas").css("margin-left", xleftView + "px").css("margin-top", ytopView + "px");
        });
        $("#canvas").on("mouseup", function () {
            $("#canvas").off("mousemove");
        });
    });

    //調整間隔時間的滑塊條
    $("#interval_slider").slider({
        value: 100,
        min: 0,
        max: 1000,
        step: 20,
        slide: function (event, ui) {
            $("#interval").val(ui.value);
        }
    });
    $("#interval").val($("#interval_slider").slider("value"));

    $("#interval_slider").mousedown(function () {
        $(this).mousemove(function () {
            clearDrawInterval();
            if (historyData["search_type"] && historyData["search_type"] == "Tag") {
                timeDelay["draw"].push(setInterval("drawNextTimeByTag()", $("#interval").val()));
            } else {
                timeDelay["draw"].push(setInterval("drawNextTimeByGroup()", $("#interval").val()));
            }
        });
        $(this).mouseup(function () {
            $(this).unbind('mousemove');
        });
    });

    $("#target_type").on('change', function () {
        if ($(this).val() == "Tag") {
            $("#target_group").hide();
            $("#target_alarm_handle").hide();
            $("#target_tag").show();
            $("#alarmBlock").hide();
            $("#cvsBlock").show();
        } else if ($(this).val() == "Group") {
            $("#target_tag").hide();
            $("#target_alarm_handle").hide();
            $("#target_group").show();
            $("#alarmBlock").hide();
            $("#cvsBlock").show();
        } else {
            $("#target_tag").hide();
            $("#target_group").hide();
            $("#target_alarm_handle").show();
            $("#cvsBlock").hide();
            $("#alarmBlock").show();
        }
    });

    $("#btn_resst_locate_tag").on('click', function () {
        changeLocateTag("");
    });

    $("input[name=radio_is_limit]").on("change", function () {
        if ($(this).prop('checked'))
            $("#limit_count").prop('disabled', $(this).val());
    });

    setup();
});

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
    canvas.addEventListener("DOMMouseScroll", handleMouseWheel, false); //畫面縮放(for Firefox)
    canvas.addEventListener('click', handleMouseClick, false); //點擊地圖上的tag，跳出tag的訊息框
    canvas.addEventListener("mousemove", handleMouseMove, false); //滑鼠在畫布中移動的座標
    canvas.addEventListener("mousewheel", handleMouseWheel, { //畫布縮放
        passive: true
    });
    /**
     * 接收並載入Server的地圖資訊
     * 取出物件所有屬性的方法，參考網址: 
     * https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
     */
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                $("#target_map").empty();
                revObj.Value[0].Values.forEach(element => {
                    //mapCollection => key: map_id | value: {map_id, map_name, map_src, map_scale}
                    mapCollection[element.map_id] = {
                        map_id: element.map_id,
                        map_name: element.map_name,
                        map_src: "data:image/" + element.map_file_ext + ";base64," + element.map_file,
                        map_scale: element.map_scale
                    }
                    $("#target_map").append("<option value=\"" + element.map_id + "\">" + element.map_name + "</option>");
                });
                $("#target_map").on('change', function () {
                    var mapInfo = mapCollection[$(this).val()];
                    loadImage(mapInfo.map_src, mapInfo.map_scale);
                    restartCanvas();
                });
            }
        }
    };
    xmlHttp.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"],
        "api_token": [token]
    }));
}

function loadImage(map_url, map_scale) {
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
        var cvs_width = parseFloat($("#cvsBlock").css("width"));
        var cvs_height = parseFloat($("#cvsBlock").css("height"));
        var cvsSize = cvs_width / cvs_height;
        if (serImgSize > cvsSize) { //原圖比例寬邊較長
            Zoom = cvs_width / serverImg.width;
            setCanvas(this.src, cvs_width, serverImg.height * Zoom);
        } else {
            Zoom = cvs_height / serverImg.height;
            setCanvas(this.src, serverImg.width * Zoom, cvs_height);
        }
        reDrawTag(ctx);
        document.getElementById("btn_restore").disabled = false;
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

function restoreCanvas() {
    if (!canvasImg.isPutImg)
        return;
    $(function () {
        var cvsBlock_width = parseFloat($("#cvsBlock").css("width"));
        var cvsBlock_height = parseFloat($("#cvsBlock").css("height"));
        xleftView = 0;
        ytopView = 0;
        Zoom = 1.0;
        if (isFitWindow) { //恢復原比例
            ctx.restore();
            ctx.save();
            isFitWindow = false; //目前狀態:原比例
            document.getElementById("btn_restore").innerHTML = "<i class=\"fas fa-expand\"></i>";
        } else { //依比例拉伸(Fit in Window)
            if ((serverImg.width / serverImg.height) > (cvsBlock_width / cvsBlock_height)) //原圖比例寬邊較長
                Zoom = cvsBlock_width / serverImg.width;
            else
                Zoom = cvsBlock_height / serverImg.height;
            isFitWindow = true; //目前狀態:依比例拉伸
            document.getElementById("btn_restore").innerHTML = "<i class=\"fas fa-compress\"></i>";
        }
        $("#canvas").css("margin-left", 0 + "px").css("margin-top", 0 + "px");
        reDrawTag(ctx);
    });
}

function restartCanvas() {
    $(function () {
        var cvsBlock_width = parseFloat($("#cvsBlock").css("width"));
        var cvsBlock_height = parseFloat($("#cvsBlock").css("height"));
        xleftView = 0;
        ytopView = 0;
        if ((serverImg.width / serverImg.height) > (cvsBlock_width / cvsBlock_height)) //原圖比例寬邊較長
            Zoom = cvsBlock_width / serverImg.width;
        else
            Zoom = cvsBlock_height / serverImg.height;
        $("#canvas").css("margin-left", 0 + "px").css("margin-top", 0 + "px");
        reDrawTag(ctx);
    });
}

function handleMouseWheel(event) {
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
    reDrawTag(ctx);
    xleftView += pos_x - lastX * Zoom; //滑鼠滾動的位置-縮放後滑鼠位移後的位置(X軸)
    ytopView += pos_y - lastY * Zoom; //滑鼠滾動的位置-縮放後滑鼠位移後的位置(Y軸)
    $("#canvas").css("margin-left", xleftView + "px").css("margin-top", ytopView + "px");
}

function handleMouseClick(event) {
    var p = getEventPosition(event); //滑鼠點擊事件
    switch ($("#target_type").val()) {
        case "Tag":
            document.getElementsByName("chk_target_id").forEach(tag_id => {
                var array = historyData[tag_id.value];
                for (i = 0; i < times; i++) {
                    if (typeof (array[i]).x == 'undefined') return;
                    ctx.beginPath();
                    ctx.fillStyle = '#ffffff00';
                    //circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
                    ctx.arc(array[i].x, canvasImg.height - array[i].y, 6, 0, Math.PI * 2, true);
                    ctx.fill(); //填滿圓形
                    ctx.closePath();
                    if (p && ctx.isPointInPath(p.x, p.y)) {
                        //如果傳入了事件坐標，就用isPointInPath判斷一下
                        $("#timeline_dialog_tag_id").text(tag_id.value);
                        $("#timeline_dialog_time").text(array[i].time);
                        $("#timeline_dialog_x").text(array[i].x);
                        $("#timeline_dialog_y").text(array[i].y);
                        $("#timeline_dialog").dialog("open");
                    }
                }
            });
            break;
        case "Group":
            var start = 0;
            if (!document.getElementById("chk_is_overlap").checked && times > 0)
                start = times - 1;
            for (i = start; i < times; i++) {
                historyData[timeslot_array[i]].forEach(info => {
                    if (typeof (info).x == 'undefined') return;
                    ctx.beginPath();
                    ctx.fillStyle = '#ffffff00';
                    ctx.arc(info.x, canvasImg.height - info.y, 6, 0, Math.PI * 2, true);
                    ctx.fill();
                    ctx.closePath();
                    if (p && ctx.isPointInPath(p.x, p.y)) {
                        $("#timeline_dialog_tag_id").text(info.tag_id);
                        $("#timeline_dialog_time").text(info.time);
                        $("#timeline_dialog_x").text(info.x);
                        $("#timeline_dialog_y").text(info.y);
                        $("#timeline_dialog").dialog("open");
                    }
                });
            }
            break;
        default:
            alert($.i18n.prop('i_noSearch'));
            return false;
    }
}

function handleMouseMove(event) { //滑鼠移動事件
    var p = getPointOnCanvas(event.pageX, event.pageY);
    lastX = p.x;
    lastY = p.y;
}

function drawTimeline() {
    if (!isContinue) {
        if (!historyData["search_type"])
            return alert($.i18n.prop('i_searchFirst'));
        isContinue = true;
        document.getElementById("btn_stop").disabled = false;
        document.getElementById("btn_restore").disabled = false;
        document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-pause\" ></i >";
        document.getElementById("btn_search").disabled = false;
        switch (historyData["search_type"]) {
            case "Tag":
                if (!canvasImg.isPutImg) {
                    //第一個tag_id搜尋到的歷史軌跡的第一筆的map_id, 對應的地圖資訊
                    var tag_id = document.getElementsByName("chk_target_id");
                    var mapInfo = mapCollection[historyData[tag_id[0].value][times].map_id];
                    $("#target_map").val(mapInfo.map_id);
                    loadImage(mapInfo.map_src, mapInfo.map_scale);
                }
                timeDelay["draw"].push(setInterval("drawNextTimeByTag()", $("#interval").val())); //計時器賦值
                break;
            case "Group":
                if (!canvasImg.isPutImg) {
                    //第一個timeslot搜尋到的歷史軌跡的第一筆的map_id, 對應的地圖資訊
                    var mapInfo = mapCollection[historyData[timeslot_array[0]][times].map_id];
                    $("#target_map").val(mapInfo.map_id);
                    loadImage(mapInfo.map_src, mapInfo.map_scale);
                }
                timeDelay["draw"].push(setInterval("drawNextTimeByGroup()", $("#interval").val())); //計時器賦值
                break;
            default:
                break;
        }
    } else {
        isContinue = false;
        document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i >";
        clearDrawInterval();
    }
}

function stopTimeline() {
    times = 0;
    isContinue = false;
    clearDrawInterval();
    setSize();
    document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i >";
    document.getElementById("btn_stop").disabled = true;
    document.getElementById("btn_search").disabled = false;
}

function drawNextTimeByTag() {
    if (!isContinue)
        return false;
    var locate_map = document.getElementById("target_map").value;
    if (times == 0) {
        document.getElementsByName("chk_target_id").forEach(function (tag_id, i) {
            var color = document.getElementsByName("input_target_color")[i].value;
            var array = historyData[tag_id.value];
            if (!array) return alert($.i18n.prop('i_targetTagChange'));
            if (array[0] && array[0].map_id == locate_map) {
                drawTag(ctx, array[0].time, array[0].x, canvasImg.height - array[0].y, color);
                document.getElementById("position").innerText = array[0].map_name;
                document.getElementById("draw_time").innerText = array[0].time;
                document.getElementById("draw_x").innerText = array[0].x;
                document.getElementById("draw_y").innerText = array[0].y;
            }
        });
        times++;
    } else if (times < max_times) {
        reDrawTag(ctx);
        document.getElementsByName("chk_target_id").forEach(function (tag_id, i) {
            //var color = document.getElementsByName("input_target_color")[i].value;
            var array = historyData[tag_id.value];
            if (!array) return false;
            if (array[times] && array[times].map_id == locate_map) {
                drawArrow(ctx, array[times - 1].x, canvasImg.height - array[times - 1].y,
                    array[times].x, canvasImg.height - array[times].y, 30, 8, 2, "#000000");
                drawTag(ctx, array[times].time, array[times].x, canvasImg.height - array[times].y, "#000000");
                document.getElementById("position").innerText = array[times].map_name;
                document.getElementById("draw_time").innerText = array[times].time;
                document.getElementById("draw_x").innerText = array[times].x;
                document.getElementById("draw_y").innerText = array[times].y;
            }
        });
        times++;
    } else {
        if (confirm($.i18n.prop('i_endOfPlay'))) {
            setSize();
            times = 0;
        } else {
            isContinue = false;
            document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i >";
            clearDrawInterval();
        }
    }
}

function drawNextTimeByGroup() {
    if (!isContinue) return false;
    if (times == timeslot_array.length) {
        if (confirm($.i18n.prop('i_endOfPlay'))) {
            setSize();
            times = 0;
        } else {
            isContinue = false;
            document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i >";
            clearDrawInterval();
        }
    } else {
        if (!document.getElementById("chk_is_overlap").checked)
            setSize();
        if (locate_tag == "") {
            historyData[timeslot_array[times]].forEach(info => {
                drawTag(ctx, info.time, info.x, canvasImg.height - info.y, group_color);
            });
        } else {
            reDrawTag(ctx);
        }
        document.getElementById("position").innerText = historyData[timeslot_array[times]][0].map_name;
        document.getElementById("draw_time").innerText = timeslot_array[times];
        times++;
    }
}

function reDrawTag(dctx) {
    setSize();
    switch (historyData["search_type"]) {
        case "Tag":
            var locate_map = document.getElementById("target_map").value;
            var k = 0;
            if (document.getElementsByName("radio_is_limit")[1].checked) {
                var limitCount = document.getElementById("limit_count").value;
                if (limitCount != "" && times > limitCount)
                    k = times - limitCount;
            }
            document.getElementsByName("chk_target_id").forEach(function (tag_id, i) {
                var color = document.getElementsByName("input_target_color")[i].value;
                var array = historyData[tag_id.value];
                if (!array) return false;
                for (i = k; i < times; i++) {
                    if (array[i] && array[i].map_id == locate_map) {
                        if (i > 0)
                            drawArrow(dctx, array[i - 1].x, canvasImg.height - array[i - 1].y,
                                array[i].x, canvasImg.height - array[i].y, 30, 8, 2, color);
                        drawTag(dctx, array[i].time, array[i].x, canvasImg.height - array[i].y, color);
                    }
                }
            });
            break;
        case "Group":
            var locate_arr = [];
            var start = 0;
            if (!document.getElementById("chk_is_overlap").checked && times > 0)
                start = times - 1;
            for (i = start; i < times; i++) {
                historyData[timeslot_array[i]].forEach(info => {
                    if (info.tag_id == locate_tag)
                        locate_arr.push(info);
                    else
                        drawTag(ctx, info.time, info.x, canvasImg.height - info.y, group_color);
                });
            }
            locate_arr.forEach(info => {
                drawTag(ctx, info.time, info.x, canvasImg.height - info.y, "#9c00f7");
            });
            break;
        default:
            break;
    }

}

function search() {
    if ($("#target_type").val() == "AlarmHandle") {
        return getAlarmHandleByTime();
    }
    stopTimeline();
    var datetime_start = Date.parse($("#start_date").val() + " " + $("#start_time").val());
    var datetime_end = Date.parse($("#end_date").val() + " " + $("#end_time").val());
    if (datetime_end - datetime_start < 60000) {
        return alert($.i18n.prop('i_alertTimeTooShort'));
    } else if (datetime_end - datetime_start > 86400000 * 7) { //86400000 = 一天的毫秒數
        if (!confirm($.i18n.prop('i_alertTimeTooLong')))
            return false;
    }
    switch ($("#target_type").val()) {
        case "Tag":
            var target_ids = document.getElementsByName("chk_target_id");
            if (target_ids.length == 0) {
                alert($.i18n.prop('i_searchNoTag'));
                return false;
            }
            historyData = {
                search_type: "Tag"
            };
            getTimelineByTags();
            break;
        case "Group":
            var group_id = $("#target_group_id").val();
            if (group_id.length == 0) {
                alert($.i18n.prop('i_searchNoGroup'));
                return false;
            }
            timeslot_array = [];
            historyData = {
                search_type: "Group"
            };
            getTimelineByGroup(datetime_start, datetime_end, group_id);
            break;
        default:
            alert($.i18n.prop('i_searchNoType'));
            return false;
    }
    showSearching();
}

function getTimelineByTags() {
    var interval_times = 0;
    var count_times = 0;
    for (i in timeDelay["search"])
        clearTimeout(timeDelay["search"][i]);
    timeDelay["search"] = [];
    document.getElementsByName("chk_target_id").forEach(function (tag_id, i) {
        interval_times++;
        timeDelay["search"].push(setTimeout(function () {
            sendRequest({
                "Command_Type": ["Read"],
                "Command_Name": ["GetLocus_combine_hour"],
                "Value": {
                    "tag_id": tag_id.value,
                    "start_date": $("#start_date").val(),
                    "start_time": checkTimeLength($("#start_time").val()),
                    "end_date": $("#end_date").val(),
                    "end_time": checkTimeLength($("#end_time").val())
                },
                "api_token": [token]
            });
        }, 100 * i));
    });
    inputWaitTime(interval_times);

    function sendRequest(request) {
        var xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                    var revInfo = revObj.Value[0].Values || [];
                    var tag_id = request.Value.tag_id;
                    for (i = 0; i < revInfo.length; i++) {
                        if (revInfo[i].map_id in mapCollection) {
                            var mapInfo = mapCollection[revInfo[i].map_id];
                            if (!historyData[tag_id])
                                historyData[tag_id] = [];
                            historyData[tag_id].push({
                                map_id: mapInfo.map_id,
                                map_name: mapInfo.map_name,
                                x: parseInt(revInfo[i].coordinate_x, 10),
                                y: parseInt(revInfo[i].coordinate_y, 10),
                                time: revInfo[i].time
                            });
                        }
                    }
                    if (revObj.Value[0].Status == "1") {
                        //以1小時為基準，分批接受並傳送要求
                        sendRequest({
                            "Command_Type": ["Read"],
                            "Command_Name": ["GetLocus_combine_hour"],
                            "Value": {
                                "tag_id": revObj.Value[0].tag_id,
                                "start_date": revObj.Value[0].start_date,
                                "start_time": revObj.Value[0].start_time,
                                "end_date": revObj.Value[0].end_date,
                                "end_time": revObj.Value[0].end_time
                            },
                            "api_token": [token]
                        });
                    } else {
                        count_times++;
                        if (historyData[tag_id] && historyData[tag_id].length > max_times)
                            max_times = historyData[tag_id].length;
                        $("#progress_bar").text(Math.round(count_times / interval_times * 100) + " %");
                        if (interval_times <= count_times)
                            completeSearch();
                    }
                }
            }
        };
        xmlHttp.send(JSON.stringify(request));
    }
}

function getTimelineByGroup(datetime_start, datetime_end, group_id) {
    var timeslot = datetime_end - datetime_start;
    var interval_times = Math.ceil(timeslot / 60000); //間隔多少分鐘(無條件進位)
    var count_times = 0;
    var tag_array = [];
    var group_map = {
        id: "",
        name: ""
    };
    var getMapGroup = createJsonXmlHttp("sql");
    getMapGroup.onreadystatechange = function () {
        if (getMapGroup.readyState == 4 || getMapGroup.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                var revInfo = revObj.Value[0].Values || [];
                var index = revInfo.findIndex(function (info) {
                    return info.group_id == group_id;
                });
                if (!mapCollection[revInfo[index].map_id])
                    return false;
                group_map.id = revInfo[index].map_id;
                group_map.name = mapCollection[revInfo[index].map_id].map_name;
                var start_datetime = new Date(datetime_start)
                    .format("yyyy-MM-dd hh:mm:ss").split(" ");
                var end_datetime = new Date(datetime_start + 60000)
                    .format("yyyy-MM-dd hh:mm:ss").split(" ");
                sendRequest({
                    "Command_Type": ["Read"],
                    "Command_Name": ["GetLocus_combine_group"],
                    "Value": {
                        "group_id": group_id,
                        "start_date": start_datetime[0],
                        "start_time": start_datetime[1],
                        "end_date": end_datetime[0],
                        "end_time": end_datetime[1]
                    },
                    "api_token": [token]
                });
            }
        }
    };
    getMapGroup.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps_Groups"],
        "api_token": [token]
    }));
    inputWaitTime(interval_times);

    function sendRequest(request) {
        var xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                    var revInfo = revObj.Value[0].Values || [];
                    for (i = 0; i < revInfo.length; i++) {
                        //改成按照時間分類排序
                        var time_arr = (revInfo[i].time.split(" ")[1]).split(":");
                        var second = Math.floor(parseFloat(time_arr[2]));
                        var time = time_arr[0] + ":" + time_arr[1] + ":" +
                            (second < 10 ? "0" + second : second);
                        if (!historyData[time]) {
                            timeslot_array.push(time);
                            historyData[time] = [];
                        }
                        var index = tag_array.indexOf(revInfo[i].tag_id);
                        if (index == -1)
                            tag_array.push(revInfo[i].tag_id);
                        var repeat = historyData[time].findIndex(function (info) {
                            return info.tag_id == revInfo[i].tag_id;
                        });
                        if (repeat == -1) {
                            historyData[time].push({
                                tag_id: revInfo[i].tag_id,
                                map_id: group_map.id,
                                map_name: group_map.name,
                                x: parseInt(revInfo[i].coordinate_x, 10),
                                y: parseInt(revInfo[i].coordinate_y, 10),
                                time: revInfo[i].time
                            });
                        }
                    }
                    count_times++
                    $("#progress_bar").text(Math.round(count_times / interval_times * 100) + " %");
                    if (interval_times > count_times) {
                        var start_datetime = new Date(datetime_start + 60000 * count_times)
                            .format("yyyy-MM-dd hh:mm:ss").split(" ");
                        var end_datetime = new Date(datetime_start + 60000 * (count_times + 1))
                            .format("yyyy-MM-dd hh:mm:ss").split(" ");
                        //以1分鐘為基準，分批接受並傳送要求
                        sendRequest({
                            "Command_Type": ["Read"],
                            "Command_Name": ["GetLocus_combine_group"],
                            "Value": {
                                "group_id": group_id,
                                "start_date": start_datetime[0],
                                "start_time": start_datetime[1],
                                "end_date": end_datetime[0],
                                "end_time": end_datetime[1]
                            },
                            "api_token": [token]
                        });
                    } else {
                        $("#table_tag_list tbody").empty();
                        tag_array.forEach(tag_id => {
                            $("#table_tag_list tbody").append(
                                "<tr><td><label name=\"tag_list_id\">" + tag_id + "</label></td>" +
                                "<td><button class=\"btn btn-default btn-focus\" onclick=\"changeLocateTag(\'" + tag_id +
                                "\')\"><img class=\"icon-image\" src=\"../image/target.png\"></button></td></tr>"
                            );
                        });
                        completeSearch();
                    }
                }
            }
        };
        xmlHttp.send(JSON.stringify(request));
    }
}

function changeLocateTag(tag_id) {
    locate_tag = tag_id;
    reDrawTag(ctx);
}

function locateTag(tag_id) {
    if (historyData[tag_id])
        changeFocusMap(historyData[tag_id][times].map_id);
    else
        alert($.i18n.prop('i_searchError'));
}

function changeFocusMap(map_id) {
    if (map_id == "")
        alert($.i18n.prop('i_mapAlert_19'));
    else if (map_id != $("#target_map").val()) {
        if (map_id in mapCollection) {
            $("#target_map").val(map_id);
            var mapInfo = mapCollection[map_id];
            loadImage(mapInfo.map_src, mapInfo.map_scale);
        }
    }
}

function clearDrawInterval() {
    for (i in timeDelay["draw"])
        clearInterval(timeDelay["draw"][i]);
    timeDelay["draw"] = [];
}


function getAlarmHandleByTime() {
    var getStaff = createJsonXmlHttp("sql");
    getStaff.onreadystatechange = function () {
        if (getStaff.readyState == 4 || getStaff.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                var MemberList = {};
                var revInfo = revObj.Value[0].Values || [];
                revInfo.forEach(element => {
                    MemberList[element.tag_id] = element;
                });
                var xmlHttp = createJsonXmlHttp("alarmhandle");
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0]) {
                            var revInfo = revObj.Value[0].Values;
                            if (revObj.Value[0].success == 0 || !revInfo || revInfo.length == 0)
                                return alert($.i18n.prop('i_searchNoData'));

                            $("#table_alarm_handle tbody").empty();
                            for (var i = 0; i < revInfo.length; i++) {
                                var tag_id = revInfo[i].tagid;
                                var number = tag_id in MemberList ? MemberList[tag_id].number : "";
                                var name = tag_id in MemberList ? MemberList[tag_id].Name : "";
                                $("#table_alarm_handle tbody").prepend("<tr><td>" + (revInfo.length - i) +
                                    "</td><td>" + revInfo[i].alarmtype +
                                    "</td><td>" + parseInt(tag_id.substring(8), 16) +
                                    "</td><td>" + number +
                                    "</td><td>" + name +
                                    "</td><td>" + revInfo[i].alarmhelper +
                                    "</td><td>" + revInfo[i].endtime +
                                    "</td></tr>");
                            }

                        }
                    }
                };
                xmlHttp.send(JSON.stringify({
                    "Command_Type": ["Read"],
                    "Command_Name": ["gethandlerecordbytime"],
                    "Value": [{
                        "start_date": $("#start_date").val(),
                        "start_time": checkTimeLength($("#start_time").val()),
                        "end_date": $("#end_date").val(),
                        "end_time": checkTimeLength($("#end_time").val())
                    }],
                    "api_token": [token]
                }));
            }
        }
    };
    getStaff.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetStaffs"],
        "api_token": [token]
    }));
}


/**
 * Show Search Model
 */
function showSearching() {
    $('#myModal').modal('show');
    $("#progress_bar").text(0 + " %");
    timeDelay["model"] = setTimeout(function () {
        $('#myModal').modal('hide');
        clearTimeout(timeDelay["model"]);
    }, 3600000);
}

function completeSearch() {
    $('#myModal').modal('hide');
    clearTimeout(timeDelay["model"]);
    alert($.i18n.prop('i_searchOver'));
    var num = Object.keys(historyData).length;
    if (num <= 1)
        alert($.i18n.prop('i_searchNoData'));
}

function inputWaitTime(interval_times) {
    var sec = interval_times * 1.3;
    if (sec > 3600)
        $("#wait_time").text($.i18n.prop('i_estimatedTime') + Math.ceil(sec / 3600) + $.i18n.prop('i_hour') +
            Math.ceil((sec % 3600) / 60) + $.i18n.prop('i_minute') + Math.ceil(sec % 60) + $.i18n.prop('i_second'));
    else if (sec > 60)
        $("#wait_time").text($.i18n.prop('i_estimatedTime') + Math.ceil(sec / 60) + $.i18n.prop('i_minute') +
            Math.ceil(sec % 60) + $.i18n.prop('i_second'));
    else
        $("#wait_time").text($.i18n.prop('i_estimatedTime') + Math.ceil(sec) + $.i18n.prop('i_second'));
}

function fullOf4Byte(id) {
    id = parseInt(id).toString(16).toUpperCase();
    var length = id.length;
    if (length > 0 && length < 9) {
        for (i = 0; i < 8 - length; i++) {
            id = "0" + id;
        }
        return id;
    } else {
        return "";
    }
}