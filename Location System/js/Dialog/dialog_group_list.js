var groupListArray = [],
    count_grouplist = 0,
    RecordAnchorList = [],
    mainAnchorArray = [];

function inputGroupList(groups, anchorList) {
    groupListArray = groups;
    RecordAnchorList = anchorList;
    mainAnchorArray = [];
    for (i = 0; i < anchorList.length; i++) {
        if (anchorList[i].anchor_type == "main")
            mainAnchorArray.push(anchorList[i].anchor_id);
    }
    $(function () {
        $("#dialog_group_list tbody").empty(); //先重置表格
        count_grouplist = 0;
        for (var i = 0; i < groups.length; i++) {
            groups[i].group_name = typeof (groups[i].group_name) != 'undefined' ? groups[i].group_name : "";
            count_grouplist++;
            var tr_id = "tr_group_list_" + count_grouplist;
            $("#dialog_group_list tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                "<input type=\"checkbox\" name=\"chkbox_group_list\" value=\"" + count_grouplist + "\"" +
                " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_grouplist +
                "</td><td>" +
                "<input type=\"text\" name=\"grouplist_id\" value=\"" + groups[i].group_id +
                "\" style=\"max-width:70px;\" />" +
                "</td><td>" +
                "<input type=\"text\" name=\"grouplist_name\" value=\"" + groups[i].group_name +
                "\" style=\"max-width:100px;\" />" +
                "</td><td>" +
                "<select name=\"grouplist_main_anchor\">" +
                makeOptions(mainAnchorArray, groups[i].main_anchor_id) +
                "</select>" +
                "</td></tr>");
        }
    });
}

$(function () {
    var dialog, form,
        group_id_row = $("[name=grouplist_id]"),
        group_name_row = $("[name=grouplist_name]"),
        main_anchor_row = $("[name=grouplist_main_anchor]"),
        allFields = $([]).add(group_id_row, group_name_row, main_anchor_row);
    //tips = $( ".validateTips" );

    function SendResult() {
        allFields.removeClass("ui-state-error");
        var valid = true,
            group_array = [],
            row_count = 0;
        for (var i = 0; i < group_id_row.length; i++) {
            valid = valid && checkLength(group_id_row.eq(i), "GroupList", 0, 6);
            //valid = valid && checkLength(group_name_row.eq(i), "GroupList", 0, 10);
            valid = valid && checkLength(main_anchor_row.eq(i), "GroupList", 0, 6);
            group_array.push({
                "group_id": group_id_row.eq(i).val(),
                "group_name": group_name_row.eq(i).val(),
                "main_anchor_id": main_anchor_row.eq(i).val()
            });
            row_count++;
        }

        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["ClearAllGroups", "AddListGroup"],
            "Value": group_array
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
                        inputGroupList(revInfo, RecordAnchorList)
                    }
                }
            };
            xmlHttp.open("POST", "GroupList", true);
            xmlHttp.setRequestHeader("Content-type", "application/json");
            xmlHttp.send(requestJSON);
            dialog.dialog("close");
        }
        return valid;
    }

    function removeAnchorGroup() {
        var checkboxs = document.getElementsByName("chkbox_group_list");
        var arr = [];
        for (j in checkboxs) {
            if (checkboxs[j].checked)
                arr.push(checkboxs[j].value);
        }
        arr.forEach(function (v) {
            $("#tr_group_list_" + v).remove();
        });
    }

    /*********************在AnchorListDialog內的Add鈕按下後跳出輸入框***********************/
    var dialog2;

    function GroupListAdd() {
        var form2,
            add_grouplist_id = $("#add_grouplist_id"),
            add_grouplist_name = $("#add_grouplist_name"),
            allFields2 = $([]).add(add_grouplist_id, add_grouplist_name);
        $("#add_grouplist_main_anchor").html(makeOptions(mainAnchorArray, mainAnchorArray[0]));

        function addGrouplist() {
            var valid = true,
                add_main_anchor = $("#add_grouplist_main_anchor").children('option:selected').val();

            allFields2.removeClass("ui-state-error");
            valid = valid && checkLength(add_grouplist_id, "GroupList", 0, 6);
            //valid = valid && checkLength(add_grouplist_name, "GroupList", 0, 10);

            if (valid) {
                count_grouplist++;
                var tr_id = "tr_group_list_" + count_grouplist;
                $("#dialog_group_list tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                    "<input type=\"checkbox\" name=\"chkbox_group_list\" value=\"" + count_grouplist + "\"" +
                    " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_grouplist +
                    "</td><td>" +
                    "<input type=\"text\" name=\"grouplist_id\" value=\"" + add_grouplist_id.val() +
                    "\" style=\"max-width:100px;\" />" +
                    "</td><td>" +
                    "<input type=\"text\" name=\"grouplist_name\" value=\"" + add_grouplist_name.val() +
                    "\" style=\"max-width:100px;\" />" +
                    "</td><td>" +
                    "<select name=\"grouplist_main_anchor\">" +
                    makeOptions(mainAnchorArray, add_main_anchor) +
                    "</select>" +
                    "</td></tr>");
                dialog2.dialog("close");
            }
            return valid;
        }

        dialog2 = $("#dialog_add_group_list").dialog({
            autoOpen: false,
            height: 340,
            width: 340,
            modal: true,
            buttons: {
                Cancel: function () {
                    dialog2.dialog("close");
                },
                "Confirm": addGrouplist
            },
            close: function () {
                form2[0].reset();
                allFields2.removeClass("ui-state-error");
            }
        });

        form2 = dialog2.find("form").on("submit", function (event) {
            event.preventDefault();
            addGrouplist();
        });
    }

    GroupListAdd(); //必須先呼叫一次新增GroupList的function，否則輸入框會沒有套用設定而顯示出來
    /**************************************************************************************/

    dialog = $("#dialog_group_list").dialog({
        autoOpen: false,
        height: 500,
        width: 400,
        modal: true,
        buttons: {
            "Delete": removeAnchorGroup,
            "Add": function () {
                GroupListAdd();
                dialog2.dialog("open");
            },
            "Confirm": SendResult,
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
                inputGroupList(groupListArray, RecordAnchorList);
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
            inputGroupList(groupListArray, RecordAnchorList);
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        SendResult();
    });

    $("#Group_List").button().on("click", function () {
        dialog.dialog("open");
    });
});