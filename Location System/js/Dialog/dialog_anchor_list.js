var count_main_anchor_list = 0;
var count_anchor_list = 0;
var allAnchorArray = [];
var allGroupsArray = [];
var anchorsInfoArray = [];

function clearAnchorList() {
    $("#table_main_anchor_list tbody").empty(); //重置表格
    $("#table_anchor_list tbody").empty();
    count_main_anchor_list = 0;
    count_anchor_list = 0;
}

function inputAnchorList(anchorList) {
    clearAnchorList();
    allAnchorArray = [];
    anchorsInfoArray = anchorList.slice(0); //利用抽離全部陣列完成陣列拷貝
    for (var i = 0; i < anchorList.length; i++) {
        if (anchorList[i].anchor_type == "main") {
            count_main_anchor_list++;
            var tr_id = "tr_main_anchor_list_" + count_main_anchor_list;
            $("#table_main_anchor_list tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                "<input type=\"text\" name=\"list_main_anchor_id\" value=\"" + anchorList[i].anchor_id + "\" style=\"max-width:60px;\" readonly/>" +
                "</td><td>" +
                "<input type=\"text\" name=\"list_main_anchor_x\" value=\"" + anchorList[i].set_x + "\" style=\"max-width:60px;\" readonly/>" +
                "</td><td>" +
                "<input type=\"text\" name=\"list_main_anchor_y\" value=\"" + anchorList[i].set_y + "\" style=\"max-width:60px;\" readonly/>" +
                "</td><td>" +
                "<label for=\"btn_edit_anchor_" + i + "\" class='btn-edit' title='" + $.i18n.prop('i_editAnchor') + "'>" +
                "<i class='fas fa-edit' style='font-size:18px;'></i></label><input id=\"btn_edit_anchor_" + i + "\" type='button'" +
                " class='btn-hidden' onclick=\"editAnchorInfo(\'" + anchorList[i].anchor_id + "\')\" />" +
                "<label for=\"btn_delete_main_anchor_" + i + "\"  class='btn-remove' style='margin-left:10px;' title='" + $.i18n.prop('i_deleteAnchor') + "'>" +
                "<i class='fas fa-trash-alt' style='font-size:18px;'></i></label><input id=\"btn_delete_main_anchor_" + i + "\" type='button'" +
                " class='btn-hidden' onclick=\"deleteMainAnchor(\'" + anchorList[i].anchor_id + "\')\" />" +
                "</td></tr>");
        } else {
            count_anchor_list++;
            var tr_id = "tr_anchor_list_" + count_anchor_list;
            $("#table_anchor_list tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                "<input type=\"text\" name=\"list_anchor_id\" value=\"" + anchorList[i].anchor_id + "\" style=\"max-width:60px;\" readonly/>" +
                "</td><td>" +
                "<input type=\"text\" name=\"list_anchor_x\" value=\"" + anchorList[i].set_x + "\" style=\"max-width:60px;\" readonly/>" +
                "</td><td>" +
                "<input type=\"text\" name=\"list_anchor_y\" value=\"" + anchorList[i].set_y + "\" style=\"max-width:60px;\" readonly/>" +
                "</td><td>" +
                "<label for=\"btn_edit_anchor_" + i + "\" class='btn-edit' title='" + $.i18n.prop('i_editAnchor') + "'>" +
                "<i class='fas fa-edit' style='font-size:18px;'></i></label><input id=\"btn_edit_anchor_" + i + "\" type='button'" +
                " class='btn-hidden' onclick=\"editAnchorInfo(\'" + anchorList[i].anchor_id + "\')\" />" +
                "<label for=\"btn_delete_anchor_" + i + "\" class='btn-remove' style='margin-left:10px;' title='" + $.i18n.prop('i_deleteAnchor') + "'>" +
                "<i class='fas fa-trash-alt' style='font-size:18px;'></i></label><input id=\"btn_delete_anchor_" + i + "\" type='button'" +
                " class='btn-hidden' onclick=\"deleteAnchor(\'" + anchorList[i].anchor_id + "\')\" />" +
                "</td></tr>");
        }
        allAnchorArray.push(anchorList[i].anchor_id);
    }
}

function editAnchorInfo(id) {
    var index = anchorsInfoArray.findIndex(function (info) {
        return info.anchor_id == id;
    });
    if (index > -1) {
        $("#edit_anchor_type").text(anchorsInfoArray[index].anchor_type);
        $("#edit_anchor_id").text(anchorsInfoArray[index].anchor_id);
        $("#edit_anchor_x").val(anchorsInfoArray[index].set_x);
        $("#edit_anchor_y").val(anchorsInfoArray[index].set_y);
        $("#dialog_edit_anchor").dialog("open");
    } else {
        alert($.i18n.prop('i_mapAlert_1'));
    }
}

function deleteMainAnchor(id) {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["DeleteAnchor_Info"],
        "Value": [{
            "anchor_id": id
        }]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var requestArray = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["GetGroups"]
                };
                var getXmlHttp = createJsonXmlHttp("sql");
                getXmlHttp.onreadystatechange = function () {
                    if (getXmlHttp.readyState == 4 || getXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        var revInfo = ('Values' in revObj) == true ? revObj.Values : [];
                        if (revObj.success > 0) {
                            revInfo.forEach(element => {
                                if (element.main_anchor_id == id) {
                                    var resetGroupInfo = {
                                        "group_id": element.group_id,
                                        "group_name": element.group_name,
                                        "main_anchor_id": "-1",
                                        "mode": element.mode,
                                        "mode_value": element.mode_value,
                                        "fence": element.fence
                                    };
                                    EditGroupInfo(resetGroupInfo);
                                }
                            });
                            getMapGroups();
                            draw();
                        }
                    }
                };
                getXmlHttp.send(JSON.stringify(requestArray));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function deleteAnchor(id) {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["DeleteAnchor_Info"],
        "Value": [{
            "anchor_id": id
        }]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var gerRequest = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["GetGroup_Anchors"]
                };
                var getXmlHttp = createJsonXmlHttp("sql");
                getXmlHttp.onreadystatechange = function () {
                    if (getXmlHttp.readyState == 4 || getXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (revObj.success > 0) {
                            var deleteArr = [];
                            revObj.Values.forEach(element => {
                                if (element.anchor_id == id)
                                    deleteArr.push({
                                        "group_id": element.group_id,
                                        "anchor_id": element.anchor_id
                                    })
                            });
                            DeleteGroup_Anchor(deleteArr);
                            getMapGroups();
                        }
                    }
                };
                getXmlHttp.send(JSON.stringify(gerRequest));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function setDropdown_Group() { //set dropdownlist of the map's groups
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps_Groups"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var groups_arr = [];
            allGroupsArray = [];
            if (revObj.success > 0) {
                var map_id = $("#map_info_id").val();
                revObj.Values.forEach(element => {
                    if (element.map_id == map_id) {
                        groups_arr.push(element.group_id);
                    }
                    allGroupsArray.push(element.group_id);
                });
                $("#anchor_select_group_id").empty();
                $("#anchor_select_group_id").append(makeOptions(groups_arr, groups_arr[0]));
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function AddMapGroup(map_groupArray) {
    var addRequest = {
        "Command_Type": ["Write"],
        "Command_Name": ["AddListMap_Group"],
        "Value": map_groupArray
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

$(function () {
    //預設anchor_type為anchor
    $("#anchor_input_group").hide();
    $("#anchor_select_group").show();
    $("#anchor_type").on('change', function () {
        if ($(this).val() == "main") {
            $("#anchor_select_group").hide();
            $("#anchor_input_group").show();
        } else {
            $("#anchor_input_group").hide();
            $("#anchor_select_group").show();
        }
    });
    $("#anchor_id").on('change', function () {
        if ($(this).val().length > 0) {
            var repeat = allAnchorArray.indexOf($(this).val());
            if (repeat > -1)
                $("#anchor_id_alert").text($.i18n.prop('i_existed')).css('color', 'red');
            else
                $("#anchor_id_alert").text($.i18n.prop('i_canAdd')).css('color', 'green');
        } else {
            $("#anchor_id_alert").empty();
        }
    });
    $("#anchor_input_group_id").on('change', function () {
        if ($(this).val().length > 0) {
            var repeat = allGroupsArray.indexOf($(this).val());
            if (repeat > -1)
                $("#group_id_alert").text($.i18n.prop('i_existed')).css('color', 'red');
            else
                $("#group_id_alert").text($.i18n.prop('i_canAdd')).css('color', 'green');
        } else {
            $("#group_id_alert").empty();
        }
    });


    var dialog, form,
        anchor_type = $("#anchor_type"),
        anchor_id = $("#anchor_id"),
        anchor_x = $("#anchor_x"),
        anchor_y = $("#anchor_y"),
        input_group_id = $("#anchor_input_group_id"),
        input_group_name = $("#anchor_input_group_name"),
        select_group = $("#anchor_select_group_id"),
        allFields = $([]).add(anchor_id).add(anchor_x).add(anchor_y)
        .add(input_group_id).add(input_group_name).add(select_group);

    function addAnchor() {
        var valid = true;
        allFields.removeClass("ui-state-error");
        valid = valid && checkLength(anchor_id, $.i18n.prop('i_mapAlert_14'), 1, 5);
        allAnchorArray.forEach(element => { //驗證Anchor ID是否重複
            if (element == anchor_id.val()) {
                valid = false;
                anchor_id.addClass("ui-state-error");
                alert($.i18n.prop('i_mapAlert_16'));
            }
        });
        valid = valid && checkLength(anchor_x, $.i18n.prop('i_mapAlert_13'), 1, 10);
        valid = valid && checkLength(anchor_y, $.i18n.prop('i_mapAlert_13'), 1, 10);
        if (anchor_type.val() == "main") {
            valid = valid && checkLength(input_group_id, $.i18n.prop('i_mapAlert_13'), 1, 5);
            allGroupsArray.forEach(element => { //驗證Group ID是否重複
                if (element == input_group_id.val()) {
                    valid = false;
                    input_group_id.addClass("ui-state-error");
                    alert($.i18n.prop('i_mapAlert_11'));
                }
            });
            valid = valid && checkLength(input_group_name, $.i18n.prop('i_mapAlert_13'), 1, 50);
        } else {
            if (!select_group.children().is("option"))
                alert($.i18n.prop('i_mapAlert_15'));
            valid = valid && checkLength(select_group, $.i18n.prop('i_mapAlert_13'), 1, 5);
        }

        if (valid) {
            var request = {
                "Command_Type": ["Write"],
                "Command_Name": ["AddListAnchor"],
                "Value": [{
                    "anchor_type": anchor_type.val(),
                    "anchor_id": anchor_id.val(),
                    "set_x": anchor_x.val(),
                    "set_y": anchor_y.val()
                }]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        var addRequest = {};
                        if (anchor_type.val() == "main") {
                            addRequest = { //GroupList
                                "Command_Type": ["Write"],
                                "Command_Name": ["AddListGroup"],
                                "Value": [{
                                    "group_id": input_group_id.val(),
                                    "group_name": input_group_name.val(),
                                    "main_anchor_id": anchor_id.val(),
                                    "mode": "normal",
                                    "mode_value": "0",
                                    "fence": "0"
                                }]
                            };
                            var addXmlHttp = createJsonXmlHttp("sql");
                            addXmlHttp.onreadystatechange = function () {
                                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                                    var revObj = JSON.parse(this.responseText);
                                    if (revObj.success > 0) {
                                        var map_groupArray = [{
                                            "map_id": $("#map_info_id").val(),
                                            "group_id": input_group_id.val()
                                        }];
                                        AddMapGroup(map_groupArray);
                                        getMapGroups();
                                        dialog.dialog("close");
                                    }
                                }
                            };
                            addXmlHttp.send(JSON.stringify(addRequest));
                        } else {
                            addRequest = { //AnchorGroup
                                "Command_Type": ["Write"],
                                "Command_Name": ["AddListGroup_Anchor"],
                                "Value": [{
                                    "anchor_id": anchor_id.val(),
                                    "group_id": select_group.val(),
                                }]
                            };
                            var addXmlHttp = createJsonXmlHttp("sql");
                            addXmlHttp.onreadystatechange = function () {
                                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                                    var revObj = JSON.parse(this.responseText);
                                    if (revObj.success > 0) {
                                        getMapGroups();
                                        dialog.dialog("close");
                                    }
                                }
                            };
                            addXmlHttp.send(JSON.stringify(addRequest));
                        }
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
        }
        return valid;
    }

    dialog = $("#dialog_add_new_anchor").dialog({
        autoOpen: false,
        height: 450,
        width: 340,
        modal: true,
        buttons: {
            "Confirm": addAnchor,
            Cancel: function () {
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
        addAnchor();
    });

    $("#btn_add_anchor").click(function () { //按下Add anchor
        anchor_type.val("");
        anchor_id.val("");
        anchor_x.val("");
        anchor_y.val("");
        setDropdown_Group();
        dialog.dialog("open");
    });
});


$(function () {
    var dialog, form,
        anchor_type = $("#edit_anchor_type"),
        anchor_id = $("#edit_anchor_id"),
        anchor_x = $("#edit_anchor_x"),
        anchor_y = $("#edit_anchor_y"),
        allFields = $([]).add(anchor_x).add(anchor_y);

    function editAnchor() {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(anchor_x, $.i18n.prop('i_mapAlert_13'), 1, 10);
        valid = valid && checkLength(anchor_y, $.i18n.prop('i_mapAlert_13'), 1, 10);
        if (valid) {
            var request = {
                "Command_Type": ["Write"],
                "Command_Name": ["EditAnchor_Info"],
                "Value": {
                    "anchor_type": anchor_type.text(),
                    "anchor_id": anchor_id.text(),
                    "set_x": anchor_x.val(),
                    "set_y": anchor_y.val()
                }
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        getMapGroups();
                        dialog.dialog("close");
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
        }
        return valid;
    }

    dialog = $("#dialog_edit_anchor").dialog({
        autoOpen: false,
        height: 350,
        width: 340,
        modal: true,
        buttons: {
            "Confirm": editAnchor,
            Cancel: function () {
                draw();
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
        editAnchor();
    });
});