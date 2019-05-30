window.addEventListener("load", loadMap, false);

function loadMap() {
    $("#maps_gallery").empty();
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var mapArray = revObj.Values.slice(0); //利用抽離全部陣列完成陣列拷貝;
                if (mapArray) {
                    for (i = 0; i < mapArray.length; i++) {
                        var map = "map_id_" + mapArray[i].map_id;
                        var src = "data:image/" + mapArray[i].map_file_ext + ";base64," + mapArray[i].map_file;
                        var img_size = adjustImageSize(src);
                        $("#maps_gallery").append("<div class=\"thumbnail\">" +
                            "<div class=\"image_block\">" +
                            "<img src=\"" + src + "\" width=\"" + img_size.width + "\" height=\"" + img_size.height + "\">" +
                            "</div>" +
                            "<div class=\"caption\"><table style='width:100%;'><tr>" +
                            "<th style=\"width:90px;\">Map Name:</th>" +
                            "<th style=\"width:50%;\"><span name=\"" + map + "\">" + mapArray[i].map_name + "</span></th>" +
                            "<th><button class='btn btn-primary' onclick=\"setMapById(\'" + mapArray + "\',\'" + mapArray[i].map_id + "\')\">設定</button></th>" +
                            "<th><button class='btn btn-primary' onclick=\"deleteMap(\'" + mapArray[i].map_id + "\')\">刪除</button></th>" +
                            "</tr></table></div>" +
                            "</div>");
                    }
                }
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function confirmHrefType(href) {
    var BASE64_MARKER = ';base64,';
    if (href.indexOf(BASE64_MARKER) == -1)
        return href;
    else
        return false;
}

function setMapById(mapArray, id) { //點擊設定:開啟設定視窗
    var index = mapArray.findIndex(function (info) {
        return info.map_id == id;
    });
    if (index > -1) {
        var urlData = "data:image/" + mapArray[index].map_file_ext + ";base64," + mapArray[index].map_file;
        var scale = mapArray[index].map_scale;
        $("#map_info_id").val(mapArray[index].map_id);
        $("#map_info_name").val(mapArray[index].map_name);
        $("#map_info_scale").val(scale);
        setMap(urlData, scale);
        getMapGroups(); //在設定好地圖後，導入Groups & Anchors
        $("#dialog_map_setting").dialog("open");
    } else {
        return;
    }
}

function newMap() {
    $("#map_info_id").val(""); //清空Map Information
    $("#map_info_name").val("");
    $("#map_info_scale").val("");
    clearAnchorList();
    clearGroupList();
    clearAnchorGroup();
    resetCanvas_Anchor();
    $("#dialog_map_setting").dialog("open");
}

function deleteMap(id) {
    var r = confirm("Confirm to delete the map?");
    if (r == true) {
        var deleteMapReq = JSON.stringify({
            "Command_Type": ["Read"],
            "Command_Name": ["DeleteMap"],
            "Value": [{
                "map_id": id
            }]
        });
        var mapHttp = createJsonXmlHttp("sql");
        mapHttp.onreadystatechange = function () {
            if (mapHttp.readyState == 4 || mapHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    var deleteMap_GroupReq = JSON.stringify({
                        "Command_Type": ["Read"],
                        "Command_Name": ["DeleteMap_Group"],
                        "Value": [{
                            "map_id": id
                        }]
                    });
                    var mapGroupHttp = createJsonXmlHttp("sql");
                    mapGroupHttp.onreadystatechange = function () {
                        if (mapGroupHttp.readyState == 4 || mapGroupHttp.readyState == "complete") {
                            var revObj = JSON.parse(this.responseText);
                            if (revObj.success > 0) {
                                return;
                            }
                        }
                    };
                    mapGroupHttp.send(deleteMap_GroupReq);
                    $("#maps_gallery").empty();
                    loadMap();
                }
            }
        };
        mapHttp.send(deleteMapReq);
    } else {
        return;
    }
}

function adjustImageSize(src) {
    var img = new Image();
    var thumb_width = parseFloat($("#new_map_block").css("width"));
    var thumb_height = parseFloat($("#new_map_block").css("height"));
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

function transBase64(file) {
    //file transform base64
    if (file) {
        var FR = new FileReader();
        FR.readAsDataURL(file);
        FR.onloadend = function (e) {
            var base64data = e.target.result;
            loadImage(base64data);
        };
    }
}

function checkExt(fileName) {
    var validExts = new Array(".png", ".jpg", ".jpeg"); // 可接受的副檔名
    var fileExt = fileName.substring(fileName.lastIndexOf('.'));
    if (validExts.indexOf(fileExt) < 0) {
        alert("檔案類型錯誤，可接受的副檔名有：" + validExts.toString());
        return false;
    } else
        return true;
}

function checkImageSize(file) {
    if (file.size / 1000 > 250) {
        alert("檔案大小超過250KB，請重新選擇圖檔!");
        return false;
    } else
        return true;
}

function getBase64Ext(urldata) {
    urldata = typeof (urldata) == 'undefined' ? "" : urldata;
    var start = urldata.indexOf("/"),
        end = urldata.indexOf(";");
    if (start > -1 && end > -1) {
        return urldata.substring(start + 1, end);
    } else {
        alert("檔案格式錯誤，請檢查格式後重新上傳!");
        return "";
    }
}