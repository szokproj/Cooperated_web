var token = "";
var fenceArray = [];

$(function () {
    token = getUser() ? getUser().api_token : "";

    var dialog, form;
    var sendCollectSet = function () {
        $("#add_collection_name").removeClass("ui-state-error");
        var valid = true && checkLength($("#add_collection_name"), "圍籬集合名稱不得為空!", 1, 20);
        if (document.getElementsByName("fence_collection").length == 0) {
            alert("必須包括至少1個圍籬");
            return;
        }
        if (valid) {
            if (operating == "Add") {
                alert("Add success!");
                /*var addXmlHttp = createJsonXmlHttp("sql");
                addXmlHttp.onreadystatechange = function () {
                    if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (revObj.success > 0) {
                           
                        }
                    }
                };
                addXmlHttp.send(JSON.stringify({
                    "Command_Type": ["Write"],
                    "Command_Name": ["AddFenceCollection"],
                    "Value": [{
                        "fence_name": $("#add_collection_name").val()
                    }],
                    "api_token": [token]
                }));*/
            } else if (operating == "Edit") {
                if ($("#add_collection_id").val() == "") {
                    alert("圍籬集合編號不得為空!");
                    return;
                }
                alert("Edit success!");
                /*var editXmlHttp = createJsonXmlHttp("sql");
                editXmlHttp.onreadystatechange = function () {
                    if (editXmlHttp.readyState == 4 || editXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (revObj.success > 0) {

                        }
                    }
                };
                editXmlHttp.send(JSON.stringify({
                    "Command_Type": ["Write"],
                    "Command_Name": ["EditFenceCollection"],
                    "Value": {
                        "fence_id": $("#add_collection_id").val(),
                        "fence_name": $("#add_collection_name").val()
                    },
                    "api_token": [token]
                }));*/
            } else {
                alert($.i18n.prop('i_alertError_9'));
            }
            dialog.dialog("close");
        }
        return valid;
    };

    dialog = $("#dialog_fence_collection").dialog({
        autoOpen: false,
        height: 600,
        width: 600,
        modal: false,
        buttons: {
            "Confirm": function () {
                sendCollectSet();
            },
            "Cancel": function () {
                dialog.dialog("close");
            }
        },
        "close": function () {
            form[0].reset();
            $("#add_collection_name").removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        sendCollectSet();
    });
    $("#btn_fence_list_add").on('click', addFenceToCollection);
    $("#btn_fence_list_delete").on('click', removeFenceFormCollection);
    $("#btn_fence_collect_add").on('click', function () {
        dialog.dialog("open");
    });
    getFences();
});

function getFences() {
    var mapXmlHttp = createJsonXmlHttp("sql");
    mapXmlHttp.onreadystatechange = function () {
        if (mapXmlHttp.readyState == 4 || mapXmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success > 0) {
                var mapArray = 'Values' in revObj == true ? revObj.Values.slice(0) : [];
                $("#table_collection_list tbody").empty();
                $("#table_fence_list tbody").empty();
                fenceArray = [];
                mapArray.forEach(element => {
                    inputFenceList(element.map_id);
                });
            } else {
                alert($.i18n.prop('i_mapAlert_18'));
            }
        }
    };
    mapXmlHttp.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"],
        "api_token": [token]
    }));

    function inputFenceList(map_id) {
        var xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (revObj.success > 0) {
                    var revInfo = 'Values' in revObj == true ? revObj.Values.slice(0) : [];
                    for (i = 0; i < revInfo.length; i++) {
                        var tr_id = "fence_list_" + revInfo[i].fence_id;
                        $("#table_fence_list tbody").append("<tr id=\"" + tr_id + "\"" +
                            " onclick=\"beCheckedColumn(\'" + tr_id + "\')\">" +
                            "<td><input type=\"checkbox\" class=\"chk-hidden\" name=\"fence_list\"" +
                            " value=\"" + revInfo[i].fence_id + "\" />" +
                            " <span>" + (i + 1) + "</span></td>" +
                            "<td>" + revInfo[i].fence_id + "</td>" +
                            "<td>" + revInfo[i].fence_name + "</td></tr>");
                        fenceArray.push(revInfo[i]);
                    }
                } else {
                    alert($.i18n.prop('i_alarmAlert_30'));
                }
            }
        };
        xmlHttp.send(JSON.stringify({
            "Command_Type": ["Read"],
            "Command_Name": ["GetFencesInMap"],
            "Value": {
                "map_id": map_id
            },
            "api_token": [token]
        }));
    }
}

function addFenceToCollection() {
    var delete_arr = [];
    document.getElementsByName("fence_list").forEach(function (element) {
        if (element.checked) {
            var index = fenceArray.findIndex(function (info) {
                return info.fence_id == element.value;
            });
            var tr_id = "fence_collection_" + element.value;
            $("#table_collection_list tbody").append("<tr id=\"" + tr_id + "\"" +
                " onclick=\"beCheckedColumn(\'" + tr_id + "\')\">" +
                "<td><input type=\"checkbox\" class=\"chk-hidden\" name=\"fence_collection\"" +
                " value=\"" + element.value + "\" /> <span></span></td>" +
                "<td>" + element.value + "</td>" +
                "<td>" + fenceArray[index].fence_name + "</td></tr>");
            delete_arr.push("#fence_list_" + element.value);
        }
    });
    delete_arr.forEach(element => {
        $(element).remove();
    });
    resetListNumber("fence_collection");
    resetListNumber("fence_list");
}

function removeFenceFormCollection() {
    var delete_arr = [];
    document.getElementsByName("fence_collection").forEach(function (element) {
        if (element.checked) {
            var index = fenceArray.findIndex(function (info) {
                return info.fence_id == element.value;
            });
            var tr_id = "fence_list_" + element.value;
            $("#table_fence_list tbody").append("<tr id=\"" + tr_id + "\"" +
                " onclick=\"beCheckedColumn(\'" + tr_id + "\')\">" +
                "<td><input type=\"checkbox\" class=\"chk-hidden\" name=\"fence_list\"" +
                " value=\"" + element.value + "\" /> <span></span></td>" +
                "<td>" + element.value + "</td>" +
                "<td>" + fenceArray[index].fence_name + "</td></tr>");
            delete_arr.push("#fence_collection_" + element.value);
        }
    });
    delete_arr.forEach(element => {
        $(element).remove();
    });
    resetListNumber("fence_collection");
    resetListNumber("fence_list");
}

function resetListNumber(item_name) {
    $("input[name='" + item_name + "']").each(function (i) {
        $(this).siblings("span").text((i + 1));
    });
}

function beCheckedColumn(id) {
    var state = $("#" + id).find("td:eq(0) input").prop("checked");
    $("#" + id).toggleClass("changeBgColor")
        .find("td:eq(0) input").prop("checked", !state);
}