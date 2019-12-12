'use strict';
var isStart = false,
    isStartRef = false,
    token = "",
    pageTimer = 0,
    countDatas = 0;
$(function () {
    token = getToken();
    /*
     * Check this page's permission and load navbar
     */
    if (!getPermissionOfPage("Reference")) {
        alert("Permission denied!");
        window.location.href = '../index.html';
    }
    setNavBar("Reference", "Reference");

    loadAnchorList();

    $("#select_source_type").on('change', function () {
        if ($(this).val() == "Tag") {
            $("#select_source_id").hide();
            $("#input_source_id").show();
        } else {
            $("#input_source_id").hide();
            $("#select_source_id").show();
        }
    });
});

function loadAnchorList() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetAnchors"],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                $("#select_source_id").empty();
                $("#select_anchor_id").empty();
                revObj.Value[0].Values.forEach(element => {
                    if (element.anchor_type == "main") {
                        $("#select_source_id").append("<option" +
                            " value=\"" + element.anchor_id + "\">" +
                            element.anchor_id + "</option>");
                    } else {
                        $("#select_anchor_id").append("<option" +
                            " value=\"" + element.anchor_id + "\">" +
                            element.anchor_id + "</option>");
                    }
                });
            } else {
                alert($.i18n.prop('i_mapAlert_25'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function startRefence() {
    var condition = {
        source_type: $("#select_source_type").val(),
        source_id: $("#select_source_id").val(),
        anchor_id: $("#select_anchor_id").val()
    }
    if ($("#select_source_type").val() == "Tag")
        condition.source_id = $("#input_source_id").val();
    //parseInt($("#input_source_id").val(), 10).toString(16).toUpperCase();
    if (isStartRef) {
        isStartRef = false;
        $("#btn_send").text("Start");
        clearInterval(pageTimer);
        var requestArray = {
            "Command_Type": ["Read"],
            "Command_Name": ["stopreference"],
            "api_token": [token]
        };
        var xmlHttp = createJsonXmlHttp("reference");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    alert("Stop reference successfully!");
                } else {
                    alert("Stop reference failed!");
                }
            }
        };
        xmlHttp.send(JSON.stringify(requestArray));
    } else {
        isStartRef = true;
        $("#btn_send").text("Stop");
        var requestArray = {
            "Command_Type": ["Read"],
            "Command_Name": ["startreference"],
            "Value": {
                "sourceid": condition.source_id,
                "targetid": condition.anchor_id
            },
            "api_token": [token]
        };
        var xmlHttp = createJsonXmlHttp("reference");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    var revInfo = revObj.Value[0].Value ? revObj.Value[0].Value : [];
                    revInfo.forEach(function (element, i) {
                        $("#table_reference_tags tbody").append("<tr>" +
                            "<td>" + (i + 1) + "</td>" +
                            "<td>" + element.Source_ID + "</td>" +
                            "<td>" + element.Anchor_ID + "</td>" +
                            "<td>" + element.Signal + "</td>" +
                            "<td>" + element.count + "</td></tr>");
                    });
                    countDatas = 0;
                    $("#table_reference_tags tbody").empty();
                    pageTimer = setInterval(function () {
                        getResult();
                    }, 100);
                    alert("Start reference successfully!");
                } else {
                    alert("Start reference failed!");
                }
            }
        };
        xmlHttp.send(JSON.stringify(requestArray));
    }

    function getResult() {
        console.log("send=>{" +
            "\n type : " + condition.source_type +
            "\n source_id : " + condition.source_id +
            "\n anchor_id : " + condition.anchor_id +
            "\n}");
        //return;
        var requestArray = {
            "Command_Type": ["Read"],
            "Command_Name": ["getreferencerecord"],
            "api_token": [token]
        };
        var xmlHttp = createJsonXmlHttp("reference");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    var revInfo = revObj.Value[0].Value ? revObj.Value[0].Value : [];
                    revInfo.forEach(element => {
                        countDatas++;
                        $("#table_reference_tags tbody").append("<tr>" +
                            "<td>" + countDatas + "</td>" +
                            "<td>" + parseInt(element.Source_ID, 16) + "</td>" +
                            "<td>" + parseInt(element.Anchor_ID, 16) + "</td>" +
                            "<td>" + element.Signal + "</td>" +
                            "<td>" + element.count + "</td></tr>");
                    });
                    if ($("#chk_latest_items").prop("checked")) {
                        let div = document.getElementById("reference_block");
                        div.scrollTop = div.scrollHeight;
                    }
                }
            }
        };
        xmlHttp.send(JSON.stringify(requestArray));
    }
}