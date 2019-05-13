var count_group = 0;
var mainAnchorIDArr = [];
var anchorIDArr = [];

function clearAnchorGroup() {
    $("#table_anchor_group tbody").empty(); //重置表格
    count_group = 0;
}

function inputAnchorGroup(anchors) {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetGroup_Anchors"]
    };
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var anchor_groups = revObj.Values;
            if (revObj.success > 0) {
                mainAnchorIDArr = [];
                anchorIDArr = [];
                anchors.forEach(element => {
                    if (element.type == "main")
                        mainAnchorIDArr.push(element.id);
                    else
                        anchorIDArr.push(element.id);
                });
                clearAnchorGroup();
                anchor_groups.forEach(info => {
                    count_group++;
                    var tr_id = "tr_anchor_group_" + count_group;
                    $("#table_anchor_group tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                        "<input type=\"checkbox\" name=\"chkbox_anchorgroup\" value=\"" + count_group + "\"" +
                        " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_group +
                        "</td><td>" +
                        "<input type=\"text\" name=\"anchorgroup_group_id\" value=\"" + info.group_id +
                        "\" style=\"max-width:70px;\" onchange=\"draw()\" />" +
                        "</td><td name=\"anchorgroup_main_anchor_id\">" +
                        info.main_anchor_id +
                        "</td><td>" +
                        "<select name=\"anchorgroup_anchor_id\" onchange=\"draw()\">" +
                        makeOptions(anchorIDArr, info.anchor_id) +
                        "</select>" +
                        "</td></tr>");
                });
                inputGroupList(mainAnchorIDArr);
            } else {
                alert("獲取GroupList失敗，請再試一次!");
                return;
            }
        }
    };
    xmlHttp.open("POST", "sql", true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send(JSON.stringify(requestArray));
}

function catchAnchorList() {
    var anc_ids = document.getElementsByName("list_anchor_id");
    anchorIDArr = [];
    anc_ids.forEach(element => {
        anchorIDArr.push(element.value);
    });
}

function resetAncSelect() {
    catchAnchorList();
    var anc_select = $("[name=anchorgroup_anchor_id]");
    for (i in anc_select) {
        var temp = anc_select.eq(i).val();
        anc_select.eq(i).html(makeOptions(anchorIDArr, temp));
    }
}

$(function () {
    var dialog, form,
        add_group = $("#add_group_id"),
        add_main_anchor = $("#add_group_main_anchor"),
        add_anchor = $("#add_group_anchor"),
        allFields = $([]).add(add_group);


    $("#btn_add_anchor_group").on("click", function () {
        catchAnchorList();
        add_anchor.html(makeOptions(anchorIDArr, anchorIDArr[0]));
        add_main_anchor.text("");
        dialog.dialog("open");
    });

    $("#btn_delete_anchor_group").on("click", function () {
        removeAnchorGroup();
    });

    add_group.on("change", function () {
        var array = catchGroupList();
        var index = array.findIndex(function (anchor) {
            return anchor.group_id == add_group.val();
        });
        if (index > -1)
            add_main_anchor.text(array[index].main_anchor_id);
    });


    function addAnchorGroup() {
        var valid = true;

        allFields.removeClass("ui-state-error");
        valid = valid && checkLength(add_group, "Should be more than 0 and less than 65535.", 1, 5);
        //valid = valid && checkLength(add_main_anchor, "Should be more than 0 and less than 65535.", 0, 5);
        valid = valid && checkLength(add_anchor, "Should be more than 0 and less than 65535.", 1, 5);

        if (valid) {
            count_group++;
            var tr_id = "tr_anchor_group_" + count_group;
            $("#table_anchor_group tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                "<input type=\"checkbox\" name=\"chkbox_anchorgroup\" value=\"" + count_group + "\"" +
                " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_group +
                "</td><td>" +
                "<input type=\"text\" name=\"anchorgroup_group_id\" value=\"" + add_group.val() +
                "\" style=\"max-width:70px;\" onchange=\"draw()\" />" +
                "</td><td name=\"anchorgroup_main_anchor_id\">" +
                add_main_anchor.text() +
                "</td><td>" +
                "<select name=\"anchorgroup_anchor_id\" onchange=\"draw()\">" +
                makeOptions(anchorIDArr, add_anchor.val()) +
                "</select>" +
                "</td></tr>");
            dialog.dialog("close");
        }
        return valid;
    }

    function removeAnchorGroup() {
        var checkboxs = document.getElementsByName("chkbox_anchorgroup");
        var arr = [];
        for (j in checkboxs) {
            if (checkboxs[j].checked)
                arr.push(checkboxs[j].value);
        }
        arr.forEach(function (v) {
            $("#tr_anchor_group_" + v).remove();
        });
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