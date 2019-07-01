var permissionArray = [];
var account = "";
var permission = "";
var VisitorPermission = { //訪客帳號權限
    Permission: "",
    index: "R",
    Member_Setting: "",
    Timeline: "R",
    Map_Setting: "",
    Anchor_Setting: "",
    Alarm_Setting: "",
    Reference: ""
};


$(function () {
    //When web page loading.
    //First read the permission table from server
    permissionArray = [{
        Permission: "admin",
        index: "RW",
        Member_Setting: "RW",
        Timeline: "RW",
        Map_Setting: "RW",
        Anchor_Setting: "RW",
        Alarm_Setting: "RW",
        Reference: "RW"
    }, {
        Permission: "2",
        index: "R",
        Member_Setting: "R",
        Timeline: "R",
        Map_Setting: "R",
        Anchor_Setting: "R",
        Alarm_Setting: "R",
        Reference: "R"
    }, {
        Permission: "3",
        index: "R",
        Member_Setting: "",
        Timeline: "R",
        Map_Setting: "",
        Anchor_Setting: "",
        Alarm_Setting: "",
        Reference: ""
    }];
    //Second read the account_permission or  
    account = "a123"; //get from cookie
    permission = "admin"; //get the permission of this account (by sending this account to server)



});

function getPermissionOfPage(parent_page) {
    var permission_obj = {};
    var index = permissionArray.findIndex(function (info) {
        return info.Permission == permission;
    });
    if (index > -1)
        permission_obj = permissionArray[index];
    else //沒有設定權限等同訪客帳號
        permission_obj = VisitorPermission;
    return permission_obj[parent_page];
}

function setNavBar(parent_page, child_page) {
    var permission_obj = {};
    var index = permissionArray.findIndex(function (info) {
        return info.Permission == permission;
    });
    if (index > -1)
        permission_obj = permissionArray[index];
    else //沒有設定權限等同訪客帳號
        permission_obj = VisitorPermission;

    var navbar = new Navbar(permission_obj);
    if (parent_page != "") {
        navbar.setFirstFloor(parent_page);
        navbar.setSecondFloor(parent_page, child_page);
        navbar.loadNavbar();
    } else {
        alert("Loading navbar failed!");
    }
}

function Navbar(permission_obj) {
    var ParentPageArray = [
        "index",
        "Member_Setting",
        "Timeline",
        "Map_Setting",
        "Anchor_Setting",
        "Alarm_Setting",
        "Reference"
    ];
    var parent_order = -1;
    var child_order = -1;
    var navbarHtml = "<aside class=\"menu\"><div class=\"menu-left\"><nav class=\"sidebar\"><ul class=\"nav\">";
    this.setFirstFloor = function (parent_page) {
        ParentPageArray.forEach(function (PageName, i) {
            if (permission_obj[PageName] == "R" || permission_obj[PageName] == "RW") {
                if (PageName == parent_page)
                    parent_order = i;
                switch (PageName) {
                    case "index":
                        navbarHtml += "<li><a href=\"../index.html\"><i class=\"fas fa-satellite-dish\"></i>" +
                            "<span class=\"i18n\" name=\"homePage\"></span></a></li>";
                        break;
                    case "Member_Setting":
                        navbarHtml += "<li><a href=\"../Member_Setting.html\"><i class=\"fas fa-user-cog\"></i>" +
                            "<span class=\"i18n\" name=\"member_settingPage\"></span></a></li>";
                        break;
                    case "Timeline":
                        navbarHtml += "<li><a href=\"../Timeline.html\"><i class=\"fas fa-route\"></i>" +
                            "<span class=\"i18n\" name=\"timelinePage\"></span></a></li>";
                        break;
                    case "Map_Setting":
                        navbarHtml += "<li><a href=\"../Map_Setting.html\"><i class=\"fas fa-map\"></i>" +
                            "<span class=\"i18n\" name=\"map_settingPage\"></span></a></li>";
                        break;
                    case "Anchor_Setting":
                        navbarHtml += "<li><a href=\"../Anchor_Setting.html\"><i class=\"fas fa-anchor\"></i>" +
                            "<span class=\"i18n\" name=\"anchor_settingPage\"></span></a></li>";
                        break;
                    case "Alarm_Setting":
                        navbarHtml += "<li><a href=\"../Alarm_Setting.html\"><i class=\"fas fa-bell\" style=\"padding-left:2px;\"></i>" +
                            "<span class=\"i18n\" name=\"alarm_settingPage\"></span></a></li>";
                        break;
                    case "Reference":
                        navbarHtml += "<li><a href=\"../Reference.html\"><i class=\"fas fa-cogs\"></i>" +
                            "<span class=\"i18n\" name=\"advance_settingPage\"></span></a></li>" +
                            "<hr>";
                        break;
                    default:
                        break;
                }
            }
        });
    };
    this.setSecondFloor = function (parent_page, child_page) {
        if (parent_page == "index") {
            navbarHtml += "<li class=\"alarmlist\"><a href=\"javascript: alarmSidebarMove();\">" +
                "<i class=\"fas fa-exclamation-circle\" id=\"alarmSideBar_icon\"></i>" +
                "<span class=\"i18n\" name=\"i_alarmList\"></span></a></li>" +
                "<li class=\"taglist\"><a href=\"javascript: tagSidebarMove();\">" +
                "<i class=\"fas fa-map-marker-alt\" style=\"padding-left:2px;\"></i>" +
                "<span class=\"i18n\" name=\"i_tagList\"></span></a></li>";
        } else if (parent_page == "Member_Setting") {
            navbarHtml += "<li class=\"setting-type\"><a href=\"../Member_Setting.html\"><i class=\"fas fa-users\"></i>" +
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
                    child_order = ParentPageArray.length;
                    break;
                case "Display_Setting":
                    child_order = ParentPageArray.length + 1;
                    break;
                case "Dept_Setting":
                    child_order = ParentPageArray.length + 2;
                    break;
                case "Job_Title_Setting":
                    child_order = ParentPageArray.length + 3;
                    break;
                case "User_Type_Setting":
                    child_order = ParentPageArray.length + 4;
                    break;
                default:
                    break;
            }
        } else if (parent_page == "Reference") {
            navbarHtml += "<li class=\"setting-type\"><a href=\"../Reference.html\">" +
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
                    child_order = ParentPageArray.length;
                    break;
                case "Advance_cmd":
                    child_order = ParentPageArray.length + 1;
                    break;
                case "Update":
                    child_order = ParentPageArray.length + 2;
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