var count_all_group = 0;

function inputAllGroups() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetGroups"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var groupList = revObj.Values;
            if (revObj.success > 0) {
                $("#table_all_group tbody").empty();
                groupList.forEach(info => {
                    info.group_name = typeof (info.group_name) != 'undefined' ? info.group_name : "";
                    count_all_group++;
                    var tr_id = "tr_all_group_" + count_grouplist;
                    $("#table_all_group tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                        "<input type=\"checkbox\" name=\"chkbox_all_group\" value=\"" + count_all_group + "\"" +
                        " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_all_group +
                        "</td><td>" +
                        "<label name=\"all_group_id\">" + info.group_id + "</label>" +
                        "</td><td>" +
                        "<label name=\"all_group_name\">" + info.group_name + "</label>" +
                        "</td><td>" +
                        "<label name=\"all_group_main_anchor\">" + info.main_anchor_id + "</label>" +
                        //"</td><td>" +
                        //"<button onclick=\"\""
                        "</td></tr>");
                });
            } else {
                alert("獲取GroupList失敗，請再試一次!");
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

$(function () {
    inputAllGroups();
    inputAllAnchor();
});