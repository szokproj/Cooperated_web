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
        loadImage($(this).prop('files')[0]);
        //readImage($(this).prop('files'));
    });
    $("#menu_restore").on("click", restoreCanvas);
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
        resetMainAncSelect();
        hiddenBlock();
        $("#block_group_list").show();
        $("#label_group_list").css('background-color', 'rgb(40, 108, 197)');
    });
    $("#menu_anchor_group").on("click", function () {
        resetAncSelect();
        var row_group = $("[name=anchorgroup_group_id]");
        var row_main_anchor = $("[name=anchorgroup_main_anchor_id]");
        var array = catchGroupList();
        for (j = 0; j < row_group.length; j++) {
            var i = array.findIndex(function (anchor) {
                return anchor.group_id == row_group.eq(j).val();
            });
            if (i > -1)
                row_main_anchor.eq(j).text(array[i].main_anchor_id);
            else
                row_main_anchor.eq(j).text("");
        }
        hiddenBlock();
        $("#block_anchor_group").show();
        $("#label_anchor_group").css('background-color', 'rgb(40, 108, 197)');
    });
    $("#menu_map_group").on("click", function () {
        updateMapGroupList();
        hiddenBlock();
        $("#block_map_group").show();
        $("#label_map_group").css('background-color', 'rgb(40, 108, 197)');
    });
    $("#btn_anchor_position").on("click", startAnchorPosition);


    /**
     * Map Setting Dialog
     */
    var dialog, form,
        //map info
        map_block = $("#mapBlock"),
        mapinfo_id = $("#map_info_id"),
        mapinfo_name = $("#map_info_name"),
        mapinfo_scale = $("#map_info_scale"),
        //anchors
        main_id = document.getElementsByName("list_main_anchor_id"),
        main_x = document.getElementsByName("list_main_anchor_x"),
        main_y = document.getElementsByName("list_main_anchor_y"),
        id = document.getElementsByName("list_anchor_id"),
        x = document.getElementsByName("list_anchor_x"),
        y = document.getElementsByName("list_anchor_y"),
        //groupList
        group_id_row = $("[name=grouplist_id]"),
        group_name_row = $("[name=grouplist_name]"),
        main_anchor_row = $("[name=grouplist_main_anchor]"),
        //anchor group
        group_row = $("[name=anchor_group_id]"),
        main_anchor_row = $("[name=group_main_anchor]"),
        anchor_row = $("[name=group_anchor]"),
        //map group
        map_id = $("[name=mapgroup_map]"),
        group_id = $("[name=mapgroup_group]"),
        allFields = $([]).add(map_block, mapinfo_id, mapinfo_name, mapinfo_scale, main_id, main_x, main_y, id, x, y,
            group_id_row, group_name_row, main_anchor_row, group_row, main_anchor_row, anchor_row, map_id, group_id);
    //tips = $( ".validateTips" );


    function SendResult() {
        allFields.removeClass("ui-state-error");
        var valid = true,
            anchor_array = [],
            grouplist_array = [],
            anchorgroup_array = [],
            mapgroup_array = [],
            count_total_anchors = 0,
            grouplist_count = 0,
            anchorgroup_count = 0,
            mapgroup_count = 0;

        if (!canvasImg.isPutImg) {
            map_block.addClass("ui-state-error");
            alert("請導入地圖");
            return;
        }

        valid = valid && checkLength(mapinfo_id, "Please enter the ID of this map.", 1, 5);
        valid = valid && checkLength(mapinfo_name, "Please enter the name of this map.", 1, 50);
        valid = valid && checkLength(mapinfo_scale, "Please enter the scale of this map.", 1, 3);

        for (i = 0; i < main_id.length; i++) {
            valid = valid && checkLengthByDOM(main_id[i], "mapScale", 1, 5);
            valid = valid && checkLengthByDOM(main_x[i], "mapScale", 1, 10);
            valid = valid && checkLengthByDOM(main_y[i], "mapScale", 1, 10);
            anchor_array.push({
                "anchor_id": main_id[i].value,
                "anchor_type": "main",
                "set_x": main_x[i].value,
                "set_y": main_y[i].value
            });
            count_total_anchors++
        }

        for (j = 0; j < id.length; j++) {
            valid = valid && checkLengthByDOM(id[i], "mapScale", 1, 5);
            valid = valid && checkLengthByDOM(x[i], "mapScale", 1, 10);
            valid = valid && checkLengthByDOM(y[i], "mapScale", 1, 10);
            anchor_array.push({
                "anchor_id": id[i].value,
                "anchor_type": "",
                "set_x": x[i].value,
                "set_y": y[i].value
            });
            count_total_anchors++
        }

        for (k = 0; k < group_id_row.length; k++) {
            valid = valid && checkLength(group_id_row.eq(k), "GroupList", 1, 5);
            //valid = valid && checkLength(group_name_row.eq(i), "GroupList", 1, 10);
            valid = valid && checkLength(main_anchor_row.eq(k), "GroupList", 1, 5);
            grouplist_array.push({
                "group_id": group_id_row.eq(k).val(),
                "group_name": group_name_row.eq(k).val(),
                "main_anchor_id": main_anchor_row.eq(k).val()
            });
            grouplist_count++;
        }

        for (l = 0; l < group_row.length; l++) {
            valid = valid && checkLength(group_row.eq(l), "Should be more than 0 and less than 65535.", 1, 5);
            //valid = valid && checkLength(main_anchor_row.eq(i), "Should be more than 0 and less than 65535.", 1, 5);
            valid = valid && checkLength(anchor_row.eq(l), "Should be more than 0 and less than 65535.", 1, 5);
            anchorgroup_array.push({
                "group_id": group_row.eq(l).val(),
                //"main_anchor_id": main_anchor_row.eq(i).val(),
                "anchor_id": anchor_row.eq(l).val()
            });
            anchorgroup_count++;
        }

        for (m = 0; m < map_id.length; m++) {
            valid = valid && checkLength(map_id.eq(m), "Please select the number more than 0 and less than 6.", 1, 5);
            valid = valid && checkLength(group_id.eq(m), "Please select the number more than 0 and less than 6.", 1, 5);
            mapgroup_array.push({
                "map_id": map_id.eq(m).val(),
                "group_id": group_id.eq(m).val(),
            });
            mapgroup_count++;
        }

        function sendMapInfoRequest() {
            var mapInfoReq = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["ClearAllMaps", "AddMap"],
                "Value": {
                    "map_id": mapinfo_id.val(),
                    "map_name": mapinfo_name.val(),
                    "map_path": $("#map_info_path").text(),
                    "map_scale": mapinfo_scale.val(),
                }
            });
            var mapHttp = createJsonXmlHttp("sql");
            mapHttp.onreadystatechange = function () {
                if (mapHttp.readyState == 4 || mapHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        alert("地圖資訊設定完成"); //reload
                        /*
                        $("#maps_gallery").empty();
                        loadMap();
                        */
                    }
                }
            };
            mapHttp.send(mapInfoReq);
        }

        function sendAnchorsRequest() {
            var setAnchorsReq = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["ClearListAnchor", "AddListAnchor"],
                "Value": anchor_array
            });
            var ancHttp = createJsonXmlHttp("sql");
            ancHttp.onreadystatechange = function () {
                if (ancHttp.readyState == 4 || ancHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        alert("AnchorList更新成功:" + revObj.success + "筆,\n" +
                            "AnchorList更新失敗:" + (count_total_anchors - revObj.success) + "筆");
                        /*
                        $("#maps_gallery").empty();
                        loadMap();
                        */
                    }
                }
            };
            ancHttp.send(setAnchorsReq);
        }

        function sendGroupListRequest() {
            var setGroupListReq = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["ClearAllGroups", "AddListGroup"],
                "Value": grouplist_array
            });
            var groupListHttp = createJsonXmlHttp("sql");
            groupListHttp.onreadystatechange = function () {
                if (groupListHttp.readyState == 4 || groupListHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        alert("GroupList更新成功:" + revInfo.length + "筆,\n" +
                            "GroupList更新失敗:" + (grouplist_count - revInfo.length) + "筆");
                        /*
                        $("#maps_gallery").empty();
                        loadMap();
                        */
                    }
                }
            };
            groupListHttp.send(setGroupListReq);
        }

        function sendAncGroupRequest() {
            var setGroupListReq = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["ClearAllGroup_Anchors", "AddListGroup_Anchor"],
                "Value": anchorgroup_array
            });
            var ancGroupHttp = createJsonXmlHttp("sql");
            ancGroupHttp.onreadystatechange = function () {
                if (ancGroupHttp.readyState == 4 || ancGroupHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        alert("AnchorGroup更新成功:" + revInfo.length + "筆,\n" +
                            "AnchorGroup更新失敗:" + (anchorgroup_count - revInfo.length) + "筆");
                        /*
                        $("#maps_gallery").empty();
                        loadMap();
                        */
                    }
                }
            };
            ancGroupHttp.send(setGroupListReq);
        }

        function sendMapGroupRequest() {
            var setGroupListReq = JSON.stringify({
                "Command_Type": ["Write"],
                "Command_Name": ["ClearAllMap_Groups", "AddListMap_Group"],
                "Value": mapgroup_array
            });
            var mapGroupHttp = createJsonXmlHttp("sql");
            mapGroupHttp.onreadystatechange = function () {
                if (mapGroupHttp.readyState == 4 || mapGroupHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    var revInfo = revObj.Values;
                    if (revObj.success > 0) {
                        alert("AnchorGroup更新成功:" + revInfo.length + "筆,\n" +
                            "AnchorGroup更新失敗:" + (mapgroup_count - revInfo.length) + "筆");
                        /*
                        $("#maps_gallery").empty();
                        loadMap();
                        */
                    }
                }
            };
            mapGroupHttp.send(setGroupListReq);
        }

        if (valid) {
            sendMapInfoRequest();
            sendAnchorsRequest();
            sendGroupListRequest();
            sendAncGroupRequest();
            sendMapGroupRequest();
            dialog.dialog("close");
            resetDialog();
        }
        return valid;
    }

    function resetDialog() {
        hiddenBlock();
        $("#block_info").show();
        $("#label_map_info").css('background-color', 'rgb(40, 108, 197)');
        isPosition = true;
        startAnchorPosition();
        form[0].reset();
        allFields.removeClass("ui-state-error");
    }


    dialog = $("#dialog_map_setting").dialog({
        autoOpen: false,
        height: 640,
        width: 980,
        modal: true,
        buttons: {
            "Confirm": function () {
                var r = confirm("Confirm delivery?");
                if (r == true)
                    SendResult();
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
        SendResult();
    });
});