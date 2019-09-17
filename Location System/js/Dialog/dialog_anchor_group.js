var token = "";

$(function () {
    token = getUser() ? getUser().api_token : "";

    var dialog, form,
        add_group_id = $("#add_group_id"),
        add_group_name = $("#add_group_name"),
        allFields = $([]).add(add_group_id).add(add_group_name);

    $("#btn_add_anchor_group").on("click", function () {
        var groupList = getRowData_Group();
        add_group_id.html(makeNameOptions("group_id", groupList, groupList[0].group_id));
        add_group_name.html(makeNameOptions("group_name", groupList, groupList[0].group_name));
        $("#dialog_add_anchor_group tbody").empty();
        setGroupConnectChange("#add_group_id", "#add_group_name");
        dialog.dialog("open");
    });

    $("#btn_pos_anchor_group").on("click", function () {
        startAnchorPosition();
    });

    $("#btn_delete_anchor_group").on("click", function () {
        if (confirm($.i18n.prop('i_mapAlert_20'))) {
            var group_ids = document.getElementsByName("anchorgroup_group_id");
            var anchor_ids = document.getElementsByName("anchorgroup_anchor_id");
            var deleteArr = [];
            for (j in group_ids) {
                if (group_ids[j].checked) {
                    deleteArr.push({
                        "group_id": group_ids[j].value,
                        "anchor_id": anchor_ids[j].value
                    });
                }
            }
            if (deleteArr.length > 0)
                DeleteGroup_Anchor(deleteArr);
            else
                alert($.i18n.prop('i_mapAlert_9'));
        }
    });

    $("#btn_add_anc").on("click", function () {
        var count = document.getElementsByName("checkbox_add_group_anchor").length + 1,
            anchors = [];
        document.getElementsByName("list_anchor_id").forEach(element => {
            anchors.push(element.value);
        });
        $("#dialog_add_anchor_group tbody").append("<tr>" +
            "<td><input type=\"checkbox\" name=\"checkbox_add_group_anchor\" /> " + count + "</td>" +
            "<td><select name=\"add_group_anchor\">" + makeOptions(anchors, anchors[0]) + "</select></td>" +
            "<td><input type=\"text\" name=\"add_group_anchor_x\" value=\"\" style=\"max-width:100px;\"></td>" +
            "<td><input type=\"text\" name=\"add_group_anchor_y\" value=\"\" style=\"max-width:100px;\"></td></tr>");
    });

    $("#btn_delete_anc").on("click", function () {
        var anchor_id = document.getElementsByName("add_group_anchor"),
            anchor_x = document.getElementsByName("add_group_anchor_x"),
            anchor_y = document.getElementsByName("add_group_anchor_y"),
            trs = "",
            count = 0,
            anchors = [];
        document.getElementsByName("list_anchor_id").forEach(element => {
            anchors.push(element.value);
        });
        document.getElementsByName("checkbox_add_group_anchor").forEach(function (element, i) {
            if (!element.checked) {
                count++;
                trs += "<tr><td><input type=\"checkbox\" name=\"checkbox_add_group_anchor\" /> " + count + "</td>" +
                    "<td><select name=\"add_group_anchor\">" + makeOptions(anchors, anchor_id[i].value) + "</select></td>" +
                    "<td><input type=\"text\" name=\"add_group_anchor_x\" value=\"" + anchor_x[i].value +
                    "\" style=\"max-width:100px;\"></td>" +
                    "<td><input type=\"text\" name=\"add_group_anchor_y\" value=\"" + anchor_y[i].value +
                    "\" style=\"max-width:100px;\"></td></tr>";
            }
        });
        $("#dialog_add_anchor_group tbody").html(trs);
    });

    $("#btn_edit_group_add").on("click", function () {
        var groupList = getRowData_Group(),
            count = document.getElementsByName("edit_checkbox_groups").length + 1;
        $("#table_edit_group_ids tbody").append("<tr>" +
            "<td><input type=\"checkbox\" name=\"edit_checkbox_groups\" /> " + count + "</td>" +
            "<td><select name=\"edit_group_id\">" +
            makeNameOptions("group_id", groupList, groupList[0].group_id) + "</select></td>" +
            "<td><select name=\"edit_group_name\">" +
            makeNameOptions("group_name", groupList, groupList[0].group_name) + "</select></td></tr>");
        setGroupConnectChange("select[name='edit_group_id']", "select[name='edit_group_name']");
    });

    $("#btn_edit_group_delete").on("click", function () {
        var groupList = getRowData_Group(),
            groups = document.getElementsByName("edit_checkbox_groups"),
            group_ids = document.getElementsByName("edit_group_id"),
            group_names = document.getElementsByName("edit_group_name"),
            trs = "",
            count = 0;
        groups.forEach(function (element, i) {
            if (!element.checked) {
                count++;
                trs += "<tr><td><input type=\"checkbox\" name=\"edit_checkbox_groups\" /> " + count + "</td>" +
                    "<td><select name=\"edit_group_id\">" +
                    makeNameOptions("group_id", groupList, group_ids[i].value) + "</select></td>" +
                    "<td><select name=\"edit_group_name\">" +
                    makeNameOptions("group_name", groupList, group_names[i].value) + "</select></td></tr>";
            }
        });
        $("#table_edit_group_ids tbody").html(trs);
        setGroupConnectChange("select[name='edit_group_id']", "select[name='edit_group_name']");
    });

    //Dialog to add the connection between group and anchor.
    function submitAddGroupAnchor() {
        var valid = true;
        var GroupAnchorList = getRowData_Group_Anchor(); //驗證新增的Group與Anchor關聯是否重複
        var add_anchor_id = $("select[name='add_group_anchor']");
        var add_anchor_x = $("input[name='add_group_anchor_x']");
        var add_anchor_y = $("input[name='add_group_anchor_y']");
        var anchor_arr = [];

        allFields.removeClass("ui-state-error");
        add_anchor_id.removeClass("ui-state-error");
        add_anchor_x.removeClass("ui-state-error");
        add_anchor_y.removeClass("ui-state-error");

        valid = valid && checkLength(add_group_id, $.i18n.prop('i_mapAlert_14'), 1, 5);
        $("#table_add_anc tbody tr").each(function (i) {
            valid = valid && checkLength(add_anchor_id.eq(i), $.i18n.prop('i_mapAlert_14'), 1, 5);
            valid = valid && checkLength(add_anchor_x.eq(i), $.i18n.prop('i_mapAlert_13'), 1, 10);
            valid = valid && checkLength(add_anchor_y.eq(i), $.i18n.prop('i_mapAlert_13'), 1, 10);
            var isRepeat = anchor_arr.findIndex(function (info) {
                return info.anchor_id == add_anchor_id.eq(i).val();
            });
            if (isRepeat == -1) {
                anchor_arr.push({
                    "group_id": add_group_id.val(),
                    "anchor_id": add_anchor_id.eq(i).val(),
                    "set_x": add_anchor_x.eq(i).val(),
                    "set_y": add_anchor_y.eq(i).val()
                });
            }
            GroupAnchorList.forEach(element => {
                if (element.group_id == add_group_id.val() && element.anchor_id == add_anchor_id.eq(i).val()) {
                    add_anchor_id.eq(i).addClass("ui-state-error");
                    alert($.i18n.prop('i_anchorID') + " : " + element.anchor_id + $.i18n.prop('i_mapAlert_21'));
                    valid = false;
                    return false;
                }
            });
        });

        if (valid) {
            var request = {
                "Command_Type": ["Write"],
                "Command_Name": ["AddListGroup_Anchor"],
                "Value": anchor_arr,
                "api_token": [token]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        EditGroupAnchorByAnc(
                            add_anchor_id.eq(i).val(),
                            add_anchor_x.eq(i).val(),
                            add_anchor_y.eq(i).val()
                        );
                        dialog.dialog("close");
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
        }
        return valid;
    }

    dialog = $("#dialog_add_anchor_group").dialog({
        autoOpen: false,
        height: 450,
        width: 400,
        modal: true,
        buttons: {
            Cancel: function () {
                dialog.dialog("close");
            },
            "Confirm": submitAddGroupAnchor
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        submitAddGroupAnchor();
    });

    //Dialog to edit the connection between group and anchor.
    var dialog2, form2,
        edit_anchor = $("#edit_group_anchor"),
        edit_x = $("#edit_group_anchor_x"),
        edit_y = $("#edit_group_anchor_y"),
        allFields2 = $([]).add(edit_anchor).add(edit_x).add(edit_y);

    function submitEditAnchorGroup() {
        var valid = true,
            edit_id = $("input[name='edit_checkbox_groups']"),
            edit_group = $("select[name='edit_group_id']");

        allFields2.removeClass("ui-state-error");
        edit_id.removeClass("ui-state-error");
        edit_group.removeClass("ui-state-error");

        valid = valid && checkLength(edit_anchor, $.i18n.prop('i_mapAlert_14'), 1, 5);
        valid = valid && checkLength(edit_x, $.i18n.prop('i_mapAlert_13'), 1, 50);
        valid = valid && checkLength(edit_y, $.i18n.prop('i_mapAlert_13'), 1, 50);

        if (valid) {
            var isEdit = edit_anchor.prop("disabled"); //disabled==>edit mode
            if (isEdit) {
                edit_id.each(function (i) {
                    var request = {
                        "Command_Type": ["Write"],
                        "Command_Name": ["EditGroup_Anchor"],
                        "Value": {
                            "id": $(this).val(),
                            "group_id": $("input[name='edit_group_id']").eq(i).val(),
                            "anchor_id": edit_anchor.val(),
                            "set_x": edit_x.val(),
                            "set_y": edit_y.val()
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
                });
            } else {
                var anc_group_arr = [];
                var pass = true;
                if (edit_group.length == 0) {
                    alert($.i18n.prop('i_mapAlert_22'))
                    return false;
                }
                var GroupAnchorList = getRowData_Group_Anchor();
                edit_group.each(function (i) {
                    if (!pass)
                        return;
                    pass = pass && checkLength(edit_group.eq(i), $.i18n.prop('i_mapAlert_14'), 1, 5);
                    var isRepeat = anc_group_arr.findIndex(function (info) {
                        return info.group_id == edit_group.eq(i).val();
                    });
                    if (isRepeat == -1) {
                        anc_group_arr.push({
                            "group_id": edit_group.eq(i).val(),
                            "anchor_id": edit_anchor.val(),
                            "set_x": edit_x.val(),
                            "set_y": edit_y.val()
                        });
                    }
                    GroupAnchorList.forEach(element => {
                        if (element.anchor_id == edit_anchor.val()) {
                            edit_anchor.addClass("ui-state-error");
                            alert($.i18n.prop('i_anchorID') + " : " + element.anchor_id + $.i18n.prop('i_mapAlert_23'));
                            pass = false;
                        }
                    });
                });
                if (pass) {
                    var request = {
                        "Command_Type": ["Write"],
                        "Command_Name": ["AddListGroup_Anchor"],
                        "Value": anc_group_arr,
                        "api_token": [token]
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
                }
            }
        }
        return valid;
    }

    dialog2 = $("#dialog_edit_anchor_group").dialog({
        autoOpen: false,
        height: 450,
        width: 300,
        modal: true,
        buttons: {
            Cancel: function () {
                dialog2.dialog("close");
            },
            "Confirm": submitEditAnchorGroup
        },
        close: function () {
            form2[0].reset();
            allFields2.removeClass("ui-state-error");
            $("#table_edit_group_ids tbody").empty();
            catchMap_Anchors();
        }
    });

    form2 = dialog2.find("form").on("submit", function (event) {
        event.preventDefault();
        submitEditAnchorGroup();
    });
});

function getAnchor_Group() {
    var map_id = $("#map_info_id").val();
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAnchorsInMap"],
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
                var group_anchors = 'Values' in revObj == true ? revObj.Values : [];
                setTreeArray(group_anchors);
                $("#table_anchor_group tbody").empty();
                group_anchors.forEach(function (info, i) {
                    var tr_id = "tr_anchor_group_" + (i + 1);
                    $("#table_anchor_group tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                        "<input type=\"hidden\" name=\"anchorgroup_id\" value=\"" + info.id + "\" />" +
                        "<input type=\"checkbox\" name=\"anchorgroup_group_id\" value=\"" + info.group_id + "\"" +
                        " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + (i + 1) +
                        "</td><td>" +
                        "<input type=\"text\" name=\"anchorgroup_group_name\" value=\"" + info.group_name +
                        "\" style=\"max-width:60px;\" readonly/>" +
                        "</td><td>" +
                        "<input type=\"text\" name=\"anchorgroup_main_anchor_id\" value=\"" + info.main_anchor_id +
                        "\" style=\"max-width:60px;\" readonly/>" +
                        "</td><td>" +
                        "<input type=\"text\" name=\"anchorgroup_anchor_id\" value=\"" + info.anchor_id +
                        "\" style=\"max-width:60px;\" readonly/>" +
                        "</td><td>" +
                        "<input type=\"text\" name=\"anchorgroup_anchor_x\" value=\"" + info.set_x +
                        "\" style=\"max-width:60px;\" readonly/>" +
                        "</td><td>" +
                        "<input type=\"text\" name=\"anchorgroup_anchor_y\" value=\"" + info.set_y +
                        "\" style=\"max-width:60px;\" readonly/>" +
                        "</td><td>" +
                        "<label for=\"btn_edit_anchorgroup_" + (i + 1) + "\" class='btn-edit' title='" +
                        $.i18n.prop('i_editAnchorGroup') + "'><i class='fas fa-edit' style='font-size:18px;'></i></label>" +
                        "<input id=\"btn_edit_anchorgroup_" + (i + 1) + "\" type='button' class='btn-hidden'" +
                        " onclick=\"editGroup_Anchor(\'" + info.anchor_id + "\',\'" + info.set_x + "\',\'" +
                        info.set_y + "\')\" />" +
                        "</td></tr>");
                    inputAnchorArray({
                        id: info.anchor_id,
                        type: "",
                        x: info.set_x,
                        y: info.set_y,
                        group_id: info.group_id
                    });
                });
            } else {
                alert($.i18n.prop('i_mapAlert_12'));
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function editGroup_Anchor(anchor_id, set_x, set_y) {
    if (anchor_id == "")
        return;
    var anchor_groupList = getRowData_Group_Anchor();
    var count = 0;
    $("#table_edit_group_ids tbody").empty();
    anchor_groupList.forEach(element => {
        if (element.anchor_id == anchor_id) {
            count++;
            $("#table_edit_group_ids tbody").append("<tr>" +
                "<td><input type=\"hidden\" name=\"edit_checkbox_groups\" value=\"" + element.id + "\" />" +
                count + "</td>" +
                "<td><input type=\"text\" name=\"edit_group_id\" value=\"" +
                element.group_id + "\" style=\"max-width:80px; background:white;\" disabled/></td>" +
                "<td><input type=\"text\" name=\"edit_group_name\" value=\"" +
                element.group_name + "\" style=\"max-width:80px; background:white;\" disabled/></td></tr>");
        }
    });
    $("#edit_group_anchor").html(getAnchorDropdown(anchor_id)).prop("disabled", true);
    $("#label_edit_group_add").hide();
    $("#label_edit_group_delete").hide();
    $("#edit_group_anchor_x").val(set_x);
    $("#edit_group_anchor_y").val(set_y);
    $("#dialog_edit_anchor_group").dialog("open");
}

function EditGroupAnchorByAnc(anchor_id, set_x, set_y) {
    var getRequest = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAnchorsInMap"],
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
                var mapGroupAnchor = 'Values' in revObj == true ? revObj.Values : [];
                mapGroupAnchor.forEach(function (v, i) {
                    if (v.anchor_id == anchor_id) {
                        var editRequest = {
                            "Command_Type": ["Write"],
                            "Command_Name": ["EditGroup_Anchor"],
                            "Value": {
                                "id": v.id,
                                "group_id": v.group_id,
                                "anchor_id": anchor_id,
                                "set_x": set_x,
                                "set_y": set_y
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

function DeleteGroup_Anchor(deleteArr) {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["DeleteGroup_Anchor"],
        "Value": deleteArr,
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0)
                getAllDataOfMap();
        }
    };
    xmlHttp.send(JSON.stringify(request));
}