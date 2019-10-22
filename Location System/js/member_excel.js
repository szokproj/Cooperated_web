var token = "";
var datafield = ["number", "tag_id", "card_id", "Name", "lastName", "firstName", "EnglishName", "gender", "status",
    "department", "department_id", "department_color", "jobTitle", "jobTitle_id", "jobTitle_color", "type",
    "color_type", "color", "alarm_group_id", "phoneJob", "phoneSelf", "mail", "address", "education", "school",
    "grade", "tech_grade", "birthday", "dateEntry", "dateLeave", "note"
];

$(function () {
    token = getUser() ? getUser().api_token : "";
});

function arrayKeyTranslate(array) {
    var resultArray = [];

    //input translation title row
    resultArray.push({
        "number": $.i18n.prop("i_number"),
        "tid_id": $.i18n.prop("i_tidID"),
        "user_id": $.i18n.prop("i_userID"),
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
            if (key == "tag_id") {
                obj["tid_id"] = parseInt(value[key].substring(0, 8), 16);
                obj["user_id"] = parseInt(value[key].substring(8), 16);
            } else {
                obj[key] = value[key];
            }
        });
        resultArray.push(obj);
    });
    return resultArray;
}


function excelImportTable(jsonData) {
    if (jsonData) {
        var coverArr = [];
        var addArr = [];
        var overwriteArr = []
        var successNumber = {
            add: [],
            edit: []
        }
        var submitNumber = [];
        var submitCount = 0;
        var allCover = false;
        var allDelete = false;
        var isStop = false;
        var update_delay = 0;
        var getXmlHttp = createJsonXmlHttp("sql"); //getMemberList
        getXmlHttp.onreadystatechange = function () {
            if (getXmlHttp.readyState == 4 || getXmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    /*if (!revObj.Value[0].Values)
                        return;
                        var memberArray =[];
                    revObj.Value[0].Values.forEach(element=>{
                        var obj
                        datafield.forEach(key => {
                            if (key == "tag_id") {
                                obj["tid_id"] = parseInt(value[key].substring(0, 8), 16);
                                obj["user_id"] = parseInt(value[key].substring(8), 16);
                            } else {
                                obj[key] = value[key];
                            }
                        });
                        memberArray.push("")
                    })*/
                    var memberArray = revObj.Value[0].Values || [];
                    var dataArray = JSON.parse(jsonData) || [];
                    dataArray.forEach(function (element, index) {
                        if (index == 0 || isStop || !element.number)
                            return;
                        var repeat_number = memberArray.findIndex(function (info) {
                            return info.number == element.number;
                        });
                        var repeat_tagid = memberArray.findIndex(function (info) {
                            return parseInt(info.tag_id.substring(8), 16) == element.user_id;
                        });
                        if (repeat_number > -1) { //工號重複
                            if (allDelete) return; //全部略過 
                            if (allCover) { //全部覆蓋
                                question(repeat_number, repeat_tagid, element);
                            } else { //不全部覆蓋(一筆筆詢問)
                                if (confirm($.i18n.prop('i_confirm_2') + element.number + $.i18n.prop('i_confirm_3'))) {
                                    if (confirm($.i18n.prop('i_confirm_4')))
                                        allCover = true;
                                    question(repeat_number, repeat_tagid, element);
                                } else {
                                    if (confirm($.i18n.prop('i_confirm_5'))) {
                                        if (confirm($.i18n.prop('i_confirm_6')))
                                            allDelete = true;
                                    } else {
                                        question(repeat_number, repeat_tagid, element);
                                    }
                                }
                            }
                        } else if (element.number != "") {
                            if (repeat_tagid > -1) {
                                if (confirm($.i18n.prop('i_confirm_9') + element.number + $.i18n.prop('i_confirm_10'))) {
                                    overwriteArr.push({
                                        "number": memberArray[repeat_tagid].number
                                    });
                                    addArr.push(element);
                                    update_delay++;
                                }
                            } else {
                                addArr.push(element);
                                update_delay++;
                            }
                        }
                    });

                    if (!isStop) {
                        var delay = 0;
                        if (overwriteArr.length > 0) {
                            delay++;
                            deleteMemberData(overwriteArr);
                        }
                        if (addArr.length > 0) {
                            successNumber.add = [];
                            addArr.forEach(element => {
                                delay++;
                                setTimeout(function () {
                                    sendMemberData("AddStaff", element);
                                }, 100 * delay);
                            });
                        }
                        if (coverArr.length > 0) {
                            successNumber.edit = [];
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
            "Command_Name": ["GetStaffs"],
            "api_token": [token]
        }));
    }

    function question(repeat_index1, repeat_index2, data) {
        if (repeat_index2 > -1) {
            if (repeat_index2 == repeat_index1) {
                //工號且使用者編號皆重複==>可覆蓋重複工號者
                coverArr.push(data);
                update_delay++;
            } else {
                //工號重複但使用者編號與其他已存在的人員重複==>必須略過
                if (confirm($.i18n.prop('I_confirm_11') + data.number + $.i18n.prop('I_confirm_12'))) {
                    if (confirm($.i18n.prop('i_confirm_6')))
                        allDelete = true;
                } else {
                    if (confirm($.i18n.prop('I_confirm_13')))
                        isStop = true;
                    else
                        question(repeat_index1, repeat_index2, data);
                }
            }
        } else {
            //工號重複但使用者編號都沒有重複==>可覆蓋重複工號者
            coverArr.push(data);
            update_delay++;
        }
    }

    function sendMemberData(operate, element) {
        var number = checkExist(element, "number");
        var tag_id = fullOf4Byte(checkExist(element, "tid_id")) + fullOf4Byte(checkExist(element, "user_id"));
        var request = {
            "Command_Type": ["Write"],
            "Command_Name": [operate],
            "Value": [{
                "number": number,
                "tag_id": tag_id,
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
            }],
            "api_token": [token]
        };
        var xmlHttp = createJsonXmlHttp('sql');
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    submitNumber.splice(submitNumber.indexOf(number), 1);
                    if (operate == "AddStaff")
                        successNumber.add.push(number);
                    else
                        successNumber.edit.push(number);
                }
                if (submitCount >= (addArr.length + coverArr.length)) {
                    var successConut = successNumber.add.length + successNumber.edit.length;
                    var result = $.i18n.prop('i_importSuccessNum') + successConut;

                    result += (successConut > 0) ? ", \n" + $.i18n.prop('i_importSuccessJobNumber') +
                        successNumber.add.concat(successNumber.edit) : "";

                    result += "\n" + $.i18n.prop('i_importFailedNum') + submitNumber.length;

                    result += (submitNumber.length > 0) ? ", \n" + $.i18n.prop('i_importFailedJobNumber') + submitNumber : "";

                    alert(result);
                }
            }
        };
        xmlHttp.send(JSON.stringify(request));
        submitNumber.push(number);
        submitCount++;
    }
}

function deleteMemberData(number_array) {
    var request = {
        "Command_Type": ["Write"],
        "Command_Name": ["DeleteStaff"],
        "Value": number_array,
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp('sql');
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function checkExist(object, key) {
    return key in object ? object[key].toString() : "";
}

function fullOf4Byte(id) {
    id = parseInt(id).toString(16).toUpperCase();
    var length = id.length;
    if (length > 0 && length < 9) {
        for (i = 0; i < 8 - length; i++) {
            id = "0" + id;
        }
        return id;
    } else {
        return "";
    }
}