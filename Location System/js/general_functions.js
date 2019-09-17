function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

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

function createJsonXmlHttp(url) {
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
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    return xmlHttp;
}

function makeOptions(array, select) {
    var options = "";
    for (i = 0; i < array.length; i++) {
        if (array[i] == select) {
            options += "<option value=\"" + array[i] + "\" selected=\"selected\">" +
                array[i] + "</option>";
        } else {
            options += "<option value=\"" + array[i] + "\">" + array[i] + "</option>";
        }
    }
    return options;
}

function makeNameOptions(name, array, select_id) {
    var options = "";
    for (i = 0; i < array.length; i++) {
        if (array[i].group_id == select_id) {
            options += "<option value=\"" + array[i][name] + "\" selected=\"selected\">" +
                array[i][name] + "</option>";
        } else {
            options += "<option value=\"" + array[i][name] + "\">" + array[i][name] + "</option>";
        }
    }
    return options;
}

function updateTips(t) {
    tips.text(t)
        .addClass("ui-state-highlight");
    setTimeout(function () {
        tips.removeClass("ui-state-highlight", 1500);
    }, 500);
}

function checkLength(o, n, min, max) {
    if (o.val().length) {
        if (min != 0 && o.val().length < min) {
            o.addClass("ui-state-error");
            alert(n);
            return false;
        } else if (max != 0 && o.val().length > max) {
            o.addClass("ui-state-error");
            alert(n);
            return false;
        } else {
            if (checkRegexp2(o, n, min, max)) {
                return true;
            } else {
                o.addClass("ui-state-error");
                return false;
            }
        }
    } else {
        o.addClass("ui-state-error");
        alert(n);
        return false;
    }
}
// 2019/05/03 Regular Expression.
var regexp = /(=)|(<)|(>)|(')|(")|(--)|(\/)|(\+)|(;)|(\*)|(!)|({)|(})|(drop table)|(drop stored)|(alter table)|(alter stored)|(sp_)|(xp_)|(exec )|(execute )|(fetch)|(select)|(kill)|(selectsys)|(sysobjects)|(syscolumns)|(isnull)|(coalesce)|(dbo)|(tbl)|(usp)/;

function checkRegexp2(o, n, min, max) { // Check sql injection or not.
    var OK = regexp.exec(o.val());
    if (OK) { // This is sql injection.
        o.addClass("ui-state-error");
        //updateTips( n );
        alert($.i18n.prop('i_alertTextRegularity'));
        return false;
    } else { // Legal SQL string
        return true;
    }
}

function checkRegexp(o, regexp, n) {
    if (!(regexp.test(o.val()))) {
        o.addClass("ui-state-error");
        //updateTips( n );
        return false;
    } else {
        return true;
    }
}

function selectColumn(id) {
    $("#" + id).toggleClass("changeBgColor");
}

/** 
 * 建立日期格式套用，參考網址:https://www.runoob.com/js/js-obj-date.html
 * alert(new Date().format("yyyy年MM月dd日"));
 * alert(new Date().format("MM/dd/yyyy"));
 * alert(new Date().format("yyyyMMdd"));
 * alert(new Date().format("yyyy-MM-dd hh:mm:ss"));
 */
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}