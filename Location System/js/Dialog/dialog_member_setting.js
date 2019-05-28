var default_color = '#4CAF50';
var command_name = [];


function setCommand(name) {
    if (name == "add")
        command_name = ["AddStaff"];
    else if (name == "edit")
        command_name = ["DeleteStaff", "AddStaff"];
    else
        return;
}


function selectTagColor() {
    $("#main_input_tag_color").val(default_color);
    $("#main_input_tag_color").css("background-color", default_color);
    $("#main_display_color").css("background-color", default_color);
    //先還原為預設顏色，再依據選擇代入已設定顏色
    var index = $("#main_select_tag_color").children('option:selected').index();
    switch (index) {
        case 1:
            $("#main_display_color").attr("type", "text");
            $("#main_input_tag_color").attr("type", "hidden");
            var requestJSON = JSON.stringify({
                "Command_Type": ["Read"],
                "Command_Name": ["GetDepartment_relation_list"]
            });
            var xmlHttp = createJsonXmlHttp('sql');
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        var nodeArray = [];
                        for (i = 0; i < revInfo.length; i++)
                            nodeArray.push(revInfo[i]);
                        if (nodeArray.length > 0) {
                            nodeArray.forEach(function (v) {
                                if (v.c_id == $("#hidden_department").val()) {
                                    $("#main_input_tag_color").val(colorToHex(v.color));
                                    $("#main_display_color").css("background-color", colorToHex(v.color));
                                }
                            });
                        }
                    }
                }
            };
            xmlHttp.send(requestJSON);
            break;
        case 2:
            $("#main_display_color").attr("type", "text");
            $("#main_input_tag_color").attr("type", "hidden");
            var requestJSON = JSON.stringify({
                "Command_Type": ["Read"],
                "Command_Name": ["GetJobTitle_relation_list"]
            });
            var xmlHttp = createJsonXmlHttp('sql');
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        var nodeArray = [];
                        for (i = 0; i < revInfo.length; i++)
                            nodeArray.push(revInfo[i]);
                        if (nodeArray.length > 0) {
                            nodeArray.forEach(function (v) {
                                if (v.c_id == $("#hidden_jobTitle").val()) {
                                    $("#main_input_tag_color").val(colorToHex(v.color));
                                    $("#main_display_color").css("background-color", colorToHex(v.color));
                                }
                            });
                        }
                    }
                }
            };
            xmlHttp.send(requestJSON);
            break;
        case 3:
            $("#main_display_color").attr("type", "text");
            $("#main_input_tag_color").attr("type", "hidden");
            var requestJSON = JSON.stringify({
                "Command_Type": ["Read"],
                "Command_Name": ["GetUserTypes"]
            });
            var xmlHttp = createJsonXmlHttp('sql');
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        var nodeArray = [];
                        for (i = 0; i < revInfo.length; i++)
                            nodeArray.push(revInfo[i]);
                        if (nodeArray.length > 0) {
                            nodeArray.forEach(function (v) {
                                if (v.type == $("#main_type").val()) {
                                    $("#main_input_tag_color").val(colorToHex(v.color));
                                    $("#main_display_color").css("background-color", colorToHex(v.color));
                                }
                            });
                        }
                    }
                }
            };
            xmlHttp.send(requestJSON);
            break;
        case 4:
            $("#main_display_color").attr("type", "hidden");
            $("#main_input_tag_color").attr("type", "text");
            //假如已使用自訂顏色，則在導入時即顯示，此處做為變更成自訂時顏色保持預設
            break;
        default:
            $("#main_display_color").attr("type", "text");
            $("#main_input_tag_color").attr("type", "hidden");
            break;
    }
}


function colorToHex(color) {
    color = typeof (color) != "string" ? color.toString() : color;
    if (color.indexOf('#') == 0) {
        return color;
    } else {
        var colorArr = color.substring(color.indexOf("(") + 1, color.length - 1).split(",");
        var hexColor = "#";
        for (i = 0; i < colorArr.length; i++) {
            if (i == 3) {
                var persentHex = Number(Math.floor(colorArr[i] * 255)).toString(16);
                if (hexColor != "FF")
                    hexColor += persentHex.length === 1 ? "0" + persentHex : persentHex;
            } else {
                var hexStr = Number(colorArr[i]).toString(16);
                hexColor += hexStr.length === 1 ? "0" + hexStr : hexStr;
            }
        }
        return hexColor.toUpperCase();
    }
}

function getBase64Ext(urldata) {
    urldata = typeof (urldata) == 'undefined' ? "" : urldata;
    var start = urldata.indexOf("/"),
        end = urldata.indexOf(";");
    if (start > -1 && end > -1) {
        return urldata.substring(start + 1, end);
    } else {
        alert("檔案格式錯誤，請檢查格式後重新上傳!");
        return "";
    }
}


$(function () {
    var dialog, form,
        main_tag_id = $("#main_tag_id"),
        main_card_id = $("#main_card_id"),
        main_number = $("#main_number"),
        main_name = $("#main_name"),
        main_dept = $("#main_department"),
        main_title = $("#main_jobTitle"),
        main_type = $("#main_type"),
        allFields = $([]).add(main_tag_id, main_card_id, main_number,
            main_name, main_dept, main_title, main_type);
    //tips = $( ".validateTips" );

    $("#main_select_tag_color").change(selectTagColor);

    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true, photo_ext = "", photo_base64 = "";
        valid = valid && checkLength(main_tag_id, "main set", 0, 20);
        valid = valid && checkLength(main_number, "main set", 0, 20);
        valid = valid && checkLength(main_name, "main set", 0, 20);
        valid = valid && checkLength(main_dept, "main set", 0, 20);
        valid = valid && checkLength(main_title, "main set", 0, 20);
        valid = valid && checkLength(main_type, "main set", 0, 10);

        if ($("#main_picture_img").attr("src").length > 0) {
            var photo_file = $("#main_picture_img").attr("src").split(",");
            photo_ext = getBase64Ext(photo_file[0]);
            photo_base64 = photo_ext != "" ? photo_file[1].trim() : "";
        } else { //no image
            photo_ext = "";
            photo_base64 = "";
        }

        if (valid) {
            var requestJSON = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": command_name,
                "Value": [{
                    "tag_id": main_tag_id.val(),
                    "card_id": main_card_id.val(),
                    "number": main_number.val(),
                    "Name": main_name.val(),
                    "department_id": $("#hidden_department").val(),
                    "jobTitle_id": $("#hidden_jobTitle").val(),
                    "type": main_type.val(),
                    "photo": photo_base64,
                    "file_ext": photo_ext,
                    "color_type": $("#main_select_tag_color").val(),
                    "color": colorToHex($("#main_input_tag_color").val()),
                    "status": $("#basic_state").val(),
                    "gender": $("#basic_gender").val(),
                    "lastName": $("#basic_last_name").val(),
                    "firstName": $("#basic_first_name").val(),
                    "EnglishName": $("#basic_english_name").val(),
                    "birthday": $("#basic_birthday").val(),
                    "phoneJob": $("#basic_job_phone").val(),
                    "phoneSelf": $("#basic_self_phone").val(),
                    "mail": $("#basic_mail").val(),
                    "address": $("#basic_address").val(),
                    "education": $("#basic_highest_education").val(),
                    "school": $("#basic_school").val(),
                    "grade": $("#basic_grade").val(),
                    "tech_grade": $("#basic_pro_level").val(),
                    "dateEntry": $("#basic_entry_date").val(),
                    "dateLeave": $("#basic_leave_date").val(),
                    "note": $("#note_text").val(),
                    "exist": "1"
                }]
            });

            var xmlHttp = createJsonXmlHttp('sql');
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0)
                        UpdateMemberList();
                }
            };
            xmlHttp.send(requestJSON);
            dialog.dialog("close");
        }
        return valid;
    };

    dialog = $("#dialog_edit_member").dialog({
        autoOpen: false,
        height: 620,
        width: 600,
        modal: true,
        buttons: {
            "Confirm": SendResult,
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
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
        SendResult();
    });
});