$(function () {
    UpdateMemberList();
    $("#main_picture_upload").unbind();
    $("#main_picture_upload").change(function () {
        var file = this.files[0];
        var src = URL.createObjectURL(file);
        $("#main_picture_thumbnail").attr("href", src);
        $("#main_picture_img").attr("src", src);
    });
    $("#main_picture_clear").click(function () {
        $("#main_picture_img").attr('src', '');
    });
    $("#add_col").click(function () {
        addMemberData();
    });
    $("#delete_col").click(function () {
        removeMemberDatas();
    });
    $("#multi_edit").click(function () {
        multiEditData();
    });
    $("#btn_select_dept").click(function () {
        createChart("dept");
        $("#dialog_tree_chart").dialog("open");
    });
    $("#btn_select_title").click(function () {
        createChart("jobTitle");
        $("#dialog_tree_chart").dialog("open");
    });
});


var deptArr = ["管理", "財會", "研發", "生產", "銷售"];
var titleArr = ["總經理", "協理", "經理", "部門主管", "財務", "會計", "總務", "業務", "工程師"];
var typeArr = ["一般用戶", "訪客", "管理者", "巡邏卡", "保全卡"];
var dotTypeArr = ["部門", "職稱", "用戶類型", "自訂"];
var statusArr = ["無", "在職", "已離職"];
var genderArr = ["男", "女"];
var educationArr = ["小學", "國中", "高中", "專科", "大學", "研究所"];


function UpdateMemberList() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetStaffs"]
    };
    var xmlHttp = createJsonXmlHttp("sql"); //updateMemberList
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            try {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    $("#table_member_setting tbody").empty(); //先重置表格
                    var memberArray = revObj.Values;
                    for (var i = 0; i < memberArray.length; i++) {
                        var tr_id = "tr_member_" + i;
                        var number = memberArray[i].number;
                        $("#table_member_setting tbody").append("<tr id=\"" + tr_id + "\">" +
                            "<td><input type=\"checkbox\" name=\"chkbox_members\" value=\"" + number + "\"" +
                            " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + (i + 1) + "</td>" +
                            "<td>" + memberArray[i].tag_id + "</td>" +
                            "<td>" + number + "</td>" +
                            "<td>" + memberArray[i].Name + "</td>" +
                            "<td>" + memberArray[i].department + "</td>" +
                            "<td>" + memberArray[i].jobTitle + "</td>" +
                            "<td>" + memberArray[i].type + "</td>" +
                            "<td>" + "" + "</td>" +
                            "<td>" + "" + "</td>" +
                            "<td>" + memberArray[i].note + "</td>" +
                            "<td><button class=\"btn btn-primary\"" +
                            " onclick=\"editMemberData(\'" + number + "\')\">編輯" +
                            "</button></td>" +
                            "</tr>");
                    }
                    displayBar("table_member_setting");
                }
            } catch (ignore) {
                console.warn(ignore.message);
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}



function editMemberData(number) {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetOneStaff"],
        "Value": {
            "number": number
        }
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            try {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    var revInfo = revObj.Values[0]
                    $("#main_tag_id").val(revInfo.tag_id);
                    $("#main_card_id").val(revInfo.card_id);
                    $("#main_number").val(revInfo.number);
                    $("#main_name").val(revInfo.Name);
                    $("#main_department").val(revInfo.department);
                    $("#main_jobTitle").val(revInfo.jobTitle);
                    $("#main_type").html(createOptions(typeArr, revInfo.type));
                    $("#main_picture_thumbnail").attr("href", revInfo.photo);
                    $("#main_picture_img").attr("src", revInfo.photo);
                    $("#main_select_tag_color").html(createOptions(dotTypeArr, revInfo.set_color));
                    /*
                    $("#main_input_tag_color").val();
                    $("#main_access").val();
                    $("#main_duration").val();
                    */
                    $("#basic_state").html(createOptions(statusArr, revInfo.status));
                    $("#basic_gender").html(createOptions(genderArr, revInfo.gender));
                    $("#basic_last_name").val(revInfo.lastName);
                    $("#basic_first_name").val(revInfo.firstName);
                    $("#basic_english_name").val(revInfo.EnglishName);
                    $("#basic_birthday").val(revInfo.birthday);
                    $("#basic_job_phone").val(revInfo.phoneJob);
                    $("#basic_self_phone").val(revInfo.phoneSelf);
                    $("#basic_mail").val(revInfo.mail);
                    $("#basic_address").val(revInfo.address);
                    $("#basic_highest_education").html(createOptions(educationArr, revInfo.education));
                    $("#basic_school").val(revInfo.school);
                    $("#basic_grade").val(revInfo.grade);
                    $("#basic_pro_level").val(revInfo.tech_grade);
                    $("#basic_entry_date").val(revInfo.dateEntry);
                    $("#basic_leave_date").val(revInfo.dateLeave);
                    $("#note_text").val(revInfo.note);
                    //開啟編輯框
                    setCommand("edit");
                    $("#dialog_edit_member").dialog("open");
                }
            } catch (ignore) {
                console.warn(ignore.message);
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}



function addMemberData() {
    //restore all fields
    $("#main_tag_id").val("");
    $("#main_card_id").val("");
    $("#main_number").val("");
    $("#main_name").val("");
    $("#main_department").val("");
    $("#main_jobTitle").val("");
    $("#main_type").html(createOptions(typeArr, ""));
    $("#main_picture_thumbnail").attr("href", "");
    $("#main_picture_img").attr("src", "");
    $("#main_select_tag_color").html(createOptions(dotTypeArr, ""));
    /*$("#main_input_tag_color").val("");
    $("#main_access").val();
    $("#main_duration").val();*/
    $("#basic_state").html(createOptions(statusArr, ""));
    $("#basic_gender").html(createOptions(genderArr, ""));
    $("#basic_last_name").val("");
    $("#basic_first_name").val("");
    $("#basic_english_name").val("");
    $("#basic_birthday").val("");
    $("#basic_job_phone").val("");
    $("#basic_self_phone").val("");
    $("#basic_mail").val("");
    $("#basic_address").val("");
    $("#basic_highest_education").html(createOptions(educationArr, ""));
    $("#basic_school").val("");
    $("#basic_grade").val("");
    $("#basic_pro_level").val("");
    $("#basic_entry_date").val("");
    $("#basic_leave_date").val("");
    $("#note_text").val("");
    //open member dialog
    setCommand("add");
    $("#dialog_edit_member").dialog("open");
}



function removeMemberDatas() {
    var checkboxs = document.getElementsByName("chkbox_members");
    var num_arr = [];
    for (j in checkboxs) {
        if (checkboxs[j].checked)
            num_arr.push({
                "number": checkboxs[j].value
            });
    }
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["DeleteStaff"],
        "Value": num_arr
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            try {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    UpdateMemberList();
                }
            } catch (ignore) {
                console.warn(ignore.message);
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}


function multiEditData() {
    var checkboxs = document.getElementsByName("chkbox_members");
    var num_arr = [];
    for (j in checkboxs) {
        if (checkboxs[j].checked)
            num_arr.push(checkboxs[j].value);
    }
    if (!num_arr.length) {
        alert('Please check any column');
        return;
    }
    $("#multi_edit_title").text("");
    $("#multi_edit_item").children("option:eq(0)").prop("selected", true);
    $("#multi_edit_item").change(function () {
        var item = $(this).val()
        $("#multi_edit_title").text(item);
        if (item == "department") {
            $("#multi_edit_value").html(createOptions(deptArr, ""));
        } else if (item == "jobTitle") {
            $("#multi_edit_value").html(createOptions(titleArr, ""));
        } else if (item == "type") {
            $("#multi_edit_value").html(createOptions(typeArr, ""));
        } else {
            return;
        }
    });
    $("#multi_edit_item").removeClass("ui-state-error");
    $("#multi_edit_value").removeClass("ui-state-error");
    $("#dialog_multi_edit").dialog("open");
}


function createJsonXmlHttp(url) {
    var xmlHttp = null;
    try { // Firefox, Opera 8.0+, Safari
        xmlHttp = new XMLHttpRequest();
    } catch (e) { //Internet Explorer
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    return xmlHttp;
}

function createOptions(array, select) {
    var options = "";
    select = typeof (select) != 'undefined' ? select : "";
    options += "<option value=\"\">請選擇</option>"; //增加預設的空白項
    for (i = 0; i < array.length; i++) {
        if (array[i] == select) {
            options += "<option value=\"" + array[i] + "\" selected=\"selected\">" +
                array[i] + "</option>";
        } else {
            options += "<option value=\"" + array[i] + "\">" + array[i] + "</option>";
        }
    }
    return options;
}

function getFileName(src) {
    var pos1 = src.lastIndexOf("\\");
    var pos2 = src.lastIndexOf("/");
    var pos = -1;
    if (pos1 < 0) pos = pos2;
    else pos = pos1;
    return src.substring(pos + 1);
}

function requestMemberDropdown() {
    //等等把Dropdown的ID放進來
    //在每次開啟編輯框時重新要求最新的dropdownlist
}