var leftSide_isOpen = false;
var rightSide_isOpen = false;

function alarmSidebarMove() {
    $(function () {
        if (!leftSide_isOpen) {
            //側邊欄由左向右滑動
            $('#content').addClass('left_open');
            $('.alarm-sideBar').animate({
                left: '30px'
            }, 370); //0
        } else {
            //側邊欄由右向左滑動
            $('#content').removeClass('left_open');
            $('.alarm-sideBar').animate({
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
    var html = "";
    var time_arr = TimeToArray(element.alarm_time);
    var thumb_id = "alarmCard_" + i;
    var thumb_img = "alarmCard_img_" + i;
    var thumb_number = "alarmCard_number_" + i;
    var thumb_unlock_btn_id = "alarmCard_unlock_btn_" + i;
    var thumb_focus_btn_id = "alarmCard_focus_btn_" + i;
    var tagid_alarm = element.id + element.alarm_type; //used by count & date & time 
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
        case "stay":
            color = '#4876ff';
            status = $.i18n.prop('i_stayAlarm');
            break;
        case "hidden":
            color = '#6f6ff8';
            status = $.i18n.prop('i_hiddenAlarm');
            break;
        default:
            color = "#FFFFFF"; //unknown
            status = "";
    }

    html = "<div class=\"thumbnail\" id=\"" + thumb_id + "\" style=\"background:" + color + "\">" +
        "<div class=\"thumb-count\"><label id=\"count_" + tagid_alarm + "\">" + element.count + "</label></div>" +
        "<table><tr><td>" +
        "<img id=\"" + thumb_img + "\" class=\"member_photo\" src=\"\">" +
        "</td><td>" +
        "<label>" + $.i18n.prop('i_number') + " : " +
        "<span id=\"" + thumb_number + "\">" + element.number + "</span></label><br>" +
        "<label>" + $.i18n.prop('i_name') + " : " + element.name + "</label><br>" +
        "<label>" + $.i18n.prop('i_userID') + " : " + parseInt(element.id.substring(8), 16) + "</label><br>" +
        "<label>" + $.i18n.prop('i_date') + " : <span id=\"date_" + tagid_alarm + "\">" + time_arr.date + "</span></label>" +
        "<br>" +
        "<label>" + $.i18n.prop('i_time') + " : <span id=\"time_" + tagid_alarm + "\">" + time_arr.time + "</span></label>" +
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
        "</div></div>";

    if ($("#btn_sort_alarm i").hasClass("fa-sort-amount-up"))
        $(".thumbnail_columns").prepend(html);
    else
        $(".thumbnail_columns").append(html);

    setMemberPhoto(thumb_img, thumb_number, element.number);
    $("#" + thumb_unlock_btn_id).click(function () {
        if (confirm("是否記錄此事件已處理?\n(若未解除警報原因，警報將會再次發出，請確實完成!)")) {
            releaseFocusAlarm(element.id, element.alarm_type);
            $("#" + thumb_id).hide(); //警告卡片會消失
            changeAlarmLight();
        }
    });
    $("#" + thumb_focus_btn_id).click(function () {
        changeFocusAlarm(element.id, element.alarm_type);
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
    $("#alarm_dialog_btn_focus").off("click").on("click", function () {
        changeFocusAlarm(element.id, element.alarm_type);
    });
    $("#member_dialog").dialog("close");
    $("#alarm_dialog").dialog("open");
}

function setAlarmDialog(Obj) {
    var time_arr = TimeToArray(Obj.alarm_time);
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
        case "stay":
            color = '#4876ff';
            status = $.i18n.prop('i_stayAlarm');
            break;
        case "hidden":
            color = '#6f6ff8';
            status = $.i18n.prop('i_hiddenAlarm');
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
    $("#alarm_dialog_btn_focus").off("click").on("click", function () {
        changeFocusAlarm(Obj.id, Obj.status);
    });
    $("#member_dialog").dialog("close");
    $("#alarm_dialog").dialog("open");
}

function setTagDialog(Obj) {
    $("#member_dialog_tag_id").text(parseInt(Obj.id.substring(8), 16));
    $("#member_dialog_number").text(Obj.number);
    $("#member_dialog_name").text(Obj.name);
    setMemberPhoto("member_dialog_image", "member_dialog_number", Obj.number);
    $("#member_dialog_btn_focus").off("click").on("click", function () {
        var tag_id = Obj.id;
        locateTag(tag_id);
    });
    $("#alarm_dialog").dialog("close");
    $("#member_dialog").dialog("open");
}