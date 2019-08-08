var mapArray = [];

$(function () {
    /**
     * Check this page's permission and load navbar
     */
    var permission = getPermissionOfPage("Map_Setting");
    switch (permission) {
        case "":
            alert("No permission");
            history.back();
            break;
        case "R":
            break;
        case "RW":
            break;
        default:
            alert("網頁錯誤，將跳回上一頁");
            history.back();
            break;
    }
    setNavBar("Map_Setting", "");

    loadMap();
});

function setMapArray(new_mapInfos) {
    mapArray = new_mapInfos.slice(0);
}

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
                setMapArray(revObj.Values); //利用抽離全部陣列完成陣列拷貝;
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
                            "<th style=\"width:120px;\"><label>" + $.i18n.prop('i_mapName') + " : </label></th>" +
                            "<th style=\"width:50%;\"><label name=\"" + map + "\">" + mapArray[i].map_name + "</label></th>" +
                            "<th><button class='btn btn-primary' onclick=\"setMapById(\'" + mapArray[i].map_id + "\')\">" +
                            $.i18n.prop('i_setting') + "</button></th>" +
                            "<th><button class='btn btn-primary' onclick=\"deleteMap(\'" + mapArray[i].map_id + "\')\">" +
                            $.i18n.prop('i_delete') + "</button></th>" +
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

function setMapById(id) { //點擊設定:開啟設定視窗
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
        $("#dialog_map_setting").dialog("open");
    } else {
        return;
    }
}

function newMap() {
    $("#map_info_id").val("");
    $("#map_info_name").val("");
    $("#map_info_scale").val("");
    $("#table_main_anchor_list tbody").empty();
    $("#table_anchor_list tbody").empty();
    $("#table_group_list tbody").empty();
    $("#table_anchor_group tbody").empty();
    resetCanvas_Anchor();
    $("#dialog_map_setting").dialog("open");
}

function deleteMap(id) {
    var r = confirm($.i18n.prop('i_mapAlert_10'));
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
    var thumb_width = $("#new_map_block").css("max-width");
    var thumb_height = $("#new_map_block").css("max-height");
    var width = thumb_width,
        height = thumb_height;
    img.src = src;
    img.onload = function () {
        var imgSize = img.width / img.height;
        var thumbSize = thumb_width / thumb_height;
        if (imgSize > thumbSize) { //原圖比例寬邊較長
            width = thumb_width;
            height = img.height * (thumb_width / img.width);
        } else {
            width = img.width * (thumb_height / img.height);
            height = thumb_height;
        }
    }
    return {
        width: width,
        height: height
    };
}

function transBase64(file) {
    if (file) { //file transform base64
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
        alert($.i18n.prop('i_fileError_2') + validExts.toString());
        return false;
    } else
        return true;
}

function checkImageSize(file) {
    if (file.size / 1024 > 100) {
        alert($.i18n.prop('i_fileError_3'));
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
        alert($.i18n.prop('i_fileError_1'));
        return "";
    }
}