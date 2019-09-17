/** tree.js zyj 2018.4.22 */
(function (name) {
    var tree, outer, defaultDateFormat;

    outer = {
        setData: setData,
    };

    defaultDateFormat = {
        unfold: true,
        name: 'name',
        childName: 'children'
    };

    function getDataFormat(dataFormat) {
        var index;
        if (!dataFormat) {
            return defaultDateFormat;
        }
        for (index in defaultDateFormat) {
            dataFormat[index] = typeof dataFormat[index] == 'undefined' ? defaultDateFormat[index] : dataFormat[index];
        }
        return dataFormat
    }

    function initTreeJs(name) {
        var tree;
        if (checkTreeNameUsed(name)) {
            return;
        }
        window[name] = outer;
        initFoldIcon($('.tree'));
    }

    function checkTreeNameUsed(name) {
        if (window[name]) {
            console.error("The window object name [" + name + "] has been used, tree.js can't be loaded! You can try another name.");
            return true;
        }
        return false;
    }

    function initFoldIcon(target) {
        target.off('click', 'span>i.fa').on('click', 'span>i.fa', function (e) {
            var ele = $(e.target);
            if (ele.hasClass('fa-minus-circle')) {
                ele.removeClass('fa-minus-circle').addClass('fa-plus-circle').parent().next('ul').hide(200);
            } else if (ele.hasClass('fa-plus-circle')) {
                ele.removeClass('fa-plus-circle').addClass('fa-minus-circle').parent().next('ul').show(200);
            }
        })
    }

    function getJqueryObjectBySelector(selector) {
        var ele = $(selector);
        if (typeof selector != 'string') {
            console.error("The first parameter jquery selector [" + selector + "] must be a string!");
            return;
        }
        if (!ele.hasClass('tree')) {
            ele = ele.find('.tree');
        }
        if (ele.length != 1) {
            console.error("The selector [" + selector + "] expect only one element!");
            return;
        }
        return ele;
    }

    function setData(selector, data, dataFormat) {
        var ele = getJqueryObjectBySelector(selector);
        if (!ele) {
            return;
        }
        if (!data) {
            return;
        }
        if (!data.length) {
            data = [data];
        }
        dataFormat = getDataFormat(dataFormat);
        dataFormat.topElement = true;
        ele.empty().append(getTreeList(data, dataFormat));
        initFoldIcon(ele);
    }

    function getTreeList(data, dataFormat) {
        var i, single, name, children, childDataFormat,
            array = [];
        childDataFormat = dataFormat.child || dataFormat;
        if (dataFormat.unfold) {
            array.push('<ul>');
        } else if (dataFormat.topElement) {
            dataFormat.topElement = false;
            array.push('<ul>');
        } else {
            array.push('<ul style="display:none;">');
        }
        for (i = 0; i < data.length; i++) {
            single = data[i];
            if (typeof dataFormat.name == 'function') {
                name = dataFormat.name(single);
            } else if (typeof dataFormat.name == 'string') {
                name = single[dataFormat.name];
            } else {
                name = single['name'];
            }
            if (typeof dataFormat.childName == 'string') {
                children = single[dataFormat.childName];
            } else {
                children = single['children'];
            }
            array.push('<li>');
            array.push('<span>');
            if (children && children.length > 0) {
                if (dataFormat.unfold) {
                    array.push('<i class="fa fa-minus-circle"></i>');
                } else {
                    array.push('<i class="fa fa-plus-circle"></i>');
                }
                array.push(name);
                array.push('</span>');
                array.push(getTreeList(children, childDataFormat));
            } else {
                array.push(name);
                array.push('</span>');
            }
            array.push('</li>');
        }
        array.push('</ul>');
        return array.join('');
    }

    initTreeJs(name);
}('tree'))


/**
 *  偷懒没写注释，tree.js中目前只写了一个对外的接口 tree.setData(selector, data, dataFormat) 。
 *  参数selector是jQuery选择器，data是数据，dataFormat是数据格式。
 *  比如加载上图的数据：
 */
function setTreeArray(dataArray) {
    var treeArray = [];
    $('.tree').empty();
    if (dataArray.length > 0) {
        dataArray.forEach(data => {
            var exist_index = treeArray.findIndex(function (branch) {
                return branch.name == data.group_id;
            });
            if (exist_index == -1) { //尚未新增此Group_id的樹狀分枝
                treeArray.push({
                    name: data.group_id, //group_id
                    children: [{
                        name: data.main_anchor_id, //main_anchor_id
                        children: [{
                            name: data.anchor_id //anchor_id
                        }]
                    }]
                });
            } else {
                treeArray[exist_index].children[0].children.push({
                    name: data.anchor_id
                });
            }
        });
        tree.setData('.tree', treeArray);
    }
}

/*var dataTest = [{
        name: '1', //group_id
        children: [{
            name: '65503', //main_anchor_id
            children: [{
                    name: '65508' //anchor_id
                },
                {
                    name: '65507'
                },
                {
                    name: '65509'
                },
                {
                    name: '65510'
                }
            ]
        }]
    },
    {
        name: '2',
        children: [{
            name: '65503',
            children: [{
                    name: '65514'
                },
                {
                    name: '65512'
                },
                {
                    name: '65523'
                },
                {
                    name: '65524'
                }
            ]
        }]
    }, {
        name: '3',
        children: [{
            name: '65504'
        }]
    }
];*/

//tree.setData('.tree', dataTest);