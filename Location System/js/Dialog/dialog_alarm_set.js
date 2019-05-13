var count_tag_set = 0,
    RecordAlarmInfos = {},
    statusArray = ["Low Power Alarm", "Help Alarm", "Still Alarm", "Active Alarm"],
    //假設接收到response的key，並建立Array
    res_key_array = ["low_power_alarm", "help_alarm", "still_alarm", "active_alarm",
        "manual_release", "duration", "siren"
    ]

function inputAlarmSetting(setting) {
    RecordAlarmInfos = setting;
    $(function () {
        for (var i = 0; i < statusArray.length; i++) {
            if (setting[statusArray[i]] == 1)
                $("#on_status" + (i + 1)).prop("checked", true);
            else
                $("#off_status" + (i + 1)).prop("checked", true);
        }
        if (setting[statusArray[statusArray.length]] == 1)
            $("#on_manual_release").prop("checked", true);
        else
            $("#off_manual_release").prop("checked", true);
        $("#duration").val(setting[statusArray[statusArray.length + 1]]);
        $("#siren option[value=" + setting[statusArray[statusArray.length + 2]] + "]").prop('selected', true)
    });
}

$(function () {
    var dialog, form,
        duration = $("#duration"),
        alarm_array = {};
    allFields = $([]).add(duration);
    //tips = $( ".validateTips" );

    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(duration, "Alarm duration", 0, 20);
        for (i = 0; i < statusArray.length; i++) {
            alarm_array.push($("input[name=status" + (i + 1) + "]:checked").val());
        }
        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["", ""],
            "Value": {
                "low_power_alarm": alarm_array[0],
                "help_alarm": alarm_array[1],
                "still_alarm": alarm_array[2],
                "active_alarm": alarm_array[3],
                "manual_release": $("input[name=manual_release]:checked").val(),
                "duration": duration.val(),
                "siren": $("#siren").children('option:selected').val()
            }
        });
        if (valid) {
            var xmlHttp = GetXmlHttpObject();
            if (xmlHttp == null) {
                alert("Browser does not support HTTP Request");
                return;
            }
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success == 1) {
                        alert("成功更新 Group List:" + revInfo.length + "筆\n" +
                            "失敗:" + (revInfo.length - row_count) + "筆");
                        inputAlarmSetting(revInfo);
                    }
                }
            };
            xmlHttp.open("POST", "AlarmSet", true);
            xmlHttp.setRequestHeader("Content-type", "application/json");
            xmlHttp.send(requestJSON);
            dialog.dialog("close");
        }
        return valid;
    };

    dialog = $("#dialog_alarm_set").dialog({
        autoOpen: false,
        height: 500,
        width: 400,
        modal: true,
        buttons: {
            "Confirm": SendResult,
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
                inputAlarmSetting(RecordAlarmInfos);
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
            inputAlarmSetting(RecordAlarmInfos);
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        SendResult();
    });

    $("#Alarm_Setting").button().on("click", function () {
        dialog.dialog("open");
    });
});