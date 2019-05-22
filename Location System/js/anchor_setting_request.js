var RED_LIGHT = "<img src=\"../image/redLight.png\"/>";
var GREEN_LIGHT = "<img src=\"../image/greenLight.png\"/>";
var tbody = document.getElementsByTagName("tbody");
var DeviceCheckbox = document.getElementsByName("checkbox_ipAddr");
var networkArray = [];
var connect_ip_array = [];


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

function GetXmlHttpObject() {
    var xmlHttp = null;
    try { // Firefox, Opera 8.0+, Safari
        xmlHttp = new XMLHttpRequest();
    } catch (e) { //Internet Explorer
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    return xmlHttp;
}


window.addEventListener("load", Load, false);


function Load() {
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["Search_net"]
    }
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
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
    xmlHttp.open("POST", "Command", true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
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
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var udpInfo = JSON.parse(this.responseText);
            var list = "";
            networkArray = [];
            for (var i = 0; i < udpInfo.length; i++) {
                list += "<tr><td>" + "<input type=\"checkbox\" name=\"checkbox_ipAddr\" value=\"" +
                    udpInfo[i].IP_address + "\" />" +
                    "</td><td>" + RED_LIGHT +
                    "</td><td>" + udpInfo[i].Machine_Number +
                    "</td><td>" + udpInfo[i].Model +
                    "</td><td>" + " " +
                    "</td><td>" + udpInfo[i].IP_address +
                    "</td><td>" + udpInfo[i].Gateway_address +
                    "</td><td>" + udpInfo[i].Mask_address +
                    "</td><td>" + udpInfo[i].Client_ip_addr +
                    "</td><td>" + udpInfo[i].MAC_address +
                    "</td><td>" + udpInfo[i].TCP_Serve_Port +
                    "</td><td>" + udpInfo[i].UDP_Serve_Port +
                    "</td><td>" + udpInfo[i].TCP_Client_Src_Port +
                    "</td><td>" + udpInfo[i].TCP_Client_Des_Port +
                    "</td></tr>";
                networkArray.push({
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
            tbody[0].innerHTML = list;
            $(function () {
                $("input[name=checkbox_ipAddr]").change(checked_trans);
                if ($("#is_multiple_settings").is(":checked")) //多選
                    $("input[name=checkbox_ipAddr]").unbind('click', singleCheck);
                else //單選
                    $("input[name=checkbox_ipAddr]").click(singleCheck);
            });
        }
    }
    xmlHttp.open("POST", "test2", true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
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
    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["Connect"],
        "Value": {
            "IP_address": check_val
        }
    };

    if (checkedCount > 0) { //至少有一個IP Address被勾選
        var xmlHttp = GetXmlHttpObject();
        if (xmlHttp == null) {
            alert("Browser does not support HTTP Request");
            return;
        }
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var connectedInfo = JSON.parse(this.responseText);
                var index = -1,
                    list = "";

                networkArray.forEach(function (v) {
                    v.Status = 0;
                    v.Anchor_ID = "";
                });

                for (j in connectedInfo) {
                    index = networkArray.findIndex(function (array) {
                        return array.IP_address == connectedInfo[j].dev_ip;
                    });
                    if (index > -1) {
                        networkArray[index].Status = 1;
                        networkArray[index].Anchor_ID = connectedInfo[j].dev_active_ID;
                        connect_ip_array.push(connectedInfo[j].dev_ip);
                    }
                }

                networkArray.forEach(function (v) {
                    var light = RED_LIGHT;
                    if (v.Status == 1)
                        light = GREEN_LIGHT;
                    list += "<tr><td>" + "<input type=\"checkbox\" name=\"checkbox_ipAddr\" value=\"" +
                        v.IP_address + "\" />" +
                        "</td><td>" + light +
                        "</td><td>" + v.Machine_Number +
                        "</td><td>" + v.Model +
                        "</td><td>" + v.Anchor_ID +
                        "</td><td>" + v.IP_address +
                        "</td><td>" + v.Gateway_address +
                        "</td><td>" + v.Mask_address +
                        "</td><td>" + v.Client_ip_addr +
                        "</td><td>" + v.MAC_address +
                        "</td><td>" + v.TCP_Serve_Port +
                        "</td><td>" + v.UDP_Serve_Port +
                        "</td><td>" + v.TCP_Client_Src_Port +
                        "</td><td>" + v.TCP_Client_Des_Port +
                        "</td></tr>";
                });
                tbody[0].innerHTML = list; //此tbody在html文件中所有tbody標籤的排序(0開頭)-->0
                $(function () {
                    $("input[name=checkbox_ipAddr]").change(checked_trans);
                    if ($("#is_multiple_settings").is(":checked")) //多選
                        $("input[name=checkbox_ipAddr]").unbind('click', singleCheck);
                    else //單選
                        $("input[name=checkbox_ipAddr]").click(singleCheck);
                });
            }
        }
        xmlHttp.open("POST", "Command", true);
        xmlHttp.setRequestHeader("Content-type", "application/json");
        xmlHttp.send(JSON.stringify(requestArray));
    } else {
        alert("請至少選取1個device!");
    }
}

function Device_setting_write() {
    var ip_arr_len = connect_ip_array.length;
    if (ip_arr_len > 0) {
        var is_network = document.getElementById("is_network_setting").checked;
        var is_basic = document.getElementById("is_basic_setting").checked;
        if (is_network) {
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
            var networkArray = {
                "Command_Type": ["Write"],
                "Command_Name": ["Network"],
                "Value": {
                    "IP_address": connect_ip_array
                }
            };
            if (document.getElementsByName("network_setting_mode")[0].checked) { //DHCP
                set_mode = "DHCP";
                networkArray.Value.function = ["dev_Client_IP"];
                networkArray.Value.dev_Client_IP = client_ip;
            } else { //Fixed IP
                set_mode = "Fixed IP";
                if ($("#is_multiple_settings").is(":checked")) { //多選s
                    networkArray.Value.function = ["dev_Mask", "dev_GW", "dev_Client_IP"];
                    networkArray.Value.dev_Mask = mask_address;
                    networkArray.Value.dev_GW = gateway_address;
                    networkArray.Value.dev_Client_IP = client_ip;
                } else { //單選
                    networkArray.Value.function = ["dev_IP", "dev_Mask", "dev_GW", "dev_Client_IP"];
                    networkArray.Value.dev_IP = ip_address;
                    networkArray.Value.dev_Mask = mask_address;
                    networkArray.Value.dev_GW = gateway_address;
                    networkArray.Value.dev_Client_IP = client_ip;
                }
            }
            Request_write(networkArray);
        }
        if (is_basic) {
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
        }
    } else {
        alert("請連線至少一台裝置");
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
        alert("請連線至少一台裝置");
    }
}


function Request_write(settingArray) {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
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
    xmlHttp.open("POST", "test2", true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
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
        var is_network = document.getElementById("is_network_setting").checked;
        var is_basic = document.getElementById("is_basic_setting").checked;
        if (!is_network && !is_basic)
            alert("請至少勾選一項設定");
        if (is_network) {
            //Network Setting:
            requestArray.Command_Name[0] = "Network";
            requestArray.Value.function = ["dev_IP", "dev_GW", "dev_Mask", "dev_Client_IP"];
            read_network(requestArray);
        }
        if (is_basic) {
            //Basic Setting:
            requestArray.Command_Name[0] = "Basic";
            requestArray.Interface = $("#select_connect_mode").children('option:selected').val();
            requestArray.Value.function = ["dev_transmission_cycle_time", "dev_active_ID"];
            setTimeout(function () {
                read_basic(requestArray);
            }, 100);
        }
    } else {
        alert("請連線至少一台裝置");
    }
}

function read_network(requestArray) {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
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
    xmlHttp.open("POST", "test2", true); //Device_setting
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send(JSON.stringify(requestArray));
}

function read_basic(requestArray) {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
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
    xmlHttp.open("POST", "test2", true); //Device_setting
    xmlHttp.setRequestHeader("Content-type", "application/json");
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

        var xmlHttp = GetXmlHttpObject();
        if (xmlHttp == null) {
            alert("Browser does not support HTTP Request");
            return;
        }
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
        xmlHttp.open("POST", "test2", true); //DeviceNetworkSetting
        xmlHttp.setRequestHeader("Content-type", "application/json");
        xmlHttp.send(JSON.stringify(requestArray));
    } else {
        alert("請連線至少一台裝置");
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