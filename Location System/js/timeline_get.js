var noImagePng = "../image/no_image.png",
    locateColor = "#9c00f7",
    groupColor = "#ff9933";

var token = "",
    PIXEL_RATIO, // 獲取瀏覽器像素比
    chkUseInputMap, cvsBlock, canvas, ctx,
    canvasImg = {
        isPutImg: false,
        width: 0,
        height: 0,
        scale: 1 //預設比例尺為1:1
    },
    serverImg = new Image(),
    // View parameters
    lastX = 0, //滑鼠最後位置的X座標
    lastY = 0, //滑鼠最後位置的Y座標
    xleftView = 0, //canvas的X軸位移(負值向左，正值向右)
    ytopView = 0, //canvas的Y軸位移(負值向上，正值向下)
    Zoom = 1.0, //縮放比例
    isFitWindow = true,
    inputMapSrc = "",
    MapList = {},
    MemberData = {},
    HistoryData = {},
    AlarmList = {},
    displayAlarms = [],
    posAlarmData = null,
    locate_tag = "",
    times = 0,
    max_times = 0,
    timeslot_array = [],
    isContinue = false,
    timeDelay = {
        search: [],
        draw: [],
        model: "",
        dialog: ""
    },
    panPos = {
        canvasLeft: 0,
        canvasTop: 0
    };


$(function () {
    var h = document.documentElement.clientHeight;
    //$(".container").css("height", h - 10 + "px");
    $("#cvsBlock").css("height", h - 102 + "px");
    //Check this page's permission and load navbar
    token = getToken();
    if (!getPermissionOfPage("Timeline")) {
        alert("Permission denied!");
        window.location.href = '../index.html';
    }
    setNavBar("Timeline", "");

    $('.timepicker').bootstrapMaterialDatePicker({
        date: false,
        clearButton: true,
        lang: 'en',
        format: 'HH:mm'
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
                        "<td><button class=\"btn btn-default btn-focus\" onclick=\"locateTag(\'" + fullOf4Byte(target_id.val()) +
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
        save_array.forEach(function (html) {
            $("#table_target tbody").append("<tr>" + html + "</tr>");
        });
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
            $("#interval").text(ui.value);
        }
    });
    $("#interval").text($("#interval_slider").slider("value"));

    $("#interval_slider").mousedown(function () {
        $(this).mousemove(function () {
            clearDrawInterval();
            if (HistoryData["search_type"] && HistoryData["search_type"] == "Tag") {
                timeDelay["draw"].push(setInterval("drawNextTimeByTag()", $("#interval").text()));
            } else {
                timeDelay["draw"].push(setInterval("drawNextTimeByGroup()", $("#interval").text()));
            }
        });
        $(this).mouseup(function () {
            $(this).unbind('mousemove');
        });
    });

    $("#target_type").on('change', function () {
        switch ($(this).val()) {
            case "Tag":
                $("#target_group").hide();
                $("#target_alarm_handle").hide();
                $("#target_tag").show();
                $("#alarmBlock").hide();
                $("#timelineBlock").show();
                break;
            case "Group":
                $("#target_tag").hide();
                $("#target_alarm_handle").hide();
                $("#target_group").show();
                $("#alarmBlock").hide();
                $("#timelineBlock").show();
                break;
            default:
                $("#target_tag").hide();
                $("#target_group").hide();
                $("#target_alarm_handle").show();
                $("#timelineBlock").hide();
                $("#alarmBlock").show();
                break;
        }
    });

    $("#btn_resst_locate_tag").on('click', function () {
        changeLocateTag("");
    });

    $("input[name=radio_is_limit]").on("change", function () {
        if ($(this).prop('checked'))
            $("#limit_count").prop('disabled', $(this).val());
    });

    $("input[type=text]").prop("disabled", false);

    $("#chk_use_input_map").on("click", function () {
        if ($(this).prop('checked')) {
            $("#target_map").prop('disabled', true);
            if (inputMapSrc.length > 0)
                loadImage(inputMapSrc);
        } else {
            $("#target_map").prop('disabled', false);
        }
    })

    $("#btn_input_map").on("change", function () {
        var file = this.files[0];
        if (file && checkExt(this.value)) {
            var FR = new FileReader();
            FR.readAsDataURL(file);
            FR.onloadend = function (e) {
                var base64data = e.target.result;
                inputMapSrc = base64data;
                document.getElementById("input_map_src").value = file.name;
                if (chkUseInputMap.checked)
                    loadImage(base64data, 1);
            };
        }
    });

    setup();
});

function setup() {
    chkUseInputMap = document.getElementById("chk_use_input_map");
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
    setMobileEvents();
    getMemberNumber();
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
    xmlHttp.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"],
        "api_token": [token]
    }));
}

function getMemberNumber() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetStaffs"],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql"); //updateMemberList
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (!checkTokenAlive(token, revObj)) {
                return;
            } else if (revObj.Value[0].success > 0) {
                var memberArray = revObj.Value[0].Values || [];
                for (var i = 0; i < memberArray.length; i++) {
                    var user_id = parseInt(memberArray[i].tag_id.substring(8), 16);
                    MemberData[user_id] = {
                        tag_id: memberArray[i].tag_id,
                        number: memberArray[i].number,
                        name: memberArray[i].Name,
                        dept: memberArray[i].department,
                        photo: "",
                        card_id: memberArray[i].card_id
                    };
                }
            } else {
                alert($.i18n.prop('i_alertError_1'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function getMemberData(user_id) {
    if (!MemberData[user_id]) {
        MemberData[user_id] = { //新建一個空的成員資料到其中
            tag_id: "",
            number: "",
            name: "",
            dept: "",
            photo: noImagePng,
            card_id: ""
        };
        return;
    }
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetOneStaff"],
        "Value": {
            "number": MemberData[user_id].number
        },
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                if ("Values" in revObj.Value[0]) {
                    var revInfo = revObj.Value[0].Values[0];
                    if (revInfo.file_ext == "" || revInfo.photo == "")
                        MemberData[user_id].photo = noImagePng;
                    else
                        MemberData[user_id].photo = "data:image/" + revInfo.file_ext + ";base64," + revInfo.photo;
                }
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function inputMemberPhoto(src) {
    var thumb_width = parseInt($("#thumb_img").css('max-width'), 10);
    var thumb_height = parseInt($("#thumb_img").css('max-height'), 10);
    if (src.length > 0) {
        var img = new Image();
        img.src = src;
        img.onload = function () {
            var thumbSize = thumb_width / thumb_height;
            var imgSize = img.width / img.height;
            if (imgSize > thumbSize) { //原圖比例寬邊較長
                $("#thumb_img").attr('src', src);
                $("#thumb_img").width(thumb_width).height(img.height * (thumb_width / img.width));
            } else {
                $("#thumb_img").attr('src', src);
                $("#thumb_img").width(img.width * (thumb_height / img.height)).height(thumb_height);
            }
        }
    } else {
        $("#thumb_img").attr('src', noImagePng).width(thumb_width).height(thumb_height);
    }
}

function search() {
    if ($("#target_type").val() == "AlarmHandle") {
        return getAlarmHandleByTime();
    }
    stopTimeline();

    if ($("#start_date").val() == "")
        return alert("請選擇開始日期!");
    else if ($("#start_time").val() == "")
        return alert("請選擇開始時間!");
    else if ($("#end_date").val() == "")
        return alert("請選擇結束日期!");
    else if ($("#end_time").val() == "")
        return alert("請選擇結束時間!");

    var datetime_start = Date.parse($("#start_date").val() + " " + $("#start_time").val()),
        datetime_end = Date.parse($("#end_date").val() + " " + $("#end_time").val());
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
            HistoryData = {
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
            HistoryData = {
                search_type: "Group"
            };
            timeslot_array = [];
            getTimelineByGroup(group_id);
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
    var target_arr = [];
    var datetime = { //[Date, Time]
        start: [$("#start_date").val(), $("#start_time").val() + ":00"],
        end: [$("#end_date").val(), $("#end_time").val() + ":00"]
    };
    var func = {
        getCount: function () {
            document.getElementsByName("chk_target_id").forEach(function (tag_id) {
                getMemberData(parseInt(tag_id.value, 16));
                var request = {
                    "Command_Name": ["GetLocus_combine_with_record"],
                    "Command_Type": ["Read"],
                    "Value": {
                        "start_date": datetime.start[0],
                        "start_time": datetime.start[1],
                        "end_date": datetime.end[0],
                        "end_time": datetime.end[1],
                        "flag": "3",
                        "target": tag_id.value,
                        "startnum": "0",
                        "getcnt": "1"
                    },
                    "api_token": [token]
                };
                var xmlHttp = createJsonXmlHttp("sql");
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                        if (!this.responseText) {
                            $('#progress_block').hide();
                            clearTimeout(timeDelay["model"]);
                            alert("搜尋失敗，請稍候再試一次!");
                            return;
                        }
                        var revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                            var revInfo = revObj.Value[0].location || [{
                                "Status": "0"
                            }];
                            if (revInfo[0].Status == "1") {
                                var total = parseInt(revInfo[0].Values[0].count, 10);
                                interval_times += Math.ceil(total / 10000);
                                target_arr.push({
                                    tag_id: revInfo[0].tag_id,
                                    total: parseInt(total, 10)
                                });
                                if (target_arr.length == document.getElementsByName("chk_target_id").length)
                                    func.getDatas(target_arr[0].tag_id, "0", target_arr[0].total);
                            }
                        }
                    }
                };
                xmlHttp.send(JSON.stringify(request));
            });
        },
        getDatas: function (target, startnum, total) {
            if (total == 0)
                alert($.i18n.prop('i_tagID') + ":[" + parseInt(target, 16) + "]在此時段內無歷史資料");
            var request = {
                "Command_Name": ["GetLocus_combine_with_record"],
                "Command_Type": ["Read"],
                "Value": {
                    "flag": "3",
                    "target": target,
                    "start_date": datetime.start[0],
                    "start_time": datetime.start[1],
                    "end_date": datetime.end[0],
                    "end_time": datetime.end[1],
                    "startnum": startnum,
                    "getcnt": "0"
                },
                "api_token": [token]
            }
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    if (!this.responseText) {
                        $('#progress_block').hide();
                        clearTimeout(timeDelay["model"]);
                        alert("搜尋失敗，請稍候再試一次!");
                        return;
                    }
                    var revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                        var event = revObj.Value[0].event || [{
                            "Status": "0"
                        }];
                        if (event[0].Status == "1" && event[0].amount > 0) {
                            if (!AlarmList[event[0].tag_id])
                                AlarmList[event[0].tag_id] = {};
                            event[0].Values.forEach(function (element) {
                                AlarmList[event[0].tag_id][element.time] = {
                                    alarm_type: element.alarm_type,
                                    status: element.status
                                };
                            });
                        }
                        var location = revObj.Value[0].location || [{
                            "Status": "0"
                        }];
                        if (location[0].Status == "1") {
                            var tag_id = location[0].tag_id;
                            var values = location[0].Values;
                            if (values) {
                                for (var i = 0; i < values.length; i++) {
                                    if (values[i].map_id in MapList) {
                                        var mapInfo = MapList[values[i].map_id];
                                        var time = values[i].time;
                                        var time_arr = TimeToArray(time);
                                        var type = "normal";
                                        if (!HistoryData[tag_id])
                                            HistoryData[tag_id] = [];
                                        if (AlarmList[tag_id] && AlarmList[tag_id][time]) {
                                            type = AlarmList[tag_id][time].alarm_type;
                                            AlarmList[tag_id][time]["map_id"] = mapInfo.map_id;
                                            AlarmList[tag_id][time]["x"] = parseInt(values[i].coordinate_x, 10);
                                            AlarmList[tag_id][time]["y"] = parseInt(values[i].coordinate_y, 10);
                                        }
                                        HistoryData[tag_id].push({
                                            map_id: mapInfo.map_id,
                                            map_name: mapInfo.map_name,
                                            x: parseInt(values[i].coordinate_x, 10),
                                            y: parseInt(values[i].coordinate_y, 10),
                                            date: time_arr[0],
                                            time: time_arr[1],
                                            type: type
                                        });
                                    }
                                }
                            }
                            count_times++;
                            $("#progress_bar").text(Math.round(count_times / interval_times * 100) + " %");
                            var count = parseInt(startnum, 10) + location[0].amount;
                            if (total != count) {
                                //以10000筆資料為基準，分批接受並傳送要求
                                func.getDatas(tag_id, count.toString(), total);
                            } else {
                                //找最長的Tag歷史軌跡長度，定為一週期繪製軌跡的結束
                                if (HistoryData[tag_id] && HistoryData[tag_id].length > max_times)
                                    max_times = HistoryData[tag_id].length;
                                target_arr.splice(0, 1);
                                if (target_arr.length > 0)
                                    func.getDatas(target_arr[0].tag_id, "0", target_arr[0].total);
                                if (interval_times <= count_times) {
                                    completeSearch();
                                }
                            }
                        }
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
        }
    };
    AlarmList = {};
    return func.getCount();
}

function getTimelineByGroup(group_id) {
    var interval_times = 0;
    var count_times = 0;
    var tag_array = [];
    var datetime = { //[Date, Time]
        start: [$("#start_date").val(), $("#start_time").val() + ":00"],
        end: [$("#end_date").val(), $("#end_time").val() + ":00"]
    };
    var group_map = {
        id: "",
        name: ""
    };
    var func = {
        getMapGroup: function () {
            var request = {
                "Command_Type": ["Read"],
                "Command_Name": ["GetMaps_Groups"],
                "api_token": [token]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                        var revInfo = revObj.Value[0].Values || [];
                        var index = revInfo.findIndex(function (info) {
                            return info.group_id == group_id;
                        });
                        if (index == -1) {
                            $('#progress_block').hide();
                            clearTimeout(timeDelay["model"]);
                            return alert("此群組不存在，請輸入其他群組編號再查詢!");
                        }
                        group_map.id = revInfo[index].map_id;
                        group_map.name = MapList[revInfo[index].map_id].map_name;
                        func.getCount(group_id);
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
        },
        getCount: function (target) {
            var request = {
                "Command_Name": ["GetLocus_combine_with_record"],
                "Command_Type": ["Read"],
                "Value": {
                    "start_date": datetime.start[0],
                    "start_time": datetime.start[1],
                    "end_date": datetime.end[0],
                    "end_time": datetime.end[1],
                    "flag": "4",
                    "target": target,
                    "startnum": "0",
                    "getcnt": "1"
                },
                "api_token": [token]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    if (!this.responseText) {
                        $('#progress_block').hide();
                        clearTimeout(timeDelay["model"]);
                        alert("搜尋失敗，請稍候再試一次!");
                        return;
                    }
                    var revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                        var revInfo = revObj.Value[0].location || [{
                            "Status": "0"
                        }];
                        if (revInfo[0].Status == "1") {
                            var total = parseInt(revInfo[0].Values[0].count, 10);
                            interval_times += Math.ceil(total / 10000);
                            //console.log("total: " + total);
                            //console.log("interval_times: " + interval_times);
                            func.getDatas(target, "0", total);
                        }
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
        },
        getDatas: function (target, startnum, total) {
            if (total == 0)
                alert($.i18n.prop('i_groupID') + ":[" + target + "]在此時段內無歷史資料");
            var request = {
                "Command_Name": ["GetLocus_combine_with_record"],
                "Command_Type": ["Read"],
                "Value": {
                    "start_date": datetime.start[0],
                    "start_time": datetime.start[1],
                    "end_date": datetime.end[0],
                    "end_time": datetime.end[1],
                    "flag": "4",
                    "target": target,
                    "startnum": startnum,
                    "getcnt": "0"
                },
                "api_token": [token]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    if (!this.responseText) {
                        $('#progress_block').hide();
                        clearTimeout(timeDelay["model"]);
                        alert("搜尋失敗，請稍候再試一次!");
                        return;
                    }
                    var revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                        var event = revObj.Value[0].event || [{
                            "Status": "0"
                        }];
                        if (event[0].Status == "1" && event[0].amount > 0) {
                            event[0].Values.forEach(function (element) {
                                if (!AlarmList[element.time])
                                    AlarmList[element.time] = {};
                                AlarmList[element.time][element.tag_id] = {
                                    alarm_type: element.alarm_type,
                                    status: element.status
                                };
                            });
                        }
                        var location = revObj.Value[0].location || [{
                            "Status": "0"
                        }];
                        if (location[0].Status == "1") {
                            var revInfo = location[0].Values || [];
                            revInfo.forEach(function (v) {
                                //改成按照時間分類排序
                                var datetime_arr = TimeToArray(v.time);
                                var date_time = v.time.split(".")[0]; //將秒數的小數點去掉後歸類
                                var type = "normal";
                                if (AlarmList[v.time] && AlarmList[v.time][v.tag_id]) {
                                    type = AlarmList[v.time][v.tag_id].alarm_type;
                                    AlarmList[v.time][v.tag_id]["map_id"] = group_map.id;
                                    AlarmList[v.time][v.tag_id]["x"] = parseInt(v.coordinate_x, 10);
                                    AlarmList[v.time][v.tag_id]["y"] = parseInt(v.coordinate_y, 10);
                                }
                                if (!HistoryData[date_time]) {
                                    timeslot_array.push(date_time);
                                    HistoryData[date_time] = [];
                                }
                                HistoryData[date_time].push({
                                    tag_id: v.tag_id,
                                    map_id: group_map.id,
                                    map_name: group_map.name,
                                    x: parseInt(v.coordinate_x, 10),
                                    y: parseInt(v.coordinate_y, 10),
                                    date: datetime_arr[0],
                                    time: datetime_arr[1],
                                    type: type
                                });
                                if (tag_array.indexOf(v.tag_id) == -1)
                                    tag_array.push(v.tag_id);
                            });
                            count_times++
                            $("#progress_bar").text(Math.round(count_times / interval_times * 100) + " %");
                            var count = parseInt(startnum, 10) + location[0].amount;
                            if (total != count) {
                                //以10000筆資料為基準，分批接受並傳送要求
                                func.getDatas(location[0].group_id, count.toString(), total);
                            } else {
                                timeslot_array.sort(); //整理時間順序
                                tag_array.sort(); //整理標籤編號順序
                                $("#table_tag_list tbody").empty();
                                tag_array.forEach(function (tag_id) {
                                    var user_id = parseInt(tag_id.substring(8), 16);
                                    getMemberData(user_id);
                                    $("#table_tag_list tbody").append(
                                        "<tr><td><label name=\"tag_list_id\">" + user_id + "</label></td>" +
                                        "<td><label>" + MemberData[user_id].number + "</label></td>" +
                                        "<td><label>" + MemberData[user_id].name + "</label></td>" +
                                        "<td><button class=\"btn btn-default btn-focus\" onclick=\"changeLocateTag(\'" + tag_id +
                                        "\')\"><img class=\"icon-image\" src=\"../image/target.png\"></button></td></tr>"
                                    );
                                });
                                completeSearch();
                            }
                        }
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
        }
    };
    AlarmList = {};
    return func.getMapGroup();
}

function updateAlarmTable() {
    var count = 0;
    $("#alarm_table tbody").empty();
    switch (HistoryData["search_type"]) {
        case "Tag":
            for (var tag_id in AlarmList) {
                for (var time in AlarmList[tag_id]) {
                    count++;
                    $("#alarm_table tbody").append("<tr><td>" + count + "</td>" +
                        "<td>" + AlarmList[tag_id][time].alarm_type + "</td>" +
                        "<td>" + parseInt(tag_id, 16) + "</td>" +
                        "<td>" + time + "</td>" +
                        "<td><button class=\"btn btn-default btn-focus\"" +
                        " onclick=\"displayAlarmPos(\'" + tag_id + "\',\'" + time + "\')\">" +
                        "<img class=\"icon-image\" src=\"../image/target.png\"></button>" +
                        "</td></tr>");
                }
            }
            break;
        case "Group":
            for (var time in AlarmList) {
                for (var tag_id in AlarmList[time]) {
                    count++;
                    $("#alarm_table tbody").append("<tr><td>" + count + "</td>" +
                        "<td>" + AlarmList[time][tag_id].alarm_type + "</td>" +
                        "<td>" + parseInt(tag_id, 16) + "</td>" +
                        "<td>" + time + "</td>" +
                        "<td><button class=\"btn btn-default btn-focus\"" +
                        " onclick=\"displayAlarmPos(\'" + time + "\',\'" + tag_id + "\')\">" +
                        "<img class=\"icon-image\" src=\"../image/target.png\"></button>" +
                        "</td></tr>");
                }
            }
            break;
        default:
            break;
    }
}

function getAlarmHandleByTime() {
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                var MemberList = {};
                var revInfo = revObj.Value[0].Values || [];
                revInfo.forEach(function (element) {
                    MemberList[element.tag_id] = element;
                });
                var xmlHttp2 = createJsonXmlHttp("alarmhandle");
                xmlHttp2.onreadystatechange = function () {
                    if (xmlHttp2.readyState == 4 || xmlHttp2.readyState == "complete") {
                        var revObj2 = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj2) && revObj2.Value[0]) {
                            var revInfo = revObj2.Value[0].Values;
                            if (revObj2.Value[0].success == 0 || !revInfo || revInfo.length == 0)
                                return alert($.i18n.prop('i_searchNoData'));
                            var type = $("#target_alarm_type").val();
                            $("#table_alarm_handle tbody").empty();
                            for (var i = 0; i < revInfo.length; i++) {
                                if (type == "all" || revInfo[i].alarmtype == type) {
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
                    }
                };
                xmlHttp2.send(JSON.stringify({
                    "Command_Type": ["Read"],
                    "Command_Name": ["gethandlerecordbytime"],
                    "Value": [{
                        "start_date": $("#start_date").val(),
                        "start_time": $("#start_time").val() + ":00",
                        "end_date": $("#end_date").val(),
                        "end_time": $("#end_time").val() + ":00"
                    }],
                    "api_token": [token]
                }));
            }
        }
    };
    xmlHttp.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetStaffs"],
        "api_token": [token]
    }));
}


/**
 * Show Search Model
 */
function showSearching() {
    $('#progress_block').show();
    $("#progress_bar").text(0 + " %");
    timeDelay["model"] = setTimeout(function () {
        $('#progress_block').hide();
        clearTimeout(timeDelay["model"]);
    }, 3600000);
}

function completeSearch() {
    $('#progress_block').hide();
    clearTimeout(timeDelay["model"]);
    alert($.i18n.prop('i_searchOver'));
    var num = Object.keys(HistoryData).length;
    if (num <= 1)
        alert($.i18n.prop('i_searchNoData'));
    updateAlarmTable();
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

function checkExt(fileName) {
    var validExts = new Array(".png", ".jpg", ".jpeg"); // 可接受的副檔名
    var fileExt = fileName.substring(fileName.lastIndexOf('.'));
    if (validExts.indexOf(fileExt) < 0) {
        alert($.i18n.prop('i_fileError_2') + validExts.toString());
        return false;
    } else
        return true;
}