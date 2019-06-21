var PIXEL_RATIO; // 獲取瀏覽器像素比
var cvsBlock, canvas, ctx;
var canvasImg = {
    isPutImg: false,
    width: 0,
    height: 0,
    scale: 1
}; //預設比例尺為1:1
var map_id = "";

// View parameters
var lastX = 0; //滑鼠最後位置的X座標
var lastY = 0; //滑鼠最後位置的Y座標
var xleftView = 0; //canvas的X軸位移(負值向左，正值向右)
var ytopView = 0; //canvas的Y軸位移(負值向上，正值向下)
var zoomOriginal = 1.0;
var Zoom = zoomOriginal; //縮放比例
var fitZoom = 1;
var isFitWindow = true;

var serverImg = new Image();

var pageTimer = {}; //定义计算器全局变量
var second = 100;
var mapArray;

var timelineArray = [];
var time = 0;
var isContinue = false;

window.addEventListener("load", setup, false);

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

    $(function () {
        $("#canvas").mousedown(function (e) {
            //獲取div的初始位置，要注意的是需要轉整型，因為獲取到值帶px 
            var canvas_left = parseInt($("#canvas").css("margin-left"));
            var canvas_top = parseInt($("#canvas").css("margin-top"));
            //獲取滑鼠按下時的坐標，區別於下面的es.pageX,es.pageY 
            var downx = e.pageX;
            var downy = e.pageY;
            //pageY的y要大寫，必須大寫！！
            // 滑鼠按下時給div掛事件 
            $("#canvas").bind("mousemove", function (es) {
                //es.pageX,es.pageY:獲取滑鼠移動後的坐標 
                var end_x = es.pageX - downx + canvas_left;
                //計算div的最終位置 
                var end_y = es.pageY - downy + canvas_top;
                //帶上單位 
                $("#canvas").css("margin-left", end_x + "px").css("margin-top", end_y + "px");
            });

            $("#canvas").mouseup(function () {
                //滑鼠彈起時給div取消事件 
                $("#canvas").unbind("mousemove");
            });

            $("#canvas").mouseleave(function () {
                //滑鼠離開canvas時給div取消事件 
                $("#canvas").unbind("mousemove");
            });
        });

        $("#timeline_dialog").dialog({
            autoOpen: false
        });
    });

    //接收並載入Server的地圖資訊
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success == 1) {
                mapArray = revObj.Values.slice(0);
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));

    /**
     *  調整間隔時間的滑塊條
     */
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
            for (var each in pageTimer) {
                clearInterval(pageTimer[each]);
            }
            second = $("#interval").val();
            pageTimer["timer1"] = setInterval("drawNextTime()", second); //計時器賦值
        });

        $(this).mouseup(function () {
            $(this).unbind('mousemove');
        });
    });
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
        Zoom = zoomOriginal;
        ctx.save(); //紀錄原比例

        var serImgSize = serverImg.width / serverImg.height;
        var cvs_width = parseFloat($("#cvsBlock").css("width"));
        var cvs_height = parseFloat($("#cvsBlock").css("height"));
        var cvsSize = cvs_width / cvs_height;
        if (serImgSize > cvsSize) { //原圖比例寬邊較長
            fitZoom = cvs_width / serverImg.width;
            setCanvas(this.src, cvs_width, serverImg.height * fitZoom);
        } else {
            fitZoom = cvs_height / serverImg.height;
            setCanvas(this.src, serverImg.width * fitZoom, cvs_height);
        }
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

function setSize() {
    //縮放canvas與背景圖大小
    if (canvasImg.isPutImg) {
        canvas.style.backgroundSize = (canvasImg.width * fitZoom * Zoom) + "px " + (canvasImg.height * fitZoom * Zoom) + "px";
        canvas.width = canvasImg.width * fitZoom * PIXEL_RATIO * Zoom;
        canvas.height = canvasImg.height * fitZoom * PIXEL_RATIO * Zoom;
        canvas.style.width = canvasImg.width * fitZoom * Zoom + 'px';
        canvas.style.height = canvasImg.height * fitZoom * Zoom + 'px';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(PIXEL_RATIO * fitZoom, 0, 0, PIXEL_RATIO * fitZoom, 0, 0);
        ctx.scale(Zoom, Zoom);
        ctx.translate(0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function restoreCanvas() {
    var cvsBlock_width = parseFloat($("#cvsBlock").css("width"));
    var cvsBlock_height = parseFloat($("#cvsBlock").css("height"));
    xleftView = 0;
    ytopView = 0;
    Zoom = zoomOriginal;
    if (isFitWindow) { //恢復原比例
        fitZoom = 1;
        ctx.restore();
        ctx.save();
        isFitWindow = false; //目前狀態:原比例
        document.getElementById("btn_restore").innerHTML = "<i class=\"fas fa-expand\" ></i >";
    } else { //依比例拉伸(Fit in Window)
        if ((canvasImg.width / canvasImg.height) > (cvsBlock_width / cvsBlock_height)) //原圖比例寬邊較長
            fitZoom = cvsBlock_width / canvasImg.width;
        else
            fitZoom = cvsBlock_height / canvasImg.height;
        isFitWindow = true; //目前狀態:依比例拉伸
        document.getElementById("btn_restore").innerHTML = "<i class=\"fas fa-compress\" ></i >";
    }
    $(function () {
        $("#canvas").css("margin-left", 0 + "px").css("margin-top", 0 + "px");
    });
    reDrawTag(ctx);
}

function restartCanvas() {
    var cvsBlock_width = parseFloat($("#cvsBlock").css("width"));
    var cvsBlock_height = parseFloat($("#cvsBlock").css("height"));
    xleftView = 0;
    ytopView = 0;
    Zoom = zoomOriginal;
    if ((canvasImg.width / canvasImg.height) > (cvsBlock_width / cvsBlock_height)) //原圖比例寬邊較長
        fitZoom = cvsBlock_width / canvasImg.width;
    else
        fitZoom = cvsBlock_height / canvasImg.height;
    $(function () {
        $("#canvas").css("margin-left", 0 + "px").css("margin-top", 0 + "px");
    });
    reDrawTag(ctx);
}

function handleMouseWheel(event) {
    var targetX = lastX; //滑鼠目前在canvas中的位置(x坐標)
    var targetY = lastY; //滑鼠目前在canvas中的位置(y坐標)
    var scale = (event.wheelDelta < 0 || event.detail > 0) ? 0.9 : 1.1;
    Zoom *= scale; //縮放比例
    $(function () {
        var canvas_left = parseFloat($("#canvas").css("margin-left")); //canvas目前相對於div的位置(x坐標)
        var canvas_top = parseFloat($("#canvas").css("margin-top")); //canvas目前相對於div的位置(y坐標)
        xleftView = targetX / scale - targetX; //得出最終偏移量X
        ytopView = targetY / scale - targetY; //得出最終偏移量Y
        var end_x = canvas_left + xleftView; //* scale;
        var end_y = canvas_top + ytopView; //* scale;
        $("#canvas").css("margin-left", end_x + "px").css("margin-top", end_y + "px");
    });
    reDrawTag(ctx);
}

function handleMouseClick(event) {
    var p = getEventPosition(event); //滑鼠點擊事件
    for (i = 0; i < time; i++) {
        ctx.beginPath();
        ctx.fillStyle = '#ffffff00';
        ctx.arc(timelineArray[i].x, timelineArray[i].y, 6, 0, Math.PI * 2, true);
        // circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
        ctx.fill(); //填滿圓形
        ctx.closePath();
        if (p && ctx.isPointInPath(p.x, p.y)) {
            //如果傳入了事件坐標，就用isPointInPath判斷一下
            $(function () {
                $("#timeline_dialog_time").text(timelineArray[i].time);
                $("#timeline_dialog_x").text(timelineArray[i].x);
                $("#timeline_dialog_y").text(timelineArray[i].y);
                $("#timeline_dialog").dialog("open");
            });
        }
    }
}

function getEventPosition(event) { //獲取滑鼠點擊位置
    var x, y;
    if (event.layerX || event.layerX == 0) {
        x = event.layerX;
        y = event.layerY;
    } else if (event.offsetX || event.offsetX == 0) { // Opera
        x = event.offsetX;
        y = event.offsetY;
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
        //document.getElementById('x').value = loc.x / Zoom;
        //document.getElementById('y').value = loc.y / Zoom;
        lastX = loc.x;
        lastY = loc.y;
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


function drawTag(dctx, id, x, y) {
    dctx.globalCompositeOperation = "source-over";
    dctx.beginPath();
    dctx.fillStyle = '#99ff66';
    dctx.arc(x, y, 5, 0, Math.PI * 2, true); // circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
    dctx.fill(); //填滿圓形
    dctx.strokeStyle = '#66ccff';
    dctx.stroke(); //畫圓形的線
    dctx.closePath();
    //dctx.font = '10px serif';
    //dctx.strokeText(id, x, y); //tagID
}

var limitCount = 64;

function reDrawTag(dctx) {
    setSize();
    var array = timelineArray;
    var k = 0;
    if (time > limitCount)
        k = time - limitCount;
    for (i = k; i < time; i++) {
        if (i == 0)
            drawTag(dctx, array[0].time, array[0].x, array[0].y);
        else {
            drawArrow(dctx, array[i - 1].x, array[i - 1].y, array[i].x, array[i].y, 30, 8, 2, '#66ccff');
            drawTag(dctx, array[i].time, array[i].x, array[i].y);
        }
    }
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

function drawTimeline() {
    if (!isContinue) {
        isContinue = true;
        document.getElementById("btn_stop").disabled = false;
        document.getElementById("btn_restore").disabled = false;
        document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-pause\" ></i >";
        document.getElementById("btn_search").disabled = true;
        pageTimer["timer1"] = setInterval("drawNextTime()", second); //計時器賦值
    } else {
        isContinue = false;
        document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i >";
        for (var each in pageTimer) {
            clearInterval(pageTimer[each]);
        }
    }
}

function stopTimeline() {
    isContinue = false;
    for (var each in pageTimer) {
        clearInterval(pageTimer[each]);
    }
    time = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i >";
    document.getElementById("btn_stop").disabled = true;
    document.getElementById("btn_search").disabled = false;
}

function drawNextTime() {
    var array = timelineArray;
    if (isContinue && array.length > 0) {
        if (time == 0) {
            loadImage(array[0].map_src, array[0].map_scale);
            restartCanvas();
            drawTag(ctx, array[0].time, array[0].x, array[0].y);
            document.getElementById("position").innerText = array[0].map_name;
            document.getElementById("draw_time").innerText = array[0].time;
            document.getElementById("draw_x").innerText = array[0].x;
            document.getElementById("draw_y").innerText = array[0].y;
            time++;
        } else if (time < array.length) {
            if (array[time].map_src != array[time - 1].map_src)
                loadImage(array[time].map_src, array[time].map_scale);
            reDrawTag(ctx);
            drawArrow(ctx, array[time - 1].x, array[time - 1].y, array[time].x, array[time].y, 30, 8, 2, '#66ccff');
            drawTag(ctx, array[time].time, array[time].x, array[time].y);
            document.getElementById("position").innerText = array[time].map_name;
            document.getElementById("draw_time").innerText = array[time].time;
            document.getElementById("draw_x").innerText = array[time].x;
            document.getElementById("draw_y").innerText = array[time].y;
            time++;
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time = 0;
        }
    }
}

function search() {
    var startDate = new Date($("#start_date").val() + 'T' + checkTimeLength($("#start_time").val()));
    var endDate = new Date($("#end_date").val() + 'T' + checkTimeLength($("#end_time").val()));
    if (endDate - startDate > 86400000 * 7) { //86400000 = 一天的毫秒數
        var retVal = confirm($.i18n.prop('i_alertTimeTooLong'));
        if (retVal == true) {
            timelineArray = [];
            getTimeline({
                "Command_Type": ["Read"],
                "Command_Name": ["GetLocus_combine_hour"],
                "Value": {
                    "tag_id": $("#search_target").val(),
                    "start_date": $("#start_date").val(),
                    "start_time": checkTimeLength($("#start_time").val()),
                    "end_date": $("#end_date").val(),
                    "end_time": checkTimeLength($("#end_time").val())
                }
            });
            return true;
        } else
            return false;
    } else {
        timelineArray = [];
        getTimeline({
            "Command_Type": ["Read"],
            "Command_Name": ["GetLocus_combine_hour"],
            "Value": {
                "tag_id": $("#search_target").val(),
                "start_date": $("#start_date").val(),
                "start_time": checkTimeLength($("#start_time").val()),
                "end_date": $("#end_date").val(),
                "end_time": checkTimeLength($("#end_time").val())
            }
        });
    }
}


function getTimeline(request) {
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var revInfo = ('Values' in revObj) == true ? revObj.Values : [];
            if (revObj.success == 1) {
                for (i = 0; i < revInfo.length; i++) {
                    var index = mapArray.findIndex(function (maps) { //抓取指定AlarmTag的位置
                        return maps.map_id == revInfo[i].map_id;
                    });
                    if (index > -1) {
                        var map_info = mapArray[index];
                        timelineArray.push({
                            map_src: "data:image/" + map_info.map_file_ext + ";base64," + map_info.map_file,
                            map_scale: map_info.map_scale,
                            map_name: map_info.map_name,
                            time: revInfo[i].time,
                            x: parseInt(revInfo[i].coordinate_x, 10),
                            y: parseInt(revInfo[i].coordinate_y, 10)
                        });
                        document.getElementById("btn_start").disabled = false;
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
                } else
                    alert($.i18n.prop('i_searchOver'));
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