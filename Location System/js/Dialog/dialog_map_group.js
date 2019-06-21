var group_array = [],
    map_array = [],
    count_map_group = 0,
    RecordMapGroupList = [];

function inputMapGroupList(map_group_list, maps, groups) {
    RecordMapGroupList = map_group_list;
    map_array = maps;
    group_array = groups;
    $(function () {
        $("#dialog_map_group tbody").empty(); //先重置表格
        count_map_group = 0;
        for (var i = 0; i < map_group_list.length; i++) {
            count_map_group++;
            var tr_id = "tr_map_group_" + count_map_group;
            $("#dialog_map_group tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                "<input type=\"checkbox\" name=\"chkbox_map_group\" value=\"" + count_map_group + "\"" +
                " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_map_group +
                "</td><td>" +
                "<select name=\"mapgroup_map\">" +
                makeOptions(maps, map_group_list[i].map_id) +
                "</select>" +
                "</td><td>" +
                "<select name=\"mapgroup_group\">" +
                makeOptions(groups, map_group_list[i].group_id) +
                "</select>" +
                "</td></tr>");
        }
    });
}

$(function () {
    var dialog, form,
        map_id = $("[name=mapgroup_map]"),
        group_id = $("[name=mapgroup_group]"),
        allFields = $([]).add(map_id, group_id);
    //tips = $( ".validateTips" );

    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true,
            map_group_array = [],
            row_count = 0;
        for (i = 0; i < map_id.length; i++) {
            valid = valid && checkLength(map_id.eq(i), "Please select the number more than 0 and less than 6.", 0, 6);
            valid = valid && checkLength(group_id.eq(i), "Please select the number more than 0 and less than 6.", 0, 6);
            map_group_array.push({
                "map_id": map_id.eq(i).val(),
                "group_id": group_id.eq(i).val(),
            });
            row_count++;
        }

        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["ClearAllMap_Groups", "AddListMap_Group"],
            "Value": map_group_array
        });

        if (valid) {
            var xmlHttp = GetXmlHttpObject();
            if (xmlHttp == null) {
                alert("Browser does not support HTTP Request");
                return;
            }
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success == 1) {
                        alert("成功更新 Group List:" + revInfo.length + "筆\n" +
                            "失敗:" + (revInfo.length - row_count) + "筆");
                        inputMapGroupList(revInfo, map_array, group_array);
                    }
                }
            };
            xmlHttp.open("POST", "MapGroup", true);
            xmlHttp.setRequestHeader("Content-type", "application/json");
            xmlHttp.send(requestJSON);
            dialog.dialog("close");
        }
        return valid;
    };

    var addMapGroup = function () {
        count_map_group++;
        var tr_id = "tr_map_group_" + count_map_group;
        $("#dialog_map_group tbody").append("<tr id=\"" + tr_id + "\"><td>" +
            "<input type=\"checkbox\" name=\"chkbox_map_group\" value=\"" + count_map_group + "\"" +
            " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_map_group +
            "</td><td>" +
            "<select name=\"mapgroup_map\">" +
            makeOptions(map_array, map_array[0]) +
            "</select>" +
            "</td><td>" +
            "<select name=\"mapgroup_group\">" +
            makeOptions(group_array, map_array[0]) +
            "</select>" +
            "</td></tr>");
    };

    var removeMapGroup = function () {
        var checkboxs = document.getElementsByName("chkbox_map_group");
        var arr = [];
        for (j in checkboxs) {
            if (checkboxs[j].checked)
                arr.push(checkboxs[j].value);
        }
        arr.forEach(function (v) {
            $("#tr_map_group_" + v).remove();
        });
    }

    dialog = $("#dialog_map_group").dialog({
        autoOpen: false,
        height: 500,
        width: 400,
        modal: true,
        buttons: {
            "Delete": removeMapGroup,
            "Add": addMapGroup,
            "Confirm": SendResult,
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
                inputMapGroupList(RecordMapGroupList, map_array, group_array)
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
            inputMapGroupList(RecordMapGroupList, map_array, group_array)
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        SendResult();
    });

    $("#Map_Group").button().on("click", function () {
        dialog.dialog("open");
    });
});