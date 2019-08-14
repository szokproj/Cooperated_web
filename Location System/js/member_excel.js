var datafield = ["number", "tag_id", "card_id", "Name", "lastName", "firstName", "EnglishName", "gender", "status",
    "department", "department_id", "department_color", "jobTitle", "jobTitle_id", "jobTitle_color", "type",
    "color_type", "color", "alarm_group_id", "phoneJob", "phoneSelf", "mail", "address", "education", "school",
    "grade", "tech_grade", "birthday", "dateEntry", "dateLeave", "note"
];

function arrayKeyTranslate(array) {
    var resultArray = [];

    //input translation title row
    resultArray.push({
        "number": $.i18n.prop("i_number"),
        "tag_id": $.i18n.prop("i_tagID"),
        "card_id": $.i18n.prop("i_cardID"),
        "Name": $.i18n.prop("i_name"),
        "lastName": $.i18n.prop("i_lastName"),
        "firstName": $.i18n.prop("i_firstName"),
        "EnglishName": $.i18n.prop("i_englishName"),
        "gender": $.i18n.prop("i_gender"),
        "status": $.i18n.prop("i_workState"),
        "department": $.i18n.prop("i_dept"),
        "department_id": $.i18n.prop("i_departmentID"),
        "department_color": $.i18n.prop("i_departmentColor"),
        "jobTitle": $.i18n.prop("i_jobTitle"),
        "jobTitle_id": $.i18n.prop("i_jobTitleID"),
        "jobTitle_color": $.i18n.prop("i_jobTitleColor"),
        "type": $.i18n.prop("i_userType"),
        "color_type": $.i18n.prop("i_drawType"),
        "color": $.i18n.prop("i_assignColor"),
        "alarm_group_id": $.i18n.prop("i_alarmGroup"),
        "phoneJob": $.i18n.prop("i_jobPhone"),
        "phoneSelf": $.i18n.prop("i_selfPhone"),
        "mail": $.i18n.prop("i_eMail"),
        "address": $.i18n.prop("i_address"),
        "education": $.i18n.prop("i_education"),
        "school": $.i18n.prop("i_school"),
        "grade": $.i18n.prop("i_grade"),
        "tech_grade": $.i18n.prop("i_proLevel"),
        "birthday": $.i18n.prop("i_birthday"),
        "dateEntry": $.i18n.prop("i_entryDate"),
        "dateLeave": $.i18n.prop("i_leaveDate"),
        "note": $.i18n.prop("i_note")
    });

    //input data rows
    array.forEach(value => {
        var obj = {};
        datafield.forEach(key => {
            obj[key] = value[key];
        });
        resultArray.push(obj);
    });
    return resultArray;
}


function excelImportTable(jsonData) {
    if (jsonData) {
        var coverArr = [];
        var addArr = [];
        var allCover = false;
        var allDelete = false;
        var isStop = false;
        var update_delay = 0;
        var getXmlHttp = createJsonXmlHttp("sql"); //getMemberList
        getXmlHttp.onreadystatechange = function () {
            if (getXmlHttp.readyState == 4 || getXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    var memberArray = 'Values' in revObj == true ? revObj.Values : [];
                    var dataArray = JSON.parse(jsonData);
                    dataArray.forEach(function (element, index) {
                        if (index == 0 || isStop || !element.number)
                            return;
                        var repeat = memberArray.findIndex(function (info) {
                            return info.number == element.number;
                        });
                        if (repeat > -1) {
                            if (allCover) {
                                coverArr.push(element);
                                update_delay++;
                            } else if (!allDelete) {
                                if (confirm("導入的工號: " + element.number + " 已存在，是否覆蓋(相同工號只能有一筆資料)?")) {
                                    if (confirm("其餘重複的工號是否也採取覆蓋?"))
                                        allCover = true;
                                    coverArr.push(element);
                                } else {
                                    if (confirm("是否略過，不導入(相同工號只能有一筆資料)?")) {
                                        if (confirm("其餘重複的工號是否也採取略過?"))
                                            allDelete = true;
                                    } else {
                                        isStop = true;
                                        if (!confirm("是否取消導入Excel資料?"))
                                            alert("相同工號只能有一筆資料，仍有重覆工號未選擇處理方式，導入失敗，請重新導入Excel!");
                                    }
                                }
                            }
                        } else if (element.number != "") {
                            addArr.push(element);
                            update_delay++;
                        }
                    });

                    if (!isStop) {
                        var delay = 0;
                        if (addArr.length > 0) {
                            addArr.forEach(element => {
                                delay++;
                                setTimeout(function () {
                                    sendMemberData("AddStaff", element);
                                }, 100 * delay);
                            });
                        }
                        if (coverArr.length > 0) {
                            coverArr.forEach(element => {
                                delay++;
                                setTimeout(function () {
                                    sendMemberData("EditStaff", element);
                                }, 100 * delay);
                            });
                        }
                        setTimeout(function () {
                            UpdateMemberList();
                        }, 100 * (update_delay + 1));
                    }
                } else {
                    alert($.i18n.prop('i_alertError_1'));
                }

            }
        };
        getXmlHttp.send(JSON.stringify({
            "Command_Type": ["Read"],
            "Command_Name": ["GetStaffs"]
        }));
    }
}

function checkExist(object, key) {
    return key in object ? object[key].toString() : "";
}

function fullOf8Byte(tag_id) {
    var length = tag_id.length;
    if (length > 0 && length < 17) {
        for (i = 0; i < 16 - length; i++) {
            tag_id = "0" + tag_id;
        }
        return tag_id;
    } else {
        return "";
    }
}

function sendMemberData(operate, element) {
    var request = {
        "Command_Type": ["Write"],
        "Command_Name": [operate],
        "Value": [{
            "number": checkExist(element, "number"),
            "tag_id": fullOf8Byte(checkExist(element, "tag_id")),
            "card_id": checkExist(element, "card_id"),
            "Name": checkExist(element, "Name"),
            "lastName": checkExist(element, "lastName"),
            "firstName": checkExist(element, "firstName"),
            "EnglishName": checkExist(element, "EnglishName"),
            "gender": checkExist(element, "gender"),
            "status": checkExist(element, "status"),
            "department_id": checkExist(element, "department_id"),
            "jobTitle_id": checkExist(element, "jobTitle_id"),
            "type": checkExist(element, "type"),
            "color_type": checkExist(element, "color_type"),
            "color": checkExist(element, "color"),
            "alarm_group_id": checkExist(element, "alarm_group_id"),
            "phoneJob": checkExist(element, "phoneJob"),
            "phoneSelf": checkExist(element, "phoneSelf"),
            "mail": checkExist(element, "mail"),
            "address": checkExist(element, "address"),
            "education": checkExist(element, "education"),
            "school": checkExist(element, "school"),
            "grade": checkExist(element, "grade"),
            "tech_grade": checkExist(element, "tech_grade"),
            "birthday": checkExist(element, "birthday"),
            "dateEntry": checkExist(element, "dateEntry"),
            "dateLeave": checkExist(element, "dateLeave"),
            "note": checkExist(element, "note"),
            "photo": "",
            "file_ext": "",
            "exist": "1"
        }]
    };
    var xmlHttp = createJsonXmlHttp('sql');
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj && revObj.success > 0) {
                if (operate == "AddStaff")
                    alert("新增工號 : " + checkExist(element, "number") + " 的人員資料成功");
                else
                    alert("修改工號 : " + checkExist(element, "number") + " 的人員資料成功");
            } else {
                if (operate == "AddStaff")
                    //alert($.i18n.prop('i_alertError_3'));
                    alert("新增工號 : " + checkExist(element, "number") + " 的人員資料失敗");
                else
                    //alert($.i18n.prop('i_alertError_11'));
                    alert("修改工號 : " + checkExist(element, "number") + " 的人員資料失敗");
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}