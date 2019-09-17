var token = "";
var allGroups = [];
var maps_groupsArray = [];

$(function () {
    token = getUser() ? getUser().api_token : "";

    $("#btn_add_group").on('click', function () {
        $("#add_grouplist_id").val("");
        $("#add_group_id_alert").empty();
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
        if (confirm($.i18n.prop('i_mapAlert_26'))) {
            var checkboxs = document.getElementsByName("chkbox_group_list");
            var deleteArray = [];
            for (j in checkboxs) {
                if (checkboxs[j].checked) {
                    deleteArray.push({
                        "group_id": checkboxs[j].value
                    });
                }
            }
            if (deleteArray.length > 0)
                DeleteGroupInfo(deleteArray);
            else
                alert($.i18n.prop('i_mapAlert_9'));
        }
    });

    $("#add_grouplist_id").on('change', function () {
        if ($(this).val().length > 0) {
            var isBoundByMap = maps_groupsArray.findIndex(function (map_group) {
                return map_group.group_id == $("#add_grouplist_id").val();
            });
            if (isBoundByMap > -1)
                $("#add_group_id_alert").text($.i18n.prop('i_existed')).css('color', 'red');
            else
                $("#add_group_id_alert").text($.i18n.prop('i_canAdd')).css('color', 'green');
        } else {
            $("#add_group_id_alert").empty();
        }
    });

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
            count = 0,
            trs = "";
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

    //Dialog to add grouplist by main anchor.
    var dialog, form,
        add_grouplist_id = $("#add_grouplist_id"),
        add_grouplist_name = $("#add_grouplist_name"),
        add_main_anchor = $("#add_grouplist_main_anchor"),
        add_main_anchor_x = $("#add_grouplist_main_anchor_x"),
        add_main_anchor_y = $("#add_grouplist_main_anchor_y"),
        allFields = $([]).add(add_grouplist_id).add(add_grouplist_name)
        .add(add_main_anchor).add(add_main_anchor_x).add(add_main_anchor_y);

    function submitAddGrouplist() {
        allFields.removeClass("ui-state-error");
        var valid = true;
        var isBoundByMap = maps_groupsArray.findIndex(function (map_group) {
            return map_group.group_id == add_grouplist_id.val();
        });
        if (isBoundByMap > -1) {
            valid = false;
            add_grouplist_id.addClass("ui-state-error");
            alert($.i18n.prop('i_mapAlert_11'));
        }
        valid = valid && checkLength(add_grouplist_id, $.i18n.prop('i_mapAlert_14'), 1, 5);
        valid = valid && checkLength(add_grouplist_name, $.i18n.prop('i_mapAlert_13'), 1, 50);
        valid = valid && checkLength(add_main_anchor, $.i18n.prop('i_mapAlert_14'), 1, 5);
        valid = valid && checkLength(add_main_anchor_x, $.i18n.prop('i_mapAlert_13'), 1, 50);
        valid = valid && checkLength(add_main_anchor_y, $.i18n.prop('i_mapAlert_13'), 1, 50);

        if (valid) {
            var request = {
                "Command_Type": ["Write"],
                "Command_Name": ["AddListGroup"],
                "Value": [{
                    "group_id": add_grouplist_id.val(),
                    "group_name": add_grouplist_name.val(),
                    "main_anchor_id": add_main_anchor.val(),
                    "set_x": add_main_anchor_x.val(),
                    "set_y": add_main_anchor_y.val(),
                    "mode": "normal",
                    "mode_value": "0",
                    "fence": "0"
                }],
                "api_token": [token]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        var request2 = {
                            "Command_Type": ["Write"],
                            "Command_Name": ["AddListMap_Group"],
                            "Value": [{
                                "map_id": $("#map_info_id").val(),
                                "group_id": add_grouplist_id.val()
                            }],
                            "api_token": [token]
                        };
                        var xmlHttp2 = createJsonXmlHttp("sql");
                        xmlHttp2.onreadystatechange = function () {
                            if (xmlHttp2.readyState == 4 || xmlHttp2.readyState == "complete") {
                                var revObj = JSON.parse(this.responseText);
                                if (revObj.success > 0) {
                                    getAllDataOfMap();
                                    EditGroupInfoByMA(
                                        add_main_anchor.val(),
                                        add_main_anchor_x.val(),
                                        add_main_anchor_y.val()
                                    );
                                    dialog.dialog("close");
                                }
                            }
                        };
                        xmlHttp2.send(JSON.stringify(request2));
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
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
            "Confirm": submitAddGrouplist
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        submitAddGrouplist();
    });

    //Dialog to edit grouplist by main anchor.
    var dialog2, form2,
        edit_main_anchor = $("#edit_grouplist_main_anchor"),
        edit_main_anchor_x = $("#edit_grouplist_main_anchor_x"),
        edit_main_anchor_y = $("#edit_grouplist_main_anchor_y"),
        allFields2 = $([]).add(edit_main_anchor).add(edit_main_anchor_x).add(edit_main_anchor_y);

    function submitEditGrouplist() {
        var valid = true,
            edit_grouplist_id = $("[name='edit_grouplist_id']"),
            edit_grouplist_name = $("[name='edit_grouplist_name']");
        allFields2.removeClass("ui-state-error");
        valid = valid && checkLength(edit_main_anchor, $.i18n.prop('i_mapAlert_14'), 1, 5);
        valid = valid && checkLength(edit_main_anchor_x, $.i18n.prop('i_mapAlert_13'), 1, 50);
        valid = valid && checkLength(edit_main_anchor_y, $.i18n.prop('i_mapAlert_13'), 1, 50);
        edit_grouplist_name.each(function (i) {
            valid = valid && checkLength(edit_grouplist_name.eq(i), $.i18n.prop('i_mapAlert_13'), 1, 50);
        });

        if (valid) {
            edit_grouplist_id.each(function (i) {
                var index = allGroups.findIndex(function (info) {
                    return info.group_id == edit_grouplist_id.eq(i).val();
                });
                if (index > -1) {
                    var request = {
                        "Command_Type": ["Write"],
                        "Command_Name": ["EditGroup_Info"],
                        "Value": {
                            "group_id": allGroups[index].group_id,
                            "group_name": edit_grouplist_name.eq(i).val(),
                            "main_anchor_id": edit_main_anchor.val(),
                            "set_x": edit_main_anchor_x.val(),
                            "set_y": edit_main_anchor_y.val(),
                            "mode": allGroups[index].mode,
                            "mode_value": allGroups[index].mode_value,
                            "fence": allGroups[index].fence
                        },
                        "api_token": [token]
                    };
                    var xmlHttp = createJsonXmlHttp("sql");
                    xmlHttp.onreadystatechange = function () {
                        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                            var revObj = JSON.parse(this.responseText);
                            if (revObj.success > 0) {
                                getAllDataOfMap();
                                dialog2.dialog("close");
                            }
                        }
                    };
                    xmlHttp.send(JSON.stringify(request));
                }
            });
        }
        return valid;
    }

    dialog2 = $("#dialog_edit_group_list").dialog({
        autoOpen: false,
        height: 450,
        width: 300,
        modal: true,
        buttons: {
            Cancel: function () {
                dialog2.dialog("close");
            },
            "Confirm": submitEditGrouplist
        },
        close: function () {
            form2[0].reset();
            $("#table_edit_grouplist tbody").empty();
            allFields2.removeClass("ui-state-error");
            catchMap_Anchors();
        }
    });

    form2 = dialog2.find("form").on("submit", function (event) {
        event.preventDefault();
        submitEditGrouplist();
    });
});

function getMaps_Groups() {
    var getGroupsRequest = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetGroups"],
        "api_token": [token]
    };
    var groupsXmlHttp = createJsonXmlHttp("sql");
    groupsXmlHttp.onreadystatechange = function () {
        if (groupsXmlHttp.readyState == 4 || groupsXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                allGroups = 'Values' in revObj ? revObj.Values.slice(0) : [];
                var getMapGroupRequest = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["GetMaps_Groups"],
                    "api_token": [token]
                };
                var mapGroupXmlHttp = createJsonXmlHttp("sql");
                mapGroupXmlHttp.onreadystatechange = function () {
                    if (mapGroupXmlHttp.readyState == 4 || mapGroupXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (revObj.success > 0) {
                            maps_groupsArray = 'Values' in revObj ? revObj.Values.slice(0) : [];
                        } else {
                            alert($.i18n.prop('i_mapAlert_12'));
                        }
                    }
                };
                mapGroupXmlHttp.send(JSON.stringify(getMapGroupRequest));
            }
        }
    };
    groupsXmlHttp.send(JSON.stringify(getGroupsRequest));
}

function AddMapGroup(map_groupArray) {
    var addRequest = {
        "Command_Type": ["Write"],
        "Command_Name": ["AddListMap_Group"],
        "Value": map_groupArray,
        "api_token": [token]
    };
    var addXmlHttp = createJsonXmlHttp("sql");
    addXmlHttp.onreadystatechange = function () {
        if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                return;
            }
        }
    };
    addXmlHttp.send(JSON.stringify(addRequest));
}

function getGroupList() {
    var map_id = $("#map_info_id").val();
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMainAnchorsInMap"],
        "Value": {
            "map_id": map_id
        },
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var mainAnchorArr = [];
                var revInfo = 'Values' in revObj == true ? revObj.Values : [];
                $("#table_group_list tbody").empty();
                revInfo.forEach(function (element, index) {
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
    if (main_anchor_id == "")
        return;
    var groupList = getRowData_Group();
    var count = 0;
    $("#table_edit_grouplist tbody").empty();
    groupList.forEach(element => {
        if (element.main_anchor_id == main_anchor_id) {
            count++;
            $("#table_edit_grouplist tbody").append("<tr>" +
                "<td><input type=\"hidden\" name=\"checkbox_edit_grouplist\" />" + count + "</td>" +
                "<td><input type=\"text\" name=\"edit_grouplist_id\" value=\"" +
                element.group_id + "\" style=\"max-width:80px; background:white;\" disabled/></td>" +
                "<td><input type=\"text\" name=\"edit_grouplist_name\" value=\"" +
                element.group_name + "\" style=\"max-width:80px; background:white;\" /></td></tr>");
        }
    });
    $("#label_edit_grouplist_add").hide();
    $("#label_edit_grouplist_delete").hide();
    $("#edit_grouplist_main_anchor").html(getMainAnchorDropdown(main_anchor_id)).prop("disabled", true);
    $("#edit_grouplist_main_anchor_x").val(set_x);
    $("#edit_grouplist_main_anchor_y").val(set_y);
    $("#dialog_edit_group_list").dialog("open");
}

function EditGroupInfoByMA(main_anchor_id, set_x, set_y) {
    var getRequest = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMainAnchorsInMap"],
        "Value": {
            "map_id": $("#map_info_id").val()
        },
        "api_token": [token]
    };
    var getXmlHttp = createJsonXmlHttp("sql");
    getXmlHttp.onreadystatechange = function () {
        if (getXmlHttp.readyState == 4 || getXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var mapGroupInfo = 'Values' in revObj == true ? revObj.Values : [];
                mapGroupInfo.forEach(function (v, i) {
                    if (v.main_anchor_id == main_anchor_id) {
                        var editRequest = {
                            "Command_Type": ["Write"],
                            "Command_Name": ["EditGroup_Info"],
                            "Value": {
                                "group_id": v.group_id,
                                "group_name": v.group_name,
                                "main_anchor_id": main_anchor_id,
                                "set_x": set_x,
                                "set_y": set_y,
                                "mode": v.mode,
                                "mode_value": v.mode_value,
                                "fence": v.fence
                            },
                            "api_token": [token]
                        };
                        var editXmlHttp = createJsonXmlHttp("sql");
                        editXmlHttp.onreadystatechange = function () {
                            if (editXmlHttp.readyState == 4 || editXmlHttp.readyState == "complete") {
                                var revObj2 = JSON.parse(this.responseText);
                                if (revObj2.success > 0) {
                                    return;
                                }
                            }
                        };
                        editXmlHttp.send(JSON.stringify(editRequest));
                    }
                });
                getAllDataOfMap();
            } else {
                alert($.i18n.prop('i_mapAlert_6'));
            }
        }
    };
    getXmlHttp.send(JSON.stringify(getRequest));
}

function DeleteGroupInfo(deleteArray) {
    var deleteRequest = {
        "Command_Type": ["Read"],
        "Command_Name": ["DeleteGroup_Info"],
        "Value": deleteArray,
        "api_token": [token]
    };
    var deleteXmlHttp = createJsonXmlHttp("sql");
    deleteXmlHttp.onreadystatechange = function () {
        if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var deleteMapGroupArr = [];
                deleteArray.forEach(info => {
                    maps_groupsArray.forEach(element => {
                        if (element.group_id == info.group_id) {
                            deleteMapGroupArr.push({
                                "map_id": element.map_id,
                                "group_id": element.group_id
                            });
                        }
                    });
                });
                var deleteConnRequest = {
                    "Command_Type": ["Write"],
                    "Command_Name": ["DeleteMap_Group"],
                    "Value": deleteMapGroupArr,
                    "api_token": [token]
                };
                var xmlHttp = createJsonXmlHttp("sql");
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (revObj.success > 0)
                            DeleteGroup_Anchor(deleteArray);
                    }
                };
                xmlHttp.send(JSON.stringify(deleteConnRequest));
            }
        }
    };
    deleteXmlHttp.send(JSON.stringify(deleteRequest));
}