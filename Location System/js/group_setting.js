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

function getMainAnchorDropdown(select) {
    var mainAnchorList = document.getElementsByName("list_main_anchor_id");
    var options = "";
    select = select.length == 0 ? mainAnchorList[0].value : select;
    mainAnchorList.forEach(element => {
        if (element.value == select) {
            options += "<option value=\"" + element.value + "\" selected=\"selected\">" +
                element.value + "</option>";
        } else {
            options += "<option value=\"" + element.value + "\">" + element.value +
                "</option>";
        }
    });
    return options;
}

function getAnchorDropdown(select) {
    var anchorList = document.getElementsByName("list_anchor_id");
    var options = "";
    select = select.length == 0 ? anchorList[0].value : select;
    anchorList.forEach(element => {
        if (element.value == select) {
            options += "<option value=\"" + element.value + "\" selected=\"selected\">" +
                element.value + "</option>";
        } else {
            options += "<option value=\"" + element.value + "\">" + element.value +
                "</option>";
        }
    });
    return options;
}

function getRowData_Group_Anchor() {
    var ids = document.getElementsByName("anchorgroup_id");
    var group_ids = document.getElementsByName("anchorgroup_group_id");
    var group_names = document.getElementsByName("anchorgroup_group_name");
    var main_anc_ids = document.getElementsByName("anchorgroup_main_anchor_id");
    var anchor_ids = document.getElementsByName("anchorgroup_anchor_id");
    var list = [];
    ids.forEach(function (id, i) {
        list.push({
            id: id.value,
            group_id: group_ids[i].value,
            group_name: group_names[i].value,
            main_anchor_id: main_anc_ids[i].value,
            anchor_id: anchor_ids[i].value
        });
    });
    return list;
}

function getRowData_Group() {
    var group_ids = document.getElementsByName("chkbox_group_list");
    var group_names = document.getElementsByName("grouplist_name");
    var main_anc_ids = document.getElementsByName("grouplist_main_anchor_id");
    var list = [];
    group_ids.forEach(function (group_id, i) {
        list.push({
            group_id: group_id.value,
            group_name: group_names[i].value,
            main_anchor_id: main_anc_ids[i].value
        });
    });
    return list;
}

function setGroupConnectChange(Element_id, Element_name) { //連動Group的id與name
    var groupList = getRowData_Group();
    $(Element_id).off('change');
    $(Element_name).off('change');
    $(Element_id).each(function (i) {
        $(this).on("change", function () {
            var index = groupList.findIndex(function (info) {
                return info.group_id == $(Element_id).eq(i).val();
            });
            if (index > -1)
                $(Element_name).eq(i).val(groupList[index].group_name);
        });
        $(Element_name).eq(i).on("change", function () {
            var index = groupList.findIndex(function (info) {
                return info.group_name == $(Element_name).eq(i).val();
            });
            if (index > -1)
                $(Element_id).eq(i).val(groupList[index].group_id);
        });
    });
}
//取出不重複的參考網址
//https://guahsu.io/2017/06/JavaScript-Duplicates-Array/