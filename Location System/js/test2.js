var token = "";
var historys = {};

$(function () {
    token = getUser() ? getUser().api_token : "";

    var timeline = new Timeline();
    timeline.init();
    timeline.getTimeline["byTags"];
});




function Timeline() {
    var times = 0;
    var limitCount = 64;
    var max_times = 0;
    var historyData = {};
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var timeDelay = {
        search: []
    };


    document.getElementById("btn_stop").disabled = true;
    document.getElementById("btn_restore").disabled = true;
    document.getElementById("btn_start").disabled = true;
    document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i >";
    var datetime_start = Date.parse($("#start_date").val() + " " + $("#start_time").val());
    var datetime_end = Date.parse($("#end_date").val() + " " + $("#end_time").val());
    if (datetime_end - datetime_start < 60000) {
        return alert($.i18n.prop('i_alertTimeTooShort'));
    } else if (datetime_end - datetime_start > 86400000 * 7) { //86400000 = 一天的毫秒數
        if (!confirm($.i18n.prop('i_alertTimeTooLong')))
            return false;
    }


    this.getTimeline = {
        byTags: (function () {
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
                        var revInfo = ('Values' in revObj) == true ? revObj.Values : [];
                        if (revObj.success == 1) {
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
                            if (revObj.Status == "1") {
                                //以1小時為基準，分批接受並傳送要求
                                sendRequest({
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
        })(),
        byGroup: (function () {
            var group_id = $("#target_group_id").val();
            if (group_id.length == 0) return alert($.i18n.prop('i_searchNoGroup'));
            var datetime_start = Date.parse($("#start_date").val() + " " + $("#start_time").val());
            var datetime_end = Date.parse($("#end_date").val() + " " + $("#end_time").val());
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
                    var revInfo = ('Values' in revObj) == true ? revObj.Values : [];
                    if (revObj.success == 1) {
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
                        var revInfo = ('Values' in revObj) == true ? revObj.Values : [];
                        if (revObj.success == 1) {
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
        })()
    };

    this.drawTimeline = function (type) {
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
                    timeDelay["draw"].push(setInterval(drawNextTimeByTag, $("#interval").val())); //計時器賦值
                    break;
                case "Group":
                    if (!canvasImg.isPutImg) {
                        //第一個timeslot搜尋到的歷史軌跡的第一筆的map_id, 對應的地圖資訊
                        var mapInfo = mapCollection[historyData[timeslot_array[0]][times].map_id];
                        $("#target_map").val(mapInfo.map_id);
                        loadImage(mapInfo.map_src, mapInfo.map_scale);
                    }
                    timeDelay["draw"].push(setInterval(drawNextTimeByGroup, $("#interval").val())); //計時器賦值
                    break;
                default:
                    break;
            }
        } else {
            isContinue = false;
            document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\" ></i >";
            clearDrawInterval();
        }
    };

    this.startDraw = function () {

    };

    this.stopDraw = function () {

    };
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