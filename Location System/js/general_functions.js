function setCookie(cname, cvalue, cday) {
    if (cday) {
        var cdate = new Date();
        cdate.setDate(cdate.getDate() + cday);
        document.cookie = cname + "=" + cvalue + ";expires=" + cdate;
    } else {
        document.cookie = cname + "=" + cvalue + ";";
    }
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
            if (checkRegexp2(o)) {
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

function checkRegexp2(o) { // Check sql injection or not.
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

function TimeToArray(time_str) {
    if (time_str.length > 0) {
        var break_index = time_str.lastIndexOf(" ");
        return {
            date: time_str.substring(0, break_index),
            time: time_str.substring(break_index + 1, time_str.length)
        };
    }
}

function selectColumn(id) {
    $("#" + id).toggleClass("changeBgColor");
}

function colorToHex(color) {
    color = typeof (color) != "string" ? color.toString() : color;
    if (color.indexOf('#') == 0) {
        return color;
    } else {
        let colorArr = color.substring(color.indexOf("(") + 1, color.length - 1).split(","),
            hexColor = "#";
        for (let i = 0; i < colorArr.length; i++) {
            if (i == 3) {
                let persentHex = Number(Math.floor(colorArr[i] * 255)).toString(16);
                if (hexColor != "FF")
                    hexColor += persentHex.length === 1 ? "0" + persentHex : persentHex;
            } else {
                let hexStr = Number(colorArr[i]).toString(16);
                hexColor += hexStr.length === 1 ? "0" + hexStr : hexStr;
            }
        }
        return hexColor.toUpperCase();
    }
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

function stopDLL(token) {
    let xmlHttp = createJsonXmlHttp("test2");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj)) {
                //alert("Position has stopped!");
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify({
        "Command_Type": ["Write"],
        "Command_Name": ["Launch"],
        "Value": "Stop",
        "api_token": [token]
    }));
}

function startDLL(token) {
    let xmlHttp = createJsonXmlHttp("test2");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj)) {
                //alert("Position has stopped!");
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify({
        "Command_Type": ["Write"],
        "Command_Name": ["Launch"],
        "Value": "Start",
        "api_token": [token]
    }));
}


/**
 * 用Ajax + Json與後端傳送並接收資料
 * success: 接收到回傳的內容
 * error: 沒有收到回應或錯誤
 =>
    $.ajax({
        url: '',
        type: 'POST',
        async: true,
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        data: JSON.stringify({}),
        success: function (revObj) {

        },
        error: function(xhr){
            console.log("error");
        }
    });
 **/

/**
 * //let xmlHttp = GetXmlHttpObject();
   const json_request = JSON.stringify({});
   xmlHttp.open("POST", "", true);
   xmlHttp.setRequestHeader("Content-type", "application/json");
   xmlHttp.onreadystatechange = function () {
       if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
           let revObj = JSON.parse(this.responseText);
           
       }
   };
   xmlHttp.send(json_request);
 */

/*
   const json_request = JSON.stringify({});
   let jxh = createJsonXmlHttp("");
   jxh.onreadystatechange = function () {
       if (jxh.readyState == 4 || jxh.readyState == "complete") {
           let revObj = JSON.parse(this.responseText);
           
       }
   };
   jxh.send(json_request);
*/