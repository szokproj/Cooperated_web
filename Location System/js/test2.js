$(function () {
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
});

function createCanvas() {
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
        mapArray = [];

    init();

    function init() {
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
    }

    this.mapArray = mapArray;

    this.getMaps = function () {
        var xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    mapArray = revObj.Values.slice(0);
                    /*mapArray = MapList.slice(0); //Copy array
                    var html = "";
                    for (i = 0; i < MapList.length; i++) {
                        html += "<li><input type=\"button\" id=\"map_btn_" + MapList[i].map_id + "\" " +
                            "value=\"" + MapList[i].map_name + "\"" +
                            "onclick=\"addMapTab(\'" + MapList[i].map_id + "\',\'" + MapList[i].map_name +
                            "\')\"></li>";
                    }
                    document.getElementById("loadMapButtonGroup").innerHTML = html;
                    selectMapFromCookie();*/
                } else {
                    alert($.i18n.prop('i_failed_loadMap'));
                }
            }
        };
        xmlHttp.send(JSON.stringify({
            "Command_Type": ["Read"],
            "Command_Name": ["GetMaps"]
        })); //接收並載入Server的地圖設定到按鈕
    }


    this.setMap = function (map_id) {
        //loading();
        isFocus = false;
        if (mapArray.length == 0)
            return;
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

    this.restoreCanvas = function () {
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

    this.getPointOnCanvas = function (x, y) {
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


}

function getMap() {
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
        "Command_Name": ["GetMaps"]
    })); //接收並載入Server的地圖設定到按鈕
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
            getMemberPhoto("member_dialog_image", v.number);
            $("#member_dialog").dialog("open");
        }
    });
    alarmArray.forEach(function (v) {
        drawInvisiblePoints(ctx, v.id, v.x, v.y, dot_size.tag, 1 / Zoom);
        //如果傳入了事件坐標，就用isPointInPath判斷一下
        if (p && ctx.isPointInPath(p.x, p.y))
            setAlarmDialog(v);
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
                getMemberPhoto("member_dialog_image", v.number);
                $("#member_dialog").dialog("open");
            }
        });
        alarmArray.forEach(function (v) {
            var distance = Math.sqrt(Math.pow(v.x - p.x, 2) + Math.pow(v.y - (p.y + 28 / Zoom), 2));
            if (distance <= range)
                setAlarmDialog(v);
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