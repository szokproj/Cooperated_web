function cerateDialog(dialog_id, request_name) {
    var dialog, form, target, allFields, request = "";

    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(target, "Not nullable", 1, 20);
        if (valid) {
            var xmlHttp = createJsonXmlHttp(request_name);
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0)
                        alert("設定成功!");
                    else
                        alert("設定失敗!");
                }
            };
            xmlHttp.send(JSON.stringify(request));
            dialog.dialog("close");
        }
        return valid;
    };

    dialog = $("#" + dialog_id).dialog({
        autoOpen: false,
        height: 400,
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

    this.setRequest = function (request) {
        request = request;
    };

    this.inputTimeNode = function (node_id) {
        target = $("#" + node_id);
        allFields = $([]).add(target);
        return target;
    };

    this.setOpenButton = function (btn_id) {
        $("#" + btn_id).button().on("click", function () {
            dialog.dialog("open");
        });
    };
}


$(function () {
    var dialog, form,
        add_fence_id = $("#add_fence_id"),
        add_fence_name = $("#add_fence_name"),
        allFields = $([]).add(add_fence_id, add_fence_name);
    //tips = $( ".validateTips" );

    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(add_fence_id, "Electronic fence check", 1, 20);
        valid = valid && checkLength(add_fence_name, "Electronic fence check", 1, 20);

        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["AddFence"],
            "Value": {
                "id": add_fence_id.val(),
                "name": add_fence_name.val()
            }
        });
        if (valid) {
            var addXmlHttp = createJsonXmlHttp("AddSettingTest");
            addXmlHttp.onreadystatechange = function () {
                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        fenceArray.push({ id: revInfo.id, name: revInfo.name });
                        updateFenceArr();
                    }
                }
            };
            addXmlHttp.send(requestJSON);
            dialog.dialog("close");
        }
        return valid;
    };

    dialog = $("#dialog_add_fence").dialog({
        autoOpen: false,
        height: 400,
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

    $("#btn_fence_add").button().on("click", function () {
        dialog.dialog("open");
    });

    $("#btn_fence_delete").button().on("click", function () {
        var checkboxs = document.getElementsByName("chkbox_fence_setting");
        var delete_arr = [];
        for (k in checkboxs) {
            if (checkboxs[k].checked)
                delete_arr.push(checkboxs[k].value);
        }
        delete_arr.forEach(id => {
            $("#" + id).remove();
        });
    });
});



$(function () {
    var dialog, form,
        add_fence_id = $("#add_dot_fence_id"),
        add_x = $("#add_dot_x"),
        add_y = $("#add_dot_y"),
        allFields = $([]).add(add_fence_id, add_x, add_y);
    //tips = $( ".validateTips" );

    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(add_fence_id, "Electronic fence check", 1, 20);
        valid = valid && checkLength(add_x, "Electronic fence check", 1, 20);
        valid = valid && checkLength(add_y, "Electronic fence check", 1, 20);

        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["AddFence"],
            "Value": {
                "fence_id": add_fence_id.val(),
                "x": add_x.val(),
                "y": add_y.val()
            }
        });
        if (valid) {
            var addXmlHttp = createJsonXmlHttp("AddSettingTest");
            addXmlHttp.onreadystatechange = function () {
                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        fenceDotArray.push({
                            fence_id: revInfo.fence_id,
                            id: revInfo.id,
                            x: revInfo.x / canvasImg.scale,
                            y: canvasImg.height - revInfo.y / canvasImg.scale //因為Server回傳的座標為左下原點
                        });
                        updateFenceDotsArr();
                    }
                }
            };
            addXmlHttp.send(requestJSON);
            dialog.dialog("close");
        }
        return valid;
    };

    dialog = $("#dialog_add_fence_dot").dialog({
        autoOpen: false,
        height: 300,
        width: 250,
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

    $("#btn_fence_dot_add").button().on("click", function () {
        dialog.dialog("open");
    });

    $("#btn_fence_dot_delete").button().on("click", function () {
        var checkboxs = document.getElementsByName("chkbox_fence_dot_setting");
        var delete_arr = [];
        for (k in checkboxs) {
            if (checkboxs[k].checked)
                delete_arr.push(checkboxs[k].value);
        }
        delete_arr.forEach(id => {
            $("#" + id).remove();
        });
    });
});

