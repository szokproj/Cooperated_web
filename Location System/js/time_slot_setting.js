var weekday_arr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

var TimeSlotArr = [];

function importTimeSlot() {
    inputTimeSetting();
    resetWeekSchedule();
    weekday_arr.forEach(function (weekday) {
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
        weekday_arr.forEach(function (weekday) {
            $("#week_time_check_" + weekday).prop('checked', all_check)
            $("#week_time_start_" + weekday).attr('disabled', !all_check);
            $("#week_time_end_" + weekday).attr('disabled', !all_check);
        });
    });

    var dialog, form,
        add_name = $("#add_time_slot_name"),
        allFields = $([]).add(add_name);

    function resetWeekTimeColor() {
        weekday_arr.forEach(function (weekday) {
            $("#week_time_start_" + weekday).removeClass("ui-state-error");
            $("#week_time_end_" + weekday).removeClass("ui-state-error");
        });
    }

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
            alert($.i18n.prop('i_alarmAlert_20'));
            return false;
        } else {
            return true;
        }
    }

    function SendResult() {
        if (!confirm($.i18n.prop('i_alarmAlert_21')))
            return;
        allFields.removeClass("ui-state-error");
        resetWeekTimeColor();
        var valid = true && checkLength(add_name, $.i18n.prop('i_alarmAlert_22'), 1, 20),
            time_slot_setting = {
                "time_slot_name": add_name.val(),
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
            };
        weekday_arr.forEach(function (weekday) {
            if ($("#week_time_check_" + weekday).prop('checked')) {
                valid = valid && checkLength($("#week_time_start_" + weekday), $.i18n.prop('i_alarmAlert_23'), 5, 5);
                valid = valid && checkLength($("#week_time_end_" + weekday), $.i18n.prop('i_alarmAlert_23'), 5, 5);
                valid = valid && checkTimeSum($("#week_time_start_" + weekday), $("#week_time_end_" + weekday));
                time_slot_setting[weekday + "_start"] = $("#week_time_start_" + weekday).val() + ":00";
                time_slot_setting[weekday + "_end"] = $("#week_time_end_" + weekday).val() + ":59";
            }
        });
        if (valid) {
            if (submit_type["time_slot"] == "Add") {
                var request = {
                    "Command_Type": ["Write"],
                    "Command_Name": ["AddTimeSlot"],
                    "Value": [time_slot_setting],
                    "api_token": [token]
                };
                var addXmlHttp = createJsonXmlHttp("sql");
                addXmlHttp.onreadystatechange = function () {
                    if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                            inputTimeSetting();
                            dialog.dialog("close");
                            resetWeekSchedule();
                            alert($.i18n.prop('i_alarmAlert_17'));
                        } else {
                            alert($.i18n.prop('i_alarmAlert_18'));
                        }
                    }
                };
                addXmlHttp.send(JSON.stringify(request));
            } else if (submit_type["time_slot"] == "Edit") {
                time_slot_setting.time_slot_id = $("#add_time_slot_id").val();
                var request = {
                    "Command_Type": ["Write"],
                    "Command_Name": ["EditTimeSlot"],
                    "Value": time_slot_setting,
                    "api_token": [token]
                };
                var editXmlHttp = createJsonXmlHttp("sql");
                editXmlHttp.onreadystatechange = function () {
                    if (editXmlHttp.readyState == 4 || editXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                            inputTimeSetting();
                            dialog.dialog("close");
                            resetWeekSchedule();
                            alert($.i18n.prop('i_alarmAlert_24'));
                        } else {
                            alert($.i18n.prop('i_alarmAlert_25'));
                        }
                    }
                };
                editXmlHttp.send(JSON.stringify(request));
            } else {
                return false;
            }
        }
        return valid;
    }

    dialog = $("#dialog_add_time_slot").dialog({
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

    //新增Time Setting
    $("#btn_add_time_slot").button().on("click", function () {
        submit_type["time_slot"] = "Add";
        dialog.dialog("open");
    });

    //刪除Time Setting
    $("#btn_delete_time_slot").button().on("click", function () {
        var checkboxs = document.getElementsByName("chkbox_time_slot"),
            delete_arr = [];
        for (k in checkboxs) {
            if (checkboxs[k].checked) {
                delete_arr.push({
                    "time_slot_id": checkboxs[k].value
                });
            }
        }
        if (delete_arr.length == 0)
            return alert($.i18n.prop('i_alarmAlert_9'));
        if (confirm($.i18n.prop('i_alarmAlert_19'))) {
            var requestJSON = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["DeleteTimeSlot"],
                "Value": delete_arr,
                "api_token": [token]
            });
            var deleteXmlHttp = createJsonXmlHttp("sql");
            deleteXmlHttp.onreadystatechange = function () {
                if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                        inputTimeSetting();
                        alert($.i18n.prop('i_alarmAlert_26'));
                    } else {
                        alert($.i18n.prop('i_alarmAlert_27'));
                    }
                }
            };
            deleteXmlHttp.send(requestJSON);
        }
    });
}

function inputTimeSetting() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetTimeSlot_list"],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            $("#table_time_slot tbody").empty(); //先重置表格
            count_time_slot = 0;
            if (!checkTokenAlive(token, revObj)) {
                return;
            } else if (revObj.Value[0].success > 0) {
                TimeSlotArr = "Values" in revObj.Value[0] ? revObj.Value[0].Values.slice(0) : [];
                for (i = 0; i < TimeSlotArr.length; i++) {
                    TimeSlotArr[i]["id"] = TimeSlotArr[i].time_slot_id;
                    TimeSlotArr[i]["name"] = TimeSlotArr[i].time_slot_name;
                    count_time_slot++;
                    var tr_id = "tr_time_slot_" + count_time_slot;
                    $("#table_time_slot tbody").append("<tr id=\"" + tr_id + "\">" +
                        "<td><input type='checkbox' name=\"chkbox_time_slot\" value=\"" + TimeSlotArr[i].time_slot_id +
                        "\" onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_time_slot + "</td>" +
                        "<td><label name=\"time_slot_name\">" + TimeSlotArr[i].time_slot_name + "</label></td>" +
                        "<td style='text-align:center;'><label for=\"btn_edit_time_slot_" + count_time_slot +
                        "\" class='btn-edit' title='" + $.i18n.prop('i_editTimeSlot') + "'>" +
                        "<i class='fas fa-edit' style='font-size:18px;'></i></label>" +
                        "<input id=\"btn_edit_time_slot_" + count_time_slot + "\" type='button' class='btn-hidden'" +
                        " onclick=\"inputWeekSchedule(\'" + TimeSlotArr[i].time_slot_id + "\')\" /></td></tr>");
                }
                inputTimeGroups();
            } else {
                alert($.i18n.prop('i_alarmAlert_14'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function inputWeekSchedule(id) {
    submit_type["time_slot"] = "Edit";
    var index = TimeSlotArr.findIndex(function (info) {
            return info.time_slot_id == id;
        }),
        weekTime = TimeSlotArr[index];
    $("#add_time_slot_id").val(TimeSlotArr[index].time_slot_id)
    $("#add_time_slot_name").val(TimeSlotArr[index].time_slot_name);
    weekday_arr.forEach(function (weekday) {
        var start = weekTime[weekday + "_start"],
            end = weekTime[weekday + "_end"];
        if (start != "-1" && end != "-1") {
            $("#week_time_check_" + weekday).prop('checked', true);
            $("#week_time_start_" + weekday).attr('disabled', false);
            $("#week_time_end_" + weekday).attr('disabled', false);
            $("#week_time_start_" + weekday).val(start.substr(0, 5));
            $("#week_time_end_" + weekday).val(end.substr(0, 5));
        }
    });
    $("#dialog_add_time_slot").dialog("open");
}

function resetWeekSchedule() {
    weekday_arr.forEach(function (weekday) {
        $("#week_time_check_" + weekday).prop('checked', false);
        $("#week_time_start_" + weekday).attr('disabled', true);
        $("#week_time_end_" + weekday).attr('disabled', true);
        $("#week_time_start_" + weekday).val("").attr('disabled', true);
        $("#week_time_end_" + weekday).val("").attr('disabled', true);
    });
}