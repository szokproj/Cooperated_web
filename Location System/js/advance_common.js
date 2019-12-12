'use strict';
function searchNetworkCards() {
    let xmlHttp = createJsonXmlHttp("Command");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            let revObj = JSON.parse(this.responseText),
                cookie = typeof (Cookies.get("local_ip")) == 'undefined' ? "" : Cookies.get("local_ip");
            if (checkTokenAlive(token, revObj)) {
                let revInfo = revObj.Value[0];
                document.getElementById("local_ip").value = revInfo[0].ip;
                let html = "";
                for (let i = 0; i < revInfo.length; i++) {
                    if (revInfo[i].ip == cookie) {
                        html += "<option value=\"" + revInfo[i].ip + "\" selected>" +
                            revInfo[i].net_interface_id + "</option>";
                        document.getElementById("local_ip").value = revInfo[i].ip;
                    } else {
                        html += "<option value=\"" + revInfo[i].ip + "\">" + revInfo[i].net_interface_id +
                            "</option>";
                    }
                }
                document.getElementById("interface_card").innerHTML = html;
                $(function () {
                    $("#interface_card").change(function () {
                        $("#local_ip").val($(this).children('option:selected').val());
                        Cookies.set("local_ip", $("#local_ip").val());
                    });
                });
            }
        }
    }
    xmlHttp.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["Search_net"],
        "api_token": [token]
    }));
}

function searchDevices() {
    let xmlHttp = createJsonXmlHttp("Command");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            if (!this.responseText) {
                alert("Search devices failed!");
                return;
            }
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj)) {
                let revInfo = revObj.Value ? revObj.Value[0] : [];
                $("#sel_device_ip").empty();
                ipPortList = {};
                revInfo.sort(function (a, b) {
                    let a_str = a.IP_address.substring(a.IP_address.lastIndexOf(".") + 1),
                        b_str = b.IP_address.substring(b.IP_address.lastIndexOf(".") + 1);
                    return a_str - b_str;
                });
                revInfo.forEach(element => {
                    ipPortList[element.IP_address] = element.TCP_Serve_Port;
                    $("#sel_device_ip").append("<option value=\"" + element.IP_address + "\">" +
                        element.IP_address + "</option>")
                });
            }
        }
    }
    xmlHttp.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["Search"],
        "Value": {
            "net_interface_id": [$("#interface_card").children('option:selected').text()],
            "ip": [$("#local_ip").val()]
        },
        "api_token": [token]
    }));
}

function StartClick() {
    let delaytime = 100,
        requestArray = {
            "Command_Type": ["Write"],
            "Command_Name": ["Launch"],
            "api_token": [token]
        };
    if (!isStart) {
        isStart = true;
        requestArray.Value = "Start";
        document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-pause\">" +
            "</i><span>" + $.i18n.prop('i_stop') + "</span>";
    } else {
        isStart = false;
        requestArray.Value = "Stop";
        document.getElementById("btn_start").innerHTML = "<i class=\"fas fa-play\">" +
            "</i><span>" + $.i18n.prop('i_start') + "</span>";
    }
    let xmlHttp = createJsonXmlHttp("test2");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            let revObj = JSON.parse(this.responseText),
                pass = checkTokenAlive(token, revObj);
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}