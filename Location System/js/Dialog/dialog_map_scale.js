// From http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29
$(function () {
    var dialog, form,
        scale = $("#scale"),
        allFields = $([]).add(scale);
    //tips = $( ".validateTips" );

    function setMapScale() {
        var valid = true;
        allFields.removeClass("ui-state-error");

        valid = valid && checkLength(scale, "mapScale", 1, 2);

        if (valid) {
            //傳送變更要求到Server端 $.post(URL,request(data),response);
            $.post("SetMapScale", {
                    scale: scale.val() //在Server接收到的資料是 "scale=" + scale.val()
                },
                function (revObj) {
                    var rev_scale = "Map Scale: 1 : " + JSON.parse(revObj).scale;
                    $("#scale_visible").html(rev_scale);
                });
            dialog.dialog("close");
        }
        return valid;
    }

    dialog = $("#dialog_map_scale").dialog({
        autoOpen: false,
        height: 180,
        width: 280,
        modal: true,
        buttons: {
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
                dialog.dialog("close");
            },
            "Set map scale": setMapScale
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        setMapScale();
    });

    $("#Map_Scale").button().on("click", function () {
        dialog.dialog("open");
    });
});