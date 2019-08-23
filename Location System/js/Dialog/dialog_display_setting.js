$(function () {
    var dialog;

    function sendResult() {
        setFocusSetToCookie({
            lock_window: $("#chk_lock_window").prop("checked").toString(),
            fit_window: $("#chk_fit_window").prop("checked").toString()
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
        dialog.dialog("open");
    });
});

function getFocusSetFromCookie() {
    var cookie = Cookies.get("display_setting");
    if (typeof (cookie) !== 'undefined') {
        var setting = JSON.parse(cookie);
        return {
            lock_window: setting.lock_window == "true" ? true : false,
            fit_window: setting.fit_window == "true" ? true : false
        };
    } else {
        return { //預設值
            lock_window: false,
            fit_window: true
        };
    }
}