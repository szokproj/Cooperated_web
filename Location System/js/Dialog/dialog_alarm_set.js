var token = "";

$(function () {
    token = getUser() ? getUser().api_token : "";

    var stay_alarm_dialog = new cerateAlarmDialog("dialog_stay_alarm_setting", "setStayAlarmTime");
    stay_alarm_dialog.inputTimeNode("stay_alarm_time");
    stay_alarm_dialog.setOpenButton("set_alarm_stay");

    var hidden_alarm_dialog = new cerateAlarmDialog("dialog_hidden_alarm_setting", "setHiddenAlarmTime");
    hidden_alarm_dialog.inputTimeNode("hidden_alarm_time");
    hidden_alarm_dialog.setOpenButton("set_alarm_hidden");
});

function cerateAlarmDialog(dialog_id, request_name) {
    var dialog, form, target, allFields = $([]);

    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(target, $.i18n.prop('i_alertError_10'), 1, 20);
        var jsonRequest = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": [request_name],
            "Value": {
                "time": target.val()
            },
            "api_token": [token]
        });
        if (valid) {
            var xmlHttp = createJsonXmlHttp(request_name);
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0)
                        alert($.i18n.prop('i_alarmAlert_2'));
                    else
                        alert($.i18n.prop('i_alarmAlert_3'));
                }
            };
            xmlHttp.send(jsonRequest);
            dialog.dialog("close");
        }
        return valid;
    };

    dialog = $("#" + dialog_id).dialog({
        autoOpen: false,
        height: 200,
        width: 300,
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

    this.inputTimeNode = function (node_id) {
        target = $("#" + node_id);
        allFields = allFields.add(target);
    };

    this.setOpenButton = function (btn_id) {
        $("#" + btn_id).button().on("click", function () {
            dialog.dialog("open");
        });
    };
}