var token = "",
    count_tag_set = 0,
    RecordSetList = [],
    colorArray = ["transparent", "red", "pink", "orange", "yellow", "green", "blue", "purple", "gray", "white", "black"];

$(function () {
    token = getUser() ? getUser().api_token : "";

    var dialog, form,
        tag_name_row = $("[name=tag_set_name]"),
        tag_id_row = $("[name=tag_set_id]"),
        tag_color_row = $("[name=tag_set_color]"),
        allFields = $([]).add(tag_id_row, tag_name_row, tag_color_row);

    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true,
            tag_array = [],
            row_count = 0;
        for (i = 0; i < tag_id_row.length; i++) {
            valid = valid && checkLength(tag_name_row.eq(i), "tag set", 0, 20);
            valid = valid && checkLength(tag_id_row.eq(i), "tag set", 0, 6);
            tag_array.push({
                "tag_id": tag_id_row.eq(i).val(),
                "tag_name": tag_name_row.eq(i).val(),
                "color": tag_color_row.eq(i).val()
            });
            row_count++;
        }

        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["", ""],
            "Value": tag_array,
            "api_token": [token]
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
                        inputTagSetting(revInfo);
                    }
                }
            };
            xmlHttp.open("POST", "GroupList", true);
            xmlHttp.setRequestHeader("Content-type", "application/json");
            xmlHttp.send(requestJSON);
            dialog.dialog("close");
        }
        return valid;
    };

    var addTagSet = function () {
        count_tag_set++;
        var tr_id = "tr_tag_set_" + count_tag_set;
        $("#dialog_tag_set tbody").append("<tr id=\"" + tr_id + "\"><td>" +
            "<input type=\"checkbox\" name=\"chkbox_tag_set\" value=\"" + count_tag_set + "\"" +
            " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_tag_set +
            "</td><td>" +
            "<input type=\"text\" name=\"tag_set_name\" value=\"\" style=\"max-width:100px;\" />" +
            "</td><td>" +
            "<input type=\"text\" name=\"tag_set_id\" value=\"\" style=\"max-width:70px;\" />" +
            "</td><td>" +
            "<select name=\"tag_set_color\">" +
            makeOptions(colorArray, colorArray[0]) +
            "</select>" +
            "</td></tr>");
    };

    var removeTagSet = function () {
        var checkboxs = document.getElementsByName("chkbox_tag_set");
        var arr = [];
        for (j in checkboxs) {
            if (checkboxs[j].checked)
                arr.push(checkboxs[j].value);
        }
        arr.forEach(function (v) {
            $("#tr_tag_set_" + v).remove();
        });
    }

    dialog = $("#dialog_tag_set").dialog({
        autoOpen: false,
        height: 500,
        width: 400,
        modal: true,
        buttons: {
            "Delete": removeTagSet,
            "Add": addTagSet,
            "Confirm": SendResult,
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
                inputTagSetting(RecordSetList);
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
            inputTagSetting(RecordSetList);
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        SendResult();
    });

    $("#Tag_Setting").button().on("click", function () {
        dialog.dialog("open");
    });
});

function inputTagSetting(tags_info) {
    RecordSetList = tags_info;
    $(function () {
        $("#dialog_tag_set tbody").empty(); //先重置表格
        count_tag_set = 0;
        for (var i = 0; i < tags_info.length; i++) {
            count_tag_set++;
            var tr_id = "tr_tag_set_" + count_tag_set;
            $("#dialog_tag_set tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                "<input type=\"checkbox\" name=\"chkbox_tag_set\" value=\"" + count_tag_set + "\"" +
                " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_tag_set +
                "</td><td>" +
                "<input type=\"text\" name=\"tag_set_name\" value=\"" + tags_info[i].tag_name +
                "\" style=\"max-width:100px;\" />" +
                "</td><td>" +
                "<input type=\"text\" name=\"tag_set_id\" value=\"" + tags_info[i].tag_id +
                "\" style=\"max-width:70px;\" />" +
                "</td><td>" +
                "<select name=\"tag_set_color\">" +
                makeOptions(colorArray, tags_info[i].pic_path) +
                "</select>" +
                "</td></tr>");
        }
    });
}