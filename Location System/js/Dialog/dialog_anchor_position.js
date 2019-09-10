var token = "";
/*----------------AnchorPosition:跳出設定視窗-----------------*\
|                       使用jquery編寫                         |
\*-----------------------------------------------------------*/
$(function () {
    token = getUser() ? getUser().api_token : "";

    var dialog, form,
        // From http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29
        anchor_id = $("#anchor_id"),
        anchor_x = $("#anchor_x"),
        anchor_y = $("#anchor_y"),
        allFields = $([]).add(anchor_id, anchor_x, anchor_y);
    //tips = $( ".validateTips" );

    function addNewAnchor() {
        var valid = true;
        allFields.removeClass("ui-state-error");

        valid = valid && checkLength(anchor_id, "Anchor ID", 1, 6);
        valid = valid && checkLength(anchor_x, "Anchor X", 1, 10);
        valid = valid && checkLength(anchor_y, "Anchor Y", 1, 10);
        var anchor_type = $("#anchor_type").children('option:selected');

        var requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["AddListAnchor"],
            "Value": [{
                "anchor_id": anchor_id.val(),
                "anchor_type": anchor_type.val(),
                "set_x": anchor_x.val(),
                "set_y": anchor_y.val()
            }],
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
                    var revInfo = revObj.Value;
                    var text = "";
                    if (revObj.success == 1) {
                        text += "id:" + revInfo[0].anchor_id + "  type:" + revInfo[0].anchor_type +
                            "  x:" + revInfo[0].set_x + "  y:" + revInfo[0].set_y + "\n";
                        alert("成功新增一台Anchor:\n" + text);
                    }
                }
            };
            xmlHttp.open("POST", "AnchorList", true);
            xmlHttp.setRequestHeader("Content-type", "application/json");
            xmlHttp.send(requestJSON);
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
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
                dialog.dialog("close");
            },
            "Confirm": addNewAnchor
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        addNewAnchor();
    });
});

function setAddAnchorDialog() {
    $("#dialog_add_new_anchor").dialog("open"); //開啟對話框
}