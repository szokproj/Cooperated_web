function hiddenBlock() {
    $("#block_info").hide();
    $("#block_anchor_list").hide();
    $("#block_group_list").hide();
    $("#block_anchor_group").hide();
    $("#block_map_group").hide();
    $(".sidebar-menu .btn-sidebar").css('background-color', 'rgb(57, 143, 255)');
}

$(function () {
    hiddenBlock();
    $("#block_info").show();
    $("#label_map_info").css('background-color', 'rgb(40, 108, 197)');
    $("#menu_load_map").on("change", function () {
        var file = this.files[0];
        var valid = checkExt(this.value);
        valid = valid && checkImageSize(file);
        if (valid)
            transBase64(file);
        else
            return;
    });
    $("#menu_resize").on("click", resizeCanvas);
    $("#menu_map_info").on("click", function () {
        hiddenBlock();
        $("#block_info").show();
        $("#label_map_info").css('background-color', 'rgb(40, 108, 197)');
    });
    $("#menu_anchor_list").on("click", function () {
        hiddenBlock();
        $("#block_anchor_list").show();
        $("#label_anchor_list").css('background-color', 'rgb(40, 108, 197)');
    });
    $("#menu_group_list").on("click", function () {
        hiddenBlock();
        $("#block_group_list").show();
        $("#label_group_list").css('background-color', 'rgb(40, 108, 197)');
    });
    $("#menu_anchor_group").on("click", function () {
        hiddenBlock();
        $("#block_anchor_group").show();
        $("#label_anchor_group").css('background-color', 'rgb(40, 108, 197)');
    });


    /**
     * Map Setting Dialog
     */
    var dialog, form,
        //map info
        mapinfo_image = $("#canvas_map"),
        mapinfo_id = $("#map_info_id"),
        mapinfo_name = $("#map_info_name"),
        mapinfo_scale = $("#map_info_scale"),
        allFields = $([]).add(mapinfo_image).add(mapinfo_name).add(mapinfo_scale);

    function SubmitResult() {
        allFields.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(mapinfo_id, $.i18n.prop('i_mapAlert_1'), 1, 50);
        valid = valid && checkLength(mapinfo_name, $.i18n.prop('i_mapAlert_2'), 1, 50);
        valid = valid && checkLength(mapinfo_scale, $.i18n.prop('i_mapAlert_3'), 1, 5);
        if (mapinfo_image.css("backgroundImage").length > 0) {
            var mapinfo_file = mapinfo_image.css("backgroundImage").split(",");
            mapinfo_ext = getBase64Ext(mapinfo_file[0]);
            mapinfo_base64 = mapinfo_ext != "" ? mapinfo_file[1].split("\"")[0].trim() : "";
        } else { //no image
            valid = false;
            mapinfo_image.addClass("ui-state-error");
        }

        if (valid) {
            var mapInfoReq = JSON.stringify({
                "Command_Type": ["Read"],
                "Command_Name": ["EditMap"],
                "Value": {
                    "map_id": mapinfo_id.val(),
                    "map_name": mapinfo_name.val(),
                    "map_file": mapinfo_base64,
                    "map_file_ext": mapinfo_ext,
                    "map_scale": mapinfo_scale.val()
                }
            });
            var mapHttp = createJsonXmlHttp("sql");
            mapHttp.onreadystatechange = function () {
                if (mapHttp.readyState == 4 || mapHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        //reload
                        $("#maps_gallery").empty();
                        loadMap();
                        dialog.dialog("close");
                        resetDialog();
                        alert($.i18n.prop('i_mapAlert_5'));
                    }
                }
            };
            mapHttp.send(mapInfoReq);
        }
        return valid;
    }

    function resetDialog() {
        hiddenBlock();
        $("#block_info").show();
        $("#label_map_info").css('background-color', 'rgb(40, 108, 197)');
        allFields.removeClass("ui-state-error");
    }


    dialog = $("#dialog_map_setting").dialog({
        autoOpen: false,
        height: 640,
        width: 1000,
        modal: true,
        buttons: {
            Confirm: function () {
                var r = confirm($.i18n.prop('i_mapAlert_4'));
                if (r == true)
                    SubmitResult();
                else
                    return;
            },
            Cancel: function () {
                dialog.dialog("close");
                resetDialog();
            }
        },
        close: function () {
            resetDialog();
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        var r = confirm($.i18n.prop('i_mapAlert_4'));
        if (r == true)
            SubmitResult();
        else
            return;
    });
});