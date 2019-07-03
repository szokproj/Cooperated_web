// 建立 LightTableFilter
var LightTableFilter = (function (Arr) {
    'use strict';
    var _input;

    // 資料輸入事件處理函數
    function _onInputEvent(e) {
        _input = e.target;
        var tables = document.getElementsByClassName(_input.getAttribute('data-table'));
        Arr.forEach.call(tables, function (table) {
            Arr.forEach.call(table.tBodies, function (tbody) {
                Arr.forEach.call(tbody.rows, _filter);
            });
        });
    }

    // 資料篩選函數，顯示包含關鍵字的列，其餘隱藏
    function _filter(row) {
        var text = row.textContent.toLowerCase(),
            val = _input.value.toLowerCase();
        row.style.display = text.indexOf(val) === -1 ? 'none' : 'table-row';
    }

    return {
        // 初始化函數
        init: function () {
            var inputs = document.getElementsByClassName('light-table-filter');
            Arr.forEach.call(inputs, function (input) {
                input.oninput = _onInputEvent;
            });
        }
    };
})(Array.prototype);

/*
    // 網頁載入完成後，啟動 LightTableFilter
    document.addEventListener('readystatechange', function () {
        if (document.readyState === 'complete') {
            LightTableFilter.init();
        }
    });
});*/


// 資料篩選函數，顯示包含關鍵字的列，其餘隱藏
function tableFilter(inputID, tableID) {
    var input = document.getElementById(inputID);
    var rows = document.getElementById(tableID).tBodies[0].rows; //cells
    for (var i = 0; i < rows.length; i++) {
        var text = rows[i].textContent.toLowerCase(),
            val = input.value.toLowerCase();
        rows[i].style.display = text.indexOf(val) === -1 ? 'none' : 'table-row';
    }
}