function createJsonXmlHttp(url) {
    var xmlHttp = null;
    try { // Firefox, Opera 8.0+, Safari
        xmlHttp = new XMLHttpRequest();
    } catch (e) { //Internet Explorer
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    return xmlHttp;
}

$(function () {
    $("#search_start").on("click", function () {
        var type = $("#search_select_type").val();
        var target = $("#search_input_target").val();
        /*switch (type) {
            case "group":
                break;
            case "tag_id":
                break;
            case "id":
                break;
            default:
                break;
        }*/
        var request = {
            "Command_Type": ["Read"],
            "Command_Name": ["GetStaffs"], //Search staffs with target of type.
            "Value": {
                "type": type,
                "target": target
            }
        };
        var xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                try {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        $("#table_sidebar_search tbody").empty(); //先重置表格
                        var memberArray = revObj.Values;
                        for (var i = 0; i < memberArray.length; i++) {
                            $("#table_sidebar_search tbody").append("<tr>" +
                                "<td>" + memberArray[i].tag_id + "</td>" +
                                "<td>" + memberArray[i].number + "</td>" +
                                "<td>" + memberArray[i].Name + "</td>" +
                                "<td>" + memberArray[i].department + "</td>" +
                                "<td>" + memberArray[i].type + "</td>" +
                                "<td>" + "" + "</td>" +
                                "<td>" + "" + "</td>" +
                                "<td><button class=\"btn btn-primary\">" +
                                //" onclick=\"editMemberData(\'" + number + "\')\">編輯" +
                                "</button></td>" +
                                "</tr>");
                        }
                    }
                } catch (ignore) {
                    console.warn(ignore.message);
                }
            }
        };
        xmlHttp.send(JSON.stringify(request));
    })
});