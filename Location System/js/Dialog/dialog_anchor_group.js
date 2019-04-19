var groupListArray = [],
    count_group = 0,
    RecordAnchorList = [],
    //mainAnchorArray = [],
    anchorArray = [];

function inputGroups(groups, anchorList) {
    groupListArray = groups;
    RecordAnchorList = anchorList;
    //mainAnchorArray = [];
    anchorArray = [];
    for (var i = 0; i < anchorList.length; i++) {
        if (anchorList[i].anchor_type == "")
            anchorArray.push(anchorList[i].anchor_id);
        //else 
        //   mainAnchorArray.push(anchorList[i].anchor_id);
    }
    $(function () {
        $("#table_anchor_group tbody").empty(); //先重置表格
        count_group = 0;
        for (var i = 0; i < groups.length; i++) {
            count_group++;
            var tr_id = "tr_anchor_group_" + count_group;
            $("#table_anchor_group tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                "<input type=\"checkbox\" name=\"chkbox_anchor_group\" value=\"" + count_group + "\"" +
                " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_group +
                "</td><td>" +
                "<input type=\"text\" name=\"anchor_group_id\" value=\"" + groups[i].group_id +
                "\" style=\"max-width:70px;\" />" +
                "</td><td>" +
                groups[i].main_anchor_id +
                //"<select name=\"group_main_anchor\">" +
                //makeOptions(mainAnchorArray, groups[i].main_anchor_id) +
                //"</select>" +
                "</td><td>" +
                "<select name=\"group_anchor\">" +
                makeOptions(anchorArray, groups[i].anchor_id) +
                "</select>" +
                "</td></tr>");
        }
    });
}

$(function () {
    var dialog, form,
        group_row = $("[name=anchor_group_id]"),
        main_anchor_row = $("[name=group_main_anchor]"),
        anchor_row = $("[name=group_anchor]"),
        allFields = $([]).add(group_row, main_anchor_row, anchor_row);
    //tips = $( ".validateTips" );

    function SendResult() {
        allFields.removeClass("ui-state-error");
        var valid = true,
            group_array = [],
            row_count = 0;
        for (i = 0; i < group_row.length; i++) {
            valid = valid && checkLength(group_row.eq(i), "Should be more than 0 and less than 65535.", 0, 6);
            //valid = valid && checkLength(main_anchor_row.eq(i), "Should be more than 0 and less than 65535.", 0, 6);
            valid = valid && checkLength(anchor_row.eq(i), "Should be more than 0 and less than 65535.", 0, 6);
            group_array.push({
                "group_id": group_row.eq(i).val(),
                //"main_anchor_id": main_anchor_row.eq(i).val(),
                "anchor_id": anchor_row.eq(i).val()
            });
            row_count++;
        }

        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["ClearAllGroup_Anchors", "AddListGroup_Anchor"],
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
                        inputGroups(revInfo, RecordAnchorList);
                    }
                }
            };
            xmlHttp.open("POST", "sql", true);
            xmlHttp.setRequestHeader("Content-type", "application/json");
            xmlHttp.send(requestJSON);
            dialog.dialog("close");
        }
        return valid;
    }

    /*********************在AnchorListDialog內的Add鈕按下後跳出輸入框***********************/
    var dialog2;

    function anchorGroupAdd() {
        var form2,
            add_group = $("#add_group_id"),
            add_main_anchor = $("#add_group_main_anchor"),
            add_anchor = $("#add_group_anchor"),
            allFields2 = $([]).add(add_group);
        //$("#add_group_main_anchor").html(makeOptions(mainAnchorArray, mainAnchorArray[0]));
        $("#add_group_anchor").html(makeOptions(anchorArray, anchorArray[0]));

        function addGroup() {
            var valid = true;
            allFields2.removeClass("ui-state-error");

            //var add_main_anchor = $("#add_group_main_anchor").children('option:selected').val(),
            //    add_anchor = $("#add_group_anchor").children('option:selected').val();


            valid = valid && checkLength(add_group, "Should be more than 0 and less than 65535.", 0, 6);
            valid = valid && checkLength(add_main_anchor, "Should be more than 0 and less than 65535.", 0, 6);
            valid = valid && checkLength(add_anchor, "Should be more than 0 and less than 65535.", 0, 6);

            if (valid) {
                count_group++;
                var tr_id = "tr_anchor_group_" + count_group;
                $("#table_anchor_group tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                    "<input type=\"checkbox\" name=\"chkbox_anchor_group\" value=\"" + count_group + "\"" +
                    " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_group +
                    "</td><td>" +
                    "<input type=\"text\" name=\"anchor_group_id\" value=\"" + add_group.val() + "\" style=\"max-width:70px;\" />" +
                    "</td><td>" +
                    add_main_anchor.val() +
                    //"<select name=\"group_main_anchor\">" +
                    //makeOptions(mainAnchorArray, add_main_anchor.value) +
                    //"</select>" +
                    "</td><td>" +
                    "<select name=\"group_anchor\">" +
                    makeOptions(anchorArray, add_anchor.val()) +
                    "</select>" +
                    "</td></tr>");
                dialog2.dialog("close");
            }
            return valid;
        }

        dialog2 = $("#dialog_add_anchor_group").dialog({
            autoOpen: false,
            height: 340,
            width: 340,
            modal: true,
            buttons: {
                Cancel: function () {
                    dialog2.dialog("close");
                },
                "Confirm": addGroup
            },
            close: function () {
                form2[0].reset();
                allFields2.removeClass("ui-state-error");
            }
        });

        form2 = dialog2.find("form").on("submit", function (event) {
            event.preventDefault();
            addGroup();
        });
    }
    anchorGroupAdd(); //必須先呼叫一次新增Group的function，否則輸入框會沒有套用設定而顯示出來
    /**************************************************************************************/

    function removeAnchorGroup() {
        var checkboxs = document.getElementsByName("chkbox_anchor_group");
        var arr = [];
        for (j in checkboxs) {
            if (checkboxs[j].checked)
                arr.push(checkboxs[j].value);
        }
        arr.forEach(function (v) {
            $("#tr_anchor_group_" + v).remove();
        });
    }

    dialog = $("#dialog_anchor_group").dialog({
        autoOpen: false,
        height: 500,
        width: 400,
        modal: true,
        buttons: {
            "Delete": removeAnchorGroup,
            "Add": function () {
                anchorGroupAdd();
                dialog2.dialog("open");
            },
            "Confirm": SendResult,
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
                inputGroups(groupListArray, RecordAnchorList);
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
            inputGroups(groupListArray, RecordAnchorList);
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        SendResult();
    });

    $("#Anchor_Group").button().on("click", function () {
        dialog.dialog("open");
    });
});