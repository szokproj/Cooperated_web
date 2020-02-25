'use strict';

var RowsList = {
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
    var dialog,
        return_table = $("#table_members tbody"),
        search_num = $("#search_number"),
        search_tag = $("#search_tag_id"),
        search_name = $("#search_name"),
        search_dept = $("#search_dept"),
        allFields = $([]).add(search_num).add(search_tag).add(search_name);

    function inputMembers() {
        var add_number_arr = [],
            count = document.getElementsByName("select_members").length,
            chk_members = document.getElementsByName("chk_members");
        if (chk_members.length == 0)
            return alert("請至少選擇一個人員!");
        chk_members.forEach(function (chk) {
            if (chk.checked) {
                var exist = selectNumberArray.findIndex(function (number) {
                    return number == chk.value;
                });
                if (exist == -1) {
                    selectNumberArray.push(chk.value);
                    add_number_arr.push(chk.value);
                }
            }
        });
        add_number_arr.forEach(function (number) {
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
            var item = 0;
            for (var number in memberList) {
                item++;
                addMemberRow(item, memberList[number]);
            }
            $("#chk_all_search_member").prop("checked", false);
        }
    });

    $("#btn_reset_member").on("click", function () {
        allFields.val("").removeClass("ui-state-error");
        $("#search_dept option").eq(0).prop("selected", true);
        $("#search_member_list tbody").empty();
        var item = 0;
        for (var number in memberList) {
            item++;
            addMemberRow(item, memberList[number]);
        }
        $("#chk_all_search_member").prop("checked", false);
    });

    $("#btn_add_members").on("click", function () {
        if ($("#select_report_name").val() != "all_member_attend")
            dialog.dialog("open");
    });

    $("#btn_search_member").on("click", function () {
        var result = memberList,
            target = {
                user_id: search_tag.val(),
                number: search_num.val(),
                Name: search_name.val(),
                department_id: search_dept.val()
            };

        for (var condition in target) {
            result = membersFilter(result, condition, "");
        }

        $("#search_member_list tbody").empty();
        var item = 0;
        for (var number in result) {
            item++;
            addMemberRow(item, result[number]);
        }

        function membersFilter(list, condition, null_str) {
            var temp = {};
            if (target[condition] == null_str) {
                temp = list;
            } else {
                for (var number in list) {
                    if (list[number][condition] == target[condition])
                        temp[number] = list[number];
                }
            }
            return temp;
        }
    });

    getMemberData();

    function getMemberData() {
        var json_request = JSON.stringify({
            "Command_Type": ["Read"],
            "Command_Name": ["GetStaffs"],
            "api_token": [token]
        });
        var jxh = createJsonXmlHttp("sql");
        jxh.onreadystatechange = function () {
            if (jxh.readyState == 4 || jxh.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    var revInfo = revObj.Value[0].Values || [];
                    $("#search_member_list tbody").empty();
                    revInfo.forEach(function (member, i) {
                        member["user_id"] = parseInt(member.tag_id.substring(8), 16);
                        member["tid_id"] = parseInt(member.tag_id.substring(0, 8), 16);
                        addMemberRow(i + 1, member);
                        memberList[member.number] = member;
                    });
                }
            }
        };
        jxh.send(json_request);
    }

    function addMemberRow(item, data) {
        var tr_id = "member_index_" + item;
        $("#search_member_list tbody").append("<tr id=\"" + tr_id + "\">" +
            "<td><input type='checkbox' name=\"chk_members\" value=\"" + data.number + "\"" +
            " onchange=\"selectCheckbox(\'" + tr_id + "\')\" /> " + item + "</td>" +
            "<td>" + data.number + "</td>" +
            "<td>" + data.user_id + "</td>" +
            "<td>" + data.Name + "</td>" +
            "<td>" + data.department + "</td></tr>");
    }
}

function convertTableToArray(table_id) {
    var arr = [];
    var tableObj = document.getElementById(table_id);
    var allTRs = tableObj.getElementsByTagName("tr");
    var title_arr = [];
    for (var trCounter = 0; trCounter < allTRs.length; trCounter++) {
        if (trCounter == 0) {
            var allThsInTR = allTRs[trCounter].getElementsByTagName("th");
            for (var th = 0; th < allThsInTR.length; th++) {
                title_arr.push(allThsInTR[th].innerHTML);
            }
        } else {
            var tmpObj = {};
            var allTDsInTR = allTRs[trCounter].getElementsByTagName("td");
            for (var td = 0; td < allTDsInTR.length; td++) {
                tmpObj[title_arr[td]] = allTDsInTR[td].innerHTML;
                //console.log(tmpObj[title_arr[td]]);
            }
            arr.push(tmpObj);
        }
    }
    return arr;
}

function selectCheckbox(tr_id) {
    var tr = document.getElementById(tr_id);
    if (tr.classList.contains("selected"))
        tr.classList.remove("selected");
    else
        tr.classList.add("selected");
}

function setDisplayRowsDialog() {
    var dialog;

    function submitDisplayRows() {
        var chk_display_rows = document.getElementsByName("chk_display_rows"),
            chk_person_data = document.getElementsByName("chk_person_data"),
            tr_member_attendance = "",
            tr_person_timeline = "";

        for (var i = 0; i < chk_display_rows.length; i++) {
            if (chk_display_rows[i].checked) {
                RowsList[chk_display_rows[i].value].attendance = true;
                tr_member_attendance += "<th>" + $.i18n.prop(RowsList[chk_display_rows[i].value].i18n) + "</th>";
            } else {
                RowsList[chk_display_rows[i].value].attendance = false;
            }
        }
        $("#table_member_attendance thead").html("<tr><th>" + $.i18n.prop("i_item") + "</th>" +
            tr_member_attendance +
            "<th>" + $.i18n.prop('i_clockIn') + "</th>" +
            "<th>" + $.i18n.prop('i_clockOut') + "</th>");

        var count_data = 0;
        for (var j = 0; j < chk_person_data.length; j++) {
            if (chk_person_data[j].checked) {
                RowsList[chk_person_data[j].value].timeline = true;
                var id = "report_person_" + chk_person_data[j].value;
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
            var html = "",
                count_row = 0,
                title_arr = Object.keys(RowsList),
                integer = parseInt(title_arr.length / 2, 10);
            for (var i = 0; i < title_arr.length; i++) {
                var check = "";
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

var arraysToExcel = {
    timeline: function (array, wbname, appname) {
        var ctx = "";
        var workbookXML = "";
        var worksheetsXML = "";
        var rowsXML = "";
        var uri = 'data:application/vnd.ms-excel;base64,',
            tmplWorkbookXML = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>' +
            '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
            '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>Axel Richter</Author>' +
            '<Created>{created}</Created></DocumentProperties>' +
            '<Styles>' +
            '<Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style>' +
            '<Style ss:ID="Date"><NumberFormat ss:Format="Medium Date"></NumberFormat></Style>' +
            '</Styles>' +
            '{worksheets}</Workbook>',
            tmplWorksheetXML = '<Worksheet ss:Name="{nameWS}"><Table>{rows}</Table></Worksheet>',
            tmplCellXML = '<Cell{attributeStyleID}{attributeFormula}><Data ss:Type="{nameType}">{data}</Data></Cell>',
            base64 = function (s) {
                return window.btoa(unescape(encodeURIComponent(s)));
            },
            format = function (s, c) {
                return s.replace(/{(\w+)}/g, function (m, p) {
                    return c[p];
                });
            };

        var titleText = '<Row>';
        for (var title in array[0]) {
            ctx = {
                attributeStyleID: '',
                nameType: 'String',
                data: title,
                attributeFormula: ''
            };
            titleText += format(tmplCellXML, ctx);
        }
        titleText += '</Row>';

        var wsnames = "";
        var count = 0;

        while (array.length > 0) {
            wsnames = (count + 1) + "~";

            //標題列
            rowsXML = titleText;

            //內容列 
            for (var i = 0; i < 5000; i++) {
                if (array[i]) {
                    count++;
                    rowsXML += '<Row>';
                    for (var title in array[i]) {
                        ctx = {
                            attributeStyleID: '',
                            nameType: 'String',
                            data: array[i][title],
                            attributeFormula: ''
                        };
                        rowsXML += format(tmplCellXML, ctx);
                    }
                    rowsXML += '</Row>';
                }
            }

            ctx = {
                rows: rowsXML,
                nameWS: wsnames + count
            };
            worksheetsXML += format(tmplWorksheetXML, ctx);

            if (array.length < 5000)
                array = [];
            else
                array = array.slice(5000);
        }

        ctx = {
            created: (new Date()).getTime(),
            worksheets: worksheetsXML
        };
        workbookXML = format(tmplWorkbookXML, ctx);

        //查看后台的打印输出
        //console.log(workbookXML);

        var link = document.createElement("A");
        link.href = uri + base64(workbookXML);
        link.download = wbname || 'Workbook.xls';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    attendance: function (arrays, wsnames, wbname, appname) {
        var ctx = "";
        var workbookXML = "";
        var worksheetsXML = "";
        var rowsXML = "";
        var titlesList = {};
        var uri = 'data:application/vnd.ms-excel;base64,',
            tmplWorkbookXML = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>' +
            '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
            '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>Axel Richter</Author>' +
            '<Created>{created}</Created></DocumentProperties>' +
            '<Styles>' +
            '<Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style>' +
            '<Style ss:ID="Date"><NumberFormat ss:Format="Medium Date"></NumberFormat></Style>' +
            '</Styles>' +
            '{worksheets}</Workbook>',
            tmplWorksheetXML = '<Worksheet ss:Name="{nameWS}"><Table>{rows}</Table></Worksheet>',
            tmplCellXML = '<Cell{attributeStyleID}{attributeFormula}><Data ss:Type="{nameType}">{data}</Data></Cell>',
            base64 = function (s) {
                return window.btoa(unescape(encodeURIComponent(s)));
            },
            format = function (s, c) {
                return s.replace(/{(\w+)}/g, function (m, p) {
                    return c[p];
                });
            };

        titlesList["item"] = $.i18n.prop('i_item');
        for (var title in RowsList) {
            if (RowsList[title]["attendance"] == true)
                titlesList[title] = $.i18n.prop(RowsList[title]["i18n"]);
        }
        titlesList["clockIn"] = $.i18n.prop('i_clockIn');
        titlesList["clockOut"] = $.i18n.prop('i_clockOut');

        for (var i = 0; i < arrays.length; i++) {
            //標題列
            rowsXML += '<Row>';
            for (var title in titlesList) {
                ctx = {
                    attributeStyleID: '',
                    nameType: 'String',
                    data: titlesList[title],
                    attributeFormula: ''
                };
                rowsXML += format(tmplCellXML, ctx);
            }
            rowsXML += '</Row>';

            //內容列
            var count = 0;
            targetArray.forEach(function (target) {
                var member_info = memberList[target.number],
                    attend_from = historyData[i][target.tag_id].first,
                    attend_end = historyData[i][target.tag_id].last;
                count++;
                rowsXML += '<Row>';
                for (var title in titlesList) {
                    var value = null;
                    switch (title) {
                        case "item":
                            value = count;
                            break;
                        case "clockIn":
                            value = (attend_from ? attend_from.time.split(" ")[1] : "缺席");
                            break;
                        case "clockOut":
                            value = (attend_end ? attend_end.time.split(" ")[1] : "缺席");
                            break;
                        default:
                            value = member_info[title] ? member_info[title] : "";
                            break;
                    }
                    ctx = {
                        attributeStyleID: '',
                        nameType: 'String',
                        data: value,
                        attributeFormula: ''
                    };
                    rowsXML += format(tmplCellXML, ctx);
                }
                rowsXML += '</Row>';
            });

            ctx = {
                rows: rowsXML,
                nameWS: wsnames[i] || 'Sheet' + i
            };
            worksheetsXML += format(tmplWorksheetXML, ctx);
            rowsXML = "";
        }

        ctx = {
            created: (new Date()).getTime(),
            worksheets: worksheetsXML
        };
        workbookXML = format(tmplWorkbookXML, ctx);

        //查看后台的打印输出
        //console.log(workbookXML);

        var link = document.createElement("A");
        link.href = uri + base64(workbookXML);
        link.download = wbname || 'Workbook.xls';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}