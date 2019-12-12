'use strict';

const RowsList = {
    "number": {
        i18n: "i_number",
        timeline: true,
        attendance: true
    },
    "user_id": {
        i18n: "i_userID",
        timeline: true,
        attendance: true
    },
    "Name": {
        i18n: "i_name",
        timeline: true,
        attendance: true
    },
    "department": {
        i18n: "i_dept",
        timeline: true,
        attendance: true
    },
    "jobTitle": {
        i18n: "i_jobTitle",
        timeline: false,
        attendance: false
    },
    "tid_id": {
        i18n: "i_tidID",
        timeline: false,
        attendance: false
    },
    "type": {
        i18n: "i_userType",
        timeline: false,
        attendance: false
    },
    "card_id": {
        i18n: "i_cardID",
        timeline: false,
        attendance: false
    },
    "lastName": {
        i18n: "i_lastName",
        timeline: false,
        attendance: false
    },
    "firstName": {
        i18n: "i_firstName",
        timeline: false,
        attendance: false
    },
    "EnglishName": {
        i18n: "i_englishName",
        timeline: false,
        attendance: false
    },
    "gender": {
        i18n: "i_gender",
        timeline: false,
        attendance: false
    },
    "status": {
        i18n: "i_status",
        timeline: false,
        attendance: false
    },
    "color": {
        i18n: "i_color",
        timeline: false,
        attendance: false
    },
    "alarm_group_id": {
        i18n: "i_alarmGroup",
        timeline: false,
        attendance: false
    },
    "grade": {
        i18n: "i_grade",
        timeline: false,
        attendance: false
    },
    "phoneJob": {
        i18n: "i_jobPhone",
        timeline: false,
        attendance: false
    },
    "phoneSelf": {
        i18n: "i_selfPhone",
        timeline: false,
        attendance: false
    },
    "mail": {
        i18n: "i_eMail",
        timeline: false,
        attendance: false
    },
    "address": {
        i18n: "i_address",
        timeline: false,
        attendance: false
    }
};

function setMembersDialog() {
    let dialog,
        return_table = $("#table_members tbody"),
        search_num = $("#search_number"),
        search_tag = $("#search_tag_id"),
        search_name = $("#search_name"),
        search_dept = $("#search_dept"),
        allFields = $([]).add(search_num).add(search_tag).add(search_name);

    function inputMembers() {
        let add_number_arr = [],
            count = document.getElementsByName("select_members").length,
            chk_members = document.getElementsByName("chk_members");
        if (chk_members.length == 0)
            return alert("請至少選擇一個人員!");
        chk_members.forEach(chk => {
            if (chk.checked) {
                let exist = sel_members_number.findIndex(function (number) {
                    return number == chk.value;
                });
                if (exist == -1) {
                    sel_members_number.push(chk.value);
                    add_number_arr.push(chk.value);
                }
            }
        });
        add_number_arr.forEach(number => {
            count++;
            return_table.append("<tr>" +
                "<td><input type='checkbox' name=\"select_members\" value=\"" + number + "\" /> " +
                count + "</td>" +
                "<td>" + number + "</td>" +
                "<td>" + memberList[number].Name + "</td></tr>");
        });
        $("#count_sel_members").text(count);
        dialog.dialog("close");
    }

    dialog = $("#search_member_dialog").dialog({
        autoOpen: false,
        height: 500,
        width: 500,
        modal: true,
        buttons: {
            "Confirm": inputMembers,
            Cancel: function () {
                dialog.dialog("close");
            }
        },
        close: function () {
            allFields.val("").removeClass("ui-state-error");
            $("#search_dept option").eq(0).prop("selected", true);
            $("#search_member_list tbody").empty();
            let item = 0;
            for (let number in memberList) {
                item++;
                addMemberRow(item, memberList[number]);
            }
            $("#chk_all_search_member").prop("checked", false);
        }
    });

    $("#btn_add_members").on("click", function () {
        if ($("#select_report_name").val() != "all_member_attend")
            dialog.dialog("open");
    });

    $("#btn_search_member").on("click", function () {
        let result = memberList,
            target = {
                user_id: search_tag.val(),
                number: search_num.val(),
                Name: search_name.val(),
                department_id: search_dept.val()
            };

        for (let condition in target) {
            result = membersFilter(result, condition, "");
        }

        $("#search_member_list tbody").empty();
        let item = 0;
        for (let number in result) {
            item++;
            addMemberRow(item, result[number]);
        }

        function membersFilter(list, condition, null_str) {
            let temp = {};
            if (target[condition] == null_str) {
                temp = list;
            } else {
                for (let number in list) {
                    if (list[number][condition] == target[condition])
                        temp[number] = list[number];
                }
            }
            return temp;
        }
    });

    getMemberData();

    function getMemberData() {
        const json_request = JSON.stringify({
            "Command_Type": ["Read"],
            "Command_Name": ["GetStaffs"],
            "api_token": [token]
        });
        let jxh = createJsonXmlHttp("sql");
        jxh.onreadystatechange = function () {
            if (jxh.readyState == 4 || jxh.readyState == "complete") {
                let revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    let revInfo = revObj.Value[0].Values || [];
                    $("#search_member_list tbody").empty();
                    revInfo.forEach(function (member, i) {
                        member.user_id = parseInt(member.tag_id.substring(8), 16);
                        addMemberRow(i + 1, member);
                        memberList[member.number] = member;
                    });
                }
            }
        };
        jxh.send(json_request);
    }

    function addMemberRow(item, data) {
        let tr_id = "member_index_" + item;
        $("#search_member_list tbody").append("<tr id=\"" + tr_id + "\">" +
            "<td><input type='checkbox' name=\"chk_members\" value=\"" + data.number + "\"" +
            " onchange=\"selectCheckbox(\'" + tr_id + "\')\" /> " + item + "</td>" +
            "<td>" + data.number + "</td>" +
            "<td>" + data.user_id + "</td>" +
            "<td>" + data.Name + "</td>" +
            "<td>" + data.department + "</td></tr>");

        /*$("#" + tr_id).on("click", function () {
            let checkbox = $(this).find("td:eq(0) input[type='checkbox']");
            if (checkbox.prop("checked")) {
                checkbox.prop("checked", false);
                $(this).removeClass("selected");
            } else {
                checkbox.prop("checked", true);
                $(this).addClass("selected");
            }
        });*/
    }
}

function selectCheckbox(tr_id) {
    let tr = document.getElementById(tr_id);
    if (tr.classList.contains("selected"))
        tr.classList.remove("selected");
    else
        tr.classList.add("selected");
}

function setDisplayRowsDialog() {
    let dialog;

    function submitDisplayRows() {
        let chk_display_rows = document.getElementsByName("chk_display_rows"),
            chk_person_data = document.getElementsByName("chk_person_data"),
            tr_member_attendance = "",
            tr_person_timeline = "";

        for (let i = 0; i < chk_display_rows.length; i++) {
            if (chk_display_rows[i].checked) {
                RowsList[chk_display_rows[i].value].attendance = true;
                tr_member_attendance += "<th>" + $.i18n.prop(RowsList[chk_display_rows[i].value].i18n) + "</th>";
            } else {
                RowsList[chk_display_rows[i].value].attendance = false;
            }
        }
        $("#table_member_attendance thead").html("<tr><th>" + $.i18n.prop("i_item") + "</th>" +
            tr_member_attendance +
            "<th>上班時間</th>" +
            "<th>下班時間</th></tr>");

        let count_data = 0;
        for (let j = 0; j < chk_person_data.length; j++) {
            if (chk_person_data[j].checked) {
                RowsList[chk_person_data[j].value].timeline = true;
                let id = "report_person_" + chk_person_data[j].value;
                if (count_data / 4 > 0 && count_data % 4 == 0) //4 datas => 1 column
                    tr_person_timeline += "</tr><tr>";
                tr_person_timeline += "<td>" + $.i18n.prop(RowsList[chk_person_data[j].value].i18n) + "</td>" +
                    "<td><label id=\"" + id + "\"></label></td>";
                count_data++;
            } else {
                RowsList[chk_person_data[j].value].timeline = false;
            }
        }
        $("#report_person_timeline").html("<tr>" + tr_person_timeline + "</tr>");

        dialog.dialog("close");
    }

    dialog = $("#dialog_display_rows").dialog({
        autoOpen: false,
        height: 500,
        width: 380,
        modal: true,
        buttons: {
            "Confirm": submitDisplayRows,
            Cancel: function () {
                dialog.dialog("close");
            }
        },
        close: function () {
            inputRowsTable();
        }
    });

    $("#btn_set_display_rows").on("click", function () {
        dialog.dialog("open");
    });

    inputRowsTable();

    function inputRowsTable() {
        document.getElementById("table_person_data").innerHTML = createTbody("chk_person_data", "timeline");
        document.getElementById("table_display_rows").innerHTML = createTbody("chk_display_rows", "attendance");

        function createTbody(checkbox_name, type) {
            let html = "",
                count_row = 0,
                title_arr = Object.keys(RowsList),
                integer = parseInt(title_arr.length / 2, 10);
            for (let i = 0; i < title_arr.length; i++) {
                let check = "";
                if (i == 0)
                    check = "checked disabled";
                else if (RowsList[title_arr[i]][type] == true)
                    check = "checked";
                if (i % 2 == 0) {
                    count_row++;
                    html += "<tr><td><input type='checkbox' name=\"" + checkbox_name + "\" value=\"" + title_arr[i] + "\" " +
                        check + "/> <label class=\"i18n\" name=\"" + RowsList[title_arr[i]].i18n + "\">" +
                        $.i18n.prop(RowsList[title_arr[i]].i18n) + "</label></td>" + (count_row > integer ? "<td></td></tr>" : "");
                } else {
                    html += "<td><input type='checkbox' name=\"" + checkbox_name + "\" value=\"" + title_arr[i] + "\" " +
                        check + "/> <label class=\"i18n\" name=\"" + RowsList[title_arr[i]].i18n + "\">" +
                        $.i18n.prop(RowsList[title_arr[i]].i18n) + "</label></td></tr>";
                }
            }
            return html;
        }
    }
}