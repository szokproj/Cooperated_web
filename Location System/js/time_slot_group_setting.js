var token = "";
var count_time_groups = 0;
var count_time_group_slots = 0;
var TimeSlotArr = [];
var TimeGroupArr = [];

$(function () {
    token = getUser() ? getUser().api_token : "";
    inputTimeGroups();

    //Dialog to edit time group.
    var dialog, form,
        add_group_id = $("#add_time_group_id"),
        add_group_name = $("#add_time_group_name"),
        add_group_slots = document.getElementsByName("chkbox_time_group_slot"),
        allFields = $([]).add(add_group_name);

    function EditTimeGroup() {
        allFields.removeClass("ui-state-error");
        var valid = true && checkLength(add_group_name, $.i18n.prop('i_alarmAlert_4'), 1, 50);
        if (valid) {
            if (add_group_slots.length == 0) {
                alert($.i18n.prop('i_alarmAlert_8'));
                return false;
            }
            var requestJSON = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["EditTimeGroup"],
                "Value": {
                    "time_group_id": add_group_id.val(),
                    "time_group_name": add_group_name.val()
                },
                "api_token": [token]
            });
            var addXmlHttp = createJsonXmlHttp("sql");
            addXmlHttp.onreadystatechange = function () {
                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0)
                        inputTimeGroups();
                    dialog.dialog("close");
                }
            };
            addXmlHttp.send(requestJSON);
        }
        return valid;
    }

    dialog = $("#dialog_time_group_slot").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Confirm": EditTimeGroup,
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
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
        EditTimeGroup();
    });

    //新增時段群組與時段的關聯
    $("#btn_add_time_group_slot").button().on("click", function () {
        add_group_name.removeClass("ui-state-error");
        if (add_group_name.val() == "") {
            add_group_name.addClass("ui-state-error");
            alert($.i18n.prop('i_alarmAlert_11'));
            return;
        }
        $("#add_time_group_slot").html(createOptions_name(TimeSlotArr, TimeSlotArr[0].id));
        $("#dialog_add_time_group_slot").dialog("open");
    });

    //刪除時段群組與時段的關聯
    $("#btn_delete_time_group_slot").button().on("click", function () {
        var checkboxs = document.getElementsByName("chkbox_time_group_slot");
        var delete_arr = [];
        for (k in checkboxs) {
            if (checkboxs[k].checked)
                delete_arr.push({
                    "time_group_id": add_group_id.val(),
                    "time_slot_id": checkboxs[k].value
                });
        }
        if (delete_arr.length == 0) {
            alert($.i18n.prop('i_alarmAlert_9'));
            return;
        } else if (delete_arr.length == checkboxs.length) {
            alert($.i18n.prop('i_alarmAlert_15'));
            return;
        }
        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["DeleteTimeSlotGroup"],
            "Value": delete_arr,
            "api_token": [token]
        });
        var deleteXmlHttp = createJsonXmlHttp("sql");
        deleteXmlHttp.onreadystatechange = function () {
            if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    inputTimeGroups();
                    inputTimeGroupSlots(add_group_id.val())
                    alert($.i18n.prop('i_alarmAlert_12'));
                }
            }
        };
        deleteXmlHttp.send(requestJSON);
    });

    //按下新增Time Group
    $("#btn_add_time_group").button().on("click", function () {
        $("#add_time_group_id").val("");
        $("#add_time_group_naem").val("");
        $("#table_time_group_slot tbody").empty();
        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["GetTimeSlot_list"], //先取得所有的TimeSlot
            "api_token": [token]
        });
        var getTimesXmlHttp = createJsonXmlHttp("sql");
        getTimesXmlHttp.onreadystatechange = function () {
            if (getTimesXmlHttp.readyState == 4 || getTimesXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    $("#table_time_group_settings tbody").empty();
                    count_time_group_settings = 0;
                    TimeSlotArr = [];
                    var revList = revObj.Value[0].Values;
                    if (revList) {
                        revList.forEach(element => {
                            TimeSlotArr.push({
                                id: element.time_slot_id,
                                name: element.time_slot_name
                            });
                        });
                        dialog.dialog("open");
                    } else {
                        alert($.i18n.prop('i_alarmAlert_13'));
                    }
                } else {
                    alert($.i18n.prop('i_alarmAlert_14'));
                }
            }
        };
        getTimesXmlHttp.send(requestJSON);
    });

    //按下刪除Time Group
    $("#btn_delete_time_group").button().on("click", function () {
        var checkboxs = document.getElementsByName("chkbox_time_group");
        var delete_arr = [];
        for (k in checkboxs) {
            if (checkboxs[k].checked)
                delete_arr.push({
                    "time_group_id": checkboxs[k].value
                });
        }
        if (delete_arr.length == 0) {
            alert($.i18n.prop('i_alarmAlert_10'));
            return;
        }
        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["DeleteTimeGroup"],
            "Value": delete_arr,
            "api_token": [token]
        });
        var deleteXmlHttp = createJsonXmlHttp("sql");
        deleteXmlHttp.onreadystatechange = function () {
            if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    inputTimeGroups();
                    alert($.i18n.prop('i_alarmAlert_9'));
                }
            }
        };
        deleteXmlHttp.send(requestJSON);
    });

    //Dialog to add time slot group.
    var dialog2, form2,
        time_group_id = $("#add_time_group_id"),
        time_group_name = $("#add_time_group_name"),
        add_slot = $("#add_time_group_slot"),
        allFields2 = $([]).add(add_slot);

    function SubmitGroup_Slot() {
        var valid = true && checkLength(add_slot, $.i18n.prop('i_alarmAlert_28'), 1, 20); //text
        var existed_slot = document.getElementsByName("chkbox_time_group_slot");
        existed_slot.forEach(element => {
            if (element.value == add_slot.val()) {
                valid = false;
                alert($.i18n.prop('i_alarmAlert_16'));
                return;
            }
        });
        if (valid) {
            var request = {
                "Command_Type": ["Write"],
                "Command_Name": ["AddTimeSlotGroup"],
                "Value": {
                    "time_group_id": time_group_id.val(),
                    "time_slot_id": add_slot.val()
                },
                "api_token": [token]
            };
            var addXmlHttp = createJsonXmlHttp("sql");
            addXmlHttp.onreadystatechange = function () {
                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                        inputTimeGroups();
                        var getRequest = {
                            "Command_Type": ["Read"],
                            "Command_Name": ["GetTimeGroup_list"],
                            "api_token": [token]
                        };
                        var xmlHttp = createJsonXmlHttp("sql");
                        xmlHttp.onreadystatechange = function () {
                            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                                var revObj2 = JSON.parse(this.responseText);
                                if (checkTokenAlive(token, revObj2) && revObj2.Value[0].success > 0) {
                                    count_time_groups = 0;
                                    $("#table_time_group tbody").empty();
                                    TimeGroupArr = revObj2.Value[0].Values.slice(0) || [];
                                    for (i = 0; i < TimeGroupArr.length; i++) {
                                        var timelist_name = [];
                                        if (TimeGroupArr[i].elements) {
                                            TimeGroupArr[i].elements.forEach(element => {
                                                timelist_name.push(element.time_slot_name);
                                            });
                                        }
                                        count_time_groups++;
                                        var tr_id = "tr_time_group_" + count_time_groups;
                                        $("#table_time_group tbody").append("<tr id=\"" + tr_id + "\">" +
                                            "<td><input type='checkbox' name=\"chkbox_time_group\" value=\"" + TimeGroupArr[i].time_group_id +
                                            "\" onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_time_groups + "</td>" +
                                            "<td><label name=\"time_group_name\">" + TimeGroupArr[i].time_group_name + "</label></td>" +
                                            "<td><label name=\"time_group_slots\">" + timelist_name.toString() + "</label></td>" +
                                            "<td style='text-align:center;'><label for=\"btn_edit_time_group_" + count_time_groups +
                                            "\" class='btn-edit' title='" + $.i18n.prop('i_editTimeSlotGroup') + "'><i class='fas fa-edit'" +
                                            " style='font-size:18px;'></i></label>" +
                                            "<input id=\"btn_edit_time_group_" + count_time_groups + "\" type='button' class='btn-hidden'" +
                                            " onclick=\"inputTimeGroupSlots(\'" + TimeGroupArr[i].time_group_id + "\')\" /></td></tr>");
                                    }
                                    inputTimeGroupSlots(time_group_id.val());
                                    alert($.i18n.prop('i_alarmAlert_17'));
                                    dialog2.dialog("close");
                                } else {
                                    alert($.i18n.prop('i_alarmAlert_6'));
                                    return;
                                }
                            }
                        };
                        xmlHttp.send(JSON.stringify(getRequest));
                    } else {
                        alert($.i18n.prop('i_alarmAlert_18'));
                        return;
                    }
                }
            };
            addXmlHttp.send(JSON.stringify(request));
        }
        return valid;
    }


    function AddTimeGroup_Slot() {
        allFields2.removeClass("ui-state-error");
        if (time_group_id.val() == "") {
            var r = confirm($.i18n.prop('i_alarmAlert_19'));
            if (r == false)
                return;
            var requestJSON = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["AddTimeGroup"],
                "Value": {
                    "time_group_name": time_group_name.val()
                },
                "api_token": [token]
            });
            var addXmlHttp = createJsonXmlHttp("sql");
            addXmlHttp.onreadystatechange = function () {
                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                        var revInfo = revObj.Value[0].Values || [];
                        time_group_id.val(revInfo.time_gid);
                        SubmitGroup_Slot();
                    } else {
                        alert($.i18n.prop('i_alarmAlert_18'));
                    }
                }
            };
            addXmlHttp.send(requestJSON);
        } else {
            SubmitGroup_Slot();
        }
    }

    dialog2 = $("#dialog_add_time_group_slot").dialog({
        autoOpen: false,
        height: 170,
        width: 220,
        modal: true,
        buttons: {
            "Confirm": AddTimeGroup_Slot,
            Cancel: function () {
                form2[0].reset();
                allFields2.removeClass("ui-state-error");
                dialog2.dialog("close");
            }
        },
        close: function () {
            form2[0].reset();
            allFields2.removeClass("ui-state-error");
        }
    });

    form2 = dialog2.find("form").on("submit", function (event) {
        event.preventDefault();
        AddTimeGroup_Slot();
    });
});

function inputTimeGroups() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetTimeGroup_list"],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                count_time_groups = 0;
                $("#table_time_group tbody").empty();
                TimeGroupArr = revObj.Value[0].Values.slice(0) || [];
                getTimeGroups(TimeGroupArr);
                inputAlarmGroupTable(); //載入警報群組已設定的內容
                for (i = 0; i < TimeGroupArr.length; i++) {
                    var timelist_name = [];
                    if (TimeGroupArr[i].elements) {
                        TimeGroupArr[i].elements.forEach(element => {
                            timelist_name.push(element.time_slot_name);
                        });
                    }
                    count_time_groups++;
                    var tr_id = "tr_time_group_" + count_time_groups;
                    $("#table_time_group tbody").append("<tr id=\"" + tr_id + "\">" +
                        "<td><input type='checkbox' name=\"chkbox_time_group\" value=\"" + TimeGroupArr[i].time_group_id +
                        "\" onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_time_groups + "</td>" +
                        "<td><label name=\"time_group_name\">" + TimeGroupArr[i].time_group_name + "</label></td>" +
                        "<td><label name=\"time_group_slots\">" + timelist_name.toString() + "</label></td>" +
                        "<td style='text-align:center;'><label for=\"btn_edit_time_group_" + count_time_groups +
                        "\" class='btn-edit' title='" + $.i18n.prop('i_editTimeSlotGroup') + "'><i class='fas fa-edit'" +
                        " style='font-size:18px;'></i></label>" +
                        "<input id=\"btn_edit_time_group_" + count_time_groups + "\" type='button' class='btn-hidden'" +
                        " onclick=\"inputTimeGroupSlots(\'" + TimeGroupArr[i].time_group_id + "\')\" /></td></tr>");
                }
            } else {
                alert($.i18n.prop('i_alarmAlert_6'));
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}


function inputTimeGroupSlots(time_group_id) {
    var index = TimeGroupArr.findIndex(function (info) {
        return info.time_group_id == time_group_id;
    });
    if (index > -1) {
        $("#add_time_group_id").val(time_group_id);
        $("#add_time_group_name").val(TimeGroupArr[index].time_group_name);
        $("#table_time_group_slot tbody").empty();
        count_time_group_slots = 0;
        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["GetTimeSlot_list"], //先取得所有的TimeSettings
            "api_token": [token]
        });
        var getTimesXmlHttp = createJsonXmlHttp("sql");
        getTimesXmlHttp.onreadystatechange = function () {
            if (getTimesXmlHttp.readyState == 4 || getTimesXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    var revList = revObj.Value[0].Values || [];
                    TimeSlotArr = [];
                    revList.forEach(element => {
                        TimeSlotArr.push({
                            id: element.time_slot_id,
                            name: element.time_slot_name
                        });
                    });
                    if (TimeGroupArr[index].elements) {
                        TimeGroupArr[index].elements.forEach(element => {
                            count_time_group_slots++;
                            var tr_id = "tr_time_group_slot" + count_time_group_slots;
                            $("#table_time_group_slot tbody").append(
                                "<tr id=\"" + tr_id + "\">" +
                                "<td><input type='checkbox' name=\"chkbox_time_group_slot\" value=\"" + element.time_slot_id +
                                "\" onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_time_group_slots + "</td>" +
                                "<td><label name=\"time_group_slot\">" + element.time_slot_name + "</label></td></tr>");
                        });
                    }
                    $("#dialog_time_group_slot").dialog("open");
                } else {
                    alert($.i18n.prop('i_alarmAlert_7'));
                }
            }
        };
        getTimesXmlHttp.send(requestJSON);
    } else {
        alert($.i18n.prop('i_alarmAlert_7'));
    }
}