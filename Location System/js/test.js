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




function Search() {
    connect_ip_array = [];
    var networkRequest = {
        "Command_Type": ["Read"],
        "Command_Name": ["Search"],
        "Value": {
            "net_interface_id": [$("#interface_card").children('option:selected').text()],
            "ip": [$("#local_ip").val()]
        }
    }
    var networkXmlHttp = createJsonXmlHttp("test2")
    networkXmlHttp.onreadystatechange = function () {
        if (networkXmlHttp.readyState == 4 || networkXmlHttp.readyState == "complete") {
            var udpInfo = JSON.parse(this.responseText);
            var content = "";
            var array_map = {};
            deviceArray = [];
            for (var i = 0; i < udpInfo.length; i++) {
                array_map[udpInfo[i].IP_address] = i;
                var RF_Request = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["RF"],
                    "Value": {
                        "IP_address": [udpInfo[i].IP_address],
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
                        if (response[0].Command_status > 0) {
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
                                TCP_Client_Des_Port: udpInfo[i].TCP_Client_Des_Port,
                                //RF Setting
                                rf_active_ID: "",
                                rf_MODE: "",
                                rf_Version: "",
                                rf_channel: "",
                                rf_datarate: "",
                                rf_prf: "",
                                rf_preambleCode: "",
                                rf_preambleLength: "",
                                rf_PAC: "",
                                rf_PGdelay: "",
                                rf_Power: "",
                                rf_NSD: "",
                                rf_SFD_timeout: "",
                                rf_SMARTPOWER: "",
                                rf_NTM_value: "",
                                rf_PMULT_value: ""
                            });
                        }
                        for (var i = 0; i < deviceArray.length; i++) {
                            content += "<tr><td><input type=\"checkbox\" name=\"checkbox_ipAddr\" value=\"" +
                                deviceArray[i].IP_address + "\" />" +
                                "</td><td>" + RED_LIGHT +
                                "</td><td>" + " " +
                                "</td><td>" + deviceArray[i].MAC_address +
                                "</td><td>" + deviceArray[i].IP_address +
                                "</td><td>" + deviceArray[i].Gateway_address +
                                "</td><td>" + deviceArray[i].Mask_address +
                                "</td><td>" + deviceArray[i].Client_ip_addr +
                                "</td><td>" + deviceArray[i].TCP_Serve_Port +
                                "</td><td>" + deviceArray[i].UDP_Serve_Port +
                                "</td><td>" + deviceArray[i].TCP_Client_Src_Port +
                                "</td><td>" + deviceArray[i].TCP_Client_Des_Port +
                                "</td><td>" + deviceArray[i].Machine_Number +
                                "</td><td>" + deviceArray[i].Model +
                                "</td><td>" + " " +
                                "</td><td>" + deviceArray[i].rf_MODE +
                                "</td><td>" + deviceArray[i].rf_Version +
                                "</td><td>" + deviceArray[i].rf_channel +
                                "</td><td>" + deviceArray[i].rf_datarate +
                                "</td><td>" + deviceArray[i].rf_prf +
                                "</td><td>" + deviceArray[i].rf_preambleCode +
                                "</td><td>" + deviceArray[i].rf_preambleLength +
                                "</td><td>" + deviceArray[i].rf_PAC +
                                "</td><td>" + deviceArray[i].rf_PGdelay +
                                "</td><td>" + deviceArray[i].rf_Power +
                                "</td><td>" + deviceArray[i].rf_NSD +
                                "</td><td>" + deviceArray[i].rf_SFD_timeout +
                                "</td><td>" + deviceArray[i].rf_SMARTPOWER +
                                "</td><td>" + deviceArray[i].rf_NTM_value +
                                "</td><td>" + deviceArray[i].rf_PMULT_value +
                                "</td></tr>";
                        }
                        $(function () {
                            $("#table_ip_address_info tbody").html(content);
                            //LightTableFilter.init();
                            $("input[name=checkbox_ipAddr]").change(checked_trans);
                            if ($("#is_multiple_settings").is(":checked")) //多選
                                $("input[name=checkbox_ipAddr]").unbind('click', singleCheck);
                            else //單選
                                $("input[name=checkbox_ipAddr]").click(singleCheck);
                        });
                    }
                };
                RF_XmlHttp.send(JSON.stringify(RF_Request));

            }
        }
    }
    networkXmlHttp.send(JSON.stringify(networkRequest));
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
    var requestArray = {
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
                var index = -1,
                    list = "",
                    device_table = "";

                deviceArray.forEach(function (v) {
                    v.Status = 0;
                    v.Anchor_ID = "";
                });

                for (j in connectedInfo) {
                    index = deviceArray.findIndex(function (array) {
                        return array.IP_address == connectedInfo[j].dev_ip;
                    });
                    if (index > -1) {
                        deviceArray[index].Status = 1;
                        deviceArray[index].Anchor_ID = connectedInfo[j].dev_active_ID;
                        connect_ip_array.push(connectedInfo[j].dev_ip);
                    }
                }

                var count_conn_devices = 0;
                deviceArray.forEach(function (v) {
                    var light = RED_LIGHT;
                    if (v.Status == 1) {
                        light = GREEN_LIGHT;
                        //input device (network and basic) setting
                        device_table += "<tr><td>" + v.Anchor_ID + "</td>" +
                            "<td><select name=\"connected_dhcp\"><option value=\"DHCP\">DHCP</option>" +
                            "<option value=\"Static IP\">Static IP</option></select></td>" +
                            "<td><input type=\"text\" name=\"connected_ip_addr\"" +
                            " value=\"" + v.IP_address + "\" /></td>" +
                            "<td><input type=\"text\" name=\"connected_gateway_addr\"" +
                            " value=\"" + v.Gateway_address + "\" /></td>" +
                            "<td><input type=\"text\" name=\"connected_mask_addr\"" +
                            " value=\"" + v.Mask_address + "\" /></td>" +
                            "<td><input type=\"text\" name=\"connected_client_ip_addr\"" +
                            " value=\"" + v.Client_ip_addr + "\" /></td>" +
                            "</tr>";
                        count_conn_devices++;
                    }

                    list += "<tr><td><input type=\"checkbox\" name=\"checkbox_ipAddr\" value=\"" +
                        v.IP_address + "\" />" +
                        "</td><td>" + light +
                        "</td><td>" + v.Anchor_ID +
                        "</td><td>" + v.MAC_address +
                        "</td><td>" + v.IP_address +
                        "</td><td>" + v.Gateway_address +
                        "</td><td>" + v.Mask_address +
                        "</td><td>" + v.Client_ip_addr +
                        "</td><td>" + v.TCP_Serve_Port +
                        "</td><td>" + v.UDP_Serve_Port +
                        "</td><td>" + v.TCP_Client_Src_Port +
                        "</td><td>" + v.TCP_Client_Des_Port +
                        "</td><td>" + v.Machine_Number +
                        "</td><td>" + v.Model +
                        "</td></tr>";
                });

                $(function () {
                    $("#table_ip_address_info tbody").html(list);
                    $("#table_device_setting tbody").html(device_table);
                    for (var i = 0; i < count_conn_devices; i++) {
                        $("select[name='connected_dhcp']").eq(i).change(function () {
                            if ($(this).eq(i).value == "DHCP") {
                                $("select[name='connected_ip_addr']").eq(i).attr('disabled', true);
                                $("select[name='connected_gateway_addr']").eq(i).attr('disabled', true);
                                $("select[name='connected_mask_addr']").eq(i).attr('disabled', true);
                            } else {
                                $("select[name='connected_ip_addr']").eq(i).attr('disabled', false);
                                $("select[name='connected_gateway_addr']").eq(i).attr('disabled', false);
                                $("select[name='connected_mask_addr']").eq(i).attr('disabled', false);
                            }
                        });
                    }
                    $("input[name=checkbox_ipAddr]").change(checked_trans);
                    if ($("#is_multiple_settings").is(":checked")) //多選
                        $("input[name=checkbox_ipAddr]").unbind('click', singleCheck);
                    else //單選
                        $("input[name=checkbox_ipAddr]").click(singleCheck);
                });
            }
        }
        xmlHttp.send(JSON.stringify(requestArray));
    } else {
        alert("請至少勾選一個裝置!");
    }
}

function getTableHtml(light, array) {
    var html = "";
    for (var i = 0; i < array.length; i++) {
        html += "<tr><td><input type=\"checkbox\" name=\"checkbox_ipAddr\" value=\"" +
            array[i].IP_address + "\" />" +
            "</td><td>" + light +
            "</td><td>" + " " +
            "</td><td>" + array[i].MAC_address +
            "</td><td>" + array[i].IP_address +
            "</td><td>" + array[i].Gateway_address +
            "</td><td>" + array[i].Mask_address +
            "</td><td>" + array[i].Client_ip_addr +
            "</td><td>" + array[i].TCP_Serve_Port +
            "</td><td>" + array[i].UDP_Serve_Port +
            "</td><td>" + array[i].TCP_Client_Src_Port +
            "</td><td>" + array[i].TCP_Client_Des_Port +
            "</td><td>" + array[i].Machine_Number +
            "</td><td>" + array[i].Model +
            "</td><td>" + " " +
            "</td><td>" + array[i].rf_MODE +
            "</td><td>" + array[i].rf_Version +
            "</td><td>" + array[i].rf_channel +
            "</td><td>" + array[i].rf_datarate +
            "</td><td>" + array[i].rf_prf +
            "</td><td>" + array[i].rf_preambleCode +
            "</td><td>" + array[i].rf_preambleLength +
            "</td><td>" + array[i].rf_PAC +
            "</td><td>" + array[i].rf_PGdelay +
            "</td><td>" + array[i].rf_Power +
            "</td><td>" + array[i].rf_NSD +
            "</td><td>" + array[i].rf_SFD_timeout +
            "</td><td>" + array[i].rf_SMARTPOWER +
            "</td><td>" + array[i].rf_NTM_value +
            "</td><td>" + array[i].rf_PMULT_value +
            "</td></tr>";
    }
    return html;
}


/*
                connected_devices.forEach(function (v) {
                    list += "<tr><td><input type=\"checkbox\" name=\"checkbox_ipAddr\" value=\"" +
                        v.IP_address + "\" />" +
                        "</td><td>" + GREEN_LIGHT +
                        "</td><td>" + v.Anchor_ID +
                        "</td><td>" + v.MAC_address +
                        "</td><td>" + v.IP_address +
                        "</td><td>" + v.Gateway_address +
                        "</td><td>" + v.Mask_address +
                        "</td><td>" + v.Client_ip_addr +
                        "</td><td>" + v.TCP_Serve_Port +
                        "</td><td>" + v.UDP_Serve_Port +
                        "</td><td>" + v.TCP_Client_Src_Port +
                        "</td><td>" + v.TCP_Client_Des_Port +
                        "</td><td>" + v.Machine_Number +
                        "</td><td>" + v.Model +
                        "</td></tr>";
                });

disconnected_devices.forEach(function (v) {
                    list += "<tr><td><input type=\"checkbox\" name=\"checkbox_ipAddr\" value=\"" +
                        v.IP_address + "\" />" +
                        "</td><td>" + RED_LIGHT +
                        "</td><td>" + v.Anchor_ID +
                        "</td><td>" + v.MAC_address +
                        "</td><td>" + v.IP_address +
                        "</td><td>" + v.Gateway_address +
                        "</td><td>" + v.Mask_address +
                        "</td><td>" + v.Client_ip_addr +
                        "</td><td>" + v.TCP_Serve_Port +
                        "</td><td>" + v.UDP_Serve_Port +
                        "</td><td>" + v.TCP_Client_Src_Port +
                        "</td><td>" + v.TCP_Client_Des_Port +
                        "</td><td>" + v.Machine_Number +
                        "</td><td>" + v.Model +
                        "</td></tr>";
                });


for (var i = 0; i < connected_devices.length; i++) {
                    var RF_Request = {
                        "Command_Type": ["Read"],
                        "Command_Name": ["RF"],
                        "Value": {
                            "IP_address": [connected_devices[i].IP_address],
                            "function": ["Model_Name", "Version_Name", "rf_MODE", "rf_NSD", "rf_NTM_value",
                                "rf_PAC", "rf_PGdelay", "rf_PMULT_value", "rf_Power", "rf_SFD_timeout", "rf_SMARTPOWER",
                                "rf_channel", "rf_datarate", "rf_preambleCode", "rf_preambleLength", "rf_prf"
                            ]
                        }
                    };

                    var tbody = $("#table_ip_address_info tbody");

                    var RF_XmlHttp = createJsonXmlHttp("test2");
                    RF_XmlHttp.onreadystatechange = function () {
                        if (RF_XmlHttp.readyState == 4 || RF_XmlHttp.readyState == "complete") {
                            var response = JSON.parse(this.responseText);
                            var RFdata = response[0];
                            if (RFdata.Command_status == 1) { //Add RF Setting
                                //connected_devices[i].rf_active_ID = response[0].rf_active_ID;
                                /*connected_devices[i].rf_MODE = RFdata.rf_MODE;
                                connected_devices[i].rf_Version = RFdata.Version_Name;
                                connected_devices[i].rf_channel = RFdata.rf_channel;
                                connected_devices[i].rf_datarate = RFdata.rf_datarate;
                                connected_devices[i].rf_prf = RFdata.rf_prf;
                                connected_devices[i].rf_preambleCode = RFdata.rf_preambleCode;
                                connected_devices[i].rf_preambleLength = RFdata.rf_preambleLength;
                                connected_devices[i].rf_PAC = RFdata.rf_PAC;
                                connected_devices[i].rf_PGdelay = RFdata.rf_PGdelay;
                                connected_devices[i].rf_Power = RFdata.rf_Power;
                                connected_devices[i].rf_NSD = RFdata.rf_NSD;
                                connected_devices[i].rf_SFD_timeout = RFdata.rf_SFD_timeout;
                                connected_devices[i].rf_SMARTPOWER = RFdata.rf_SMARTPOWER;
                                connected_devices[i].rf_NTM_value = RFdata.rf_NTM_value;
                                connected_devices[i].rf_PMULT_value = RFdata.rf_PMULT_value;*/
                    /*            tbody.append("<tr><td><input type=\"checkbox\" name=\"checkbox_ipAddr\" value=\"" +
                                    connected_devices[i].IP_address + "\" />" +
                                    "</td><td>" + GREEN_LIGHT +
                                    "</td><td>" + connected_devices[i].Anchor_ID +
                                    "</td><td>" + connected_devices[i].MAC_address +
                                    "</td><td>" + connected_devices[i].IP_address +
                                    "</td><td>" + connected_devices[i].Gateway_address +
                                    "</td><td>" + connected_devices[i].Mask_address +
                                    "</td><td>" + connected_devices[i].Client_ip_addr +
                                    "</td><td>" + connected_devices[i].TCP_Serve_Port +
                                    "</td><td>" + connected_devices[i].UDP_Serve_Port +
                                    "</td><td>" + connected_devices[i].TCP_Client_Src_Port +
                                    "</td><td>" + connected_devices[i].TCP_Client_Des_Port +
                                    "</td><td>" + connected_devices[i].Machine_Number +
                                    "</td><td>" + connected_devices[i].Model +
                                    "</td><td>" + " " +
                                    "</td><td>" + RFdata.rf_MODE +
                                    "</td><td>" + RFdata.rf_Version +
                                    "</td><td>" + RFdata.rf_channel +
                                    "</td><td>" + RFdata.rf_datarate +
                                    "</td><td>" + RFdata.rf_prf +
                                    "</td><td>" + RFdata.rf_preambleCode +
                                    "</td><td>" + RFdata.rf_preambleLength +
                                    "</td><td>" + RFdata.rf_PAC +
                                    "</td><td>" + RFdata.rf_PGdelay +
                                    "</td><td>" + RFdata.rf_Power +
                                    "</td><td>" + RFdata.rf_NSD +
                                    "</td><td>" + RFdata.rf_SFD_timeout +
                                    "</td><td>" + RFdata.rf_SMARTPOWER +
                                    "</td><td>" + RFdata.rf_NTM_value +
                                    "</td><td>" + RFdata.rf_PMULT_value +
                                    "</td></tr>");
                            }
                        }
                    };
                    RF_XmlHttp.send(JSON.stringify(RF_Request));
                }


*/