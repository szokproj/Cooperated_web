$(function () {
    var size = 10,
        default_color = '#4CAF50',
        dialog, form, change,
        sel_name = $("#set_type_name"),
        sel_color = $("#set_dot_color"),
        allFields = $([]).add(sel_name, sel_color);
    //tips = $( ".validateTips" );


    $("#set_dot_color").change(function () { //設定change事件
        drawPosition($(this).val(), size);
    });
    $("#set_type_add").click(function () {
        addType();
    });
    dialog = $("#dialog_set_type").dialog({
        autoOpen: false,
        height: 500,
        width: 400,
        modal: true,
        buttons: {
            "Confirm": SendResult,
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });
    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        SendResult();
    });


    function SendResult() {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(sel_name, "type set", 0, 20);
        valid = valid && checkLength(sel_color, "type set", 0, 20);
        if (valid) {
            var request = {};
            if (change == "add") {
                request = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["AddUserType"],
                    "Value": [{
                        "type": sel_name.val(),
                        "color": colorToHex(sel_color.val())
                    }]
                }
            } else if (change == "edit") {
                request = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["EditUserType"],
                    "Value": {
                        "type": sel_name.val(),
                        "color": colorToHex(sel_color.val())
                    }
                }
            } else {
                return;
            }
            var xmlHttp = createJsonXmlHttp('sql');
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        updateTypeList();
                    } else {
                        alert("Operating failed!");
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
            dialog.dialog("close");
        }
        return valid;
    }


    function updateTypeList() {
        $("#table_type_list tbody").empty();
        var request_getData = {
            "Command_Type": ["Read"],
            "Command_Name": ["GetUserTypes"]
        }
        var xmlHttp = createJsonXmlHttp('sql');
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                var revInfo = revObj.Values;
                if (revObj.success > 0) {
                    for (i = 0; i < revInfo.length; i++) {
                        $("#table_type_list tbody").append("<tr>" +
                            "<td>" + (i + 1) + "</td>" +
                            "<td>" + revInfo[i].type + "</td>" +
                            "<td>" + revInfo[i].color + "</td>" +
                            "<td><label for=\"display_type_edit_" + i + "\" class=\"custom-file-download\">" +
                            "<img src=\"../image/edit.png\" style=\"max-width:20px; margin-right: 20px;\" ></label>" +
                            "<input type=\"button\" class=\"image-btn\"" +
                            " onclick=\"editType(\'" + revInfo[i].type + "," + revInfo[i].color + "\')\" />" +
                            "<label for=\"display_type_remove_" + i + "\" class=\"custom-file-download\">" +
                            "<img src=\"../image/remove.png\" style=\"max-width:20px;\" ></label>" +
                            "<input type=\"button\" class=\"image-btn\"" +
                            " onclick=\"delectType(\'" + revInfo[i].type + "\')\" /></td>" +
                            "</tr>");
                    }
                }
            }
        };
        xmlHttp.send(JSON.stringify(request_getData));
    }

    function addType() {
        change = "add"
        sel_name.val("");
        sel_name.attr("readonly",false);
        sel_color.val(default_color);
        sel_color.css('background-color', default_color);
        drawPosition(default_color, size); //預設的點顏色
        dialog.dialog("open");
    }

    function editType(name, color) {
        change = "edit";
        sel_name.val(name);
        sel_name.attr("readonly",true);
        var hex_color = colorToHex(color);
        sel_color.val(hex_color);
        sel_color.css('background-color', hex_color);
        drawPosition(hex_color, size); //預設的點顏色
        dialog.dialog("open");
    }

    function delectType(name) {
        var request_delete = {
            "Command_Type": ["Read"],
            "Command_Name": ["DeleteUserTypes"],
            "Value": [{
                "type": name
            }]
        }
        var xmlHttp = createJsonXmlHttp('sql');
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    updateTypeList();
                } else {
                    alert("Operating failed!");
                }
            }
        };
        xmlHttp.send(JSON.stringify(request_delete));
    }

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
});