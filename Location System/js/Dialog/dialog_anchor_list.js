var token = "";
var anchorsInfoArray = [];

$(function () {
    token = getUser() ? getUser().api_token : "";

    $("#anchor_id").on('change', function () {
        //預設anchor_type為anchor
        if ($(this).val().length > 0) {
            var isExist = anchorsInfoArray.every(function (info) {
                return $(this).val() != info.anchor_id;
            })
            if (isExist)
                $("#anchor_id_alert").text($.i18n.prop('i_existed')).css('color', 'red');
            else
                $("#anchor_id_alert").text($.i18n.prop('i_canAdd')).css('color', 'green');
        } else {
            $("#anchor_id_alert").empty();
        }
    });

    var dialog, form,
        anchor_type = $("#anchor_type"),
        anchor_id = $("#anchor_id"),
        allFields = $([]).add(anchor_id);

    $("#btn_add_anchor_list").click(function () {
        anchor_type.val("");
        anchor_id.val("");
        dialog.dialog("open");
    });

    $("#btn_delete_anchor_list").click(function () {
        if (confirm("確定要刪除已勾選的基站?")) {
            var chk_main_anc = document.getElementsByName("chkbox_main_anchor_list");
            var chk_anc = document.getElementsByName("chkbox_anchor_list");
            chk_main_anc.forEach(element => {
                if (element.checked)
                    deleteMainAnchor(element.value);
            });
            chk_anc.forEach(element => {
                if (element.checked)
                    deleteAnchor(element.value);
            });
        }
    });

    function submitAddAnchor() {
        var valid = true;
        allFields.removeClass("ui-state-error");
        valid = valid && checkLength(anchor_id, $.i18n.prop('i_mapAlert_14'), 1, 5);
        var isExist = anchorsInfoArray.findIndex(function (info) {
            return info.anchor_id == anchor_id.val();
        })
        if (isExist > -1) {
            valid = false;
            anchor_id.addClass("ui-state-error");
            alert($.i18n.prop('i_mapAlert_16'));
        }
        if (valid) {
            var request = {
                "Command_Type": ["Write"],
                "Command_Name": ["AddListAnchor"],
                "Value": [{
                    "anchor_type": anchor_type.val(),
                    "anchor_id": anchor_id.val()
                }],
                "api_token": [token]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        getAllDataOfMap();
                        dialog.dialog("close");
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
        }
        return valid;
    }

    dialog = $("#dialog_add_new_anchor").dialog({
        autoOpen: false,
        height: 450,
        width: 340,
        modal: true,
        buttons: {
            "Confirm": submitAddAnchor,
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
        submitAddAnchor();
    });
});

function getAnchorList() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAnchors"],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            getAnchor_Group();
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                anchorsInfoArray = revObj.Values.slice(0); //利用抽離全部陣列完成陣列拷貝
                $("#table_main_anchor_list tbody").empty();
                $("#table_anchor_list tbody").empty();
                var count_main_anchor_list = 0;
                var count_anchor_list = 0;
                for (var i = 0; i < anchorsInfoArray.length; i++) {
                    if (anchorsInfoArray[i].anchor_type == "main") {
                        count_main_anchor_list++;
                        var tr_id = "tr_main_anchor_list_" + count_main_anchor_list;
                        $("#table_main_anchor_list tbody").append("<tr id=\"" + tr_id + "\">" +
                            "<td><input type=\"checkbox\" name=\"chkbox_main_anchor_list\" value=\"" +
                            anchorsInfoArray[i].anchor_id + "\" onchange=\"selectColumn(\'" + tr_id + "\')\" /> " +
                            count_main_anchor_list + "</td>" +
                            "<td><input type=\"text\" name=\"list_main_anchor_id\" value=\"" +
                            anchorsInfoArray[i].anchor_id + "\" style=\"max-width:60px;\" readonly/></td></tr>");
                    } else {
                        count_anchor_list++;
                        var tr_id = "tr_anchor_list_" + count_anchor_list;
                        $("#table_anchor_list tbody").append("<tr id=\"" + tr_id + "\">" +
                            "<td><input type=\"checkbox\" name=\"chkbox_anchor_list\" value=\"" +
                            anchorsInfoArray[i].anchor_id + "\" onchange=\"selectColumn(\'" + tr_id + "\')\" /> " +
                            count_anchor_list + "</td>" +
                            "<td><input type=\"text\" name=\"list_anchor_id\" value=\"" +
                            anchorsInfoArray[i].anchor_id + "\" style=\"max-width:60px;\" readonly/></td></tr>");
                    }
                }
            } else {
                alert("獲取AnchorList失敗，請再試一次!");
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function deleteMainAnchor(id) {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["DeleteAnchor_Info"],
        "Value": [{
            "anchor_id": id
        }],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var requestArray = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["GetGroups"],
                    "api_token": [token]
                };
                var getXmlHttp = createJsonXmlHttp("sql");
                getXmlHttp.onreadystatechange = function () {
                    if (getXmlHttp.readyState == 4 || getXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        var revInfo = ('Values' in revObj) == true ? revObj.Values : [];
                        var deleteArray = [];
                        if (revObj.success > 0) {
                            revInfo.forEach(element => {
                                if (element.main_anchor_id == id) {
                                    deleteArray.push({
                                        "group_id": element.group_id
                                    });
                                }
                            });
                            if (deleteArray.length > 0)
                                DeleteGroupInfo(deleteArray);
                            else
                                getAllDataOfMap();
                        }
                    }
                };
                getXmlHttp.send(JSON.stringify(requestArray));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function deleteAnchor(id) {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["DeleteAnchor_Info"],
        "Value": [{
            "anchor_id": id
        }],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var gerRequest = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["GetGroup_Anchors"],
                    "api_token": [token]
                };
                var getXmlHttp = createJsonXmlHttp("sql");
                getXmlHttp.onreadystatechange = function () {
                    if (getXmlHttp.readyState == 4 || getXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (revObj.success > 0) {
                            var deleteArr = [];
                            revObj.Values.forEach(element => {
                                if (element.anchor_id == id)
                                    deleteArr.push({
                                        "group_id": element.group_id,
                                        "anchor_id": element.anchor_id
                                    })
                            });
                            if (deleteArr.length > 0)
                                DeleteGroup_Anchor(deleteArr);
                            else
                                getAllDataOfMap();
                        }
                    }
                };
                getXmlHttp.send(JSON.stringify(gerRequest));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}