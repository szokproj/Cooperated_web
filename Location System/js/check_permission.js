var account = "";
var permission = "0";
var MinimumPermission = {
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

function getUser() {
    var cookie = getCookie("login_user");
    var user_info = typeof (cookie) === 'undefined' ? null : JSON.parse(cookie);
    if (user_info) {
        permission = user_info.userType;
        var html = "<span class=\"i18n\" name=\"i_welcome\">" + $.i18n.prop('i_welcome') +
            "</span> , <div class=\"dropdown dropdown-input\"><button type=\"button\"" +
            " class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\">" +
            "<span>" + user_info.cname + "</span> &nbsp;<span class=\"caret\"></span>" +
            "</button><ul class=\"dropdown-menu\" role=\"menu\" id=\"user_btn\">";
        if (user_info.userType == "2") {
            html += "<li><a href=\"../Account_Management.html\" class=\"i18n\"" +
                " name=\"account_managementPage\">" + $.i18n.prop('account_managementPage') +
                "</a></li>";
        }
        document.getElementById("login_user").innerHTML = html +
            "<li><a href=\"javascript: resetLogin();\" class=\"i18n\" name=\"i_logout\">" +
            $.i18n.prop('i_logout') + "</a></li></ul></div>";
    } else {
        document.getElementById("login_user").innerHTML = "<a href=\"../Login.html\" " +
            "style=\"margin:0px 20px 0px 5px;\"><span class=\"i18n\" name=\"i_login\">" +
            $.i18n.prop('i_login') + "</span></a>";
    }
    return user_info;
}

function resetLogin() {
    var xmlHttp = createJsonXmlHttp('user');
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj && revObj.success > 0) {
                alert($.i18n.prop('i_logoutSuccess'));
            } else {
                alert($.i18n.prop('i_loginTimeout'));
                //alert($.i18n.prop('i_logoutFailed'));
            }
            setCookie("login_user", null);
            location.reload();
        }
    };
    xmlHttp.send(JSON.stringify({
        "Command_Name": ["logout"],
        "Value": [{
            "api_token": getUser() ? getUser().api_token : ""
        }]
    }));
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
        alert("Error! Please call administrator help.");
        return false;
    }
}

function setNavBar(parent_page, child_page) {
    var navbar = new Navbar();
    if (parent_page != "") {
        navbar.setFirstFloor(parent_page);
        navbar.setSecondFloor(parent_page, child_page);
        navbar.loadNavbar();
    } else {
        alert("Loading navbar failed!");
    }
}

function Navbar() {
    var ParentPageArray = Object.keys(MinimumPermission);
    var count_parents = 0;
    var parent_order = -1;
    var child_order = -1;
    var navbarHtml = "<aside class=\"menu\"><div class=\"menu-left\"><nav class=\"sidebar\"><ul class=\"nav\">";
    this.setFirstFloor = function (parent_page) {
        ParentPageArray.forEach(function (PageName, i) {
            var permission_num = typeof (parseInt(permission, 10)) === 'number' ? parseInt(permission, 10) : 0;
            //沒有設定權限等同訪客帳號
            if (permission_num >= parseInt(MinimumPermission[PageName], 10)) {
                if (PageName == parent_page)
                    parent_order = i;
                switch (PageName) {
                    case "index":
                        count_parents++;
                        navbarHtml += "<li><a href=\"../index.html\"><i class=\"fas fa-satellite-dish\"></i>" +
                            "<span class=\"i18n\" name=\"homePage\"></span></a></li>";
                        break;
                    case "Member_Setting":
                        count_parents++;
                        navbarHtml += "<li><a href=\"../Member_Setting.html\"><i class=\"fas fa-user-cog\"></i>" +
                            "<span class=\"i18n\" name=\"member_settingPage\"></span></a></li>";
                        break;
                    case "Timeline":
                        count_parents++;
                        navbarHtml += "<li><a href=\"../Timeline.html\"><i class=\"fas fa-route\"></i>" +
                            "<span class=\"i18n\" name=\"timelinePage\"></span></a></li>";
                        break;
                    case "Map_Setting":
                        count_parents++;
                        navbarHtml += "<li><a href=\"../Map_Setting.html\"><i class=\"fas fa-map\"></i>" +
                            "<span class=\"i18n\" name=\"map_settingPage\"></span></a></li>";
                        break;
                    case "Anchor_Setting":
                        count_parents++;
                        navbarHtml += "<li><a href=\"../Anchor_Setting.html\"><i class=\"fas fa-anchor\"></i>" +
                            "<span class=\"i18n\" name=\"anchor_settingPage\"></span></a></li>";
                        break;
                    case "Alarm_Setting":
                        count_parents++;
                        navbarHtml += "<li><a href=\"../Alarm_Setting.html\"><i class=\"fas fa-bell\" style=\"padding-left:2px;\"></i>" +
                            "<span class=\"i18n\" name=\"alarm_settingPage\"></span></a></li>";
                        break;
                    case "Reference":
                        count_parents++;
                        navbarHtml += "<li><a href=\"../Reference.html\"><i class=\"fas fa-cogs\"></i>" +
                            "<span class=\"i18n\" name=\"advance_settingPage\"></span></a></li>";
                        break;
                    default:
                        break;
                }
            }
        });
    };
    this.setSecondFloor = function (parent_page, child_page) {
        if (parent_page == "index") {
            navbarHtml += "<hr><li class=\"alarmlist\"><a href=\"javascript: alarmSidebarMove();\">" +
                "<i class=\"fas fa-exclamation-circle\" id=\"alarmSideBar_icon\"></i>" +
                "<span class=\"i18n\" name=\"i_alarmList\"></span></a></li>" +
                "<li class=\"taglist\"><a href=\"javascript: tagSidebarMove();\">" +
                "<i class=\"fas fa-map-marker-alt\" style=\"padding-left:2px;\"></i>" +
                "<span class=\"i18n\" name=\"i_tagList\"></span></a></li>";
        } else if (parent_page == "Member_Setting") {
            navbarHtml += "<hr><li class=\"setting-type\"><a href=\"../Member_Setting.html\"><i class=\"fas fa-users\"></i>" +
                "<span class=\"i18n\" name=\"i_memberSetting\"></span></a></li>" +
                "<li class=\"setting-type\"><a href=\"../Display_Setting.html\">" +
                "<i class=\"fas fa-map-marker-alt\" style=\"padding-left:4px;\"></i>" +
                "<span class=\"i18n\" name=\"i_displaySetting\"></span></a></li>" +
                "<li class=\"setting-type\"><a href=\"../Dept_Setting.html\"><i class=\"fas fa-sitemap\"></i>" +
                "<span class=\"i18n\" name=\"i_deptSetting\"></span></a></li>" +
                "<li class=\"setting-type\"><a href=\"../Job_Title_Setting.html\"><i class=\"fas fa-id-card\"></i>" +
                "<span class=\"i18n\" name=\"i_titleSetting\"></span></a></li>" +
                "<li class=\"setting-type\"><a href=\"../User_Type_Setting.html\"><i class=\"fas fa-user-tag\"></i>" +
                "<span class=\"i18n\" name=\"i_usertypeSetting\"></span></a></li>";
            switch (child_page) {
                case "Member_Setting":
                    child_order = count_parents;
                    break;
                case "Display_Setting":
                    child_order = count_parents + 1;
                    break;
                case "Dept_Setting":
                    child_order = count_parents + 2;
                    break;
                case "Job_Title_Setting":
                    child_order = count_parents + 3;
                    break;
                case "User_Type_Setting":
                    child_order = count_parents + 4;
                    break;
                default:
                    break;
            }
        } else if (parent_page == "Reference") {
            navbarHtml += "<hr><li class=\"setting-type\"><a href=\"../Reference.html\">" +
                "<i class=\"fas fa-satellite-dish\"></i><span class=\"i18n\" name=\"i_reference\"></span></a></li>" +
                "<li class=\"setting-type\"><a href=\"../Advance_cmd.html\">" +
                "<i class=\"fas fa-code\"></i><span class=\"i18n\" name=\"i_advance_cmd\"></span></a></li>" +
                "<li class=\"setting-type\"><a href=\"../Update.html\">" +
                "<i class=\"fas fa-download\"></i><span class=\"i18n\" name=\"i_update\"></span></a></li>" +
                "<li class=\"start\"><a href=\"javascript: StartClick();\" id=\"btn_start\">" +
                "<i class=\"fas fa-play\" style=\"padding-left:2px;\"></i>" +
                "<span class=\"i18n\" name=\"i_start\"></span></a></li>";
            switch (child_page) {
                case "Reference":
                    child_order = count_parents;
                    break;
                case "Advance_cmd":
                    child_order = count_parents + 1;
                    break;
                case "Update":
                    child_order = count_parents + 2;
                    break;
                default:
                    break;
            }
        }
    };
    this.loadNavbar = function () {
        navbarHtml += "</ul></nav></div></aside>";
        $("#NavbarHtml").html(navbarHtml);
        if (parent_order > -1)
            $("#NavbarHtml ul.nav li").eq(parent_order).addClass("active").children("a").prop("href", "#");
        if (child_order > -1)
            $("#NavbarHtml ul.nav li").eq(child_order).addClass("active").children("a").prop("href", "#");
    };
}