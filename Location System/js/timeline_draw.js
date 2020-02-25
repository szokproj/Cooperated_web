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
    var BCR = canvas.getBoundingClientRect(),
        pos_x = event.pageX - BCR.left,
        pos_y = event.pageY - BCR.top,
        scale = 1.0;
    if (event.wheelDelta < 0 || event.detail > 0) {
        if (Zoom > 0.1)
            scale = 0.9;
    } else {
        scale = 1.1;
    }
    Zoom *= scale; //縮放比例
    xleftView += pos_x - lastX * Zoom; //滑鼠滾動的位置-縮放後滑鼠位移後的位置(X軸)
    ytopView += pos_y - lastY * Zoom; //滑鼠滾動的位置-縮放後滑鼠位移後的位置(Y軸)
    reDrawTag();
}

function handleMouseMove(event) { //滑鼠移動事件
    var p = getPointOnCanvas(event.pageX, event.pageY);
    lastX = p.x;
    lastY = p.y;
}

function handleMouseClick(event) {
    checkInTagsRange({
        x: lastX,
        y: canvasImg.height - lastY
    });
}

function handleMobileTouch(event) { //手指觸碰事件
    var x = event.changedTouches[0].clientX,
        y = event.changedTouches[0].clientY,
        p = getPointOnCanvas(x, y);
    //console.log("{ x: " + x + " , y: " + y + " }");
    checkInTagsRange({
        x: p.x,
        y: canvasImg.height - p.y
    });
}

function checkInTagsRange(p) {
    var radius = {
        tag: 5,
        alarm: 14
    };
    var inputThumbInfos = function (user_id, history) {
        var member_info = MemberData[user_id];
        $("#thumb_user_id").text(user_id);
        $("#thumb_number").text(member_info.number);
        $("#thumb_name").text(member_info.name);
        $("#thumb_dept").text(member_info.dept);
        $("#thumb_date").text(history.date);
        $("#thumb_time").text(history.time);
        $("#thumb_map").text(MapList[history.map_id].map_name);
        $("#thumb_position").text("( " + history.x + " , " + history.y + " )");
        inputMemberPhoto(member_info.photo);
    };
    switch ($("#target_type").val()) {
        case "Tag":
            document.getElementsByName("chk_target_id").forEach(function(tag_id ) {
                var array = HistoryData[tag_id.value];
                for (var i = 0; i < times; i++) {
                    if (typeof (array[i].x) == 'undefined') return;
                    if (Math.pow(radius.tag, 2) >= Math.pow(array[i].x - p.x, 2) + Math.pow(array[i].y - p.y, 2)) {
                        inputThumbInfos(parseInt(tag_id.value, 16), array[i]);
                    }
                }
            });
            break;
        case "Group":
            var start = 0;
            if (!document.getElementById("chk_is_overlap").checked && times > 0)
                start = times - 1;
            for (var i = start; i < times; i++) {
                HistoryData[timeslot_array[i]].forEach(function(info ) {
                    if (typeof (info.x) == 'undefined') return;
                    if (Math.pow(radius.tag, 2) >= Math.pow(info.x - p.x, 2) + Math.pow(info.y - p.y, 2))
                        inputThumbInfos(parseInt(info.tag_id.substring(8), 16), info);
                });
            }
            break;
        default:
            alert($.i18n.prop('i_noSearch'));
            return false;
    }
    if (document.getElementById("chk_diaplay_alarm").checked) {
        displayAlarms.forEach(function(alarm) {
            if (Math.pow(radius.alarm, 2) >= Math.pow(alarm.x - p.x, 2) + Math.pow(alarm.y - (p.y - radius.alarm * 2), 2))
                inputThumbInfos(alarm.user_id, alarm);
        });
    }
    if (posAlarmData && posAlarmData.x) {
        if (Math.pow(radius.alarm, 2) >= Math.pow(posAlarmData.x - p.x, 2) + Math.pow(posAlarmData.y - (p.y - radius.alarm * 2), 2))
            inputThumbInfos(posAlarmData.user_id, posAlarmData);
    }
}

function setMobileEvents() {
    var hammer_pan = new Hammer(canvas); //Canvas位移
    var hammer_pinch = new Hammer(canvas); //Canvas縮放
    hammer_pan.get('pan').set({
        direction: Hammer.DIRECTION_ALL
    });
    hammer_pinch.get('pinch').set({
        enable: true
    });
    hammer_pan.on('panstart', function(ev ) {
        panPos.canvasLeft = parseInt(canvas.style.marginLeft);
        panPos.canvasTop = parseInt(canvas.style.marginTop);
    });
    hammer_pan.on('panmove', function(ev ) {
        xleftView = panPos.canvasLeft + ev.deltaX;
        ytopView = panPos.canvasTop + ev.deltaY;
        canvas.style.marginLeft = xleftView + "px";
        canvas.style.marginTop = ytopView + "px";
    });
    hammer_pinch.on('pinchstart pinchmove', function(ev ) {
        var BCR = canvas.getBoundingClientRect(),
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
        var Next_x = pos_x * scale, //縮放後的位置(x坐標)
            Next_y = pos_y * scale; //縮放後的位置(y坐標)
        xleftView += pos_x - Next_x;
        ytopView += pos_y - Next_y;
        reDrawTag();
    });
    canvas.addEventListener("touchstart", handleMobileTouch, { //手指點擊畫布中座標，跳出tag的訊息框
        passive: true
    });
};

function drawTimeline() {
    if (!isContinue) {
        if (!HistoryData["search_type"]) {
            alert($.i18n.prop('i_searchFirst'));
            return;
        }
        isContinue = true;
        document.getElementById("btn_stop").disabled = false;
        document.getElementById("btn_restore").disabled = false;
        document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-pause\" ></i >";
        document.getElementById("btn_search").disabled = false;
        switch (HistoryData["search_type"]) {
            case "Tag":
                if (!canvasImg.isPutImg) {
                    //第一個tag_id搜尋到的歷史軌跡的第一筆的map_id, 對應的地圖資訊
                    var tag_id = document.getElementsByName("chk_target_id");
                    var mapInfo = MapList[HistoryData[tag_id[0].value][times].map_id];
                    if (chkUseInputMap.checked && inputMapSrc.length > 0) {
                        loadImage(inputMapSrc);
                    } else {
                        $("#target_map").val(mapInfo.map_id);
                        loadImage(mapInfo.map_src, mapInfo.map_scale);
                    }

                }
                //計時器賦值
                timeDelay["draw"].push(setInterval("drawNextTimeByTag()", $("#interval").text()));
                break;
            case "Group":
                if (!canvasImg.isPutImg) {
                    //第一個timeslot搜尋到的歷史軌跡的第一筆的map_id, 對應的地圖資訊
                    var mapInfo = MapList[HistoryData[timeslot_array[0]][times].map_id];
                    if (chkUseInputMap.checked && inputMapSrc.length > 0) {
                        loadImage(inputMapSrc);
                    } else {
                        $("#target_map").val(mapInfo.map_id);
                        loadImage(mapInfo.map_src, mapInfo.map_scale);
                    }
                }
                //計時器賦值
                timeDelay["draw"].push(setInterval("drawNextTimeByGroup()", $("#interval").text()));
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
    happenedAlarm = [];
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
    if (chkUseInputMap.checked)
        return;
    if (HistoryData[tag_id])
        changeFocusMap(HistoryData[tag_id][times].map_id);
    else
        alert($.i18n.prop('i_searchError'));
}

function changeFocusMap(map_id) {
    if (map_id == "")
        alert($.i18n.prop('i_mapAlert_19'));
    else if (map_id != $("#target_map").val() || inputMapSrc.length > 0) {
        if (map_id in MapList) {
            $("#target_map").val(map_id);
            loadImage(MapList[map_id].map_src, MapList[map_id].map_scale);
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
        return;
    var count = 0;
    var locate_map = document.getElementById("target_map").value;
    if (times == 0) {
        displayAlarms = [];
        document.getElementsByName("chk_target_id").forEach(function (tag_id, i) {
            var color = document.getElementsByName("input_target_color")[i].value;
            var array = HistoryData[tag_id.value];
            if (!array)
                return alert($.i18n.prop('i_tagID') + ":[" + parseInt(tag_id.value, 16) + "]" + $.i18n.prop('i_tagSearchNoData'));
            if ((chkUseInputMap.checked && inputMapSrc.length > 0) || (array[0] && array[0].map_id == locate_map)) {
                drawTag(ctx, array[0].time, array[0].x, canvasImg.height - array[0].y, color);
                if (array[0].type != "normal") {
                    var alarm = AlarmList[tag_id.value][array[0].date + " " + array[0].time];
                    displayAlarms.push({
                        user_id: parseInt(tag_id.value, 16),
                        date: array[0].date,
                        time: array[0].time,
                        alarm_type: alarm.alarm_type,
                        map_id: alarm.map_id,
                        x: alarm.x,
                        y: alarm.y
                    });
                }
                document.getElementById("current_map").innerText = array[0].map_name;
                document.getElementById("current_date").innerText = array[0].date;
                document.getElementById("current_time").innerText = array[0].time;
                document.getElementById("draw_x").innerText = array[0].x;
                document.getElementById("draw_y").innerText = array[0].y;
            }
            count++;
        });
        document.getElementById("current_tags_amount").innerText = count;
        if (document.getElementById("chk_diaplay_alarm").checked) {
            displayAlarms.forEach(function(alarm) {
                drawAlarmTag(ctx, "", alarm.x, canvasImg.height - alarm.y, alarm.alarm_type);
            });
        }
        if (posAlarmData) {
            drawAlarmTag(ctx, "", posAlarmData.x, canvasImg.height - posAlarmData.y, posAlarmData.alarm_type);
            posAlarmData = null;
        }
        times++;
    } else if (times < max_times) {
        document.getElementsByName("chk_target_id").forEach(function (tag_id, i) {
            var array = HistoryData[tag_id.value];
            if (!array)
                return false;
            document.getElementById("current_map").innerText = array[times].map_name;
            document.getElementById("current_date").innerText = array[times].date;
            document.getElementById("current_time").innerText = array[times].time;
            document.getElementById("draw_x").innerText = array[times].x;
            document.getElementById("draw_y").innerText = array[times].y;
            count++;
        });
        document.getElementById("current_tags_amount").innerText = count;
        times++;
        reDrawTag();
    } else {
        if (confirm($.i18n.prop('i_endOfPlay'))) {
            setSize();
            times = 0;
        } else {
            isContinue = false;
            document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i>";
            clearDrawInterval();
        }
    }
}

function drawNextTimeByGroup() {
    if (!isContinue)
        return;
    if (times < timeslot_array.length) {
        var history = HistoryData[timeslot_array[times]];
        var datetime_arr = TimeToArray(timeslot_array[times]);
        if (!document.getElementById("chk_is_overlap").checked)
            setSize();
        document.getElementById("current_tags_amount").innerText = history.length;
        document.getElementById("current_map").innerText = history[0].map_name;
        document.getElementById("current_date").innerText = datetime_arr[0];
        document.getElementById("current_time").innerText = datetime_arr[1];
        times++;
        reDrawTag();
    } else {
        if (confirm($.i18n.prop('i_endOfPlay'))) {
            setSize();
            times = 0;
        } else {
            isContinue = false;
            document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i>";
            clearDrawInterval();
        }
    }
}

function reDrawTag() {
    setSize();
    switch (HistoryData["search_type"]) {
        case "Tag":
            var locate_map = document.getElementById("target_map").value;
            var k = 0;
            if (times == 0) return;
            if (document.getElementsByName("radio_is_limit")[1].checked) {
                var limitCount = document.getElementById("limit_count").value;
                if (limitCount != "" && times > limitCount)
                    k = times - limitCount;
            }
            displayAlarms = [];
            document.getElementsByName("chk_target_id").forEach(function (tag_id, i) {
                var color = document.getElementsByName("input_target_color")[i].value;
                var array = HistoryData[tag_id.value];
                if (!array) return;
                for (var j = k; j < times; j++) {
                    if ((chkUseInputMap.checked && inputMapSrc.length > 0) || (array[j] && array[j].map_id == locate_map)) {
                        if (j > k) {
                            drawArrow(ctx, array[j - 1].x, canvasImg.height - array[j - 1].y,
                                array[j].x, canvasImg.height - array[j].y, 30, 8, 2, color);
                        }
                        drawTag(ctx, array[j].time, array[j].x, canvasImg.height - array[j].y, color);
                        if (array[j].type != "normal") {
                            var alarm = AlarmList[tag_id.value][array[j].date + " " + array[j].time];
                            displayAlarms.push({
                                user_id: parseInt(tag_id.value, 16),
                                date: array[j].date,
                                time: array[j].time,
                                alarm_type: alarm.alarm_type,
                                map_id: alarm.map_id,
                                x: alarm.x,
                                y: alarm.y
                            });
                        }
                    }
                }
                if ((chkUseInputMap.checked && inputMapSrc.length > 0) || (array[times] && array[times].map_id == locate_map)) {
                    drawArrow(ctx, array[times - 1].x, canvasImg.height - array[times - 1].y,
                        array[times].x, canvasImg.height - array[times].y, 30, 8, 2, color);
                    drawTag(ctx, array[times].time, array[times].x, canvasImg.height - array[times].y, "#000000");
                }
            });
            if (document.getElementById("chk_diaplay_alarm").checked) {
                displayAlarms.forEach(function(alarm ) {
                    if ((chkUseInputMap.checked && inputMapSrc.length > 0) || (alarm.map_id == locate_map))
                        drawAlarmTag(ctx, "", alarm.x, canvasImg.height - alarm.y, alarm.alarm_type);
                });
            }
            break;
        case "Group":
            var start = 0;
            var locate_arr = [];
            displayAlarms = [];
            if (!document.getElementById("chk_is_overlap").checked && times > 0)
                start = times - 1;
            for (var i = start; i < times; i++) {
                HistoryData[timeslot_array[i]].forEach(function(info) {
                    if (info.tag_id == locate_tag) {
                        locate_arr.push(info);
                    } else {
                        drawTag(ctx, info.time, info.x, canvasImg.height - info.y, groupColor);
                    }
                    if (info.type != "normal") {
                        var alarm = AlarmList[info.date + " " + info.time][info.tag_id];
                        displayAlarms.push({
                            user_id: parseInt(info.tag_id.substring(8), 16),
                            date: info.date,
                            time: info.time,
                            alarm_type: alarm.alarm_type,
                            map_id: alarm.map_id,
                            x: alarm.x,
                            y: alarm.y
                        });
                    }
                });
            }
            locate_arr.forEach(function(info ){
                drawTag(ctx, info.time, info.x, canvasImg.height - info.y, locateColor);
            });
            if (document.getElementById("chk_diaplay_alarm").checked) {
                displayAlarms.forEach(function(alarm) {
                    drawAlarmTag(ctx, "", alarm.x, canvasImg.height - alarm.y, alarm.alarm_type);
                });
            }
            break;
        default:
            break;
    }
    if (posAlarmData) {
        drawAlarmTag(ctx, "", posAlarmData.x, canvasImg.height - posAlarmData.y, posAlarmData.alarm_type);
        posAlarmData = isContinue ? null : posAlarmData;
    }
}

function displayAlarmPos(key1, key2) {
    var alarm = AlarmList[key1][key2],
        tag_id = HistoryData["search_type"] == "Tag" ? key1 : key2.substring(8),
        date_time = HistoryData["search_type"] == "Tag" ? key2.split(" ") : key1.split(" ");
    posAlarmData = {
        user_id: parseInt(tag_id, 16),
        date: date_time[0],
        time: date_time[1],
        alarm_type: alarm.alarm_type,
        map_id: alarm.map_id,
        x: alarm.x,
        y: alarm.y
    };
    if (!posAlarmData.x) {
        posAlarmData = null;
        reDrawTag();
        showAlertDialog();
        return;
    }
    if (!isContinue) { //當暫停時，按下警報列表的定位按鈕，在對應座標出現警報圖示，並且在按下其他按鈕前不會消失。
        reDrawTag();
        drawAlarmTag(ctx, "", posAlarmData.x, canvasImg.height - posAlarmData.y, posAlarmData.alarm_type);
    }
}

function showAlertDialog() {
    var dialog = document.getElementById("alert_window");
    dialog.style.display = 'block';
    dialog.classList.remove("fadeOut");
    timeDelay["dialog"] = setTimeout(function () {
        dialog.classList.add("fadeOut");
        clearTimeout(timeDelay["dialog"]);
    }, 1200);
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

function drawAlarmTag(dctx, id, x, y, type) { //, size, zoom) {
    var radius = 14; //size * zoom; //半徑 //size:14
    var fillColor = '';
    var markColor = ''
    switch (type) {
        case "low_power":
            fillColor = '#72ac1b';
            markColor = '#496e11';
            break;
        case "help":
            fillColor = '#ff3333';
            markColor = '#e60000';
            break;
        case "still":
            fillColor = '#FF6600';
            markColor = '#cc5200';
            break;
        case "active":
            fillColor = '#FF6600';
            markColor = '#cc5200';
            break;
        case "Fence":
            fillColor = '#ffe600';
            markColor = '#e7a81f';
            break;
        case "stay":
            fillColor = '#1a53ff';
            markColor = '#0033ca';
            break;
        case "hidden":
            fillColor = '#5151dd';
            markColor = '#2f2f83';
            break;
        default:
            fillColor = '#72ac1b'; //unknown
            markColor = '#72ac1b';
    }
    //畫倒水滴形
    dctx.beginPath();
    dctx.lineWidth = 2; //* zoom;
    dctx.arc(x, y - radius * 2, radius, Math.PI * (1 / 6), Math.PI * (5 / 6), true);
    dctx.lineTo(x, y);
    dctx.closePath();
    dctx.strokeStyle = '#000000';
    dctx.stroke();
    dctx.fillStyle = fillColor;
    dctx.fill();
    //畫中心白色圓形
    dctx.beginPath();
    dctx.arc(x, y - radius * 2, radius * 2 / 3, 0, Math.PI * 2, true);
    dctx.closePath();
    dctx.fillStyle = '#ffffff';
    dctx.fill();
    //畫驚嘆號
    dctx.fillStyle = markColor;
    dctx.beginPath();
    var start = {
        x: x - radius * 0.1,
        y: y + radius * (-1.9)
    };
    var cp1 = {
        x: x - radius * 0.3,
        y: y - radius * 2.46
    };
    var cp2 = {
        x: x - radius * 0.1,
        y: y - radius * 2.48
    };
    var end = {
        x: x,
        y: y - radius * 2.5
    };
    dctx.lineTo(start.x, start.y);
    dctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    start = {
        x: x,
        y: y - radius * 2.5
    };
    cp1 = {
        x: x + radius * 0.1,
        y: y - radius * 2.48
    };
    cp2 = {
        x: x + radius * 0.3,
        y: y - radius * 2.46
    };
    end = {
        x: x + radius * 0.1,
        y: y + radius * (-1.9)
    };
    dctx.lineTo(start.x, start.y);
    dctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    start = {
        x: x + radius * 0.1,
        y: y + radius * (-1.9)
    };
    cp1 = {
        x: x + radius * 0.04,
        y: y + radius * (-1.8)
    };
    cp2 = {
        x: x - radius * 0.04,
        y: y + radius * (-1.8)
    };
    end = {
        x: x - radius * 0.1,
        y: y + radius * (-1.9)
    };
    dctx.lineTo(start.x, start.y);
    dctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    dctx.fill();
    //畫驚嘆號的圓點
    dctx.beginPath();
    dctx.arc(x, y + radius * (-1.6), radius * 0.1, 0, Math.PI * 2, true);
    dctx.fill();
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