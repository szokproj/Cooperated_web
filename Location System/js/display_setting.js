function drawPosition(color, size) {
    var canvas = document.getElementById('canvas_dot');
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
    var canvas = document.getElementById('canvas_map');
    var img = new Image();
    img.src = src;
    img.onload = function () {
        canvas.style.backgroundImage = "url(" + src + ")";
        canvas.style.backgroundSize = img.width + "px " + img.height + "px";
        canvas.width = img.width * PIXEL_RATIO;
        canvas.height = img.height * PIXEL_RATIO;
        canvas.style.width = img.width + 'px';
        canvas.style.height = img.height + 'px';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save(); //紀錄原比例
    };
}

var displayType = ["Sales", "Account", "RD", "PD"];
var alarmStatus = ["Low Power", "Help", "Still", "Active"];
var deptDot = {
    "Values": [{
            "type": "Sales",
            "color": "#FFC107",
            "size": "10"
        },
        {
            "type": "Account",
            "color": "#CDDC39",
            "size": "10"
        },
        {
            "type": "RD",
            "color": "	#00BCD4",
            "size": "10"
        },
        {
            "type": "PD",
            "color": "#9C27B0",
            "size": "10"
        }
    ]
}

var alarmDot = {
    "Values": [{
            "type": "Sales",
            "outside_color": "#4CAF50",
            "inside_color": "#4CAF50",
            "size": "10"
        },
        {
            "type": "Account",
            "outside_color": "#F44336",
            "inside_color": "#F44336",
            "size": "10"
        },
        {
            "type": "RD",
            "outside_color": "	#FF5722",
            "inside_color": "#FF5722",
            "size": "10"
        },
        {
            "type": "PD",
            "outside_color": "#FF5722",
            "inside_color": "#FF5722",
            "size": "10"
        }
    ]
}

$(function () {
    for (i in displayType) {
        $("#table_display_type").append(
            "<tr id=\"tr_display_type_" + i + "\"><td>" + displayType[i] + "</td>" +
            "<td></td>" +
            "<td></td>" +
            "<td><label for=\"display_type_edit_" + i + "\" class=\"custom-file-download\">" +
            "<img src=\"../image/edit.png\" style=\"max-width:20px; margin-right: 20px;\" ></label>" +
            "<input type=\"button\" id=\"display_type_edit_" + i + "\" class=\"image-btn\" " +
            "onclick=\"EditDotType(\'tr_display_type_" + i + "\')\" />" +
            "<label for=\"display_type_remove_" + i + "\" class=\"custom-file-download\">" +
            "<img src=\"../image/remove.png\" style=\"max-width:20px;\" ></label>" +
            "<input type=\"button\" id=\"display_type_remove_" + i + "\" class=\"image-btn\" /></td></tr>"
        );
    }

    for (j in alarmStatus) {
        $("#table_alarm_status").append(
            "<tr id=\"tr_alarm_status_" + j + "\"><td>" + alarmStatus[j] + "</td>" +
            "<td></td>" +
            "<td></td>" +
            "<td></td>" +
            "<td><label for=\"alarm_status_edit_" + j + "\" class=\"custom-file-download\">" +
            "<img src=\"../image/edit.png\" style=\"max-width:20px; margin-right: 20px;\" ></label>" +
            "<input type=\"button\" id=\"alarm_status_edit_" + j + "\" class=\"image-btn\" " +
            "onclick=\"EditAlarmDotType(\'tr_alarm_status_" + j + "\')\" />" +
            "<label for=\"alarm_status_remove_" + j + "\" class=\"custom-file-download\">" +
            "<img src=\"../image/remove.png\" style=\"max-width:20px;\" ></label>" +
            "<input type=\"button\" id=\"alarm_status_remove_" + j + "\" class=\"image-btn\" /></td></tr>"
        );
    }

    drawPosition('#4CAF50', '12'); //預設的點顏色
    drawAlarm('#F44336', '#F43636', '12'); //預設的警報顏色

    /**
     *  設置在編輯框內調整大小的滑塊條
     */
    $("#dot_edit_slider").slider({
        value: 12,
        min: 2,
        max: 30,
        step: 2,
        slide: function (event, ui) {
            $("#dot_edit_size").val(ui.value);
        }
    });
    $("#dot_edit_size").val($("#dot_edit_slider").slider("value"));


    $("#alarm_dot_edit_slider").slider({
        value: 12,
        min: 2,
        max: 30,
        step: 2,
        slide: function (event, ui) {
            $("#alarm_dot_edit_size").val(ui.value);
        }
    });
    $("#alarm_dot_edit_size").val($("#alarm_dot_edit_slider").slider("value"));

    /**
     *  設定change事件
     */
    $("#dot_edit_color").change(function () {
        drawPosition($(this).val(), $("#dot_edit_size").val());
    });

    $("#dot_edit_slider").mousedown(function () {
        $(this).mousemove(function () {
            drawPosition($("#dot_edit_color").val(), $("#dot_edit_size").val());
        });

        $(this).mouseup(function () {
            $(this).unbind('mousemove');
        });
    });



    $("#alarm_dot_outside_color").change(function () {
        drawAlarm($(this).val(), $("#alarm_dot_inside_color").val(), $("#alarm_dot_edit_size").val());
    });

    $("#alarm_dot_inside_color").change(function () {
        drawAlarm($("#alarm_dot_outside_color").val(), $(this).val(), $("#alarm_dot_edit_size").val());
    });

    $("#alarm_dot_edit_slider").mousedown(function () {
        $(this).mousemove(function () {
            drawAlarm($("#alarm_dot_outside_color").val(), $("#alarm_dot_inside_color").val(),
                $("#alarm_dot_edit_size").val());
        });

        $(this).mouseup(function () {
            $(this).unbind('mousemove');
        });
    });
});