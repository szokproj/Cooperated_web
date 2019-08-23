$(function () {
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

        size_anchor.innerHTML = Size.anchor;
        size_tag.innerHTML = Size.tag;
        size_alarm.innerHTML = Size.alarm;
        dialog.dialog("open");
    });

    slider_anchor.oninput = function () {
        size_anchor.innerHTML = this.value;
        drawDot("Anchor", this.value);
    }

    slider_tag.oninput = function () {
        size_tag.innerHTML = this.value;
        drawDot("Tag", this.value);
    }

    slider_alarm.oninput = function () {
        size_alarm.innerHTML = this.value;
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
});


function getSizeFromCookie() {
    return {
        anchor: typeof Cookies.get("anchor_size") != 'undefined' ? parseInt(Cookies.get("anchor_size"), 10) : 10,
        tag: typeof Cookies.get("tag_size") != 'undefined' ? parseInt(Cookies.get("tag_size"), 10) : 10,
        alarm: typeof Cookies.get("alarm_size") != 'undefined' ? parseInt(Cookies.get("alarm_size"), 10) : 14
    };
}