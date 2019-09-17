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
    setNavBar("Member_Setting", "Dept_Setting");

    var size = 10;
    var default_color = '#2eb82e';
    var datascource = {
        'name': 'Company',
        'id': '0',
        'color': '#929292' //top
    };

    var requestArray = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetDepartment_relation"],
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
                    //Please select one node in orgchart
                    return;
                }
                if (!nodeType.length) {
                    alert($.i18n.prop('i_alertChart_6'));
                    //Please select a node type
                    return;
                }
                if (!$('.orgchart').length) {
                    alert($.i18n.prop('i_alertChart_1'));
                    //Please creat the root node firstly when you want to build up the orgchart from the scratch
                    return;
                }

                $("#edit_dot_color").val(default_color);
                drawPosition(default_color, '10');

                //設定add node的跳出視窗
                dialog = $("#dialog_edit_node").dialog({
                    autoOpen: false,
                    height: 500,
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
                    var addColor = $("#edit_dot_color").val();
                    var addRequest = {
                        "Command_Type": ["Read"],
                        "Command_Name": ["AddDepartment"],
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
                                if (revObj.success == 1) {
                                    oc.addSiblings($node, nodeVals.map(function (item) {
                                        return {
                                            'name': item,
                                            'relationship': '110',
                                            'id': revObj.Values.c_id,
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
                    "Command_Name": ["DeleteDepartment"],
                    "Value": nodeIds,
                    "api_token": [token]
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
                    height: 500,
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
                        "Command_Name": ["EditDepartment"],
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

    function drawPosition(color, size) {
        var canvas = document.getElementById('canvas_dot');
        var ctx = canvas.getContext('2d');
        var x = canvas.width / 2,
            y = canvas.height / 2,
            radius = size; //30;
        ctx.clearRect(0, 0, canvas.width, canvas.height); //先還原
        //畫倒水滴形
        ctx.beginPath();
        ctx.arc(x, y, radius, Math.PI * (1 / 6), Math.PI * (5 / 6), true);
        ctx.lineTo(x, y + radius * 2);
        ctx.closePath();
        ctx.fillStyle = color; //'#00e68a';
        ctx.fill();
        //畫中心白色圓形
        ctx.beginPath();
        ctx.arc(x, y, radius / 2.5, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
});