var token = "";
var isAllSelected = false;
var DeviceCheckbox = document.getElementsByName("checkbox_ipAddr");
var deviceArray = {};
var connect_ip_array = [];
var count_connected = -1;
var timeDelay = {
    connect: null,
    send_network: [],
    send_rf: [],
    model: null
}; //restore timeout


$(function () {
    token = getToken();
});

function Load() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["Search_net"],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("Command")
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var cookie = typeof (Cookies.get("local_ip")) == 'undefined' ? "" : Cookies.get("local_ip");
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj)) {
                var revInfo = revObj.Value[0];
                document.getElementById("local_ip").value = revInfo[0].ip;
                var html = "";
                for (i = 0; i < revInfo.length; i++) {
                    if (revInfo[i].ip == cookie) {
                        html += "<option value=\"" + revInfo[i].ip + "\" selected>" + revInfo[i].net_interface_id +
                            "</option>";
                        document.getElementById("local_ip").value = revInfo[i].ip;
                    } else {
                        html += "<option value=\"" + revInfo[i].ip + "\">" + revInfo[i].net_interface_id + "</option>";
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
    xmlHttp.send(JSON.stringify(requestArray));
}

function Search() {
    deviceArray = {};
    connect_ip_array = [];
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["Search"],
        "Value": {
            "net_interface_id": [$("#interface_card").children('option:selected').text()],
            "ip": [$("#local_ip").val()]
        },
        "api_token": [token]
    };
    var xmlHttp = GetXmlHttpObject();
    xmlHttp.open("POST", "test2", false);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            $("#table_ip_address_info tbody").empty();
            var revObj = JSON.parse(this.responseText);
            networkArray = [];
            if (!checkTokenAlive(token, revObj))
                return;
            var udpInfo = revObj.Value[0];
            document.getElementById("all_check").checked = false;
            for (var i = 0; i < udpInfo.length; i++) {
                deviceArray[udpInfo[i].IP_address] = {
                    Checked: false,
                    Status: 0,
                    Machine_Number: udpInfo[i].Machine_Number,
                    Model: udpInfo[i].Model,
                    Anchor_ID: "",
                    IP_address: udpInfo[i].IP_address,
                    Gateway_address: udpInfo[i].Gateway_address,
                    Mask_address: udpInfo[i].Mask_address,
                    Client_ip_addr: udpInfo[i].Client_ip_addr,
                    MAC_address: udpInfo[i].MAC_address,
                    TCP_Serve_Port: udpInfo[i].TCP_Serve_Port,
                    UDP_Serve_Port: udpInfo[i].UDP_Serve_Port,
                    TCP_Client_Src_Port: udpInfo[i].TCP_Client_Src_Port,
                    TCP_Client_Des_Port: udpInfo[i].TCP_Client_Des_Port
                }
                $("#table_ip_address_info tbody").append("<tr><td><input type=\"checkbox\"" +
                    " name=\"checkbox_ipAddr\" value=\"" + udpInfo[i].IP_address + "\" />" +
                    " <label>" + (i + 1) + "</label>" +
                    "</td><td><input type='hidden' name=\"conn_status\" value=\"0\" />" + RED_LIGHT +
                    "</td><td> " + //Anchor ID
                    "</td><td>" + udpInfo[i].MAC_address +
                    "</td><td class=\"row_ip_mode\">" + "DHCP" +
                    "</td><td class=\"row_ip_addr\">" + udpInfo[i].IP_address +
                    "</td><td class=\"row_gateway_addr\">" + udpInfo[i].Gateway_address +
                    "</td><td class=\"row_mask_addr\">" + udpInfo[i].Mask_address +
                    "</td><td class=\"row_client_ip_addr\">" + udpInfo[i].Client_ip_addr +
                    "</td><td class=\"row_machine_number\">" + udpInfo[i].Machine_Number +
                    "</td><td class=\"row_model\">" + udpInfo[i].Model +
                    "</td><td class=\"row_tcp_server_port\">" + udpInfo[i].TCP_Serve_Port +
                    "</td><td class=\"row_udp_server_port\">" + udpInfo[i].UDP_Serve_Port +
                    "</td><td class=\"row_tcp_client_src_port\">" + udpInfo[i].TCP_Client_Src_Port +
                    "</td><td class=\"row_tcp_client_des_port\">" + udpInfo[i].TCP_Client_Des_Port +
                    "</td><td></td></tr>");
            }
            //$("input[name=checkbox_ipAddr]").change(checked_trans);
            displaySelectedRows();
            setCheckboxListeners();
        }
    }
    xmlHttp.send(JSON.stringify(requestArray));
}

function Connect() {
    if (!document.getElementById("is_static_ip_connect").checked) { //UDP Search + Tcp Connect
        var check_val = [];
        DeviceCheckbox.forEach(function (v) {
            if (v.checked)
                check_val.push(v.value);
        });
        if (check_val.length == 0) { //沒有IP Address被勾選
            alert($.i18n.prop('i_deviceAlert_3'));
            return;
        }
        reading_network();
        var xmlHttp = GetXmlHttpObject();
        var json_request = JSON.stringify({
            "Command_Type": ["Read"],
            "Command_Name": ["Connect"],
            "Value": {
                "IP_address": check_val
            },
            "api_token": [token]
        });
        xmlHttp.open("POST", "Command", true);
        xmlHttp.setRequestHeader("Content-type", "application/json");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                if (!this.responseText) { //No Response
                    alert($.i18n.prop('i_deviceAlert_2'));
                    return;
                }
                $("#table_ip_address_info tbody").empty();
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj)) {
                    var connectedInfo = revObj.Value[0];
                    for (var i in deviceArray) {
                        deviceArray[i].Checked = false;
                        deviceArray[i].Status = 0;
                        deviceArray[i].Anchor_ID = "";
                    }
                    connect_ip_array = [];
                    check_val.forEach(checkedIP => {
                        if (!deviceArray[checkedIP])
                            return;
                        var connectedData = connectedInfo.find(function (info) {
                            return info.dev_ip == checkedIP; //確定此IP是否有連接成功
                        });
                        if (connectedData && connectedData.dev_active_ID) {
                            deviceArray[checkedIP].Checked = true;
                            deviceArray[checkedIP].Status = 1;
                            deviceArray[checkedIP].Anchor_ID = connectedData.dev_active_ID;
                            connect_ip_array.push(connectedData.dev_ip);
                        }
                    });
                    resetListenersOfSelects(); //Reset listeners
                    for (var each in deviceArray) {
                        inputDataToColumns(deviceArray[each]);
                    }
                    setCheckboxListeners();
                    checked_trans();
                    setListenerOfInput();
                    timeDelay["connect"] = setTimeout(function () {
                        RF_setting_read(connect_ip_array);
                        clearTimeout(timeDelay["connect"]);
                    }, 100);
                    //$("input[name=checkbox_ipAddr]").change(checked_trans);
                    displaySelectedRows();
                }
            }
        };
        xmlHttp.send(json_request);
    } else { //TCP Connect
        var static_ip_1 = document.getElementById("static_ip_1").value,
            static_ip_2 = document.getElementById("static_ip_2").value,
            static_ip_3 = document.getElementById("static_ip_3").value,
            static_ip_4 = document.getElementById("static_ip_4").value;
        var valid = checkAddressFragment(static_ip_1) && checkAddressFragment(static_ip_2) &&
            checkAddressFragment(static_ip_3) && checkAddressFragment(static_ip_4);
        if (valid) {
            var Connect_Request = {
                "Command_Type": ["Read"],
                "Command_Name": ["Connect"],
                "Value": {
                    "IP_address": static_ip_1 + "." + static_ip_2 + "." + static_ip_3 + "." + static_ip_4
                },
                "api_token": [token]
            };
            var xmlHttp = createJsonXmlHttp("Command");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj)) {
                        return true;
                    }
                }
            };
            xmlHttp.send(JSON.stringify(Connect_Request));
        } else {
            alert($.i18n.prop('i_deviceAlert_1'));
        }
    }
}


function reading_network() {
    $("#btn_search").prop('disabled', true);
    $("#btn_connect").prop('disabled', true);
    $("#btn_submit").prop('disabled', true);
    timeDelay["reading_net"] = setTimeout(function () {
        $("#btn_search").prop('disabled', false);
        $("#btn_connect").prop('disabled', false);
        $("#btn_submit").prop('disabled', false);
        clearTimeout(timeDelay["reading_net"]);
    }, 2000);
}

function RF_setting_read(ip_address_array) {
    var xmlHttp = GetXmlHttpObject();
    var json_request = JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["RF"],
        "Value": {
            "IP_address": ip_address_array,
            "function": ["Model_Name", "Version_Name", "rf_MODE", "rf_NSD", "rf_NTM_value",
                "rf_PAC", "rf_PGdelay", "rf_PMULT_value", "rf_Power", "rf_SFD_timeout", "rf_SMARTPOWER",
                "rf_channel", "rf_datarate", "rf_preambleCode", "rf_preambleLength", "rf_prf"
            ]
        },
        "api_token": [token]
    });
    xmlHttp.open("POST", "test2", true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            if (!this.responseText) { //No Response
                alert("讀取RF設定失敗，請稍候再試一次");
                return;
            }
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj)) {
                revObj.Value[0][0].forEach(info => { //Add RF Setting
                    if (typeof (info) != 'undefined' && info.Command_status == 1) {
                        DeviceCheckbox.forEach(function (v, i) {
                            if (v.value == info.TARGET_IP) {
                                var ip = ipAddrTo_ip(v.value);
                                count_connected++;
                                $("#table_ip_address_info tbody tr").eq(i).addClass("selected").append(
                                    "<td class=\"row_rf_mode\" name=\"conn_rf_mode\">" + info.rf_MODE + "</td>" +
                                    "<td class=\"row_rf_version\" name=\"conn_rf_version\">" + info.Version_Name + "</td>" +
                                    "<td class=\"row_rf_channel\"><select name=\"conn_rf_channel\" id=\"conn_rf_channel" + ip + "\">" + makeOptions(RF_CHANNEL, info.rf_channel) + "</select></td>" +
                                    "<td class=\"row_rf_datarate\"><select name=\"conn_rf_datarate\" id=\"conn_rf_datarate" + ip + "\">" + makeOptions(RF_DATARATE, info.rf_datarate) + "</select></td>" +
                                    "<td class=\"row_rf_prf\"><select name=\"conn_rf_prf\" id=\"conn_rf_prf" + ip + "\">" + makeOptions(RF_PRF, info.rf_prf) + "</select></td>" +
                                    "<td class=\"row_rf_preamble_code\"><select name=\"conn_rf_preamble_code\" id=\"conn_rf_preamble_code" + ip + "\">" + makeOptions(RF_PREAMBLE_CODE, info.rf_preambleCode) + "</select></td>" +
                                    "<td class=\"row_rf_preamble_len\"><select name=\"conn_rf_preamble_len\" id=\"conn_rf_preamble_len" + ip + "\">" + makeOptions(RF_PREAMBLE_LEN, info.rf_preambleLength) + "</select></td>" +
                                    "<td class=\"row_rf_pac\"><select name=\"conn_rf_pac\" id=\"conn_rf_pac" + ip + "\">" + makeOptions(RF_PAC, info.rf_PAC) + "</select></td>" +
                                    "<td class=\"row_rf_pg_delay\"><select name=\"conn_rf_pg_delay\" id=\"conn_rf_pg_delay" + ip + "\">" + makeOptions(RF_TX_PG_DELAY, info.rf_PGdelay) + "</select></td>" +
                                    "<td class=\"row_rf_power\"><input type=\"text\" name=\"conn_rf_power\" id=\"conn_rf_power" + ip + "\" value=\"" + info.rf_Power + "\" maxlength=\"10\" /></td>" +
                                    "<td class=\"row_rf_nsd\"><select name=\"conn_rf_nsd\" id=\"conn_rf_nsd" + ip + "\">" + makeOptions(RF_NSD, info.rf_NSD) + "</select></td>" +
                                    "<td class=\"row_rf_sdf_timeoutr\"><input type='text' name=\"conn_rf_sdf_timeoutr\" id=\"conn_rf_sdf_timeoutr" + ip + "\" value=\"" + info.rf_SFD_timeout + "\" /></td>" +
                                    "<td class=\"row_rf_smartpower\"><select name=\"conn_rf_smartpower\" id=\"conn_rf_smartpower" + ip + "\">" + makeOptions(RF_SMARTPOWER, info.rf_SMARTPOWER) + "</select></td>" +
                                    "<td class=\"row_rf_ntm\"><select name=\"conn_rf_ntm\" id=\"conn_rf_ntm" + ip + "\">" + makeOptions(RF_NTM, info.rf_NTM_value) + "</select></td>" +
                                    "<td class=\"row_rf_mult\"><select name=\"conn_rf_mult\" id=\"conn_rf_mult" + ip + "\">" + makeOptions(RF_MULT, info.rf_PMULT_value) + "</select></td>");
                                setListenerOfSelect(i);
                                $("#btn_search").prop('disabled', false);
                                $("#btn_connect").prop('disabled', false);
                                $("#btn_submit").prop('disabled', false);
                                clearTimeout(timeDelay["reading_net"]);
                            }
                        });
                    }
                });
                displaySelectedRows();
            }
        }
    };
    xmlHttp.send(json_request);
}



function submitWriteRequest() {
    var count = 0;
    var checked_connections = [];
    var result = {
        fail_network: [],
        fail_rf: [],
        fail_basic: [],
        success: []
    };

    if (confirm($.i18n.prop('i_deviceAlert_4'))) {
        DeviceCheckbox.forEach(function (v, i) {
            var ip = ipAddrTo_ip(v.value);
            var status = $("#conn_status" + ip);
            if (v.checked && status && status.val())
                if (status.val() == "1")
                    checked_connections.push(v.value);
        });
        if (checked_connections.length > 0) {
            $("#progress_bar").text("0 %");
            $('#progress_block').show();
            timeDelay["send_network"].forEach(element => {
                clearTimeout(element);
            });
            timeDelay["send_network"] = [];
            all_setting_write(checked_connections[count]);
        }
    }

    function all_setting_write(ip_addr) {
        var ip = ipAddrTo_ip(ip_addr);
        if (!$('#conn_rf_channel' + ip).val()) {
            alert("IP Address: " + ip_addr + " 的RF設定尚未讀取或讀取失敗，將自動略過此裝置的寫入");
            return;
        }
        var request = {
            "Command_Type": ["Write", "Write", "Write"],
            "Command_Name": ["Network", "RF", "Basic"],
            "Value": {
                "IP_address": [ip_addr],
                "function": [
                    //"Model_Name",
                    //"Version_Name",
                    "rf_channel",
                    "rf_datarate",
                    "rf_prf",
                    "rf_preambleCode",
                    "rf_preambleLength",
                    "rf_PAC",
                    "rf_PGdelay",
                    "rf_Power",
                    "rf_NSD",
                    "rf_SFD_timeout",
                    "rf_SMARTPOWER",
                    //"rf_MODE",
                    "rf_NTM_value",
                    "rf_PMULT_value",
                    "dev_active_ID"
                ],
                "rf_channel": $('#conn_rf_channel' + ip).val(),
                "rf_datarate": $('#conn_rf_datarate' + ip).val(),
                "rf_prf": $('#conn_rf_prf' + ip).val(),
                "rf_preambleCode": $('#conn_rf_preamble_code' + ip).val(),
                "rf_preambleLength": $('#conn_rf_preamble_len' + ip).val(),
                "rf_PAC": $('#conn_rf_pac' + ip).val(),
                "rf_PGdelay": $('#conn_rf_pg_delay' + ip).val(),
                "rf_Power": $('#conn_rf_power' + ip).val(),
                "rf_NSD": $('#conn_rf_nsd' + ip).val(),
                "rf_SFD_timeout": $('#conn_rf_sdf_timeoutr' + ip).val(),
                "rf_SMARTPOWER": $('#conn_rf_smartpower' + ip).val(),
                "rf_NTM_value": $('#conn_rf_ntm' + ip).val(),
                "rf_PMULT_value": $('#conn_rf_mult' + ip).val(),
                "dev_active_ID": $('#conn_anchor_id' + ip).val()
            },
            "api_token": [token]
        };
        if ($("#conn_ip_mode" + ip).val() == "DHCP") { //DHCP
            request.Value.function.push("dev_Client_IP");
            request.Value.dev_IP = ["0", "0", "0", "0"];
            request.Value.dev_Mask = ["0", "0", "0", "0"];
            request.Value.dev_GW = ["0", "0", "0", "0"];
            request.Value.dev_Client_IP = $('#conn_client_ip_addr' + ip).val().split(".");
        } else { //Static IP
            request.Value.function.push("dev_IP", "dev_Mask", "dev_GW", "dev_Client_IP");
            request.Value.dev_IP = $('#conn_ip_addr' + ip).val().split(".");
            request.Value.dev_Mask = $('#conn_mask_addr' + ip).val().split(".");
            request.Value.dev_GW = $('#conn_gateway_addr' + ip).val().split(".");
            request.Value.dev_Client_IP = $('#conn_client_ip_addr' + ip).val().split(".");
        }

        console.log("Write device:" + new Date().getTime());

        var xmlHttp = GetXmlHttpObject();
        xmlHttp.open("POST", "test2", true);
        xmlHttp.setRequestHeader("Content-type", "application/json");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                if (!this.responseText) { //No Response
                    count++;
                    if (count == checked_connections.length) {
                        alert_write_result();
                    } else {
                        timeDelay["send_network"].push(setTimeout(function () {
                            all_setting_write(checked_connections[count]);
                            $("#progress_bar").text(Math.round(count / checked_connections.length * 100) + " %");
                        }, 300));
                    }
                    return;
                }
                let revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0][0]) {
                    var revInfo = revObj.Value[0];
                    if (revInfo[0][0].Command_status == 0)
                        result["fail_network"].push(revInfo[0][0].TARGET_IP);
                    else if (revInfo[1][0].Command_status == 0)
                        result["fail_rf"].push(revInfo[1][0].TARGET_IP);
                    else if (revInfo[2][0].Command_status == 0)
                        result["fail_basic"].push(revInfo[2][0].TARGET_IP);
                    else
                        result["success"].push(revInfo[0][0].TARGET_IP);
                    count++;
                    if (count == checked_connections.length) {
                        alert_write_result();
                    } else {
                        timeDelay["send_network"].push(setTimeout(function () {
                            all_setting_write(checked_connections[count]);
                            $("#progress_bar").text(Math.round(count / checked_connections.length * 100) + " %");
                        }, 300));
                    }
                }
            }
        };
        xmlHttp.send(JSON.stringify(request));
    }

    function alert_write_result() {
        $('#progress_block').hide();
        var text = "";
        text += result["fail_network"].length > 0 ? "寫入Network設定失敗 : " + inputText(result["fail_network"]) : "";
        text += result["fail_rf"].length > 0 ? "寫入RF設定失敗 : " + inputText(result["fail_rf"]) : "";
        text += result["fail_basic"].length > 0 ? "寫入Basic設定失敗 : " + inputText(result["fail_basic"]) : "";
        text += result["success"].length > 0 ? "寫入設定成功數" + result["success"].length + " : " + inputText(result["success"]) : "";
        alert(text == "" ? "寫入設定失敗，請稍候再試一次" : text);
        console.log("Re Search:" + new Date().getTime());
        timeDelay["send_network"].push(setTimeout(function () {
            Search();
        }, 500));
    }

    function inputText(arr) {
        var text = "";
        for (j = 0; j < arr.length; j++) {
            if (j == arr.length - 1)
                text += arr[j] + "\n";
            else
                text += arr[j] + " , "
        }
        return text;
    }
}