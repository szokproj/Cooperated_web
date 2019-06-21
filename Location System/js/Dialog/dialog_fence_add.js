var operating = "";
var addFenceContainGroup = [];


function updateFenceGroup(fg_arr) {
    addFenceContainGroup = fg_arr.slice(0);
}

function editFenceInfo(f_id) {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetFence_info"],
        "Value": {
            "fence_id": f_id
        }
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                operating = "Edit";
                if (revObj.Values) {
                    var editFence = revObj.Values[0];
                    $("#add_fence_id").val(editFence.fence_id);
                    $("#add_fence_name").val(editFence.fence_name);
                    getFencePoints(editFence.fence_id);
                    getFenceGroups(editFence.fence_id);
                    $("#dialog_add_fence").dialog("open");
                } else {
                    alert($.i18n.prop('i_alertError_9'));
                }
            } else {
                alert($.i18n.prop('i_alertError_9'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function getFencePoints(f_id) {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetFence_point"],
        "Value": {
            "fence_id": f_id
        }
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                operating = "Edit";
                var fencePoints = 'Values' in revObj == true ? revObj.Values : [];
                $("#table_fence_dot_setting tbody").empty();
                for (j = 0; j < fencePoints.length; j++) {
                    var tr_id = "tr_fence_dot_setting_" + fencePoints[j].point_order;
                    $("#table_fence_dot_setting tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                        "<input type=\"checkbox\" name=\"chkbox_fence_dot_setting\" value=\"" + tr_id +
                        "\" onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + (j + 1) + "</td>" +
                        "<td><label name=\"dot_x\">" + fencePoints[j].point_x + "</label></td>" +
                        "<td><label name=\"dot_y\">" + fencePoints[j].point_y + "</label></td></tr>");
                }
            } else {
                alert($.i18n.prop('i_alertError_9'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function getFenceGroups(f_id) {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetFence_group"],
        "Value": {
            "fence_id": f_id
        }
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                operating = "Edit";
                var fenceGroups = 'Values' in revObj == true ? revObj.Values : [];
                $("#table_fence_group tbody").empty();
                fenceGroups.forEach(function (element, index) {
                    $("#table_fence_group tbody").append("<tr><td>" + (index + 1) + "</td>" +
                        "<td name=\"fence_groups\">" + element.group_name + "</td></tr>");
                });
            } else {
                alert($.i18n.prop('i_alertError_9'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function addFencePoints(f_id) {
    var add_point_arr = [];
    var order = document.getElementsByName("chkbox_fence_dot_setting");
    var x = document.getElementsByName("dot_x");
    var y = document.getElementsByName("dot_y");
    order.forEach(function (element, index) {
        add_point_arr.push({
            "fence_id": f_id,
            "point_order": (index + 1).toString(),
            "point_x": x[index].innerText,
            "point_y": y[index].innerText
        });
    });
    var fd_addXmlHttp = createJsonXmlHttp("sql");
    fd_addXmlHttp.onreadystatechange = function () {
        if (fd_addXmlHttp.readyState == 4 || fd_addXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success == 4) {
                resetDotArray();
                updateFenceTable();
            } else {
                alert($.i18n.prop('i_alarmAlert_32'));
            }
        }
    };
    fd_addXmlHttp.send(JSON.stringify({
        "Command_Type": ["Write"],
        "Command_Name": ["AddFencePoint"],
        "Value": add_point_arr
    }));
}

function addFenceGroups(f_id) {
    var add_group_arr = [];
    addFenceContainGroup.forEach(element => {
        add_group_arr.push({
            "fence_id": f_id,
            "group_id": element.g_id
        });
    });
    var fg_addXmlHttp = createJsonXmlHttp("sql");
    fg_addXmlHttp.onreadystatechange = function () {
        if (fg_addXmlHttp.readyState == 4 || fg_addXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                resetDotGroup();
            } else {
                alert($.i18n.prop('i_alarmAlert_32'));
            }
        }
    };
    fg_addXmlHttp.send(JSON.stringify({
        "Command_Type": ["Write"],
        "Command_Name": ["AddFenceGroup"],
        "Value": add_group_arr
    }));
}



$(function () {
    var dialog, form,
        add_fence_id = $("#add_fence_id"),
        add_fence_name = $("#add_fence_name"),
        allFields = $([]).add(add_fence_name);
    //tips = $( ".validateTips" );

    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(add_fence_name, "Electronic fence check", 1, 20);
        var order = document.getElementsByName("chkbox_fence_dot_setting");
        if (order.length != 4) {
            alert($.i18n.prop('i_alarmAlert_33'));
            return;
        }
        if (valid) {
            if (operating == "Add") {
                var addRequest = {
                    "Command_Type": ["Write"],
                    "Command_Name": ["AddFenceInfo"],
                    "Value": [{
                        "fence_name": add_fence_name.val(),
                        "map_id": $("#select_map_id").val(),
                        "list_type": "block"
                    }]
                };
                var addXmlHttp = createJsonXmlHttp("sql");
                addXmlHttp.onreadystatechange = function () {
                    if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (revObj.success > 0) {
                            var newFence_id = 'Values' in revObj == true ? revObj.Values.fence_id : "";
                            addFencePoints(newFence_id);
                            addFenceGroups(newFence_id);
                        }
                    }
                };
                addXmlHttp.send(JSON.stringify(addRequest));
            } else if (operating == "Edit") {
                if (add_fence_id.val() == "") {
                    alert();
                    return;
                }

                var editXmlHttp = createJsonXmlHttp("sql");
                editXmlHttp.onreadystatechange = function () {
                    if (editXmlHttp.readyState == 4 || editXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (revObj.success > 0) {
                            resetFencePosition();

                            var fd_editXmlHttp = createJsonXmlHttp("sql");
                            fd_editXmlHttp.onreadystatechange = function () {
                                if (fd_editXmlHttp.readyState == 4 || fd_editXmlHttp.readyState == "complete") {
                                    var revObj = JSON.parse(this.responseText);
                                    if (revObj.success > 0) {
                                        addFencePoints(add_fence_id.val());
                                    }
                                }
                            };
                            fd_editXmlHttp.send(JSON.stringify({
                                "Command_Type": ["Write"],
                                "Command_Name": ["DeleteFence_point_by_fid"],
                                "Value": [{
                                    "fence_id": add_fence_id.val()
                                }]
                            }));

                            var fg_editXmlHttp = createJsonXmlHttp("sql");
                            fg_editXmlHttp.onreadystatechange = function () {
                                if (fg_editXmlHttp.readyState == 4 || fg_editXmlHttp.readyState == "complete") {
                                    var revObj = JSON.parse(this.responseText);
                                    var count_group = addFenceContainGroup.length;
                                    if (revObj.success > 0 && count_group > 0) {
                                        addFenceGroups(add_fence_id.val());
                                    }
                                }
                            };
                            fg_editXmlHttp.send(JSON.stringify({
                                "Command_Type": ["Write"],
                                "Command_Name": ["DeleteFence_group_by_fid"],
                                "Value": [{
                                    "fence_id": add_fence_id.val()
                                }]
                            }));
                        }
                    }
                };
                editXmlHttp.send(JSON.stringify({
                    "Command_Type": ["Read"],
                    "Command_Name": ["EditFence_Info"],
                    "Value": {
                        "fence_id": add_fence_id.val(),
                        "fence_name": add_fence_name.val(),
                        "map_id": $("#select_map_id").val(),
                        "list_type": "black"
                    }
                }));
            } else {
                alert($.i18n.prop('i_alertError_9'));
            }
            dialog.dialog("close");
        }
        return valid;
    };

    dialog = $("#dialog_add_fence").dialog({
        autoOpen: false,
        height: 600,
        width: 400,
        modal: false,
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
        if ($("#select_map_id").val() == '') {
            alert($.i18n.prop('i_alarmAlert_29'));
        } else {
            operating = "Add";
            resetDotArray();
            resetDotGroup();
            $("#table_fence_dot_setting tbody").empty();
            $("#table_fence_group tbody").empty();
            dialog.dialog("open");
        }
    });

    $("#btn_fence_delete").button().on("click", function () {
        if ($("#select_map_id").val() == '') {
            alert($.i18n.prop('i_alarmAlert_29'));
            return;
        }
        var checkboxs = document.getElementsByName("chkbox_fence_setting");
        var delete_arr = [];
        for (k in checkboxs) {
            if (checkboxs[k].checked) {
                delete_arr.push({
                    id: checkboxs[k].value
                });
            }
        }
        var lan = delete_arr.length;
        var fdRequest = {
            "Command_Type": ["Write"],
            "Command_Name": ["deleteFenceDot"],
            "Value": delete_arr
        };
        var fdXmlHttp = createJsonXmlHttp("sql");
        fdXmlHttp.onreadystatechange = function () {
            if (fdXmlHttp.readyState == 4 || fdXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success == lan) {
                    var fgRequest = {
                        "Command_Type": ["Write"],
                        "Command_Name": ["deleteFenceGroup"],
                        "Value": delete_arr
                    };
                    var fgXmlHttp = createJsonXmlHttp("sql");
                    fgXmlHttp.onreadystatechange = function () {
                        if (fgXmlHttp.readyState == 4 || fgXmlHttp.readyState == "complete") {
                            var revObj = JSON.parse(this.responseText);
                            if (revObj.success == lan)
                                updateFenceArr();
                        } else {
                            alert($.i18n.prop('i_alarmAlert_34') + (lan - revObj.success));
                        }
                    };
                    fgXmlHttp.send(JSON.stringify(fgRequest));
                } else {
                    alert($.i18n.prop('i_alarmAlert_35') + (lan - revObj.success));
                }
            }
        };
        fdXmlHttp.send(JSON.stringify(fdRequest));
    });
});


$(function () {
    var dialog, form,
        add_x = $("#add_dot_x"),
        add_y = $("#add_dot_y"),
        count_dot = 0,
        allFields = $([]).add(add_x, add_y);
    //tips = $( ".validateTips" );

    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(add_x, $.i18n.prop('i_alarmAlert_36'), 1, 20);
        valid = valid && checkLength(add_y, $.i18n.prop('i_alarmAlert_37'), 1, 20);
        if (valid) {
            count_dot++
            addDotArray(count_dot, add_x.val(), add_y.val());
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
            $("#tr_fence_dot_setting_" + id).remove();
            deleteDotArray(id);
        });
        updateFenceDotsArr();
        draw();
    });
});