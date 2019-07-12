$(function () { //Load==>
    /**
     * Check this page's permission and load navbar
     */
    var permission = getPermissionOfPage("Anchor_Setting");
    switch (permission) {
        case "":
            alert("No permission");
            history.back();
            break;
        case "R":
            break;
        case "RW":
            break;
        default:
            alert("網頁錯誤，將跳回上一頁");
            history.back();
            break;
    }
    setNavBar("Anchor_Setting", "");


    var dialog, form;

    dialog = $("#dialog_set_table_display").dialog({
        autoOpen: false,
        height: 600,
        width: 400,
        modal: true,
        buttons: {
            Confirm: function () {
                displaySelectedRows();
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

    $("#btn_submit").click(function () {
        var r = confirm('Are you sure to submit the settings of devices?');
        if (r == true) {
            Device_setting_write();
            RF_setting_write();
        } else {
            return;
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

    Load();
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
        if (rows[i].checked)
            $("." + rows[i].value).show();
        else
            $("." + rows[i].value).hide();
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
            $(".table_network_setting label").eq(i + 1).removeClass("disable_color");
            $(".table_network_setting label").eq(i + 5).removeClass("disable_color");
            $(".table_network_setting label").eq(i + 9).removeClass("disable_color");
            $(".table_network_setting label").eq(i + 13).removeClass("disable_color");
            $("#ip_address_" + i).prop('disabled', false).removeClass("disable_color");
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