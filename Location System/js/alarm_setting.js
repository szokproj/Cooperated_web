var token = "";
var count_alarm_group = 0;
var timeGroupArr = [];
var SubMitType = "";
var alarmSettingArr = [];
var alarmModeArray = [{
        id: "low_power",
        name: 'i_lowPowerAlarm'
    },
    {
        id: "help",
        name: 'i_helpAlarm'
    },
    {
        id: "active",
        name: 'i_activeAlarm'
    },
    {
        id: "still",
        name: 'i_stillAlarm'
    },
    {
        id: "Fence",
        name: 'i_electronicFence'
    },
    {
        id: "stay",
        name: 'i_stayAlarm'
    },
    {
        id: "hidden",
        name: 'i_hiddenAlarm'
    }
];

$(function () {
    token = getUser() ? getUser().api_token : "";
    /**
     * Check this page's permission and load navbar
     */
    if (!getPermissionOfPage("Alarm_Setting")) {
        alert("Permission denied!");
        window.location.href = '../index.html';
    }
    setNavBar("Alarm_Setting", "");


    $('.timepicker').bootstrapMaterialDatePicker({
        date: false,
        clearButton: true,
        lang: 'en',
        format: 'HH:mm'
    });

    /*$("#btn_submit_alarm_setting").button().on("click", function () {
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
            },
            "api_token": [token]
        };
        //var alarm_arr = ["low_power", "help", "active", "still", "stay", "hidden"];
        //alarm_arr.forEach(element => {
        //    request.Value[element + "_alarm"]["on"] = $("input[name=alarm_" + element + "]:checked").val();
        //});
        var submitXmlHttp = createJsonXmlHttp("sql");
        submitXmlHttp.onreadystatechange = function () {
            if (submitXmlHttp.readyState == 4 || submitXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    alert($.i18n.prop('i_alarmAlert_2'));
                } else {
                    alert($.i18n.prop('i_alarmAlert_3'));
                }
            }
        };
        submitXmlHttp.send(JSON.stringify(request));
    });*/


    var dialog, form,
        name = $("#add_alarm_mode_name"),
        fenceAG_id = $("#add_alarm_mode_4_fagID"),
        fenceAG_time = $("#add_alarm_mode_4_time"),
        stay_time = $("#add_alarm_mode_5_time"),
        hidden_time = $("#add_alarm_mode_6_time"),
        time_group = $("#add_alarm_time_group"),
        allFields = $([]).add(name).add(fenceAG_id).add(fenceAG_time)
        .add(stay_time).add(hidden_time).add(time_group),
        modes = $("input[name=add_alarm_mode]"); //不用把add_modes放進allFields

    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(name, $.i18n.prop('i_alarmAlert_4'), 1, 100);
        if ($("#add_alarm_mode_4").prop("checked")) {
            valid = valid && checkLength(fenceAG_id, $.i18n.prop('i_alarmAlert_49'), 1, 100);
            valid = valid && checkLength(fenceAG_time, $.i18n.prop('i_alarmAlert_4'), 1, 100);
        }
        if ($("#add_alarm_mode_5").prop("checked"))
            valid = valid && checkLength(stay_time, $.i18n.prop('i_alarmAlert_4'), 1, 100);
        if ($("#add_alarm_mode_6").prop("checked"))
            valid = valid && checkLength(hidden_time, $.i18n.prop('i_alarmAlert_4'), 1, 100);
        valid = valid && checkLength(time_group, $.i18n.prop('i_alarmAlert_4'), 1, 100);

        if (valid) {
            if (SubMitType == "Add") {
                var request_addGroupID = JSON.stringify({
                    "Command_Type": ["Write"],
                    "Command_Name": ["AddAlarmGroup"],
                    "Value": {
                        "alarm_group_name": name.val(),
                        "time_group_id": time_group.val()
                    },
                    "api_token": [token]
                });
                var addIdXmlHttp = createJsonXmlHttp("sql");
                addIdXmlHttp.onreadystatechange = function () {
                    if (addIdXmlHttp.readyState == 4 || addIdXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                            var revInfo = revObj.Value[0].Values;
                            var alarmModeGroupArr = [];
                            for (i in alarmModeArray) {
                                var isSwitch = "0",
                                    alarm_value = "-1";
                                if (modes.eq(i).prop("checked")) {
                                    isSwitch = "1";
                                    if (i == 4) {
                                        var fag_info_id = $("#add_alarm_mode_4_id").val();
                                        alarm_value = fag_info_id.length == 0 ? "-1" : fag_info_id;
                                    } else if (i > 4) {
                                        var alarm_time = $("#add_alarm_mode_" + i + "_time").val();
                                        alarm_value = alarm_time.length == 0 ? "-1" : alarm_time;
                                    }
                                }
                                alarmModeGroupArr.push({
                                    "alarm_name": alarmModeArray[i].id,
                                    "alarm_switch": isSwitch,
                                    "alarm_value": alarm_value,
                                    "alarm_group_id": revInfo.alarm_gid
                                });
                            }
                            var requestElements = JSON.stringify({
                                "Command_Type": ["Write"],
                                "Command_Name": ["AddAlarmInfo"],
                                "Value": alarmModeGroupArr,
                                "api_token": [token]
                            });
                            var addXmlHttp = createJsonXmlHttp("sql");
                            addXmlHttp.onreadystatechange = function () {
                                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                                    var revObj = JSON.parse(this.responseText);
                                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                                        addFenceAG_info(revInfo.alarm_gid);
                                    }
                                }
                            };
                            addXmlHttp.send(requestElements);
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
                    },
                    "api_token": [token]
                });
                var addIdXmlHttp = createJsonXmlHttp("sql");
                addIdXmlHttp.onreadystatechange = function () {
                    if (addIdXmlHttp.readyState == 4 || addIdXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                            var alarmModeGroupArr = [];
                            for (i in alarmModeArray) {
                                var isSwitch = "0",
                                    alarm_value = "-1";
                                if (modes.eq(i).prop("checked")) {
                                    isSwitch = "1";
                                    if (i == 4) {
                                        var fag_info_id = $("#add_alarm_mode_4_id").val();
                                        alarm_value = fag_info_id.length > 0 ? fag_info_id : "-1";
                                    } else if (i > 4) {
                                        var alarm_time = $("#add_alarm_mode_" + i + "_time").val();
                                        alarm_value = alarm_time.length > 0 ? alarm_time : "-1";
                                    }
                                }
                                alarmModeGroupArr.push({
                                    "alarm_iid": modes.eq(i).val(),
                                    "alarm_name": alarmModeArray[i].id,
                                    "alarm_switch": isSwitch,
                                    "alarm_value": alarm_value,
                                    "alarm_group_id": group_id
                                });
                            }
                            var requestElements = JSON.stringify({
                                "Command_Type": ["Write"],
                                "Command_Name": ["EditAlarmInfo"],
                                "Value": alarmModeGroupArr,
                                "api_token": [token]
                            });
                            var addXmlHttp = createJsonXmlHttp("sql");
                            addXmlHttp.onreadystatechange = function () {
                                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                                    var revObj = JSON.parse(this.responseText);
                                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                                        editFenceAG_info(group_id);
                                    }
                                }
                            };
                            addXmlHttp.send(requestElements);
                        }
                    }
                };
                addIdXmlHttp.send(request_EditInfo);
            }
            return valid;
        };
    }

    dialog = $("#dialog_add_alarm_group").dialog({
        autoOpen: false,
        height: 600,
        width: 450,
        modal: true,
        buttons: {
            "Confirm": SendResult,
            Cancel: function () {
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
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
        $("#add_alarm_time_group").empty();
        $("#add_alarm_time_group").append(
            createOptions_name(timeGroupArr, timeGroupArr[0].id)
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
            "Value": sel_group_arr,
            "api_token": [token]
        });
        var deleteIDXmlHttp = createJsonXmlHttp("sql");
        deleteIDXmlHttp.onreadystatechange = function () {
            if (deleteIDXmlHttp.readyState == 4 || deleteIDXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
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
                        "Value": sel_alarm_arr,
                        "api_token": [token]
                    });
                    var deleteXmlHttp = createJsonXmlHttp("sql");
                    deleteXmlHttp.onreadystatechange = function () {
                        if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
                            var revObj = JSON.parse(this.responseText);
                            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                                deleteFenceAG_info();
                                alert($.i18n.prop('i_alarmAlert_5'));
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

function addFenceAG_info(alarm_group_id) {
    var request = {
        "Command_Type": ["Write"],
        "Command_Name": ["AddFenceAlarmGroupInfo"],
        "Value": [{
            "alarm_group_id": alarm_group_id,
            "fence_alarm_gid": $("#add_alarm_mode_4_fagID").val(),
            "overtime_hour": $("#add_alarm_mode_4_time").val()
        }],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                var revInfo = revObj.Value[0].Values;
                var index = revInfo.findIndex(function (info) {
                    return info.alarm_group_id == alarm_group_id;
                });
                editAlarmGroupInfo_fence(revInfo[index].id);
            } else {
                alert($.i18n.prop('i_alarmAlert_50'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function editFenceAG_info(alarm_group_id) {
    if ($("#add_alarm_mode_4_id").val() == "-1")
        return addFenceAG_info(alarm_group_id);
    else if (!$("#add_alarm_mode_4").prop('checked'))
        return deleteFenceAG_info();
    var request = {
        "Command_Type": ["Write"],
        "Command_Name": ["EditFence_AlarmGroup_info"],
        "Value": {
            "alarm_group_id": alarm_group_id,
            "id": $("#add_alarm_mode_4_id").val(),
            "fence_alarm_gid": $("#add_alarm_mode_4_fagID").val(),
            "overtime_hour": $("#add_alarm_mode_4_time").val()
        },
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                editAlarmGroupInfo_fence($("#add_alarm_mode_4_id").val());
            } else {
                alert($.i18n.prop('i_alarmAlert_51'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function deleteFenceAG_info() {
    if ($("#add_alarm_mode_4_id").val() != "-1") {
        var request = {
            "Command_Type": ["Write"],
            "Command_Name": ["DeleteFence_AlarmGroup_info"],
            "Value": [{
                "id": $("#add_alarm_mode_4_id").val()
            }],
            "api_token": [token]
        };
        var xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    inputAlarmGroupTable();
                    editAlarmGroupInfo_fence("-1");
                } else {
                    alert($.i18n.prop('i_alarmAlert_52'));
                }
            }
        };
        xmlHttp.send(JSON.stringify(request));
    }
}

function editAlarmGroupInfo_fence(id) {
    var modes = $("input[name=add_alarm_mode]");
    var request = {
        "Command_Type": ["Write"],
        "Command_Name": ["EditAlarmInfo"],
        "Value": [{
            "alarm_iid": modes.eq(4).val(),
            "alarm_name": alarmModeArray[4].id,
            "alarm_switch": modes.eq(4).prop("checked") ? "1" : "0",
            "alarm_value": id,
            "alarm_group_id": $("#edit_alarm_group_id").val()
        }],
        "api_token": [token]
    };
    var editXmlHttp = createJsonXmlHttp("sql");
    editXmlHttp.onreadystatechange = function () {
        if (editXmlHttp.readyState == 4 || editXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                inputAlarmGroupTable();
                $("#dialog_add_alarm_group").dialog("close");
            }
        }
    };
    editXmlHttp.send(JSON.stringify(request));
}

/*function inputAlarmSetting() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["time_group_id"],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value.success > 0) {
                var revList = revObj.Value[0].Values;
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

function getTimeGroups(timeGroupInfo) {
    timeGroupArr = [];
    timeGroupInfo.forEach(element => {
        timeGroupArr.push({
            id: element.time_group_id,
            name: element.time_group_name
        })
    });
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


function inputAlarmGroupTable() {
    var alarmRequest = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAlarmGroup_list"],
        "api_token": [token]
    };
    var alarmXmlHttp = createJsonXmlHttp("sql");
    alarmXmlHttp.onreadystatechange = function () {
        if (alarmXmlHttp.readyState == 4 || alarmXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                //get all data of alarm_group and input alarmSettingArr variable
                alarmSettingArr = revObj.Value[0].Values.slice(0) || [];
                //send request to get all data of fence_alarm_group
                var fagRequest = {
                    "Command_Type": ["Write"],
                    "Command_Name": ["GetFence_Alarm_Group_info_ALL"],
                    "api_token": [token]
                };
                var fagXmlHttp = createJsonXmlHttp("sql");
                fagXmlHttp.onreadystatechange = function () {
                    if (fagXmlHttp.readyState == 4 || fagXmlHttp.readyState == "complete") {
                        var response = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, response) && response.Value[0].success > 0) {
                            var values = response.Value[0].Values || [];
                            $("#table_alarm_mode tbody").empty();
                            count_alarm_group = 0;
                            alarmSettingArr.forEach(ag_info => {
                                count_alarm_group++;
                                var tr_id = "tr_alarm_group_" + count_alarm_group;
                                var alarm_mode = "alarm_mode_" + count_alarm_group;
                                var modeCheckHtml = "";
                                for (j = 0; j < alarmModeArray.length; j++) {
                                    var checkedText = ag_info.elements[j].alarm_switch == "0" ? "" : "checked";
                                    var alarm_value = ag_info.elements[j].alarm_value == "-1" ? "" : ag_info.elements[j].alarm_value;
                                    modeCheckHtml += "<input id=\"" + alarm_mode + "_" + j + "\" type='checkbox' class='beauty' " +
                                        "name=\"" + alarm_mode + "\" value=\"" + ag_info.elements[j].alarm_iid + "\" " + checkedText +
                                        " disabled/><label for=\"" + alarm_mode + "_" + j + "\">" + $.i18n.prop(alarmModeArray[j].name) +
                                        "</label>";
                                    if (j == 4) {
                                        var fag_index = values.findIndex(function (info) {
                                            return info.alarm_group_id == ag_info.alarm_gid;
                                        });
                                        if (fag_index > -1) {
                                            var fag_info = values[fag_index];
                                            ag_info.elements[j]["alarm_value"] = fag_info.id || "";
                                            ag_info.elements[j]["fenceAG_id"] = fag_info.fenceAG_id || "";
                                            ag_info.elements[j]["overtime_hour"] = fag_info.overtime_hour || "";
                                            modeCheckHtml += (fag_info.fenceAG_id != "" ? " : " + fag_info.fenceAG_id + ", " +
                                                (fag_info.overtime_hour != "" ? fag_info.overtime_hour + " " + $.i18n.prop('i_hour') : "") :
                                                "") + "<br>";
                                        }
                                    } else if (j > 4) {
                                        modeCheckHtml += (alarm_value != "" ? " : " + alarm_value + " " + $.i18n.prop('i_second') : "");
                                    }
                                }
                                var t_index = timeGroupArr.findIndex(function (info) {
                                    return info.id == ag_info.time_group_id;
                                });
                                var timeGroupName = (t_index > -1) ? timeGroupArr[t_index].name : "";
                                $("#table_alarm_mode tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                                    "<input type=\"checkbox\" name=\"chkbox_alarm_group\" value=\"" + ag_info.alarm_gid + "\"" +
                                    " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_alarm_group + "</td>" +
                                    "<td><input type='text' name=\"alarm_group_name\" value=\"" + ag_info.alarm_group_name + "\"" +
                                    " style=\"width:100px;\" /></td>" +
                                    "<td>" + modeCheckHtml + "</td>" +
                                    "<td><label id=\"alarm_group_time\">" + timeGroupName + "</label></td>" +
                                    "<td style='text-align:center;'><label for=\"btn_edit_alarm_mode_" + count_alarm_group +
                                    "\" class='btn-edit' title='" + $.i18n.prop('i_editAlarmGroup') + "'><i class='fas fa-edit'" +
                                    " style='font-size:18px;'></i></label><input id=\"btn_edit_alarm_mode_" + count_alarm_group +
                                    "\" type='button' class='btn-hidden' onclick=\"editAlarmGroup(\'" + ag_info.alarm_gid + "\')\" />" +
                                    "</td></tr>");
                            });
                        }
                    }
                };
                fagXmlHttp.send(JSON.stringify(fagRequest));
            } else {
                alert($.i18n.prop('i_alarmAlert_1'));
            }
        }
    };
    alarmXmlHttp.send(JSON.stringify(alarmRequest));
}

function createOptions_name(array, select_id) {
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
        if (j == 4) {
            $("#add_alarm_mode_4_id").val(groupElement[j].alarm_value || "-1");
            $("#add_alarm_mode_4_fagID").val(
                groupElement[j].fenceAG_id || $("#add_alarm_mode_4_fagID option:eq(0)").val()
            );
            $("#add_alarm_mode_4_time").val(groupElement[j].overtime_hour || "");
        } else if (j > 4) {
            var alarm_value = groupElement[j].alarm_value == "-1" ? "" : groupElement[j].alarm_value;
            $("#add_alarm_mode_" + j + "_time").val(alarm_value);
        }
        $("input[name=add_alarm_mode]").eq(j).prop("checked", isCheck).val(groupElement[j].alarm_iid);
    }
    $("#add_alarm_time_group").html(
        createOptions_name(timeGroupArr, alarmSettingArr[index].time_group_id)
    );
    $("#add_alarm_time_group").val(alarmSettingArr[index].time_group_id);
    SubMitType = "Edit";
    $("#dialog_add_alarm_group").dialog("open");
}