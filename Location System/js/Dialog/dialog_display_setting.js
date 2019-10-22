$(function () {
    var dialog;

    function sendResult() {
        setFocusSetToCookie({
            lock_window: $("#chk_lock_window").prop("checked").toString(),
            fit_window: $("#chk_fit_window").prop("checked").toString(),
            display_fence: $("#chk_display_fence").prop("checked").toString(),
            display_no_position: $("#chk_display_no_position").prop("checked").toString()
        });
        dialog.dialog("close");
    }

    dialog = $("#adjust_focus_mode").dialog({
        autoOpen: false,
        height: 500,
        width: 400,
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
            display_no_position: setting.display_no_position == "true" ? true : false
        };
    } else {
        return { //預設值
            lock_window: false,
            fit_window: true,
            display_fence: true,
            display_no_position: true
        };
    }
}