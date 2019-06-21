var count_group = 0;
var allAnchorsArray = [];
var groupList = [];

function clearAnchorGroup() {
    $("#table_anchor_group tbody").empty(); //重置表格
    count_group = 0;
}

function inputAnchorGroup() {
    var map_id = $("#map_info_id").val();
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAnchorsInMap"],
        "Value": {
            "map_id": map_id
        }
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var group_anchors = ('Values' in revObj) ? revObj.Values : [];
                var map_anchors = [];
                clearAnchorGroup();
                group_anchors.forEach(info => {
                    count_group++;
                    var tr_id = "tr_anchor_group_" + count_group;
                    $("#table_anchor_group tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                        "<input type=\"checkbox\" name=\"anchorgroup_group_id\" value=\"" + info.group_id + "\"" +
                        " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_group +
                        "</td><td>" +
                        "<input type=\"text\" name=\"anchorgroup_group_name\" value=\"" + info.group_name +
                        "\" style=\"max-width:70px;\" readonly/>" +
                        "</td><td>" +
                        "<input type=\"text\" name=\"anchorgroup_main_anchor_id\" value=\"" + info.main_anchor_id +
                        "\" style=\"max-width:60px;\" readonly/>" +
                        "</td><td>" +
                        "<input type=\"text\" name=\"anchorgroup_anchor_id\" value=\"" + info.anchor_id +
                        "\" style=\"max-width:60px;\" readonly/>" +
                        "</td></tr>");
                    map_anchors.push({
                        anchor_id: info.anchor_id,
                        anchor_type: "",
                        set_x: info.set_x,
                        set_y: info.set_y
                    });
                });
                getAnchors(map_anchors);
            } else {
                alert($.i18n.prop('i_mapAlert_12'));
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function setAnchorgroup_anchor(anchors) {
    allAnchorsArray = anchors.slice(0); //Copy array
}

function DeleteGroup_Anchor(deleteArr) {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["DeleteGroup_Anchor"],
        "Value": deleteArr
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function catchAnchorList() {
    var anc_ids = document.getElementsByName("list_anchor_id");
    anchorIDArr = [];
    anc_ids.forEach(element => {
        anchorIDArr.push(element.value);
    });
}

function makeGroupOptions(array, select_id) {
    var options = "";
    for (i = 0; i < array.length; i++) {
        if (array[i].group_id == select_id) {
            options += "<option value=\"" + array[i].group_id + "\" selected=\"selected\">" +
                array[i].group_name + "</option>";
        } else {
            options += "<option value=\"" + array[i].group_id + "\">" + array[i].group_name + "</option>";
        }
    }
    return options;
}

$(function () {
    var dialog, form,
        add_group = $("#add_group_id"),
        add_main_anchor = $("#add_group_main_anchor"),
        add_anchor = $("#add_group_anchor"),
        allFields = $([]).add(add_group);

    add_group.on("change", function () {
        var index = groupList.findIndex(function (info) {
            return info.group_id == add_group.val();
        });
        if (index > -1)
            add_main_anchor.text(groupList[index].main_anchor_id);
    });

    $("#btn_add_anchor_group").on("click", function () {
        var request = {
            "Command_Type": ["Read"],
            "Command_Name": ["GetGroups"]
        };
        var xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    groupList = [];
                    groupList = revObj.Values.slice(0); //利用抽離全部陣列完成陣列拷貝
                    add_group.html(makeGroupOptions(groupList, groupList[0].group_id));
                    add_main_anchor.text(groupList[0].main_anchor_id);
                    add_anchor.html(makeOptions(allAnchorsArray, allAnchorsArray[0]));
                    dialog.dialog("open");
                } else {
                    alert($.i18n.prop('i_mapAlert_12'));
                    return;
                }
            }
        };
        xmlHttp.send(JSON.stringify(request));
    });

    $("#btn_delete_anchor_group").on("click", function () {
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
        if (deleteArr.length > 0) {
            DeleteGroup_Anchor(deleteArr);
            getMapGroups();
        } else {
            alert($.i18n.prop('i_mapAlert_9'));
        }
    });


    function addAnchorGroup() {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(add_group, $.i18n.prop('i_mapAlert_14'), 1, 5);
        valid = valid && checkLength(add_anchor, $.i18n.prop('i_mapAlert_14'), 1, 5);
        if (valid) {
            var request = {
                "Command_Type": ["Write"],
                "Command_Name": ["AddListGroup_Anchor"],
                "Value": [{
                    "group_id": add_group.val(),
                    "anchor_id": add_anchor.val()
                }]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        getMapGroups()
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
        height: 340,
        width: 340,
        modal: true,
        buttons: {
            Cancel: function () {
                dialog.dialog("close");
            },
            "Confirm": addAnchorGroup
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        addAnchorGroup();
    });
});