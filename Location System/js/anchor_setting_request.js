var rf_Channel_arr = ["CH1(3.5GHz)", "CH2(4.0GHz)", "CH3(4.5GHz)", "CH4(4.5GHz WBW)", "CH5(6.5GHz)", "CH7(6.5GHz WBW)"];
var rf_Datarate_arr = ["110Kbps", "850Kbps", "6.8Mbps"];
var rf_PRF_arr = ["16M", "64M"];
var rf_PreambleCode_arr = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "17", "18", "19", "20"];
var rf_PreambleLength_arr = ["64", "128", "256", "512", "1024", "1536", "2048", "4096"];
var rf_PAC_arr = ["8", "16", "32", "64"];
var rf_TX_PGdelay_arr = ["CH1", "CH2", "CH3", "CH4", "CH5", "CH6", "CH7"];
var rf_TX_Power_arr = [
    "CH1_NOSMART_16M", "CH2_NOSMART_16M", "CH3_NOSMART_16M", "CH4_NOSMART_16M", "CH5_NOSMART_16M", "CH7_NOSMART_16M",
    "CH1_NOSMART_64M", "CH2_NOSMART_64M", "CH3_NOSMART_64M", "CH4_NOSMART_64M", "CH5_NOSMART_64M", "CH7_NOSMART_64M",
    "CH1_SMART_16M", "CH2_SMART_16M", "CH3_SMART_16M", "CH4_SMART_16M", "CH5_SMART_16M", "CH7_SMART_16M",
    "CH1_SMART_64M", "CH2_SMART_64M", "CH3_SMART_64M", "CH4_SMART_64M", "CH5_SMART_64M", "CH7_SMART_64M"
];
var rf_NSD_arr = ["0", "1"];
var rf_SDF_timeoutr_arr = ["1089"];
var rf_SMARTPOWER_arr = ["0", "1"];
var rf_NTM_arr = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "17", "18", "19", "20", "21", "22", "23", "24",
    "25", "26", "27", "28", "29", "30", "31"
];
var rf_MULT_arr = ["0", "1", "2", "3", "4", "5", "6", "7"];

var RED_LIGHT = "<img src=\"../image/redLight.png\"/>";
var GREEN_LIGHT = "<img src=\"../image/greenLight.png\"/>";
var DeviceCheckbox = document.getElementsByName("checkbox_ipAddr");
var deviceArray = [];
var connect_ip_array = [];

window.addEventListener("load", Load, false);

$(function () {
    $("#select_connect_mode").change(function () {
        var opt = $(this).children('option:selected').val();
        if (opt == "ethernet") {
            $(".mode_ethernet").show();
            $(".mode_comport").hide();
            $("#btn_search").show();
        } else {
            $(".mode_ethernet").hide();
            $(".mode_comport").show();
            $("#btn_search").hide();
        }
    });
});

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
                    "</td><td> " +
                    "</td><td>" + udpInfo[i].MAC_address +
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
                if ($("#is_multiple_settings").is(":checked")) //多選
                    $("input[name=checkbox_ipAddr]").unbind('click', singleCheck);
                else //單選
                    $("input[name=checkbox_ipAddr]").click(singleCheck);
            });
        }
    }
    xmlHttp.send(JSON.stringify(requestArray));
}


function singleCheck() {
    $("input[name=checkbox_ipAddr]").not(this).prop("checked", false);
}

function checked_trans() {
    for (k in $("input[name=checkbox_ipAddr]")) {
        if ($("input[name=checkbox_ipAddr]").eq(k).is(":checked"))
            $("tbody tr").eq(k).css("background-color", "lightblue");
        else
            $("tbody tr").eq(k).css("background-color", "transparent");
    }
}

function SelectAll() {
    DeviceCheckbox.forEach(function (v) {
        v.checked = true;
    });
    $(checked_trans);
}

function DeselectAll() {
    DeviceCheckbox.forEach(function (v) {
        v.checked = false;
    });
    $(checked_trans);
}

function Connect() {
    var check_val = [],
        checkedCount = 0;
    connect_ip_array = [];
    DeviceCheckbox.forEach(function (v) {
        if (v.checked) {
            check_val.push(v.value);
            checkedCount++;
        }
    });
    var Connect_Request = {
        "Command_Type": ["Read"],
        "Command_Name": ["Connect"],
        "Value": {
            "IP_address": check_val
        }
    };

    if (checkedCount > 0) { //至少有一個IP Address被勾選
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

                $("#table_ip_address_info tbody").empty();
                var count_connected_device = 0;
                deviceArray.forEach(function (element) {
                    if (element.Status == 1) {
                        $("#table_ip_address_info tbody").prepend("<tr><td>" +
                            "<input type=\"checkbox\" name=\"checkbox_ipAddr\" value=\"" + element.IP_address + "\" /></td>" +
                            "<td>" + GREEN_LIGHT + "</td>" +
                            "<td><input type='text' name=\"conn_anchor_id\" value=\"" + element.Anchor_ID + "\" /></td>" +
                            "<td name=\"conn_mac_addr\">" + element.MAC_address + "</td>" +
                            "<td><input type='text' name=\"conn_ip_addr\" value=\"" + element.IP_address + "\" /></td>" +
                            "<td><input type='text' name=\"conn_gateway_addr\" value=\"" + element.Gateway_address + "\" /></td>" +
                            "<td><input type='text' name=\"conn_mask_addr\" value=\"" + element.Mask_address + "\" /></td>" +
                            "<td><input type='text' name=\"conn_client_ip_addr\" value=\"" + element.Client_ip_addr + "\" /></td>" +
                            "<td><input type='text' name=\"conn_tcp_server_port\" value=\"" + element.TCP_Serve_Port + "\" /></td>" +
                            "<td><input type='text' name=\"conn_udp_server_port\" value=\"" + element.UDP_Serve_Port + "\" /></td>" +
                            "<td><input type='text' name=\"conn_tcp_client_src_port\" value=\"" + element.TCP_Client_Src_Port + "\" /></td>" +
                            "<td><input type='text' name=\"conn_tcp_client_des_port\" value=\"" + element.TCP_Client_Des_Port + "\" /></td>" +
                            "<td><input type='text' name=\"conn_machine_number\" value=\"" + element.Machine_Number + "\" /></td>" +
                            "<td><input type='text' name=\"conn_model\" value=\"" + element.Model + "\" /></td>" +
                            "<td></td></tr>");
                        count_connected_device++
                        var num = connect_ip_array.length - count_connected_device;
                        setTimeout(function () {
                            inputTable_RF_info(num, element.IP_address);
                        }, 100);
                    } else {
                        $("#table_ip_address_info tbody").append("<tr><td>" +
                            "<input type=\"checkbox\" name=\"checkbox_ipAddr\"" +
                            " value=\"" + element.IP_address + "\" />" +
                            "</td><td>" + RED_LIGHT +
                            "</td><td>" + element.Anchor_ID +
                            "</td><td>" + element.MAC_address +
                            "</td><td>" + element.IP_address +
                            "</td><td>" + element.Gateway_address +
                            "</td><td>" + element.Mask_address +
                            "</td><td>" + element.Client_ip_addr +
                            "</td><td>" + element.TCP_Serve_Port +
                            "</td><td>" + element.UDP_Serve_Port +
                            "</td><td>" + element.TCP_Client_Src_Port +
                            "</td><td>" + element.TCP_Client_Des_Port +
                            "</td><td>" + element.Machine_Number +
                            "</td><td>" + element.Model +
                            "</td><td> </td></tr>");
                    }
                });

                var count = document.getElementsByName("conn_rf_mode").length - 1;
                for (var k = 0; k < count; k++) {
                    $("select[name='conn_rf_preamble_len']").eq(k).click(function () {
                        var value = $("select[name='conn_rf_preamble_len']").eq(k).value();
                        switch (value) {
                            case "64":
                            case "128":
                                $("select[name='conn_rf_pac']").eq(k).value("8");
                                break;
                            case "258":
                                $("select[name='conn_rf_pac']").eq(k).value("16");
                                break;
                            case "512":
                            case "1024":
                            case "1536":
                                $("select[name='conn_rf_pac']").eq(k).value("32");
                                break;
                            case "2048":
                            case "4096":
                                $("select[name='conn_rf_pac']").eq(k).value("64");
                                break;
                            default:
                                break;
                        }
                    });
                }


                //LightTableFilter.init();
                $("input[name=checkbox_ipAddr]").change(checked_trans);
                if ($("#is_multiple_settings").is(":checked")) //多選
                    $("input[name=checkbox_ipAddr]").unbind('click', singleCheck);
                else //單選
                    $("input[name=checkbox_ipAddr]").click(singleCheck);
            }
        }
        xmlHttp.send(JSON.stringify(Connect_Request));
    } else {
        alert("Please check at least one device!");
    }
}

function inputTable_RF_info(num, ip_address) {
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
    }
    var RF_XmlHttp = createJsonXmlHttp("test2");
    RF_XmlHttp.onreadystatechange = function () {
        if (RF_XmlHttp.readyState == 4 || RF_XmlHttp.readyState == "complete") {
            var response = JSON.parse(this.responseText);
            if (!response)
                return;
            if (typeof (response[0]) == 'undefined')
                return;
            if (response[0].Command_status == 1) { //Add RF Setting
                $("#table_ip_address_info tbody tr").eq(num).append(
                    "<td name=\"conn_rf_mode\">" + response[0].rf_MODE + "</td>" +
                    "<td name=\"conn_rf_version\">" + response[0].Version_Name + "</td>" +
                    "<td><select name=\"conn_rf_channel\">" + makeOptions(rf_Channel_arr, response[0].rf_channel) + "</select></td>" +
                    "<td><select name=\"conn_rf_datarate\">" + makeOptions(rf_Datarate_arr, response[0].rf_datarate) + "</select></td>" +
                    "<td><select name=\"conn_rf_prf\">" + makeOptions(rf_PRF_arr, response[0].rf_prf) + "</select></td>" +
                    "<td><select name=\"conn_rf_preamble_code\">" + makeOptions(rf_PreambleCode_arr, response[0].rf_preambleCode) + "</select></td>" +
                    "<td><select name=\"conn_rf_preamble_len\">" + makeOptions(rf_PreambleLength_arr, response[0].rf_preambleLength) + "</select></td>" +
                    "<td><select name=\"conn_rf_pac\">" + makeOptions(rf_PAC_arr, response[0].rf_PAC) + "</select></td>" +
                    "<td><select name=\"conn_rf_pg_delay\">" + makeOptions(rf_TX_PGdelay_arr, response[0].rf_PGdelay) + "</select></td>" +
                    "<td><select name=\"conn_rf_power\">" + makeOptions(rf_TX_Power_arr, response[0].rf_Power) + "</select></td>" +
                    "<td><select name=\"conn_rf_nsd\">" + makeOptions(rf_NSD_arr, response[0].rf_NSD) + "</select></td>" +
                    "<td><select name=\"conn_rf_sdf_timeoutr\">" + makeOptions(rf_SDF_timeoutr_arr, response[0].rf_SFD_timeout) + "</select></td>" +
                    "<td><select name=\"conn_rf_smartpower\">" + makeOptions(rf_SMARTPOWER_arr, response[0].rf_SMARTPOWER) + "</select></td>" +
                    "<td><select name=\"conn_rf_ntm\">" + makeOptions(rf_NTM_arr, response[0].rf_NTM_value) + "</select></td>" +
                    "<td><select name=\"conn_rf_mult\">" + makeOptions(rf_MULT_arr, response[0].rf_PMULT_value) + "</select></td>");
            }
        }
    };
    RF_XmlHttp.send(JSON.stringify(rf_Request));
}

function Device_setting_write() {
    var ip_arr_len = connect_ip_array.length;
    if (ip_arr_len > 0) {
        //Network Setting:
        var ip_address = [],
            mask_address = [],
            gateway_address = [],
            client_ip = [];
        for (i = 1; i < 5; i++) {
            ip_address.push(document.getElementById("ip_address_" + i).value);
            mask_address.push(document.getElementById("mask_address_" + i).value);
            gateway_address.push(document.getElementById("gateway_address_" + i).value);
            client_ip.push(document.getElementById("client_ip_" + i).value);
        }
        var deviceArray = {
            "Command_Type": ["Write"],
            "Command_Name": ["Network"],
            "Value": {
                "IP_address": connect_ip_array
            }
        };
        if (document.getElementsByName("network_setting_mode")[0].checked) { //DHCP
            set_mode = "DHCP";
            deviceArray.Value.function = ["dev_Client_IP"];
            //test
            deviceArray.Value.dev_IP = ["0", "0", "0", "0"];
            deviceArray.Value.dev_Mask = ["0", "0", "0", "0"];
            deviceArray.Value.dev_GW = ["0", "0", "0", "0"];
            //end test
            deviceArray.Value.dev_Client_IP = client_ip;
        } else { //Static IP
            set_mode = "Static IP";
            if ($("#is_multiple_settings").is(":checked")) { //多選
                deviceArray.Value.function = ["dev_Mask", "dev_GW", "dev_Client_IP"];
                //test
                deviceArray.Value.dev_IP = ["0", "0", "0", "0"];
                //end test
                deviceArray.Value.dev_Mask = mask_address;
                deviceArray.Value.dev_GW = gateway_address;
                deviceArray.Value.dev_Client_IP = client_ip;
            } else { //單選
                deviceArray.Value.function = ["dev_IP", "dev_Mask", "dev_GW", "dev_Client_IP"];
                deviceArray.Value.dev_IP = ip_address;
                deviceArray.Value.dev_Mask = mask_address;
                deviceArray.Value.dev_GW = gateway_address;
                deviceArray.Value.dev_Client_IP = client_ip;
            }
        }
        Request_write(deviceArray);

        //Basic Setting:
        var basicArray = {
            "Command_Type": ["Write"],
            "Command_Name": ["Basic"],
            "Interface": $("#select_connect_mode").children('option:selected').val(),
            "Value": {
                "IP_address": connect_ip_array,
                "function": ["dev_transmission_cycle_time", "dev_active_ID"],
                "dev_transmission_cycle_time": document.getElementById("sent_cycle").value,
                "dev_active_ID": document.getElementById("device_id").value
            }
        };
        setTimeout(function () {
            Request_write(basicArray);
        }, 100);

    } else {
        alert("請先連線裝置");
    }
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

function RF_setting_read() {
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
}