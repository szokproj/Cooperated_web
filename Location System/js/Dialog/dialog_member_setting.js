var command_name = [];

function setCommand(name) {
    if (name == "add")
        command_name = ["AddStaff"];
    else if (name == "edit")
        command_name = ["DeleteStaff", "AddStaff"];
    else
        return;
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


    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(main_tag_id, "main set", 0, 20);
        valid = valid && checkLength(main_number, "main set", 0, 20);
        valid = valid && checkLength(main_name, "main set", 0, 20);
        valid = valid && checkLength(main_dept, "main set", 0, 20);
        valid = valid && checkLength(main_title, "main set", 0, 20);
        valid = valid && checkLength(main_type, "main set", 0, 10);

        if (valid) {
            var requestJSON = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": command_name,
                "Value": [{
                    "tag_id": main_tag_id.val(),
                    "card_id": main_card_id.val(),
                    "number": main_number.val(),
                    "Name": main_name.val(),
                    "department": main_dept.val(),
                    "jobTitle": main_title.val(),
                    "type": main_type.val(),
                    "photo": $("#main_picture_img").val(),
                    "set_color": "",
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