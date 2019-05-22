var count_time_groups = 0;
var count_time_group_settings = 0;
var TimeSettingsArr = [];

function inputTimeGroups() {
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
                TimeGroupArr = [];
                count_time_groups = 0;
                $("#table_time_group tbody").empty();
                for (i = 0; i < revList.length; i++) {
                    TimeGroupArr.push({
                        group_id: revList[i].group_id,
                        group_name: revList[i].group_name,
                        timelist: revList[i].timelist
                    });
                    var timelist_name = [];
                    revList[i].timelist.forEach(element => {
                        timelist_name.push(element.name);
                    });
                    count_time_groups++;
                    var tr_id = "tr_time_group_" + count_time_groups;
                    $("#table_time_group tbody").append("<tr id=\"" + tr_id + "\">" +
                        "<td><input type='checkbox' name=\"chkbox_time_setting\" value=\"" + revList[i].group_id + "\" " +
                        "onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_time_groups + "</td>" +
                        "<td><label name=\"time_group_name\">" + revList[i].group_name + "</label></td>" +
                        "<td><label name=\"time_group_list\">" + timelist_name.toString() + "</label></td>" +
                        "<td style='text-align:center;'><label for=\"btn_edit_time_group_" + count_time_groups +
                        "\" class='btn-edit' title='Edit the time group'><i class='fas fa-edit' style='font-size: 18px;'></i></label>" +
                        "<input id=\"btn_edit_time_group_" + count_time_groups + "\" type='button' class='btn-hidden'" +
                        " onclick=\"inputTimeGroupSettings(\'" + revList[i].group_id + "\')\" /></td></tr>");
                }
            } else {
                alert("讀取時段群組失敗，請再試一次!");
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}


function inputTimeGroupSettings(time_group_id) {
    var index = TimeGroupArr.findIndex(function (info) {
        return info.group_id == time_group_id;
    });
    if (index > -1) {
        $("#add_time_group_name").val(TimeGroupArr[index].group_name);
        $("#table_time_group_settings tbody").empty();
        count_time_group_settings = 0;
        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["GetTimeSetting"] //先取得所有的TimeSettings
        });
        var getTimesXmlHttp = createJsonXmlHttp("GetTimeSetting");
        getTimesXmlHttp.onreadystatechange = function () {
            if (getTimesXmlHttp.readyState == 4 || getTimesXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                var revList = revObj.Values;
                if (revObj.success > 0) {
                    TimeSettingsArr = [];
                    revList.forEach(element => {
                        TimeSettingsArr.push({
                            id: element.id,
                            name: element.name
                        });
                    });
                    TimeGroupArr[index].timelist.forEach(element => {
                        count_time_group_settings++;
                        var tr_id = "tr_time_group_settings" + count_time_group_settings;
                        $("#table_time_group_settings tbody").append(
                            "<tr id=\"" + tr_id + "\">" +
                            "<td><input type='checkbox' name=\"chkbox_time_group_setting\" value=\"" + tr_id + "\" " +
                            "onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_time_group_settings + "</td>" +
                            "<td><select name=\"add_time_group_settings\">" +
                            displayNameOptions(TimeSettingsArr, element.id) + "</select></td></tr>");
                    });
                    $("#dialog_add_time_group").dialog("open");
                } else {
                    alert("讀取時段群組設定失敗，請刷新頁面再試一次!");
                }
            }
        };
        getTimesXmlHttp.send(requestJSON);
    } else {
        alert("讀取時段群組設定失敗，請刷新頁面再試一次!");
    }
}


$(function () {
    inputTimeGroups();

    var dialog, form,
        add_group_name = $("#add_time_group_name"),
        add_group_settings = document.getElementsByName("add_time_group_settings"),
        allFields = $([]).add(add_group_name);
    //tips = $( ".validateTips" );

    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true,
            settings_array = [];

        valid = valid && checkLength(add_group_name, "Time group check", 1, 20);
        add_group_settings.forEach(element => {
            if (element.value != "" && typeof (element.value) != 'undefined')
                settings_array.push({
                    "time_id": element.value,
                    "time_name": element.options[element.selectedIndex].text
                });
        });

        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["AddTimeSetting"],
            "Value": {
                "name": add_group_name.val(),
                "timelist": settings_array
            }
        });
        if (valid) {
            var addXmlHttp = createJsonXmlHttp("AddSettingTest");
            addXmlHttp.onreadystatechange = function () {
                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success == 1) {
                        //inputTimeSettingTable();
                        //測試用
                        var setting_name_arr = [];
                        revInfo.timelist.forEach(element => {
                            setting_name_arr.push(element.time_name);
                        });
                        count_time_groups++;
                        var tr_id = "tr_time_group_" + count_time_groups;
                        $("#table_time_group tbody").append("<tr id=\"" + tr_id + "\">" +
                            "<td><input type='checkbox' name=\"chkbox_time_setting\" value=\"" + revInfo.id + "\" " +
                            "onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_time_groups + "</td>" +
                            "<td><label name=\"time_group_name\">" + revInfo.name + "</label></td>" +
                            "<td><label name=\"time_group_list\">" + setting_name_arr.toString() + "</label></td>" +
                            "<td style='text-align:center;'><label for=\"btn_edit_time_group_" + count_time_groups +
                            "\" class='btn-edit' title='Edit the time group'><i class='fas fa-edit' style='font-size: 18px;'></i></label>" +
                            "<input id=\"btn_edit_time_group_" + count_time_groups + "\" type='button' class='btn-hidden'" +
                            " onclick=\"inputTimeGroupSettings(\'" + revInfo.id + "\')\" /></td></tr>");
                    }
                }
            };
            addXmlHttp.send(requestJSON);
            dialog.dialog("close");
        }
        return valid;
    };


    $("#btn_add_time_group_settings").button().on("click", function () {
        var array = TimeSettingsArr;
        count_time_group_settings++;
        var tr_id = "tr_time_group_settings" + count_time_group_settings;
        $("#table_time_group_settings tbody").append(
            "<tr id=\"" + tr_id + "\">" +
            "<td><input type='checkbox' name=\"chkbox_time_group_setting\" value=\"" + tr_id + "\" " +
            "onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_time_group_settings + "</td>" +
            "<td><select name=\"add_time_group_settings\">" +
            displayNameOptions(array, array[0].id) +
            " </select></td></tr>"
        );
    });

    $("#btn_delete_time_group_settings").button().on("click", function () {
        var checkboxs = document.getElementsByName("chkbox_time_group_setting");
        var delete_arr = [];
        for (k in checkboxs) {
            if (checkboxs[k].checked)
                delete_arr.push(checkboxs[k].value);
        }
        delete_arr.forEach(id => {
            $("#" + id).remove();
        });
    });

    dialog = $("#dialog_add_time_group").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Confirm": SendResult,
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
        SendResult();
    });

    /**
     * 新增Time Setting
     */
    $("#btn_add_time_group").button().on("click", function () {
        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["GetTimeSetting"] //先取得所有的TimeSettings
        });
        var getTimesXmlHttp = createJsonXmlHttp("GetTimeSetting");
        getTimesXmlHttp.onreadystatechange = function () {
            if (getTimesXmlHttp.readyState == 4 || getTimesXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                var revList = revObj.Values;
                if (revObj.success > 0) {
                    $("#table_time_group_settings tbody").empty();
                    count_time_group_settings = 0;
                    TimeSettingsArr = [];
                    revList.forEach(element => {
                        TimeSettingsArr.push({
                            id: element.id,
                            name: element.name
                        });
                    });
                    dialog.dialog("open");
                } else {
                    alert("讀取時段設定失敗，請刷新頁面再試一次!");
                }
            }
        };
        getTimesXmlHttp.send(requestJSON);
    });

    /**
     * 刪除Time Setting
     */
    $("#btn_delete_time_group").button().on("click", function () {
        var checkboxs = document.getElementsByName("chkbox_alarm_group");
        var delete_arr = [];
        for (k in checkboxs) {
            if (checkboxs[k].checked)
                delete_arr.push({
                    "id": checkboxs[k].value
                });
        }
        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["DeleteTimeSetting"],
            "Value": delete_arr
        });
        var deleteXmlHttp = createJsonXmlHttp("sql");
        deleteXmlHttp.onreadystatechange = function () {
            if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success == 1) {
                    inputAlarmGroupTable();
                    alert("刪除時段群組成功!");
                }
            }
        };
        deleteXmlHttp.send(requestJSON);
    });

    /**
     * 送出修改後的Time Setting List
     */
    $("#btn_submit_time_group").button().on("click", function () {
        var r = confirm("Confirm submit the time settings(All of the list)?");
        if (r == false)
            return;
        var valid = true,
            checkboxs = document.getElementsByName("chkbox_time_setting"),
            time_name = document.getElementsByName("time_setting_name"),
            time_start = document.getElementsByName("time_setting_start"),
            time_end = document.getElementsByName("time_setting_end"),
            edit_arr = [];
        for (i = 0; i < count_time_setting; i++) {
            valid = valid && checkLengthByDOM(time_name[i], "Time setting list check", 1, 20);
            valid = valid && checkLengthByDOM(time_start[i], "Time setting list check", 1, 20);
            valid = valid && checkLengthByDOM(time_end[i], "Time setting list check", 1, 20);
            edit_arr.push({
                "id": checkboxs[i].value,
                "name": time_name[i].value,
                "start_time": time_start[i].value,
                "end_time": time_end[i].value
            });
        }
        if (valid) {
            var requestJSON = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["EditTimeSetting"],
                "Value": edit_arr
            });
            var editXmlHttp = createJsonXmlHttp("sql");
            editXmlHttp.onreadystatechange = function () {
                if (editXmlHttp.readyState == 4 || editXmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success == 1) {
                        inputTimeSettingTable();
                        alert("Success delete the alarm groups");
                    }
                }
            };
            editXmlHttp.send(requestJSON);
        }
        return valid;
    });
});