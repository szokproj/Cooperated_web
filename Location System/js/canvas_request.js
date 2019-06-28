var PIXEL_RATIO, // 獲取瀏覽器像素比
    cvsBlock, canvas, ctx,
    serverImg = new Image(),
    canvasImg = {
        isPutImg: false,
        width: 0,
        height: 0,
        scale: 1 //預設比例尺為1:1,
    },
    Map_id = "",
    mapArray = [],
    anchorArray = [],
    tagArray = [],
    alarmID_array = [],
    alarmArray = [];

// View parameters
var lastX = 0, //滑鼠最後位置的X座標
    lastY = 0, //滑鼠最後位置的Y座標
    xleftView = 0, //canvas的X軸位移(負值向左，正值向右)
    ytopView = 0, //canvas的Y軸位移(負值向上，正值向下)
    zoomOriginal = 1.0,
    Zoom = zoomOriginal, //縮放比例
    fitZoom = 1,
    isFitWindow = true;

var AnchorPosition = false,
    AnchorDisplay = true,
    isStart = false, //設定Anchor座標中
    pageTimer = {}; //定義計時器全域變數

var isFocus = true,
    isFocusNewAlarm = false,
    focusAlarmIndex = -1,
    focusAlarmTag_ID = "";


window.addEventListener("load", setup, false);

function setup() {
    cvsBlock = document.getElementById("cvsBlock");
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    PIXEL_RATIO = (function () {
        var dpr = window.devicePixelRatio || 1,
            bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;
        return dpr / bsr;
    })();

    canvas.addEventListener("mousemove", handleMouseMove, false); //滑鼠在畫布中移動的座標
    canvas.addEventListener("mousewheel", handleMouseWheel, false); //畫布縮放
    //canvas.addEventListener("dblclick", handleDblClick, false); // 快速放大點擊位置
    canvas.addEventListener('click', handleMouseClick, false); //點擊地圖上的tag，跳出tag的訊息框
    cvsBlock.addEventListener("mousewheel", handleMouseWheel, false); // 畫面縮放
    cvsBlock.addEventListener("DOMMouseScroll", handleMouseWheel, false); // 畫面縮放(for Firefox)



    $(function () {
        //多階下拉清單按鈕
        /*$('.dropdown').mouseover(function (e) {
            $(this).children('ul').show();
        });
        $('.dropdown').mouseleave(function (e) {
            $(this).children('ul').hide();
        });
        $('.dropdown ul').hover(function () {
            $(this).show();
        }, function () {
            $(this).hide();
        });*/
        //預設彈跳視窗載入後隱藏
        $("#member_dialog").dialog({
            autoOpen: false
        });
        $("#alarm_dialog").dialog({
            autoOpen: false
        });
        //設置移動後的默認位置 
        $("#canvas").mousedown(function (e) {
            //獲取div的初始位置，要注意的是需要轉整型，因為獲取到值帶px 
            var canvas_left = parseInt($("#canvas").css("margin-left"));
            var canvas_top = parseInt($("#canvas").css("margin-top"));
            //獲取滑鼠按下時的坐標，區別於下面的es.pageX,es.pageY 
            var downx = e.pageX;
            var downy = e.pageY;
            //pageY的y要大寫，必須大寫！！
            // 滑鼠按下時給div掛事件 
            $("#canvas").bind("mousemove", function (es) {
                //es.pageX,es.pageY:獲取滑鼠移動後的坐標 
                var end_x = es.pageX - downx + canvas_left;
                //計算div的最終位置 
                var end_y = es.pageY - downy + canvas_top;
                //帶上單位 
                $("#canvas").css("margin-left", end_x + "px").css("margin-top", end_y + "px");
            });

            $("#canvas").mouseup(function () {
                //滑鼠彈起時給div取消事件 
                $("#canvas").unbind("mousemove");
            });

            $("#canvas").mouseleave(function () {
                //滑鼠離開canvas時給div取消事件 
                $("#canvas").unbind("mousemove");
            });
        });

        var requestArray = {
            "Command_Type": ["Read"],
            "Command_Name": ["GetMaps"]
        };
        //接收並載入Server的地圖設定到按鈕
        var xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    var MapList = revObj.Values;
                    mapArray = MapList.slice(0); //Copy array
                    var html = "";
                    for (i = 0; i < MapList.length; i++) {
                        html += "<li><input type=\"button\" id=\"map_btn_" + MapList[i].map_id + "\" " +
                            "value=\"" + MapList[i].map_name + "\"" +
                            "onclick=\"addMapTab(\'" + MapList[i].map_id + "\',\'" + MapList[i].map_name +
                            "\')\"></li>";
                    }
                    document.getElementById("loadMapButtonGroup").innerHTML = html;
                } else {
                    alert($.i18n.prop('i_failed_loadMap'));
                }
            }
        };
        xmlHttp.send(JSON.stringify(requestArray));
    });
}

function addMapTab(map_id, map_name) {
    var tab_map_id = "map_tab_" + map_id;
    $("#input_map").before("<button type=\"button\" name=\"map_tab\" class=\"btn btn-primary\" id=\"" + tab_map_id +
        "\" onclick=\"setMap(\'" + map_id + "\')\">" +
        map_name + "</button></li>");
    setMap(map_id);
    $("#map_btn_" + map_id).prop('disabled', true).css('color', 'lightgray');
}

function closeMapTag() {
    $("#map_tab_" + Map_id).remove();
    $("#map_btn_" + Map_id).prop('disabled', false).css('color', 'black');
    if (Map_id == "")
        return;
    if ($("button[name=map_tab]").length > 0) {
        var tab_map_id = $("button[name=map_tab]").eq(0).attr("id"); //"map_tab_" + map_id
        $("#" + tab_map_id).addClass("selected");
        setMap(tab_map_id.substring(8));
    } else { //reset
        resetCanvas_Anchor();
    }
}

function setMap(map_id) {
    var index = mapArray.findIndex(function (info) {
        return info.map_id == map_id;
    });
    if (index < 0)
        return;
    var map_url = "data:image/" + mapArray[index].map_file_ext + ";base64," + mapArray[index].map_file;
    var map_scale = typeof (mapArray[index].map_scale) != 'undefined' && mapArray[index].map_scale != "" ? mapArray[index].map_scale : 1;

    $("button[name=map_tab]").removeClass("selected");
    $("#map_tab_" + map_id).addClass("selected");

    serverImg.src = map_url; //"data:image/" + revInfo.file_ext + ";base64," + revInfo.map_file;
    serverImg.onload = function () {
        cvsBlock.style.background = "none";
        canvasImg.isPutImg = true;
        canvasImg.width = serverImg.width;
        canvasImg.height = serverImg.height;
        canvasImg.scale = map_scale;
        document.getElementById("scale_visible").innerText = map_scale;
        setCanvas(this.src, serverImg.width, serverImg.height);
        //canvas.style.position = "absolute"; //可以不設定
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        xleftView = 0;
        ytopView = 0;
        Zoom = zoomOriginal;
        ctx.save(); //紀錄原比例

        var serImgSize = serverImg.width / serverImg.height;
        var cvsBlock_width = parseFloat($("#cvsBlock").css("width"));
        var cvsBlock_height = parseFloat($("#cvsBlock").css("height"));
        var cvsSize = cvsBlock_width / cvsBlock_height;
        if (serImgSize > cvsSize) { //原圖比例寬邊較長
            fitZoom = cvsBlock_width / serverImg.width;
            setCanvas(this.src, cvsBlock_width, serverImg.height * fitZoom);
        } else {
            fitZoom = cvsBlock_height / serverImg.height;
            setCanvas(this.src, serverImg.width * fitZoom, cvsBlock_height);
        }

        //在設定好地圖後，導入Anchors & Groups & Tags' setting
        getAnchors(map_id);
    };
}

function resetCanvas_Anchor() {
    cvsBlock.style.background = '#ccc';
    canvasImg.isPutImg = false;
    canvasImg.width = 0;
    canvasImg.height = 0;
    canvasImg.scale = 1;
    setCanvas("", 1, 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    xleftView = 0;
    ytopView = 0;
    Zoom = zoomOriginal;
    anchorArray = [];
    document.getElementById('scale_visible').innerText = "";
    document.getElementById('x').value = "";
    document.getElementById('y').value = "";
}

function getAnchors(map_id) {
    Map_id = map_id;
    anchorArray = [];
    setSize();
    var request_anc = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAnchorsInMap"],
        "Value": {
            "map_id": map_id
        }
    };
    var ancXmlHttp = createJsonXmlHttp("sql");
    ancXmlHttp.onreadystatechange = function () {
        if (ancXmlHttp.readyState == 4 || ancXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var anchorList = revObj.Values;
            if (revObj.success > 0) {
                var x, y;
                for (i in anchorList) {
                    x = anchorList[i].set_x / canvasImg.scale;
                    y = canvasImg.height - anchorList[i].set_y / canvasImg.scale; //因為Server回傳的座標為左下原點
                    anchorArray.push({
                        id: anchorList[i].anchor_id,
                        type: "",
                        x: x,
                        y: y
                    });
                    drawAnchor(ctx, anchorList[i].anchor_id, "", x, y); //畫出點的設定
                }
            }
        }
    };
    ancXmlHttp.send(JSON.stringify(request_anc));
    var request_main = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMainAnchorsInMap"],
        "Value": {
            "map_id": map_id
        }
    };
    var mainXmlHttp = createJsonXmlHttp("sql");
    mainXmlHttp.onreadystatechange = function () {
        if (mainXmlHttp.readyState == 4 || mainXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var anchorList = revObj.Values;
            if (revObj.success > 0) {
                var x, y;
                for (i in anchorList) {
                    x = anchorList[i].set_x / canvasImg.scale;
                    y = canvasImg.height - anchorList[i].set_y / canvasImg.scale;
                    anchorArray.push({
                        id: anchorList[i].main_anchor_id,
                        type: "main",
                        x: x,
                        y: y
                    });
                    drawAnchor(ctx, anchorList[i].main_anchor_id, "main", x, y);
                }
            }
        }
    };
    mainXmlHttp.send(JSON.stringify(request_main));
}

function getGroups(anchorList) {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetGroup_Anchors"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var anchor_groups = revObj.Values;
            if (revObj.success > 0) {
                inputGroups(anchor_groups, anchorList); //函式在dialog_anchor_group.js內
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function getGroupList(anchorList) {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetGroups"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var anchor_group_list = revObj.Values;
            if (revObj.success > 0) {
                inputGroupList(anchor_group_list, anchorList); //函式在dialog_anchor_group.js內
                var GroupArray = [];
                for (i in anchor_group_list)
                    GroupArray.push(anchor_group_list[i].group_id);
                getMapGroup(GroupArray);
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function getMapGroup(groupArray) {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps_Groups"]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var map_group_list = revObj.Values;
            if (revObj.success > 0) {
                var map_infos = [];
                for (i in mapArray)
                    map_infos.push(mapArray[i].map_id);
                inputMapGroupList(map_group_list, map_infos, groupArray);
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function setCanvas(img_src, width, height) {
    canvas.style.backgroundImage = "url(" + img_src + ")";
    canvas.style.backgroundSize = width + "px " + height + "px";
    canvas.width = width * PIXEL_RATIO;
    canvas.height = height * PIXEL_RATIO;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

function setSize() {
    //縮放canvas與背景圖大小
    if (canvasImg.isPutImg) {
        canvas.style.backgroundSize = (canvasImg.width * fitZoom * Zoom) + "px " + (canvasImg.height * fitZoom * Zoom) + "px";
        canvas.width = canvasImg.width * fitZoom * PIXEL_RATIO * Zoom;
        canvas.height = canvasImg.height * fitZoom * PIXEL_RATIO * Zoom;
        canvas.style.width = canvasImg.width * fitZoom * Zoom + 'px';
        canvas.style.height = canvasImg.height * fitZoom * Zoom + 'px';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(PIXEL_RATIO * fitZoom, 0, 0, PIXEL_RATIO * fitZoom, 0, 0);
        ctx.scale(Zoom, Zoom);
        ctx.translate(0, 0);
    }
}

function restoreCanvas() {
    if (!canvasImg.isPutImg)
        return;
    var cvsBlock_width = parseFloat($("#cvsBlock").css("width"));
    var cvsBlock_height = parseFloat($("#cvsBlock").css("height"));
    xleftView = 0;
    ytopView = 0;
    Zoom = zoomOriginal;
    if (isFitWindow) { //恢復原比例
        fitZoom = 1;
        ctx.restore();
        ctx.save();
        isFitWindow = false; //目前狀態:原比例
        document.getElementById("label_restore").innerHTML = "<i class=\"fas fa-expand\" style='font-size:20px;'" +
            " title=\"" + $.i18n.prop('i_fit_window') + "\"></i>";
    } else { //依比例拉伸(Fit in Window)
        if ((serverImg.width / serverImg.height) > (cvsBlock_width / cvsBlock_height)) //原圖比例寬邊較長
            fitZoom = cvsBlock_width / serverImg.width;
        else
            fitZoom = cvsBlock_height / serverImg.height;
        isFitWindow = true; //目前狀態:依比例拉伸
        document.getElementById("label_restore").innerHTML = "<i class=\"fas fa-compress\" style='font-size:20px;'" +
            " title=\"" + $.i18n.prop('i_restore_scale') + "\"></i>";
    }
    $(function () {
        $("#canvas").css("margin-left", 0 + "px").css("margin-top", 0 + "px");
        draw();
    });
}

function handleMouseWheel(event) {
    var targetX = lastX; //滑鼠目前在canvas中的位置(x坐標)
    var targetY = lastY; //滑鼠目前在canvas中的位置(y坐標)
    var scale = (event.wheelDelta < 0 || event.detail > 0) ? 0.9 : 1.1;
    Zoom *= scale; //縮放比例
    //xleftView: X軸位移(負值向左，正值向右);
    //ytopView: Y軸位移(負值向上，正值向下)
    //var x = targetX + xleftView;  // View coordinates
    //var y = targetY + ytopView;
    var loc = getPointOnCanvas(event.pageX, event.pageY);
    $(function () {
        var canvas_left = parseFloat($("#canvas").css("margin-left")); //canvas目前相對於div的位置(x坐標)
        var canvas_top = parseFloat($("#canvas").css("margin-top")); //canvas目前相對於div的位置(y坐標)
        xleftView = targetX / scale - targetX; //得出最終偏移量X
        ytopView = targetY / scale - targetY; //得出最終偏移量Y
        // scale about center of view, rather than mouse position. This is different than dblclick behavior.
        //xleftView = x - targetX;
        //ytopView = y - targetY;
        var end_x = canvas_left + xleftView; //* scale;
        var end_y = canvas_top + ytopView; //* scale;
        //end_x -= center.x * Zoom;//xleftView;
        //end_y -= center.y * Zoom;//ytopView;
        $("#canvas").css("margin-left", end_x + "px").css("margin-top", end_y + "px");
        draw();
    });
}


function handleDblClick(event) {
    var targetX = lastX; //滑鼠目前在canvas中的位置(x坐標)
    var targetY = lastY; //滑鼠目前在canvas中的位置(y坐標)
    var scale = event.shiftKey == 1 ? 0.5 : 1.5; // shrink (1.5) if shift key pressed
    Zoom *= scale; //縮放比例
    $(function () {
        var canvas_left = parseFloat($("#canvas").css("margin-left")); //canvas目前相對於div的位置(x坐標)
        var canvas_top = parseFloat($("#canvas").css("margin-top")); //canvas目前相對於div的位置(y坐標)
        xleftView = (targetX / scale - targetX); //得出最終偏移量X
        ytopView = (targetY / scale - targetY); //得出最終偏移量Y
        var end_x = canvas_left + xleftView;
        var end_y = canvas_top + ytopView;
        $("#canvas").css("margin-left", end_x + "px").css("margin-top", end_y + "px");
        draw();
    });
}

function getEventPosition(ev) { //獲取滑鼠點擊位置
    var x, y;
    if (ev.layerX || ev.layerX == 0) {
        x = ev.layerX;
        y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
        x = ev.offsetX;
        y = ev.offsetY;
    }
    return {
        x: x,
        y: y
    };
    //注：如果使用此方法無效的話，需要給Canvas元素的position設為absolute。
}

function clickEvent(p) { //滑鼠點擊事件
    tagArray.forEach(function (v, i) {
        drawTags(ctx, v.id, v.x, v.y);
        if (p && ctx.isPointInPath(p.x, p.y)) {
            //如果傳入了事件坐標，就用isPointInPath判斷一下
            $(function () {
                $("#member_dialog_tag_id").text(parseInt(v.id, 16));
                $("#member_dialog_name").text(v.name);
                $("#member_dialog_image").text(v.image);
                $("#member_dialog").dialog("open");
            });
        }
    });
}

function handleMouseClick(event) {
    var p = getEventPosition(event);
    clickEvent(p);
}

function handleMouseMove(event) {
    //滑鼠移動事件
    var x = event.pageX;
    var y = event.pageY;
    var loc = getPointOnCanvas(x, y);
    if (canvasImg.isPutImg) {
        lastX = loc.x;
        lastY = loc.y;
        document.getElementById('x').value = (lastX / Zoom / fitZoom * canvasImg.scale).toFixed(2);
        document.getElementById('y').value = (lastY / Zoom / fitZoom * canvasImg.scale).toFixed(2);
    }
}

function getPointOnCanvas(x, y) {
    //獲取滑鼠在Canvas物件上座標(座標起始點從左上換到左下)
    var BCR = canvas.getBoundingClientRect();
    var width = canvas.width;
    var height = canvas.height;
    return {
        x: x - BCR.left * (width / BCR.width),
        y: height - (y - BCR.top * (height / BCR.height))
    };
}

/******************傳送要求到Server端************************/


/*------------------------------------*/
/*            接收並處理Alarm           */
/*------------------------------------*/

var alarm_dialog_count = -1;

function updateAlarmList() {
    var request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAlarmTop50List"]
    };
    var xmlHttp = createJsonXmlHttp("request");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            var list = "",
                items = 0;
            $(function () {
                for (var i = 0; i < revObj.id.length; i++) {
                    items = i;
                    list += "<tr><td>" + (items + 1) +
                        "</td><td>" + revObj[i].tag_alarm_type +
                        "</td><td>" + parseInt(revObj[i].tag_id.substring(8), 16) +
                        "</td><td>" + revObj[i].tag_time +
                        "</td></tr>";
                }
                $("#table_rightbar_alarm_list tbody").html(list);

                changeAlarmLight();

                if (items > alarm_dialog_count) {
                    isFocus = true;
                    isFocusNewAlarm = true;
                    var alarmID_new = revObj[items].tag_id;
                    //依照更新順序放入alarmTag的ID到變數   
                    //如果變數(alarm的ID)已經儲存進了alarm陣列中，那麼刪除已存在的第index項
                    //再把此alarm的ID值push到alarm陣列裡面
                    var index = alarmID_array.indexOf(alarmID_new);
                    if (index > -1)
                        alarmID_array.splice(index, 1);
                    alarmID_array.push(alarmID_new);

                    /*
                     * Alarm Card
                     */
                    var time_arr = TimeToArray(revObj[items].tag_time);
                    var thumb_id = "alarmCard_" + items;
                    var thumb_unlock_btn_id = "alarmCard_unlock_btn_" + items;
                    var thumb_focus_btn_id = "alarmCard_focus_btn_" + items;
                    var color = "";
                    switch (revObj[items].tag_alarm_type) {
                        case "Low Power Alarm":
                            color = "#33cc00";
                            break;
                        case "Help Alarm":
                            color = "#ff848467";
                            break;
                        case "Still Alarm":
                            color = "#FF6600";
                            break;
                        case "Active Alarm":
                            color = "#FF6600";
                            break;
                        default:
                            color = "#FFFFFF"; //unknown
                    }
                    $(".thumbnail_columns").append("<div class=\"thumbnail\" id=\"" + thumb_id + "\"" +
                        "style=\"background:" + color + "\">" +
                        "<table>" +
                        "<tr>" +
                        "<td>" +
                        "<img src=\"../image/user2.png\">" +
                        "</td>" +
                        "<td>" +
                        "<p>Number: " + (items + 1) + "</p>" +
                        "<p>Name: " + revObj[items].name + "</p>" +
                        "<p>ID: " + parseInt(revObj[items].tag_id.substring(8), 16) + "</p>" +
                        "<p>Date: " + time_arr.date + "</p>" +
                        "<p>Time: " + time_arr.time + "</p>" +
                        "<p>Status: " + revObj[items].tag_alarm_type + "</p>" +
                        "<button type=\"button\" class=\"btn btn-success\"" +
                        " id=\"" + thumb_unlock_btn_id + "\">" + $.i18n.prop('i_releasePosition') + "</button>" +
                        "<button type=\"button\" class=\"btn btn-info\" style=\"margin-left: 10px;\"" +
                        " id=\"" + thumb_focus_btn_id + "\">" + $.i18n.prop('i_position') +
                        "<i class=\"fas fa-map-marker-alt\"></i></button>" +
                        "</td>" +
                        "</tr>" +
                        "</table>" +
                        "</div>");
                    $("#" + thumb_unlock_btn_id).click(function () {
                        releaseFocusAlarm(revObj[items].tag_id);
                        $("#" + thumb_id).hide(); //警告卡片會消失
                        changeAlarmLight();
                    });
                    $("#" + thumb_focus_btn_id).click(function () {
                        changeFocusAlarm(revObj[items].tag_id);
                        changeAlarmLight();
                    });

                    /*{
                        "tag_alarm_type": "low_power",
                        "tag_id": "0000000000000017",
                        "tag_time": "2019/05/31/16:06:12:44"
                    }*/


                    /*
                     *  Alarm Dialog
                     */
                    $("#alarm_dialog").css('background-color', color);
                    $("#alarm_dialog_btn_unlock").unbind();
                    $("#alarm_dialog_btn_focus").unbind();
                    $("#alarm_dialog_number").text(items + 1);
                    $("#alarm_dialog_name").text(revObj[items].name);
                    $("#alarm_dialog_id").text(parseInt(revObj[items].tag_id.substring(8), 16));
                    $("#alarm_dialog_date").text(time_arr.date);
                    $("#alarm_dialog_time").text(time_arr.time);
                    $("#alarm_dialog_status").text(revObj[items].tag_alarm_type);
                    $("#alarm_dialog_btn_unlock").click(function () {
                        releaseFocusAlarm(revObj[items].tag_id);
                        $("#alarm_dialog").dialog("close");
                    });
                    $("#alarm_dialog_btn_focus").click(function () {
                        changeFocusAlarm(revObj[items].tag_id);
                    });
                    $("#alarm_dialog").dialog("open");
                }
            });
            alarm_dialog_count = items;
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

function TimeToArray(time_str) {
    if (time_str.length > 0) {
        var break_index = time_str.lastIndexOf("/");
        return {
            date: time_str.substring(0, break_index),
            time: time_str.substring(break_index + 1, time_str.length)
        };
    }
}

function changeAlarmLight() {
    $(function () {
        if (alarmID_array.length > 0) {
            $("#alarmSideBar_icon").css("color", "red");
        } else {
            $("#alarmSideBar_icon").css("color", "white");
        }
    });
}

function updateTagList() {
    var xmlHttp = createJsonXmlHttp("requestTagList_json");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (canvasImg.isPutImg) {
                var tbody = $("#table_rightbar_member_list tbody");
                tbody.empty();
                tagArray = [];
                for (i in revObj) {
                    //update tag array
                    tagArray.push({
                        x: revObj[i].tag_id,
                        y: revObj[i].tag_x / canvasImg.scale,
                        id: canvasImg.height - revObj[i].tag_y / canvasImg.scale,
                        system_time: revObj[i].tag_time
                    });

                    //update member list
                    tbody.append("<tr><td>" + (i + 1) +
                        "</td><td>" + revObj[i].tag_id +
                        "</td><td>" + revObj[i].number +
                        "</td><td>" + revObj[i].Name +
                        "</td></tr>");
                }

                //定時比對tagArray更新alarmArray
                var alarmIndex = -1;
                alarmArray = []; //每次更新都必須重置alarmArray
                if (alarmID_array.length > 0) {
                    for (j in alarmID_array) {
                        alarmIndex = tagArray.findIndex(function (tags) {
                            return tags.id == alarmID_array[j]; // 比對Alarm與Tag的ID
                        });
                        if (alarmIndex > -1)
                            alarmArray.push(tagArray[alarmIndex]); //依序將Tag資料放入AlarmArray中
                    }
                }
            }
        }
    };
    xmlHttp.send();
}

function drawAnchor(dctx, id, type, x, y) {
    if (type == "main")
        dctx.fillStyle = "red";
    else
        dctx.fillStyle = "blue";
    dctx.font = 13 * 3 / canvasImg.scale + 'px serif';
    dctx.fillText(id, x - 15, y - 6); //anchorID
    dctx.fillRect(x - 5, y - 5, 10 * 3 / canvasImg.scale, 10 * 3 / canvasImg.scale);
}

function drawTags(dctx, id, x, y) {
    var radius = 10; //半徑
    dctx.beginPath();
    //circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
    dctx.arc(x, y - radius * 2, radius, Math.PI * (1 / 6), Math.PI * (5 / 6), true);
    dctx.lineTo(x, y);
    dctx.closePath();
    dctx.strokeStyle = '#145214';
    dctx.stroke()
    dctx.fillStyle = '#2eb82e';
    dctx.fill();
    dctx.beginPath();
    dctx.arc(x, y - radius * 2, radius / 2.5, 0, Math.PI * 2, true);
    dctx.closePath();
    dctx.fillStyle = '#ffffff';
    dctx.fill();
}

/*function drawAlarm() { //test
    if (alarm_image.isOnload) {
        if (focusAlarmTag_ID == "") {
            alarmArray.forEach(function (v) {
                ctx.drawImage(alarm_image.image, v.x - 13, v.y - 22, 25, 25 * alarm_image.size);
            });
        } else {
            var array = {};
            var f_index = alarmArray.findIndex(function (tags) {
                return tags.id == focusAlarmTag_ID; // 比對Alarm與Tag的ID
            });
            alarmArray.forEach(function (v) {
                if (v.id != focusAlarmTag_ID)
                    array.push(v);
            });
            array.push(alarmArray[f_index]);
            array.forEach(function (v) {
                ctx.drawImage(alarm_image.image, v.x - 13, v.y - 22, 25, 25 * alarm_image.size);
            });
        }
    }
}*/

/*function drawAlarmTags(dctx, id, x, y) {
    if (alarm_image.isOnload) {
        if (id != focusAlarmTag_ID) {
            dctx.drawImage(alarm_image.image, x - 13, y - 22, 25, 25 * alarm_image.size);
        } else {
            //dctx.drawImage(bling_image.image, x - 13, y - 22, 25, 25 * alarm_image.size);
            var image = new Image();
            image.src = '../image/alarm_dot.png';
            image.onload = function () {
                dctx.drawImage(this, x - 13, y - 22, 25, 25 * alarm_image.size);
            };
        }
        //dctx.fillStyle = '#ff8c1a';
        //dctx.font = '10px serif';
        //dctx.strokeText(id, x, y); //tagID
    }
}*/

function drawAlarmTags(dctx, id, x, y) {
    var radius = 10; //半徑

    //畫倒水滴形
    dctx.beginPath();
    dctx.arc(x, y - radius * 2, radius, Math.PI * (1 / 6), Math.PI * (5 / 6), true);
    dctx.lineTo(x, y);
    dctx.closePath();
    dctx.fillStyle = '#ff3333';
    dctx.fill();

    //畫中心白色圓形
    dctx.beginPath();
    dctx.arc(x, y - radius * 2, radius * 2 / 3, 0, Math.PI * 2, true);
    dctx.closePath();
    dctx.fillStyle = '#ffffff';
    dctx.fill();

    //畫驚嘆號
    dctx.fillStyle = '#e60000';
    dctx.beginPath();

    var start = {
        x: x - radius * 0.1,
        y: y + radius * (-1.9)
    };
    var cp1 = {
        x: x - radius * 0.3,
        y: y - radius * 2.46
    };
    var cp2 = {
        x: x - radius * 0.1,
        y: y - radius * 2.48
    };
    var end = {
        x: x,
        y: y - radius * 2.5
    };

    dctx.lineTo(start.x, start.y);
    dctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);

    start = {
        x: x,
        y: y - radius * 2.5
    };
    cp1 = {
        x: x + radius * 0.1,
        y: y - radius * 2.48
    };
    cp2 = {
        x: x + radius * 0.3,
        y: y - radius * 2.46
    };
    end = {
        x: x + radius * 0.1,
        y: y + radius * (-1.9)
    };

    dctx.lineTo(start.x, start.y);
    dctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);

    start = {
        x: x + radius * 0.1,
        y: y + radius * (-1.9)
    };
    cp1 = {
        x: x + radius * 0.04,
        y: y + radius * (-1.8)
    };
    cp2 = {
        x: x - radius * 0.04,
        y: y + radius * (-1.8)
    };
    end = {
        x: x - radius * 0.1,
        y: y + radius * (-1.9)
    };

    dctx.lineTo(start.x, start.y);
    dctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    dctx.fill();

    //畫驚嘆號的圓點
    dctx.beginPath();
    dctx.arc(x, y + radius * (-1.6), radius * 0.1, 0, Math.PI * 2, true);
    dctx.fill();
    dctx.closePath();
}

function focusAlarmTag(x, y) {
    if (isFocus) {
        //var cvsWidth_helf = canvas.width / 2;
        //var cvsHeight_helf = canvas.height / 2; //以後應該以延展版的地圖為基準(可能還要乘上延展倍率)
        var cvsBlock_width = parseFloat($("#cvsBlock").css("width"));
        var cvsBlock_height = parseFloat($("#cvsBlock").css("height"));
        Zoom = 2.0;
        var end_x = cvsBlock_width / 2 - parseFloat(x) * Zoom;
        var end_y = cvsBlock_height / 2 - parseFloat(y) * Zoom;
        $("#canvas").css("margin-left", end_x + "px").css("margin-top", end_y + "px");
    }
}

function changeFocusAlarm(alarm_id) { //改變鎖定定位的Alarm目標
    isFocus = true;
    isFocusNewAlarm = false; //先解除鎖定在最新一筆AlarmTag
    var index = alarmArray.findIndex(function (tags) { //抓取指定AlarmTag的位置
        return tags.id == alarm_id;
    });
    if (index > -1) {
        focusAlarmIndex = index;
        console.log("focusAlarmIndex: " + focusAlarmIndex);
    } else {
        var alarmIndex = tagArray.findIndex(function (tags) {
            return tags.id == alarm_id; // 比對Alarm與Tag的ID
        });
        if (alarmIndex > -1) {
            alarmID_array.push(alarm_id); //新增成alarmID_array的最新一筆
            alarmArray.push(tagArray[alarmIndex]); //新增成alarmArray的最新一筆
            focusAlarmIndex = alarmArray.length - 1; //所以抓取最後一筆
        }
    }
    focusAlarmTag_ID = alarm_id;
}

function releaseFocusAlarm(alarm_id) { //解除指定的alarm
    isFocusNewAlarm = true;
    focusAlarmTag_ID = "";
    var index = alarmID_array.indexOf(alarm_id);
    if (index > -1)
        alarmID_array.splice(index, 1);
}

function unlockFocusAlarm() { //解除定位
    isFocus = false;
    //恢復原比例
    xleftView = 0;
    ytopView = 0;
    Zoom = zoomOriginal;
    fitZoom = 1;
    ctx.restore();
    ctx.save();
    isFitWindow = false;
    $(function () {
        $("#canvas").css("margin-left", 0 + "px").css("margin-top", 0 + "px");
    });
    setSize();
}

function draw() {
    setSize();
    anchorArray.forEach(function (v) {
        drawAnchor(ctx, v.id, v.type, v.x, v.y);
    });
    tagArray.forEach(function (v) {
        drawTags(ctx, v.id, v.x, v.y);
    });
    alarmArray.forEach(function (v) {
        drawAlarmTags(ctx, v.id, v.x, v.y);
    });
    //drawAlarm();
    var numberOfAlarms = alarmID_array.length;
    if (numberOfAlarms > 0) {
        if (isFocusNewAlarm) {
            focusAlarmTag(alarmArray[alarmArray.length - 1].x, alarmArray[alarmArray.length - 1].y);
        } else {
            focusAlarmTag(alarmArray[focusAlarmIndex].x, alarmArray[focusAlarmIndex].y);
        }
    } else {
        isFocus = false;
    }
}


function autoSendRequest() {
    /*if (!AnchorPosition) {
        //updateAlarmList()
        updateTagList();
        draw();
        canvas.removeEventListener("click", handleAnchorPosition);
        //cvsBlock.style.overflow = 'hidden';
    } else {
        draw();
        var posX = lastX;
        var posY = (canvas.height - lastY);
        drawAnchorPosition(ctx, posX, posY);
        canvas.addEventListener("click", handleAnchorPosition);
        //cvsBlock.style.overflow = 'auto';
    }*/

    updateTagList();
    draw();
}

function StartClick() {
    var delaytime = 100;
    var requestArray = {
        "Command_Type": ["Write"],
        "Command_Name": ["Launch"]
    };
    if (canvasImg.isPutImg) {
        if (!isStart) {
            isStart = true;
            requestArray.Value = "Start";
            document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-pause\">" +
                "</i><span>" + $.i18n.prop('i_stop') + "</span>";
            //設定計時器
            //pageTimer["timer1"] = setInterval("autoSendRequest()", delaytime);
            pageTimer["timer1"] = setTimeout(function request() {
                autoSendRequest();
                pageTimer["timer1"] = setTimeout(request, delaytime);
            }, delaytime);
        } else {
            isStart = false;
            requestArray.Value = "Stop";
            document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\">" +
                "</i><span>" + $.i18n.prop('i_start') + "</span>";
            for (var each in pageTimer) {
                //clearInterval(pageTimer[each]);
                clearTimeout(pageTimer[each]);
            }
        }
        var xmlHttp = GetXmlHttpObject();
        if (xmlHttp == null) {
            alert("Browser does not support HTTP Request");
            return;
        }
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                return 0;
            }
        };
        xmlHttp.open("POST", "test2", true);
        xmlHttp.setRequestHeader("Content-type", "application/json");
        xmlHttp.send(JSON.stringify(requestArray));
    }
}