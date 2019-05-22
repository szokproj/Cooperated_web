var count_time_setting = 0;
var weekday_arr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


function inputTimeSetting() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetTimeSetting"]
    };
    var xmlHttp = createJsonXmlHttp("GetTimeSetting");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var revList = revObj.Values;
            if (revObj.success > 0) {
                $("#table_time_setting tbody").empty(); //先重置表格
                count_time_setting = 0;
                for (i = 0; i < revList.length; i++) {
                    count_time_setting++;
                    var tr_id = "tr_time_setting_" + count_time_setting;
                    $("#table_time_setting tbody").append("<tr id=\"" + tr_id + "\">" +
                        "<td><input type='checkbox' name=\"chkbox_time_setting\" value=\"" + revList[i].id + "\" " +
                        "onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_time_setting + "</td>" +
                        "<td><label name=\"time_setting_name\">" + revList[i].name + "</label></td>" +
                        "<td style='text-align:center;'><label for=\"btn_edit_time_setting_" + count_time_setting +
                        "\" class='btn-edit' title='Edit the time setting'><i class='fas fa-edit' style='font-size: 18px;'></i></label>" +
                        "<input id=\"btn_edit_time_setting_" + count_time_setting + "\" type='button' class='btn-hidden'" +
                        " onclick=\"inputWeekSchedule()\" /></td></tr>");
                }
            } else {
                alert("讀取TimeSettingList失敗，請再試一次!");
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function resetWeekSchedule() {
    weekday_arr.forEach(weekday => {
        $("#week_time_start_" + weekday).val("").attr('disabled', true);
        $("#week_time_end_" + weekday).val("").attr('disabled', true);
    });
}

function inputWeekSchedule() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetWeekSchedule"]
    };
    var xmlHttp = createJsonXmlHttp("GetWeekSchedule");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var revList = revObj.Values;
            if (revObj.success > 0) {
                $("#add_time_setting_name").val(revList[0].name);
                var weekTime = revList[0].week_time;
                for (i = 0; i < weekday_arr.length; i++) {
                    $("#week_time_start_" + weekday_arr[i]).val(weekTime[weekday_arr[i] + "_start"]);
                    $("#week_time_end_" + weekday_arr[i]).val(weekTime[weekday_arr[i] + "_end"]);
                }
                $("#dialog_add_time_setting").dialog("open");
            } else {
                alert("讀取TimeSettingList失敗，請再試一次!");
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

$(function () {
    resetWeekSchedule();
    weekday_arr.forEach(weekday => {
        $("#week_time_check_" + weekday).on('change', function () {
            if ($(this).prop('checked')) {
                $("#week_time_start_" + weekday).attr('disabled', false);
                $("#week_time_end_" + weekday).attr('disabled', false);
            } else {
                $("#week_time_start_" + weekday).attr('disabled', true);
                $("#week_time_end_" + weekday).attr('disabled', true);
            }
        });
    });
    $("#week_time_check_all").on('change', function () {
        var all_check = false;
        if ($(this).prop('checked'))
            all_check = true;
        else
            all_check = false;
        weekday_arr.forEach(weekday => {
            $("#week_time_check_" + weekday).prop('checked', all_check)
            $("#week_time_start_" + weekday).attr('disabled', !all_check);
            $("#week_time_end_" + weekday).attr('disabled', !all_check);
        });
    });
    inputTimeSetting();

    function checkTimeSum(start_time, end_time) {
        if (typeof (start_time) == 'undefined' || typeof (end_time) == 'undefined')
            return false;
        var startTime = start_time.val().split(":"),
            endTime = end_time.val().split(":"),
            startTotalMins = parseInt(startTime[0]) * 60 + parseInt(startTime[1]),
            endTotalMins = parseInt(endTime[0]) * 60 + parseInt(endTime[1]),
            sumMins = endTotalMins - startTotalMins;
        if (sumMins <= 0) {
            start_time.addClass("ui-state-error");
            end_time.addClass("ui-state-error");
            //updateTips( "開始時間不可比結束時間晚，並且間隔至少一分鐘" );
            alert("開始時間不可比結束時間晚，並且間隔至少一分鐘");
            return false;
        } else {
            return true;
        }
    }

    var dialog, form,
        add_name = $("#add_time_setting_name"),
        allFields = $([]).add(add_name);
    //tips = $( ".validateTips" );

    var resetWeekTimeColor = function () {
        weekday_arr.forEach(weekday => {
            $("#week_time_start_" + weekday).removeClass("ui-state-error");
            $("#week_time_end_" + weekday).removeClass("ui-state-error");
        });
    };

    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        resetWeekTimeColor();
        var valid = true;

        valid = valid && checkLength(add_name, "Time setting check", 1, 20);

        var request = {
            "Command_Type": ["Write"],
            "Command_Name": ["AddTimeSetting"],
            "Value": {
                "name": add_name.val(),
                "week_time": {
                    "Sun_start": "-1",
                    "Sun_end": "-1",
                    "Mon_start": "-1",
                    "Mon_end": "-1",
                    "Tue_start": "-1",
                    "Tue_end": "-1",
                    "Wed_start": "-1",
                    "Wed_end": "-1",
                    "Thu_start": "-1",
                    "Thu_end": "-1",
                    "Fri_start": "-1",
                    "Fri_end": "-1",
                    "Sat_start": "-1",
                    "Sat_end": "-1"
                }
            }
        };

        weekday_arr.forEach(weekday => {
            if ($("#week_time_check_" + weekday).prop('checked')) {
                valid = valid && checkLength($("#week_time_start_" + weekday), "Time setting check", 5, 5);
                valid = valid && checkLength($("#week_time_end_" + weekday), "Time setting check", 5, 5);
                valid = valid && checkTimeSum($("#week_time_start_" + weekday), $("#week_time_end_" + weekday));
                request.Value.week_time[weekday + "_start"] = $("#week_time_start_" + weekday).val() + ":00";
                request.Value.week_time[weekday + "_end"] = $("#week_time_end_" + weekday).val() + ":59";
            }
        });

        if (valid) {
            var addXmlHttp = createJsonXmlHttp("AddSettingTest");
            addXmlHttp.onreadystatechange = function () {
                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success == 1) {
                        //inputTimeSetting();
                        //測試用
                        count_time_setting++;
                        var tr_id = "tr_time_setting_" + count_time_setting;
                        $("#table_time_setting tbody").append("<tr id=\"" + tr_id + "\">" +
                            "<td><input type='checkbox' name=\"chkbox_time_setting\" value=\"" + revInfo.id + "\" " +
                            "onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_time_setting + "</td>" +
                            "<td><label name=\"time_setting_name\">" + revInfo.name + "</label></td>" +
                            "<td style='text-align:center;'><label for=\"btn_edit_time_setting_" + count_time_setting +
                            "\" class='btn-edit' title='Edit the time setting'><i class='fas fa-edit' style='font-size: 18px;'></i></label>" +
                            "<input id=\"btn_edit_time_setting_" + count_time_setting + "\" type='button' class='btn-hidden'" +
                            " onclick=\"inputWeekSchedule()\" /></td></tr>");
                    }
                }
            };
            addXmlHttp.send(JSON.stringify(request));
            dialog.dialog("close");
            resetWeekSchedule();
        }
        return valid;
    };

    dialog = $("#dialog_add_time_setting").dialog({
        autoOpen: false,
        height: 600,
        width: 500,
        modal: false,
        buttons: {
            "Confirm": SendResult,
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
                resetWeekTimeColor();
                resetWeekSchedule();
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            resetWeekTimeColor();
            resetWeekSchedule();
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
    $("#btn_add_time_setting").button().on("click", function () {
        dialog.dialog("open");
    });

    /**
     * 刪除Time Setting
     */
    $("#btn_delete_time_setting").button().on("click", function () {
        var checkboxs = document.getElementsByName("chkbox_alarm_group");
        var delete_arr = [];
        for (k in checkboxs) {
            if (checkboxs[k].checked)
                delete_arr.push({ "id": checkboxs[k].value });
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
                    alert("Success delete the time setting");
                }
            }
        };
        deleteXmlHttp.send(requestJSON);
    });

    /**
    * 送出修改後的Time Setting List
    */
    /*$("#btn_submit_time_setting").button().on("click", function () {
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
                        inputTimeSetting();
                        alert("Success delete the alarm groups");
                    }
                }
            };
            editXmlHttp.send(requestJSON);
        }
        return valid;
    });*/
});