const IP_MODE = ["DHCP", "Static"]
const RF_CHANNEL = ["CH1(3.5GHz)", "CH2(4.0GHz)", "CH3(4.5GHz)", "CH4(4.5GHz WBW)", "CH5(6.5GHz)", "CH7(6.5GHz WBW)"];
const RF_DATARATE = ["110Kbps", "850Kbps", "6.8Mbps"];
const RF_PRF = ["16M", "64M"];
const RF_PREAMBLE_CODE = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "17", "18", "19", "20"];
const RF_PREAMBLE_LEN = ["64", "128", "256", "512", "1024", "1536", "2048", "4096"];
const RF_PAC = ["8", "16", "32", "64"];
const RF_TX_PG_DELAY = ["CH1", "CH2", "CH3", "CH4", "CH5", "CH7"];
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
var displayRowArray = {
    "check_all_net_basic": true,
    "check_all_net_advance": true,
    "check_all_rf_basic": true,
    "check_all_rf_advance": true,
    "row_ip_addr": true,
    "row_gateway_addr": true,
    "row_mask_addr": true,
    "row_client_ip_addr": true,
    "row_machine_number": true,
    "row_model": true,
    "row_tcp_server_port": true,
    "row_udp_server_port": true,
    "row_tcp_client_src_port": true,
    "row_tcp_client_des_port": true,
    "row_rf_mode": true,
    "row_rf_version": true,
    "row_rf_channel": true,
    "row_rf_datarate": true,
    "row_rf_preamble_code": true,
    "row_rf_preamble_len": true,
    "row_rf_pac": true,
    "row_rf_sdf_timeoutr": true,
    "row_rf_prf": true,
    "row_rf_pg_delay": true,
    "row_rf_power": true,
    "row_rf_nsd": true,
    "row_rf_smartpower": true,
    "row_rf_ntm": true,
    "row_rf_mult": true
};
var token = "";

$(function () { //Load==>
    token = getToken();
    /**
     * Check this page's permission and load navbar
     */
    if (!getPermissionOfPage("Anchor_Setting")) {
        alert("Permission denied!");
        window.location.href = '../index.html';
    }
    setNavBar("Anchor_Setting", "");

    $(".middle").css("height", screen.availHeight * 0.75 + "px");

    var dialog, form;
    dialog = $("#dialog_set_table_display").dialog({
        autoOpen: false,
        height: 600,
        width: 400,
        modal: true,
        buttons: {
            Confirm: function () {
                var rows = document.getElementsByName("display_rows");
                for (i = 0; i < rows.length; i++) {
                    if (rows[i].checked) {
                        displayRowArray[rows[i].value] = true;
                        $("." + rows[i].value).show();
                    } else {
                        displayRowArray[rows[i].value] = false;
                        $("." + rows[i].value).hide();
                    }
                }
                displayRowArray["check_all_net_basic"] = $("#check_all_net_basic").prop("checked");
                displayRowArray["check_all_net_advance"] = $("#check_all_net_advance").prop("checked");
                displayRowArray["check_all_rf_basic"] = $("#check_all_rf_basic").prop("checked");
                displayRowArray["check_all_rf_advance"] = $("#check_all_rf_advance").prop("checked");
                dialog.dialog("close");
            },
            Cancel: function () {
                form[0].reset();
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        SendResult();
    });

    $("#open_dialog_set").click(function () {
        var rows = document.getElementsByName("display_rows");
        for (i = 0; i < rows.length; i++) {
            if (displayRowArray[rows[i].value])
                rows[i].checked = true;
            else
                rows[i].checked = false;
        }
        $("#check_all_net_basic").prop("checked", displayRowArray["check_all_net_basic"]);
        $("#check_all_net_advance").prop("checked", displayRowArray["check_all_net_advance"]);
        $("#check_all_rf_basic").prop("checked", displayRowArray["check_all_rf_basic"]);
        $("#check_all_rf_advance").prop("checked", displayRowArray["check_all_rf_advance"]);
        dialog.dialog("open");
    });

    $("#select_connect_mode").change(function () {
        var opt = $(this).children('option:selected').val();
        if (opt == "ethernet") {
            $(".mode_ethernet").show();
            $(".mode_comport").hide();
        } else {
            $(".mode_ethernet").hide();
            $(".mode_comport").show();
        }
    });

    $("#check_all_net_basic").change(function () {
        displayAllSelect(0, 6, this.checked);
    });

    $("#check_all_net_advance").change(function () {
        displayAllSelect(6, 10, this.checked);
    });

    $("#check_all_rf_basic").change(function () {
        displayAllSelect(10, 18, this.checked);
    });

    $("#check_all_rf_advance").change(function () {
        displayAllSelect(18, 25, this.checked);
    });

    for (i = 1; i < 5; i++) {
        $("#static_ip_" + i).keydown(function (e) {
            Limit_input_number(e);
        });
    }

    sortTable('.row_anchor_id', 'input');
    sortTable('.row_mac_address', '');
    sortTable('.row_ip_mode', 'select');
    sortTable('.row_ip_addr', 'input');
    sortTable('.row_gateway_addr', 'input');
    sortTable('.row_mask_addr', 'input');
    sortTable('.row_client_ip_addr', 'input');
    sortTable('.row_machine_number', 'input');
    sortTable('.row_model', '');
    sortTable('.row_tcp_server_port', '');
    sortTable('.row_udp_server_port', '');
    sortTable('.row_tcp_client_src_port', '');
    sortTable('.row_tcp_client_des_port', '');
    sortTable('.row_rf_mode', '');
    sortTable('.row_rf_version', '');
    sortTable('.row_rf_channel', 'select');
    sortTable('.row_rf_datarate', 'select');
    sortTable('.row_rf_prf', 'select');
    sortTable('.row_rf_preamble_code', 'select');
    sortTable('.row_rf_preamble_len', 'select');
    sortTable('.row_rf_pac', 'select');
    sortTable('.row_rf_pg_delay', 'select');
    sortTable('.row_rf_power', 'input');
    sortTable('.row_rf_nsd', 'select');
    sortTable('.row_rf_sdf_timeoutr', 'input');
    sortTable('.row_rf_smartpower', 'select');
    sortTable('.row_rf_ntm', 'select');
    sortTable('.row_rf_mult', 'select');

    Load();
    inputSetAllRow();
});

function Limit_input_number(e) {
    // Allow: backspace, delete, tab, escape, enter, - and .
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 189, 190]) !== -1 ||
        // Allow: Ctrl+A, Command+A
        (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
        // Allow: home, end, left, right, down, up
        (e.keyCode >= 35 && e.keyCode <= 40)) {
        // let it happen, don't do anything
        return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
}

function displayAllSelect(start, end, check) {
    for (i = start; i < end; i++)
        document.getElementsByName("display_rows")[i].checked = check;
}

function displaySelectedRows() {
    var rows = document.getElementsByName("display_rows");
    for (i = 0; i < rows.length; i++) {
        if (displayRowArray[rows[i].value] == true)
            $("." + rows[i].value).show();
        else
            $("." + rows[i].value).hide();
    }
}

function setCheckboxListeners() {
    $("#table_ip_address_info tbody tr").each(function (index) {
        var tr = $(this);
        tr.find('td:eq(0) label').text(index + 1);
        tr.find('td:eq(0) input').off('click').on('click', function () {
            tr.children('td:eq(0)').click();
        });
        tr.children('td:eq(0)').off('click').on('click', function () {
            var state = tr.find('td:eq(0) input').prop('checked');
            tr.find('td:eq(0) input').prop('checked', !state);
            if (!state) {
                tr.children('td').css("background-color", "#c7d8e2");
            } else {
                tr.children('td:lt(4)').css("background-color", "#e6f5ff");
                tr.children('td:gt(3)').css("background-color", "white");
            }
        });
    });
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

function checkAddressFragment(fragment) {
    if (fragment.length > 3 || fragment.length < 1) {
        return false;
    } else {
        if (parseInt(fragment, 10) > 255)
            return false;
        else
            return true;
    }
}

function inputSetAllRow() {
    $("#table_ip_address_info thead").append("<tr>" +
        "<th style=\"cursor: pointer;\"><input type=\"checkbox\" id=\"all_check\" /> All</th>" +
        "<th>N/A</th>" +
        "<th>N/A</th>" +
        "<th>N/A</th>" +
        "<th class=\"row_ip_mode\"><select id=\"all_ip_mode\">" + makeOptions(IP_MODE, "DHCP") + "</select></th>" +
        "<th class=\"row_ip_addr\">N/A</th>" +
        "<th class=\"row_gateway_addr\"><input type='text' id=\"all_gateway_addr\" /></th>" +
        "<th class=\"row_mask_addr\"><input type='text' id=\"all_mask_addr\" /></th>" +
        "<th class=\"row_client_ip_addr\"><input type='text' id=\"all_client_ip_addr\" /></th>" +
        "<th class=\"row_machine_number\"><input type='text' id=\"all_machine_number\" /></th>" +
        "<th class=\"row_model\">N/A</th>" +
        "<th class=\"row_tcp_server_port\">N/A</th>" +
        "<th class=\"row_udp_server_port\">N/A</th>" +
        "<th class=\"row_tcp_client_src_port\">N/A</th>" +
        "<th class=\"row_tcp_client_des_port\">N/A</th>" +
        "<th></th>" +
        "<th class=\"row_rf_mode\" id=\"all_rf_mode\">N/A</th>" +
        "<th class=\"row_rf_version\" id=\"all_rf_version\">N/A</th>" +
        "<th class=\"row_rf_channel\"><select id=\"all_rf_channel\">" + makeOptions(RF_CHANNEL, "") + "</select></th>" +
        "<th class=\"row_rf_datarate\"><select id=\"all_rf_datarate\">" + makeOptions(RF_DATARATE, "") + "</select></th>" +
        "<th class=\"row_rf_prf\"><select id=\"all_rf_prf\">" + makeOptions(RF_PRF, "") + "</select></th>" +
        "<th class=\"row_rf_preamble_code\"><select id=\"all_rf_preamble_code\">" + makeOptions(RF_PREAMBLE_CODE, "") + "</select></th>" +
        "<th class=\"row_rf_preamble_len\"><select id=\"all_rf_preamble_len\">" + makeOptions(RF_PREAMBLE_LEN, "") + "</select></th>" +
        "<th class=\"row_rf_pac\"><select id=\"all_rf_pac\">" + makeOptions(RF_PAC, "") + "</select></th>" +
        "<th class=\"row_rf_pg_delay\"><select id=\"all_rf_pg_delay\">" + makeOptions(RF_TX_PG_DELAY, "") + "</select></th>" +
        "<th class=\"row_rf_power\"><input type=\"text\" id=\"all_rf_power\"  maxlength=\"10\" /></th>" +
        "<th class=\"row_rf_nsd\"><select id=\"all_rf_nsd\">" + makeOptions(RF_NSD, "") + "</select></th>" +
        "<th class=\"row_rf_sdf_timeoutr\"><input type='text' id=\"all_rf_sdf_timeoutr\"  /></th>" +
        "<th class=\"row_rf_smartpower\"><select id=\"all_rf_smartpower\">" + makeOptions(RF_SMARTPOWER, "") + "</select></th>" +
        "<th class=\"row_rf_ntm\"><select id=\"all_rf_ntm\">" + makeOptions(RF_NTM, "") + "</select></th>" +
        "<th class=\"row_rf_mult\"><select id=\"all_rf_mult\">" + makeOptions(RF_MULT, "") + "</select></th></tr>");
    setListenerOfSetAllRow();
}

function setListenerOfSetAllRow() {
    var check = document.getElementsByName("checkbox_ipAddr");
    var status = document.getElementsByName("conn_status");
    $("#all_check").parent().on('click', function () {
        var state = $("#all_check").prop("checked");
        $("#all_check").prop("checked", !state);
        check.forEach(element => {
            element.checked = !state;
        });
        checked_trans();
    });
    $("#all_check").on('click', function () {
        $("#all_check").parent().click();
    });
    $("#all_gateway_addr").prop("disabled", true);
    $("#all_mask_addr").prop("disabled", true);
    $("#all_ip_mode").on("change", function () {
        var bool = false;
        if ($(this).val() == "DHCP")
            bool = true;
        $("#all_gateway_addr").prop("disabled", bool);
        $("#all_mask_addr").prop("disabled", bool);
        check.forEach(function (element, i) {
            if (element.checked && status[i].value == "1") {
                $("select[name='conn_ip_mode']").eq(i).val($("#all_ip_mode").val());
                $("input[name='conn_ip_addr']").eq(i).prop("disabled", bool);
                $("input[name='conn_gateway_addr']").eq(i).prop("disabled", bool);
                $("input[name='conn_mask_addr']").eq(i).prop("disabled", bool);
            }
        });
    });
    $("#all_rf_channel").on("change", function () {
        var option_index = $(this).get(0).selectedIndex;
        $("#all_rf_pg_delay").val(RF_TX_PG_DELAY[option_index]);
        check.forEach(function (element, i) {
            if (element.checked && status[i].value == "1") {
                $("select[name='conn_rf_pg_delay']").eq(i).val(RF_TX_PG_DELAY[option_index]);
            }
        });
    });
    $("#all_rf_datarate").on("change", function () {
        if ($(this).val() == "6.8Mbps") {
            $("#all_rf_preamble_len").val("128");
            $("#all_rf_pac").val("8");
        } else if ($(this).val() == "850Kbps") {
            $("#all_rf_preamble_len").val("512");
            $("#all_rf_pac").val("32");
        } else if ($(this).val() == "110Kbps") {
            $("#all_rf_preamble_len").val("1024");
            $("#all_rf_pac").val("32");
        }
        check.forEach(function (element, i) {
            if (element.checked && status[i].value == "1") {
                $("select[name='conn_rf_preamble_len']").eq(i).val($("#all_rf_preamble_len").val());
                $("select[name='conn_rf_pac']").eq(i).val($("#all_rf_pac").val());
            }
        });
    });
    $("#all_rf_preamble_code").on("change", function () {
        var preamble_len = parseInt($("#all_rf_preamble_len").val(), 10);
        $("#all_rf_sdf_timeoutr").val(parseInt($(this).val(), 10) + preamble_len + 1);
        check.forEach(function (element, i) {
            if (element.checked && status[i].value == "1") {
                $("input[name='conn_rf_sdf_timeoutr']").eq(i).val($("#all_rf_sdf_timeoutr").val());
            }
        });
    });
    $("#all_rf_preamble_len").on("change", function () {
        var preamble_code = parseInt($("#all_rf_preamble_code").val(), 10);
        $("#all_rf_sdf_timeoutr").val(parseInt($(this).val(), 10) + preamble_code + 1);
        switch ($(this).val()) {
            case "64":
            case "128":
                $("#all_rf_pac").val("8");
                break;
            case "256":
                $("#all_rf_pac").val("16");
                break;
            case "512":
            case "1024":
            case "1536":
                $("#all_rf_pac").val("32");
                break;
            case "2048":
            case "4096":
                $("#all_rf_pac").val("64");
                break;
            default:
                break;
        }
        check.forEach(function (element, i) {
            if (element.checked && status[i].value == "1") {
                $("input[name='conn_rf_sdf_timeoutr']").eq(i).val($("#all_rf_sdf_timeoutr").val());
                $("select[name='conn_rf_pac']").val($("#all_rf_pac").val());
            }
        });
    });
    $("#all_rf_power").keydown(function (e) {
        Limit_input_number(e);
    });
    /**
     * Synchronize all rows of this column
     */
    var network_name_array = [
        "gateway_addr", "mask_addr", "client_ip_addr", "machine_number"
    ];
    var rf_name_array = [
        "rf_channel", "rf_datarate", "rf_prf", "rf_preamble_code", "rf_preamble_len", "rf_pac",
        "rf_pg_delay", "rf_power", "rf_nsd", "rf_sdf_timeoutr", "rf_smartpower", "rf_ntm", "rf_mult"
    ];
    network_name_array.forEach(column => {
        $("#all_" + column).on("change", function () {
            check.forEach(function (element, i) {
                if (element.checked && status[i].value == "1")
                    $("[name='conn_" + column + "']").eq(i).val($("#all_" + column).val());
            });
        });
    });
    rf_name_array.forEach(column => {
        $("#all_" + column).on("change", function () {
            check.forEach(function (element, i) {
                if (element.checked && status[i].value == "1")
                    $("#conn_" + column + "_" + i).val($("#all_" + column).val());
            });
        });
    });
}

function inputDataToColumns(element) {
    if (element.Status == 1) {
        $("#table_ip_address_info tbody").prepend("<tr><td>" +
            "<input type=\"checkbox\" name=\"checkbox_ipAddr\" value=\"" + element.IP_address + "\" checked/>" +
            " <label>" + (i + 1) + "</label></td>" +
            "<td><input type='hidden' name=\"conn_status\" value=\"1\" />" + GREEN_LIGHT + "</td>" +
            "<td><input type='text' name=\"conn_anchor_id\" value=\"" + element.Anchor_ID + "\" /></td>" +
            "<td name=\"conn_mac_addr\">" + element.MAC_address + "</td>" +
            "<td class=\"row_ip_mode\"><select name=\"conn_ip_mode\">" + makeOptions(IP_MODE, "DHCP") + "</select></td>" +
            "<td class=\"row_ip_addr\"><input type='text' name=\"conn_ip_addr\" value=\"" + element.IP_address + "\" /></td>" +
            "<td class=\"row_gateway_addr\"><input type='text' name=\"conn_gateway_addr\" value=\"" + element.Gateway_address + "\" /></td>" +
            "<td class=\"row_mask_addr\"><input type='text' name=\"conn_mask_addr\" value=\"" + element.Mask_address + "\" /></td>" +
            "<td class=\"row_client_ip_addr\"><input type='text' name=\"conn_client_ip_addr\" value=\"" + element.Client_ip_addr + "\" /></td>" +
            "<td class=\"row_machine_number\"><input type='text' name=\"conn_machine_number\" value=\"" + element.Machine_Number + "\" /></td>" +
            "<td class=\"row_model\">" + element.Model + "</td>" +
            "<td class=\"row_tcp_server_port\">" + element.TCP_Serve_Port + "</td>" +
            "<td class=\"row_udp_server_port\">" + element.UDP_Serve_Port + "</td>" +
            "<td class=\"row_tcp_client_src_port\">" + element.TCP_Client_Src_Port + "</td>" +
            "<td class=\"row_tcp_client_des_port\">" + element.TCP_Client_Des_Port + "</td>" +
            "<td></td></tr>");
        $("#table_ip_address_info tbody tr:eq(0) td:lt(16)").css("background-color", "#c7d8e2");
    } else {
        var isChecked = "";
        if (element.Checked)
            isChecked = "checked";
        $("#table_ip_address_info tbody").append("<tr><td>" +
            "<input type=\"checkbox\" name=\"checkbox_ipAddr\" value=\"" + element.IP_address + "\" " +
            isChecked + "/> <label>" + (i + 1) + "</label></td>" +
            "</td><td><input type='hidden' name=\"conn_status\" value=\"0\" />" + RED_LIGHT +
            "</td><td>" + element.Anchor_ID +
            "</td><td>" + element.MAC_address +
            "</td><td class=\"row_ip_mode\">" + "DHCP" +
            "</td><td class=\"row_ip_addr\">" + element.IP_address +
            "</td><td class=\"row_gateway_addr\">" + element.Gateway_address +
            "</td><td class=\"row_mask_addr\">" + element.Mask_address +
            "</td><td class=\"row_client_ip_addr\">" + element.Client_ip_addr +
            "</td><td class=\"row_machine_number\">" + element.Machine_Number +
            "</td><td class=\"row_model\">" + element.Model +
            "</td><td class=\"row_tcp_server_port\">" + element.TCP_Serve_Port +
            "</td><td class=\"row_udp_server_port\">" + element.UDP_Serve_Port +
            "</td><td class=\"row_tcp_client_src_port\">" + element.TCP_Client_Src_Port +
            "</td><td class=\"row_tcp_client_des_port\">" + element.TCP_Client_Des_Port +
            "</td><td></td></tr>");
    }
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
    $("select[name='conn_ip_mode']").each(function (i) {
        $("input[name='conn_ip_addr']:eq(" + i + ")").prop("disabled", true);
        $("input[name='conn_gateway_addr']:eq(" + i + ")").prop("disabled", true);
        $("input[name='conn_mask_addr']:eq(" + i + ")").prop("disabled", true);
        $(this).on("change", function () {
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
    $("select[name='conn_ip_mode']").each(function (i, mode) {
        $(this).off("change");
    });
}

function sortTable(selector, targetType, compFunc) {
    var table = $('#table_ip_address_info');
    var mySelector = '.sortable';
    var myCompFunc = function ($td1, $td2, isAsc) {
        var v1 = "";
        var v2 = "";
        if (targetType == '') {
            v1 = $.trim($td1.text()).replace(/,|\s+|%/g, '');
            v2 = $.trim($td2.text()).replace(/,|\s+|%/g, '');
        } else {
            if ($td1.children().is(targetType)) {
                v1 = $.trim($td1.children(targetType).val()).replace(/,|\s+|%/g, '');
                v2 = $.trim($td2.children(targetType).val()).replace(/,|\s+|%/g, '');
            } else {
                v1 = $.trim($td1.text()).replace(/,|\s+|%/g, '');
                v2 = $.trim($td2.text()).replace(/,|\s+|%/g, '');
            }
        }
        var pattern = /^\d+(\.\d*)?$/;
        if (pattern.test(v1) && pattern.test(v2)) {
            v1 = parseFloat(v1);
            v2 = parseFloat(v2);
        }
        return isAsc ? v1 > v2 : v1 < v2;
    };
    var doSort = function ($tbody, index, compFunc, isAsc) {
        var $trList = $tbody.find('tr');
        var len = $trList.length;
        for (var i = 0; i < len - 1; i++) {
            for (var j = 0; j < len - i - 1; j++) {
                var $td1 = $trList.eq(j).find('td').eq(index);
                var $td2 = $trList.eq(j + 1).find('td').eq(index);
                if (compFunc($td1, $td2, isAsc)) {
                    var t = $trList.eq(j + 1);
                    $trList.eq(j).insertAfter(t);
                    $trList = $tbody.find('tr');
                }
            }
        }
    }
    var init = function () {
        //var $th = $("th" + selector);
        //var $table = $th.parents("table");
        var $th = table.find('thead tr:eq(0) th').filter(selector);
        $th.on('click', function () {
            var index = $(this).index();
            var asc = $(this).attr('data-asc');
            isAsc = asc === undefined ? true : (asc > 0 ? true : false);
            doSort(table.children('tbody'), index, compFunc, isAsc);
            $(this).children('i').prop('class', isAsc ? 'fas fa-caret-down' : 'fas fa-caret-up');
            $(this).siblings().children('i').prop('class', 'fas fa-sort');
            $(this).attr('data-asc', 1 - (isAsc ? 1 : 0));
            setCheckboxListeners();
        });
        $th.css({
                'cursor': 'pointer'
            })
            .attr('title', 'Sort')
            .append('&nbsp;<i class="fas fa-sort" style="color:#2196F3" aria-hidden="true"></i>');
    };
    selector = selector || mySelector;
    compFunc = compFunc || myCompFunc;
    targetType = targetType || '';
    init();
}