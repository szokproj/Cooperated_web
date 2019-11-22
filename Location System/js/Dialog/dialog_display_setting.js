$(function () {
    var dialog;

    function sendResult() {
        setFocusSetToCookie({
            lock_window: $("#chk_lock_window").prop("checked").toString(),
            fit_window: $("#chk_fit_window").prop("checked").toString(),
            display_fence: $("#chk_display_fence").prop("checked").toString(),
            display_no_position: $("#chk_display_no_position").prop("checked").toString(),
            display_alarm_low_power: $("#chk_alarm_low_power").prop("checked").toString(),
            display_alarm_active: $("#chk_alarm_active").prop("checked").toString(),
            display_alarm_still: $("#chk_alarm_still").prop("checked").toString()
        });
        dialog.dialog("close");
    }

    dialog = $("#adjust_focus_mode").dialog({
        autoOpen: false,
        height: 420,
        width: 350,
        modal: true,
        buttons: {
            "Confirm": function () {
                sendResult();
            },
            Cancel: function () {
                dialog.dialog("close");
            }
        }
    });

    $("#btn_adjust_focus").click(function () {
        var Setting = getFocusSetFromCookie();
        $("#chk_lock_window").prop("checked", Setting.lock_window);
        $("#chk_fit_window").prop("checked", Setting.fit_window);
        $("#chk_display_fence").prop("checked", Setting.display_fence);
        $("#chk_display_no_position").prop("checked", Setting.display_no_position);
        $("#chk_alarm_low_power").prop("checked", Setting.display_alarm_low_power);
        $("#chk_alarm_active").prop("checked", Setting.display_alarm_active);
        $("#chk_alarm_still").prop("checked", Setting.display_alarm_still);
        dialog.dialog("open");
    });
});

function getFocusSetFromCookie() {
    var cookie = Cookies.get("display_setting");
    if (typeof (cookie) !== 'undefined') {
        var setting = JSON.parse(cookie);
        return {
            lock_window: setting.lock_window == "true" ? true : false,
            fit_window: setting.fit_window == "true" ? true : false,
            display_fence: setting.display_fence == "true" ? true : false,
            display_no_position: setting.display_no_position == "true" ? true : false,
            display_alarm_low_power: setting.display_alarm_low_power == "true" ? true : false,
            display_alarm_active: setting.display_alarm_active == "true" ? true : false,
            display_alarm_still: setting.display_alarm_still == "true" ? true : false
        };
    } else {
        return { //預設值
            lock_window: false,
            fit_window: true,
            display_fence: true,
            display_no_position: true,
            display_alarm_low_power: true,
            display_alarm_active: true,
            display_alarm_still: true
        };
    }
}