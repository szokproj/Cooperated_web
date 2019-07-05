$(function () { //Load==>
    $("#is_multiple_settings").click(checkbox_single_multiple);
    checkbox_single_multiple();
});

function singleCheck() {
    $("input[name=checkbox_ipAddr]").not(this).prop("checked", false);
}

function checkbox_single_multiple() {
    if ($("#is_multiple_settings").is(":checked")) { //多選
        $("input[name=checkbox_ipAddr]").unbind('click', singleCheck);
        $("#btn_deselectAll").prop('disabled', false).removeClass("disable_color");
        $("#btn_selectAll").prop('disabled', false).removeClass("disable_color");
        $("#btn_device_read").prop('disabled', true).addClass("disable_color");
        $("#btn_rf_read").prop('disabled', true).addClass("disable_color");
    } else { //單選
        $("input[name=checkbox_ipAddr]").click(singleCheck);
        $("#btn_deselectAll").prop('disabled', true).addClass("disable_color");
        $("#btn_selectAll").prop('disabled', true).addClass("disable_color");
        $("#btn_device_read").prop('disabled', false).removeClass("disable_color");
        $("#btn_rf_read").prop('disabled', false).removeClass("disable_color");
    }
}

function disable_DHCP() {
    if (document.getElementsByName("network_setting_mode")[0].checked) { //DHCP
        for (i = 1; i < 5; i++) {
            $(".table_network_setting label").eq(i + 1).addClass("disable_color"); //IP Address
            $(".table_network_setting label").eq(i + 5).addClass("disable_color"); //Mask Address
            $(".table_network_setting label").eq(i + 9).addClass("disable_color"); //Gateway Address
            $(".table_network_setting label").eq(i + 13).removeClass("disable_color"); //Client IP
            $("#ip_address_" + i).prop('disabled', true).addClass("disable_color");
            $("#mask_address_" + i).prop('disabled', true).addClass("disable_color");
            $("#gateway_address_" + i).prop('disabled', true).addClass("disable_color");
            $("#client_ip_" + i).prop('disabled', false).removeClass("disable_color");
        }
    } else { //Fixed IP
        for (i = 1; i < 5; i++) {
            if ($("#is_multiple_settings").is(":checked")) { //多選的Fixed IP設定
                $(".table_network_setting label").eq(i + 1).addClass("disable_color");
                $("#ip_address_" + i).prop('disabled', true).addClass("disable_color");
            } else { //單選的Fixed IP設定
                $(".table_network_setting label").eq(i + 1).removeClass("disable_color");
                $("#ip_address_" + i).prop('disabled', false).removeClass("disable_color");
            }
            $(".table_network_setting label").eq(i + 5).removeClass("disable_color");
            $(".table_network_setting label").eq(i + 9).removeClass("disable_color");
            $(".table_network_setting label").eq(i + 13).removeClass("disable_color");
            $("#mask_address_" + i).prop('disabled', false).removeClass("disable_color");
            $("#gateway_address_" + i).prop('disabled', false).removeClass("disable_color");
            $("#client_ip_" + i).prop('disabled', false).removeClass("disable_color");
        }
    }
}

function disable_network() {
    if (!$("#is_network_setting").prop("checked")) {
        $(".table_network_setting label").eq(0).addClass("disable_color"); //Label: DHCP
        $(".table_network_setting label").eq(1).addClass("disable_color"); //Label: Fixed IP
        for (i = 1; i < 5; i++) {
            $(".table_network_setting label").eq(i + 1).addClass("disable_color"); //Label: IP Address
            $(".table_network_setting label").eq(i + 5).addClass("disable_color"); //Label: Mask Address
            $(".table_network_setting label").eq(i + 9).addClass("disable_color"); //Label: Gateway Address
            $(".table_network_setting label").eq(i + 13).addClass("disable_color"); //Label: Client IP
            $("#ip_address_" + i).prop('disabled', true).addClass("disable_color"); //input: IP Address
            $("#mask_address_" + i).prop('disabled', true).addClass("disable_color"); //input: Mask Address
            $("#gateway_address_" + i).prop('disabled', true).addClass("disable_color"); //input: Gateway Address
            $("#client_ip_" + i).prop('disabled', true).addClass("disable_color"); //input: Client IP
        }
    } else {
        $(".table_network_setting label").eq(0).removeClass("disable_color"); //Label: DHCP
        $(".table_network_setting label").eq(1).removeClass("disable_color"); //Label: Fixed IP
        disable_DHCP();
    }
}

function disable_basic() {
    if (!$("#is_basic_setting").prop("checked")) {
        $(".table_basic_setting label").eq(0).addClass("disable_color"); //Sent Cycle
        $(".table_basic_setting label").eq(1).addClass("disable_color"); //Device ID
        $("#sent_cycle").prop('disabled', true).addClass("disable_color");
        $("#device_id").prop('disabled', true).addClass("disable_color");
    } else {
        $(".table_basic_setting label").eq(0).addClass("disable_color"); //Sent Cycle
        $(".table_basic_setting label").eq(1).removeClass("disable_color"); //Device ID
        $("#sent_cycle").prop('disabled', true).addClass("disable_color");
        $("#device_id").prop('disabled', false).removeClass("disable_color");
    }
}
