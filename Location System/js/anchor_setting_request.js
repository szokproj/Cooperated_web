const IP_MODE = ["DHCP", "Static"]
const RF_CHANNEL = ["CH1(3.5GHz)", "CH2(4.0GHz)", "CH3(4.5GHz)", "CH4(4.5GHz WBW)", "CH5(6.5GHz)", "CH7(6.5GHz WBW)"];
const RF_DATARATE = ["110Kbps", "850Kbps", "6.8Mbps"];
const RF_PRF = ["16M", "64M"];
const RF_PREAMBLE_CODE = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "17", "18", "19", "20"];
const RF_PREAMBLE_LEN = ["64", "128", "256", "512", "1024", "1536", "2048", "4096"];
const RF_PAC = ["8", "16", "32", "64"];
const RF_TX_PG_DELAY = ["CH1", "CH2", "CH3", "CH4", "CH5", "CH7"];
/*const RF_TX_POWER = [
    "CH1_NOSMART_16M", "CH2_NOSMART_16M", "CH3_NOSMART_16M", "CH4_NOSMART_16M", "CH5_NOSMART_16M", "CH7_NOSMART_16M",
    "CH1_NOSMART_64M", "CH2_NOSMART_64M", "CH3_NOSMART_64M", "CH4_NOSMART_64M", "CH5_NOSMART_64M", "CH7_NOSMART_64M",
    "CH1_SMART_16M", "CH2_SMART_16M", "CH3_SMART_16M", "CH4_SMART_16M", "CH5_SMART_16M", "CH7_SMART_16M",
    "CH1_SMART_64M", "CH2_SMART_64M", "CH3_SMART_64M", "CH4_SMART_64M", "CH5_SMART_64M", "CH7_SMART_64M"
];*/
const RF_NSD = ["0", "1"];
const RF_SDF_TIMEOUTR = ["1089"];
const RF_SMARTPOWER = ["0", "1"];
const RF_NTM = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "17", "18", "19", "20", "21", "22", "23", "24",
    "25", "26", "27", "28", "29", "30", "31"
];
const RF_MULT = ["0", "1", "2", "3", "4", "5", "6", "7"];

const RED_LIGHT = "<img src=\"../image/redLight.png\"/>";
const GREEN_LIGHT = "<img src=\"../image/greenLight.png\"/>";
var isAllSelected = false;
var DeviceCheckbox = document.getElementsByName("checkbox_ipAddr");
var deviceArray = [];
var connect_ip_array = [];
var count_connected = -1;

var timeDelay = {
    connect: null,
    send_network: [],
    send_rf: []
}; //restore timeout's id


function Load() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["Search_net"]
    }
    var xmlHttp = createJsonXmlHttp("Command")
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var response = JSON.parse(this.responseText);
            var html = "<select id=\"interface_card\">";
            for (i = 0; i < response.length; i++) {
                html += "<option value=\"" + response[i].ip + "\">" + response[i].net_interface_id + "</option>";
            }
            html += "</select>";
            document.getElementById("select_interface_card").innerHTML = html;
            document.getElementById("local_ip").value = response[0].ip;
            $(function () {
                $("#interface_card").change(function () {
                    $("#local_ip").val($(this).children('option:selected').val());
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
    }
    var xmlHttp = createJsonXmlHttp("test2")
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var udpInfo = JSON.parse(this.responseText);
            networkArray = [];
            if (!udpInfo)
                return;
            $("#table_ip_address_info tbody").empty();
            for (var i = 0; i < udpInfo.length; i++) {
                $("#table_ip_address_info tbody").append("<tr><td><input type=\"checkbox\"" +
                    " name=\"checkbox_ipAddr\" value=\"" + udpInfo[i].IP_address + "\" />" +
                    "</td><td>" + RED_LIGHT +
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

                deviceArray.push({
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
            }
            $(function () {
                //LightTableFilter.init();
                $("input[name=checkbox_ipAddr]").change(checked_trans);

            });
        }
    }
    xmlHttp.send(JSON.stringify(requestArray));
}

function checked_trans() {
    for (k in $("input[name=checkbox_ipAddr]")) {
        if ($("input[name=checkbox_ipAddr]").eq(k).is(":checked")) {
            $(".sticky-table tbody tr:eq(" + k + ") td").css("background-color", "#c7d8e2");
        } else {
            $(".sticky-table tbody tr:eq(" + k + ") td:lt(4)").css("background-color", "#e6f5ff");
            $(".sticky-table tbody tr:eq(" + k + ") td:gt(3)").css("background-color", "white");
        }
    }
}

function SelectAll() {
    isAllSelected = !isAllSelected;
    if (isAllSelected)
        $("#btn_selectAll").text("Select");
    else
        $("#btn_selectAll").text("Select All");
    DeviceCheckbox.forEach(function (v) {
        v.checked = isAllSelected;
    });
    checked_trans();
}

function Connect() {
    var check_val = [];
    DeviceCheckbox.forEach(function (v) {
        if (v.checked)
            check_val.push(v.value);
    });
    var Connect_Request = {
        "Command_Type": ["Read"],
        "Command_Name": ["Connect"],
        "Value": {
            "IP_address": check_val
        }
    };

    if (check_val.length > 0) { //至少有一個IP Address被勾選
        var xmlHttp = createJsonXmlHttp("Command");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var connectedInfo = JSON.parse(this.responseText);

                deviceArray.forEach(function (v) {
                    v.Status = 0;
                    v.Anchor_ID = "";
                });

                connect_ip_array = [];
                for (var j in connectedInfo) {
                    var index = deviceArray.findIndex(function (array) {
                        return array.IP_address == connectedInfo[j].dev_ip;
                    });
                    if (index > -1) {
                        deviceArray[index].Status = 1;
                        deviceArray[index].Anchor_ID = connectedInfo[j].dev_active_ID;
                        connect_ip_array.push(connectedInfo[j].dev_ip);
                    }
                }

                resetListenersOfSelects(); //Reset listeners
                $("#table_ip_address_info tbody").empty();

                deviceArray.forEach(function (element) {
                    if (element.Status == 1) {
                        $("#table_ip_address_info tbody").prepend("<tr><td>" +
                            "<input type=\"checkbox\" name=\"checkbox_ipAddr\" value=\"" + element.IP_address + "\" checked/></td>" +
                            "<td>" + GREEN_LIGHT + "</td>" +
                            "<td><input type='text' name=\"conn_anchor_id\" value=\"" + element.Anchor_ID + "\" /></td>" +
                            "<td name=\"conn_mac_addr\">" + element.MAC_address + "</td>" +
                            "<td class=\"row_ip_mode\"><select name=\"conn_ip_mode\">" + makeOptions(IP_MODE, "DHCP") + "</select></td>" +
                            "<td class=\"row_ip_addr\"><input type='text' name=\"conn_ip_addr\" value=\"" + element.IP_address + "\" /></td>" +
                            "<td class=\"row_gateway_addr\"><input type='text' name=\"conn_gateway_addr\" value=\"" + element.Gateway_address + "\" /></td>" +
                            "<td class=\"row_mask_addr\"><input type='text' name=\"conn_mask_addr\" value=\"" + element.Mask_address + "\" /></td>" +
                            "<td class=\"row_client_ip_addr\"><input type='text' name=\"conn_client_ip_addr\" value=\"" + element.Client_ip_addr + "\" /></td>" +
                            "<td class=\"row_tcp_server_port\"><input type='text' name=\"conn_tcp_server_port\" value=\"" + element.TCP_Serve_Port + "\" /></td>" +
                            "<td class=\"row_udp_server_port\"><input type='text' name=\"conn_udp_server_port\" value=\"" + element.UDP_Serve_Port + "\" /></td>" +
                            "<td class=\"row_tcp_client_src_port\"><input type='text' name=\"conn_tcp_client_src_port\" value=\"" + element.TCP_Client_Src_Port + "\" /></td>" +
                            "<td class=\"row_tcp_client_des_port\"><input type='text' name=\"conn_tcp_client_des_port\" value=\"" + element.TCP_Client_Des_Port + "\" /></td>" +
                            "<td class=\"row_machine_number\"><input type='text' name=\"conn_machine_number\" value=\"" + element.Machine_Number + "\" /></td>" +
                            "<td class=\"row_model\"><input type='text' name=\"conn_model\" value=\"" + element.Model + "\" /></td>" +
                            "<td></td></tr>");
                        $("#table_ip_address_info tbody tr:eq(0) td:lt(16)").css("background-color", "#c7d8e2");


                    } else {
                        $("#table_ip_address_info tbody").append("<tr><td>" +
                            "<input type=\"checkbox\" name=\"checkbox_ipAddr\"" +
                            " value=\"" + element.IP_address + "\" />" +
                            "</td><td>" + RED_LIGHT +
                            "</td><td>" + element.Anchor_ID +
                            "</td><td>" + element.MAC_address +
                            "</td><td class=\"row_ip_mode\">" + "DHCP" +
                            "</td><td class=\"row_ip_addr\">" + element.IP_address +
                            "</td><td class=\"row_gateway_addr\">" + element.Gateway_address +
                            "</td><td class=\"row_mask_addr\">" + element.Mask_address +
                            "</td><td class=\"row_client_ip_addr\">" + element.Client_ip_addr +
                            "</td><td class=\"row_tcp_server_port\">" + element.TCP_Serve_Port +
                            "</td><td class=\"row_udp_server_port\">" + element.UDP_Serve_Port +
                            "</td><td class=\"row_tcp_client_src_port\">" + element.TCP_Client_Src_Port +
                            "</td><td class=\"row_tcp_client_des_port\">" + element.TCP_Client_Des_Port +
                            "</td><td class=\"row_machine_number\">" + element.Machine_Number +
                            "</td><td class=\"row_model\">" + element.Model +
                            "</td><td></td></tr>");
                    }
                });
                setListenerOfInput();

                timeDelay["connect"] = setTimeout(function () {
                    RF_setting_read(connect_ip_array);
                    clearTimeout(timeDelay["connect"]);
                }, 70);

                //LightTableFilter.init();
                $("input[name=checkbox_ipAddr]").change(checked_trans);
            }
        }
        xmlHttp.send(JSON.stringify(Connect_Request));
    } else {
        alert("Please check at least one device!");
    }
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
                            "<td class=\"row_rf_channel\"><select id=\"conn_rf_channel_" + num + "\">" + makeOptions(RF_CHANNEL, info.rf_channel) + "</select></td>" +
                            "<td class=\"row_rf_datarate\"><select id=\"conn_rf_datarate_" + num + "\">" + makeOptions(RF_DATARATE, info.rf_datarate) + "</select></td>" +
                            "<td class=\"row_rf_prf\"><select id=\"conn_rf_prf_" + num + "\">" + makeOptions(RF_PRF, info.rf_prf) + "</select></td>" +
                            "<td class=\"row_rf_preamble_code\"><select id=\"conn_rf_preamble_code_" + num + "\">" + makeOptions(RF_PREAMBLE_CODE, info.rf_preambleCode) + "</select></td>" +
                            "<td class=\"row_rf_preamble_len\"><select id=\"conn_rf_preamble_len_" + num + "\">" + makeOptions(RF_PREAMBLE_LEN, info.rf_preambleLength) + "</select></td>" +
                            "<td class=\"row_rf_pac\"><select id=\"conn_rf_pac_" + num + "\">" + makeOptions(RF_PAC, info.rf_PAC) + "</select></td>" +
                            "<td class=\"row_rf_pg_delay\"><select id=\"conn_rf_pg_delay_" + num + "\">" + makeOptions(RF_TX_PG_DELAY, info.rf_PGdelay) + "</select></td>" +
                            "<td class=\"row_rf_power\"><input type=\"text\" id=\"conn_rf_power_" + num + "\" value=\"" + info.rf_Power + "\" maxlength=\"10\" /></td>" +
                            "<td class=\"row_rf_nsd\"><select id=\"conn_rf_nsd_" + num + "\">" + makeOptions(RF_NSD, info.rf_NSD) + "</select></td>" +
                            "<td class=\"row_rf_sdf_timeoutr\"><input type='text' id=\"conn_rf_sdf_timeoutr_" + num + "\" value=\"" + info.rf_SFD_timeout + "\" /></td>" +
                            "<td class=\"row_rf_smartpower\"><select id=\"conn_rf_smartpower_" + num + "\">" + makeOptions(RF_SMARTPOWER, info.rf_SMARTPOWER) + "</select></td>" +
                            "<td class=\"row_rf_ntm\"><select id=\"conn_rf_ntm_" + num + "\">" + makeOptions(RF_NTM, info.rf_NTM_value) + "</select></td>" +
                            "<td class=\"row_rf_mult\"><select id=\"conn_rf_mult_" + num + "\">" + makeOptions(RF_MULT, info.rf_PMULT_value) + "</select></td>");
                        $("#table_ip_address_info tbody tr:eq(" + num + ") td:gt(15)").css("background-color", "#c7d8e2");

                        setListenerOfSelect(num);
                    }
                }
            });

        }
    };
    RF_XmlHttp.send(JSON.stringify(rf_Request));
}

function setListenerOfSelect(num) {
    $("#conn_rf_channel_" + num).on("change", function () {
        var option_index = $(this).get(0).selectedIndex;
        $("#conn_rf_pg_delay_" + num).val(RF_TX_PG_DELAY[option_index]);
    });
    $("#conn_rf_datarate_" + num).on("change", function () {
        if ($(this).val() == "6.8Mbps") {
            $("#conn_rf_preamble_len_" + num).val("128");
            $("#conn_rf_pac_" + num).val("8");
        } else if ($(this).val() == "850Kbps") {
            $("#conn_rf_preamble_len_" + num).val("512");
            $("#conn_rf_pac_" + num).val("32");
        } else if ($(this).val() == "110Kbps") {
            $("#conn_rf_preamble_len_" + num).val("1024");
            $("#conn_rf_pac_" + num).val("32");
        }
    });
    $("#conn_rf_preamble_code_" + num).on("change", function () {
        var preamble_len = parseInt($("#conn_rf_preamble_len_" + num).val(), 10);
        $("#conn_rf_sdf_timeoutr_" + num).val(parseInt($(this).val(), 10) + preamble_len + 1);
    });
    $("#conn_rf_preamble_len_" + num).on("change", function () {
        var preamble_code = parseInt($("#conn_rf_preamble_code_" + num).val(), 10);
        $("#conn_rf_sdf_timeoutr_" + num).val(parseInt($(this).val(), 10) + preamble_code + 1);
        switch ($(this).val()) {
            case "64":
            case "128":
                $("#conn_rf_pac_" + num).val("8");
                break;
            case "256":
                $("#conn_rf_pac_" + num).val("16");
                break;
            case "512":
            case "1024":
            case "1536":
                $("#conn_rf_pac_" + num).val("32");
                break;
            case "2048":
            case "4096":
                $("#conn_rf_pac_" + num).val("64");
                break;
            default:
                break;
        }
    });
    $("#conn_rf_power_" + num).keydown(function (e) {
        Limit_input_number(e);
    });
}

function resetListenersOfSelects() {
    if (count_connected > -1) {
        for (i = 0; i < count_connected; i++) {
            $("#conn_rf_channel_" + i).off("change");
            $("#conn_rf_datarate_" + i).off("change");
            $("#conn_rf_preamble_code_" + i).off("change");
            $("#conn_rf_preamble_len_" + i).off("change");
            $("#conn_rf_power_" + i).unbind();
        }
        count_connected = -1;
    }
}

function setListenerOfInput() {
    var modes = document.getElementsByName("conn_ip_mode");
    modes.forEach(function (mode, i) {
        document.getElementsByName("conn_ip_addr")[i].disabled = true;
        document.getElementsByName("conn_gateway_addr")[i].disabled = true;
        document.getElementsByName("conn_mask_addr")[i].disabled = true;
        $("select[name='conn_ip_mode']:eq(" + i + ")").on("change", function () {
            if ($(this).val() == "DHCP") {
                $("input[name='conn_ip_addr']:eq(" + i + ")").prop("disabled", true);
                $("input[name='conn_gateway_addr']:eq(" + i + ")").prop("disabled", true);
                $("input[name='conn_mask_addr']:eq(" + i + ")").prop("disabled", true);
            } else {
                $("input[name='conn_ip_addr']:eq(" + i + ")").prop("disabled", false);
                $("input[name='conn_gateway_addr']:eq(" + i + ")").prop("disabled", false);
                $("input[name='conn_mask_addr']:eq(" + i + ")").prop("disabled", false);
            }
        });
    });
}

function resetListenersOfInputs() {
    var modes = document.getElementsByName("conn_ip_mode");
    modes.forEach(function (mode, i) {
        $("select[name='conn_ip_mode']:eq(" + i + ")").off("change");
    });
}

function Device_setting_write() {
    var count_write_devices = 0;

    timeDelay["send_network"].forEach(delay => {
        clearTimeout(delay);
    });
    timeDelay["send_network"] = []; //reset delay timeout array

    DeviceCheckbox.forEach(function (v, i) {
        var index = deviceArray.findIndex(function (info) {
            return info.IP_address == v.value;
        });
        var status = deviceArray[index].Status;
        if (v.checked && status == 1) {
            var connected_ip_addr = v.value,
                ip_mode = document.getElementsByName("conn_ip_mode")[i].value,
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
            timeDelay["send_network"].push(setTimeout(function () {
                var d = new Date();
                console.log("Write Network:" + d.getTime());
                Request_write(networkRequest);
            }, 200 * count_write_devices));

            //Basic Setting:
            var basicArray = {
                "Command_Type": ["Write"],
                "Command_Name": ["Basic"],
                "Interface": $("#select_connect_mode").children('option:selected').val(),
                "Value": {
                    "IP_address": [connected_ip_addr],
                    "function": ["dev_transmission_cycle_time", "dev_active_ID"],
                    "dev_transmission_cycle_time": "1000",
                    "dev_active_ID": document.getElementsByName("conn_anchor_id")[i].value
                }
            }
            timeDelay["send_network"].push(setTimeout(function () {
                var d = new Date();
                console.log("Write Basic:" + d.getTime());
                Request_write(basicArray);
            }, 50 + 100 * count_write_devices));

            count_write_devices++;
        }
    });
    /*if (count_write_devices > 0) {
        timeDelay["send_network"].push(setTimeout(function () {
            var d = new Date();
            console.log("Re Search:" + d.getTime());
            Search();
        }, 200 * (count_write_devices)));
    }*/
}

function RF_setting_write() {
    var count_write_devices = 0;
    timeDelay["send_rf"].forEach(delay => {
        clearTimeout(delay);
    });
    timeDelay["send_rf"] = []; //reset delay timeout array

    DeviceCheckbox.forEach(function (v, i) {
        var index = deviceArray.findIndex(function (info) {
            return info.IP_address == v.value;
        });
        var status = deviceArray[index].Status;
        if (v.checked && status == 1) {
            var connected_ip_addr = v.value;
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

            timeDelay["send_rf"].push(setTimeout(function () {
                var d = new Date();
                console.log("Write RF:" + d.getTime());

                var xmlHttp = createJsonXmlHttp("test2");
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                        var response = JSON.parse(this.responseText);
                        if (!response)
                            return;
                        if (response[0].Command_status == 1) {
                            alert("Modify the RF setting of IP address: " + response[0].TARGET_IP + " is successful!");
                        } else {
                            alert("Modify the RF setting of IP address: " + response[0].TARGET_IP + " is failed.");
                        }
                    }
                };
                xmlHttp.send(JSON.stringify(rfRequest));

            }, 100 + 200 * count_write_devices));

            count_write_devices++;
        }
    });
    if (count_write_devices > 0) {
        timeDelay["send_rf"].push(setTimeout(function () {
            var d = new Date();
            console.log("Re Search:" + d.getTime());
            Search();
        }, 100 + 200 * (count_write_devices)));
    }
}


function Request_write(settingArray) {
    var xmlHttp = createJsonXmlHttp("test2");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var response = JSON.parse(this.responseText);
            if (!response)
                return;
            if (response[0].Command_status == 1) {
                //alert("Modify the setting of IP address: " + response[0].TARGET_IP + " is successful!");
                return;
            } else {
                alert("Modify the network setting of IP address: " + response[0].TARGET_IP + " is failed.");
            }
        }
    };
    xmlHttp.send(JSON.stringify(settingArray));
}