var token = "";
var PIXEL_RATIO; // 獲取瀏覽器像素比
var cvsBlock, canvas, ctx;
var canvasImg = {
    isPutImg: false,
    width: 0,
    height: 0,
    scale: 1 //預設比例尺為1:1
};
var serverImg = new Image();
// View parameters
var lastX = 0; //滑鼠最後位置的X座標
var lastY = 0; //滑鼠最後位置的Y座標
var xleftView = 0; //canvas的X軸位移(負值向左，正值向右)
var ytopView = 0; //canvas的Y軸位移(負值向上，正值向下)
var Zoom = 1.0; //縮放比例
var isFitWindow = true;
var map_id = "";
var mapCollection = {};
var historyData = {};
var times = 0;
var max_times = 0;
var isContinue = false;
var timeDelay = {
    search: [],
    draw: [],
    model: ""
};
var group_color = "#ff9933";
var timeslot_array = [];
var locate_tag = "";

$(function () {
    //Check this page's permission and load navbar
    token = getUser() ? getUser().api_token : "";
    if (!getPermissionOfPage("Timeline")) {
        alert("Permission denied!");
        window.location.href = '../index.html';
    }
    setNavBar("Timeline", "");

    $("#timeline_dialog").dialog({
        autoOpen: false
    });

    var dialog = $("#add_target_dialog");
    dialog.dialog({
        autoOpen: false,
        height: 200,
        width: 300,
        modal: true,
        buttons: {
            Confirm: function () {
                var target_id = $("#add_target_tag_id"),
                    targrt_color = $("#add_target_color");
                target_id.removeClass("ui-state-error");
                var valid = true && checkLength(target_id, $.i18n.prop('i_targetIdLangth'), 1, 16);
                if (valid) {
                    $("#table_target tbody").append("<tr><td><input type=\"checkbox\" name=\"chk_target_id\"" +
                        " value=\"" + target_id.val() + "\"/> " + target_id.val() + "</td>" +
                        "<td><input type=\"color\" name=\"input_target_color\" value=\"" + targrt_color.val() + "\" /></td>" +
                        "<td><button class=\"btn btn-default btn-focus\" onclick=\"locateTag(\'" + target_id.val() +
                        "\')\"><img class=\"icon-image\" src=\"../image/target.png\"></button></td></tr>");
                    dialog.dialog("close");
                }
            },
            Cancel: function () {
                dialog.dialog("close");
            }
        }
    });
    $("#btn_target_add").on('click', function () {
        stopTimeline();
        $("#add_target_tag_id").val("");
        $("#add_target_color").val("#00cc66");
        dialog.dialog("open");
    });
    $("#btn_target_delete").on('click', function () {
        stopTimeline();
        var save_array = [];
        $("input[name='chk_target_id']").each(function (i, tag_id) {
            if (!$(this).prop("checked"))
                save_array.push($(this).parents("tr").html());
        });
        $("#table_target tbody").empty();
        save_array.forEach(html => {
            $("#table_target tbody").append("<tr>" + html + "</tr>");
        });
    });

    $('#myModal').modal({
        backdrop: false,
        show: false
    });

    $("#canvas").on("mousedown", function (e) {
        e.preventDefault();
        var canvas_left = parseInt($("#canvas").css("margin-left"));
        var canvas_top = parseInt($("#canvas").css("margin-top"));
        var downx = e.pageX;
        var downy = e.pageY;
        $("#canvas").on("mousemove", function (es) {
            xleftView = es.pageX - downx + canvas_left;
            ytopView = es.pageY - downy + canvas_top;
            $("#canvas").css("margin-left", xleftView + "px").css("margin-top", ytopView + "px");
        });
        $("#canvas").on("mouseup", function () {
            $("#canvas").off("mousemove");
        });
    });

    //調整間隔時間的滑塊條
    $("#interval_slider").slider({
        value: 100,
        min: 0,
        max: 1000,
        step: 20,
        slide: function (event, ui) {
            $("#interval").val(ui.value);
        }
    });
    $("#interval").val($("#interval_slider").slider("value"));

    $("#interval_slider").mousedown(function () {
        $(this).mousemove(function () {
            clearDrawInterval();
            if (historyData["search_type"] && historyData["search_type"] == "Tag") {
                timeDelay["draw"].push(setInterval("drawNextTimeByTag()", $("#interval").val()));
            } else {
                timeDelay["draw"].push(setInterval("drawNextTimeByGroup()", $("#interval").val()));
            }
        });
        $(this).mouseup(function () {
            $(this).unbind('mousemove');
        });
    });

    $("#target_type").on('change', function () {
        if ($(this).val() == "Group") {
            $("#table_target").hide();
            $("#target_tag").hide();
            $("#target_group").show();
        } else {
            $("#target_group").hide();
            $("#table_target").show();
            $("#target_tag").show();
        }
    });

    $("#btn_resst_locate_tag").on('click', function () {
        changeLocateTag("");
    });

    $("input[name=radio_is_limit]").on("change", function () {
        if ($(this).prop('checked'))
            $("#limit_count").prop('disabled', $(this).val());
    });

    setup();
});


function myCanvas() {
    var PIXEL_RATIO,
        cvsBlock,
        canvas,
        ctx,
        lastX = 0, //滑鼠最後位置的X座標
        lastY = 0, //滑鼠最後位置的Y座標
        xleftView = 0, //canvas的X軸位移(負值向左，正值向右)
        ytopView = 0, //canvas的Y軸位移(負值向上，正值向下)
        Zoom = 1.0, //縮放比例
        isFitWindow = true,
        mapCollection = {},
        serverImg = new Image(),
        canvasImg = {
            isPutImg: false,
            width: 0,
            height: 0,
            scale: 1 //預設比例尺為1:1
        };

    this.getVariable = {
        canvasImg: canvasImg,
        serverImg: serverImg,
        lastX: lastX,
        lastY: lastY,
        xleftView: xleftView,
        ytopView: ytopView,
        isFitWindow: isFitWindow,
        mapCollection: mapCollection
    };

    this.setVariable = function (variable) {
        variable = variable || {};
        canvasImg = variable["canvasImg"] || canvasImg;
        serverImg = variable["serverImg"] || serverImg;
        lastX = variable["lastX"] || lastX;
        lastY = variable["lastY"] || lastY;
        xleftView = variable["xleftView"] || xleftView;
        ytopView = variable["ytopView"] || ytopView;
        isFitWindow = variable["isFitWindow"] || isFitWindow;
        mapCollection = variable["mapCollection"] || mapCollection;
    };

    setup();
    getMaps();

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
        canvas.addEventListener("DOMMouseScroll", handleMouseWheel, false); //畫面縮放(for Firefox)
        canvas.addEventListener('click', handleMouseClick, false); //點擊地圖上的tag，跳出tag的訊息框
        canvas.addEventListener("mousemove", handleMouseMove, false); //滑鼠在畫布中移動的座標
        canvas.addEventListener("mousewheel", handleMouseWheel, { //畫布縮放
            passive: true
        });
    }

    function getMaps() {
        /**
         * 接收並載入Server的地圖資訊
         * 取出物件所有屬性的方法，參考網址: 
         * https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
         */
        var xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success == 1) {
                    $("#target_map").empty();
                    revObj.Values.forEach(element => {
                        //mapCollection => key: map_id | value: {map_id, map_name, map_src, map_scale}
                        mapCollection[element.map_id] = {
                            map_id: element.map_id,
                            map_name: element.map_name,
                            map_src: "data:image/" + element.map_file_ext + ";base64," + element.map_file,
                            map_scale: element.map_scale
                        }
                        $("#target_map").append("<option value=\"" + element.map_id + "\">" + element.map_name + "</option>");
                    });
                    $("#target_map").on('change', function () {
                        var mapInfo = mapCollection[$(this).val()];
                        loadImage(mapInfo.map_src, mapInfo.map_scale);
                        restartCanvas();
                    });
                }
            }
        };
        xmlHttp.send(JSON.stringify({
            "Command_Type": ["Read"],
            "Command_Name": ["GetMaps"],
            "api_token": [token]
        }));
    }

    function setCanvas(img_src, width, height) {
        canvas.style.backgroundImage = "url(" + img_src + ")";
        canvas.style.backgroundSize = width + "px " + height + "px";
        canvas.width = width * PIXEL_RATIO;
        canvas.height = height * PIXEL_RATIO;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
    }

    function loadImage(map_url, map_scale) {
        map_scale = typeof (map_scale) != 'undefined' && map_scale != "" ? map_scale : 1;
        serverImg.src = map_url;
        serverImg.onload = function () {
            cvsBlock.style.background = "none";
            canvasImg.isPutImg = true;
            canvasImg.width = serverImg.width;
            canvasImg.height = serverImg.height;
            canvasImg.scale = map_scale;
            setCanvas(this.src, serverImg.width, serverImg.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            xleftView = 0;
            ytopView = 0;
            Zoom = 1.0;
            ctx.save(); //紀錄原比例

            var serImgSize = serverImg.width / serverImg.height;
            var cvs_width = parseFloat($("#cvsBlock").css("width"));
            var cvs_height = parseFloat($("#cvsBlock").css("height"));
            var cvsSize = cvs_width / cvs_height;
            if (serImgSize > cvsSize) { //原圖比例寬邊較長
                Zoom = cvs_width / serverImg.width;
                setCanvas(this.src, cvs_width, serverImg.height * Zoom);
            } else {
                Zoom = cvs_height / serverImg.height;
                setCanvas(this.src, serverImg.width * Zoom, cvs_height);
            }
            
            document.getElementById("btn_restore").disabled = false;
        };
    }

    return {
        loadImage: loadImage(map_url, map_scale),
        setSize: function (Zoom) { //縮放canvas與背景圖大小
            if (canvasImg.isPutImg) {
                canvas.style.backgroundSize = (canvasImg.width * Zoom) + "px " + (canvasImg.height * Zoom) + "px";
                canvas.width = canvasImg.width * PIXEL_RATIO * Zoom;
                canvas.height = canvasImg.height * PIXEL_RATIO * Zoom;
                canvas.style.width = canvasImg.width * Zoom + 'px';
                canvas.style.height = canvasImg.height * Zoom + 'px';
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
                ctx.scale(Zoom, Zoom);
                ctx.translate(0, 0);
            }
        }
    }
}







function restoreCanvas() {
    if (!canvasImg.isPutImg)
        return;
    $(function () {
        var cvsBlock_width = parseFloat($("#cvsBlock").css("width"));
        var cvsBlock_height = parseFloat($("#cvsBlock").css("height"));
        xleftView = 0;
        ytopView = 0;
        Zoom = 1.0;
        if (isFitWindow) { //恢復原比例
            ctx.restore();
            ctx.save();
            isFitWindow = false; //目前狀態:原比例
            document.getElementById("btn_restore").innerHTML = "<i class=\"fas fa-expand\"></i>";
        } else { //依比例拉伸(Fit in Window)
            if ((serverImg.width / serverImg.height) > (cvsBlock_width / cvsBlock_height)) //原圖比例寬邊較長
                Zoom = cvsBlock_width / serverImg.width;
            else
                Zoom = cvsBlock_height / serverImg.height;
            isFitWindow = true; //目前狀態:依比例拉伸
            document.getElementById("btn_restore").innerHTML = "<i class=\"fas fa-compress\"></i>";
        }
        $("#canvas").css("margin-left", 0 + "px").css("margin-top", 0 + "px");
        reDrawTag(ctx);
    });
}

function restartCanvas() {
    $(function () {
        var cvsBlock_width = parseFloat($("#cvsBlock").css("width"));
        var cvsBlock_height = parseFloat($("#cvsBlock").css("height"));
        xleftView = 0;
        ytopView = 0;
        if ((serverImg.width / serverImg.height) > (cvsBlock_width / cvsBlock_height)) //原圖比例寬邊較長
            Zoom = cvsBlock_width / serverImg.width;
        else
            Zoom = cvsBlock_height / serverImg.height;
        $("#canvas").css("margin-left", 0 + "px").css("margin-top", 0 + "px");
        reDrawTag(ctx);
    });
}



function handleMouseMove(event) { //滑鼠移動事件
    var p = getPointOnCanvas(event.pageX, event.pageY);
    lastX = p.x;
    lastY = p.y;
}