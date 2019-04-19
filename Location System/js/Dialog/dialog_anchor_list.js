var anchorListArray = [],
    count_anchor_list = 0;

function inputAnchorList(anchorList) {
    anchorListArray = anchorList;
    $("#table_main_anchor_list tbody").empty(); //先重置表格
    $("#table_anchor_list tbody").empty();
    count_anchor_list = 0;
    for (var i = 0; i < anchorList.length; i++) {
        count_anchor_list++;
        var tr_id = "tr_anchor_list" + count_anchor_list;
        if (anchorList[i].anchor_type == "main") {
            $("#table_main_anchor_list tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                "<input type=\"text\" name=\"list_main_anchor_id\" value=\"" + anchorList[i].anchor_id + "\" style=\"max-width:100px;\" />" +
                "</td><td>" +
                "<input type=\"text\" name=\"list_main_anchor_x\" value=\"" + anchorList[i].set_x + "\" style=\"max-width:60px;\" />" +
                "</td><td>" +
                "<input type=\"text\" name=\"list_main_anchor_y\" value=\"" + anchorList[i].set_y + "\" style=\"max-width:60px;\" />" +
                "</td><td>" +
                "<input type=\"button\" value=\"Delete\" onclick=\"DeleteColumn(\'" + tr_id + "\')\" />" +
                "</td></tr>");
        } else {
            $("#table_anchor_list tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                "<input type=\"text\" name=\"list_anchor_id\" value=\"" + anchorList[i].anchor_id + "\" style=\"max-width:100px;\" />" +
                "</td><td>" +
                "<input type=\"text\" name=\"list_anchor_x\" value=\"" + anchorList[i].set_x + "\" style=\"max-width:60px;\" />" +
                "</td><td>" +
                "<input type=\"text\" name=\"list_anchor_y\" value=\"" + anchorList[i].set_y + "\" style=\"max-width:60px;\" />" +
                "</td><td>" +
                "<input type=\"button\" value=\"Delete\" onclick=\"DeleteColumn(\'" + tr_id + "\')\" />" +
                "</td></tr>");
        }
    }
}

function DeleteColumn(id) {
    $("#" + id).remove();
}

$(function () {
    var dialog, form,
        main_id = $("input[name=list_main_anchor_id]"),
        main_x = $("input[name=list_main_anchor_x]"),
        main_y = $("input[name=list_main_anchor_y]"),
        id = $("input[name=list_anchor_id]"),
        x = $("input[name=list_anchor_x]"),
        y = $("input[name=list_anchor_y]"),
        allFields = $([]).add(main_id, main_x, main_y, id, x, y);
    //tips = $( ".validateTips" );

    function SendResult() {
        allFields.removeClass("ui-state-error");
        var valid = true,
            anchor_array = [],
            count_total_anchors = 0;

        for (i = 0; i < main_id.length; i++) {
            valid = valid && checkLength(main_id.eq(i), "mapScale", 0, 5);
            valid = valid && checkLength(main_x.eq(i), "mapScale", 0, 10);
            valid = valid && checkLength(main_y.eq(i), "mapScale", 0, 10);
            anchor_array.push({
                "anchor_id": main_id.eq(i).val(),
                "anchor_type": "main",
                "set_x": main_x.eq(i).val(),
                "set_y": main_y.eq(i).val()
            });
            count_total_anchors++
        }

        for (j = 0; j < id.length; j++) {
            valid = valid && checkLength(id.eq(i), "mapScale", 0, 5);
            valid = valid && checkLength(x.eq(i), "mapScale", 0, 10);
            valid = valid && checkLength(y.eq(i), "mapScale", 0, 10);
            anchor_array.push({
                "anchor_id": id.eq(i).val(),
                "anchor_type": "",
                "set_x": x.eq(i).val(),
                "set_y": y.eq(i).val()
            });
            count_total_anchors++
        }

        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["ClearListAnchor", "AddListAnchor"],
            "Value": anchor_array
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
                    var revInfo = revObj.Value;
                    if (revObj.success > 0) {
                        for (var i in revInfo) {
                            text += "id:" + revInfo[i].anchor_id + "  type:" + revInfo[i].anchor_type +
                                "  x:" + revInfo[i].set_x + "  y:" + revInfo[i].set_y + "\n";
                        }
                        alert("更新成功Anchor:" + revObj.success + "台,\n" +
                            "更新失敗Anchor:" + (count_total_anchors - revObj.success));
                        inputAnchorList(revInfo);
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

    function anchorListAdd() {
        var form2,
            anchor_id = $("#anchor_id"),
            anchor_x = $("#anchor_x"),
            anchor_y = $("#anchor_y"),
            allFields2 = $([]).add(anchor_id).add(anchor_x).add(anchor_y);

        function addAnchor() {
            var valid = true;
            allFields2.removeClass("ui-state-error");

            var anchor_type = $("#anchor_type").children('option:selected');
            valid = valid && checkLength(anchor_id, "Anchor ID", 0, 6);
            valid = valid && checkLength(anchor_x, "Anchor X", 0, 10);
            valid = valid && checkLength(anchor_y, "Anchor Y", 0, 10);

            if (valid) {
                count_anchor_list++;
                var tr_id = "tr_anchor_list" + count_anchor_list;
                if (anchor_type.val() == "main") {
                    $("#table_main_anchor_list tbody").append("<tr><td>" +
                        "<input type=\"text\" name=\"list_main_anchor_id\" value=\"" + anchor_id.val() + "\" style=\"max-width:100px;\" />" +
                        "</td><td>" +
                        "<input type=\"text\" name=\"list_main_anchor_x\" value=\"" + anchor_x.val() + "\" style=\"max-width:60px;\" />" +
                        "</td><td>" +
                        "<input type=\"text\" name=\"list_main_anchor_y\" value=\"" + anchor_y.val() + "\" style=\"max-width:60px;\" />" +
                        "</td><td>" +
                        "<input type=\"button\" value=\"Delete\" onclick=\"DeleteColumn(\'" + tr_id + "\')\" />" +
                        "</td></tr>");
                } else {
                    $("#table_anchor_list tbody").append("<tr><td>" +
                        "<input type=\"text\" name=\"list_anchor_id\" value=\"" + anchor_id.val() + "\" style=\"max-width:100px;\" />" +
                        "</td><td>" +
                        "<input type=\"text\" name=\"list_anchor_x\" value=\"" + anchor_x.val() + "\" style=\"max-width:60px;\" />" +
                        "</td><td>" +
                        "<input type=\"text\" name=\"list_anchor_y\" value=\"" + anchor_y.val() + "\" style=\"max-width:60px;\" />" +
                        "</td><td>" +
                        "<input type=\"button\" value=\"Delete\" onclick=\"DeleteColumn(\'" + tr_id + "\')\" />" +
                        "</td></tr>");
                }
                dialog2.dialog("close");
            }
            return valid;
        }

        dialog2 = $("#dialog_add_new_anchor").dialog({
            autoOpen: false,
            height: 340,
            width: 340,
            modal: true,
            buttons: {
                Cancel: function () {
                    dialog2.dialog("close");
                },
                "Confirm": addAnchor
            },
            close: function () {
                form2[0].reset();
                allFields2.removeClass("ui-state-error");
            }
        });

        form2 = dialog2.find("form").on("submit", function (event) {
            event.preventDefault();
            addAnchor();
        });
    }

    anchorListAdd(); //必須先呼叫一次新增Anchor的function，否則輸入框會沒有套用設定而顯示出來
    /**************************************************************************************/

    dialog = $("#dialog_anchor_list").dialog({
        autoOpen: false,
        height: 500,
        width: 400,
        modal: true,
        buttons: {
            "Add": function () {
                anchorListAdd();
                dialog2.dialog("open");
            },
            "Confirm": SendResult,
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
                inputAnchorList(anchorListArray);
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
            inputAnchorList(anchorListArray);
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        SendResult();
    });

    $("#Anchor_List").button().on("click", function () {
        dialog.dialog("open");
    });
});