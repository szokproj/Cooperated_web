var default_color = '#2eb82e';
var use_color = '';

$(function () {
    /**
     * Check this page's permission and load navbar
     */
    var permission = getPermissionOfPage("Member_Setting");
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
    setNavBar("Member_Setting", "Display_Setting");

    setTimeout(function () {
        $("#loading").hide();
    }, 500);

    $("#display_type_select").change(function () {
        var index = $("#display_type_select").children('option:selected').index();
        updateTypeColorList(index);
    });
    //刷新頁面後首先載入dept的設定
    updateTypeColorList(0);

    //設置在編輯框內調整大小的滑塊條
    $("#dot_size_slider").slider({
        value: 10,
        min: 2,
        max: 30,
        step: 2,
        slide: function (event, ui) {
            $("#dot_size_display").val(ui.value);
        }
    });
    $("#dot_size_display").val($("#dot_size_slider").slider("value"));

    //套用預設的點顏色與大小
    drawPosition(default_color, $("#dot_size_display").val());

    use_color = default_color;
    //設定change事件
    $("#dot_size_slider").mousedown(function () {
        $(this).mousemove(function () {
            drawPosition(use_color, $("#dot_size_display").val());
        });
        $(this).mouseup(function () {
            $(this).unbind('mousemove');
        });
    });

    $("#btn_size_submit").click(function () {
        submitSize($("#dot_size_display").val());
    });
});

function updateTypeColorList(index) {
    $("#table_display_type tbody").empty();
    switch (index) {
        case 0: //部門
            $("#row_name").text($.i18n.prop('i_dept'));
            var request = {
                "Command_Type": ["Read"],
                "Command_Name": ["GetDepartment_relation_list"]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        for (i = 0; i < revInfo.length; i++) {
                            $("#table_display_type").append("<tr id='tr_display_type_" + i + "'>" +
                                "<td>" + revInfo[i].children + "</td>" +
                                "<td>" + revInfo[i].color + "</td>" +
                                "<td style='text-align:center; background-color:" + revInfo[i].color + "'>" +
                                "<label for='display_type_preview_" + i + "' class='custom-file-download'>" +
                                "<i class='far fa-play-circle' style='font-size:24px; color:white;'></i></label>" +
                                "<input type='button' id='display_type_preview_" + i + "' class='image-btn'" +
                                " onclick=\"drawPosition('" + revInfo[i].color +
                                "','" + $("#dot_size_display").val() + "')\" />" +
                                "</td></tr>");
                        }
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
            break;
        case 1: //職稱
            $("#row_name").text($.i18n.prop('i_jobTitle'));
            var request = {
                "Command_Type": ["Read"],
                "Command_Name": ["GetJobTitle_relation_list"]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        for (i = 0; i < revInfo.length; i++) {
                            $("#table_display_type").append("<tr id='tr_display_type_" + i + "'>" +
                                "<td>" + revInfo[i].children + "</td>" +
                                "<td>" + revInfo[i].color + "</td>" +
                                "<td style='text-align:center; background-color:" + revInfo[i].color + "'>" +
                                "<label for='display_type_preview_" + i + "' class='custom-file-download'>" +
                                "<i class='far fa-play-circle' style='font-size:24px; color:white;'></i></label>" +
                                "<input type='button' id='display_type_preview_" + i + "' class='image-btn'" +
                                " onclick=\"drawPosition('" + revInfo[i].color +
                                "','" + $("#dot_size_display").val() + "')\" />" +
                                "</td></tr>");
                        }
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
            break;
        case 2: //用戶類型
            $("#row_name").text($.i18n.prop('i_userType'));
            var request = {
                "Command_Type": ["Read"],
                "Command_Name": ["GetUserTypes"]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        for (i = 0; i < revInfo.length; i++) {
                            $("#table_display_type").append("<tr id='tr_display_type_" + i + "'>" +
                                "<td>" + revInfo[i].type + "</td>" +
                                "<td>" + revInfo[i].color + "</td>" +
                                "<td style='text-align:center; background-color:" + revInfo[i].color + "'>" +
                                "<label for='display_type_preview_" + i + "' class='custom-file-download'>" +
                                "<i class='far fa-play-circle' style='font-size:24px; color:white;'></i></label>" +
                                "<input type='button' id='display_type_preview_" + i + "' class='image-btn'" +
                                " onclick=\"drawPosition('" + revInfo[i].color +
                                "','" + $("#dot_size_display").val() + "')\" />" +
                                "</td></tr>");
                        }
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
            break;
        case 3: //自訂
            $("#row_name").text($.i18n.prop('i_number'));
            var request = {
                "Command_Type": ["Read"],
                "Command_Name": ["GetStaffs"]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        for (i = 0; i < revInfo.length; i++) {
                            if (revInfo[i].color_type == 'Custom') {
                                $("#table_display_type").append("<tr id='tr_display_type_" + i + "'>" +
                                    "<td>" + revInfo[i].number + "</td>" +
                                    "<td>" + revInfo[i].color + "</td>" +
                                    "<td style='text-align:center; background-color:" + revInfo[i].color + "'>" +
                                    "<label for='display_type_preview_" + i + "' class='custom-file-download'>" +
                                    "<i class='far fa-play-circle' style='font-size:24px; color:white;'></i></label>" +
                                    "<input type='button' id='display_type_preview_" + i + "' class='image-btn'" +
                                    " onclick=\"drawPosition('" + revInfo[i].color +
                                    "','" + $("#dot_size_display").val() + "')\" />" +
                                    "</td></tr>");
                            }
                        }
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
            break;
        default:
            break;
    }
}

function drawPosition(color, size) {
    use_color = color;
    var canvas = document.getElementById('canvas_preview');
    var ctx = canvas.getContext('2d');
    var x = canvas.width / 2,
        y = canvas.height / 2,
        radius = size; //30;

    ctx.clearRect(0, 0, canvas.width, canvas.height); //先還原

    //畫倒水滴形
    ctx.beginPath();
    ctx.arc(x, y, radius, Math.PI * (1 / 6), Math.PI * (5 / 6), true);
    ctx.lineTo(x, y + radius * 2);
    ctx.closePath();
    ctx.fillStyle = color; //'#00e68a';
    ctx.fill();
    //畫中心白色圓形
    ctx.beginPath();
    ctx.arc(x, y, radius / 2.5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
}

function drawAlarm(outsideColor, insideColor, size) {
    var canvas = document.getElementById('canvas_alarm_dot');
    var ctx = canvas.getContext('2d');
    var x = canvas.width / 2,
        y = canvas.height / 2,
        radius = size; //30;

    ctx.clearRect(0, 0, canvas.width, canvas.height); //先還原

    //畫倒水滴形
    ctx.beginPath();
    ctx.arc(x, y, radius, Math.PI * (1 / 6), Math.PI * (5 / 6), true);
    ctx.lineTo(x, y + radius * 2);
    ctx.closePath();
    ctx.fillStyle = outsideColor; //'#ff3333';
    ctx.fill();

    //畫中心白色圓形
    ctx.beginPath();
    ctx.arc(x, y, radius * 2 / 3, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    //畫驚嘆號
    ctx.fillStyle = insideColor; //'#e60000';
    ctx.beginPath();

    var start = {
        x: x - radius * 0.1,
        y: y + radius * 0.1
    };
    var cp1 = {
        x: x - radius * 0.3,
        y: y - radius * 0.46
    };
    var cp2 = {
        x: x - radius * 0.1,
        y: y - radius * 0.48
    };
    var end = {
        x: x,
        y: y - radius * 0.5
    };

    ctx.lineTo(start.x, start.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);

    start = {
        x: x,
        y: y - radius * 0.5
    };
    cp1 = {
        x: x + radius * 0.1,
        y: y - radius * 0.48
    };
    cp2 = {
        x: x + radius * 0.3,
        y: y - radius * 0.46
    };
    end = {
        x: x + radius * 0.1,
        y: y + radius * 0.1
    };

    ctx.lineTo(start.x, start.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);

    start = {
        x: x + radius * 0.1,
        y: y + radius * 0.1
    };
    cp1 = {
        x: x + radius * 0.04,
        y: y + radius * 0.2
    };
    cp2 = {
        x: x - radius * 0.04,
        y: y + radius * 0.2
    };
    end = {
        x: x - radius * 0.1,
        y: y + radius * 0.1
    };

    ctx.lineTo(start.x, start.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    ctx.fill();

    //畫驚嘆號的圓點
    ctx.beginPath();
    ctx.arc(x, y + radius * 0.4, radius * 0.1, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.closePath();
}

function loadFile(input) {
    var file = input.files[0];
    var src = URL.createObjectURL(file);
    var canvas = document.getElementById('canvas_preview');
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.src = src;
    img.onload = function () {
        canvas.style.backgroundImage = "url(" + src + ")";
        canvas.style.backgroundSize = img.width + "px " + img.height + "px";
        /*canvas.width = img.width * PIXEL_RATIO;
        canvas.height = img.height * PIXEL_RATIO;
        canvas.style.width = img.width + 'px';
        canvas.style.height = img.height + 'px';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save(); //紀錄原比例
        */
    };
}

function submitSize(size) {
    var request = {
        "Command_Type": ["Write"],
        "Command_Name": [""],
        "Value": {
            "size": size
        }
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0)
                alert($.i18n.prop('i_alertError_4'));
        }
    };
    xmlHttp.send(JSON.stringify(request));
}