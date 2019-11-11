var account = "",
    permission = "0",
    MinimumPermission = {
        index: "0",
        Member_Setting: "0",
        Timeline: "0",
        Map_Setting: "0",
        Anchor_Setting: "0",
        Alarm_Setting: "0",
        Reference: "2",
        Account_Management: "2"
    };

/**
 * When web page loading.
 * First read the permission table from server
 * Second read the account_permission or get from cookie
 */

function checkTokenAlive(token, response) {
    if (token == "") {
        return false;
    } else if (!response) {
        return false;
    } else if (response.status == 1) {
        return true;
    } else {
        if (response.msg == "Without token access") {
            //login overtime
            alert("帳號閒置過久，此次登入失效，請重新登入");
            //window.location.href = '../Login.html';
            setCookie("login_user", null);
            location.reload();
        } else if (response.msg == "Account is not exist") {
            //other user use the account login successfully
            if (token != "") {
                alert("此帳號已在別處登入，此次登入失效，請重新登入");
                //window.location.href = '../Login.html';
                setCookie("login_user", null);
                location.reload();
            }
        }
        return false;
    }
}

function getUser() {
    var cookie = getCookie("login_user");
    var user_info = typeof (cookie) === 'undefined' ? null : JSON.parse(cookie);
    if (user_info) {
        permission = user_info.userType;
        var html = "<span class=\"i18n\" name=\"i_welcome\">" + $.i18n.prop('i_welcome') +
            "</span><div class=\"dropdown\"><label id=\"user_btn\" class=\"btn-user\">" +
            user_info.cname + " <span class=\"caret\" style=\"color:white;\"></span></label>" +
            "<div class=\"dropdown-content\">";
        if (user_info.userType == "2") {
            html += "<a href=\"../Account_Management.html\" class=\"i18n\"" +
                " name=\"account_managementPage\">" + $.i18n.prop('account_managementPage') +
                "</a>";
        }
        document.getElementById("login_user").innerHTML = html +
            "<a href=\"javascript: resetLogin();\" class=\"i18n\" name=\"i_logout\">" +
            $.i18n.prop('i_logout') + "</a></div></div>";
    } else {
        document.getElementById("login_user").innerHTML = "<a href=\"../Login.html\" " +
            "style=\"margin:0px 20px 0px 5px;\"><span class=\"i18n\" name=\"i_login\">" +
            $.i18n.prop('i_login') + "</span></a>";
    }
    return user_info;
}

function getToken() {
    var user_info = getUser();
    if (user_info) {
        var atob_token = atob(user_info.api_token);
        return atob_token ? atob_token : "";
    } else {
        return "";
    }
}

function resetLogin() {
    var json_request = JSON.stringify({
        "Command_Name": ["logout"],
        "Value": [{
            "api_token": getToken()
        }]
    });
    var jxh = createJsonXmlHttp("user");
    jxh.onreadystatechange = function () {
        if (jxh.readyState == 4 || jxh.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj && revObj.Value[0].success > 0) {
                alert($.i18n.prop('i_logoutSuccess'));
            }
            setCookie("login_user", null);
            location.reload();
        }
    };
    jxh.send(json_request);
}

function getPermission() {
    return [{
            page_name: 'homePage',
            permission: MinimumPermission["index"]
        },
        {
            page_name: 'member_settingPage',
            permission: MinimumPermission["Member_Setting"]
        },
        {
            page_name: 'timelinePage',
            permission: MinimumPermission["Timeline"]
        },
        {
            page_name: 'map_settingPage',
            permission: MinimumPermission["Map_Setting"]
        },
        {
            page_name: 'anchor_settingPage',
            permission: MinimumPermission["Anchor_Setting"]
        },
        {
            page_name: 'alarm_settingPage',
            permission: MinimumPermission["Alarm_Setting"]
        },
        {
            page_name: 'advance_settingPage',
            permission: MinimumPermission["Reference"]
        },
        {
            page_name: 'account_managementPage',
            permission: MinimumPermission["Account_Management"]
        }
    ];
}

function getPermissionOfPage(parent_page) {
    var permission_num = typeof (parseInt(permission, 10)) === 'number' ?
        parseInt(permission, 10) : 0; //沒有設定權限等同訪客帳號
    if (parent_page in MinimumPermission) {
        var minimum = parseInt(MinimumPermission[parent_page], 10);
        return permission_num >= minimum ? true : false;
    } else {
        alert("Error! Please call the administrator for help.");
        return false;
    }
}

function setNavBar(parent_page, child_page) {
    $(function () {
        var navbar = new Navbar();
        navbar.setFirstFloor(parent_page);
        navbar.setSecondFloor(parent_page, child_page);
        navbar.loadNavbar();
    });
}

function Navbar() {
    var lock_stste = getCookie('lock_state') || "unlocked";
    var ParentPageArray = Object.keys(MinimumPermission);
    var navbarHtml = "<aside class=\"menu\"><div class=\"menu-left" + (lock_stste == "locked" ? " locked" : "") + "\">" +
        "<nav class=\"sidebar\"><ul class=\"nav\">";
    this.setFirstFloor = function (parent_page) {
        ParentPageArray.forEach(page_name => {
            var permission_num = typeof (parseInt(permission, 10)) === 'number' ? parseInt(permission, 10) : 0;
            //沒有設定權限等同訪客帳號
            if (permission_num >= parseInt(MinimumPermission[page_name], 10)) {
                const selected_li = "<li class=\"active\"><a href=\"#\">";
                switch (page_name) {
                    case "index":
                        navbarHtml += (page_name == parent_page ? selected_li : "<li><a href=\"../index.html\">") +
                            "<i class=\"fas fa-satellite-dish\"></i>" +
                            "<span>" + $.i18n.prop('homePage') + "</span></a></li>";
                        break;
                    case "Member_Setting":
                        navbarHtml += (page_name == parent_page ? selected_li : "<li><a href=\"../Member_Setting.html\">") +
                            "<i class=\"fas fa-user-cog\"></i>" +
                            "<span>" + $.i18n.prop('member_settingPage') + "</span></a></li>";
                        break;
                    case "Timeline":
                        navbarHtml += (page_name == parent_page ? selected_li : "<li><a href=\"../Timeline.html\">") +
                            "<i class=\"fas fa-route\"></i>" +
                            "<span>" + $.i18n.prop('timelinePage') + "</span></a></li>";
                        break;
                    case "Map_Setting":
                        navbarHtml += (page_name == parent_page ? selected_li : "<li><a href=\"../Map_Setting.html\">") +
                            "<i class=\"fas fa-map\"></i>" +
                            "<span>" + $.i18n.prop('map_settingPage') + "</span></a></li>";
                        break;
                    case "Anchor_Setting":
                        navbarHtml += (page_name == parent_page ? selected_li : "<li><a href=\"../Anchor_Setting.html\">") +
                            "<i class=\"fas fa-anchor\"></i>" +
                            "<span>" + $.i18n.prop('anchor_settingPage') + "</span></a></li>";
                        break;
                    case "Alarm_Setting":
                        navbarHtml += (page_name == parent_page ? selected_li : "<li><a href=\"../Alarm_Setting.html\">") +
                            "<i class=\"fas fa-bell\" style=\"padding-left:2px;\"></i>" +
                            "<span>" + $.i18n.prop('alarm_settingPage') + "</span></a></li>";
                        break;
                    case "Reference":
                        navbarHtml += (page_name == parent_page ? selected_li : "<li><a href=\"../Reference.html\">") +
                            "<i class=\"fas fa-cogs\"></i>" +
                            "<span>" + $.i18n.prop('advance_settingPage') + "</span></a></li>";
                        break;
                    default:
                        break;
                }
            }
        });
    };
    this.setSecondFloor = function (parent_page, child_page) {
        const selected_li = "<li class=\"setting-type active\"><a href=\"#\">";
        if (parent_page == "index") {
            navbarHtml += "<hr><li class=\"alarmlist\"><a href=\"javascript: alarmSidebarMove();\">" +
                "<i class=\"fas fa-exclamation-circle\" id=\"alarmSideBar_icon\"></i>" +
                "<span>" + $.i18n.prop('i_alarmList') + "</span></a></li>" +
                "<li class=\"taglist\"><a href=\"javascript: tagSidebarMove();\">" +
                "<i class=\"fas fa-map-marker-alt\" style=\"padding-left:2px;\"></i>" +
                "<span>" + $.i18n.prop('i_tagList') + "</span></a></li>";
        } else if (parent_page == "Member_Setting") {
            navbarHtml += "<hr>";
            const ChildPageArray = ["Member_Setting", "Dept_Setting", "Job_Title_Setting", "User_Type_Setting", "Preview_Color_Setting"];
            ChildPageArray.forEach(page_name => {
                switch (page_name) {
                    case "Member_Setting":
                        navbarHtml += (page_name == child_page ?
                                selected_li : "<li class=\"setting-type\"><a href=\"../Member_Setting.html\">") +
                            "<i class=\"fas fa-users\"></i><span>" + $.i18n.prop('i_memberSetting') + "</span></a></li>";
                        break;
                    case "Dept_Setting":
                        navbarHtml += (page_name == child_page ?
                                selected_li : "<li class=\"setting-type\"><a href=\"../Dept_Setting.html\">") +
                            "<i class=\"fas fa-sitemap\"></i><span>" + $.i18n.prop('i_deptSetting') + "</span></a></li>";
                        break;
                    case "Job_Title_Setting":
                        navbarHtml += (page_name == child_page ?
                                selected_li : "<li class=\"setting-type\"><a href=\"../Job_Title_Setting.html\">") +
                            "<i class=\"fas fa-id-card\"></i><span>" + $.i18n.prop('i_titleSetting') + "</span></a></li>";
                        break;
                    case "User_Type_Setting":
                        navbarHtml += (page_name == child_page ?
                                selected_li : "<li class=\"setting-type\"><a href=\"../User_Type_Setting.html\">") +
                            "<i class=\"fas fa-user-tag\"></i><span>" + $.i18n.prop('i_usertypeSetting') + "</span></a></li>";
                        break;
                    case "Preview_Color_Setting":
                        navbarHtml += (page_name == child_page ?
                                selected_li : "<li class=\"setting-type\"><a href=\"../Preview_Color_Setting.html\">") +
                            "<i class=\"fas fa-map-marker-alt\" style=\"padding-left:2px;\"></i>" +
                            "<span>" + $.i18n.prop('i_previewColorSetting') + "</span></a></li>";
                        break;
                    default:
                        break;
                }
            });
        } else if (parent_page == "Reference") {
            navbarHtml += "<hr>";
            const ChildPageArray = ["Reference", "Advance_cmd", "Update"];
            ChildPageArray.forEach(page_name => {
                switch (page_name) {
                    case "Reference":
                        navbarHtml += (page_name == child_page ?
                                selected_li : "<li class=\"setting-type\"><a href=\"../Reference.html\">") +
                            "<i class=\"fas fa-satellite-dish\"></i><span>" + $.i18n.prop('i_reference') + "</span></a></li>";
                        break;
                    case "Advance_cmd":
                        navbarHtml += (page_name == child_page ?
                                selected_li : "<li class=\"setting-type\"><a href=\"../Advance_cmd.html\">") +
                            "<i class=\"fas fa-code\"></i><span>" + $.i18n.prop('i_advance_cmd') + "</span></a></li>";
                        break;
                    case "Update":
                        navbarHtml += (page_name == child_page ?
                                selected_li : "<li class=\"setting-type\"><a href=\"../Update.html\">") +
                            "<i class=\"fas fa-download\"></i><span>" + $.i18n.prop('i_update') + "</span></a></li>";
                        break;
                    default:
                        break;
                }
            });
            navbarHtml += "<li class=\"start\"><a href=\"javascript: StartClick();\" id=\"btn_start\">" +
                "<i class=\"fas fa-play\" style=\"padding-left:2px;\"></i>" +
                "<span>" + $.i18n.prop('i_start') + "</span></a></li>";
        }
    };
    this.loadNavbar = function () {
        navbarHtml += "<hr><li class=\"lock\"><a href=\"javascript: lockLeftMemu();\">";
        if (lock_stste == "unlocked")
            navbarHtml += "<i class=\"fas fa-lock-open\"></i><span>" + $.i18n.prop('i_lock') + "</span>";
        else
            navbarHtml += "<i class=\"fas fa-lock\"></i><span>" + $.i18n.prop('i_unlock') + "</span>";
        navbarHtml += "</a></li></ul></nav></div></aside>";
        document.getElementById("icon_navbar").innerHTML = navbarHtml;
    };
}

function lockLeftMemu() {
    let menu_left = document.getElementsByClassName("menu-left")[0];
    let lock = document.querySelector("li.lock");
    if (menu_left.classList.contains("locked")) {
        menu_left.classList.remove("locked");
        lock.firstChild.innerHTML = "<i class=\"fas fa-lock-open\"></i><span>" + $.i18n.prop('i_lock') + "</span></a>";
        setCookie('lock_state', "unlocked");
    } else {
        menu_left.classList.add("locked");
        lock.firstChild.innerHTML = "<i class=\"fas fa-lock\"></i><span>" + $.i18n.prop('i_unlock') + "</span></a>"
        setCookie('lock_state', "locked");
    }
}