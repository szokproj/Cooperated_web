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


function Load() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["Search_net"]
    };
    var xmlHttp = createJsonXmlHttp("Command")
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var cookie = typeof (Cookies.get("local_ip")) == 'undefined' ? "" : Cookies.get("local_ip");
            var response = JSON.parse(this.responseText);
            document.getElementById("local_ip").value = response[0].ip;
            var html = "<select id=\"interface_card\">";
            for (i = 0; i < response.length; i++) {
                if (response[i].ip == cookie) {
                    html += "<option value=\"" + response[i].ip + "\" selected>" + response[i].net_interface_id +
                        "</option>";
                    document.getElementById("local_ip").value = response[i].ip;
                } else {
                    html += "<option value=\"" + response[i].ip + "\">" + response[i].net_interface_id + "</option>";
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
        }
    };
    var xmlHttp = createJsonXmlHttp("test2")
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var udpInfo = JSON.parse(this.responseText);
            networkArray = [];
            if (!udpInfo)
                return;
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
                    "</td><td class=\"row_tcp_server_port\">" + udpInfo[i].TCP_Serve_Port +
                    "</td><td class=\"row_udp_server_port\">" + udpInfo[i].UDP_Serve_Port +
                    "</td><td class=\"row_tcp_client_src_port\">" + udpInfo[i].TCP_Client_Src_Port +
                    "</td><td class=\"row_tcp_client_des_port\">" + udpInfo[i].TCP_Client_Des_Port +
                    "</td><td class=\"row_machine_number\">" + udpInfo[i].Machine_Number +
                    "</td><td class=\"row_model\">" + udpInfo[i].Model +
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
            alert("Please check at least one device!");
            return;
        }
        var Connect_Request = {
            "Command_Type": ["Read"],
            "Command_Name": ["Connect"],
            "Value": {
                "IP_address": check_val
            }
        };
        var xmlHttp = createJsonXmlHttp("Command");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var connectedInfo = JSON.parse(this.responseText);
                if (!connectedInfo) {
                    alert("Connection failed!");
                    return;
                }
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
                }
            };
            var xmlHttp = createJsonXmlHttp("Command");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var connectedInfo = JSON.parse(this.responseText);

                }
            };
            xmlHttp.send(JSON.stringify(Connect_Request));
        } else {
            alert("IP Address格式不正確!");
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
        }
    };
    var RF_XmlHttp = createJsonXmlHttp("test2");
    RF_XmlHttp.onreadystatechange = function () {
        if (RF_XmlHttp.readyState == 4 || RF_XmlHttp.readyState == "complete") {
            var response = JSON.parse(this.responseText);
            if (!response)
                return;
            response.forEach(info => {
                if (typeof (info) == 'undefined')
                    return;
                if (info.Command_status == 1) { //Add RF Setting
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
    if (confirm('Are you sure to submit the settings of devices?')) {
        var count_write_devices = 0;

        DeviceCheckbox.forEach(function (v, i) {
            var index = deviceArray.findIndex(function (info) {
                return info.IP_address == v.value;
            });
            var status = deviceArray[index].Status;
            if (v.checked && status == 1) {
                timeDelay["send_network"].push(setTimeout(function () {
                    Device_setting_write(i, v.value);
                }, 1100 * count_write_devices));
                count_write_devices++;
            }
        });

        timeDelay["send_network"].push(setTimeout(function () {
            var d = new Date();
            console.log("Re Search:" + d.getTime());
            Search();
        }, 1100 * count_write_devices));
    }
}

function Device_setting_write(i, connected_ip_addr) {
    var ip_mode = document.getElementsByName("conn_ip_mode")[i].value,
        ip_address = document.getElementsByName("conn_ip_addr")[i].value.split("."),
        mask_address = document.getElementsByName("conn_mask_addr")[i].value.split("."),
        gateway_address = document.getElementsByName("conn_gateway_addr")[i].value.split("."),
        client_ip_address = document.getElementsByName("conn_client_ip_addr")[i].value.split(".");
    var networkRequest = {
        "Command_Type": ["Write"],
        "Command_Name": ["Network"],
        "Value": {
            "IP_address": [connected_ip_addr]
        }
    };
    if (ip_mode == "DHCP") { //DHCP
        set_mode = "DHCP";
        networkRequest.Value.function = ["dev_Client_IP"];
        networkRequest.Value.dev_IP = ["0", "0", "0", "0"];
        networkRequest.Value.dev_Mask = ["0", "0", "0", "0"];
        networkRequest.Value.dev_GW = ["0", "0", "0", "0"];
        networkRequest.Value.dev_Client_IP = client_ip_address;
    } else { //Static IP
        set_mode = "Static IP";
        networkRequest.Value.function = ["dev_IP", "dev_Mask", "dev_GW", "dev_Client_IP"];
        networkRequest.Value.dev_IP = ip_address;
        networkRequest.Value.dev_Mask = mask_address;
        networkRequest.Value.dev_GW = gateway_address;
        networkRequest.Value.dev_Client_IP = client_ip_address;
    }

    var xmlHttp = createJsonXmlHttp("test2");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var response = JSON.parse(this.responseText);
            if (!response)
                return;
            if (response[0].Command_status == 1) {
                var d = new Date();
                console.log("Write Network:" + d.getTime());
                Basic_setting_write(i, response[0].TARGET_IP);
                return;
            } else {
                alert("Modify the network setting of IP address: " + response[0].TARGET_IP + " is failed.");
            }
        }
    };
    xmlHttp.send(JSON.stringify(networkRequest));
}

function Basic_setting_write(i, connected_ip_addr) {
    var index = i;
    var basicArray = {
        "Command_Type": ["Write"],
        "Command_Name": ["Basic"],
        "Interface": $("#select_connect_mode").children('option:selected').val(),
        "Value": {
            "IP_address": [connected_ip_addr],
            "function": ["dev_active_ID"],
            //"dev_transmission_cycle_time": "1000",
            "dev_active_ID": document.getElementsByName("conn_anchor_id")[i].value
        }
    };

    var xmlHttp = createJsonXmlHttp("test2");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var response = JSON.parse(this.responseText);
            if (!response)
                return;
            if (response[0].Command_status == 1) {
                var d = new Date();
                console.log("Write Basic:" + d.getTime());
                RF_setting_write(index, response[0].TARGET_IP);
                return;
            } else {
                alert("Modify the network setting of IP address: " + response[0].TARGET_IP + " is failed.");
            }
        }
    };
    xmlHttp.send(JSON.stringify(basicArray));
}

function RF_setting_write(i, connected_ip_addr) {
    var rfRequest = {
        "Command_Type": ["Write"],
        "Command_Name": ["RF"],
        "Value": {
            "IP_address": [connected_ip_addr],
            "function": ["Model_Name", "Version_Name", "rf_MODE", "rf_NSD", "rf_NTM_value",
                "rf_PAC", "rf_PGdelay", "rf_PMULT_value", "rf_Power", "rf_SFD_timeout", "rf_SMARTPOWER",
                "rf_channel", "rf_datarate", "rf_preambleCode", "rf_preambleLength", "rf_prf"
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
            "rf_PMULT_value": $('#conn_rf_mult_' + i).val()
        }
    };

    var xmlHttp = createJsonXmlHttp("test2");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var response = JSON.parse(this.responseText);
            if (!response)
                return;
            if (response[0].Command_status == 1) {
                var d = new Date();
                console.log("Write RF:" + d.getTime());
                alert("Modify the RF setting of IP address: " + response[0].TARGET_IP + " is successful!");
            } else {
                alert("Modify the RF setting of IP address: " + response[0].TARGET_IP + " is failed.");
            }
        }
    };
    xmlHttp.send(JSON.stringify(rfRequest));
}