var token = "";
$(function () {
    token = getUser() ? getUser().api_token : "";
    /**
     * Check this page's permission and load navbar
     */
    if (!getPermissionOfPage("Member_Setting")) {
        alert("Permission denied!");
        window.location.href = '../index.html';
    }
    setNavBar("Member_Setting", "Job_Title_Setting");

    var size = 10;
    var default_color = '#2eb82e';
    var datascource = {
        'name': 'JobTitle',
        'id': '0',
        'color': '#929292' //top
    };

    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetJobTitle_relation"],
        "api_token": [token]
    };

    var form, dialog = $("#dialog_edit_node").dialog({
        autoOpen: false
    });

    drawPosition(default_color, size); //預設的點顏色
    $("#edit_dot_color").val(default_color);
    $("#edit_dot_color").change(function () { //設定change事件
        drawPosition($(this).val(), size);
    });

    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                datascource.children = revObj.Value[0].Values;
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

            $('input[name="node-type"]').on('click', function () {
                var $this = $(this);
                if ($this.val() === 'parent') {
                    $('#edit-panel').addClass('edit-parent-node');
                } else {
                    $('#edit-panel').removeClass('edit-parent-node');
                }
            });

            $('#btn-add-nodes').on('click', function () {
                var $chartContainer = $('#chart-container');
                var $node = $('#selected-node').data('node');
                var nodeType = $('input[name="node-type"]:checked');
                if (!$node) {
                    alert($.i18n.prop('i_alertChart_5'));
                    return;
                }
                if (!nodeType.length) {
                    alert($.i18n.prop('i_alertChart_6'));
                    return;
                }
                if (!$('.orgchart').length) {
                    alert($.i18n.prop('i_alertChart_1'));
                    return;
                }

                $("#edit_dot_color").val(default_color);
                drawPosition(default_color, '10');

                //設定add node的跳出視窗
                dialog = $("#dialog_edit_node").dialog({
                    autoOpen: false,
                    height: 450,
                    width: 400,
                    modal: true,
                    buttons: {
                        "Confirm": function () {
                            addNodeSubmit();
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
                    addNodeSubmit();
                    dialog.dialog("close");
                });

                function addNodeSubmit() {
                    var nodeVals = [];
                    var nodeName = $("#edit_type_name");
                    nodeName.removeClass("ui-state-error");
                    if (typeof (nodeName.val()) != 'undefined' && nodeName.val() != "") {
                        nodeVals.push(nodeName.val());
                    } else {
                        nodeName.addClass("ui-state-error");
                        return;
                    }
                    if (!nodeVals.length) {
                        alert($.i18n.prop('i_alertChart_2'));
                        return;
                    }
                    var addColor = colorToHex($("#edit_dot_color").val());
                    var addRequest = {
                        "Command_Type": ["Read"],
                        "Command_Name": ["AddJobTitle"],
                        "api_token": [token]
                    };
                    var addXmlHttp = createJsonXmlHttp('sql');
                    if (nodeType.val() === 'siblings') { //增加同層節點
                        if ($node[0].id === oc.$chart.find('.node:first')[0].id) {
                            alert($.i18n.prop('i_alertChart_3'));
                            return;
                        }
                        addXmlHttp.onreadystatechange = function () {
                            if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                                var revObj = JSON.parse(this.responseText);
                                if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                                    oc.addSiblings($node, nodeVals.map(function (item) {
                                        return {
                                            'name': item,
                                            'relationship': '110',
                                            'id': revObj.Value[0].Values.c_id,
                                            "color": addColor
                                        };
                                    }));
                                }
                            }
                        };
                        var parent = $node.parents("table").eq(1).find('.node:first');
                        addRequest.Value = [{
                            "parent": parent.children('.title').text(),
                            "p_id": parent[0].id,
                            "children": nodeVals[0],
                            "color": addColor
                        }];
                    } else { //增加下層節點
                        addXmlHttp.onreadystatechange = function () {
                            if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                                var revObj = JSON.parse(this.responseText);
                                if (revObj.success == 1) {
                                    var hasChild = $node.parent().attr('colspan') > 0 ? true : false;
                                    if (!hasChild) {
                                        var rel = nodeVals.length > 1 ? '110' : '100';
                                        oc.addChildren($node, nodeVals.map(function (item) {
                                            return {
                                                'name': item,
                                                'relationship': rel,
                                                'id': revObj.Values.c_id,
                                                "color": addColor
                                            };
                                        }));
                                    } else {
                                        oc.addSiblings($node.closest('tr').siblings('.nodes').find('.node:first'), nodeVals.map(function (item) {
                                            return {
                                                'name': item,
                                                'relationship': '110',
                                                'id': revObj.Values.c_id,
                                                "color": addColor
                                            };
                                        }));
                                    }
                                }
                            }
                        };
                        addRequest.Value = [{
                            "parent": $node.children('.title').text(),
                            "p_id": $node[0].id,
                            "children": nodeVals[0],
                            "color": addColor
                        }];
                    }
                    addXmlHttp.send(JSON.stringify(addRequest));
                    dialog.dialog("close");
                }
                dialog.dialog("open");
            });

            $('#btn-delete-nodes').on('click', function () {
                var $node = $('#selected-node').data('node');
                if (!$node) {
                    alert($.i18n.prop('i_alertChart_5'));
                    return;
                } else if ($node[0] === $('.orgchart').find('.node:first')[0]) {
                    if (!window.confirm($.i18n.prop('i_alertChart_4'))) {
                        return;
                    }
                }
                var nodeIds = [];
                var nodeChildren = $node.parents("table").eq(0).find('.node');
                for (i = 0; i < nodeChildren.length; i++) {
                    nodeIds.push({
                        "c_id": nodeChildren[i].id
                    });
                }
                var deleteRequest = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["DeleteJobTitle"],
                    "Value": nodeIds,
                    "api_token": [token]
                };
                var deleteXmlHttp = createJsonXmlHttp('sql');
                deleteXmlHttp.onreadystatechange = function () {
                    if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                            oc.removeNodes($node);
                            $('#selected-node').val('').data('node', null);
                        }
                        return;
                    }
                };
                deleteXmlHttp.send(JSON.stringify(deleteRequest));
            });

            $('#btn-edit-nodes').on('click', function () {
                var $node = $('#selected-node').data('node');
                if (!$node) {
                    alert($.i18n.prop('i_alertChart_5'));
                    return;
                }
                var nodeTitle = $node.children('.title');
                var nodeColor = colorToHex(nodeTitle.css('background-color'));
                $("#edit_type_name").val(nodeTitle.text());
                $("#edit_dot_color").val(nodeColor);
                drawPosition(nodeColor, size);
                //設定edit node的跳出視窗
                dialog = $("#dialog_edit_node").dialog({
                    autoOpen: false,
                    height: 450,
                    width: 400,
                    modal: true,
                    buttons: {
                        "Confirm": function () {
                            editNodeSubmit();
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
                    editNodeSubmit();
                    dialog.dialog("close"); //送出後自動關閉視窗
                });

                function editNodeSubmit() {
                    var $node = $('#selected-node').data('node');
                    var editName = $("#edit_type_name").val();
                    if (typeof (editName) != 'undefined' && editName.trim() != '') {
                        $("#edit_type_name").removeClass("ui-state-error");
                    } else {
                        $("#edit_type_name").addClass("ui-state-error");
                        return;
                    }
                    var editColor = $("#edit_dot_color").val();

                    var editRequest = {
                        "Command_Type": ["Read"],
                        "Command_Name": ["EditJobTitle"],
                        "Value": {
                            "c_id": $node[0].id,
                            "name": editName,
                            "color": colorToHex(editColor)
                        },
                        "api_token": [token]
                    };
                    var editXmlHttp = createJsonXmlHttp('sql');
                    editXmlHttp.onreadystatechange = function () {
                        if (editXmlHttp.readyState == 4 || editXmlHttp.readyState == "complete") {
                            var revObj = JSON.parse(this.responseText);
                            if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                                var nodeTitle = $node.children('.title');
                                if ($node.find('.symbol').length) {
                                    nodeTitle.text(editName).css('background-color', editColor)
                                        .prepend('<i class="fa fa-sitemap symbol"></i>');
                                } else {
                                    nodeTitle.text(editName).css('background-color', editColor);
                                }
                            }
                            return;
                        }
                    };
                    editXmlHttp.send(JSON.stringify(editRequest));
                    dialog.dialog("close");
                }
                dialog.dialog("open");
            });
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));

    function colorToHex(color) {
        color = typeof (color) != "string" ? color.toString() : color;
        if (color.indexOf('#') == 0) {
            return color;
        } else {
            var colorArr = color.substring(color.indexOf("(") + 1, color.length - 1).split(",");
            var hexColor = "#";
            for (i = 0; i < colorArr.length; i++) {
                if (i == 3) {
                    var persentHex = Number(Math.floor(colorArr[i] * 255)).toString(16);
                    if (hexColor != "FF")
                        hexColor += persentHex.length === 1 ? "0" + persentHex : persentHex;
                } else {
                    var hexStr = Number(colorArr[i]).toString(16);
                    hexColor += hexStr.length === 1 ? "0" + hexStr : hexStr;
                }
            }
            return hexColor.toUpperCase();
        }
    }

    function drawPosition(color, size) {
        var canvas = document.getElementById('canvas_dot');
        var ctx = canvas.getContext('2d');
        var x = canvas.width / 2,
            y = canvas.height / 2,
            radius = size; //30;
        ctx.clearRect(0, 0, canvas.width, canvas.height); //先還原
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.arc(x, y - radius * 2, radius, Math.PI * (1 / 6), Math.PI * (5 / 6), true);
        //circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        ctx.fillStyle = color != "" ? color : '#2eb82e';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y - radius * 2, radius / 2.5, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
});