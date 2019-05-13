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

function updateTips(t) {
    tips.text(t)
        .addClass("ui-state-highlight");
    setTimeout(function () {
        tips.removeClass("ui-state-highlight", 1500);
    }, 500);
}

function checkLengthByDOM(element, n, min, max) {
    if (element.value.length > max || element.value.length < min) {
        var name = "ui-state-error";
        var arr = element.className.split(" ");
        if (arr.indexOf(name) == -1)
            element.className += " " + name;
        /*updateTips( "Length of " + n + " must be between " +
        min + " and " + max + "." );*/
        return false;
    } else {
        return true;
    }
}

//*
function checkLength(o, n, min, max) {
    if (o.val().length) {
        if (o.val().length > max || o.val().length < min) {
            o.addClass("ui-state-error");
            //*updateTips( "Length of " + n + " must be between " +
            //min + " and " + max + "." );
            return false;
        } else {
            //*
            if ( checkRegexp2(o, n, min, max) ) {                
                return true;
            } else {
                o.addClass("ui-state-error");
                return false;
            }
            //*/
            //return true;
        }
    } else {
        o.addClass("ui-state-error");
        return false;
    }
}
//*/
// 2019/05/03 Regular Expression.
var regexp = /(=)|(<)|(>)|(')|(")|(--)|(\/)|(\+)|(;)|(\*)|(!)|({)|(})|(drop table)|(drop stored)|(alter table)|(alter stored)|(sp_)|(xp_)|(exec )|(execute )|(fetch)|(select)|(kill)|(selectsys)|(sysobjects)|(syscolumns)|(isnull)|(coalesce)|(dbo)|(tbl)|(usp)/;
function checkRegexp2(o, n, min, max) { // Check sql injection or not.
    var OK = regexp.exec(o.val());
    if (OK) { // This is sql injection.
        o.addClass("ui-state-error");
        //updateTips( n );
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