var token = "";
var default_color = '#2eb82e';
var chart_type = "";

$(function () {
    token = getUser() ? getUser().api_token : "";

    var dialog, form,
        select_node = $('#selected-node');

    function SendResult() {
        select_node.removeClass("ui-state-error");
        var valid = true;
        valid = valid && checkLength(select_node, $.i18n.prop('i_alertError_10'), 0, 20);
        if (valid) {
            datascource = {};
            if (chart_type == "dept") {
                $("#main_department").val(select_node.val());
                var dept_id = select_node.data('node')[0].id;
                $("#hidden_department").val(dept_id);
                var index = $("#main_select_tag_color").children('option:selected').index();
                if (index == 1 && dept_id != "") {
                    $("#main_input_tag_color").val(default_color);
                    $("#main_display_color").css("background-color", default_color);
                    deptColorArray.forEach(v => {
                        if (v.c_id == dept_id) {
                            $("#main_input_tag_color").val(colorToHex(v.color));
                            $("#main_display_color").css("background-color", colorToHex(v.color));
                        }
                    });
                }
            } else if (chart_type == "jobTitle") {
                $("#main_jobTitle").val(select_node.val());
                var title_id = select_node.data('node')[0].id;
                $("#hidden_jobTitle").val(title_id);
                var index = $("#main_select_tag_color").children('option:selected').index();
                if (index == 2 && title_id != "") {
                    $("#main_input_tag_color").val(default_color);
                    $("#main_display_color").css("background-color", default_color);
                    titleColorArray.forEach(v => {
                        if (v.c_id == title_id) {
                            $("#main_input_tag_color").val(colorToHex(v.color));
                            $("#main_display_color").css("background-color", colorToHex(v.color));
                        }
                    });
                }
            } else {
                return;
            }
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

function createChart(type) {
    chart_type = type;
    $("#chart-container").html("");
    var requestArray = {},
        datascource = {};
    if (type == "dept") {
        requestArray = {
            "Command_Type": ["Read"],
            "Command_Name": ["GetDepartment_relation"],
            "api_token": [token]
        };
        datascource = {
            'name': 'Company',
            'id': '0',
            'color': '#929292' //top
        };
    } else if (type == "jobTitle") {
        requestArray = {
            "Command_Type": ["Read"],
            "Command_Name": ["GetJobTitle_relation"],
            "api_token": [token]
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