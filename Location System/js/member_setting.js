var default_color = '#2eb82e';
var memberArray = [];
var deptColorArray = [];
var titleColorArray = [];
var userTypeColorArray = [];
var userTypeArr = [];
var alarmGroupArr = [];
var dotTypeArr = ['Dept', 'JobTitle', 'UserType', 'Custom'];
var statusArr = ['OnJob', 'LeaveJob'];
var genderArr = ['Male', 'Female'];
var educationArr = ['PrimarySchool', 'MiddleSchool', 'HighSchool', 'JuniorSchool', 'College', 'GraduateSchool'];


$(function () {
    /**
     * Check this page's permission and load navbar
     */
    var permission = getPermissionOfPage("Member_Setting");
    switch (permission) {
        case "":
            alert("No permission");
            history.back();
            break;
        case "R":
            $("#add_col").attr("disabled", true);
            $("#delete_col").attr("disabled", true);
            $("#multi_edit").attr("disabled", true);

            //$("#excel_import").attr("disabled", true);
            break;
        case "RW":
            break;
        default:
            alert("網頁錯誤，將跳回上一頁");
            history.back();
            break;
    }
    setNavBar("Member_Setting", "Member_Setting");

    $("#loading").css("height", document.documentElement.clientHeight + "px");
    setTimeout(function () {
        $("#loading").hide();
    }, 500);

    /**
     * this page's js start
     */
    UpdateMemberList();
    //Set deptColorArray
    var deptXmlHttp = createJsonXmlHttp('sql');
    deptXmlHttp.onreadystatechange = function () {
        if (deptXmlHttp.readyState == 4 || deptXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                for (i = 0; i < revObj.Values.length; i++)
                    deptColorArray.push(revObj.Values[i]);
            }
        }
    };
    deptXmlHttp.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetDepartment_relation_list"]
    }));
    //Set titleColorArray
    var titleXmlHttp = createJsonXmlHttp('sql');
    titleXmlHttp.onreadystatechange = function () {
        if (titleXmlHttp.readyState == 4 || titleXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                for (i = 0; i < revObj.Values.length; i++)
                    titleColorArray.push(revObj.Values[i]);
            }
        }
    };
    titleXmlHttp.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetJobTitle_relation_list"]
    }));
    //Set userTypeColorArray and userTypeArr
    var userTypeXmlHttp = createJsonXmlHttp('sql');
    userTypeXmlHttp.onreadystatechange = function () {
        if (userTypeXmlHttp.readyState == 4 || userTypeXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                for (i = 0; i < revObj.Values.length; i++) {
                    userTypeColorArray.push(revObj.Values[i]);
                    userTypeArr.push(revObj.Values[i].type);
                }
            }
        }
    };
    userTypeXmlHttp.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetUserTypes"]
    }));
    $("#selectAll").change(function () {
        var checks = document.getElementsByName("chkbox_members");
        if ($(this).prop("checked")) {
            $("input[name='chkbox_members']").prop("checked", true);
            for (i in checks)
                $("#tr_member_" + i).addClass("changeBgColor");
        } else {
            $("input[name='chkbox_members']").prop("checked", false);
            for (i in checks)
                $("#tr_member_" + i).removeClass("changeBgColor");
        }
    });
    $("#main_type").change(function () {
        var type = typeof ($(this).val()) != 'undefined' ? $(this).val() : "";
        var index = $("#main_select_tag_color").children('option:selected').index();
        if (index == 3 && type != "") {
            userTypeColorArray.forEach(v => {
                if (v.type == type) {
                    $("#main_input_tag_color").val(colorToHex(v.color));
                    $("#main_display_color").css("background-color", colorToHex(v.color));
                }
            });
        }
    });
    $("#main_picture_upload").unbind();
    $("#main_picture_upload").change(function () {
        var file = this.files[0];
        var valid = checkExt(this.value);
        //console.log(file.size / 1024);
        valid = valid && checkImageSize(file); //" KB"
        if (valid)
            transBase64(file);
    });
    $("#main_picture_clear").click(function () {
        $("#main_picture_img").attr('src', '');
    });
    $("#add_col").click(addMemberData);
    $("#delete_col").click(removeMemberDatas);
    $("#multi_edit").click(multiEditData);
    $("#btn_select_dept").click(function () {
        createChart("dept");
        $("#select_node_title").text($.i18n.prop('i_selectDept') + ' : ');
        $("#dialog_tree_chart").dialog("open");
    });
    $("#btn_select_title").click(function () {
        createChart("jobTitle");
        $("#select_node_title").text($.i18n.prop('i_selectJobtitle') + ' : ');
        $("#dialog_tree_chart").dialog("open");
    });
    $("#excel_import").change(function () {
        var permission = getPermissionOfPage("Member_Setting");
        if (permission == "RW") {
            importf(this);
        } else {
            alert("No write permission!")
        }
    });
    $("#excel_export").click(function () {
        var array = arrayKeyTranslate(memberArray);
        $("#dvjson").excelexportjs({
            containerid: "dvjson",
            datatype: 'json',
            dataset: array,
            columns: getColumns(array),
            fileName: "RTLS.xls",
            worksheetName: "Member Data"
        });
    });
    var lang = getCookie("userLanguage");
    $("#excel_example").click(function () {
        link = document.getElementById("excel_export_download");
        if (lang == "en") {
            link.download = "RTLS_Example_EN.xls";
            link.href = "../excel/RTLS_Example_EN.xls";
        } else if (lang == "zh-TW") {
            link.download = "RTLS_Example_TW.xls";
            link.href = "../excel/RTLS_Example_TW.xls";
        } else if (lang == "zh-CN") {
            link.download = "RTLS_Example_CN.xls";
            link.href = "../excel/RTLS_Example_CN.xls";
        } else {
            link.download = "RTLS_Example_EN.xls";
            link.href = "../excel/RTLS_Example_EN.xls";
        }
        link.click();
    });
});


function UpdateMemberList() {
    var getAlarmGroupReq = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAlarmGroup_list"]
    };
    var getXmlHttp = createJsonXmlHttp("sql");
    getXmlHttp.onreadystatechange = function () {
        if (getXmlHttp.readyState == 4 || getXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var revList = revObj.Values;
            if (revObj.success > 0 && revList) {
                alarmGroupArr = [];
                revList.forEach(element => {
                    alarmGroupArr.push({
                        id: element.alarm_gid,
                        name: element.alarm_group_name
                    });
                });
                var request = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["GetStaffs"]
                };
                var xmlHttp = createJsonXmlHttp("sql"); //updateMemberList
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (revObj.success > 0) {
                            $("#table_member_setting tbody").empty(); //先重置表格
                            //var memberArray = revObj.Values;
                            memberArray = revObj.Values.slice(0);
                            if (memberArray) {
                                for (var i = 0; i < memberArray.length; i++) {
                                    var tr_id = "tr_member_" + i;
                                    var user_id = parseInt(memberArray[i].tag_id.substring(8), 16);
                                    var number = memberArray[i].number;
                                    var alarm_index = alarmGroupArr.findIndex(function (array) {
                                        return array.id == memberArray[i].alarm_group_id;
                                    });
                                    var alarm_group_name = alarm_index > -1 ? alarmGroupArr[alarm_index].name : "";
                                    $("#table_member_setting tbody").append("<tr id=\"" + tr_id + "\">" +
                                        "<td><input type=\"checkbox\" name=\"chkbox_members\" value=\"" + number +
                                        "\" onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + (i + 1) + "</td>" +
                                        "<td>" + number + "</td>" +
                                        "<td>" + user_id + "</td>" +
                                        "<td>" + memberArray[i].Name + "</td>" +
                                        "<td>" + memberArray[i].department + "</td>" +
                                        "<td>" + memberArray[i].jobTitle + "</td>" +
                                        "<td>" + memberArray[i].type + "</td>" +
                                        "<td>" + alarm_group_name + "</td>" +
                                        "<td>" + memberArray[i].note + "</td>" +
                                        "<td><button class=\"btn btn-primary\"" +
                                        " onclick=\"editMemberData(\'" + number + "\')\">" + $.i18n.prop('i_edit') +
                                        "</button></td>" +
                                        "</tr>");
                                }
                                displayBar("table_member_setting");
                            }
                        } else {
                            alert($.i18n.prop('i_alertError_1'));
                        }
                    }
                };
                xmlHttp.send(JSON.stringify(request));
            }
        }
    };
    getXmlHttp.send(JSON.stringify(getAlarmGroupReq));
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
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var revInfo = revObj.Values[0];
                $("#main_tid_id").val(parseInt(revInfo.tag_id.substring(0, 8), 16));
                $("#main_user_id").val(parseInt(revInfo.tag_id.substring(8), 16));
                $("#main_card_id").val(revInfo.card_id);
                $("#main_number").val(revInfo.number);
                $("#main_name").val(revInfo.Name);
                $("#main_department").val(revInfo.department);
                $("#hidden_department").val(revInfo.department_id);
                $("#main_jobTitle").val(revInfo.jobTitle);
                $("#hidden_jobTitle").val(revInfo.jobTitle_id);
                $("#main_type").html(createOptions(userTypeArr, revInfo.type));
                if (revInfo.file_ext == "" || revInfo.photo == "") {
                    adjustImageSize("");
                } else {
                    var src = "data:image/" + revInfo.file_ext + ";base64," + revInfo.photo;
                    adjustImageSize(src);
                }
                $("#main_select_tag_color").html(createI18nOptions(dotTypeArr, revInfo.color_type));
                selectTagColor(); //依照畫點依據的內容代入已設定的顏色，未設定則採用預設顏色
                var color_type_index = $("#main_select_tag_color").children('option:selected').index();
                if (color_type_index == 4) { //自訂
                    $("#main_input_tag_color").val(colorToHex(revInfo.color));
                    $("#main_input_tag_color").css("background-color", colorToHex(revInfo.color));
                }
                $("#main_alarm_group").html(displayNameOptions(alarmGroupArr, revInfo.alarm_group_id));
                $("#basic_state").html(createI18nOptions(statusArr, revInfo.status));
                $("#basic_gender").html(createI18nOptions(genderArr, revInfo.gender));
                $("#basic_last_name").val(revInfo.lastName);
                $("#basic_first_name").val(revInfo.firstName);
                $("#basic_english_name").val(revInfo.EnglishName);
                $("#basic_birthday").val(revInfo.birthday);
                $("#basic_job_phone").val(revInfo.phoneJob);
                $("#basic_self_phone").val(revInfo.phoneSelf);
                $("#basic_mail").val(revInfo.mail);
                $("#basic_address").val(revInfo.address);
                $("#basic_highest_education").html(createI18nOptions(educationArr, revInfo.education));
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
        }
    };
    xmlHttp.send(JSON.stringify(request));
}


/*function getOneMemberPhoto(number) {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetOneStaffPhoto"],
        "Value": {
            "number": number
        }
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var revInfo = revObj.Values[0]
                //$("#main_picture_thumbnail").attr("href", "data:image/png;base64," + revInfo.photo);
                $("#main_picture_img").attr("src", "data:image/png;base64," + revInfo.photo);
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}*/

function transBase64(file) {
    if (file) { //file transform base64
        var FR = new FileReader();
        FR.readAsDataURL(file);
        FR.onloadend = function (e) {
            var base64data = e.target.result;
            adjustImageSize(base64data);
        };
    }
}

function checkExt(fileName) {
    var validExts = new Array(".png", ".jpg", ".jpeg"); // 可接受的副檔名
    var fileExt = fileName.substring(fileName.lastIndexOf('.'));
    if (validExts.indexOf(fileExt) < 0) {
        alert($.i18n.prop('i_fileError_2') + validExts.toString());
        return false;
    } else
        return true;
}

function checkImageSize(file) {
    if (file.size / 1024 > 100) {
        alert($.i18n.prop('i_fileError_3'));
        return false;
    } else
        return true;
}

// 使用FileReader讀取檔案，並且回傳Base64編碼後的source
function convertTobase64(file) {
    return new Promise((resolve, reject) => {
        // 建立FileReader物件
        var reader = new FileReader();
        // 註冊onload事件，取得result則resolve (會是一個Base64字串)
        reader.onload = () => {
            resolve(reader.result);
        }
        // 註冊onerror事件，若發生error則reject
        reader.onerror = () => {
            reject(reader.error);
        }
        // 讀取檔案
        reader.readAsDataURL(file);
    });
}

function adjustImageSize(src) {
    var thumb_width = $("#main_picture_block").css('max-width');
    var thumb_height = $("#main_picture_block").css('max-height');
    if (src.length > 0) {
        var img = new Image();
        img.src = src;
        img.onload = function () {
            var thumbSize = thumb_width / thumb_height;
            var imgSize = img.width / img.height;
            if (imgSize > thumbSize) { //原圖比例寬邊較長
                $("#main_picture_img").attr('src', src);
                $("#main_picture_img").width(thumb_width).height(img.height * (thumb_width / img.width));
            } else {
                $("#main_picture_img").attr('src', src);
                $("#main_picture_img").width(img.width * (thumb_height / img.height)).height(thumb_height);
            }
        }
    } else {
        $("#main_picture_img").attr('src', '');
        $("#main_picture_img").width(thumb_width).height(thumb_height);
    }
}


function addMemberData() {
    //restore all fields
    $("#main_tid_id").val("");
    $("#main_user_id").val("");
    $("#main_card_id").val("");
    $("#main_number").val("");
    $("#main_name").val("");
    $("#main_department").val("");
    $("#hidden_department").val("");
    $("#main_jobTitle").val("");
    $("#hidden_jobTitle").val("");
    $("#main_type").html(createOptions(userTypeArr, ""));
    $("#main_picture_thumbnail").attr("href", "");
    $("#main_picture_img").attr("src", "");
    $("#main_select_tag_color").html(createI18nOptions(dotTypeArr, ""));
    //還原為預設顏色
    $("#main_input_tag_color").val(default_color);
    $("#main_input_tag_color").attr("type", "hidden"); //隱藏可選顏色
    $("#main_input_tag_color").css("background-color", default_color);
    $("#main_display_color").attr("type", "text"); //顯示不可選顏色
    $("#main_display_color").css("background-color", default_color);
    $("#main_alarm_group").html(displayNameOptions(alarmGroupArr, ""));
    $("#basic_state").html(createI18nOptions(statusArr, ""));
    $("#basic_gender").html(createI18nOptions(genderArr, ""));
    $("#basic_last_name").val("");
    $("#basic_first_name").val("");
    $("#basic_english_name").val("");
    $("#basic_birthday").val("");
    $("#basic_job_phone").val("");
    $("#basic_self_phone").val("");
    $("#basic_mail").val("");
    $("#basic_address").val("");
    $("#basic_highest_education").html(createI18nOptions(educationArr, ""));
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
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                UpdateMemberList();
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
        alert($.i18n.prop('i_alertError_2'));
        return;
    }
    $("#multi_edit_title").text("");
    $("#multi_edit_item").children("option:eq(0)").prop("selected", true);
    $("#multi_edit_value").html("");
    $("#multi_edit_item").change(function () {
        var item = $(this).val();
        $("#multi_edit_title").text(item);
        if (item == "department") {
            var request = {
                "Command_Type": ["Read"],
                "Command_Name": ["GetDepartment_relation_list"]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        var deptArr = [];
                        var revInfo = 'Values' in revObj == true ? revObj.Values : [];
                        revInfo.forEach(element => {
                            deptArr.push({
                                id: element.c_id,
                                name: element.children
                            });
                        });
                        $("#multi_edit_value").html(displayNameOptions(deptArr, deptArr[0].id));
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
        } else if (item == "jobTitle") {
            var request = {
                "Command_Type": ["Read"],
                "Command_Name": ["GetJobTitle_relation_list"]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        var titleArr = [];
                        var revInfo = 'Values' in revObj == true ? revObj.Values : [];
                        revInfo.forEach(element => {
                            titleArr.push({
                                id: element.c_id,
                                name: element.children
                            });
                        });
                        $("#multi_edit_value").html(displayNameOptions(titleArr, titleArr[0].id));
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
        } else if (item == "type") {
            var request = {
                "Command_Type": ["Read"],
                "Command_Name": ["GetUserTypes"]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        var typeArr = [];
                        var revInfo = 'Values' in revObj == true ? revObj.Values : [];
                        revInfo.forEach(element => {
                            typeArr.push(element.type);
                        });
                        $("#multi_edit_value").html(createOptions(typeArr, typeArr[0]));
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
        } else {
            return;
        }
    });
    $("#multi_edit_item").removeClass("ui-state-error");
    $("#multi_edit_value").removeClass("ui-state-error");
    $("#dialog_multi_edit").dialog("open");
}

function createI18nOptions(array, select) {
    var options = "";
    select = typeof (select) != 'undefined' ? select : "";
    options += "<option value=\"\">" + $.i18n.prop('i_select') + "</option>"; //增加預設的空白項
    for (i = 0; i < array.length; i++) {
        var i18n_value = $.i18n.prop(array[i]);
        if (array[i] == select) {
            options += "<option value=\"" + array[i] + "\" selected=\"selected\">" + i18n_value + "</option>";
        } else {
            options += "<option value=\"" + array[i] + "\">" + i18n_value + "</option>";
        }
    }
    return options;
}


function createOptions(array, select) {
    var options = "";
    select = typeof (select) != 'undefined' ? select : "";
    options += "<option value=\"\">" + $.i18n.prop('i_select') + "</option>";
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

function displayNameOptions(array, select_id) {
    var options = "";
    array.forEach(element => {
        if (element.id == select_id) {
            options += "<option value=\"" + element.id + "\" selected=\"selected\">" +
                element.name + "</option>";
        } else {
            options += "<option value=\"" + element.id + "\">" + element.name + "</option>";
        }
    });
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