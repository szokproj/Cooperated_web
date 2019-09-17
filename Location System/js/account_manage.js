var token = "";
var CommandName_account = "";
var userArray = [];

$(function () {
    token = getUser() ? getUser().api_token : "";
    if (!getPermissionOfPage("Account_Management")) {
        alert("Permission denied!");
        history.back();
    }
    setNavBar("Account_Management", "");
    inputUsersTable();
    inputPermissionTable();
    $("#btn_account_add").on('click', newAccountInfo);
    $("#btn_account_delete").on('click', deleteAccountInfo);

    //Dialog to edit the permission.
    /*
    $("input[name='chkbox_permission']").on('change', changeCheck)

    $("#table_permission tr").on('click', showDialog_permission);

    resetPermissionTable();
    
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
        height: 600,
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
    });*/

    //Dialog to edit the account.
    var dialog2, form2,
        account = $("#edit_account"),
        allFields = $([]).add(account);
    var SendResult2 = function () {
        allFields.removeClass("ui-state-error");
        var valid = true && checkLength(account, $.i18n.prop('i_alertError_10'), 1, 20);
        if (valid) {
            var is_active = "1";
            document.getElementsByName("edit_is_active").forEach(element => {
                if (element.checked)
                    is_active = element.value;
            });
            var request2 = {
                "Command_Type": ["Write"],
                "Command_Name": [CommandName_account],
                "Value": [{
                    "code": $("#edit_account").val(),
                    "cname": $("#edit_name").val(),
                    "password": $("#edit_password").val(),
                    "isActive": is_active,
                    "userType": $("#edit_permission").val(),
                    "id": $("#edit_id").val()
                }],
                "api_token": [token]
            };
            var xmlHttp2 = createJsonXmlHttp("sql");
            xmlHttp2.onreadystatechange = function () {
                if (xmlHttp2.readyState == 4 || xmlHttp2.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        dialog2.dialog("close");
                        inputUsersTable();
                    }
                }
            };
            xmlHttp2.send(JSON.stringify(request2));
            //$("#tr_newpassword").hide();
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

function inputPermissionTable() {
    var page_permission = getPermission()
    $("#table_permission tbody").empty();
    page_permission.forEach(element => {
        var level = element.permission;
        if (level == "2")
            level = 'i_high';
        else if (level == "1")
            level = 'i_mid';
        else
            level = 'i_low';
        $("#table_permission tbody").append("<tr>" +
            "<td class=\"i18n\" name=\"" + element.page_name + "\"></td>" +
            "<td class=\"i18n\" name=\"" + level + "\"></td>" +
            "<tr>");
    });
}

function inputUsersTable() {
    var request = {
        "Command_Name": ["getuser"],
        "api_token": [token]
    };
    var xmlHttp = createJsonXmlHttp("user");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.accountNum > 0) {
                var revInfo = "Values" in revObj ? revObj.Values : [];
                $("#table_account tbody").empty();
                userArray = [];
                for (i = 0; i < revInfo.length; i++) {
                    userArray.push(revInfo[i]);
                    var level = revInfo[i].userType;
                    if (level == "2")
                        level = $.i18n.prop('i_high');
                    else if (level == "1")
                        level = $.i18n.prop('i_mid');
                    else
                        level = $.i18n.prop('i_low');
                    $("#table_account tbody").append("<tr>" +
                        "<td><input type=\"checkbox\" name=\"chk_id\"" +
                        " value=\"" + revInfo[i].id + "\" /> " + (i + 1) + "</td>" +
                        "<td>" + revInfo[i].code + "</td>" +
                        "<td>" + level + "</td>" +
                        "<td>" + (revInfo[i].isActive == "1" ? $.i18n.prop('i_enable') : $.i18n.prop('i_disable')) +
                        "</td></tr>");
                }
                $("#table_account tbody tr").off('dblclick').on('dblclick', editAccountInfo);
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}

/*function showDialog_permission() {
    var permission = this.cells[0].childNodes[0].textContent;
    document.getElementById("permission_name").value = permission;
    $("#dialog_permission_setting").dialog("open");
}*/

function editAccountInfo() {
    CommandName_account = "EditAccount_Info";
    var id = this.cells[0].childNodes[0].value;
    var index = userArray.findIndex(function (user) {
        return user.id == id;
    });
    $("#edit_id").val(userArray[index].id);
    $("#edit_account").val(userArray[index].code);
    $("#edit_name").val(userArray[index].cname);
    $("#edit_password").val(userArray[index].password);
    if (userArray[index].isActive == "1")
        $("input[name='edit_is_active']:eq(1)").prop('checked', true);
    else
        $("input[name='edit_is_active']:eq(0)").prop('checked', true);
    $("#edit_permission").val(userArray[index].userType);
    $("#dialog_account_setting").dialog("open");
}

function newAccountInfo() {
    CommandName_account = "AddAccount";
    $("#edit_account").val("");
    $("#edit_name").val("");
    $("#edit_password").val("");
    $("input[name='edit_is_active']:eq(0)").prop('checked', true);
    $("#edit_permission option:eq(1)").prop('selected', true);
    $("#edit_id").val("");
    $("#dialog_account_setting").dialog("open");
}

function deleteAccountInfo() {
    var delete_arr = [];
    document.getElementsByName("chk_id").forEach(element => {
        if (element.checked) {
            delete_arr.push({
                "id": element.value
            });
        }
    });
    if (delete_arr.length > 0) {
        if (confirm($.i18n.prop('i_permissionAlert_1'))) {
            var request = {
                "Command_Type": ["Write"],
                "Command_Name": ["DeleteAccount_by_id"],
                "Value": delete_arr,
                "api_token": [token]
            };
            var xmlHttp = createJsonXmlHttp("sql");
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var revObj = JSON.parse(this.responseText);
                    if (revObj.success > 0) {
                        inputUsersTable();
                    }
                }
            };
            xmlHttp.send(JSON.stringify(request));
        }
    } else {
        alert($.i18n.prop('i_permissionAlert_2'));
    }
}


/*function changeCheck() {
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
}*/