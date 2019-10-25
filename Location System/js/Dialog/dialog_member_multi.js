var token = "";

$(function () {
    token = getToken();

    var dialog, form,
        sel_item = $("#multi_edit_item"),
        sel_value = $("#multi_edit_value"),
        allFields = $([]).add(sel_item, sel_value);
    //tips = $( ".validateTips" );


    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(sel_item, $.i18n.prop('i_mapAlert_13'), 0, 20);
        valid = valid && checkLength(sel_value, $.i18n.prop('i_mapAlert_13'), 0, 20);

        if (valid) {
            var num_arr = [];
            var checkboxs = document.getElementsByName("chkbox_members");
            for (j in checkboxs) {
                if (checkboxs[j].checked)
                    num_arr.push(checkboxs[j].value);
            }
            var request = {
                "Command_Type": ["Write"],
                "api_token": [token]
            };
            var request_arr = [];

            switch (sel_item.val()) {
                case "department":
                    request.Command_Name = ["multiEdit_StaffDepartment"];
                    for (i = 0; i < num_arr.length; i++) {
                        request_arr.push({
                            "number": num_arr[i],
                            "department": sel_value.val()
                        });
                    }
                    request.Value = request_arr;
                    break;
                case "jobTitle":
                    request.Command_Name = ["multiEdit_StaffJobTitle"];
                    for (i = 0; i < num_arr.length; i++) {
                        request_arr.push({
                            "number": num_arr[i],
                            "jobTitle": sel_value.val()
                        });
                    }
                    request.Value = request_arr;
                    break;
                case "type":
                    request.Command_Name = ["multiEdit_StaffType"];
                    for (i = 0; i < num_arr.length; i++) {
                        request_arr.push({
                            "number": num_arr[i],
                            "type": sel_value.val()
                        });
                    }
                    request.Value = request_arr;
                    break;
                case "alarm_group":
                    request.Command_Name = ["multiEdit_StaffAlarmGroup"];
                    for (i = 0; i < num_arr.length; i++) {
                        request_arr.push({
                            "number": num_arr[i],
                            "alarm_group": sel_value.val()
                        });
                    }
                    request.Value = request_arr;
                    break;
                default:
                    alert($.i18n.prop('i_alertError_12'));
            }

            var xmlHttp = createJsonXmlHttp('sql');
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0)
                        UpdateMemberList();
                }
            };
            xmlHttp.send(JSON.stringify(request));
            dialog.dialog("close");
        }
        return valid;
    };

    dialog = $("#dialog_multi_edit").dialog({
        autoOpen: false,
        height: 210,
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
});