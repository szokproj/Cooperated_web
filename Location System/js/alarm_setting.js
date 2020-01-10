const alarmModeArray = [{
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
    ],
    switch_on = "<img class='switch-img' src=\"../image/success.png\"/>",
    switch_off = "<img class='switch-img' src=\"../image/error.png\"/>";

let TimeGroupArr = [],
    count_alarm_group = 0,
    alarmSettingArr = [],
    submit_type = {
        alarm: "",
        time_group: "",
        time_slot: "",
        fence: "",
        fence_alarm_group: ""
    },
    token = "";

$(function () {
    let h = document.documentElement.clientHeight;
    $(".container").css("height", h - 10 + "px");
    $(".cvsBlock").css("height", h - 150 + "px");
    $("#block_fence_info .block-list").css("height", h - 295 + "px");
    $("#block_fence_alarm_group .block-list").css("height", h - 247 + "px");

    /**
     * Check this page's permission and load navbar
     */
    token = getToken();
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
    let dialog, form,
        name = $("#add_alarm_mode_name"),
        fenceAG_id = $("#add_alarm_mode_0_fagID"),
        fenceAG_time = $("#add_alarm_mode_0_time"),
        stay_time = $("#add_alarm_mode_1_time"),
        hidden_time = $("#add_alarm_mode_2_time"),
        time_group = $("#add_alarm_time_group"),
        allFields = $([]).add(name).add(fenceAG_id).add(fenceAG_time).add(stay_time).add(hidden_time).add(time_group),
        modes = $("input[name=add_alarm_mode]"), //不用把add_modes放進allFields

        SendResult = function () {
            let valid = true;
            allFields.removeClass("ui-state-error");
            valid = valid && checkLength(name, $.i18n.prop('i_alarmAlert_4'), 1, 100);
            if ($("#add_alarm_mode_0").prop("checked")) {
                valid = valid && checkLength(fenceAG_id, $.i18n.prop('i_alarmAlert_49'), 1, 100);
                valid = valid && checkLength(fenceAG_time, $.i18n.prop('i_alarmAlert_4'), 1, 100);
            }
            if ($("#add_alarm_mode_1").prop("checked"))
                valid = valid && checkLength(stay_time, $.i18n.prop('i_alarmAlert_4'), 1, 100);
            if ($("#add_alarm_mode_2").prop("checked"))
                valid = valid && checkLength(hidden_time, $.i18n.prop('i_alarmAlert_4'), 1, 100);
            valid = valid && checkLength(time_group, $.i18n.prop('i_alarmAlert_4'), 1, 100);
            if (valid) {
                if (submit_type["alarm"] == "Add") {
                    let request_addGroupID = JSON.stringify({
                        "Command_Type": ["Write"],
                        "Command_Name": ["AddAlarmGroup"],
                        "Value": {
                            "alarm_group_name": name.val(),
                            "time_group_id": time_group.val()
                        },
                        "api_token": [token]
                    });
                    let addIdXmlHttp = createJsonXmlHttp("sql");
                    addIdXmlHttp.onreadystatechange = function () {
                        if (addIdXmlHttp.readyState == 4 || addIdXmlHttp.readyState == "complete") {
                            let revObj = JSON.parse(this.responseText);
                            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                                let revInfo = revObj.Value[0].Values;
                                let alarmModeGroupArr = [];
                                for (let i = 0; i < alarmModeArray.length; i++) {
                                    let isSwitch = "0",
                                        alarm_value = "-1",
                                        isAddFenceAG = false;
                                    if (modes.eq(i).prop("checked")) {
                                        isSwitch = "1";
                                        if (i == 0) {
                                            let fag_info_id = $("#add_alarm_mode_0_id").val();
                                            alarm_value = fag_info_id.length == 0 ? "-1" : fag_info_id;
                                            isAddFenceAG = true;
                                        } else {
                                            let alarm_time = $("#add_alarm_mode_" + i + "_time").val();
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
                                let requestElements = JSON.stringify({
                                    "Command_Type": ["Write"],
                                    "Command_Name": ["AddAlarmInfo"],
                                    "Value": alarmModeGroupArr,
                                    "api_token": [token]
                                });
                                let addXmlHttp = createJsonXmlHttp("sql");
                                addXmlHttp.onreadystatechange = function () {
                                    if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                                        let revObj = JSON.parse(this.responseText);
                                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                                            if (isAddFenceAG)
                                                addFenceAG_info(revInfo.alarm_gid);
                                            else {
                                                inputAlarmGroupTable();
                                                dialog.dialog("close");
                                            }
                                        }
                                    }
                                };
                                addXmlHttp.send(requestElements);
                            }
                        }
                    };
                    addIdXmlHttp.send(request_addGroupID);
                } else if (submit_type["alarm"] == "Edit") {
                    let group_id = $("#edit_alarm_group_id").val();
                    let request_EditInfo = JSON.stringify({
                        "Command_Type": ["Write"],
                        "Command_Name": ["EditAlarmGroupInfo"],
                        "Value": {
                            "alarm_gid": group_id,
                            "alarm_group_name": name.val(),
                            "time_group_id": time_group.val()
                        },
                        "api_token": [token]
                    });
                    let addIdXmlHttp = createJsonXmlHttp("sql");
                    addIdXmlHttp.onreadystatechange = function () {
                        if (addIdXmlHttp.readyState == 4 || addIdXmlHttp.readyState == "complete") {
                            let revObj = JSON.parse(this.responseText);
                            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                                let alarmModeGroupArr = [];
                                for (let i = 0; i < alarmModeArray.length; i++) {
                                    let isSwitch = "0",
                                        alarm_value = "-1";
                                    if (modes.eq(i).prop("checked")) {
                                        isSwitch = "1";
                                        if (i == 0) {
                                            let fag_info_id = $("#add_alarm_mode_0_id").val();
                                            alarm_value = fag_info_id.length > 0 ? fag_info_id : "-1";
                                        } else {
                                            let alarm_time = $("#add_alarm_mode_" + i + "_time").val();
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
                                let requestElements = JSON.stringify({
                                    "Command_Type": ["Write"],
                                    "Command_Name": ["EditAlarmInfo"],
                                    "Value": alarmModeGroupArr,
                                    "api_token": [token]
                                });
                                let addXmlHttp = createJsonXmlHttp("sql");
                                addXmlHttp.onreadystatechange = function () {
                                    if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                                        let revObj = JSON.parse(this.responseText);
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
            }
        };

    dialog = $("#dialog_add_alarm_group").dialog({
        autoOpen: false,
        height: 430,
        width: 430,
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
            createOptions_name(TimeGroupArr, TimeGroupArr[0].time_group_id)
        );
        $("#add_alarm_mode_0_fagID option").eq(0).prop("selected", true);
        $("input[name=add_alarm_mode]").val("");
        $("input[name=add_alarm_mode_time").val("");
        submit_type["alarm"] = "Add";
        dialog.dialog("open");
    });

    /**
     * 刪除Alarm Groups
     */
    $("#btn_delete_alarm_group").button().on("click", function () {
        let checkboxs = document.getElementsByName("chkbox_alarm_group");
        let sel_group_arr = [];
        for (i in checkboxs) {
            if (checkboxs[i].checked)
                sel_group_arr.push({
                    "alarm_gid": checkboxs[i].value
                });
        }
        let request_DelInfo = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["DeleteAlarmGroupInfo"],
            "Value": sel_group_arr,
            "api_token": [token]
        });
        let deleteIDXmlHttp = createJsonXmlHttp("sql");
        deleteIDXmlHttp.onreadystatechange = function () {
            if (deleteIDXmlHttp.readyState == 4 || deleteIDXmlHttp.readyState == "complete") {
                let revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    let sel_alarm_arr = [];
                    for (j in sel_group_arr) {
                        let g_index = alarmSettingArr.findIndex(function (info) {
                            return info.alarm_gid == sel_group_arr[j].alarm_gid;
                        });
                        alarmSettingArr[g_index].elements.forEach(function (element) {
                            sel_alarm_arr.push({
                                "alarm_iid": element.alarm_iid
                            });
                        });
                    }
                    let requestElements = JSON.stringify({
                        "Command_Type": ["Write"],
                        "Command_Name": ["DeleteAlarmInfo"],
                        "Value": sel_alarm_arr,
                        "api_token": [token]
                    });
                    let deleteXmlHttp = createJsonXmlHttp("sql");
                    deleteXmlHttp.onreadystatechange = function () {
                        if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
                            let revObj = JSON.parse(this.responseText);
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

    setupCanvas(); //set_fence.js
    importAddFenceDialog(); //dialog_fence_add.js
    importFenceAlarmGroup(); //set_fence_alarm_group.js
    importTimeSlot(); //time_slot_setting.js
    importTimeSlotGroup(); //time_slot_group_setting.js
});

function addFenceAG_info(alarm_group_id) {
    let request = {
        "Command_Type": ["Write"],
        "Command_Name": ["AddFenceAlarmGroupInfo"],
        "Value": [{
            "alarm_group_id": alarm_group_id,
            "fence_alarm_gid": $("#add_alarm_mode_0_fagID").val(),
            "overtime_hour": $("#add_alarm_mode_0_time").val()
        }],
        "api_token": [token]
    };
    let xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                let revInfo = revObj.Value[0].Values,
                    index = revInfo.findIndex(function (info) {
                        return info.alarm_group_id == alarm_group_id;
                    });
                if (index > -1)
                    editAlarmGroupInfo_fence(revInfo[index].id);
                else
                    editAlarmGroupInfo_fence("-1");
            } else {
                alert($.i18n.prop('i_alarmAlert_50'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function editFenceAG_info(alarm_group_id) {
    if ($("#add_alarm_mode_0_id").val() == "-1")
        return addFenceAG_info(alarm_group_id);
    else if (!$("#add_alarm_mode_0").prop('checked'))
        return deleteFenceAG_info();
    let request = {
        "Command_Type": ["Write"],
        "Command_Name": ["EditFence_AlarmGroup_info"],
        "Value": {
            "alarm_group_id": alarm_group_id,
            "id": $("#add_alarm_mode_0_id").val(),
            "fence_alarm_gid": $("#add_alarm_mode_0_fagID").val(),
            "overtime_hour": $("#add_alarm_mode_0_time").val()
        },
        "api_token": [token]
    };
    let xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                editAlarmGroupInfo_fence($("#add_alarm_mode_0_id").val());
            } else {
                alert($.i18n.prop('i_alarmAlert_51'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function deleteFenceAG_info() {
    if ($("#add_alarm_mode_0_id").val() != "-1") {
        let request = {
            "Command_Type": ["Write"],
            "Command_Name": ["DeleteFence_AlarmGroup_info"],
            "Value": [{
                "id": $("#add_alarm_mode_0_id").val()
            }],
            "api_token": [token]
        };
        let xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                let revObj = JSON.parse(this.responseText);
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
    let modes = $("input[name=add_alarm_mode]"),
        request = {
            "Command_Type": ["Write"],
            "Command_Name": ["EditAlarmInfo"],
            "Value": [{
                "alarm_iid": modes.eq(0).val(),
                "alarm_name": alarmModeArray[0].id,
                "alarm_switch": modes.eq(0).prop("checked") ? "1" : "0",
                "alarm_value": id,
                "alarm_group_id": $("#edit_alarm_group_id").val()
            }],
            "api_token": [token]
        };
    let editXmlHttp = createJsonXmlHttp("sql");
    editXmlHttp.onreadystatechange = function () {
        if (editXmlHttp.readyState == 4 || editXmlHttp.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                inputAlarmGroupTable();
                $("#dialog_add_alarm_group").dialog("close");
            }
        }
    };
    editXmlHttp.send(JSON.stringify(request));
}

function removeMapGroup() {
    let checkboxs = document.getElementsByName("chkbox_map_group"),
        arr = [];
    for (j in checkboxs) {
        if (checkboxs[j].checked)
            arr.push(checkboxs[j].value);
    }
    arr.forEach(function (v) {
        $("#tr_map_group_" + v).remove();
    });
}


function inputAlarmGroupTable() {
    let alarmRequest = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAlarmGroup_list"],
        "api_token": [token]
    };
    let alarmXmlHttp = createJsonXmlHttp("sql");
    alarmXmlHttp.onreadystatechange = function () {
        if (alarmXmlHttp.readyState == 4 || alarmXmlHttp.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                //get all data of alarm_group and input alarmSettingArr variable
                alarmSettingArr = revObj.Value[0].Values ? revObj.Value[0].Values.slice(0) : [];
                //send request to get all data of fence_alarm_group
                let fagRequest = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["GetFence_Alarm_Group_info_ALL"],
                    "api_token": [token]
                };
                let fagXmlHttp = createJsonXmlHttp("sql");
                fagXmlHttp.onreadystatechange = function () {
                    if (fagXmlHttp.readyState == 4 || fagXmlHttp.readyState == "complete") {
                        let response = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, response) && response.Value[0].success > 0) {
                            let values = response.Value[0].Values || [];
                            $("#table_alarm_mode tbody").empty();
                            count_alarm_group = 0;
                            alarmSettingArr.forEach(ag_info => {
                                let modeCheckHtml = "";
                                if ("elements" in ag_info) {
                                    for (j = 0; j < alarmModeArray.length; j++) {
                                        let alarm_value = ag_info.elements[j].alarm_value == "-1" ? "" : ag_info.elements[j].alarm_value,
                                            state = ag_info.elements[j].alarm_switch == "0" ? switch_off : switch_on;
                                        if (j == 0) {
                                            let fag_index = values.findIndex(function (info) {
                                                return info.alarm_group_id == ag_info.alarm_gid;
                                            });
                                            if (fag_index > -1) {
                                                let fag_info = values[fag_index];
                                                ag_info.elements[j]["alarm_value"] = fag_info.id || "";
                                                ag_info.elements[j]["fenceAG_id"] = fag_info.fenceAG_id || "";
                                                ag_info.elements[j]["overtime_hour"] = fag_info.overtime_hour || "";
                                                modeCheckHtml += "<td>" + state + (fag_info.fenceAG_id != "" ? " " + $.i18n.prop('i_fenceAlarmGroup') + " : " +
                                                    fag_info.fenceAG_id + " , " + $.i18n.prop('i_time') + " : " +
                                                    (fag_info.overtime_hour != "" ? fag_info.overtime_hour + " " + $.i18n.prop('i_hour') : "") : "") + "</td>";
                                            } else {
                                                modeCheckHtml += "<td>" + state + "</td>";
                                            }
                                        } else {
                                            modeCheckHtml += "<td>" + state +
                                                (alarm_value != "" ? " " + $.i18n.prop('i_time') + " : " + alarm_value + " " + $.i18n.prop('i_second') : "") + "</td>";
                                        }
                                    }
                                }
                                count_alarm_group++;
                                let tr_id = "tr_alarm_group_" + count_alarm_group,
                                    t_index = TimeGroupArr.findIndex(function (info) {
                                        return info.time_group_id == ag_info.time_group_id;
                                    }),
                                    timeGroupName = (t_index > -1) ? TimeGroupArr[t_index].time_group_name : "";
                                $("#table_alarm_mode tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                                    "<input type=\"checkbox\" name=\"chkbox_alarm_group\" value=\"" + ag_info.alarm_gid + "\"" +
                                    " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_alarm_group + "</td>" +
                                    "<td><label name=\"alarm_group_name\" style=\"width:100px;\" >" +
                                    ag_info.alarm_group_name + "</label></td>" + modeCheckHtml +
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
    let options = "";
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
    let index = alarmSettingArr.findIndex(function (info) {
            return info.alarm_gid == id;
        }),
        groupElement = alarmSettingArr[index].elements;
    $("#edit_alarm_group_id").val(alarmSettingArr[index].alarm_gid)
    $("#add_alarm_mode_name").val(alarmSettingArr[index].alarm_group_name);
    for (j = 0; j < alarmModeArray.length; j++) {
        let isCheck = false;
        if (groupElement[j].alarm_switch == "1")
            isCheck = true;
        if (j == 0) {
            $("#add_alarm_mode_0_id").val(groupElement[j].alarm_value || "-1");
            $("#add_alarm_mode_0_fagID").val(
                groupElement[j].fenceAG_id || $("#add_alarm_mode_0_fagID option:eq(0)").val()
            );
            $("#add_alarm_mode_0_time").val(groupElement[j].overtime_hour || "");
        } else {
            let alarm_value = groupElement[j].alarm_value == "-1" ? "" : groupElement[j].alarm_value;
            $("#add_alarm_mode_" + j + "_time").val(alarm_value);
        }
        $("input[name=add_alarm_mode]").eq(j).prop("checked", isCheck).val(groupElement[j].alarm_iid);
    }
    $("#add_alarm_time_group").html(
        createOptions_name(TimeGroupArr, alarmSettingArr[index].time_group_id)
    );
    $("#add_alarm_time_group").val(alarmSettingArr[index].time_group_id);
    submit_type["alarm"] = "Edit";
    $("#dialog_add_alarm_group").dialog("open");
}