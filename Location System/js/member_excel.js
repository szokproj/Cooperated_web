function arrayKeyTranslate(array) {
    var translation = {
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
    };
    var resultArray = [];
    array.forEach(value => {
        var obj = {};
        kEY.forEach(key => {
            obj[translation[key]] = value[key];
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
        var getXmlHttp = createJsonXmlHttp("sql"); //getMemberList
        getXmlHttp.onreadystatechange = function () {
            if (getXmlHttp.readyState == 4 || getXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    var memberArray = 'Values' in revObj == true ? revObj.Values : [];
                    var dataArray = JSON.parse(jsonData);
                    dataArray.forEach(element => {
                        if (isStop || !element)
                            return;
                        var number = Object.values(element)[0];
                        //list.map(item => Object.values(item)[0]); 
                        //0表示第一個屬性值, 用Object中的屬性順序查找，順序與KEY陣列的一致
                        var repeat = memberArray.findIndex(function (info) {
                            return info.number == number;
                        });
                        if (repeat > -1) {
                            if (allCover)
                                coverArr.push(element);
                            else if (!allDelete) {
                                if (confirm("導入的工號: " + number + " 已存在，是否覆蓋(相同工號只能有一筆資料)?")) {
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
                        } else if (number != "")
                            addArr.push(element);
                    });

                    if (!isStop) {
                        var count = 0;
                        if (addArr.length > 0) {
                            addArr.forEach(element => {
                                count++;
                                setTimeout(function () {
                                    sendMemberData("AddStaff", element);
                                }, 100 * count);
                            });
                        }
                        if (coverArr.length > 0) {
                            coverArr.forEach(element => {
                                count++;
                                setTimeout(function () {
                                    sendMemberData("EditStaff", element);
                                }, 100 * count);
                            });
                        }
                        UpdateMemberList();
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

function checkExist(object, num) {
    return typeof Object.values(object)[num] != 'undefined' ? Object.values(object)[num] : ""
}

function sendMemberData(operate, element) {
    var request = {
        "Command_Type": ["Write"],
        "Command_Name": [operate],
        "Value": [{
            "number": checkExist(element, 0),
            "tag_id": checkExist(element, 1),
            "card_id": checkExist(element, 2),
            "Name": checkExist(element, 3),
            "lastName": checkExist(element, 4),
            "firstName": checkExist(element, 5),
            "EnglishName": checkExist(element, 6),
            "gender": checkExist(element, 7),
            "status": checkExist(element, 8),
            "department": checkExist(element, 9),
            "department_id": checkExist(element, 10),
            "department_color": checkExist(element, 11),
            "jobTitle": checkExist(element, 12),
            "jobTitle_id": checkExist(element, 13),
            "jobTitle_color": checkExist(element, 14),
            "type": checkExist(element, 15),
            "color_type": checkExist(element, 16),
            "color": checkExist(element, 17),
            "alarm_group_id": checkExist(element, 18),
            "phoneJob": checkExist(element, 19),
            "phoneSelf": checkExist(element, 20),
            "mail": checkExist(element, 21),
            "address": checkExist(element, 22),
            "education": checkExist(element, 23),
            "school": checkExist(element, 24),
            "grade": checkExist(element, 25),
            "tech_grade": checkExist(element, 26),
            "birthday": checkExist(element, 27),
            "dateEntry": checkExist(element, 28),
            "dateLeave": checkExist(element, 29),
            "note": checkExist(element, 30),
            "photo": "",
            "file_ext": "",
            "exist": "1"
        }]
    };
    var xmlHttp = createJsonXmlHttp('sql');
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success == 0)
                alert($.i18n.prop('i_alertError_3'));
        }
    };
    xmlHttp.send(JSON.stringify(request));
}