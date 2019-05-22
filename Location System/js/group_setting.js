function drawGroups(anchorArr) {
    var anchorGroupArray = updateAncGroupArr();
    var groupArray = updateGroupArray();
    groupArray.forEach(function (id) {
        var group = new Group();
        anchorGroupArray.forEach(element => {
            if (element.group_id == id) {
                var i = anchorArr.findIndex(function (anchor) {
                    return anchor.id == element.anchor_id;
                });
                if (i > -1)
                    group.setAnchor(anchorArr[i].id, anchorArr[i].x, anchorArr[i].y);
            }
        });
        group.drawGroup();
    });
}

function updateAncGroupArr() {
    var anchorGroupArray = [];
    var g_id = document.getElementsByName("anchorgroup_group_id");
    var a_id = document.getElementsByName("anchorgroup_anchor_id");
    g_id.forEach(function (element, index) {
        if (element.value != "" && typeof (element.value) != 'undefined')
            anchorGroupArray.push({
                group_id: element.value,
                anchor_id: a_id[index].value
            });
    });
    return anchorGroupArray;
}

function updateGroupArray() {
    var groupArray = [];
    var g_id = document.getElementsByName("grouplist_id");
    g_id.forEach(function (element) {
        if (element.value != "" && typeof (element.value) != 'undefined')
            groupArray.push(element.value);
    });
    return groupArray;
}

function catchGroupList() {
    var groupListArray = [];
    var g_id = document.getElementsByName("grouplist_id");
    var m_id = document.getElementsByName("grouplist_main_anchor");
    g_id.forEach(function (element, index) {
        if (element.value != "" && typeof (element.value) != 'undefined')
            groupListArray.push({
                group_id: element.value,
                main_anchor_id: m_id[index].value
            });
    });
    return groupListArray;
}


var count_map_group = 0;

function inputMapGroupList() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps_Groups"]
    };
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var mapGroups = revObj.Values;
            if (revObj.success > 0) {
                $("#table_map_group tbody").empty(); //先重置表格
                count_map_group = 0;
                for (i = 0; i < mapGroups.length; i++) {
                    count_map_group++;
                    var tr_id = "tr_map_group_" + count_map_group;
                    $("#table_map_group tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                        "<input type=\"checkbox\" name=\"chkbox_map_group\" value=\"" + count_map_group + "\"" +
                        " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_map_group +
                        "</td><td>" +
                        "<input type=\"text\" name=\"mapgroup_group_id\" value=\"" + mapGroups[i].group_id + "\" />" +
                        "</td></tr>");
                }
            } else {
                alert("獲取MapGroup失敗，請再試一次!");
                return;
            }
        }
    };
    xmlHttp.open("POST", "sql", true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send(JSON.stringify(requestArray));
}


//取出不重複的參考網址
//https://guahsu.io/2017/06/JavaScript-Duplicates-Array/
function updateMapGroupList() {
    var allGroups = [];
    var anc_group = document.getElementsByName("anchorgroup_group_id");
    var main_anc_group = document.getElementsByName("grouplist_id");
    for (i = 0; i < anc_group.length; i++)
        allGroups.push(anc_group[i].value); //取出所有綁定到anchor的group_id放進陣列
    for (j = 0; j < main_anc_group.length; j++)
        allGroups.push(main_anc_group[j].value); //取出所有綁定到main_anchor的group_id放進陣列
    var update = {};
    allGroups.forEach(function (item) {
        update[item] = update[item] ? update[item] + 1 : 1; //過濾掉重複的group_id放進Object(key)
    });
    const result = Object.keys(update);
    $("#table_map_group tbody").empty(); //先重置列表
    count_map_group = 0;
    for (i = 0; i < result.length; i++) {
        count_map_group++;
        var tr_id = "tr_map_group_" + count_map_group;
        $("#table_map_group tbody").append("<tr id=\"" + tr_id + "\"><td>" +
            "<input type=\"checkbox\" name=\"chkbox_map_group\" value=\"" + count_map_group + "\"" +
            " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_map_group +
            "</td><td>" +
            "<input type=\"text\" name=\"mapgroup_group_id\" value=\"" + result[i] + "\" />" +
            "</td></tr>");
    } //更新完畢
}

function addMapGroup() {
    count_map_group++;
    var tr_id = "tr_map_group_" + count_map_group;
    $("#table_map_group tbody").append("<tr id=\"" + tr_id + "\"><td>" +
        "<input type=\"checkbox\" name=\"chkbox_map_group\" value=\"" + count_map_group + "\"" +
        " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_map_group +
        "</td><td>" +
        "<input type=\"text\" name=\"mapgroup_group_id\" />" +
        "</td></tr>");
}

function removeMapGroup() {
    var checkboxs = document.getElementsByName("chkbox_map_group");
    var arr = [];
    for (j in checkboxs) {
        if (checkboxs[j].checked)
            arr.push(checkboxs[j].value);
    }
    arr.forEach(function (v) {
        $("#tr_map_group_" + v).remove();
    });
}


function selectColumn(id) {
    $("#" + id).toggleClass("changeBgColor");
}

function makeOptions(array, select) {
    var options = "";
    array.forEach(value => {
        if (value == select) {
            options += "<option value=\"" + value + "\" selected=\"selected\">" +
                value + "</option>";
        } else {
            options += "<option value=\"" + value + "\">" + value + "</option>";
        }
    });
    return options;
}