var allGroups = [];

function getGroupList() {
    var map_id = $("#map_info_id").val();
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMainAnchorsInMap"],
        "Value": {
            "map_id": map_id
        }
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var mainAnchorArr = [];
                var revInfo = 'Values' in revObj == true ? revObj.Values : [];
                allGroups = [];
                $("#table_group_list tbody").empty();
                revInfo.forEach(function (element, index) {
                    allGroups.push(element.group_id);
                    element.group_name = typeof (element.group_name) != 'undefined' ? element.group_name : "";
                    var tr_id = "tr_group_list_" + (index + 1);
                    $("#table_group_list tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                        "<input type=\"checkbox\" name=\"chkbox_group_list\" value=\"" + element.group_id + "\"" +
                        " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + (index + 1) +
                        "</td><td>" +
                        "<input type=\"text\" name=\"grouplist_name\" value=\"" + element.group_name +
                        "\" style=\"max-width:70px;\" readonly/>" +
                        "</td><td>" +
                        "<input type=\"text\" name=\"grouplist_main_anchor_id\" value=\"" + element.main_anchor_id +
                        "\" style=\"max-width:80px;\" readonly/>" +
                        "</td><td>" +
                        "<input type=\"text\" name=\"grouplist_main_anchor_x\" value=\"" + element.set_x +
                        "\" style=\"max-width:80px;\" readonly/>" +
                        "</td><td>" +
                        "<input type=\"text\" name=\"grouplist_main_anchor_y\" value=\"" + element.set_y +
                        "\" style=\"max-width:80px;\" readonly/>" +
                        "</td><td>" +
                        "<label for=\"btn_edit_grouplist_" + (index + 1) + "\" class='btn-edit' title='" +
                        $.i18n.prop('i_editGroup') + "'><i class='fas fa-edit' style='font-size:18px;'></i></label>" +
                        "<input id=\"btn_edit_grouplist_" + (index + 1) + "\" type='button' class='btn-hidden'" +
                        " onclick=\"editGroupList(\'" + element.main_anchor_id + "\',\'" + element.set_x + "\',\'" +
                        element.set_y + "\')\" /></td></tr>");

                    if (mainAnchorArr.indexOf(element.main_anchor_id) == -1) {
                        mainAnchorArr.push(element.main_anchor_id);
                        inputAnchorArray({
                            id: element.main_anchor_id,
                            type: "main",
                            x: element.set_x,
                            y: element.set_y,
                            group_id: element.group_id
                        });
                    }
                });
            } else {
                alert($.i18n.prop('i_mapAlert_6'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function editGroupList(main_anchor_id, set_x, set_y) {
    if (main_anchor_id != "") {
        var groupList = getRowData_Group();
        var count = 0;
        $("#table_edit_grouplist tbody").empty();
        groupList.forEach(element => {
            if (element.main_anchor_id == main_anchor_id) {
                count++;
                $("#table_edit_grouplist tbody").append("<tr>" +
                    "<td><input type=\"checkbox\" name=\"checkbox_edit_grouplist\" value=\"\" /> " + count + "</td>" +
                    "<td><select name=\"edit_grouplist_id\">" +
                    makeNameOptions("group_id", groupList, element.group_id) + "</select></td>" +
                    "<td><select name=\"edit_grouplist_name\">" +
                    makeNameOptions("group_name", groupList, element.group_name) + "</select></td></tr>");
            }
        });
        setGroupConnectChange("select[name='edit_grouplist_id']", "select[name='edit_grouplist_name']");
        $("#edit_grouplist_main_anchor").html(getMainAnchorDropdown(main_anchor_id));
        $("#edit_grouplist_main_anchor_x").val(set_x);
        $("#edit_grouplist_main_anchor_y").val(set_y);
        $("#dialog_edit_group_list").dialog("open");
    }
}

function EditGroupInfo(editInfo) {
    var editRequest = {
        "Command_Type": ["Write"],
        "Command_Name": ["EditGroup_Info"],
        "Value": editInfo
    };
    var editXmlHttp = createJsonXmlHttp("sql");
    editXmlHttp.onreadystatechange = function () {
        if (editXmlHttp.readyState == 4 || editXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                return;
            }
        }
    };
    editXmlHttp.send(JSON.stringify(editRequest));
}

$(function () {
    $("#btn_add_group").on('click', function () {
        $("#add_grouplist_id").val("");
        $("#add_grouplist_name").val("");
        $("#add_grouplist_main_anchor").html(getMainAnchorDropdown(""));
        $("#add_grouplist_main_anchor_x").val("");
        $("#add_grouplist_main_anchor_y").val("");
        $("#dialog_add_group_list").dialog("open");
    });

    $("#btn_pos_group").on('click', function () {
        startMainAnchorPosition();
    });

    $("#btn_delete_group").on('click', function () {
        var checkboxs = document.getElementsByName("chkbox_group_list");
        var deleteArr = [];
        var deleteMapGroupArr = [];
        var map_id = $("#map_info_id").val();
        for (j in checkboxs) {
            if (checkboxs[j].checked) {
                deleteArr.push({
                    "group_id": checkboxs[j].value
                });
                deleteMapGroupArr.push({
                    "map_id": map_id,
                    "group_id": checkboxs[j].value
                })
            }
        }
        if (deleteArr.length == 0) {
            alert($.i18n.prop('i_mapAlert_9'));
            return;
        }
        var deleteRequest = {
            "Command_Type": ["Read"],
            "Command_Name": ["DeleteGroup_Info"],
            "Value": deleteArr
        };
        var deleteXmlHttp = createJsonXmlHttp("sql");
        deleteXmlHttp.onreadystatechange = function () {
            if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    DeleteGroup_Anchor(deleteArr);
                    var deleteConnRequest = {
                        "Command_Type": ["Write"],
                        "Command_Name": ["DeleteMap_Group"],
                        "Value": deleteMapGroupArr
                    };
                    var xmlHttp = createJsonXmlHttp("sql");
                    xmlHttp.onreadystatechange = function () {
                        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                            var revObj = JSON.parse(this.responseText);
                            if (revObj.success > 0) {
                                DeleteGroup_Anchor(deleteArr);
                                getAllDataOfMap();
                            }
                        }
                    };
                    xmlHttp.send(JSON.stringify(deleteConnRequest));
                }
            }
        };
        deleteXmlHttp.send(JSON.stringify(deleteRequest));
    });

    $("#add_grouplist_id").on('change', function () {
        if ($(this).val().length > 0) {
            var repeat = allGroups.indexOf($(this).val());
            if (repeat > -1)
                $("#add_group_id_alert").text($.i18n.prop('i_existed')).css('color', 'red');
            else
                $("#add_group_id_alert").text($.i18n.prop('i_canAdd')).css('color', 'green');
        } else {
            $("#add_group_id_alert").empty();
        }
    });


    var dialog, form,
        add_grouplist_id = $("#add_grouplist_id"),
        add_grouplist_name = $("#add_grouplist_name"),
        add_main_anchor = $("#add_grouplist_main_anchor"),
        allFields = $([]).add(add_grouplist_id).add(add_grouplist_name).add(add_main_anchor);

    function addGrouplist() {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(add_grouplist_id, $.i18n.prop('i_mapAlert_14'), 1, 5);
        allGroups.forEach(element => { //驗證Group ID是否重複
            if (element == add_grouplist_id.val()) {
                valid = false;
                add_grouplist_id.addClass("ui-state-error");
                alert($.i18n.prop('i_mapAlert_11'));
            }
        });
        valid = valid && checkLength(add_grouplist_name, $.i18n.prop('i_mapAlert_13'), 1, 50);
        valid = valid && checkLength(add_main_anchor, $.i18n.prop('i_mapAlert_14'), 1, 5);
        if (valid) {
            var request = {
                "Command_Type": ["Write"],
                "Command_Name": ["AddListGroup"],
                "Value": [{
                    "group_id": add_grouplist_id.val(),
                    "group_name": add_grouplist_name.val(),
                    "main_anchor_id": add_main_anchor.val(),
                    "mode": "normal",
                    "mode_value": "0",
                    "fence": "0"
                }]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        getAllDataOfMap();
                        dialog.dialog("close");
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
            dialog.dialog("close");
        }
        return valid;
    }


    dialog = $("#dialog_add_group_list").dialog({
        autoOpen: false,
        height: 400,
        width: 340,
        modal: true,
        buttons: {
            Cancel: function () {
                dialog.dialog("close");
            },
            "Confirm": addGrouplist
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        addGrouplist();
    });
});

$(function () {
    var dialog, form,
        edit_grouplist_id = $("select[name='edit_grouplist_id']"),
        edit_grouplist_name = $("select[name='edit_grouplist_name']"),
        edit_main_anchor = $("#edit_grouplist_main_anchor"),
        allFields = $([]).add(edit_grouplist_id).add(edit_grouplist_name).add(edit_main_anchor);

    $("#btn_edit_grouplist_add").on("click", function () {
        var groupList = getRowData_Group(),
            count = document.getElementsByName("checkbox_edit_grouplist").length + 1;
        $("#table_edit_grouplist tbody").append("<tr>" +
            "<td><input type=\"checkbox\" name=\"checkbox_edit_grouplist\" value=\"\" /> " + count + "</td>" +
            "<td><select name=\"edit_grouplist_id\">" +
            makeNameOptions("group_id", groupList, groupList[0].group_id) + "</select></td>" +
            "<td><select name=\"edit_grouplist_name\">" +
            makeNameOptions("group_name", groupList, groupList[0].group_name) + "</select></td></tr>");
        setGroupConnectChange("select[name='edit_grouplist_id']", "select[name='edit_grouplist_name']");
    });

    $("#btn_edit_grouplist_delete").on("click", function () {
        var groupList = getRowData_Group(),
            groups = document.getElementsByName("checkbox_edit_grouplist"),
            group_ids = document.getElementsByName("edit_grouplist_id"),
            group_names = document.getElementsByName("edit_grouplist_name"),
            count = 0;
        trs = "",
            groups.forEach(function (element, i) {
                if (!element.checked) {
                    count++;
                    trs += "<tr><td><input type=\"checkbox\" name=\"checkbox_edit_grouplist\" value=\"\" /> " + count + "</td>" +
                        "<td><select name=\"edit_grouplist_id\">" +
                        makeNameOptions("group_id", groupList, group_ids[i].value) + "</select></td>" +
                        "<td><select name=\"edit_grouplist_name\">" +
                        makeNameOptions("group_name", groupList, group_names[i].value) + "</select></td></tr>";
                }
            });
        $("#table_edit_grouplist tbody").html(trs);
        setGroupConnectChange("select[name='edit_grouplist_id']", "select[name='edit_grouplist_name']");
    });

    function submitEditGrouplist() {
        var valid = true;
        allFields.removeClass("ui-state-error");
        valid = valid && checkLength(edit_grouplist_name, $.i18n.prop('i_mapAlert_13'), 1, 50);
        valid = valid && checkLength(edit_main_anchor, $.i18n.prop('i_mapAlert_14'), 1, 5);
        if (valid) {
            var requestArray = {
                "Command_Type": ["Read"],
                "Command_Name": ["GetGroups"]
            };
            var getXmlHttp = createJsonXmlHttp("sql");
            getXmlHttp.onreadystatechange = function () {
                if (getXmlHttp.readyState == 4 || getXmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    var id = edit_grouplist_id.text();
                    if (revObj.success > 0) {
                        var index = revInfo.findIndex(function (info) {
                            return info.group_id == id;
                        })
                        if (index > -1) {
                            var editGroupInfo = {
                                "group_id": revInfo[index].group_id,
                                "group_name": edit_grouplist_name.val(),
                                "main_anchor_id": edit_main_anchor.val(),
                                "mode": revInfo[index].mode,
                                "mode_value": revInfo[index].mode_value,
                                "fence": revInfo[index].fence
                            };
                            EditGroupInfo(editGroupInfo);
                            getAllDataOfMap();
                            dialog.dialog("close");
                        }
                    }
                }
            };
            getXmlHttp.send(JSON.stringify(requestArray));
        }
        return valid;
    }

    dialog = $("#dialog_edit_group_list").dialog({
        autoOpen: false,
        height: 450,
        width: 300,
        modal: true,
        buttons: {
            Cancel: function () {
                dialog.dialog("close");
            },
            "Confirm": submitEditGrouplist
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        submitEditGrouplist();
    });
});