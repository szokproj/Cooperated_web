var token = "";
var isAllSelected = false;
var DeviceCheckbox = document.getElementsByName("checkbox_ipAddr");
var deviceArray = [];
var connect_ip_array = [];
var count_connected = -1;
var timeDelay = {
    connect: null,
    send_network: [],
    send_rf: []
}; //restore timeout


$(function () {
    token = getToken();

    $('#myModal').modal({
        backdrop: false,
        show: false
    });
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
                var html = "<select id=\"interface_card\">";
                for (i = 0; i < revInfo.length; i++) {
                    if (revInfo[i].ip == cookie) {
                        html += "<option value=\"" + revInfo[i].ip + "\" selected>" + revInfo[i].net_interface_id +
                            "</option>";
                        document.getElementById("local_ip").value = revInfo[i].ip;
                    } else {
                        html += "<option value=\"" + revInfo[i].ip + "\">" + revInfo[i].net_interface_id + "</option>";
                    }
                }
                html += "</select>";
                document.getElementById("select_interface_card").innerHTML = html;
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
    deviceArray = [];
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
    var xmlHttp = createJsonXmlHttp("test2")
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            networkArray = [];
            if (!checkTokenAlive(token, revObj))
                return;
            var udpInfo = revObj.Value[0];
            document.getElementById("all_check").checked = false;
            $("#table_ip_address_info tbody").empty();
            for (var i = 0; i < udpInfo.length; i++) {
                deviceArray.push({
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
                });
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
        var Connect_Request = {
            "Command_Type": ["Read"],
            "Command_Name": ["Connect"],
            "Value": {
                "IP_address": check_val
            },
            "api_token": [token]
        };
        var xmlHttp = createJsonXmlHttp("Command");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj)) {
                    var connectedInfo = revObj.Value[0];
                    deviceArray.forEach(function (v) {
                        v.Checked = false;
                        v.Status = 0;
                        v.Anchor_ID = "";
                    });
                    connect_ip_array = [];
                    check_val.forEach(checkedIP => {
                        var connectedData = connectedInfo.find(function (info) {
                            return info.dev_ip == checkedIP; //確定此IP是否有連接成功
                        });
                        var index = deviceArray.findIndex(function (deviceData, i, arr) {
                            return deviceData.IP_address == checkedIP; //此勾選IP在deviceArray中的位置
                        });
                        deviceArray[index].Checked = true;
                        if (connectedData && connectedData.dev_active_ID) {
                            deviceArray[index].Status = 1;
                            deviceArray[index].Anchor_ID = connectedData.dev_active_ID;
                            connect_ip_array.push(connectedData.dev_ip);
                        }
                    });
                    resetListenersOfSelects(); //Reset listeners
                    $("#table_ip_address_info tbody").empty();
                    deviceArray.forEach(function (element) {
                        inputDataToColumns(element);
                    });
                    setCheckboxListeners();
                    checked_trans();
                    setListenerOfInput();
                    timeDelay["connect"] = setTimeout(function () {
                        RF_setting_read(connect_ip_array);
                        clearTimeout(timeDelay["connect"]);
                    }, 100);
                    //$("input[name=checkbox_ipAddr]").change(checked_trans);
                    displaySelectedRows();
                } else {
                    alert($.i18n.prop('i_deviceAlert_2'));
                }
            }
        };
        xmlHttp.send(JSON.stringify(Connect_Request));
        reading_network();

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
    var rf_Request = {
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
    };
    var RF_XmlHttp = createJsonXmlHttp("test2");
    RF_XmlHttp.onreadystatechange = function () {
        if (RF_XmlHttp.readyState == 4 || RF_XmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (!checkTokenAlive(token, revObj))
                return;
            revObj.Value[0][0].forEach(info => { //Add RF Setting
                if (typeof (info) != 'undefined' && info.Command_status == 1) {
                    var num = -1;
                    DeviceCheckbox.forEach(function (v, i) {
                        if (v.value == info.TARGET_IP)
                            num = i;
                    });
                    if (num > -1) {
                        count_connected++;
                        $("#table_ip_address_info tbody tr").eq(num).append(
                            "<td class=\"row_rf_mode\" name=\"conn_rf_mode\">" + info.rf_MODE + "</td>" +
                            "<td class=\"row_rf_version\" name=\"conn_rf_version\">" + info.Version_Name + "</td>" +
                            "<td class=\"row_rf_channel\"><select name=\"conn_rf_channel\" id=\"conn_rf_channel_" + num + "\">" + makeOptions(RF_CHANNEL, info.rf_channel) + "</select></td>" +
                            "<td class=\"row_rf_datarate\"><select name=\"conn_rf_datarate\" id=\"conn_rf_datarate_" + num + "\">" + makeOptions(RF_DATARATE, info.rf_datarate) + "</select></td>" +
                            "<td class=\"row_rf_prf\"><select name=\"conn_rf_prf\" id=\"conn_rf_prf_" + num + "\">" + makeOptions(RF_PRF, info.rf_prf) + "</select></td>" +
                            "<td class=\"row_rf_preamble_code\"><select name=\"conn_rf_preamble_code\" id=\"conn_rf_preamble_code_" + num + "\">" + makeOptions(RF_PREAMBLE_CODE, info.rf_preambleCode) + "</select></td>" +
                            "<td class=\"row_rf_preamble_len\"><select name=\"conn_rf_preamble_len\" id=\"conn_rf_preamble_len_" + num + "\">" + makeOptions(RF_PREAMBLE_LEN, info.rf_preambleLength) + "</select></td>" +
                            "<td class=\"row_rf_pac\"><select name=\"conn_rf_pac\" id=\"conn_rf_pac_" + num + "\">" + makeOptions(RF_PAC, info.rf_PAC) + "</select></td>" +
                            "<td class=\"row_rf_pg_delay\"><select name=\"conn_rf_pg_delay\" id=\"conn_rf_pg_delay_" + num + "\">" + makeOptions(RF_TX_PG_DELAY, info.rf_PGdelay) + "</select></td>" +
                            "<td class=\"row_rf_power\"><input type=\"text\" name=\"conn_rf_power\" id=\"conn_rf_power_" + num + "\" value=\"" + info.rf_Power + "\" maxlength=\"10\" /></td>" +
                            "<td class=\"row_rf_nsd\"><select name=\"conn_rf_nsd\" id=\"conn_rf_nsd_" + num + "\">" + makeOptions(RF_NSD, info.rf_NSD) + "</select></td>" +
                            "<td class=\"row_rf_sdf_timeoutr\"><input type='text' name=\"conn_rf_sdf_timeoutr\" id=\"conn_rf_sdf_timeoutr_" + num + "\" value=\"" + info.rf_SFD_timeout + "\" /></td>" +
                            "<td class=\"row_rf_smartpower\"><select name=\"conn_rf_smartpower\" id=\"conn_rf_smartpower_" + num + "\">" + makeOptions(RF_SMARTPOWER, info.rf_SMARTPOWER) + "</select></td>" +
                            "<td class=\"row_rf_ntm\"><select name=\"conn_rf_ntm\" id=\"conn_rf_ntm_" + num + "\">" + makeOptions(RF_NTM, info.rf_NTM_value) + "</select></td>" +
                            "<td class=\"row_rf_mult\"><select name=\"conn_rf_mult\" id=\"conn_rf_mult_" + num + "\">" + makeOptions(RF_MULT, info.rf_PMULT_value) + "</select></td>");
                        $("#table_ip_address_info tbody tr:eq(" + num + ") td:gt(15)").css("background-color", "#c7d8e2");

                        setListenerOfSelect(num);

                        $("#btn_search").prop('disabled', false);
                        $("#btn_connect").prop('disabled', false);
                        $("#btn_submit").prop('disabled', false);
                        clearTimeout(timeDelay["reading_net"]);
                    }
                }
            });
            displaySelectedRows();
        }
    };
    RF_XmlHttp.send(JSON.stringify(rf_Request));
}



function submitWriteRequest() {
    var count_success = 0;
    var checked_connections = [];
    var result = {
        fail_network: [],
        fail_rf: [],
        fail_basic: [],
        success: []
    };

    if (confirm($.i18n.prop('i_deviceAlert_4'))) {
        DeviceCheckbox.forEach(function (v, i) {
            var index = deviceArray.findIndex(function (info) {
                return info.IP_address == v.value;
            });
            if (v.checked && deviceArray[index].Status == 1) {
                checked_connections.push(i);
            }
        });
        if (checked_connections.length > 0) {
            clearTimeout(timeDelay["send_network"]);
            timeDelay["send_network"] = [];
            all_setting_write(checked_connections[count_success]);

            $('#myModal').modal('show');
            pageTimer["model"] = setTimeout(function () {
                $('#myModal').modal('hide');
                clearTimeout(pageTimer["model"]);
                alert_write_result();
            }, checked_connections.length * 1000);
        }

        /*timeDelay["send_network"].push(setTimeout(function () {
            alert_write_result();
        }, 1100 * (checked_connections.length + 1)));*/
    }

    function all_setting_write(i) {
        var connected_ip_addr = DeviceCheckbox[i].value;
        var request = {
            "Command_Type": ["Write", "Write", "Write"],
            "Command_Name": ["Network", "RF", "Basic"],
            "Value": {
                "IP_address": [connected_ip_addr],
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
                "rf_channel": $('#conn_rf_channel_' + i).val(),
                "rf_datarate": $('#conn_rf_datarate_' + i).val(),
                "rf_prf": $('#conn_rf_prf_' + i).val(),
                "rf_preambleCode": $('#conn_rf_preamble_code_' + i).val(),
                "rf_preambleLength": $('#conn_rf_preamble_len_' + i).val(),
                "rf_PAC": $('#conn_rf_pac_' + i).val(),
                "rf_PGdelay": $('#conn_rf_pg_delay_' + i).val(),
                "rf_Power": $('#conn_rf_power_' + i).val(),
                "rf_NSD": $('#conn_rf_nsd_' + i).val(),
                "rf_SFD_timeout": $('#conn_rf_sdf_timeoutr_' + i).val(),
                "rf_SMARTPOWER": $('#conn_rf_smartpower_' + i).val(),
                "rf_NTM_value": $('#conn_rf_ntm_' + i).val(),
                "rf_PMULT_value": $('#conn_rf_mult_' + i).val(),
                "dev_active_ID": document.getElementsByName("conn_anchor_id")[i].value
            },
            "api_token": [token]
        };
        if (document.getElementsByName("conn_ip_mode")[i].value == "DHCP") { //DHCP
            set_mode = "DHCP";
            request.Value.function.push("dev_Client_IP");
            request.Value.dev_IP = ["0", "0", "0", "0"];
            request.Value.dev_Mask = ["0", "0", "0", "0"];
            request.Value.dev_GW = ["0", "0", "0", "0"];
            request.Value.dev_Client_IP = document.getElementsByName("conn_client_ip_addr")[i].value.split(".");
        } else {
            set_mode = "Static IP";
            request.Value.function.push("dev_IP", "dev_Mask", "dev_GW", "dev_Client_IP");
            request.Value.dev_IP = document.getElementsByName("conn_ip_addr")[i].value.split(".");
            request.Value.dev_Mask = document.getElementsByName("conn_mask_addr")[i].value.split(".");
            request.Value.dev_GW = document.getElementsByName("conn_gateway_addr")[i].value.split(".");
            request.Value.dev_Client_IP = document.getElementsByName("conn_client_ip_addr")[i].value.split(".");
        }

        var xmlHttp = createJsonXmlHttp("test2");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var revObj = JSON.parse(this.responseText);
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

                    count_success++
                    if (count_success >= checked_connections.length) {
                        $('#myModal').modal('hide');
                        alert_write_result();
                    } else {
                        timeDelay["send_network"].push(setTimeout(function () {
                            all_setting_write(checked_connections[count_success]);
                            $("#progress_bar").text(Math.round(count_success / checked_connections.length * 100) + " %");
                        }, 200));
                    }
                }
            }
        };
        xmlHttp.send(JSON.stringify(request));
        console.log("Write device:" + new Date().getTime());
    }

    function alert_write_result() {
        var text = "";
        text += result["fail_network"].length > 0 ? "寫入Network設定失敗 : " + inputText(result["fail_network"]) : "";
        text += result["fail_rf"].length > 0 ? "寫入RF設定失敗 : " + inputText(result["fail_rf"]) : "";
        text += result["fail_basic"].length > 0 ? "寫入Basic設定失敗 : " + inputText(result["fail_basic"]) : "";
        text += result["success"].length > 0 ? "寫入設定成功 : " + inputText(result["success"]) : "";
        alert(text);
        console.log("Re Search:" + new Date().getTime());
        Search();
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