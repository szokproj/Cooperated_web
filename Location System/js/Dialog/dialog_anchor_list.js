var count_main_anchor_list = 0;
var count_anchor_list = 0;
var anchorArray = [];

function clearAnchorList() {
    $("#table_main_anchor_list tbody").empty(); //重置表格
    $("#table_anchor_list tbody").empty();
    count_main_anchor_list = 0;
    count_anchor_list = 0;
}

function inputAnchorList(anchorList) {
    clearAnchorList();
    for (var i = 0; i < anchorList.length; i++) {
        if (anchorList[i].anchor_type == "main") {
            count_main_anchor_list++;
            var tr_id = "tr_main_anchor_list_" + count_main_anchor_list;
            $("#table_main_anchor_list tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                "<input type=\"checkbox\" name=\"chkbox_main_anchor\" value=\"" + tr_id + "\"" +
                " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_main_anchor_list +
                "</td><td>" +
                "<input type=\"text\" name=\"list_main_anchor_id\" value=\"" + anchorList[i].anchor_id + "\" style=\"max-width:100px;\" onchange=\"catchAnchors()\" />" +
                "</td><td>" +
                "<input type=\"text\" name=\"list_main_anchor_x\" value=\"" + anchorList[i].set_x + "\" style=\"max-width:60px;\" onchange=\"catchAnchors()\" />" +
                "</td><td>" +
                "<input type=\"text\" name=\"list_main_anchor_y\" value=\"" + anchorList[i].set_y + "\" style=\"max-width:60px;\" onchange=\"catchAnchors()\" />" +
                "</td></tr>");
        } else {
            count_anchor_list++;
            var tr_id = "tr_anchor_list_" + count_anchor_list;
            $("#table_anchor_list tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                "<input type=\"checkbox\" name=\"chkbox_anchor\" value=\"" + tr_id + "\"" +
                " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_anchor_list +
                "</td><td>" +
                "<input type=\"text\" name=\"list_anchor_id\" value=\"" + anchorList[i].anchor_id + "\" style=\"max-width:100px;\" onchange=\"catchAnchors()\" />" +
                "</td><td>" +
                "<input type=\"text\" name=\"list_anchor_x\" value=\"" + anchorList[i].set_x + "\" style=\"max-width:60px;\" onchange=\"catchAnchors()\" />" +
                "</td><td>" +
                "<input type=\"text\" name=\"list_anchor_y\" value=\"" + anchorList[i].set_y + "\" style=\"max-width:60px;\" onchange=\"catchAnchors()\" />" +
                "</td></tr>");
        }
    }
}

function DeleteAnchorList() {
    var deleteArray = [];
    var chk_main_anchor = document.getElementsByName("chkbox_main_anchor");
    var chk_anchor = document.getElementsByName("chkbox_anchor");
    for (i in chk_main_anchor) {
        if (chk_main_anchor[i].checked)
            deleteArray.push(chk_main_anchor[i].value);
    }
    for (j in chk_anchor) {
        if (chk_anchor[j].checked)
            deleteArray.push(chk_anchor[j].value);
    }
    if (deleteArray.length == 0) {
        alert("請至少勾選一個anchor，才能進行刪除!");
        return;
    }
    deleteArray.forEach(v => {
        $("#" + v).remove();
    });
    catchAnchors(); //遍歷AnchorList每一格，放入Array中，再畫點
}

$(function () {
    var dialog, form,
        anchor_type = $("#anchor_type"),
        anchor_id = $("#anchor_id"),
        anchor_x = $("#anchor_x"),
        anchor_y = $("#anchor_y"),
        allFields = $([]).add(anchor_id).add(anchor_x).add(anchor_y);

    function addAnchor() {
        var valid = true;
        allFields.removeClass("ui-state-error");
        valid = valid && checkLength(anchor_id, "Anchor ID", 1, 5);
        valid = valid && checkLength(anchor_x, "Anchor X", 1, 10);
        valid = valid && checkLength(anchor_y, "Anchor Y", 1, 10);
        if (valid) {
            if (anchor_type.val() == "main") {
                count_main_anchor_list++;
                var tr_id = "tr_main_anchor_list_" + count_main_anchor_list;
                $("#table_main_anchor_list tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                    "<input type=\"checkbox\" name=\"chkbox_main_anchor\" value=\"" + tr_id + "\"" +
                    " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_main_anchor_list +
                    "</td><td>" +
                    "<input type=\"text\" name=\"list_main_anchor_id\" value=\"" + anchor_id.val() + "\" style=\"max-width:100px;\" onchange=\"catchAnchors()\" />" +
                    "</td><td>" +
                    "<input type=\"text\" name=\"list_main_anchor_x\" value=\"" + anchor_x.val() + "\" style=\"max-width:60px;\" onchange=\"catchAnchors()\" />" +
                    "</td><td>" +
                    "<input type=\"text\" name=\"list_main_anchor_y\" value=\"" + anchor_y.val() + "\" style=\"max-width:60px;\" onchange=\"catchAnchors()\" />" +
                    "</td></tr>");
                addAnchorArray("main", anchor_id.val(), anchor_x.val(), anchor_y.val());
            } else {
                count_anchor_list++;
                var tr_id = "tr_anchor_list_" + count_anchor_list;
                $("#table_anchor_list tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                    "<input type=\"checkbox\" name=\"chkbox_anchor\" value=\"" + tr_id + "\"" +
                    " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_anchor_list +
                    "</td><td>" +
                    "<input type=\"text\" name=\"list_anchor_id\" value=\"" + anchor_id.val() + "\" style=\"max-width:100px;\" onchange=\"catchAnchors()\" />" +
                    "</td><td>" +
                    "<input type=\"text\" name=\"list_anchor_x\" value=\"" + anchor_x.val() + "\" style=\"max-width:60px;\" onchange=\"catchAnchors()\" />" +
                    "</td><td>" +
                    "<input type=\"text\" name=\"list_anchor_y\" value=\"" + anchor_y.val() + "\" style=\"max-width:60px;\" onchange=\"catchAnchors()\" />" +
                    "</td></tr>");
                addAnchorArray("", anchor_id.val(), anchor_x.val(), anchor_y.val());
            }
            dialog.dialog("close");
        }
        return valid;
    }

    dialog = $("#dialog_add_new_anchor").dialog({
        autoOpen: false,
        height: 340,
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
        dialog.dialog("open");
    });

    $("#btn_delete_anchor").click(function () { //按下Delete anchor
        DeleteAnchorList();
    });
});