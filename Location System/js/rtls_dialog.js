var setDialog = {
    displaySetting: function () {
        var dialog;

        function sendResult() {
            Stop();
            setFocusSetToCookie({
                lock_window: $("#chk_lock_window").prop("checked").toString(),
                fit_window: $("#chk_fit_window").prop("checked").toString(),
                display_fence: $("#chk_display_fence").prop("checked").toString(),
                display_no_position: $("#chk_display_no_position").prop("checked").toString(),
                display_alarm_low_power: $("#chk_alarm_low_power").prop("checked").toString(),
                display_alarm_active: $("#chk_alarm_active").prop("checked").toString(),
                display_alarm_still: $("#chk_alarm_still").prop("checked").toString(),
                smooth_display: $("#chk_smooth_display").prop("checked").toString(),
                smooth_launch_time: $("#slider_launch_time").val()
            });
            Start();
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
            $("#chk_alarm_low_power").prop("checked", Setting.display_alarm_low_power);
            $("#chk_alarm_active").prop("checked", Setting.display_alarm_active);
            $("#chk_alarm_still").prop("checked", Setting.display_alarm_still);
            $("#chk_smooth_display").prop("checked", Setting.smooth_display);
            $("#slider_launch_time").val(Setting.smooth_launch_time); //= send time
            $("#smooth_launch_time").text(Setting.smooth_launch_time);
            dialog.dialog("open");
        });

        document.getElementById("slider_launch_time").oninput = function () {
            document.getElementById("smooth_launch_time").innerText = this.value;
        }
    },
    displaySize: function () {
        var dialog,
            slider_anchor = document.getElementById("slider_anchor_size"),
            slider_tag = document.getElementById("slider_tag_size"),
            slider_alarm = document.getElementById("slider_alarm_size"),
            size_anchor = document.getElementById("anchor_size"),
            size_tag = document.getElementById("tag_size"),
            size_alarm = document.getElementById("alarm_size");

        function sendResult() {
            setSizeToCookie({
                anchor: slider_anchor.value,
                tag: slider_tag.value,
                alarm: slider_alarm.value
            });
            dialog.dialog("close");
        }

        dialog = $("#displsy_size_dialog").dialog({
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

        $("#btn_display_size").on("click", function () {
            var Size = getSizeFromCookie();
            slider_anchor.value = Size.anchor;
            slider_tag.value = Size.tag;
            slider_alarm.value = Size.alarm;

            size_anchor.innerText = Size.anchor;
            size_tag.innerText = Size.tag;
            size_alarm.innerText = Size.alarm;
            dialog.dialog("open");
        });

        slider_anchor.oninput = function () {
            size_anchor.innerText = this.value;
            drawDot("Anchor", this.value);
        }

        slider_tag.oninput = function () {
            size_tag.innerText = this.value;
            drawDot("Tag", this.value);
        }

        slider_alarm.oninput = function () {
            size_alarm.innerText = this.value;
            drawDot("Alarm", this.value);
        }

        function drawDot(type, size) {
            var canvas = document.getElementById('canvas_display_size');
            var ctx = canvas.getContext('2d');
            var x = canvas.width / 2;
            var y = canvas.height / 2;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            switch (type) {
                case "Anchor":
                    drawAnchor(ctx, "", "", x, y, size, 1);
                    break;
                case "Tag":
                    drawTags(ctx, "", x, y, "#2eb82e", size, 1);
                    break;
                case "Alarm":
                    drawAlarmTags(ctx, "", x, y, "help", size, 1);
                    break;
                default:
                    break;
            }
        }
    },
    separateCanvas: function () {
        var dialog;

        dialog = $("#separate_canvas_dialog").dialog({
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

        function sendResult() {
            let mode = $("#select_canvas_mode").val();
            Cookies.set("separate_canvas", mode);
            canvasMode(mode);
            loadMapToCanvas();
            $("#separate_canvas_dialog").dialog("close");
        }

        $("#btn_separate_canvas").on("click", function () {
            let separate_canvas = Cookies.get("separate_canvas"),
                mode = typeof (separate_canvas) === 'undefined' ? "1" : separate_canvas;
            $("#select_canvas_mode").val(mode);
            dialog.dialog("open");
        });
    }
};

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
            display_alarm_still: setting.display_alarm_still == "true" ? true : false,
            smooth_display: setting.smooth_display == "true" ? true : false,
            smooth_launch_time: parseInt(setting.smooth_launch_time, 10)
        };
    } else {
        return { //預設值
            lock_window: false,
            fit_window: true,
            display_fence: true,
            display_no_position: true,
            display_alarm_low_power: true,
            display_alarm_active: true,
            display_alarm_still: true,
            smooth_display: false,
            smooth_launch_time: 1000
        };
    }
}

function getSizeFromCookie() {
    return {
        anchor: typeof Cookies.get("anchor_size") != 'undefined' ? parseInt(Cookies.get("anchor_size"), 10) : 10,
        tag: typeof Cookies.get("tag_size") != 'undefined' ? parseInt(Cookies.get("tag_size"), 10) : 10,
        alarm: typeof Cookies.get("alarm_size") != 'undefined' ? parseInt(Cookies.get("alarm_size"), 10) : 14
    };
}