$(function () {
    var dialog, form,
        map_name = $("#add_map_name"),
        map_image = $("#add_map_image"),
        allFields = $([]).add(map_name).add(map_image);
    //tips = $( ".validateTips" );

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
        var r = confirm("Confirm to add the map?");
        if (r == true) {
            var valid = true,
                map_ext = "",
                map_base64 = "";

            allFields.removeClass("ui-state-error");

            valid = valid && checkLength(map_name, "not null", 1, 50);

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
                    }]
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
                                var map = "map_id_" + mapArray[i].map_id;
                                var src = "data:image/" + mapArray[i].map_file_ext + ";base64," + mapArray[i].map_file;
                                var img_size = adjustImageSize(src);
                                $("#maps_gallery").append("<div class=\"thumbnail\">" +
                                    "<div class=\"image_block\">" +
                                    "<img src=\"" + src + "\" width=\"" + img_size.width + "\" height=\"" + img_size.height + "\">" +
                                    "</div>" +
                                    "<div class=\"caption\"><table style='width:100%;'><tr>" +
                                    "<th style=\"width:90px;\">Map Name:</th>" +
                                    "<th style=\"width:50%;\"><span name=\"" + map + "\">" + mapArray[i].map_name + "</span></th>" +
                                    "<th><button class='btn btn-primary' onclick=\"setMapById(\'" + mapArray + "\',\'" + mapArray[i].map_id + "\')\">設定</button></th>" +
                                    "<th><button class='btn btn-primary' onclick=\"deleteMap(\'" + mapArray[i].map_id + "\')\">刪除</button></th>" +
                                    "</tr></table></div>" +
                                    "</div>");
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