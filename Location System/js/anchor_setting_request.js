const ip_mode_arr = ["DHCP", "Static"]
const rf_Channel_arr = ["CH1(3.5GHz)", "CH2(4.0GHz)", "CH3(4.5GHz)", "CH4(4.5GHz WBW)", "CH5(6.5GHz)", "CH7(6.5GHz WBW)"];
const rf_Datarate_arr = ["110Kbps", "850Kbps", "6.8Mbps"];
const rf_PRF_arr = ["16M", "64M"];
const rf_PreambleCode_arr = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "17", "18", "19", "20"];
const rf_PreambleLength_arr = ["64", "128", "256", "512", "1024", "1536", "2048", "4096"];
const rf_PAC_arr = ["8", "16", "32", "64"];
const rf_TX_PGdelay_arr = ["CH1", "CH2", "CH3", "CH4", "CH5", "CH6", "CH7"];
const rf_TX_Power_arr = [
    "CH1_NOSMART_16M", "CH2_NOSMART_16M", "CH3_NOSMART_16M", "CH4_NOSMART_16M", "CH5_NOSMART_16M", "CH7_NOSMART_16M",
    "CH1_NOSMART_64M", "CH2_NOSMART_64M", "CH3_NOSMART_64M", "CH4_NOSMART_64M", "CH5_NOSMART_64M", "CH7_NOSMART_64M",
    "CH1_SMART_16M", "CH2_SMART_16M", "CH3_SMART_16M", "CH4_SMART_16M", "CH5_SMART_16M", "CH7_SMART_16M",
    "CH1_SMART_64M", "CH2_SMART_64M", "CH3_SMART_64M", "CH4_SMART_64M", "CH5_SMART_64M", "CH7_SMART_64M"
];
const rf_NSD_arr = ["0", "1"];
const rf_SDF_timeoutr_arr = ["1089"];
const rf_SMARTPOWER_arr = ["0", "1"];
const rf_NTM_arr = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "17", "18", "19", "20", "21", "22", "23", "24",
    "25", "26", "27", "28", "29", "30", "31"
];
const rf_MULT_arr = ["0", "1", "2", "3", "4", "5", "6", "7"];

const RED_LIGHT = "<img src=\"../image/redLight.png\"/>";
const GREEN_LIGHT = "<img src=\"../image/greenLight.png\"/>";
var isAllSelected = false;
var DeviceCheckbox = document.getElementsByName("checkbox_ipAddr");
var deviceArray = [];
var connect_ip_array = [];
var count_connected = -1;

var timeDelay = {
    connect: [],
    send_network: []
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
            var list = "";
            networkArray = [];
            for (var i = 0; i < udpInfo.length; i++) {
                list += "<tr><td><input type=\"checkbox\" name=\"checkbox_ipAddr\" value=\"" +
                    udpInfo[i].IP_address + "\" />" +
                    "</td><td>" + RED_LIGHT +
                    "</td><td> " + //Anchor ID
                    "</td><td>" + udpInfo[i].MAC_address +
                    "</td><td>" + "DHCP" +
                    "</td><td>" + udpInfo[i].IP_address +
                    "</td><td>" + udpInfo[i].Gateway_address +
                    "</td><td>" + udpInfo[i].Mask_address +
                    "</td><td>" + udpInfo[i].Client_ip_addr +
                    "</td><td>" + udpInfo[i].TCP_Serve_Port +
                    "</td><td>" + udpInfo[i].UDP_Serve_Port +
                    "</td><td>" + udpInfo[i].TCP_Client_Src_Port +
                    "</td><td>" + udpInfo[i].TCP_Client_Des_Port +
                    "</td><td>" + udpInfo[i].Machine_Number +
                    "</td><td>" + udpInfo[i].Model +
                    "</td><td> " +
                    "</td></tr>";
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
                $("#table_ip_address_info tbody").html(list);
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
    connect_ip_array = [];
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

                //Reset
                resetListenersOfSelects();
                $("#table_ip_address_info tbody").empty();
                timeDelay["connect"].forEach(delay => {
                    clearTimeout(delay);
                });
                timeDelay["connect"] = []; //reset delay timeout array

                var count_connected_device = 0;
                deviceArray.forEach(function (element) {
                    if (element.Status == 1) {
                        $("#table_ip_address_info tbody").prepend("<tr><td>" +
                            "<input type=\"checkbox\" name=\"checkbox_ipAddr\" value=\"" + element.IP_address + "\" checked/></td>" +
                            "<td>" + GREEN_LIGHT + "</td>" +
                            "<td><input type='text' name=\"conn_anchor_id\" value=\"" + element.Anchor_ID + "\" /></td>" +
                            "<td name=\"conn_mac_addr\">" + element.MAC_address + "</td>" +
                            "<td class=\"row_ip_mode\"><select name=\"conn_ip_mode\">" + makeOptions(ip_mode_arr, "DHCP") + "</select></td>" +
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
                        count_connected_device++;
                        var num = connect_ip_array.length - count_connected_device;

                        timeDelay["connect"].push(setTimeout(function () {
                            RF_setting_read(num, element.IP_address);
                        }, 70 * count_connected_device));
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
                //LightTableFilter.init();
                $("input[name=checkbox_ipAddr]").change(checked_trans);
            }
        }
        xmlHttp.send(JSON.stringify(Connect_Request));
    } else {
        alert("Please check at least one device!");
    }
}

function RF_setting_read(num, ip_address) {
    var rf_Request = {
        "Command_Type": ["Read"],
        "Command_Name": ["RF"],
        "Value": {
            "IP_address": [ip_address],
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
            if (typeof (response[0]) == 'undefined')
                return;
            if (response[0].Command_status == 1) { //Add RF Setting
                count_connected++;
                $("#table_ip_address_info tbody tr").eq(num).append(
                    "<td class=\"row_rf_mode\" name=\"conn_rf_mode\">" + response[0].rf_MODE + "</td>" +
                    "<td class=\"row_rf_version\" name=\"conn_rf_version\">" + response[0].Version_Name + "</td>" +
                    "<td class=\"row_rf_channel\"><select id=\"conn_rf_channel_" + count_connected + "\">" + makeOptions(rf_Channel_arr, response[0].rf_channel) + "</select></td>" +
                    "<td class=\"row_rf_datarate\"><select id=\"conn_rf_datarate_" + count_connected + "\">" + makeOptions(rf_Datarate_arr, response[0].rf_datarate) + "</select></td>" +
                    "<td class=\"row_rf_prf\"><select id=\"conn_rf_prf_" + count_connected + "\">" + makeOptions(rf_PRF_arr, response[0].rf_prf) + "</select></td>" +
                    "<td class=\"row_rf_preamble_code\"><select id=\"conn_rf_preamble_code_" + count_connected + "\">" + makeOptions(rf_PreambleCode_arr, response[0].rf_preambleCode) + "</select></td>" +
                    "<td class=\"row_rf_preamble_len\"><select id=\"conn_rf_preamble_len_" + count_connected + "\">" + makeOptions(rf_PreambleLength_arr, response[0].rf_preambleLength) + "</select></td>" +
                    "<td class=\"row_rf_pac\"><select id=\"conn_rf_pac_" + count_connected + "\">" + makeOptions(rf_PAC_arr, response[0].rf_PAC) + "</select></td>" +
                    "<td class=\"row_rf_pg_delay\"><select id=\"conn_rf_pg_delay_" + count_connected + "\">" + makeOptions(rf_TX_PGdelay_arr, response[0].rf_PGdelay) + "</select></td>" +
                    "<td class=\"row_rf_power\"><select id=\"conn_rf_power_" + count_connected + "\">" + makeOptions(rf_TX_Power_arr, response[0].rf_Power) + "</select></td>" +
                    "<td class=\"row_rf_nsd\"><select id=\"conn_rf_nsd_" + count_connected + "\">" + makeOptions(rf_NSD_arr, response[0].rf_NSD) + "</select></td>" +
                    "<td class=\"row_rf_sdf_timeoutr\"><input type='text' id=\"conn_rf_sdf_timeoutr_" + count_connected + "\" value=\"" + response[0].rf_SFD_timeout + "\" /></td>" +
                    "<td class=\"row_rf_smartpower\"><select id=\"conn_rf_smartpower_" + count_connected + "\">" + makeOptions(rf_SMARTPOWER_arr, response[0].rf_SMARTPOWER) + "</select></td>" +
                    "<td class=\"row_rf_ntm\"><select id=\"conn_rf_ntm_" + count_connected + "\">" + makeOptions(rf_NTM_arr, response[0].rf_NTM_value) + "</select></td>" +
                    "<td class=\"row_rf_mult\"><select id=\"conn_rf_mult_" + count_connected + "\">" + makeOptions(rf_MULT_arr, response[0].rf_PMULT_value) + "</select></td>");
                $("#table_ip_address_info tbody tr:eq(" + num + ") td:gt(15)").css("background-color", "#c7d8e2");
                setListenerOfSelect(count_connected);
            }
        }
    };
    RF_XmlHttp.send(JSON.stringify(rf_Request));
}

function setListenerOfSelect(num) {
    $("#conn_rf_channel_" + num).change(function () {
        var option_index = $(this).get(0).selectedIndex;
        $("#conn_rf_pg_delay_" + num).val(rf_TX_PGdelay_arr[option_index]);
    });
    $("#conn_rf_datarate_" + num).change(function () {
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
    $("#conn_rf_preamble_code_" + num).change(function () {
        var preamble_len = parseInt($("#conn_rf_preamble_len_" + num).val(), 10);
        $("#conn_rf_sdf_timeoutr_" + num).val(parseInt($(this).val(), 10) + preamble_len + 1);
    });
    $("#conn_rf_preamble_len_" + num).change(function () {
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
}

function resetListenersOfSelects() {
    if (count_connected > -1) {
        for (i = 0; i < count_connected; i++) {
            $("#conn_rf_channel_" + i).unbind();
            $("#conn_rf_datarate_" + i).unbind();
            $("#conn_rf_preamble_code_" + i).unbind();
            $("#conn_rf_preamble_len_" + i).unbind();
        }
    }
}

function Device_setting_write() {
    var check_val = [];
    //connect_ip_array = [];
    var array = deviceArray;
    var count_write_devices = 0;
    DeviceCheckbox.forEach(function (v, i) {
        var index = deviceArray.findIndex(function (info) {
            return info.IP_address == v.value;
        });
        var status = deviceArray[index].Status;
        if (v.checked && status == 1) {
            /*check_val.push({
                ip_mode: document.getElementsByName("conn_ip_mode")[i].value,
                ip_address: v.value,
                dev_ip: document.getElementsByName("row_ip_addr")[i].value,
                dev_mask: document.getElementsByName("conn_gateway_addr")[i].value,
                dev_gateway: document.getElementsByName("conn_mask_addr")[i].value,
                dev_client_ip: document.getElementsByName("conn_client_ip_addr")[i].value,
            });*/

            //Network Setting:
            /*var ip_address = [],
                mask_address = [],
                gateway_address = [],
                client_ip = [];
            for (i = 1; i < 5; i++) {
                ip_address.push(document.getElementById("ip_address_" + i).value);
                mask_address.push(document.getElementById("mask_address_" + i).value);
                gateway_address.push(document.getElementById("gateway_address_" + i).value);
                client_ip.push(document.getElementById("client_ip_" + i).value);
            }*/
            timeDelay["send_network"].forEach(delay => {
                clearTimeout(delay);
            });
            timeDelay["send_network"] = []; //reset delay timeout array

            var connected_ip_addr = v.value,
                ip_mode = document.getElementsByName("conn_ip_mode")[i].value,
                ip_address = document.getElementsByName("conn_ip_addr")[i].value.split("."),
                mask_address = document.getElementsByName("conn_mask_addr")[i].value.split("."),
                gateway_address = document.getElementsByName("conn_gateway_addr")[i].value.split("."),
                client_ip_address = document.getElementsByName("conn_client_ip_addr")[i].value.split(".");

            var writeRequest = {
                "Command_Type": ["Write"],
                "Command_Name": ["Network"],
                "Value": {
                    "IP_address": [connected_ip_addr]
                }
            };
            if (ip_mode == "DHCP") { //DHCP
                set_mode = "DHCP";
                writeRequest.Value.function = ["dev_Client_IP"];
                writeRequest.Value.dev_IP = ["0", "0", "0", "0"];
                writeRequest.Value.dev_Mask = ["0", "0", "0", "0"];
                writeRequest.Value.dev_GW = ["0", "0", "0", "0"];
                writeRequest.Value.dev_Client_IP = client_ip_address;
            } else { //Static IP
                set_mode = "Static IP";
                writeRequest.Value.function = ["dev_IP", "dev_Mask", "dev_GW", "dev_Client_IP"];
                writeRequest.Value.dev_IP = ip_address;
                writeRequest.Value.dev_Mask = mask_address;
                writeRequest.Value.dev_GW = gateway_address;
                writeRequest.Value.dev_Client_IP = client_ip_address;
            }

            count_write_devices++;

            timeDelay["send_network"].push(setTimeout(function () {
                var d = new Date();
                console.log("Now Time:" + d.getTime());
                Request_write(writeRequest);
            }, 100 * count_write_devices));



            //Basic Setting:
            /*var basicArray = {
                "Command_Type": ["Write"],
                "Command_Name": ["Basic"],
                "Interface": $("#select_connect_mode").children('option:selected').val(),
                "Value": {
                    "IP_address": connect_ip_array,
                    "function": ["dev_transmission_cycle_time", "dev_active_ID"],
                    "dev_transmission_cycle_time": "1000",
                    "dev_active_ID": document.getElementsByName("conn_anchor_id")[i].value
                }
            };
            setTimeout(function () {
                Request_write(basicArray);
            }, 100);*/

        }
    });
}

function RF_setting_write() {
    var ip_arr_len = connect_ip_array.length;
    if (ip_arr_len > 0) {
        var RF_Array = {
            "Command_Type": ["Write"],
            "Command_Name": ["RF"],
            "Value": {
                "IP_address": connect_ip_array,
                "function": ["Model_Name", "Version_Name", "rf_MODE", "rf_NSD", "rf_NTM_value",
                    "rf_PAC", "rf_PGdelay", "rf_PMULT_value", "rf_Power", "rf_SFD_timeout", "rf_SMARTPOWER",
                    "rf_channel", "rf_datarate", "rf_preambleCode", "rf_preambleLength", "rf_prf"
                ],
                "rf_channel": [$('#rf_Channel').val()],
                "rf_datarate": [$('#rf_Datarate').val()],
                "rf_prf": [$('#rf_PRF').val()],
                "rf_preambleCode": [$('#rf_PreamblCode').val()],
                "rf_preambleLength": [$('#rf_PreambleLength').val()],
                "rf_PAC": [$('#rf_PAC').val()],
                "rf_PGdelay": [$('#rf_TX_PGdelay').val()],
                "rf_Power": [$('#rf_TX_Power').val()],
                "rf_NSD": [$('#rf_NSD').val()],
                "rf_SFD_timeout": [$('#rf_SDF_timeoutr').val()],
                "rf_SMARTPOWER": [$('#rf_SMARTPOWER').val()],
                "rf_NTM_value": [$('#rf_NTM').val()],
                "rf_PMULT_value": [$('#rf_MULT').val()]
            }
        };
        Request_write(RF_Array);
    } else {
        alert("請先連線裝置");
    }
}


function Request_write(settingArray) {
    var xmlHttp = createJsonXmlHttp("test2");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var response = JSON.parse(this.responseText);
            if (response[0].Command_status == 1) {
                alert("Writing parameters has been completed.");
            } else {
                alert("Writing parameters is failed.");
            }
        }
    };
    xmlHttp.send(JSON.stringify(settingArray));
}



function Device_setting_read() {
    var ip_arr_len = connect_ip_array.length;
    if (ip_arr_len > 0) {
        var requestArray = {
            "Command_Type": ["Read"],
            "Command_Name": [""],
            "Value": {
                "IP_address": [connect_ip_array[ip_arr_len - 1]]
            }
        };
        //Network Setting:
        requestArray.Command_Name[0] = "Network";
        requestArray.Value.function = ["dev_IP", "dev_GW", "dev_Mask", "dev_Client_IP"];
        read_network(requestArray);

        //Basic Setting:
        requestArray.Command_Name[0] = "Basic";
        requestArray.Interface = $("#select_connect_mode").children('option:selected').val();
        requestArray.Value.function = ["dev_transmission_cycle_time", "dev_active_ID"];
        setTimeout(function () {
            read_basic(requestArray);
        }, 100);
    } else {
        alert("請先連線至少一台裝置");
    }
}

function read_network(requestArray) {
    var xmlHttp = createJsonXmlHttp("test2");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var response = JSON.parse(this.responseText);
            if (response[0].Command_status == 1) {
                alert("Read the parameters has been completed.");
                for (i = 0; i < 4; i++) {
                    document.getElementById("ip_address_" + (i + 1)).value = response[0].dev_IP[i];
                    document.getElementById("mask_address_" + (i + 1)).value = response[0].dev_Mask[i];
                    document.getElementById("gateway_address_" + (i + 1)).value = response[0].dev_GW[i];
                    document.getElementById("client_ip_" + (i + 1)).value = response[0].dev_Client_IP[i];
                }
            } else {
                alert("Read the parameters is failed.");
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function read_basic(requestArray) {
    var xmlHttp = createJsonXmlHttp("test2");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var response = JSON.parse(this.responseText);
            if (response[0].Command_status == 1) {
                alert("Read the parameters has been completed.");
                document.getElementById("sent_cycle").value = response[0].dev_transmission_cycle_time;
                document.getElementById("device_id").value = response[0].dev_active_ID;
            } else {
                alert("Read the parameters is failed.");
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

/*function RF_setting_read() {
    var ip_arr_len = connect_ip_array.length;
    if (ip_arr_len > 0) {
        var requestArray = {
            "Command_Type": ["Read"],
            "Command_Name": ["RF"],
            "Value": {
                "IP_address": [connect_ip_array[ip_arr_len - 1]],
                "function": ["Model_Name", "Version_Name", "rf_MODE", "rf_NSD", "rf_NTM_value",
                    "rf_PAC", "rf_PGdelay", "rf_PMULT_value", "rf_Power", "rf_SFD_timeout", "rf_SMARTPOWER",
                    "rf_channel", "rf_datarate", "rf_preambleCode", "rf_preambleLength", "rf_prf"
                ]
            }
        };
        var xmlHttp = createJsonXmlHttp("test2");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var response = JSON.parse(this.responseText);
                if (response[0].Command_status == 1) {
                    alert("Writing parameters has been completed.");
                    //Label
                    document.getElementById("rf_Model").innerText = response[0].Model_Name;
                    document.getElementById("rf_Version").innerText = response[0].Version_Name;
                    document.getElementById("rf_MODE").innerText = response[0].rf_MODE;
                    document.getElementById("rf_Device_ID").innerText = response[0].rf_active_ID;
                    //DropdownList
                    selectOption("rf_Channel", response[0].rf_channel);
                    selectOption("rf_Datarate", response[0].rf_datarate);
                    selectOption("rf_PRF", response[0].rf_prf);
                    selectOption("rf_PreambleCode", response[0].rf_preambleCode);
                    selectOption("rf_PreambleLength", response[0].rf_preambleLength);
                    selectOption("rf_PAC", response[0].rf_PAC);
                    selectOption("rf_TX_PGdelay", response[0].rf_PGdelay);
                    selectOption("rf_TX_Power", response[0].rf_Power);
                    selectOption("rf_NSD", response[0].rf_NSD);
                    selectOption("rf_SDF_timeoutr", response[0].rf_SFD_timeout);
                    selectOption("rf_SMARTPOWER", response[0].rf_SMARTPOWER);
                    selectOption("rf_NTM", response[0].rf_NTM_value);
                    selectOption("rf_MULT", response[0].rf_PMULT_value);
                } else {
                    alert("Writing parameters is failed.");
                }
            }
        };
        xmlHttp.send(JSON.stringify(requestArray));
    } else {
        alert("請先連線裝置");
    }
}

function selectOption(id, resVal) {
    var dropdown = document.getElementById(id);
    var isNoException = false;
    for (var i = 0; i < dropdown.options.length; i++) {
        if (dropdown.options[i].value == resVal) {
            dropdown.options[i].selected = true;
            isNoException = true;
            break;
        }
    }
    if (!isNoException) {
        try {
            dropdown.add(new Option(resVal, resVal, false, true), null) //add new option to end of "dropdown"
        } catch (e) { //in IE, try the below version instead of add()
            dropdown.add(new Option(resVal, resVal, false, true)) //add new option to end of "dropdown"
        }

    }
}*/