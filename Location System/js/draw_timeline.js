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
var limitCount = 64;
var isContinue = false;
var timeDelay = {
    search: [],
    draw: "",
    model: ""
};


$(function () {
    /**
     * Check this page's permission and load navbar
     */
    var permission = getPermissionOfPage("Timeline");
    switch (permission) {
        case "":
            alert("No permission");
            history.back();
            break;
        case "R":
            break;
        case "RW":
            break;
        default:
            alert("網頁錯誤，將跳回上一頁");
            history.back();
            break;
    }
    setNavBar("Timeline", "");

    $("#timeline_dialog").dialog({
        autoOpen: false
    });

    var dialog = $("#add_target_dialog");
    dialog.dialog({
        autoOpen: false,
        height: 200,
        width: 300,
        modal: true,
        buttons: {
            Confirm: function () {
                var target_id = $("#add_target_tag_id"),
                    targrt_color = $("#add_target_color");
                target_id.removeClass("ui-state-error");
                var valid = true && checkLength(target_id, "Not null", 1, 16);
                if (valid) {
                    $("#table_target tbody").append("<tr><td><input type=\"checkbox\" name=\"chk_target_id\"" +
                        " value=\"" + target_id.val() + "\"/> " + target_id.val() + "</td>" +
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
            clearInterval(timeDelay["draw"]);
            timeDelay["draw"] = setInterval("drawNextTime()", $("#interval").val()); //計時器賦值
        });
        $(this).mouseup(function () {
            $(this).unbind('mousemove');
        });
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
    canvas.addEventListener("mousemove", handleMouseMove, false); //滑鼠在畫布中移動的座標
    canvas.addEventListener("mousewheel", handleMouseWheel, { //畫布縮放
        passive: true
    });
    canvas.addEventListener("DOMMouseScroll", handleMouseWheel, false); //畫面縮放(for Firefox)
    canvas.addEventListener('click', handleMouseClick, false); //點擊地圖上的tag，跳出tag的訊息框
    //canvas.addEventListener("dblclick", handleDblClick, false); //快速放大點擊位置

    //接收並載入Server的地圖資訊
    //取出物件所有屬性的方法，參考網址:
    //https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success == 1) {
                $("#target_map").empty();
                revObj.Values.forEach(element => {
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
    xmlHttp.send(JSON.stringify(requestArray));
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
        document.getElementById("btn_start").disabled = false;
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
    document.getElementsByName("chk_target_id").forEach(tag_id => {
        var array = historyData[tag_id.value];
        for (i = 0; i < times; i++) {
            if (typeof (array[i]).x == 'undefined')
                return;
            ctx.beginPath();
            ctx.fillStyle = '#ffffff00';
            //circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
            ctx.arc(array[i].x, array[i].y, 6, 0, Math.PI * 2, true);
            ctx.fill(); //填滿圓形
            ctx.closePath();
            if (p && ctx.isPointInPath(p.x, p.y)) {
                //如果傳入了事件坐標，就用isPointInPath判斷一下
                $(function () {
                    $("#timeline_dialog_tag_id").text(tag_id.value);
                    $("#timeline_dialog_time").text(array[i].time);
                    $("#timeline_dialog_x").text(array[i].x);
                    $("#timeline_dialog_y").text(array[i].y);
                    $("#timeline_dialog").dialog("open");
                });
            }
        }
    });
}

function getEventPosition(event) { //獲取滑鼠點擊位置
    var x, y;
    if (event.layerX || event.layerX == 0) {
        x = event.layerX;
        y = event.layerY;
    } else if (event.offsetX || event.offsetX == 0) { // Opera
        x = event.offsetX;
        y = event.offsetY;
    } //注：如果使用此方法無效的話，需要給Canvas元素的position設為absolute。
    return {
        x: x,
        y: y
    };
}

function handleMouseMove(event) { //滑鼠移動事件
    var p = getPointOnCanvas(event.pageX, event.pageY);
    lastX = p.x;
    lastY = p.y;
}

function getPointOnCanvas(x, y) { //獲取滑鼠在Canvas物件上座標
    var BCR = canvas.getBoundingClientRect();
    var pos_x = (x - BCR.left) * (canvasImg.width / BCR.width);
    var pos_y = (y - BCR.top) * (canvasImg.height / BCR.height);
    return {
        x: pos_x,
        y: pos_y
    }
}


function drawTag(dctx, id, x, y, color) {
    dctx.globalCompositeOperation = "source-over";
    dctx.beginPath();
    dctx.fillStyle = color; //'#66ccff';
    dctx.arc(x, y, 5, 0, Math.PI * 2, true); // circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
    dctx.fill(); //填滿圓形
    //dctx.strokeStyle = color; //'#0084ff';
    //dctx.stroke(); //畫圓形的線
    dctx.closePath();
}


function drawArrow(dctx, fromX, fromY, toX, toY, theta, headlen, width, color) {
    ctx.globalCompositeOperation = "destination-over";
    var deltaX = toX - fromX;
    var deltaY = toY - fromY;
    if (Math.sqrt(Math.abs(deltaX) ^ 2 + Math.abs(deltaY) ^ 2) > 5) {
        if (deltaX != 0 && deltaY != 0) {
            if (deltaX > 0) //正 
                toX -= 5 * Math.cos(1 / 12) * Zoom;
            else //負
                toX += 5 * Math.cos(1 / 12) * Zoom;
            if (deltaY > 0) //正
                toY -= 5 * Math.sin(1 / 12) * Zoom;
            else //負
                toY += 5 * Math.sin(1 / 12) * Zoom;
        } else if (deltaX != 0) {
            if (deltaX > 0) //正 
                toX -= 5 * Zoom;
            else //負
                toX += 5 * Zoom;
        } else if (deltaY != 0) {
            if (deltaY > 0) //正
                toY -= 5 * Zoom;
            else //負
                toY += 5 * Zoom;
        }
        theta = typeof (theta) != 'undefined' ? theta : 30;
        headlen = typeof (headlen) != 'undefined' ? headlen : 10;
        width = typeof (width) != 'undefined' ? width : 1;
        color = typeof (color) != 'color' ? color : '#000';
        // 计算各角度和对应的P2,P3坐标 
        var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
            angle1 = (angle + theta) * Math.PI / 180,
            angle2 = (angle - theta) * Math.PI / 180,
            topX = headlen * Math.cos(angle1),
            topY = headlen * Math.sin(angle1),
            botX = headlen * Math.cos(angle2),
            botY = headlen * Math.sin(angle2);
        dctx.save();
        dctx.beginPath();
        var arrowX = fromX - topX,
            arrowY = fromY - topY;
        dctx.moveTo(arrowX, arrowY);
        dctx.moveTo(fromX, fromY);
        dctx.lineTo(toX, toY);
        arrowX = toX + topX;
        arrowY = toY + topY;
        dctx.moveTo(arrowX, arrowY);
        dctx.lineTo(toX, toY);
        arrowX = toX + botX;
        arrowY = toY + botY;
        dctx.lineTo(arrowX, arrowY);
        dctx.strokeStyle = color;
        dctx.lineWidth = width;
        dctx.stroke();
        dctx.restore();
    } else {
        dctx.beginPath();
        dctx.moveTo(fromX, fromY);
        dctx.lineTo(toX, toY);
        dctx.strokeStyle = color;
        dctx.lineWidth = width;
        dctx.stroke();
        dctx.closePath();
    }
}

function drawTimeline() {
    if (!isContinue) {
        isContinue = true;
        if (!canvasImg.isPutImg) {
            //第一個tag_id搜尋到的歷史軌跡的第一筆的map_id, 對應的地圖資訊
            var tag_id = document.getElementsByName("chk_target_id");
            var mapInfo = mapCollection[historyData[tag_id[0].value][times].map_id];
            $("#target_map").val(mapInfo.map_id);
            loadImage(mapInfo.map_src, mapInfo.map_scale);
        }
        document.getElementById("btn_stop").disabled = false;
        document.getElementById("btn_restore").disabled = false;
        document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-pause\" ></i >";
        document.getElementById("btn_search").disabled = true;
        timeDelay["draw"] = setInterval("drawNextTime()", $("#interval").val()); //計時器賦值
    } else {
        isContinue = false;
        document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i >";
        clearInterval(timeDelay["draw"]);
    }
}

function stopTimeline() {
    times = 0;
    isContinue = false;
    clearInterval(timeDelay["draw"]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i >";
    document.getElementById("btn_stop").disabled = true;
    document.getElementById("btn_search").disabled = false;
}

function drawNextTime() {
    var target_ids = document.getElementsByName("chk_target_id");
    if (isContinue && target_ids.length > 0) {
        if (times == 0) {
            target_ids.forEach(function (tag_id, i) {
                var color = document.getElementsByName("input_target_color")[i].value;
                var array = historyData[tag_id.value];
                if (!array) {
                    alert("資料錯誤或是目標tag有變動，請重新搜尋!");
                    return false;
                }
                if (array[0].map_id == $("#target_map").val()) {
                    drawTag(ctx, array[0].time, array[0].x, canvasImg.height - array[0].y, color);
                    document.getElementById("position").innerText = array[0].map_name;
                    document.getElementById("draw_time").innerText = array[0].time;
                    document.getElementById("draw_x").innerText = array[0].x;
                    document.getElementById("draw_y").innerText = array[0].y;
                }
            });
            times++;
        } else if (times < max_times) {
            target_ids.forEach(function (tag_id, i) {
                var color = document.getElementsByName("input_target_color")[i].value;
                var array = historyData[tag_id.value];
                if (!array)
                    return false;
                if (array[0].map_id == $("#target_map").val() && array[times]) {
                    reDrawTag(ctx);
                    drawArrow(ctx, array[times - 1].x, canvasImg.height - array[times - 1].y,
                        array[times].x, canvasImg.height - array[times].y, 30, 8, 2, color);
                    drawTag(ctx, array[times].time, array[times].x, canvasImg.height - array[times].y);
                    document.getElementById("position").innerText = array[times].map_name;
                    document.getElementById("draw_time").innerText = array[times].time;
                    document.getElementById("draw_x").innerText = array[times].x;
                    document.getElementById("draw_y").innerText = array[times].y;
                }
            });
            times++;
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            times = 0;
        }
    }
}

function reDrawTag(dctx) {
    var locate_map = document.getElementById("target_map").value;
    setSize();
    document.getElementsByName("chk_target_id").forEach(function (tag_id, i) {
        var color = document.getElementsByName("input_target_color")[i].value;
        var array = historyData[tag_id.value];
        if (!array)
            return false;
        var k = 0;
        if (times > limitCount)
            k = times - limitCount;
        for (i = k; i < times; i++) {
            if (array[i].map_id != locate_map)
                return false;
            else if (i == 0)
                drawTag(dctx, array[0].time, array[0].x, canvasImg.height - array[0].y, color);
            else {
                drawArrow(dctx, array[i - 1].x, canvasImg.height - array[i - 1].y, array[i].x,
                    canvasImg.height - array[i].y, 30, 8, 2, color);
                drawTag(dctx, array[i].time, array[i].x, canvasImg.height - array[i].y, color);
            }
        }
    });
}

function search() {
    var target_ids = document.getElementsByName("chk_target_id");
    if (target_ids.length == 0) {
        alert("請先新增至少一個目標Tag!");
        return;
    }
    stopTimeline();
    var startDate = new Date($("#start_date").val() + 'T' + checkTimeLength($("#start_time").val()));
    var endDate = new Date($("#end_date").val() + 'T' + checkTimeLength($("#end_time").val()));
    if (endDate - startDate > 86400000 * 7) { //86400000 = 一天的毫秒數
        if (!confirm($.i18n.prop('i_alertTimeTooLong')))
            return false;
    }
    historyData = [];
    for (i in timeDelay.search)
        clearTimeout(timeDelay.search[i]);
    showSearching();
    target_ids.forEach(function (tag_id, i) {
        timeDelay.search.push(
            setTimeout(function () {
                getTimeline({
                    "Command_Type": ["Read"],
                    "Command_Name": ["GetLocus_combine_hour"],
                    "Value": {
                        "tag_id": tag_id.value,
                        "start_date": $("#start_date").val(),
                        "start_time": checkTimeLength($("#start_time").val()),
                        "end_date": $("#end_date").val(),
                        "end_time": checkTimeLength($("#end_time").val())
                    }
                });
            }, 100 * i)
        );
    });
}



function getTimeline(request) {
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var revInfo = ('Values' in revObj) == true ? revObj.Values : [];
            if (revObj.success == 1) {
                for (i = 0; i < revInfo.length; i++) {
                    if (revInfo[i].map_id in mapCollection) {
                        var mapInfo = mapCollection[revInfo[i].map_id];
                        if (!historyData[request.Value.tag_id])
                            historyData[request.Value.tag_id] = [];

                        historyData[request.Value.tag_id].push({
                            map_id: mapInfo.map_id,
                            map_name: mapInfo.map_name,
                            x: parseInt(revInfo[i].coordinate_x, 10),
                            y: parseInt(revInfo[i].coordinate_y, 10),
                            time: revInfo[i].time
                        });
                    }
                }
                if (revObj.Status == 1) {
                    //以1小時為基準，分批接受並傳送要求
                    getTimeline({
                        "Command_Type": ["Read"],
                        "Command_Name": ["GetLocus_combine_hour"],
                        "Value": {
                            "tag_id": revObj.tag_id,
                            "start_date": revObj.start_date,
                            "start_time": revObj.start_time,
                            "end_date": revObj.end_date,
                            "end_time": revObj.end_time
                        }
                    });
                } else {
                    if (historyData[request.Value.tag_id] && historyData[request.Value.tag_id].length > max_times)
                        max_times = historyData[request.Value.tag_id].length;
                    completeSearch();
                }
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function checkTimeLength(time) {
    if (time.length < 6)
        time += ":00";
    else
        time = time;
    return time;
}

function locateTag(tag_id) {
    if (historyData[tag_id])
        changeFocusMap(historyData[tag_id][times].map_id);
    else
        alert("資料錯誤，請重新搜尋或刷新頁面");
}

function changeFocusMap(map_id) {
    if (map_id == "")
        alert("此地圖不存在");
    else if (map_id != $("#target_map").val()) {
        if (map_id in mapCollection) {
            $("#target_map").val(map_id);
            var mapInfo = mapCollection[map_id];
            loadImage(mapInfo.map_src, mapInfo.map_scale);
        }
    }
}

/**
 * Show Search Model
 */

function showSearching() {
    $('#myModal').modal('show');
    timeDelay["model"] = setTimeout(function () {
        $('#myModal').modal('hide');
        clearTimeout(timeDelay["model"]);
    }, 10000);
}

function completeSearch() {
    $('#myModal').modal('hide');
    clearTimeout(timeDelay["model"]);
    document.getElementById("btn_start").disabled = false;
    alert($.i18n.prop('i_searchOver'));
}