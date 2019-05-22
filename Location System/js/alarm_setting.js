var count_alarm_group = 0;
var timeGroupArr = [];
var SubMitType = "";
var alarmSettingArr = [];
var alarmModeArray = [{
        id: "low_power",
        name: "低電壓警報"
    },
    {
        id: "help",
        name: "緊急警報"
    },
    {
        id: "active",
        name: "移動警報"
    },
    {
        id: "still",
        name: "靜止警報"
    },
    {
        id: "fence",
        name: "電子圍籬"
    },
    {
        id: "stay",
        name: "滯留警報"
    },
    {
        id: "hidden",
        name: "隱匿警報"
    }
];


function createJsonXmlHttp(url) {
    var xmlHttp = null;
    try { // Firefox, Opera 8.0+, Safari
        xmlHttp = new XMLHttpRequest();
    } catch (e) { //Internet Explorer
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    return xmlHttp;
}

/*function inputAlarmSetting() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["time_group_id"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var revList = revObj.Values;
            if (revObj.success > 0) {
                var alarm_arr = ["low_power", "help", "active", "still", "stay", "hidden"];
                alarm_arr.forEach(element => {
                    if (revList[element + "_alarm"].on == 1)
                        $("#on_alarm_" + element).prop('checked', true);
                    else
                        $("#off_alarm_" + element).prop('checked', true);
                });
                if (revList["electronic_fence"].on == 1)
                    $("#on_alarm_fence").prop('checked', true);
                else
                    $("#off_alarm_fence").prop('checked', true);
                $("#stay_alarm_time").val(revList["stay_alarm"].time);
                $("#hidden_alarm_time").val(revList["hidden_alarm"].time);
            } else {
                alert("讀取TimeGroupList失敗，請再試一次!");
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}*/


function selectColumn(id) {
    $("#" + id).toggleClass("changeBgColor");
}


function removeMapGroup() {
    var checkboxs = document.getElementsByName("chkbox_map_group");
    var arr = [];
    for (j in checkboxs) {
        if (checkboxs[j].checked)
            arr.push(checkboxs[j].value);
    }
    arr.forEach(function (v) {
        $("#tr_map_group_" + v).remove();
    });
}

function displayNameOptions(array, select_id) {
    var options = "";
    array.forEach(element => {
        if (element.id == select_id) {
            options += "<option value=\"" + element.id + "\" selected=\"selected\">" +
                element.name + "</option>";
        } else {
            options += "<option value=\"" + element.id + "\">" + element.name + "</option>";
        }
    });
    return options;
}

function inputAlarmGroupTable() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAlarmGroup_list"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var revList = revObj.Values;
            if (revObj.success > 0 && revList) {
                alarmSettingArr = [];
                alarmSettingArr = revList.slice(0); //利用抽離全部陣列完成陣列拷貝
                $("#table_alarm_mode tbody").empty(); //先重置表格
                count_alarm_group = 0;
                for (i = 0; i < revList.length; i++) {
                    count_alarm_group++;
                    var tr_id = "tr_alarm_group_" + count_alarm_group;
                    var alarm_mode = "alarm_mode_" + count_alarm_group;
                    var modeCheckHtml = "";
                    for (j = 0; j < alarmModeArray.length; j++) {
                        var checkedText = revList[i].elements[j].alarm_switch == "0" ? "" : "checked";
                        var alarm_value = revList[i].elements[j].alarm_value == "-1" ? "" : revList[i].elements[j].alarm_value;
                        var endHtml = "</label>";
                        if (j == 5)
                            endHtml = ",&nbsp;&nbsp;</label>時間閾值 : " + alarm_value + " 秒<br>";
                        else if (j == 6)
                            endHtml = ",&nbsp;&nbsp;</label>時間閾值 : " + alarm_value + " 秒";
                        modeCheckHtml += "<input id=\"" + alarm_mode + "_" + j + "\" type='checkbox' class='beauty' " +
                            "name=\"" + alarm_mode + "\" value=\"" + revList[i].elements[j].alarm_iid + "\" " + checkedText + " disabled/>" +
                            "<label for=\"" + alarm_mode + "_" + j + "\">" + alarmModeArray[j].name + endHtml;
                    }
                    $("#table_alarm_mode tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                        "<input type=\"checkbox\" name=\"chkbox_alarm_group\" value=\"" + revList[i].alarm_gid + "\" " +
                        "onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_alarm_group + "</td>" +
                        "<td><input type='text' name=\"alarm_group_name\" value=\"" + revList[i].alarm_group_name + "\" " +
                        "style=\"width:100px;\" /></td>" +
                        "<td>" + modeCheckHtml + "</td>" +
                        "<td><label id=\"alarm_group_time\">" + revList[i].time_group_id + "</label></td>" +
                        "<td style='text-align:center;'><label for=\"btn_edit_alarm_mode_" + count_alarm_group +
                        "\" class='btn-edit' title='Edit the alarm mode'><i class='fas fa-edit' style='font-size: 18px;'></i></label>" +
                        "<input id=\"btn_edit_alarm_mode_" + count_alarm_group + "\" type='button' class='btn-hidden'" +
                        " onclick=\"editAlarmGroup(\'" + revList[i].alarm_gid + "\')\" /></td></tr>");
                }
            } else {
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function editAlarmGroup(id) {
    var index = alarmSettingArr.findIndex(function (info) {
        return info.alarm_gid == id;
    });
    var groupElement = alarmSettingArr[index].elements;
    $("#edit_alarm_group_id").val(alarmSettingArr[index].alarm_gid)
    $("#add_alarm_mode_name").val(alarmSettingArr[index].alarm_group_name);
    for (j = 0; j < alarmModeArray.length; j++) {
        var isCheck = false;
        if (groupElement[j].alarm_switch == "1")
            isCheck = true;
        if (j == 5 || j == 6) {
            var alarm_value = groupElement[j].alarm_value == "-1" ? "" : groupElement[j].alarm_value;
            $("#add_alarm_mode_time_" + j).val(alarm_value);
        }
        $("input[name=add_alarm_mode]").eq(j).prop("checked", isCheck).val(groupElement[j].alarm_iid);
    }
    $("#add_alarm_time_group").empty();
    $("#add_alarm_time_group").append(
        "<option value=\"1\">A</option>" +
        "<option value=\"2\">B</option>" +
        "<option value=\"3\">C</option>"
        //displayNameOptions(timeGroupArr, timeGroupArr[0].id)
    );
    $("#add_alarm_time_group").val(alarmSettingArr[index].time_group_id);
    SubMitType = "Edit";
    $("#dialog_add_alarm_group").dialog("open");
}

function getTimeGroups() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetTimeGroup"]
    };
    var xmlHttp = createJsonXmlHttp("GetTimeGroup");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var revList = revObj.Values;
            if (revObj.success > 0) {
                timeGroupArr = [];
                revList.forEach(element => {
                    timeGroupArr.push({
                        id: element.group_id,
                        name: element.group_name
                    });
                });
            } else {
                alert("讀取TimeGroupList失敗，請再試一次!");
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}


$(document).ready(function () {
    /*$('input[type=time]').timepicker({
        minTime: '00:00:00',
        maxHour: 23,
        maxMinutes: 59,
        startTime: '12:00:00'
    }); //設定Jquery日期元件*/

    //getTimeGroups(); //載入已設定的時段群組
    inputAlarmGroupTable(); //載入警報群組已設定的內容

    $("#btn_submit_alarm_setting").button().on("click", function () {
        var alarm_arr = ["low_power", "help", "active", "still", "stay", "hidden"];
        var request = {
            "Command_Type": ["Write"],
            "Command_Name": ["UpdateAlarmSetting"],
            "Value": {
                "low_power_alarm": {
                    "on": $("input[name=alarm_low_power]:checked").val()
                },
                "help_alarm": {
                    "on": $("input[name=alarm_help]:checked").val()
                },
                "active_alarm": {
                    "on": $("input[name=alarm_active]:checked").val()
                },
                "still_alarm": {
                    "on": $("input[name=alarm_still]:checked").val()
                },
                "stay_alarm": {
                    "on": $("input[name=alarm_stay]:checked").val(),
                    "time": $("#stay_alarm_time").val()
                },
                "hidden_alarm": {
                    "on": $("input[name=alarm_hidden]:checked").val(),
                    "time": $("#hidden_alarm_time").val()
                },
                "electronic_fence": {
                    "on": $("input[name=alarm_fence]:checked").val()
                }
            }
        };
        /*alarm_arr.forEach(element => {
            request.Value[element + "_alarm"]["on"] = $("input[name=alarm_" + element + "]:checked").val();
        });*/
        var submitXmlHttp = createJsonXmlHttp("sql");
        submitXmlHttp.onreadystatechange = function () {
            if (submitXmlHttp.readyState == 4 || submitXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    alert("寫入警報設定成功!");
                } else {
                    alert("寫入警報設定失敗，請再試一次!");
                }
            }
        };
        submitXmlHttp.send(JSON.stringify(request));
    });


    var dialog, form,
        name = $("#add_alarm_mode_name"),
        stay_time = $("#add_alarm_mode_time_5"),
        hidden_time = $("#add_alarm_mode_time_6"),
        time_group = $("#add_alarm_time_group"),
        allFields = $([]).add(name, time_group),
        modes = $("input[name=add_alarm_mode]"); //不用把add_modes放進allFields
    //tips = $( ".validateTips" );

    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        stay_time.removeClass("ui-state-error");
        hidden_time.removeClass("ui-state-error");
        var valid = true;

        valid = valid && checkLength(name, "not null", 1, 20);
        if ($("#add_alarm_mode_5").prop("checked"))
            valid = valid && checkLength(stay_time, "not null", 1, 20);
        if ($("#add_alarm_mode_6").prop("checked"))
            valid = valid && checkLength(hidden_time, "not null", 1, 20);
        valid = valid && checkLength(time_group, "not null", 1, 20);

        if (valid) {
            if (SubMitType == "Add") {
                var request_addGroupID = JSON.stringify({
                    "Command_Type": ["Write"],
                    "Command_Name": ["AddAlarmGroup"],
                    "Value": {
                        "alarm_group_name": name.val(),
                        "time_group_id": time_group.val()
                    }
                });
                var addIdXmlHttp = createJsonXmlHttp("sql");
                addIdXmlHttp.onreadystatechange = function () {
                    if (addIdXmlHttp.readyState == 4 || addIdXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        var revInfo = revObj.Values;
                        if (revObj.success > 0 && revInfo) {
                            var alarmModeGroupArr = [];
                            for (i in alarmModeArray) {
                                var isSwitch = "0",
                                    time_value = "-1";
                                if (modes.eq(i).prop("checked"))
                                    isSwitch = "1";
                                if (i == 5 || i == 6) {
                                    var alarm_time = $("#add_alarm_mode_time_" + i).val();
                                    time_value = alarm_time.length == 0 ? "-1" : alarm_time;
                                }
                                alarmModeGroupArr.push({
                                    "alarm_name": alarmModeArray[i].id,
                                    "alarm_switch": isSwitch,
                                    "alarm_value": time_value,
                                    "alarm_group_id": revInfo.alarm_gid
                                });
                            }
                            var requestElements = JSON.stringify({
                                "Command_Type": ["Write"],
                                "Command_Name": ["AddAlarmInfo"],
                                "Value": alarmModeGroupArr
                            });
                            var addXmlHttp = createJsonXmlHttp("sql");
                            addXmlHttp.onreadystatechange = function () {
                                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                                    var revObj = JSON.parse(this.responseText);
                                    //var revInfo = revObj.Values;
                                    if (revObj.success > 0) {
                                        //getTimeGroups();
                                        inputAlarmGroupTable();
                                    }
                                }
                            };
                            addXmlHttp.send(requestElements);
                            dialog.dialog("close");
                        }
                    }
                };
                addIdXmlHttp.send(request_addGroupID);
            } else if (SubMitType == "Edit") {
                var group_id = $("#edit_alarm_group_id").val();
                var request_EditInfo = JSON.stringify({
                    "Command_Type": ["Write"],
                    "Command_Name": ["EditAlarmGroupInfo"],
                    "Value": {
                        "alarm_gid": group_id,
                        "alarm_group_name": name.val(),
                        "time_group_id": time_group.val()
                    }
                });
                var addIdXmlHttp = createJsonXmlHttp("sql");
                addIdXmlHttp.onreadystatechange = function () {
                    if (addIdXmlHttp.readyState == 4 || addIdXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (revObj.success > 0) {
                            var alarmModeGroupArr = [];
                            for (i in alarmModeArray) {
                                var isSwitch = "0",
                                    time_value = "-1";
                                if (modes.eq(i).prop("checked"))
                                    isSwitch = "1";
                                if (i == 5 || i == 6) {
                                    var alarm_time = $("#add_alarm_mode_time_" + i).val();
                                    time_value = alarm_time.length == 0 ? "-1" : alarm_time;
                                }
                                alarmModeGroupArr.push({
                                    "alarm_iid": modes.eq(i).val(),
                                    "alarm_name": alarmModeArray[i].id,
                                    "alarm_switch": isSwitch,
                                    "alarm_value": time_value,
                                    "alarm_group_id": group_id
                                });
                            }
                            var requestElements = JSON.stringify({
                                "Command_Type": ["Write"],
                                "Command_Name": ["EditAlarmInfo"],
                                "Value": alarmModeGroupArr
                            });
                            var addXmlHttp = createJsonXmlHttp("sql");
                            addXmlHttp.onreadystatechange = function () {
                                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                                    var revObj = JSON.parse(this.responseText);
                                    //var revInfo = revObj.Values;
                                    if (revObj.success > 0) {
                                        //getTimeGroups();
                                        inputAlarmGroupTable();
                                    }
                                }
                            };
                            addXmlHttp.send(requestElements);
                            dialog.dialog("close");
                        }
                    }
                };
                addIdXmlHttp.send(request_EditInfo);
            } else {
                return;
            }
            return valid;
        };
    }

    dialog = $("#dialog_add_alarm_group").dialog({
        autoOpen: false,
        height: 550,
        width: 350,
        modal: true,
        buttons: {
            "Confirm": SendResult,
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
                stay_time.removeClass("ui-state-error");
                hidden_time.removeClass("ui-state-error");
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
            stay_time.removeClass("ui-state-error");
            hidden_time.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        SendResult();
    });

    /**
     * 新增Alarm Group
     */
    $("#btn_add_alarm_group").button().on("click", function () {
        //getTimeGroups();
        $("#add_alarm_time_group").empty();
        $("#add_alarm_time_group").append(
            "<option value=\"1\">A</option>" +
            "<option value=\"2\">B</option>" +
            "<option value=\"3\">C</option>"
            //displayNameOptions(timeGroupArr, timeGroupArr[0].id)
        );
        $("input[name=add_alarm_mode]").val("");
        $("#add_alarm_mode_6_time").val("");
        $("#add_alarm_mode_7_time").val("");
        SubMitType = "Add";
        dialog.dialog("open");
    });

    /**
     * 刪除Alarm Groups
     */
    $("#btn_delete_alarm_group").button().on("click", function () {
        var checkboxs = document.getElementsByName("chkbox_alarm_group");
        var sel_group_arr = [];
        for (i in checkboxs) {
            if (checkboxs[i].checked)
                sel_group_arr.push({
                    "alarm_gid": checkboxs[i].value
                });
        }
        var request_DelInfo = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["DeleteAlarmGroupInfo"],
            "Value": sel_group_arr
        });
        var deleteIDXmlHttp = createJsonXmlHttp("sql");
        deleteIDXmlHttp.onreadystatechange = function () {
            if (deleteIDXmlHttp.readyState == 4 || deleteIDXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    var sel_alarm_arr = [];
                    for (j in sel_group_arr) {
                        var g_index = alarmSettingArr.findIndex(function (info) {
                            return info.alarm_gid == sel_group_arr[j].alarm_gid;
                        });
                        alarmSettingArr[g_index].elements.forEach(function (element) {
                            sel_alarm_arr.push({
                                "alarm_iid": element.alarm_iid
                            });
                        });
                    }
                    var requestElements = JSON.stringify({
                        "Command_Type": ["Write"],
                        "Command_Name": ["DeleteAlarmInfo"],
                        "Value": sel_alarm_arr
                    });
                    var deleteXmlHttp = createJsonXmlHttp("sql");
                    deleteXmlHttp.onreadystatechange = function () {
                        if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
                            var revObj = JSON.parse(this.responseText);
                            if (revObj.success > 0) {

                                inputAlarmGroupTable();
                                alert("Success delete the alarm groups");
                            }
                        }
                    };
                    deleteXmlHttp.send(requestElements);
                }
            }
        };
        deleteIDXmlHttp.send(request_DelInfo);
    });
});