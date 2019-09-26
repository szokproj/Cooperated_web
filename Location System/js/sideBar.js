var leftSide_isOpen = false;
var rightSide_isOpen = false;

function alarmSidebarMove() {
    $(function () {
        //側邊欄由左向右滑動
        if (!leftSide_isOpen) {
            $('#content').addClass('left_open');
            $('.sideBar').animate({
                left: '30px'
            }, 370); //0
        } else {
            //側邊欄由右向左滑動
            $('#content').removeClass('left_open');
            $('.sideBar').animate({
                left: '-330px'
            }, 310); //-330
        }
        leftSide_isOpen = !leftSide_isOpen;
    });
}

function tagSidebarMove() {
    $(function () {
        var $aside = $('#page_rightSide > aside');
        if (!rightSide_isOpen) {
            $('#content').addClass('right_open');
            $aside.stop(true).animate({
                right: '0px'
            }, 350);
        } else {
            $('#content').removeClass('right_open');
            $aside.stop(true).animate({
                right: '-350px'
            }, 310);
        }
        rightSide_isOpen = !rightSide_isOpen;
    });
}

/**
 * About Alarm Data Setting
 */
function inputAlarmData(element, i) {
    /**
     * Alarm Card
     */
    var time_arr = TimeToArray(element.time);
    var thumb_id = "alarmCard_" + i;
    var thumb_img = "alarmCard_img_" + i;
    var thumb_number = "alarmCard_number_" + i;
    var thumb_unlock_btn_id = "alarmCard_unlock_btn_" + i;
    var thumb_focus_btn_id = "alarmCard_focus_btn_" + i;
    var color = "",
        status = "";
    switch (element.alarm_type) {
        case "low_power":
            color = "#72ac1b";
            status = $.i18n.prop('i_lowPowerAlarm');
            break;
        case "help":
            color = "#ff8484";
            status = $.i18n.prop('i_helpAlarm');
            break;
        case "still":
            color = "#FF6600";
            status = $.i18n.prop('i_stillAlarm');
            break;
        case "active":
            color = "#FF6600";
            status = $.i18n.prop('i_activeAlarm');
            break;
        case "Fence":
            color = '#ffae00'; // '#ffe600';
            status = $.i18n.prop('i_electronicFence');
            break;
        default:
            color = "#FFFFFF"; //unknown
            status = "";
    }
    $(".thumbnail_columns").prepend("<div class=\"thumbnail\" id=\"" + thumb_id + "\"" +
        "style=\"background:" + color + "\">" +
        "<table><tr><td>" +
        "<img id=\"" + thumb_img + "\" class=\"member_photo\" src=\"\">" +
        "</td><td>" +
        "<label>" + $.i18n.prop('i_number') + " : </label>" +
        "<label id=\"" + thumb_number + "\">" + element.number + "</label><br>" +
        "<label>" + $.i18n.prop('i_name') + " : " + element.name + "</label><br>" +
        "<label>" + $.i18n.prop('i_userID') + " : " + parseInt(element.id.substring(8), 16) + "</label><br>" +
        "<label>" + $.i18n.prop('i_date') + " : " + time_arr.date + "</label><br>" +
        "<label>" + $.i18n.prop('i_time') + " : " + time_arr.time + "</label>" +
        "</td></tr></table>" +
        "<label style=\"margin-left:10px; color:white;\">" + $.i18n.prop('i_status') + " : " + status + "</label>" +
        "<br><div style=\"text-align:center; margin:5px;\">" +
        "<button type=\"button\" id=\"" + thumb_unlock_btn_id + "\"" +
        " class=\"btn btn-default\" title=\"" + $.i18n.prop('i_completed') + "\">" +
        "<img class=\"icon-image\" src=\"../image/complete.png\"></button>" +
        "<button type=\"button\" id=\"\" style=\"margin-left: 10px;\"" +
        " class=\"btn btn-default\" title=\"" + $.i18n.prop('i_releasePosition') + "\"" +
        " onclick=\"unlockFocusAlarm()\"><img class=\"icon-image\"" +
        " src=\"../image/release_position.png\"></button>" +
        "<button type=\"button\" id=\"" + thumb_focus_btn_id + "\" style=\"margin-left: 10px;\"" +
        " class=\"btn btn-default\" title=\"" + $.i18n.prop('i_locate') + "\">" +
        "<img class=\"icon-image\" src=\"../image/target.png\"></button>" +
        "</div></div>");
        setMemberPhoto(thumb_img, thumb_number, element.number);
    $("#" + thumb_unlock_btn_id).click(function () {
        if (confirm("是否記錄此事件已處理?\n(確認後將會把目前畫面中的警報消除，但是刷新頁面後仍會跳出，請確實解除引發警報的原因!)")) {
            releaseFocusAlarm(element.order);
            $("#" + thumb_id).hide(); //警告卡片會消失
            changeAlarmLight();
        }
    });
    $("#" + thumb_focus_btn_id).click(function () {
        changeFocusAlarm(element.order);
        changeAlarmLight();
    });
    /**
     *  Alarm Dialog
     */
    $("#alarm_dialog").css('background-color', color);
    setMemberPhoto("alarm_dialog_image", "alarm_dialog_number", element.number);
    $("#alarm_dialog_number").text(element.number);
    $("#alarm_dialog_name").text(element.name);
    $("#alarm_dialog_id").text(parseInt(element.id.substring(8), 16));
    $("#alarm_dialog_date").text(time_arr.date);
    $("#alarm_dialog_time").text(time_arr.time);
    $("#alarm_dialog_status").text(status);
    $("#alarm_dialog_btn_unlock").unbind();
    $("#alarm_dialog_btn_unlock").click(function () {
        unlockFocusAlarm();
        $("#alarm_dialog").dialog("close");
    });
    $("#alarm_dialog_btn_focus").unbind();
    $("#alarm_dialog_btn_focus").click(function () {
        changeFocusAlarm(element.order);
    });
    $("#alarm_dialog").dialog("open");
}


function setAlarmDialog(Obj) {
    var time_arr = TimeToArray(Obj.time);
    var color = "",
        status = "";
    switch (Obj.status) {
        case "low_power":
            color = "#72ac1b";
            status = $.i18n.prop('i_lowPowerAlarm');
            break;
        case "help":
            color = "#ff8484";
            status = $.i18n.prop('i_helpAlarm');
            break;
        case "still":
            color = "#FF6600";
            status = $.i18n.prop('i_stillAlarm');
            break;
        case "active":
            color = "#FF6600";
            status = $.i18n.prop('i_activeAlarm');
            break;
        case "Fence":
            color = '#ffae00'; // '#ffe600';
            status = $.i18n.prop('i_electronicFence');
            break;
        default:
            color = "#FFFFFF"; //unknown
            status = "";
    }
    $("#alarm_dialog").css('background-color', color);
    setMemberPhoto("alarm_dialog_image", "alarm_dialog_number", Obj.number);
    $("#alarm_dialog_number").text(Obj.number);
    $("#alarm_dialog_name").text(Obj.name);
    $("#alarm_dialog_id").text(parseInt(Obj.id.substring(8), 16));
    $("#alarm_dialog_date").text(time_arr.date);
    $("#alarm_dialog_time").text(time_arr.time);
    $("#alarm_dialog_status").text(status);
    $("#alarm_dialog_btn_unlock").unbind();
    $("#alarm_dialog_btn_unlock").click(function () {
        unlockFocusAlarm();
        $("#alarm_dialog").dialog("close");
    });
    $("#alarm_dialog_btn_focus").unbind();
    $("#alarm_dialog_btn_focus").click(function () {
        changeFocusAlarm(Obj.order);
    });
    $("#alarm_dialog").dialog("open");
}


function TimeToArray(time_str) {
    if (time_str.length > 0) {
        var break_index = time_str.lastIndexOf(" ");
        return {
            date: time_str.substring(0, break_index),
            time: time_str.substring(break_index + 1, time_str.length)
        };
    }
}