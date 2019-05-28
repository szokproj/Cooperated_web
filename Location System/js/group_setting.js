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
        if (element.value != "" && typeof (element.value) != 'undefined') {
            anchorGroupArray.push({
                group_id: element.value,
                anchor_id: a_id[index].value
            });
        }
    });
    return anchorGroupArray;
}

function updateGroupArray() {
    var groupArray = [];
    var g_id = document.getElementsByName("chkbox_group_list");
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
        if (element.innerText != "" && typeof (element.innerText) != 'undefined') {
            groupListArray.push({
                group_id: element.innerText,
                main_anchor_id: m_id[index].value
            });
        }
    });
    return groupListArray;
}



//取出不重複的參考網址
//https://guahsu.io/2017/06/JavaScript-Duplicates-Array/
/*function updateMapGroupList() {
    var allGroups = [];
    var anc_group = document.getElementsByName("anchorgroup_group_id");
    var main_anc_group = document.getElementsByName("grouplist_id");
    for (i = 0; i < anc_group.length; i++)
        allGroups.push(anc_group[i].value); //取出所有綁定到anchor的group_id放進陣列
    for (j = 0; j < main_anc_group.length; j++)
        allGroups.push(main_anc_group[j].innerText); //取出所有綁定到main_anchor的group_id放進陣列
    var update = {};
    allGroups.forEach(function (item) {
        update[item] = update[item] ? update[item] + 1 : 1; //過濾掉重複的group_id放進Object(key)
    });
    const result = Object.keys(update);
}*/