'use strict';
const ALARM_TYPE = ["low_power", "help", "still", "active", "Fence", "stay", "hidden"];
var token = "",
    userName = "",
    PIXEL_RATIO, // 獲取瀏覽器像素比
    MapList = {}, //[map_id]{ map_name, map_file & map_file_ext, map_scale }
    groupfindMap = {},
    MemberList = {},
    tagArray = {},
    alarmArray = [],
    alarmFilterArr = [],
    canvasArray = [], //input myCanvas
    xmlHttp = {
        getTag: GetXmlHttpObject(),
        getAlarm: GetXmlHttpObject()
    },
    dot_size = {
        anchor: 10,
        tag: 10,
        alarm: 14
    },
    display_setting = {
        lock_window: false,
        fit_window: true,
        display_fence: true,
        display_no_position: true,
        display_alarm_low_power: true,
        display_alarm_active: true,
        display_alarm_still: true,
        smooth_display: false,
        smooth_launch_time: 1000
    },
    frames = 30,
    pageTimer = {
        dialog: null,
        timer1: null,
        draw_frame: {},
    },
    blingTimer = null,
    RedBling = true,
    isFocus = false,
    locating_id = "";


$(function () {
    //https://www.minwt.com/webdesign-dev/js/16298.html
    let h = document.documentElement.clientHeight,
        w = document.documentElement.clientWidth;
    $(".container").css("height", h - 10 + "px");
    /*$(".member-table").css("max-height", h + "px");
    $(".alarm-table").css("max-height", h + "px");
    $(".search-table").css("max-height", h + "px");*/
    //Check this page's permission and load navbar

    let userInfo = getUser();
    token = getToken();
    userName = userInfo ? userInfo.cname : "";
    if (!getPermissionOfPage("index")) {
        alert("Permission denied!");
        history.back();
    }
    setNavBar("index", "");

    //預設彈跳視窗載入後隱藏
    document.getElementById("member_dialog_btn_unlock").onclick = function () {
        unlockFocusAlarm();
        $("#member_dialog").dialog("close");
    };
    document.getElementById("alarm_dialog_btn_unlock").onclick = function () {
        unlockFocusAlarm();
        $("#alarm_dialog").dialog("close");
    };
    document.getElementById("search_start").onclick = search;
    setDialog.displaySetting();
    setDialog.displaySize();
    setDialog.separateCanvas();
    $("#member_dialog").dialog({
        autoOpen: false
    });
    $("#alarm_dialog").dialog({
        autoOpen: false
    });
    $('#myModal').modal({
        backdrop: false,
        show: false
    });
    setup();
});

function setup() {
    dot_size = getSizeFromCookie();
    display_setting = getFocusSetFromCookie();
    let separate_canvas = Cookies.get("separate_canvas");
    canvasMode(separate_canvas);
    if (token != "") {
        getMemberData();
        getMapGroup();
        getMaps();
        blingTimer = setInterval('changeAlarmLight()', 1000);
    }
}

function setSizeToCookie(Size) {
    Cookies.set("anchor_size", Size.anchor);
    Cookies.set("tag_size", Size.tag);
    Cookies.set("alarm_size", Size.alarm);
    dot_size = getSizeFromCookie();
}

function setFocusSetToCookie(Setting) {
    Cookies.set("display_setting", JSON.stringify(Setting));
    display_setting = getFocusSetFromCookie();
}

function selectMap(number, map_id) {
    let index = number == 0 ? number : number - 1;
    canvasArray[index].inputMap(map_id);
}

function changeMapToCookie(index, map_id) {
    let cookie = Cookies.get("recent_map"),
        currentMaps = typeof (cookie) === 'undefined' ? [] : JSON.parse(cookie);
    if (typeof (currentMaps) !== 'object') {
        Cookies.set("recent_map", JSON.stringify([]));
    }
    if (index > -1)
        currentMaps.splice(index, 1, map_id);
    //移除此Canvas index的Map_id，再填空字串進去
    Cookies.set("recent_map", JSON.stringify(currentMaps));
    //將陣列轉換成Json字串存進cookie中
}

function loadMapToCanvas() {
    Stop();
    let cookie = Cookies.get("recent_map"), //載入MapCookies
        recentMaps = typeof (cookie) === 'undefined' ? [] : JSON.parse(cookie);
    if (typeof (recentMaps) !== 'object') {
        Cookies.set("recent_map", JSON.stringify([]));
    }
    //按照以建立的Canvas數量，依序載入地圖設定
    canvasArray.forEach(function (canvas, i) {
        if (recentMaps[i])
            canvas.inputMap(recentMaps[i]);
        else
            canvas.inputMap("");
    });
    Start();
}

function draw() {
    canvasArray.forEach(canvas => {
        canvas.draw();
    });
}

function Start() {
    //設定計時器
    let send_time = 200; //millisecond
    frames = 1; //幀數
    if (display_setting.smooth_display) {
        send_time = display_setting.smooth_launch_time;
        frames = Math.floor(send_time / 33); //Drawing one frame took 33ms.
    }
    pageTimer["timer1"] = setInterval(function () {
        updateAlarmList();
        updateTagList();
    }, send_time);
    updateAlarmHandle();
}

function Stop() {
    for (let each in pageTimer) {
        if (each == "draw_frame") {
            for (let canvas in pageTimer[each]) {
                pageTimer[each][canvas].forEach(timeout => {
                    clearTimeout(timeout);
                });
                pageTimer[each][canvas] = [];
            }
        } else {
            clearInterval(pageTimer[each]);
        }
    }
}

function setSizeToCookie(Size) {
    Cookies.set("anchor_size", Size.anchor);
    Cookies.set("tag_size", Size.tag);
    Cookies.set("alarm_size", Size.alarm);
    dot_size = getSizeFromCookie();
}

function setFocusSetToCookie(Setting) {
    Cookies.set("display_setting", JSON.stringify(Setting));
    display_setting = getFocusSetFromCookie();
}

function getMaps() {
    const json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"],
        "api_token": [token]
    });
    let jxh = createJsonXmlHttp("sql");
    jxh.onreadystatechange = function () {
        if (jxh.readyState == 4 || jxh.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                let revInfo = revObj.Value[0].Values || [];
                revInfo.forEach(v => {
                    MapList[v.map_id] = {
                        name: v.map_name,
                        src: "data:image/" + v.map_file_ext + ";base64," + v.map_file,
                        scale: typeof (v.map_scale) != 'undefined' && v.map_scale != "" ? v.map_scale : 1
                    };
                });
                loadMapToCanvas(); //接收並載入Server的地圖設定到按鈕
            } else {
                alert($.i18n.prop('i_failed_loadMap'));
            }
        }
    };
    jxh.send(json_request);
}

function getMapGroup() {
    const json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps_Groups"],
        "api_token": [token]
    });
    let jxh = createJsonXmlHttp("sql");
    jxh.onreadystatechange = function () {
        if (jxh.readyState == 4 || jxh.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                let revInfo = revObj.Value[0].Values || [];
                revInfo.forEach(element => {
                    groupfindMap[element.group_id] = element.map_id;
                });
            }
        }
    };
    jxh.send(json_request);
}

function getMemberData() {
    const json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetStaffs"],
        "api_token": [token]
    });
    let jxh = createJsonXmlHttp("sql");
    jxh.onreadystatechange = function () {
        if (jxh.readyState == 4 || jxh.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                let revInfo = revObj.Value[0].Values || [];
                revInfo.forEach(element => {
                    let user_id = parseInt(element.tag_id.substring(8), 16);
                    MemberList[user_id] = {
                        tag_id: element.tag_id,
                        card_id: element.card_id,
                        number: element.number,
                        name: element.Name,
                        dept: element.department,
                        job_title: element.jobTitle,
                        type: element.type,
                        color: element.color,
                        alarm_group_id: element.alarm_group_id
                    };
                });
            }
        }
    };
    jxh.send(json_request);
}

function setMemberPhoto(img_id, number_id, number) {
    if (number == "") {
        $("#" + img_id).attr('src', "");
    } else {
        const json_request = JSON.stringify({
            "Command_Type": ["Read"],
            "Command_Name": ["GetOneStaff"],
            "Value": {
                "number": number
            },
            "api_token": [token]
        });
        let jxh = createJsonXmlHttp("sql");
        jxh.onreadystatechange = function () {
            if (jxh.readyState == 4 || jxh.readyState == "complete") {
                let revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0 && revObj.Value[0].Values) {
                    let revInfo = revObj.Value[0].Values[0];
                    if (document.getElementById(number_id).innerText != number)
                        return;
                    if (revInfo.file_ext != "" && revInfo.photo != "")
                        document.getElementById(img_id).setAttribute("src", "data:image/" + revInfo.file_ext + ";base64," + revInfo.photo);
                    else
                        document.getElementById(img_id).setAttribute("src", "");
                }
            }
        };
        jxh.send(json_request);
    }
}

function changeAlarmLight() {
    let alarmSideBar_icon = document.getElementById("alarmSideBar_icon");
    if (alarmFilterArr.length > 0) {
        RedBling = !RedBling;
        if (RedBling)
            alarmSideBar_icon.style.color = "red";
        else
            alarmSideBar_icon.style.color = "white";
    } else {
        alarmSideBar_icon.style.color = "white";
    }
}

function updateAlarmHandle() {
    const json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["gethandlerecord50"],
        "api_token": [token]
    });
    let jxh = createJsonXmlHttp("alarmhandle");
    jxh.onreadystatechange = function () {
        if (jxh.readyState == 4 || jxh.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                let revInfo = "Values" in revObj.Value[0] ? revObj.Value[0].Values : [],
                    len = revInfo.length,
                    html = "";
                for (let i = 0; i < revInfo.length; i++) {
                    let tag_id = revInfo[i].tagid,
                        number = tag_id in MemberList ? MemberList[tag_id].number : "",
                        name = tag_id in MemberList ? MemberList[tag_id].name : "";
                    html = "<tr><td>" + (len - i) +
                        "</td><td>" + revInfo[i].alarmtype +
                        "</td><td>" + parseInt(tag_id.substring(8), 16) +
                        "</td><td>" + number +
                        "</td><td>" + name +
                        "</td><td>" + revInfo[i].alarmhelper +
                        "</td><td>" + revInfo[i].endtime +
                        "</td></tr>" + html;
                }
                document.getElementById("table_rightbar_alarm_list").children[1].innerHTML = html;
            }
        }
    };
    jxh.send(json_request);
}

function updateAlarmList() {
    const json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetAlarmTop50List"],
        "api_token": [token]
    });
    xmlHttp["getAlarm"].open("POST", "request", true);
    xmlHttp["getAlarm"].setRequestHeader("Content-type", "application/json");
    xmlHttp["getAlarm"].onreadystatechange = function () {
        if (xmlHttp["getAlarm"].readyState == 4 || xmlHttp["getAlarm"].readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value) {
                let revInfo = revObj.Value[0] || [],
                    update = 0,
                    temp_arr = alarmFilterArr;
                alarmFilterArr = [];
                revInfo.forEach(element => {
                    if (ALARM_TYPE.indexOf(element.tag_alarm_type) > -1) {
                        let tag_id = element.tag_id,
                            number = tag_id in MemberList ? MemberList[tag_id].number : "",
                            name = tag_id in MemberList ? MemberList[tag_id].name : "";
                        if (element.tag_alarm_type == "low_power" && !display_setting.display_alarm_low_power)
                            return;
                        if (element.tag_alarm_type == "active" && !display_setting.display_alarm_active)
                            return;
                        if (element.tag_alarm_type == "still" && !display_setting.display_alarm_still)
                            return;
                        alarmFilterArr.push({ //添加元素到陣列的開頭
                            id: tag_id,
                            number: number,
                            name: name,
                            alarm_type: element.tag_alarm_type,
                            alarm_time: element.tag_time,
                            count: element.counter
                        });
                        update += temp_arr.findIndex(function (info) {
                            return info.id == tag_id && info.alarm_type == element.tag_alarm_type;
                        }) > -1 ? 0 : 1; //計算新增筆數
                    }
                });

                if (update > 0 || alarmFilterArr.length != temp_arr.length) {
                    //Alarm Card & Dialog
                    document.getElementsByClassName("thumbnail_columns")[0].innerHTML = "";
                    alarmFilterArr.forEach(function (element, i) {
                        inputAlarmData(element, i);
                    });
                    //Focus the newest alarm tag
                    locateTag(alarmFilterArr[alarmFilterArr.length - 1].id);
                } else {
                    alarmFilterArr.forEach(function (element) {
                        let tagid_alarm = element.id + element.alarm_type,
                            time_arr = TimeToArray(element.alarm_time);
                        document.getElementById("count_" + tagid_alarm).innerText = element.count;
                        document.getElementById("date_" + tagid_alarm).innerText = time_arr.date;
                        document.getElementById("time_" + tagid_alarm).innerText = time_arr.time;
                    });
                }
            }
        }
    };
    xmlHttp["getAlarm"].send(json_request);
}

function inputTagPoints(old_point, new_point) {
    let point_array = [];
    /* Note:
        old_point = temp_arr[element.tag_id].point[frames-1];
        new_point = element;*/
    if (!old_point || old_point.group_id != new_point.group_id) {
        for (let i = 0; i < frames; i++) {
            point_array.push({
                x: parseFloat(new_point.tag_x),
                y: parseFloat(new_point.tag_y),
                group_id: new_point.group_id
            });
        }
    } else {
        let frame_move = {
            x: (new_point.tag_x - old_point.x) / frames,
            y: (new_point.tag_y - old_point.y) / frames
        };
        for (let i = 0; i < frames; i++) {
            if (i == frames - 1) {
                point_array.push({
                    x: parseFloat(new_point.tag_x),
                    y: parseFloat(new_point.tag_y),
                    group_id: new_point.group_id
                });
            } else {
                point_array.push({
                    x: old_point.x + frame_move.x * (i + 1),
                    y: old_point.y + frame_move.y * (i + 1),
                    group_id: new_point.group_id
                });
            }
        }
    }
    return point_array;
}

function updateTagList() {
    const json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetTagList"],
        "api_token": [token]
    });
    xmlHttp["getTag"].open("POST", "requestTagList_json", true);
    xmlHttp["getTag"].setRequestHeader("Content-type", "application/json");
    xmlHttp["getTag"].onreadystatechange = function () {
        if (xmlHttp["getTag"].readyState == 4 || xmlHttp["getTag"].readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (!checkTokenAlive(token, revObj)) {
                //console.log("get datas : " + new Date().getTime());
                let revInfo = revObj,
                    tagArrTemp = {},
                    update = 0,
                    focus_data = null;

                revInfo.forEach(element => { //=new Tag datas
                    let number = element.tag_id in MemberList ? MemberList[element.tag_id].number : "",
                        name = element.tag_id in MemberList ? MemberList[element.tag_id].name : "",
                        color = element.tag_id in MemberList ? MemberList[element.tag_id].color : "",
                        old_point = tagArray[element.tag_id] ? tagArray[element.tag_id].point[frames - 1] : null,
                        point_array = inputTagPoints(old_point, element); //tagArray = oldArray
                    //update tag array
                    if (element.tag_id == locating_id) {
                        focus_data = {
                            id: element.tag_id,
                            point: point_array,
                            system_time: element.tag_time,
                            color: color,
                            number: number,
                            name: name,
                            type: "normal",
                        };
                    } else {
                        tagArrTemp[element.tag_id] = {
                            id: element.tag_id,
                            point: point_array,
                            system_time: element.tag_time,
                            color: color,
                            number: number,
                            name: name,
                            type: "normal"
                        };
                    }
                    element["number"] = number;
                    element["name"] = name;
                    update += tagArray[element.tag_id] ? 0 : 1;
                });
                if (focus_data)
                    tagArrTemp[locating_id] = focus_data;
                if (update > 0) {
                    let html = "";
                    //update member list
                    revInfo.sort(function (a, b) {
                        let A = parseInt(a.tag_id.substring(8), 16),
                            B = parseInt(b.tag_id.substring(8), 16);
                        return A - B;
                    });
                    revInfo.forEach(function (v, i) {
                        html += "<tr><td>" + (i + 1) +
                            "</td><td>" + parseInt(v.tag_id.substring(8), 16) +
                            "</td><td>" + v.number +
                            "</td><td>" + v.name +
                            "</td><td><button class=\"btn btn-default btn-focus\"" +
                            " onclick=\"locateTag(\'" + v.tag_id + "\')\">" +
                            "<img class=\"icon-image\" src=\"../image/target.png\"></button>" +
                            "</td></tr>";
                    });
                    document.getElementById("table_rightbar_member_list").children[1].innerHTML = html; //tbody
                }
                tableFilter("table_filter_member", "table_rightbar_member_list");

                tagArray = tagArrTemp;
                tagArrTemp = {};
                //定時比對tagArray更新alarmArray
                alarmArray = []; //每次更新都必須重置alarmArray
                alarmFilterArr.forEach(element => {
                    if (element.id in tagArray) {
                        alarmArray.push({ //依序將Tag資料放入AlarmArray中
                            id: element.id,
                            point: tagArray[element.id].point,
                            status: element.alarm_type,
                            alarm_time: element.alarm_time
                        });
                        tagArray[element.id].type = "alarm";
                    }
                });

                //console.log("update tag array : " + new Date().getTime());
                draw();
            }
        }
    };
    xmlHttp["getTag"].send(json_request);
    //console.log("send request : " + new Date().getTime());
}

function sortAlarm() {
    let btn = document.getElementById("btn_sort_alarm");
    if (btn.children[0].classList.contains("fa-sort-amount-up")) {
        btn.title = $.i18n.prop('i_oldestTop');
        btn.innerHTML = "<i class=\"fas fa-sort-amount-down\"></i>";
    } else {
        btn.title = $.i18n.prop('i_lastestTop');
        btn.innerHTML = "<i class=\"fas fa-sort-amount-up\"></i>";
    }
    alarmFilterArr = [];
}

function changeFocusAlarm(tag_id, alarm_type) { //改變鎖定定位的Alarm目標
    let index = alarmFilterArr.findIndex(function (info) { //抓取指定AlarmTag的位置
        return info.id == tag_id && info.alarm_type == alarm_type;
    });
    if (index == -1) return alert("此警報已解除或逾時，可在事件處理紀錄中查詢!");
    let temp = alarmFilterArr[index];
    alarmFilterArr.splice(index, 1);
    alarmFilterArr.push(temp);
    locateTag(temp.id);
}

function releaseFocusAlarm(tag_id, alarm_type) { //解除指定的alarm
    let index = alarmFilterArr.findIndex(function (info) { //抓取指定AlarmTag的位置
        return info.id == tag_id && info.alarm_type == alarm_type;
    });
    if (index > -1) {
        let tag_id = alarmFilterArr[index].id;
        const json_request = JSON.stringify({
            "Command_Name": ["addhandlerecord"],
            "Value": [{
                "alarmtype": alarmFilterArr[index].alarm_type,
                "alarmhelper": userName,
                "tagid": tag_id
            }],
            "api_token": [token]
        });
        let jxh = createJsonXmlHttp("alarmhandle");
        jxh.onreadystatechange = function () {
            if (jxh.readyState == 4 || jxh.readyState == "complete") {
                let revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj)) {
                    let revInfo = revObj.Value[0];
                    if (revInfo.success == 1) {
                        if (document.getElementById("alarm_dialog_id").innerText == parseInt(tag_id.substring(8), 16))
                            $("#alarm_dialog").dialog("close");
                        updateAlarmHandle();
                    }
                }
            }
        };
        jxh.send(json_request);
    }
}

function unlockFocusAlarm() { //解除定位
    isFocus = false;
    canvasArray.forEach(canvas => {
        canvas.adjust.unlockFocusCenter();
    });
}

function checkMapIsUsed(map_id) {
    let check = canvasArray.findIndex(function (canvas) {
        return canvas.Map_id() == map_id;
    });
    if (check == -1) {
        canvasArray[0].inputMap(map_id);
    }
}

function locateTag(tag_id) {
    if (tag_id in tagArray) {
        isFocus = true;
        locating_id = tag_id;
        checkMapIsUsed(groupfindMap[tagArray[tag_id].point[frames - 1].group_id]);
    } else {
        showAlertDialog();
    }
}

function showAlertDialog() {
    let dialog = document.getElementById("alert_window");
    if (display_setting.display_no_position) {
        dialog.style.display = 'block';
        dialog.classList.remove("fadeOut");
        pageTimer["dialog"] = setTimeout(function () {
            dialog.classList.add("fadeOut");
            clearTimeout(pageTimer["dialog"]);
        }, 1200);
    }
}

function search() {
    let html = "";
    let key = $("#search_select_type").val();
    let value = $("#search_input_target").val();
    if (key == "map") {
        for (let map_id in MapList) {
            if (map_id == value || MapList[map_id].name == value) {
                let group_arr = [];
                for (let i in groupfindMap) {
                    if (groupfindMap[i] == map_id)
                        group_arr.push(i);
                }
                for (let j in tagArray) {
                    let v = tagArray[j];
                    group_arr.forEach(group_id => {
                        if (v.point[frames - 1].group_id == group_id) {
                            let user_id = parseInt(v.id.substring(8), 16),
                                member_data = MemberList[user_id] || {
                                    dept: "",
                                    job_title: "",
                                    type: ""
                                };
                            html += "<tr>" +
                                "<td>" + user_id + "</td>" +
                                "<td>" + v.number + "</td>" +
                                "<td>" + v.name + "</td>" +
                                "<td>" + member_data.dept + "</td>" +
                                "<td>" + member_data.job_title + "</td>" +
                                "<td>" + member_data.type + "</td>" +
                                //"<td>" + member_data.alarm_group_id + "</td>" +
                                "<td><button class=\"btn btn-default btn-focus\"" +
                                " onclick=\"locateTag(\'" + v.id + "\')\">" +
                                "<img class=\"icon-image\" src=\"../image/target.png\">" +
                                "</button></td></tr>";
                        }
                    });
                }
            }
        }
    } else {
        let memberArray = [];
        for (let each in MemberList) { //each : 'user_id'
            if (key == "user_id") {
                if (each == value)
                    memberArray.push(MemberList[each]);
            } else if (MemberList[each][key]) {
                if (MemberList[each][key] == value)
                    memberArray.push(MemberList[each]);
            }
        }
        memberArray.forEach(element => {
            html += "<tr>" +
                "<td>" + parseInt(element.tag_id.substring(8), 16) + "</td>" +
                "<td>" + element.number + "</td>" +
                "<td>" + element.name + "</td>" +
                "<td>" + element.dept + "</td>" +
                "<td>" + element.job_title + "</td>" +
                "<td>" + element.type + "</td>" +
                //"<td>" + memberArray[i].alarm_group_id + "</td>" +
                "<td><button class=\"btn btn-default btn-focus\"" +
                " onclick=\"locateTag(\'" + element.tag_id + "\')\">" +
                "<img class=\"icon-image\" src=\"../image/target.png\">" +
                "</button></td></tr>";
        });
    }
    document.getElementById("table_sidebar_search").children[1].innerHTML = html;
}