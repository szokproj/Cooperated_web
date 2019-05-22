var type_id = "";
var status_id = "";

function EditDotType(tr) {
    type_id = tr;
    $("#dialog_dot_edit").dialog("open");
}

function EditAlarmDotType(tr) {
    status_id = tr;
    $("#dialog_alarm_dot_edit").dialog("open");
}

$(function () {

    var dialog, form;

    function sendResult(tr) {
        $("#" + tr + " td").eq(1).text($("#dot_edit_color").val());
        $("#" + tr + " td").eq(2).text($("#dot_edit_size").val());
        dialog.dialog("close");
    }

    dialog = $("#dialog_dot_edit").dialog({
        autoOpen: false,
        height: 500,
        width: 400,
        modal: true,
        buttons: {
            "Confirm": function () {
                sendResult(type_id);
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
        sendResult(type_id);
        dialog.dialog("close"); //送出後自動關閉視窗
    });


    /*-----------Alarm Dot Set------------*/

    var dialog2, form2;

    function sendResult2(tr) {
        $("#" + tr + " td").eq(1).text($("#alarm_dot_outside_color").val());
        $("#" + tr + " td").eq(2).text($("#alarm_dot_inside_color").val());
        $("#" + tr + " td").eq(3).text($("#alarm_dot_edit_size").val());
        dialog2.dialog("close");
    }

    dialog2 = $("#dialog_alarm_dot_edit").dialog({
        autoOpen: false,
        height: 500,
        width: 400,
        modal: true,
        buttons: {
            "Confirm": function () {
                sendResult2(status_id);
            },
            Cancel: function () {
                form2[0].reset();
                dialog2.dialog("close");
            }
        },
        close: function () {
            form2[0].reset();
        }
    });

    form2 = dialog2.find("form").on("submit", function (event) {
        event.preventDefault();
        sendResult2(status_id);
        dialog2.dialog("close"); //送出後自動關閉視窗
    });


});

