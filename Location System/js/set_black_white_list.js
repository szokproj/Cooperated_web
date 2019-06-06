$(function () {
    getMemberList();
    $("#btn_BW_list_add").on('click', addMembers);
    /*$("input[name='BW_list_type']").on('change', function () {
        var list_type = $("input[name='BW_list_type']:checked").val();
        if (typeof (list_type) == "undefined") {
            alert("請選取名單類型！");
            return false;
        }
        if (list_type == "Black")



    });*/
});

function getMemberList() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetStaffs"]
    };
    var xmlHttp = createJsonXmlHttp("sql"); //updateMemberList
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                $("#table_member_list tbody").empty(); //先重置表格
                var memberArray = ('Values' in revObj) == true ? revObj.Values : [];
                for (var i = 0; i < memberArray.length; i++) {
                    //var tr_id = "tr_member_" + i;
                    var number = memberArray[i].number;
                    var tr_id = "tr_member_" + number;
                    $("#table_member_list tbody").append("<tr id=\"" + tr_id + "\">" +
                        "<td><input type=\"checkbox\" name=\"chkbox_members\" value=\"" + number +
                        "\" onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + (i + 1) + "</td>" +
                        "<td>" + number + "</td>" +
                        "<td>" + memberArray[i].Name + "</td>" +
                        "</tr>");
                }
            } else {
                alert("取得人員資料失敗!");
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function addMembers() {
    var members = document.getElementsByName("chkbox_members");
    var sel_nums = [];
    for (j in members) {
        if (members[j].checked)
            sel_nums.push(members[j].value);
    }
    sel_nums.forEach(number => {
        var tr_id = "tr_member_" + number;
        var html = $("#" + tr_id).html();
        $("#" + tr_id).remove();
        $("#table_BW_list tbody").append("<tr id=\"" + tr_id + "\">" + html + "</tr>");
    });
    /*var request = {
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
    xmlHttp.send(JSON.stringify(request));*/
}

function removeMembers() {
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