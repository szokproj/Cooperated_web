$(function () {
    var h = document.documentElement.clientHeight;
    $(".container").css("height", h - 10 + "px");

    if (getCookie('user') && getCookie('pswd')) {
        $("#account").val(getCookie('user'));
        $("#password").val(atob(getCookie('pswd')));
        $("#remember").prop('checked', true);
    }

    $('form input').on('keypress', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            verifyLogin();
        }
    });

    $("#remember").on('change', function () {
        if (!$(this).prop('checked')) {
            delCookie('user');
            delCookie('pswd');
        }
    });
});

//delete cookie
function delCookie(name) {
    setCookie(name, null, -1);
}

function verifyLogin() {
    var account = $("#account"),
        password = $("#password"),
        valid = true;
    account.removeClass("ui-state-error");
    password.removeClass("ui-state-error");
    valid = valid && checkLength(account, $.i18n.prop('i_loginError_1'), 1, 50);
    valid = valid && checkLength(password, $.i18n.prop('i_loginError_2'), 1, 50);
    if (valid) {
        if ($("#remember").prop('checked')) {
            setCookie('user', account.val(), 7); //保存帐号到cookie，有效期7天
            setCookie('pswd', btoa(password.val()), 7); //保存密码(加密)到cookie，有效期7天
        }
        var json_request = JSON.stringify({
            "Command_Name": ["login"],
            "Value": [{
                "code": account.val(),
                "password": password.val()
            }]
        });
        var jxh = createJsonXmlHttp("user");
        jxh.onreadystatechange = function () {
            if (jxh.readyState == 4 || jxh.readyState == "complete") {
                //console.log("res: " + this.responseText);
                var revObj = JSON.parse(this.responseText);
                if (revObj && revObj.Value[0].success > 0) {
                    //Verification success
                    var revInfo = revObj.Value[0].Values;
                    if (revInfo && revInfo[0].api_token) {
                        Cookies.set("login_user", JSON.stringify(revInfo[0]));
                        alert($.i18n.prop('i_loginSuccess'));
                        history.back();
                    }
                } else {
                    var msg = revObj.Value[0].Values[0].msg;
                    if (msg == "Account not find")
                        alert($.i18n.prop('i_accountNotFound'));
                    else if (msg == "password error")
                        alert($.i18n.prop('i_passwordError'));
                    else
                        alert($.i18n.prop('i_loginFailed'));
                }
            }
        };
        jxh.send(json_request);
    }
}