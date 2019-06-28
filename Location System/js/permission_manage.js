window.onload = init;

function init() {
    resetPermissionTable();
    var checkBoxs = document.getElementsByName("chkbox_permission");
    for (var i = 0; i < checkBoxs.length; i++)
        checkBoxs[i].onchange = changeCheck;

    var permiss_trs = $("#table_permission tr");
    for (var j = 0; j < permiss_trs.length; j++)
        permiss_trs.eq(j).click(showDialog_permission);

    var account_trs = $("#table_account tr");
    for (var k = 0; k < account_trs.length; k++)
        account_trs.eq(k).click(showDialog_account);

    $("#tr_newpassword").hide();
    $("#edit_setnewpass").click(function () {
        if (this.checked)
            $("#tr_newpassword").show();
        else {
            $("#tr_newpassword").hide();
        }
    });






}

function showDialog_permission() {
    var permission = this.cells[0].childNodes[0].textContent;
    document.getElementById("permission_name").value = permission;
    $("#dialog_permission_setting").dialog("open");
}

function showDialog_account() {
    var account = this.cells[0].childNodes[0].textContent;
    document.getElementById("edit_account").value = account;
    $("#dialog_account_setting").dialog("open");
}


function changeCheck() {
    var radio = document.getElementsByName(this.value);
    if (this.checked) {
        radio.forEach(element => {
            element.disabled = false;
        });
        radio[0].checked = true;
    } else {
        radio.forEach(element => {
            element.disabled = true;
            element.checked = false;
        });
    }
}

function resetPermissionTable() {
    var checkBoxs = document.getElementsByName("chkbox_permission");
    for (var i = 0; i < checkBoxs.length; i++) {
        var radio = document.getElementsByName(checkBoxs[i].value);
        checkBoxs[i].checked = false;
        radio.forEach(element => {
            element.disabled = true;
            element.checked = false;
        });
    }
}

$(function () {
    var dialog, form,
        permission_name = $("#permission_name"),
        allFields = $([]).add(permission_name);
    var SendResult = function () {
        allFields.removeClass("ui-state-error");
        var valid = true && checkLength(permission_name, $.i18n.prop('i_alertError_10'), 1, 20);
        if (valid) {
            dialog.dialog("close");
        }
        return valid;
    };
    dialog = $("#dialog_permission_setting").dialog({
        autoOpen: false,
        height: 500,
        width: 600,
        modal: true,
        buttons: {
            "Confirm": SendResult,
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });
    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        SendResult();
    });


    /*--------------------------------------------------*/


    var dialog2, form2,
        account = $("#edit_account"),
        allFields = $([]).add(account);
    var SendResult2 = function () {
        allFields.removeClass("ui-state-error");
        var valid = true && checkLength(account, $.i18n.prop('i_alertError_10'), 1, 20);
        if (valid) {
            dialog2.dialog("close");
            $("#tr_newpassword").hide();
        }
        return valid;
    };
    dialog2 = $("#dialog_account_setting").dialog({
        autoOpen: false,
        height: 300,
        width: 400,
        modal: true,
        buttons: {
            "Confirm": SendResult2,
            Cancel: function () {
                form2[0].reset();
                $("#tr_newpassword").hide();
                allFields.removeClass("ui-state-error");
                dialog2.dialog("close");
            }
        },
        close: function () {
            form2[0].reset();
            $("#tr_newpassword").hide();
            allFields.removeClass("ui-state-error");
        }
    });
    form2 = dialog2.find("form").on("submit", function (event) {
        event.preventDefault();
        SendResult2();
    });
});