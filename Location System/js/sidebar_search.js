var token = "";

$(function () {
    token = getUser() ? getUser().api_token : "";

    $("#search_start").on("click", function () {
        var key = $("#search_select_type").val();
        var value = $("#search_input_target").val();
        var request = {
            "Command_Type": ["Read"],
            "Command_Name": ["GetStaffs"],
            "api_token": [token]
        };
        var xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    var memberArray = [];
                    var revInfo = revObj.Value[0].Values || [];
                    revInfo.forEach(element => {
                        if (key == "user_id") {
                            var user_id = parseInt(element["tag_id"].substring(8), 16);
                            if (user_id == value)
                                memberArray.push(element);
                        } else if (element[key]) {
                            if (element[key] == value)
                                memberArray.push(element);
                        }
                    });
                    $("#table_sidebar_search tbody").empty(); //先重置表格
                    for (var i = 0; i < memberArray.length; i++) {
                        var user_id = parseInt(memberArray[i].tag_id.substring(8), 16);
                        $("#table_sidebar_search tbody").append("<tr>" +
                            "<td>" + user_id + "</td>" +
                            "<td>" + memberArray[i].number + "</td>" +
                            "<td>" + memberArray[i].Name + "</td>" +
                            "<td>" + memberArray[i].department + "</td>" +
                            "<td>" + memberArray[i].jobTitle + "</td>" +
                            "<td>" + memberArray[i].type + "</td>" +
                            //"<td>" + memberArray[i].alarm_group_id + "</td>" +
                            "<td><button class=\"btn btn-default\"" +
                            " onclick=\"locateTag(\'" + memberArray[i].tag_id + "\')\">" +
                            "<img class=\"icon-image\" src=\"../image/target.png\">" +
                            "</button></td>" +
                            "</tr>");
                    }
                }
            }
        };
        xmlHttp.send(JSON.stringify(request));
    });
});