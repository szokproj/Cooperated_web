var thumb_width = parseFloat($("#new_map_block").css("width"));
var thumb_height = parseFloat($("#new_map_block").css("height"));
var mapArray = [];

window.addEventListener("load", loadMap, false);

function loadMap() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"]
    };
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                mapArray = revObj.Values;
                for (i = 0; i < mapArray.length; i++) {
                    var map = "map_id_" + mapArray[i].map_id;
                    var src = "../image/map/" + getFileName(mapArray[i].map_path);
                    var img_size = adjustImageSize(src);
                    $("#maps_gallery").append("<div class=\"thumbnail\">" +
                        "<div class=\"image_block\">" +
                        "<a href=\"" + src + "\" target=\"_blank\">" +
                        "<img src=\"" + src + "\"" +
                        " width=\"" + img_size.width + "\" height=\"" + img_size.height + "\">" +
                        "</a></div>" +
                        "<div class=\"caption\"><table>" +
                        "<tr><th>" +
                        "File name:" +
                        "</th><th>" +
                        "<span name=\"" + map + "\">" + getFileName(mapArray[i].map_path) + "</span><br>" +
                        "</th><th></th></tr>" +
                        "<tr><th>" +
                        "ID:" +
                        "</th><th>" +
                        "<span name=\"" + map + "\">" + mapArray[i].map_id + "</span><br>" +
                        "</th><th>" +
                        "<button class='btn btn-primary' onclick=\"setMapById(\'" + mapArray[i].map_id + "\')\">設定</button>" +
                        "</th></tr>" +
                        "<tr><th>" +
                        "Name:" +
                        "</th><th>" +
                        "<span name=\"" + map + "\">" + mapArray[i].map_name + "</span>" +
                        "</th><th></th></tr>" +
                        "</table></div>" +
                        "</div>");
                }
            }
        }
    };
    xmlHttp.open("POST", "sql", true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send(JSON.stringify(requestArray));
}

function setMapById(id) { //點擊設定:開啟設定視窗
    setOperate("change");
    var index = mapArray.findIndex(function (info) {
        return info.map_id == id;
    });
    if (index > -1) {
        var path = getFileName(mapArray[index].map_path);
        var scale = mapArray[index].map_scale;
        $("#map_info_id").val(mapArray[index].map_id);
        $("#map_info_name").val(mapArray[index].map_name);
        $("#map_info_scale").val(scale);
        $("#map_info_path").text(path);
        setMap(path, scale);
        //在設定好地圖後，導入Anchors
        getAnchors(mapArray[index].map_id);
        $("#dialog_map_setting").dialog("open");
    } else {
        return;
    }
}

function newMap() {
    setOperate("new");
    $("#map_info_id").val(""); //清空Map Information
    $("#map_info_name").val("");
    $("#map_info_scale").val("");
    $("#map_info_path").text("");
    clearAnchorList();
    clearGroupList();
    clearAnchorGroup();
    $("#table_map_group tbody").empty();
    resetCanvas_Anchor();
    $("#dialog_map_setting").dialog("open");
}

function setNewMap(map_id) { //新增地圖
    var map = "map_id_" + map_id;
    //var file = input.files[0];
    var file = $("#map_info_path").text();
    var src = "../image/map/" + file; //URL.createObjectURL(file);
    var img_size = adjustImageSize(src);
    $("#maps_gallery").append("<div class=\"thumbnail\">" +
        "<div class=\"image_block\">" +
        "<a href=\"" + src + "\" target=\"_blank\">" +
        "<img src=\"" + src + "\"" +
        " width=\"" + img_size.width + "\" height=\"" + img_size.height + "\">" +
        "</a></div>" +
        "<div class=\"caption\"><table>" +
        "<tr><th>" +
        "File name:" +
        "</th><th>" +
        "<span name=\"" + map + "\">" + file + "</span><br>" +
        "</th><th></th></tr>" +
        "<tr><th>" +
        "ID:" +
        "</th><th>" +
        "<span name=\"" + map + "\">" + $("#map_info_id").val() + "</span><br>" +
        "</th><th>" +
        "<button class='btn btn-primary'>設定</button>" +
        "</th></tr>" +
        "<tr><th>" +
        "Name:" +
        "</th><th>" +
        "<span name=\"" + map + "\">" + $("#map_info_name").val() + "</span>" +
        "</th><th></th></tr>" +
        "</table></div>" +
        "</div>");
}

function adjustImageSize(src) {
    var img = new Image();
    var width = thumb_width,
        height = thumb_height;
    img.src = src;
    img.onload = function () {
        var imgSize = img.width / img.height;
        var thumbSize = thumb_width / thumb_height;
        if (imgSize > thumbSize) { //原圖比例寬邊較長
            width = thumb_width;
            height = imgSize.height * (thumb_width / imgSize.width);
        } else {
            width = img.width * (thumb_height / imgSize.height);
            height = thumb_height;
        }
    }
    return {
        width: width,
        height: height
    };
}

function getFileName(src) {
    var pos1 = src.lastIndexOf("\\");
    var pos2 = src.lastIndexOf("/");
    var pos = -1;
    if (pos1 < 0) pos = pos2;
    else pos = pos1;
    return src.substring(pos + 1);
}

function createJsonXmlHttp(url) {
    var newXmlHttp = null;
    try { // Firefox, Opera 8.0+, Safari
        newXmlHttp = new XMLHttpRequest();
    } catch (e) { //Internet Explorer
        try {
            newXmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            newXmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    if (newXmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    newXmlHttp.open("POST", url, true);
    newXmlHttp.setRequestHeader("Content-type", "application/json");
    return newXmlHttp;
}