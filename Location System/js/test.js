var PIXEL_RATIO, // 獲取瀏覽器像素比
    cvsBlock, canvas, ctx, //儲存畫布外框、畫布、繪製2D的物件
    lastX = 0, //滑鼠最後位置的X座標
    lastY = 0, //滑鼠最後位置的Y座標
    xleftView = 0, //畫布的X軸位移(負值向左，正值向右)
    ytopView = 0, //畫布的Y軸位移(負值向上，正值向下)
    Zoom = 1.0, //縮放比例
    canvasImg = { //儲存當前畫布的背景圖原始資料
        isPutImg: false,
        width: 0,
        height: 0,
        scale: 1 //預設比例尺為1:1
    },
    serverImg = new Image();

window.onload = function () {
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
    var json_request = JSON.stringify({ //接收並載入Server的地圖資訊
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"],
        "api_token": [token]
    });
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                $("#target_map").empty();
                revObj.Value[0].Values.forEach(function (element) {
                    //MapList => key: map_id | value: {map_id, map_name, map_src, map_scale}
                    MapList[element.map_id] = {
                        map_id: element.map_id,
                        map_name: element.map_name,
                        map_src: "data:image/" + element.map_file_ext + ";base64," + element.map_file,
                        map_scale: element.map_scale
                    }
                    $("#target_map").append("<option value=\"" + element.map_id + "\">" + element.map_name + "</option>");
                });
                $("#target_map").on('change', function () {
                    var mapInfo = MapList[$(this).val()];
                    loadImage(mapInfo.map_src, mapInfo.map_scale);
                    restartCanvas();
                });
            }
        }
    };
    xmlHttp.send(json_request);

    clearInterval(pageTimer["draw"]); //設定重複執行的程式(需儲存重複執行的編號才能清除)

    pageTimer["draw"] = setInterval(function () { //清除重複執行程式的設定
        draw();
    }, 100);


};


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
        reDrawTag();
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
        canvas.style.marginLeft = xleftView + "px";
        canvas.style.marginTop = ytopView + "px";
        canvas.style.backgroundSize = (canvasImg.width * Zoom) + "px " + (canvasImg.height * Zoom) + "px";
        canvas.width = canvasImg.width * PIXEL_RATIO * Zoom;
        canvas.height = canvasImg.height * PIXEL_RATIO * Zoom;
        canvas.style.width = canvasImg.width * Zoom + 'px';
        canvas.style.height = canvasImg.height * Zoom + 'px';
        ctx.clearRect(0, 0, canvas.width, canvas.height); //清空畫布，背景圖不會受到影響
        ctx.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
        ctx.scale(Zoom, Zoom);
        ctx.translate(0, 0);
    }
}

function draw() {
    setSize(); //重新調整畫面比例並清空畫布
    for (var tag_id in TagList) { //繪出接收到的標籤資料(座標位置)
        var v = TagList[tag_id];
        if (groupfindMap[v.point[i].group_id] == Map_id) { //標籤座標在當前地圖上
            //標籤圖形(中心有白色圓圈的倒水滴型)
            drawTags(ctx, v.id, v.point[i].x, canvasImg.height - v.point[i].y,
                v.color, dot_size.tag, 1 / Zoom);
        }
    }
}

function drawTags(id, x, y, color, size, zoom) {
    var radius = size * zoom; //半徑 //size:10
    ctx.beginPath();
    ctx.lineWidth = 2 * zoom;
    ctx.arc(x, y - radius * 2, radius, Math.PI * (1 / 6), Math.PI * (5 / 6), true);
    //circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    ctx.fillStyle = color != "" ? color : '#2eb82e';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y - radius * 2, radius / 2.5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
}