var token = "";

$(function () {
    token = getUser() ? getUser().api_token : "";

    var dialog, form,
        map_name = $("#add_map_name"),
        map_image = $("#add_map_image"),
        allFields = $([]).add(map_name).add(map_image);

    $("#add_map_file").on("change", function () {
        var file = this.files[0];
        var valid = checkExt(this.value);
        valid = valid && checkImageSize(file);
        if (valid && file) {
            var FR = new FileReader();
            FR.readAsDataURL(file);
            FR.onloadend = function (e) {
                var base64data = e.target.result;
                map_image.attr("src", base64data);
            };
        } else {
            return;
        }
    });

    function SubmitNewMap() {
        var r = confirm($.i18n.prop('i_mapAlert_17'), );
        if (r == true) {
            var valid = true,
                map_ext = "",
                map_base64 = "";

            allFields.removeClass("ui-state-error");

            valid = valid && checkLength(map_name, $.i18n.prop('i_mapAlert_13'), 1, 50);

            if (map_image.attr("src").length > 0) {
                var map_file = map_image.attr("src").split(",");
                map_ext = getBase64Ext(map_file[0]);
                map_base64 = map_ext != "" ? map_file[1].trim() : "";
            } else { //no image
                valid = false;
                map_image.addClass("ui-state-error");
            }

            if (valid) {
                var mapInfoReq = {
                    "Command_Type": ["Write"],
                    "Command_Name": ["AddListMap"],
                    "Value": [{
                        "map_name": map_name.val(),
                        "map_scale": "1",
                        "map_file": map_base64,
                        "map_file_ext": map_ext
                    }],
                    "api_token": [token]
                };
                var mapHttp = createJsonXmlHttp("sql");
                mapHttp.onreadystatechange = function () {
                    if (mapHttp.readyState == 4 || mapHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        var mapArray = revObj.Values;
                        var lan = mapArray.length;
                        if (revObj.success > 0) {
                            setMapArray(mapArray);
                            for (i = 0; i < lan; i++) {
                                setThumbnail(mapArray[i]);
                            }
                            dialog.dialog("close");
                            setMapById(mapArray[lan - 1].map_id); //catch last row
                        }
                    }
                };
                mapHttp.send(JSON.stringify(mapInfoReq));
            }
            return valid;
        } else {
            return false;
        }
    }

    dialog = $("#dialog_add_map").dialog({
        autoOpen: false,
        height: 350,
        width: 350,
        modal: true,
        buttons: {
            "Confirm": SubmitNewMap,
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
        SubmitNewMap();
    });

    $("#add_new_map").button().on("click", function () {
        map_name.val(""); //reset
        map_image.attr("src", "");
        dialog.dialog("open");
    });
});