var count_grouplist = 0;
var allMainAnchorsArray = [];
var allGroupsArray = [];
var mapGroupArray = [];

function clearGroupList() {
    $("#table_group_list tbody").empty(); //重置表格
    count_grouplist = 0;
}

function setGrouplist_mainAnchor(mainAnchorIDArr) {
    allMainAnchorsArray = mainAnchorIDArr.slice(0); //Copy array
}

function getMapGroups() {
    var map_id = $("#map_info_id").val();
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps_Groups"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var groupArr = [];
                var mapGroups = 'Values' in revObj == true ? revObj.Values : [];
                mapGroups.forEach(element => {
                    if (element.map_id == map_id)
                        groupArr.push(element.group_id);
                });
                inputGroupList(groupArr);
            } else {
                alert($.i18n.prop('i_mapAlert_12'));
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function inputGroupList(groupArray) {
    allGroupsArray = []; //Reset array
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetGroups"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var groupList = 'Values' in revObj == true ? revObj.Values : [];
                clearGroupList();
                groupList.forEach(info => {
                    allGroupsArray.push(info.group_id);
                    var hasGroup = groupArray.indexOf(info.group_id);
                    if (hasGroup > -1) {
                        info.group_name = typeof (info.group_name) != 'undefined' ? info.group_name : "";
                        count_grouplist++;
                        var tr_id = "tr_group_list_" + count_grouplist;
                        $("#table_group_list tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                            "<input type=\"checkbox\" name=\"chkbox_group_list\" value=\"" + info.group_id + "\"" +
                            " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_grouplist +
                            "</td><td>" +
                            "<input type=\"text\" name=\"grouplist_name\" value=\"" + info.group_name +
                            "\" style=\"max-width:80px;\" readonly/>" +
                            "</td><td>" +
                            "<input type=\"text\" name=\"grouplist_main_anchor\" value=\"" + info.main_anchor_id +
                            "\" style=\"max-width:80px;\" readonly/>" +
                            "</td><td>" +
                            "<label for=\"btn_edit_grouplist_" + count_grouplist + "\" class='btn-edit' title='" +
                            $.i18n.prop('i_editGroup') + "'><i class='fas fa-edit' style='font-size:18px;'></i></label>" +
                            "<input id=\"btn_edit_grouplist_" + count_grouplist + "\" type='button' class='btn-hidden'" +
                            " onclick=\"editGroupList(\'" + info.group_id + "\',\'" + info.group_name + "\',\'" +
                            info.main_anchor_id + "\')\" /></td></tr>");
                    }
                });
                inputAnchorGroup();
            } else {
                alert($.i18n.prop('i_mapAlert_12'));
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function editGroupList(id, name, main_anchor) {
    $("#edit_grouplist_id").text(id);
    $("#edit_grouplist_name").val(name);
    $("#edit_grouplist_main_anchor").html(makeOptions(allMainAnchorsArray, main_anchor));
    $("#dialog_edit_group_list").dialog("open");
}

function EditGroupInfo(editInfo) {
    var editRequest = {
        "Command_Type": ["Read"],
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
        var main_anc_ids = document.getElementsByName("list_main_anchor_id");
        allMainAnchorsArray = [];
        main_anc_ids.forEach(element => {
            allMainAnchorsArray.push(element.value);
        });
        $("#add_grouplist_main_anchor").html(makeOptions(allMainAnchorsArray, allMainAnchorsArray[0]));
        $("#dialog_add_group_list").dialog("open");
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
                                getMapGroups();
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
            var repeat = allGroupsArray.indexOf($(this).val());
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
        allGroupsArray.forEach(element => { //驗證Group ID是否重複
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
                        getMapGroups();
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
        height: 340,
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
        edit_grouplist_id = $("#edit_grouplist_id"),
        edit_grouplist_name = $("#edit_grouplist_name"),
        edit_main_anchor = $("#edit_grouplist_main_anchor"),
        allFields = $([]).add(edit_grouplist_name).add(edit_main_anchor);

    function editGrouplist() {
        allFields.removeClass("ui-state-error");
        var valid = true;
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
                            getMapGroups();
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
        height: 340,
        width: 340,
        modal: true,
        buttons: {
            Cancel: function () {
                dialog.dialog("close");
            },
            "Confirm": editGrouplist
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        editGrouplist();
    });
});