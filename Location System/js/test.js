var PIXEL_RATIO; // 獲取瀏覽器像素比
var cvsBlock, canvas, ctx;
var serverImg = new Image();
var canvasImg = {
    isPutImg: false,
    width: 0,
    height: 0,
    scale: 1 //預設比例尺為1:1
};
var map_id = "";
var mapCollection = {};

// View parameters
var lastX = 0; //滑鼠最後位置的X座標
var lastY = 0; //滑鼠最後位置的Y座標
var xleftView = 0; //canvas的X軸位移(負值向左，正值向右)
var ytopView = 0; //canvas的Y軸位移(負值向上，正值向下)
var zoomOriginal = 1.0;
var Zoom = zoomOriginal; //縮放比例
var fitZoom = 1;
var isFitWindow = true;
var second = 100;
var timeDelay = {
    search: [],
    draw: ""
};


var timeline = null;
var token = "";



$(function () {
    /**
     * Check this page's permission and load navbar
     */
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
    canvas.addEventListener('click', handleMouseClick, false); //點擊地圖上的tag，跳出tag的訊息框
    canvas.addEventListener("mousemove", handleMouseMove, false); //滑鼠在畫布中移動的座標
    canvas.addEventListener("mousewheel", handleMouseWheel, false); //畫布縮放
    cvsBlock.addEventListener("mousewheel", handleMouseWheel, false); // 畫面縮放
    cvsBlock.addEventListener("DOMMouseScroll", handleMouseWheel, false); // 畫面縮放(for Firefox)

    //接收並載入Server的地圖資訊
    //取出物件所有屬性的方法，參考網址:
    //https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"],
        "api_token": [token]
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
        timeline.reDrawTag(ctx);
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
        timeline.reDrawTag(ctx);
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
        timeline.reDrawTag(ctx);
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
    timeline.reDrawTag(ctx);
    xleftView += pos_x - lastX * Zoom; //滑鼠滾動的位置-縮放後滑鼠位移後的位置(X軸)
    ytopView += pos_y - lastY * Zoom; //滑鼠滾動的位置-縮放後滑鼠位移後的位置(Y軸)
    $("#canvas").css("margin-left", xleftView + "px").css("margin-top", ytopView + "px");
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

function search() {
    if (type == "Tag") {
        timeline = new Timeline(mapCollection);
        $("#btn_start").off('click').on('click', function () {
            timeline.startDraw();
        });
        $("#btn_stop").off('click').on('click', function () {
            timeline.stopDraw();
        });

    }
}

function checkTimeLength(time) {
    if (time.length < 6)
        time += ":00";
    else
        time = time;
    return time;
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


function drawTag(dctx, id, x, y, color) {
    dctx.globalCompositeOperation = "source-over";
    dctx.beginPath();
    dctx.fillStyle = color; //'#66ccff';
    dctx.arc(x, y, 5, 0, Math.PI * 2, true); // circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
    dctx.fill(); //填滿圓形
    dctx.strokeStyle = color; //'#0084ff';
    dctx.stroke(); //畫圓形的線
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
    }
}