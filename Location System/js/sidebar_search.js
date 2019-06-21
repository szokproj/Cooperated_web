$(function () {
    $("#search_start").on("click", function () {
        var key = $("#search_select_type").val();
        var value = $("#search_input_target").val();
        var request = {
            "Command_Type": ["Read"],
            "Command_Name": ["GetStaffs"]
        };
        var xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    var memberArray = [];
                    var revInfo = 'Values' in revObj == true ? revObj.Values : [];
                    revInfo.forEach(element => {
                        if (element[key]) {
                            if (element[key] == value)
                                memberArray.push(element);
                        }
                    });
                    $("#table_sidebar_search tbody").empty(); //先重置表格
                    for (var i = 0; i < memberArray.length; i++) {
                        $("#table_sidebar_search tbody").append("<tr>" +
                            "<td>" + memberArray[i].tag_id + "</td>" +
                            "<td>" + memberArray[i].number + "</td>" +
                            "<td>" + memberArray[i].Name + "</td>" +
                            "<td>" + memberArray[i].department + "</td>" +
                            "<td>" + memberArray[i].jobTitle + "</td>" +
                            "<td>" + memberArray[i].type + "</td>" +
                            //"<td>" + memberArray[i].alarm_group_id + "</td>" +
                            "<td><button class=\"btn btn-primary\">" +
                            //" onclick=\"editMemberData(\'" + number + "\')\">編輯" +
                            "</button></td>" +
                            "</tr>");
                    }
                }
            }
        };
        xmlHttp.send(JSON.stringify(request));
    })
});