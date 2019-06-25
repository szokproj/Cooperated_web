$(function () {
    var datascource = {
        'name': 'Company',
        'id': '0',
        'color': '#929292' //top
    };

    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetDepartment_relation"]
    };

    var xmlHttp = createJsonXmlHttp('sql');
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (revObj.success == 1) {
                datascource.children = revObj.Values;
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
                    $('#new-nodelist').children(':gt(0)').remove();
                } else {
                    $('#edit-panel').removeClass('edit-parent-node');
                }
            });

            $('#btn-add-nodes').on('click', function () {
                var $chartContainer = $('#chart-container');
                var nodeVals = [];
                var addRequest = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["AddDepartment"]
                };
                var addXmlHttp = createJsonXmlHttp('sql');

                $('#new-nodelist').find('.new-node').each(function (index, item) {
                    var validVal = item.value.trim();
                    if (validVal.length) {
                        nodeVals.push(validVal);
                    }
                });
                var $node = $('#selected-node').data('node');
                if (!nodeVals.length) {
                    alert('Please input value for new node');
                    return;
                }
                var nodeType = $('input[name="node-type"]:checked');
                if (!nodeType.length) {
                    alert('Please select a node type');
                    return;
                }
                if (!$('.orgchart').length) {
                    alert('Please creat the root node firstly when you want to build up the orgchart from the scratch');
                    return;
                }
                if (!$node) {
                    alert('Please select one node in orgchart');
                    return;
                }
                if (nodeType.val() === 'siblings') {
                    if ($node[0].id === oc.$chart.find('.node:first')[0].id) {
                        alert('You are not allowed to directly add sibling nodes to root node');
                        return;
                    }
                    addXmlHttp.onreadystatechange = function () {
                        if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                            var revObj = JSON.parse(this.responseText);
                            if (revObj.success == 1) {
                                oc.addSiblings($node, nodeVals.map(function (item) {
                                    return {
                                        'name': item,
                                        'relationship': '110',
                                        'id': revObj.Values.c_id
                                    };
                                }));
                            }
                        }
                    };
                    var parent = $node.parents("table").eq(1).find('.node:first');
                    addRequest.Value = {
                        "parent": parent.children('.title').text(),
                        "p_id": parent[0].id,
                        "children": nodeVals[0],
                        "color": "#4CAF50"
                    };
                } else {
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
                                            'id': revObj.Values.c_id
                                        };
                                    }));
                                } else {
                                    oc.addSiblings($node.closest('tr').siblings('.nodes').find('.node:first'), nodeVals.map(function (item) {
                                        return {
                                            'name': item,
                                            'relationship': '110',
                                            'id': revObj.Values.c_id
                                        };
                                    }));
                                }
                            }
                        }
                    };
                    addRequest.Value = {
                        "parent": $node.children('.title').text(),
                        "p_id": $node[0].id,
                        "children": nodeVals[0],
                        "color": "#4CAF50"
                    };
                }
                addXmlHttp.send(JSON.stringify(addRequest));
            });


            $('#btn-delete-nodes').on('click', function () {
                var $node = $('#selected-node').data('node');
                if (!$node) {
                    alert('Please select one node in orgchart');
                    return;
                } else if ($node[0] === $('.orgchart').find('.node:first')[0]) {
                    if (!window.confirm('Are you sure you want to delete the whole chart?')) {
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
                    "Command_Name": ["DeleteDepartment"],
                    "Value": nodeIds
                };
                var deleteXmlHttp = createJsonXmlHttp('sql');
                deleteXmlHttp.onreadystatechange = function () {
                    if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (revObj.success == 1) {
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
                    alert('Please select one node in orgchart');
                    return;
                }
                var nodeTitle = $node.children('.title');
                var nodeColor = colorToRGBA(nodeTitle.css('background-color'));
                $("#edit_type_name").val(nodeTitle.text());
                $("#dot_edit_color").val(nodeColor);
                $("#dot_edit_color").css('background-color', nodeColor);
                $("#dialog_dot_edit").dialog("open");
            });

            var dialog, form;
            var sendResult = function () {
                var $node = $('#selected-node').data('node');
                var editName = $("#edit_type_name").val();
                var editColor = $("#dot_edit_color").css('background-color');
                var editRequest = {
                    "Command_Type": ["Read"],
                    "Command_Name": ["EditDepartment"],
                    "Value": {
                        "c_id": $node[0].id,
                        "name": editName,
                        "color": colorToHex(editColor)
                    }
                };
                var editXmlHttp = createJsonXmlHttp('sql');
                editXmlHttp.onreadystatechange = function () {
                    if (editXmlHttp.readyState == 4 || editXmlHttp.readyState == "complete") {
                        var revObj = JSON.parse(this.responseText);
                        if (revObj.success == 1) {
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
            };
            dialog = $("#dialog_dot_edit").dialog({
                autoOpen: false,
                height: 500,
                width: 400,
                modal: true,
                buttons: {
                    "Confirm": function () {
                        sendResult();
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
                sendResult();
                dialog.dialog("close"); //送出後自動關閉視窗
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

    function colorToRGBA(color) {
        color = typeof (color) != "string" ? color.toString() : color;
        if (color.indexOf('#') == 0) {
            colorLen = color.length;
            if (colorLen == 7) { //rgb
                var r = parseInt(color.substring(1, 2), 16);
                var g = parseInt(color.substring(3, 4), 16);
                var b = parseInt(color.substring(5, 6), 16);
                return 'rgb(' + r + ', ' + g + ', ' + b + ')';
            } else if (colorLen == 9) { //rgba
                var r = parseInt(color.substring(1, 2), 16);
                var g = parseInt(color.substring(3, 4), 16);
                var b = parseInt(color.substring(5, 6), 16);
                var a = parseInt(color.substring(7, 8), 16);
                return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
            } else {
                return color;
            }
        } else {
            return color;
        }
    }
});