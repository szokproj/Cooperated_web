$(function () {
    var dialog, form;
    dialog = $("#dialog_repeat_question").dialog({
        autoOpen: false,
        height: 170,
        width: 350,
        modal: true,
        buttons: {
            Cancel: function () {
                coverArr = [];
                addArr = [];
                allCover = false;
                allDelete = false;
                form[0].reset();
                allFields.removeClass("ui-state-error");
                dialog.dialog("close");
            }
        },
        close: function () {
            coverArr = [];
            addArr = [];
            allCover = false;
            allDelete = false;
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
    });
});

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
                        if (isStop || !element.number)
                            return;
                        var repeat = memberArray.findIndex(function (info) {
                            return info.number == element.number;
                        });
                        if (repeat > -1) {
                            if (allCover)
                                coverArr.push(element);
                            else if (!allDelete) {
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
                        } else if (element.number != "")
                            addArr.push(element);
                    });

                    if (!isStop) {
                        if (addArr.length > 0) {
                            addArr.forEach(element => {
                                setTimeout(function () {
                                    sendMemberData("AddStaff", element);
                                }, 10);
                                //sendMemberData("AddStaff", element);
                            });
                        }
                        if (coverArr.length > 0) {
                            coverArr.forEach(element => {
                                setTimeout(function () {
                                    sendMemberData("EditStaff", element);
                                }, 10);
                                //sendMemberData("EditStaff", element);
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

function checkExist(object, key) {
    return key in object == true ? object[key] : ""
}

function sendMemberData(operate, element) {
    var xmlHttp = createJsonXmlHttp('sql');
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success == 0)
                alert($.i18n.prop('i_alertError_3'));
        }
    };
    xmlHttp.send(JSON.stringify({
        "Command_Type": ["Write"],
        "Command_Name": [operate],
        "Value": [{
            "number": checkExist(element, "number"),
            "tag_id": checkExist(element, "tag_id"),
            "card_id": checkExist(element, "card_id"),
            "Name": checkExist(element, "Name"),
            "department_id": checkExist(element, "department_id"),
            "jobTitle_id": checkExist(element, "jobTitle_id"),
            "type": checkExist(element, "type"),
            "photo": checkExist(element, "photo"),
            "file_ext": checkExist(element, "file_ext"),
            "color_type": checkExist(element, "color_type"),
            "color": checkExist(element, "color"),
            "alarm_group_id": checkExist(element, "alarm_group_id"),
            "status": checkExist(element, "status"),
            "gender": checkExist(element, "gender"),
            "lastName": checkExist(element, "lastName"),
            "firstName": checkExist(element, "firstName"),
            "EnglishName": checkExist(element, "EnglishName"),
            "birthday": checkExist(element, "birthday"),
            "phoneJob": checkExist(element, "phoneJob"),
            "phoneSelf": checkExist(element, "phoneSelf"),
            "mail": checkExist(element, "mail"),
            "address": checkExist(element, "address"),
            "education": checkExist(element, "education"),
            "school": checkExist(element, "school"),
            "grade": checkExist(element, "grade"),
            "tech_grade": checkExist(element, "tech_grade"),
            "dateEntry": checkExist(element, "dateEntry"),
            "dateLeave": checkExist(element, "dateLeave"),
            "note": checkExist(element, "note"),
            "exist": "1"
        }]
    }));
}