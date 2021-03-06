var token = "",
    size = 10,
    default_color = '#2eb82e',
    change = "",
    usertypeNameArray = [];

$(function () {
    var h = document.documentElement.clientHeight;
    $(".container").css("height", h - 10 + "px");

    //Check this page's permission and load navbar
    token = getToken();
    if (!getPermissionOfPage("Member_Setting")) {
        alert("Permission denied!");
        window.location.href = '../index.html';
    }
    setNavBar("Member_Setting", "User_Type_Setting");

    $("#set_dot_color").change(function () { //設定change事件
        drawPosition($(this).val(), size);
    });

    $("#set_type_add").click(function () {
        addType();
    });

    var dialog, form,
        sel_name = $("#set_type_name"),
        sel_color = $("#set_dot_color"),
        allFields = $([]).add(sel_name, sel_color),
        tips = $(".validateTips");

    var SendResult = function () {
        $("#set_type_name").removeClass("ui-state-error");
        $("#set_dot_color").removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength($("#set_type_name"), "type set", 0, 20);
        valid = valid && checkLength($("#set_dot_color"), "type set", 0, 20);

        if (change == "add") {
            //因為type儲存為key值，所以必須先檢查是否新的type與舊的重複
            usertypeNameArray.forEach(function (v) {
                if (v == $("#set_type_name").val()) {
                    valid = false;
                    $("#set_type_name").addClass("ui-state-error");
                    updateTips($.i18n.prop('i_alertError_5'));
                }
            });
        }

        if (valid) {
            var request = {};
            if (change == "add") {
                request = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["AddUserType"],
                    "Value": [{
                        "type": $("#set_type_name").val(),
                        "color": colorToHex($("#set_dot_color").val())
                    }],
                    "api_token": [token]
                }
            } else if (change == "edit") {
                request = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["EditUserType"],
                    "Value": {
                        "type": $("#set_type_name").val(),
                        "color": colorToHex($("#set_dot_color").val())
                    },
                    "api_token": [token]
                }
            } else {
                return;
            }
            var xmlHttp = createJsonXmlHttp('sql');
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                        updateTypeList();
                    } else {
                        alert($.i18n.prop('i_alertError_6'));
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
            $("#dialog_set_type").dialog("close");
        }
        return valid;
    };

    dialog = $("#dialog_set_type").dialog({
        autoOpen: false,
        height: 450,
        width: 400,
        modal: true,
        buttons: {
            "Confirm": SendResult,
            Cancel: function () {
                dialog.dialog("close");
                form[0].reset();
                allFields.removeClass("ui-state-error");
                tips.empty();
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
            tips.empty();
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        SendResult();
        tips.empty();
    });

    updateTypeList();
});

function updateTypeList() {
    $("#table_type_list tbody").empty();
    usertypeNameArray = [];
    var request_getData = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetUserTypes"],
        "api_token": [token]
    }
    var xmlHttp = createJsonXmlHttp('sql');
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                var revInfo = revObj.Value[0].Values;
                for (i = 0; i < revInfo.length; i++) {
                    $("#table_type_list tbody").append("<tr>" +
                        "<td>" + (i + 1) + "</td>" +
                        "<td>" + revInfo[i].type + "</td>" +
                        "<td>" + revInfo[i].color + "</td>" +
                        "<td style=\"background-color:" + revInfo[i].color + "\"></td>" +
                        "<td><label for=\"btn_edit_" + i + "\" class=\"custom-file-download\">" +
                        "<img src=\"../image/edit.png\" style=\"max-width:20px; margin-right: 20px;\" ></label>" +
                        "<input type=\"button\" class=\"image-btn\" id=\"btn_edit_" + i + "\"" +
                        " onclick=\"editType(\'" + revInfo[i].type + "\',\'" + revInfo[i].color + "\')\">" +
                        "<label for=\"btn_delete_" + i + "\" class=\"custom-file-download\">" +
                        "<img src=\"../image/remove.png\" style=\"max-width:20px;\" ></label>" +
                        "<input type=\"button\" class=\"image-btn\" id=\"btn_delete_" + i + "\"" +
                        " onclick=\"deleteType(\'" + revInfo[i].type + "\')\">" +
                        "</td></tr>");
                    usertypeNameArray.push(revInfo[i].type);
                }
            }
        }
    };
    xmlHttp.send(JSON.stringify(request_getData));
}


function addType() {
    change = "add"
    $("#set_type_name").val("");
    $("#set_type_name").attr("disabled", false);
    $("#edit_tip").text("");
    $("#set_dot_color").val(default_color);
    drawPosition(default_color, size); //預設的點顏色
    $("#dialog_set_type").dialog("open");
}


function editType(name, color) {
    name = typeof (name) != 'undefined' ? name : "";
    color = typeof (color) != 'undefined' ? color : "";
    change = "edit";
    $("#set_type_name").val(name);
    $("#set_type_name").attr("disabled", true);
    $("#edit_tip").text($.i18n.prop('i_alertError_7'));
    var hex_color = colorToHex(color);
    $("#set_dot_color").val(hex_color);
    drawPosition(hex_color, size); //預設的點顏色
    $("#dialog_set_type").dialog("open");
}


function deleteType(name) {
    name = typeof (name) != 'undefined' ? name : "";
    var request_delete = {
        "Command_Type": ["Read"],
        "Command_Name": ["DeleteUserType"],
        "Value": [{
            "type": name
        }],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp('sql');
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                updateTypeList();
            } else {
                alert($.i18n.prop('i_alertError_8'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(request_delete));
}

function colorToHex(color) {
    color = typeof (color) != "string" ? color.toString() : color;
    if (color.indexOf('#') == 0) {
        return color;
    } else {
        var colorArr = color.substring(color.indexOf("(") + 1, color.length - 1).split(",");
        var hexColor = "#";
        for (i = 0; i < colorArr.length; i++) {
            if (i == 3) {
                var persentHex = Number(Math.floor(colorArr[i] * 255)).toString(16);
                if (hexColor != "FF")
                    hexColor += persentHex.length === 1 ? "0" + persentHex : persentHex;
            } else {
                var hexStr = Number(colorArr[i]).toString(16);
                hexColor += hexStr.length === 1 ? "0" + hexStr : hexStr;
            }
        }
        return hexColor.toUpperCase();
    }
}

function colorToRGBA(color) {
    color = typeof (color) != "string" ? color.toString() : color;
    if (color.indexOf('#') == 0) {
        colorLen = color.length;
        if (colorLen == 7) { //rgb
            var r = parseInt(color.substring(1, 2), 16);
            var g = parseInt(color.substring(3, 4), 16);
            var b = parseInt(color.substring(5, 6), 16);
            return 'rgb(' + r + ', ' + g + ', ' + b + ')';
        } else if (colorLen == 9) { //rgba
            var r = parseInt(color.substring(1, 2), 16);
            var g = parseInt(color.substring(3, 4), 16);
            var b = parseInt(color.substring(5, 6), 16);
            var a = parseInt(color.substring(7, 8), 16);
            return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
        } else {
            return color;
        }
    } else {
        return color;
    }
}

function drawPosition(color, size) {
    var canvas = document.getElementById('canvas_dot');
    var ctx = canvas.getContext('2d');
    var x = canvas.width / 2,
        y = canvas.height / 2,
        radius = size; //30;
    ctx.clearRect(0, 0, canvas.width, canvas.height); //先還原
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.arc(x, y - radius * 2, radius, Math.PI * (1 / 6), Math.PI * (5 / 6), true);
    //circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    ctx.fillStyle = color != "" ? color : '#2eb82e';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y - radius * 2, radius / 2.5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
}