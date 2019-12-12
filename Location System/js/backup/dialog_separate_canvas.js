function setSeparateDialog() {
    var dialog;

    dialog = $("#separate_canvas_dialog").dialog({
        autoOpen: false,
        height: 500,
        width: 400,
        modal: true,
        buttons: {
            "Confirm": function () {
                sendResult();
            },
            Cancel: function () {
                dialog.dialog("close");
            }
        }
    });

    function sendResult() {
        let mode = $("#select_canvas_mode").val();
        Cookies.set("separate_canvas", mode);
        Stop();
        canvasMode(mode);
        loadMapToCanvas();
        Start();
        $("#separate_canvas_dialog").dialog("close");
    }

    $("#btn_separate_canvas").on("click", function () {
        let separate_canvas = Cookies.get("separate_canvas"),
            mode = typeof (separate_canvas) === 'undefined' ? "1" : separate_canvas;
        $("#select_canvas_mode").val(mode);
        dialog.dialog("open");
    });
}