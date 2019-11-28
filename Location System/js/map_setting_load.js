var token = "";
var mapArray = [];
var thumb_width = 240;
var thumb_height = 180;

$(function () {
    //Check this page's permission and load navbar
    token = getToken();
    if (!getPermissionOfPage("Map_Setting")) {
        alert("Permission denied!");
        window.location.href = '../index.html';
    }
    setNavBar("Map_Setting", "");
    thumb_width = parseInt(document.getElementById("new_map_block").style.maxWidth, 10);
    thumb_height = parseInt(document.getElementById("new_map_block").style.maxHeight, 10);
    loadMap();
});

function loadMap() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                mapArray = revObj.Value[0].Values.slice(0); //利用抽離全部陣列完成陣列拷貝
                $("#maps_gallery").empty();
                if (mapArray) {
                    for (i = 0; i < mapArray.length; i++) {
                        setThumbnail(mapArray[i]);
                    }
                }
            } else {
                alert($.i18n.prop('i_mapAlert_18'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function setThumbnail(map_info) {
    var map = "map_id_" + map_info.map_id;
    var img = new Image();
    img.src = "data:image/" + map_info.map_file_ext + ";base64," + map_info.map_file;
    img.onload = function () {
        var imgSize = img.width / img.height;
        var thumbSize = thumb_width / thumb_height;
        var thumb_set = "thumb_set_" + map_info.map_id;
        var thumb_delete = "thumb_del_" + map_info.map_id;
        if (imgSize > thumbSize) //原圖比例寬邊較長
            thumb_height = img.height * (thumb_width / img.width);
        else
            thumb_width = img.width * (thumb_height / img.height);
        $("#maps_gallery").append("<div class='thumbnail'>" +
            "<label for=\"" + thumb_delete + "\" title=\"" + $.i18n.prop('i_delete') + "\"" +
            " class='btn-cancel i18n-input' selectattr='title' selectname=\"i_delete\">" +
            "<i class='fas fa-window-close'></i></label>" +
            "<input type='button' class='btn-hidden' id=\"" + thumb_delete + "\"" +
            " onclick=\"deleteMap(\'" + map_info.map_id + "\')\" />" +
            "<div class='image_block'>" +
            "<img src=\"" + this.src + "\" width=\"" + thumb_width + "\" height=\"" + thumb_height + "\">" +
            "</div>" +
            "<div class='caption'><table style='width:100%;'><thead><tr>" +
            "<th style='text-align:center;'><label id=\"" + map + "\">" + map_info.map_name + "</label></th>" +
            "<th>" +
            /*"<button class='btn btn-default i18n' name='i_setting' style='float:right;'" +
            " onclick=\"setMapById(\'" + map_info.map_id + "\')\">" +
            $.i18n.prop('i_setting') + "</button>"+*/
            "<label for=\"" + thumb_set + "\" title=\"" + $.i18n.prop('i_setting') + "\"" +
            " class='btn-set i18n-input' selectattr='title' selectname=\"i_setting\"" +
            " style='float:right;'><i class='fas fa-edit'></i></label>" +
            "<input type='button' class='btn-hidden' id=\"" + thumb_set + "\"" +
            " onclick=\"setMapById(\'" + map_info.map_id + "\')\" />" +
            "</th>" +
            "</tr></thead></table></div>" +
            "</div>");
    }
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
        //$("#dialog_map_setting").dialog("open");
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
    //$("#dialog_map_setting").dialog("open");
}

function addMap() {
    if (confirm($.i18n.prop('i_mapAlert_17'))) {
        $("#add_map_name").removeClass("ui-state-error");
        $("#add_map_image").removeClass("ui-state-error");
        var valid = true && checkLength($("#add_map_name"), $.i18n.prop('i_mapAlert_13'), 1, 50),
            map_ext = "",
            map_base64 = "";
        if ($("#add_map_image").attr("src").length > 0) {
            var map_file = $("#add_map_image").attr("src").split(",");
            map_ext = getBase64Ext(map_file[0]);
            map_base64 = map_ext != "" ? map_file[1].trim() : "";
        } else { //no image
            valid = false;
            $("#add_map_image").addClass("ui-state-error");
        }
        if (valid) {
            var addMapReq = {
                "Command_Type": ["Write"],
                "Command_Name": ["AddListMap"],
                "Value": [{
                    "map_name": $("#add_map_name").val(),
                    "map_scale": "1",
                    "map_file": map_base64,
                    "map_file_ext": map_ext
                }],
                "api_token": [token]
            };
            var mapHttp = createJsonXmlHttp("sql");
            mapHttp.onreadystatechange = function () {
                if (mapHttp.readyState == 4 || mapHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                        $("#maps_gallery").empty();
                        mapArray = revObj.Value[0].Values.slice(0);
                        var lan = mapArray.length;
                        for (i = 0; i < lan; i++) {
                            setThumbnail(mapArray[i]);
                        }
                        $("#dialog_add_map").dialog("close");
                        setMapById(mapArray[lan - 1].map_id); //catch last row
                    } else {
                        alert("Add map failed!");
                    }
                }
            };
            mapHttp.send(JSON.stringify(addMapReq));
        }
    }
}


function deleteMap(id) {
    if (confirm($.i18n.prop('i_mapAlert_10'))) {
        var deleteMapReq = {
            "Command_Type": ["Read"],
            "Command_Name": ["DeleteMap"],
            "Value": [{
                "map_id": id
            }],
            "api_token": [token]
        };
        var mapHttp = createJsonXmlHttp("sql");
        mapHttp.onreadystatechange = function () {
            if (mapHttp.readyState == 4 || mapHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    var deleteMap_GroupReq = JSON.stringify({
                        "Command_Type": ["Read"],
                        "Command_Name": ["DeleteMap_Group"],
                        "Value": [{
                            "map_id": id
                        }],
                        "api_token": [token]
                    });
                    var mapGroupHttp = createJsonXmlHttp("sql");
                    mapGroupHttp.onreadystatechange = function () {
                        if (mapGroupHttp.readyState == 4 || mapGroupHttp.readyState == "complete") {
                            return true;
                        }
                    };
                    mapGroupHttp.send(deleteMap_GroupReq);
                    newMap();
                    loadMap();
                }
            }
        };
        mapHttp.send(JSON.stringify(deleteMapReq));
    }
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