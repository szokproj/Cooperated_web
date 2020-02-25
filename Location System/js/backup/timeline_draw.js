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
    if (canvasImg.isPutImg) {
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
        reDrawTag();
    }
}

function restartCanvas() {
    var cvsBlock_width = parseFloat($("#cvsBlock").css("width"));
    var cvsBlock_height = parseFloat($("#cvsBlock").css("height"));
    xleftView = 0;
    ytopView = 0;
    if ((serverImg.width / serverImg.height) > (cvsBlock_width / cvsBlock_height)) //原圖比例寬邊較長
        Zoom = cvsBlock_width / serverImg.width;
    else
        Zoom = cvsBlock_height / serverImg.height;
    $("#canvas").css("margin-left", 0 + "px").css("margin-top", 0 + "px");
    reDrawTag();
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
    reDrawTag();
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
                        var user_id = parseInt(tag_id.value, 16);
                        var member_info = MemberData[user_id];
                        $("#thumb_user_id").text(user_id);
                        $("#thumb_number").text(member_info.number);
                        $("#thumb_name").text(member_info.name);
                        $("#thumb_dept").text(member_info.dept);
                        $("#thumb_date").text(array[i].date);
                        $("#thumb_time").text(array[i].time);
                        $("#thumb_map").text(array[i].map_name);
                        $("#thumb_position").text("( " + array[i].x + " , " + array[i].y + " )");
                        inputMemberPhoto(member_info.photo)
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
                        var user_id = parseInt(info.tag_id, 16);
                        var member_info = MemberData[user_id];
                        $("#thumb_user_id").text(user_id);
                        $("#thumb_number").text(member_info.number);
                        $("#thumb_name").text(member_info.name);
                        $("#thumb_dept").text(member_info.dept);
                        $("#thumb_date").text(info.date);
                        $("#thumb_time").text(info.time);
                        $("#thumb_map").text(info.map_name);
                        $("#thumb_position").text("( " + info.x + " , " + info.y + " )");
                        inputMemberPhoto(member_info.photo)
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
        if (!historyData["search_type"]) {
            alert($.i18n.prop('i_searchFirst'));
            return;
        }
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
                //計時器賦值
                timeDelay["draw"].push(setInterval("drawNextTimeByTag()", $("#interval").val()));
                break;
            case "Group":
                if (!canvasImg.isPutImg) {
                    //第一個timeslot搜尋到的歷史軌跡的第一筆的map_id, 對應的地圖資訊
                    var mapInfo = mapCollection[historyData[timeslot_array[0]][times].map_id];
                    $("#target_map").val(mapInfo.map_id);
                    loadImage(mapInfo.map_src, mapInfo.map_scale);
                }
                //計時器賦值
                timeDelay["draw"].push(setInterval("drawNextTimeByGroup()", $("#interval").val()));
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

function changeLocateTag(tag_id) {
    locate_tag = tag_id;
    reDrawTag();
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

function drawNextTimeByTag() {
    if (!isContinue)
        return false;
    var count = 0;
    var locate_map = document.getElementById("target_map").value;
    if (times == 0) {
        document.getElementsByName("chk_target_id").forEach(function (tag_id, i) {
            var color = document.getElementsByName("input_target_color")[i].value;
            var array = historyData[tag_id.value];
            if (!array)
                return alert($.i18n.prop('i_tagID') + ":[" + parseInt(tag_id.value, 16) + "]" + $.i18n.prop('i_tagSearchNoData'));
            if (array[0] && array[0].map_id == locate_map) {
                drawTag(ctx, array[0].time, array[0].x, canvasImg.height - array[0].y, color);
                document.getElementById("current_map").innerText = array[0].map_name;
                document.getElementById("current_date").innerText = array[0].date;
                document.getElementById("current_time").innerText = array[0].time;
                document.getElementById("draw_x").innerText = array[0].x;
                document.getElementById("draw_y").innerText = array[0].y;
            }
            count++;
        });
        document.getElementById("current_tags_amount").innerText = count;
        times++;
    } else if (times < max_times) {
        reDrawTag();
        document.getElementsByName("chk_target_id").forEach(function (tag_id, i) {
            //var color = document.getElementsByName("input_target_color")[i].value;
            var array = historyData[tag_id.value];
            if (!array)
                return false;
            //if (array[times] && array[times].map_id == locate_map) {
            document.getElementById("current_map").innerText = array[times].map_name;
            document.getElementById("current_date").innerText = array[times].date;
            document.getElementById("current_time").innerText = array[times].time;
            document.getElementById("draw_x").innerText = array[times].x;
            document.getElementById("draw_y").innerText = array[times].y;
            //}
            count++;
        });
        document.getElementById("current_tags_amount").innerText = count;
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
            var count = 0;
            historyData[timeslot_array[times]].forEach(info => {
                drawTag(ctx, info.time, info.x, canvasImg.height - info.y, group_color);
                count++;
            });
            document.getElementById("current_tags_amount").innerText = count;
        } else {
            reDrawTag();
        }
        var history = historyData[timeslot_array[times]][0];
        document.getElementById("current_map").innerText = history.map_name;
        document.getElementById("current_date").innerText = history.date;
        document.getElementById("current_time").innerText = history.time;
        times++;
    }
}

function reDrawTag() {
    setSize();
    switch (historyData["search_type"]) {
        case "Tag":
            var locate_map = document.getElementById("target_map").value;
            var k = 0;
            if (times == 0) return false;
            if (document.getElementsByName("radio_is_limit")[1].checked) {
                var limitCount = document.getElementById("limit_count").value;
                if (limitCount != "" && times > limitCount)
                    k = times - limitCount;
            }
            document.getElementsByName("chk_target_id").forEach(function (tag_id, i) {
                var color = document.getElementsByName("input_target_color")[i].value;
                var array = historyData[tag_id.value];
                if (!array) return false;
                for (var j = k; j < times; j++) {
                    if (array[j] && array[j].map_id == locate_map) {
                        if (j > k) {
                            drawArrow(ctx, array[j - 1].x, canvasImg.height - array[j - 1].y,
                                array[j].x, canvasImg.height - array[j].y, 30, 8, 2, color);
                        }
                        drawTag(ctx, array[j].time, array[j].x, canvasImg.height - array[j].y, color);
                    }
                }
                if (array[times] && array[times].map_id == locate_map) {
                    drawArrow(ctx, array[times - 1].x, canvasImg.height - array[times - 1].y,
                        array[times].x, canvasImg.height - array[times].y, 30, 8, 2, color);
                    drawTag(ctx, array[times].time, array[times].x, canvasImg.height - array[times].y, "#000000");
                }
            });
            break;
        case "Group":
            var locate_arr = [];
            var start = 0;
            var count = 0;
            if (!document.getElementById("chk_is_overlap").checked && times > 0)
                start = times - 1;
            for (var i = start; i < times; i++) {
                historyData[timeslot_array[i]].forEach(info => {
                    if (i == start)
                        count++;
                    if (info.tag_id == locate_tag)
                        locate_arr.push(info);
                    else
                        drawTag(ctx, info.time, info.x, canvasImg.height - info.y, group_color);
                });
            }
            locate_arr.forEach(info => {
                drawTag(ctx, info.time, info.x, canvasImg.height - info.y, "#9c00f7");
            });
            document.getElementById("current_tags_amount").innerText = count;
            break;
        default:
            break;
    }

}

function drawTag(dctx, id, x, y, color) {
    dctx.globalCompositeOperation = "source-over";
    dctx.beginPath();
    dctx.fillStyle = color; //'#66ccff';
    dctx.arc(x, y, 5, 0, Math.PI * 2, true); //circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
    dctx.fill(); //填滿圓形
    //dctx.strokeStyle = color; //'#0084ff';
    //dctx.stroke(); //畫圓形的線
    dctx.closePath();
}

function drawArrow(dctx, fromX, fromY, toX, toY, theta, headlen, width, color) {
    ctx.globalCompositeOperation = "destination-over";
    var deltaX = toX - fromX;
    var deltaY = toY - fromY;
    var len = Math.pow(deltaX, 2) + Math.pow(deltaY, 2);
    if (len > 100) {
        //將指向圓心的(toX,toY)往回退，讓箭頭能完全被畫出來
        var m = Math.sqrt(Math.pow(5, 2) / len);
        toX -= m * deltaX;
        toY -= m * deltaY;

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

function getPointOnCanvas(x, y) { //獲取滑鼠在Canvas物件上座標
    var BCR = canvas.getBoundingClientRect();
    var pos_x = (x - BCR.left) * (canvasImg.width / BCR.width);
    var pos_y = (y - BCR.top) * (canvasImg.height / BCR.height);
    return {
        x: pos_x,
        y: pos_y
    }
}