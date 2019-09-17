var token = "";
var default_color = '#2eb82e';
var default_size = 10;

$(function () {
    //Check this page's permission and load navbar
    token = getUser() ? getUser().api_token : "";
    if (!getPermissionOfPage("Member_Setting")) {
        alert("Permission denied!");
        window.location.href = '../index.html';
    }
    setNavBar("Member_Setting", "Preview_Color_Setting");

    $("#display_type_select").change(function () {
        var index = $("#display_type_select").children('option:selected').index();
        updateTypeColorList(index);
    });
    //刷新頁面後首先載入dept的設定
    updateTypeColorList(0);

    //套用預設的點顏色與大小
    drawPosition(default_color);
});

function updateTypeColorList(index) {
    $("#table_display_type tbody").empty();
    switch (index) {
        case 0: //部門
            $("#row_name").text($.i18n.prop('i_dept'));
            var request = {
                "Command_Type": ["Read"],
                "Command_Name": ["GetDepartment_relation_list"],
                "api_token": [token]
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
                                " onclick=\"drawPosition('" + revInfo[i].color + "')\" />" +
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
                "Command_Name": ["GetJobTitle_relation_list"],
                "api_token": [token]
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
                                " onclick=\"drawPosition('" + revInfo[i].color + "')\" />" +
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
                "Command_Name": ["GetUserTypes"],
                "api_token": [token]
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
                                " onclick=\"drawPosition('" + revInfo[i].color + "')\" />" +
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
                "Command_Name": ["GetStaffs"],
                "api_token": [token]
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
                                    " onclick=\"drawPosition('" + revInfo[i].color + "')\" />" +
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

function drawPosition(color) {
    var canvas = document.getElementById('canvas_preview');
    var ctx = canvas.getContext('2d');
    var x = canvas.width / 2,
        y = canvas.height / 2,
        radius = default_size;

    ctx.clearRect(0, 0, canvas.width, canvas.height); //先還原

    //畫倒水滴形
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.arc(x, y, radius, Math.PI * (1 / 6), Math.PI * (5 / 6), true);
    ctx.lineTo(x, y + radius * 2);
    ctx.closePath();
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    ctx.fillStyle = color; //'#00e68a';
    ctx.fill();
    //畫中心白色圓形
    ctx.beginPath();
    ctx.arc(x, y, radius / 2.5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
}