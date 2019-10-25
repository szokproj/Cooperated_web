var token = "";

$(function () {
    token = getToken();

    var dialog, form,
        allFields = $([]).add($("#add_map_name")).add($("#add_map_image"));

    $("#add_map_file").on("change", function () {
        var file = this.files[0];
        var valid = checkExt(this.value);
        valid = valid && checkImageSize(file);
        if (valid && file) {
            var FR = new FileReader();
            FR.readAsDataURL(file);
            FR.onloadend = function (e) {
                var base64data = e.target.result;
                $("#add_map_image").attr("src", base64data);
            };
        } else {
            return;
        }
    });


    dialog = $("#dialog_add_map").dialog({
        autoOpen: false,
        height: 350,
        width: 350,
        modal: true,
        buttons: {
            "Confirm": addMap,
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
        addMap();
    });

    $("#add_new_map").button().on("click", function () {
        $("#add_map_name").val(""); //reset
        $("#add_map_image").attr("src", "");
        dialog.dialog("open");
    });
});