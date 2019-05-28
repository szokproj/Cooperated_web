var count_all_main_anchor = 0,
    count_all_anchor = 0;

function inputAllAnchor() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAnchors"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                $("#table_all_main_anchor tbody").empty();
                $("#table_all_anchor tbody").empty();
                var anchorList = revObj.Values;
                for (i = 0; i < anchorList.length; i++) {
                    if (anchorList[i].anchor_type == "main") {
                        count_all_main_anchor++;
                        var tr_id = "tr_all_main_anchor_" + count_all_main_anchor;
                        $("#table_all_main_anchor tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                            "<input type=\"checkbox\" name=\"chkbox_main_anchor\" value=\"" + tr_id + "\"" +
                            " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_all_main_anchor +
                            "</td><td>" +
                            "<label name=\"list_main_anchor_id\">" + anchorList[i].anchor_id + "</label>" +
                            "</td><td>" +
                            "<label name=\"list_main_anchor_x\">" + anchorList[i].set_x + "</label>" +
                            "</td><td>" +
                            "<label name=\"list_main_anchor_y\">" + anchorList[i].set_y + "</label>" +
                            "</td></tr>");
                    } else {
                        count_all_anchor++;
                        var tr_id = "tr_all_anchor" + count_all_anchor;
                        $("#table_all_anchor tbody").append("<tr id=\"" + tr_id + "\"><td>" +
                            "<input type=\"checkbox\" name=\"chkbox_anchor\" value=\"" + tr_id + "\"" +
                            " onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_all_anchor +
                            "</td><td>" +
                            "<label name=\"list_anchor_id\">" + anchorList[i].anchor_id + "</label>" +
                            "</td><td>" +
                            "<label name=\"list_anchor_x\">" + anchorList[i].set_x + "</label>" +
                            "</td><td>" +
                            "<label name=\"list_anchor_y\">" + anchorList[i].set_y + "</label>" +
                            "</td></tr>");
                    }
                }
            } else {
                alert("獲取AnchorList失敗，請再試一次!");
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}