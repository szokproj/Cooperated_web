var chart_type = "";

function createChart(type) {
    chart_type = type;
    $("#chart-container").html("");
    var requestArray = {},
        datascource = {};
    if (type == "dept") {
        requestArray = {
            "Command_Type": ["Read"],
            "Command_Name": ["GetDepartment_relation"]
        };
        datascource = {
            'name': 'Company',
            'id': '0',
            'color': '#929292' //top
        };
    } else if (type == "jobTitle") {
        requestArray = {
            "Command_Type": ["Read"],
            "Command_Name": ["GetJobTitle_relation"]
        };
        datascource = {
            'name': 'JobTitle',
            'id': '0',
            'color': '#929292' //top
        };
    } else {
        return;
    }

    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success == 1) {
                datascource.children = revObj.Values;
            } else {
                datascource.children = null;
            }
            var oc = $('#chart-container').orgchart({
                'data': datascource,
                'chartClass': 'edit-state',
                'parentNodeSymbol': 'fa-th-large',
                'createNode': function (data) {
                    data = datascource;
                }
            });
            oc.$chartContainer.on('click', '.node', function () {
                var $this = $(this);
                $('#selected-node').val($this.find('.title').text()).data('node', $this);
            });
            oc.$chartContainer.on('click', '.orgchart', function (event) {
                if (!$(event.target).closest('.node').length) {
                    $('#selected-node').val('');
                }
            });
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}


$(function () {
    var dialog, form,
        select_node = $('#selected-node');
    //tips = $( ".validateTips" );

    function SendResult() {
        select_node.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(select_node, "not null", 0, 20);
        if (valid) {
            datascource = {};
            if (chart_type == "dept")
                $("#main_department").val(select_node.val());
            else if (chart_type == "jobTitle")
                $("#main_jobTitle").val(select_node.val());
            else
                return;
            dialog.dialog("close");
        }
        return valid;
    }

    dialog = $("#dialog_tree_chart").dialog({
        autoOpen: false,
        height: 620,
        width: 600,
        modal: true,
        buttons: {
            "Confirm": SendResult,
            Cancel: function () {
                form[0].reset();
                select_node.removeClass("ui-state-error");
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            select_node.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        SendResult();
    });
});