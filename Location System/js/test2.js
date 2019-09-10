var token = "";

$(function () {
    token = getUser() ? getUser().api_token : "";
});

function Timeline(maps) {
    var times = 0;
    var limitCount = 64;
    var max_times = 0;
    var historys = {};
    var target_ids = document.getElementsByName("chk_target_id");
    var target_colors = document.getElementsByName("input_target_color");
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    function init() {
        document.getElementById("btn_stop").disabled = true;
        document.getElementById("btn_restore").disabled = true;
        document.getElementById("btn_start").disabled = true;
        document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i >";
        if (target_ids.length == 0) {
            alert("請先新增至少一個目標Tag!");
            return false;
        }
        var startDate = new Date($("#start_date").val() + 'T' + checkTimeLength($("#start_time").val()));
        var endDate = new Date($("#end_date").val() + 'T' + checkTimeLength($("#end_time").val()));
        if (endDate - startDate > 86400000 * 7) { //86400000 = 一天的毫秒數
            if (!confirm($.i18n.prop('i_alertTimeTooLong')))
                return false;
        }
        for (i in timeDelay.search)
            clearTimeout(timeDelay.search[i]);
        showSearching();
        target_ids.forEach(function (tag_id, i) {
            timeDelay.search.push(
                setTimeout(function () {
                    setTimeline({
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
                }, 100 * i)
            );
        });
    }

    function setTimeline(request) {
        target_tag = request.Value.tag_id;
        var xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                var revInfo = ('Values' in revObj) == true ? revObj.Values : [];
                if (revObj.success == 1) {
                    for (i = 0; i < revInfo.length; i++) {
                        if (revInfo[i].map_id in maps) {
                            var mapInfo = maps[revInfo[i].map_id];
                            if (!historys[request.Value.tag_id])
                                historys[request.Value.tag_id] = [];
                            historys[request.Value.tag_id].push({
                                map_id: mapInfo.map_id,
                                map_name: mapInfo.map_name,
                                x: parseInt(revInfo[i].coordinate_x, 10),
                                y: parseInt(revInfo[i].coordinate_y, 10),
                                time: revInfo[i].time
                            });
                            document.getElementById("btn_start").disabled = false;
                        }
                    }
                    if (revObj.Status == 1) {
                        //以1小時為基準，分批接受並傳送要求
                        setTimeline({
                            "Command_Type": ["Read"],
                            "Command_Name": ["GetLocus_combine_hour"],
                            "Value": {
                                "tag_id": revObj.tag_id,
                                "start_date": revObj.start_date,
                                "start_time": revObj.start_time,
                                "end_date": revObj.end_date,
                                "end_time": revObj.end_time
                            },
                            "api_token": [token]
                        });
                    } else {
                        if (historys[request.Value.tag_id] && historys[request.Value.tag_id].length > max_times)
                            max_times = historys[request.Value.tag_id].length;
                        alert($.i18n.prop('i_searchOver'));
                        document.getElementById("btn_start").disabled = true;
                    }
                }
            }
        };
        xmlHttp.send(JSON.stringify(request));
    }
    this.startDraw = function () {
        if (!isContinue) {
            isContinue = true;
            document.getElementById("btn_stop").disabled = false;
            document.getElementById("btn_restore").disabled = false;
            document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-pause\" ></i >";
            document.getElementById("btn_search").disabled = true;
            timeDelay["draw"] = setInterval("drawTimeline()", $("#interval").val()); //計時器賦值
        } else {
            isContinue = false;
            document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i >";
            clearInterval(timeDelay["draw"]);
        }
    };
    this.stopDraw = function () {
        isContinue = false;
        clearInterval(timeDelay["draw"]);
        times = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i >";
        document.getElementById("btn_stop").disabled = true;
        document.getElementById("btn_search").disabled = false;
    };

    function drawNextTime() {
        if (isContinue && target_ids.length > 0) {
            if (times == 0) {
                target_ids.forEach(function (tag_id, i) {
                    var color = target_colors[i].value;
                    var array = historys[tag_id.value];
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
                    var color = target_colors[i].value;
                    var array = historys[tag_id.value];
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
            var color = target_colors[i].value;
            var array = historys[tag_id.value];
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

    function locateTag(tag_id) {
        if (historyData[tag_id])
            changeFocusMap(historyData[tag_id][times].map_id);
        else
            alert("資料錯誤，請重新搜尋或刷新頁面");
    }

    return init();
}