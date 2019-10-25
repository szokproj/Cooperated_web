var token = "";
var fenceArray = [];

/**
 * FAG = FenceAlarmGroup 圍籬警戒群組
 */

$(function () {
    token = getToken();

    var dialog, form;
    var sendFAG_Set = function () {
        $("#add_FAG_id").removeClass("ui-state-error");
        var valid = true && checkLength($("#add_FAG_id"), $.i18n.prop('i_alarmAlert_39'), 1, 20);
        var fence_ids = document.getElementsByName("included_fences")
        if (fence_ids.length == 0)
            return alert($.i18n.prop('i_alarmAlert_40'));
        if (valid) {
            var fenceAG_arr = [];
            fence_ids.forEach(element => {
                fenceAG_arr.push({
                    "fence_id": element.value,
                    "fence_alarm_gid": $("#add_FAG_id").val()
                })
            });
            if (operating == "Add") {
                var addXmlHttp = createJsonXmlHttp("sql");
                addXmlHttp.onreadystatechange = function () {
                    if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                            if (!revObj.Value[0].Value) return;
                            var key = Object.keys(revObj.Value[0].Value);
                            updateFenceAG_List(key);
                            alert($.i18n.prop('i_alarmAlert_41'));
                        } else {
                            alert($.i18n.prop('i_alarmAlert_42'));
                        }
                    }
                };
                addXmlHttp.send(JSON.stringify({
                    "Command_Type": ["Write"],
                    "Command_Name": ["AddFenceAlarmGroup"],
                    "Value": fenceAG_arr,
                    "api_token": [token]
                }));
            } else if (operating == "Edit") {
                var deleteXmlHttp = createJsonXmlHttp("sql");
                deleteXmlHttp.onreadystatechange = function () {
                    if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                            var addXmlHttp = createJsonXmlHttp("sql");
                            addXmlHttp.onreadystatechange = function () {
                                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                                    var revObj2 = JSON.parse(this.responseText);
                                    if (checkTokenAlive(token, revObj2) && revObj2.Value[0].success > 0) {
                                        if (!revObj2.Value[0].Value) return;
                                        var key = Object.keys(revObj2.Value[0].Value);
                                        updateFenceAG_List(key);
                                        alert($.i18n.prop('i_alarmAlert_43'));
                                    } else {
                                        alert($.i18n.prop('i_alarmAlert_44'));
                                    }
                                }
                            };
                            addXmlHttp.send(JSON.stringify({
                                "Command_Type": ["Write"],
                                "Command_Name": ["AddFenceAlarmGroup"],
                                "Value": fenceAG_arr,
                                "api_token": [token]
                            }));
                        }
                    }
                };
                deleteXmlHttp.send(JSON.stringify({
                    "Command_Type": ["Write"],
                    "Command_Name": ["DeleteFence_Alarm_Group"],
                    "Value": [{
                        "fence_alarm_gid": $("#add_FAG_id").val()
                    }],
                    "api_token": [token]
                }));
            } else {
                alert($.i18n.prop('i_alertError_9'));
            }
            dialog.dialog("close");
        }
        return valid;
    };

    dialog = $("#dialog_fence_alarm_group").dialog({
        autoOpen: false,
        height: 600,
        width: 600,
        modal: false,
        buttons: {
            "Confirm": function () {
                sendFAG_Set();
            },
            "Cancel": function () {
                dialog.dialog("close");
            }
        },
        "close": function () {
            form[0].reset();
            $("#add_FAG_id").removeClass("ui-state-error");
            $("#table_included_fences tbody").empty();
            $("#table_remaining_fences tbody").empty();
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        sendFAG_Set();
    });
    $("#btn_fence_list_add").on('click', addFenceToFAG);
    $("#btn_fence_list_delete").on('click', removeFenceFormFAG);
    $("#btn_fenceAG_add").on('click', function () {
        operating = "Add";
        //getFences();
        $("#add_FAG_id").val("").prop('disabled', false);
        for (i = 0; i < fenceArray.length; i++) {
            var tr_id = "remaining_fences_" + fenceArray[i].fence_id;
            $("#table_remaining_fences tbody").append("<tr id=\"" + tr_id + "\"" +
                " onclick=\"beCheckedColumn(\'" + tr_id + "\')\">" +
                "<td><input type=\"checkbox\" class=\"chk-hidden\"" +
                " name=\"remaining_fences\"" +
                " value=\"" + fenceArray[i].fence_id + "\" />" +
                " <span>" + (i + 1) + "</span></td>" +
                "<td>" + fenceArray[i].fence_id + "</td>" +
                "<td>" + fenceArray[i].fence_name + "</td></tr>");
        }
        dialog.dialog("open");
    });
    $("#btn_fenceAG_delete").on('click', function () {
        if (confirm($.i18n.prop('i_alarmAlert_47'))) {
            var fenceAGs = document.getElementsByName("chk_fenceAG");
            var delete_arr = [];
            for (i = 0; i < fenceAGs.length; i++) {
                if (fenceAGs[i].checked) {
                    delete_arr.push({
                        "fence_alarm_gid": fenceAGs[i].value
                    });
                }
            }
            var deleteXmlHttp = createJsonXmlHttp("sql");
            deleteXmlHttp.onreadystatechange = function () {
                if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                        if (!revObj.Value[0].Value) return;
                        var key = Object.keys(revObj.Value[0].Value);
                        updateFenceAG_List(key);
                        alert($.i18n.prop('i_alarmAlert_45'));
                    } else {
                        alert($.i18n.prop('i_alarmAlert_46'));
                    }
                }
            };
            deleteXmlHttp.send(JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["DeleteFence_Alarm_Group"],
                "Value": delete_arr,
                "api_token": [token]
            }));
        }
    });

    getFenceAlarmGroup();
    getFences();
});

function updateFenceAG_List(array) {
    $("#table_fence_alarm_group tbody").empty();
    $("#add_alarm_mode_4_fagID").empty();
    for (i = 0; i < array.length; i++) {
        var tr_id = "fenceAG_" + i;
        $("#table_fence_alarm_group tbody").append("<tr id=\"" + tr_id + "\"><td>" +
            "<input type=\"checkbox\" name=\"chk_fenceAG\" value=\"" + array[i] + "\"" +
            " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + (i + 1) + "</td>" +
            "<td>" + array[i] + "</td>" +
            "<td><label for=\"btn_edit_fenceAG_" + i + "\" class='btn-edit i18n-input'" +
            " selectattr=\"title\" selectname=\"i_editFenceAlarmGroup\">" +
            "<i class='fas fa-edit' style='font-size:18px;'></i></label>" +
            "<input type='button' id=\"btn_edit_fenceAG_" + i + "\"" +
            " class='btn-hidden' onclick=\"editFenceAlarmGroup(\'" + array[i] + "\');\" />" +
            "</td></tr>");

        //Update the alarm group setting dropdownlist
        $("#add_alarm_mode_4_fagID").append("<option value=\"" + array[i] + "\">" + array[i] + "</option>");
    }
}

function getFenceAlarmGroup() {
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                if (revObj.Value[0].Value) {
                    var key = Object.keys(revObj.Value[0].Value);
                    updateFenceAG_List(key);
                }
            } else {
                alert($.i18n.prop('i_alarmAlert_48'));
            }
        }
    };
    xmlHttp.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetFence_Alarm_Group_ALL"],
        "api_token": [token]
    }));
}

function editFenceAlarmGroup(fence_alarm_gid) {
    //getFences();
    operating = "Edit";
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                var revInfo = revObj.Value[0].Values.slice(0) || [];
                $("#add_FAG_id").val(fence_alarm_gid).prop('disabled', true);
                fenceArray.forEach(function (element, index) {
                    var included = revInfo.findIndex(Values => {
                        return Values.fence_id == element.fence_id;
                    });
                    if (included > -1) {
                        var tr_id = "included_fences_" + element.fence_id;
                        $("#table_included_fences tbody").append("<tr id=\"" + tr_id + "\"" +
                            " onclick=\"beCheckedColumn(\'" + tr_id + "\')\">" +
                            "<td><input type=\"checkbox\" class=\"chk-hidden\"" +
                            " name=\"included_fences\" value=\"" + element.fence_id + "\" />" +
                            " <span>" + (index + 1) + "</span></td>" +
                            "<td>" + element.fence_id + "</td>" +
                            "<td>" + element.fence_name + "</td></tr>");
                    } else {
                        var tr_id = "remaining_fences_" + element.fence_id;
                        $("#table_remaining_fences tbody").append("<tr id=\"" + tr_id + "\"" +
                            " onclick=\"beCheckedColumn(\'" + tr_id + "\')\">" +
                            "<td><input type=\"checkbox\" class=\"chk-hidden\"" +
                            " name=\"remaining_fences\" value=\"" + element.fence_id + "\" />" +
                            " <span>" + (index + 1) + "</span></td>" +
                            "<td>" + element.fence_id + "</td>" +
                            "<td>" + element.fence_name + "</td></tr>");
                    }
                });
                resetListNumber("included_fences");
                resetListNumber("remaining_fences");
                $("#dialog_fence_alarm_group").dialog("open");
            } else {
                alert($.i18n.prop('i_alarmAlert_30'));
            }
        }
    };
    xmlHttp.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetFence_Alarm_Group"],
        "Value": {
            "fence_alarm_gid": fence_alarm_gid
        },
        "api_token": [token]
    }));
}


function getFences() {
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                fenceArray = revObj.Value[0].Values.slice(0) || [];
            } else {
                alert($.i18n.prop('i_alarmAlert_30'));
            }
        }
    };
    xmlHttp.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetFence_info_ALL"],
        "api_token": [token]
    }));
}

function addFenceToFAG() {
    var delete_arr = [];
    document.getElementsByName("remaining_fences").forEach(function (element) {
        if (element.checked) {
            var index = fenceArray.findIndex(function (info) {
                return info.fence_id == element.value;
            });
            var tr_id = "included_fences_" + element.value;
            $("#table_included_fences tbody").append("<tr id=\"" + tr_id + "\"" +
                " onclick=\"beCheckedColumn(\'" + tr_id + "\')\">" +
                "<td><input type=\"checkbox\" class=\"chk-hidden\" name=\"included_fences\"" +
                " value=\"" + element.value + "\" /> <span></span></td>" +
                "<td>" + element.value + "</td>" +
                "<td>" + fenceArray[index].fence_name + "</td></tr>");
            delete_arr.push("#remaining_fences_" + element.value);
        }
    });
    delete_arr.forEach(element => {
        $(element).remove();
    });
    resetListNumber("included_fences");
    resetListNumber("remaining_fences");
}

function removeFenceFormFAG() {
    var delete_arr = [];
    document.getElementsByName("included_fences").forEach(function (element) {
        if (element.checked) {
            var index = fenceArray.findIndex(function (info) {
                return info.fence_id == element.value;
            });
            var tr_id = "remaining_fences_" + element.value;
            $("#table_remaining_fences tbody").append("<tr id=\"" + tr_id + "\"" +
                " onclick=\"beCheckedColumn(\'" + tr_id + "\')\">" +
                "<td><input type=\"checkbox\" class=\"chk-hidden\" name=\"remaining_fences\"" +
                " value=\"" + element.value + "\" /> <span></span></td>" +
                "<td>" + element.value + "</td>" +
                "<td>" + fenceArray[index].fence_name + "</td></tr>");
            delete_arr.push("#included_fences_" + element.value);
        }
    });
    delete_arr.forEach(element => {
        $(element).remove();
    });
    resetListNumber("included_fences");
    resetListNumber("remaining_fences");
}

function resetListNumber(item_name) {
    $("input[name='" + item_name + "']").each(function (i) {
        $(this).siblings("span").text((i + 1));
    });
}

function beCheckedColumn(id) {
    var state = $("#" + id).find("td:eq(0) input").prop("checked");
    $("#" + id).toggleClass("changeBgColor")
        .find("td:eq(0) input").prop("checked", !state);
}