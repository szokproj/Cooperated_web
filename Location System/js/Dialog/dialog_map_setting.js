function importSetMapDialog() {
    $("#menu_load_map").on("change", function () {
        var file = this.files[0];
        if (file && checkExt(this.value) && checkImageSize(file)) {
            transBase64(file);
            $("#btn_submit_map_info").prop('disabled', false);
        }
    });
    $("#menu_resize").on("click", resizeCanvas);
    $("#menu_map_info").on("click", function () {
        hiddenBlock();
        $("#block_info").show();
        $("#label_map_info").addClass("opened");
    });
    $("#menu_anchor_list").on("click", function () {
        hiddenBlock();
        $("#block_anchor_list").show();
        $("#label_anchor_list").addClass("opened");
    });
    $("#menu_group_list").on("click", function () {
        hiddenBlock();
        $("#block_group_list").show();
        $("#label_group_list").addClass("opened");
    });
    $("#menu_anchor_group").on("click", function () {
        hiddenBlock();
        $("#block_anchor_group").show();
        $("#label_anchor_group").addClass("opened");
    });

    function hiddenBlock() {
        $("#block_info").hide();
        $("#block_anchor_list").hide();
        $("#block_group_list").hide();
        $("#block_anchor_group").hide();
        $("#block_map_group").hide();
        $(".sidebar-menu .btn-sidebar").removeClass("opened");
    }

    //map info
    var mapinfo_image = $("#canvas_map"),
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
                },
                "api_token": [token]
            });
            var mapHttp = createJsonXmlHttp("sql");
            mapHttp.onreadystatechange = function () {
                if (mapHttp.readyState == 4 || mapHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                        loadMap(); //reload
                        $("#btn_submit_map_info").prop('disabled', true);
                        alert($.i18n.prop('i_mapAlert_5'));
                    }
                }
            };
            mapHttp.send(mapInfoReq);
        }
        return valid;
    }

    //Map Setting Dialog
    $("#dialog_map_setting").dialog({
        autoOpen: false,
        height: 580,
        width: 950,
        modal: true,
        close: function () {
            hiddenBlock();
            $("#block_info").show();
            $("#label_map_info").addClass("opened");
            $("#btn_submit_map_info").prop('disabled', true);
            allFields.removeClass("ui-state-error");
        }
    });
    mapinfo_name.on("change", function () {
        $("#btn_submit_map_info").prop('disabled', false);
    });
    mapinfo_scale.on("change", function () {
        $("#btn_submit_map_info").prop('disabled', false);
    });
    $("#btn_submit_map_info").on('click', function () {
        if (confirm($.i18n.prop('i_mapAlert_4')) == true)
            SubmitResult();
    });
}


function importNewMapDialog() {
    var dialog, form,
        allFields = $([]).add($("#add_map_name")).add($("#add_map_image"));

    $("#add_map_file").on("change", function () {
        var file = this.files[0];
        if (file && checkExt(this.value) && checkImageSize(file)) {
            var FR = new FileReader();
            FR.readAsDataURL(file);
            FR.onloadend = function (e) {
                var base64data = e.target.result;
                $("#add_map_image").attr("src", base64data);
            };
        }
    });

    dialog = $("#dialog_add_map").dialog({
        autoOpen: false,
        height: 350,
        width: 350,
        modal: true,
        buttons: {
            "Confirm": newMap,
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        newMap();
    });

    $("#add_new_map").button().on("click", function () {
        $("#add_map_name").val(""); //reset
        $("#add_map_image").attr("src", "");
        dialog.dialog("open");
    });
}