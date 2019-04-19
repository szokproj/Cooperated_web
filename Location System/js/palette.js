/**
 * 调色盘 
 * create by j.y.du
 */
var du = this.du || {};
du.yue = this.du.yue || {};
du.yue.PaletteTop = function () {
    // VO
    var _PaletteTop = this;
    var _PaletteUtil = du.yue.PaletteUtil;
    var _PaletteDom = new du.yue.PaletteDom();
    var _PaletteEvent = new du.yue.PaletteEvent();
    // dataVo 
    var _start = false,
        _mode = 0,
        _className = "palette"; // mode:0-div模式 1-canvas模式
    var _currentVo = {}; // target:当前点击的input，rgb:当前颜色，hsv，hex
    var _typeLabel = "HEX";
    var _PaletteCtx, _MidShowCtx, _HueCtx, _TransparentCtx, _BottomChangeCtx, _BottomDefinePlusCtx;
    // dom
    var _OutDiv, _PaletteOutDiv, _PaletteCircleDiv, _PaletteInnDiv, _PaletteCanvas;
    var _MidOutDiv, _MidShowCanvas;
    var _MidBarOutDiv, _MidBarHueOutDiv, _MidBarHueCircleDiv, _MidBarHueEventDiv, _HueCanvas;
    var _MidBarTransOutDiv, _MidBarTransCircleDiv, _MidBarTransEventDiv, _TransparentCanvas;
    var _BottomOutDiv, _BottomLabelDiv, _BottomLabelSpan, _BottomChangeDiv, _BottomChangeCanvas, _BottomInputDiv, _BottomHexInput, _BottomRInput, _BottomGInput, _BottomBInput, _BottomAInput;
    var _BottomQuickOutDiv, _BottomQuickModelOutDiv, _BottomDefineOutDiv, _BottomDefinePlusCanvas;
    // 三个球的移动对象
    var _PaletteVo = {},
        _HueVo = {},
        _TransparentVo = {};
    /**
     * 初始化方法
     */
    _init();
    /**
     * 对外方法
     */
    Object.defineProperties(this, {
        debugData: {
            writable: false,
            value: function (dataName) {
                return eval(dataName);
            }
        },
        start: {
            writable: false,
            value: function (className) {
                _start = true;
                className && (_className = className);
                eval("_startMode_" + _mode).call();
            }
        },
        finish: {
            writable: false,
            value: function () {
                _start = false;
            }
        }
    });
    /**
     * 内部方法
     */
    // 初始化
    function _init() {
        // 给doc绑定鼠标按下事件
        document.addEventListener("mousedown", function () {
            _PaletteEvent.docMouseDownEvent.apply(this, [_start, _className, _OutDiv, _setColor]);
        });
    }
    // 执行事件绑定方法
    function _fire() {
        if (_currentVo.target) {
            _currentVo.target.setAttribute("readonly", "readonly");
            _currentVo.target.style["background-color"] = _currentVo.target.value;
            _currentVo.target.style["text-indent"] = "-999px";
            _PaletteUtil.event.fire(_currentVo.target, "change");
        }
    }
    // 启动0模式
    function _startMode_0() {
        // 组装弹框
        eval("_packageDialogDiv_" + _mode).call();
        // 初始化canvas
        eval("_initCanvas_" + _mode).call();
        // 绑定事件
        eval("_bindEvent_" + _mode).call();
    }
    // 组装弹框
    function _packageDialogDiv_0() {
        _OutDiv = _PaletteDom.getOutDiv();
        // 顶部
        _PaletteOutDiv = _PaletteDom.getPaletteOutDiv();
        _OutDiv.appendChild(_PaletteOutDiv);
        // 色盘选择圆圈
        _PaletteCircleDiv = _PaletteDom.getPaletteCircleDiv();
        _PaletteOutDiv.appendChild(_PaletteCircleDiv);
        // 色盘内框
        _PaletteInnDiv = _PaletteDom.getPaletteInnDiv();
        _PaletteOutDiv.appendChild(_PaletteInnDiv);
        // 色盘
        _PaletteCanvas = _PaletteDom.getPaletteCanvas();
        _PaletteInnDiv.appendChild(_PaletteCanvas);
        // 中部 
        _MidOutDiv = _PaletteDom.getMidOutDiv();
        _OutDiv.appendChild(_MidOutDiv);
        // 色卡
        _MidShowCanvas = _PaletteDom.getMidShowCanvas();
        _MidOutDiv.appendChild(_MidShowCanvas);
        // hue外框 
        _MidBarOutDiv = _PaletteDom.getMidBarOutDiv();
        _MidOutDiv.appendChild(_MidBarOutDiv);
        // 彩虹外框
        _MidBarHueOutDiv = _PaletteDom.getMidBarHueOutDiv();
        _MidBarOutDiv.appendChild(_MidBarHueOutDiv);
        // 彩虹圆圈
        _MidBarHueCircleDiv = _PaletteDom.getMidBarCircleDiv();
        _MidBarHueOutDiv.appendChild(_MidBarHueCircleDiv);
        // 彩虹条外框包围
        _MidBarHueEventDiv = _PaletteDom.getMidBarHueDiv();
        _MidBarHueOutDiv.appendChild(_MidBarHueEventDiv);
        // 彩虹条
        _HueCanvas = _PaletteDom.getMidBarHueCanvas();
        _MidBarHueEventDiv.appendChild(_HueCanvas);
        // 透明度外框 
        _MidBarTransOutDiv = _PaletteDom.getMidBarHueOutDiv();
        _MidBarOutDiv.appendChild(_MidBarTransOutDiv);
        // 透明度圆圈
        _MidBarTransCircleDiv = _PaletteDom.getMidBarCircleDiv();
        _MidBarTransOutDiv.appendChild(_MidBarTransCircleDiv);
        // 透明条外框包围
        _MidBarTransEventDiv = _PaletteDom.getMidBarHueDiv();
        _MidBarTransOutDiv.appendChild(_MidBarTransEventDiv);
        // 透明度条
        _TransparentCanvas = _PaletteDom.getMidBarHueCanvas();
        _MidBarTransEventDiv.appendChild(_TransparentCanvas);
        // 底部
        _BottomOutDiv = _PaletteDom.getBottomOutDiv();
        _OutDiv.appendChild(_BottomOutDiv);
        // 输入信息外框
        _BottomInputDiv = _PaletteDom.getBottomInputDiv();
        _BottomOutDiv.appendChild(_BottomInputDiv);
        // hex框
        _BottomHexInput = _PaletteDom.getBottomHexInput();
        _BottomInputDiv.appendChild(_BottomHexInput);
        // RGB框
        _BottomRInput = _PaletteDom.getBottomRGBInput();
        _BottomGInput = _PaletteDom.getBottomRGBInput();
        _BottomBInput = _PaletteDom.getBottomRGBInput();
        _BottomAInput = _PaletteDom.getBottomRGBInput();
        // 单控
        _BottomAInput.setAttribute("maxlength", "4");
        // 切换标签
        _BottomChangeDiv = _PaletteDom.getBottomChangeDiv();
        _BottomOutDiv.appendChild(_BottomChangeDiv);
        // 切换canvas
        _BottomChangeCanvas = _PaletteDom.getBottomChangeCanvas();
        _BottomChangeDiv.appendChild(_BottomChangeCanvas);
        // 文字显示和切换框
        _BottomLabelDiv = _PaletteDom.getBottomLabelDiv();
        _BottomOutDiv.appendChild(_BottomLabelDiv);
        // 具体文字显示
        _BottomLabelSpan = _PaletteDom.getBottomLabelSpan();
        _BottomLabelDiv.appendChild(_BottomLabelSpan);
        // 快速颜色选择包裹
        _BottomQuickOutDiv = _PaletteDom.getBottomQuickOutDiv();
        _OutDiv.appendChild(_BottomQuickOutDiv);
        // 模板色块包裹
        _BottomQuickModelOutDiv = _PaletteDom.getBottomQuickModelOutDiv();
        _BottomQuickOutDiv.appendChild(_BottomQuickModelOutDiv);
        // 模板色块
        _createModelDivs();
        // 自定义色块包裹
        _BottomDefineOutDiv = _PaletteDom.getBottomDefineOutDiv();
        _BottomQuickOutDiv.appendChild(_BottomDefineOutDiv);
        // 加号
        _BottomDefinePlusCanvas = _PaletteDom.getBottomDefinePlusCanvas();
        _BottomDefineOutDiv.appendChild(_BottomDefinePlusCanvas);

    }

    function _createModelDivs() {
        var colors = ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#00BCD4", "#009688", "#4CAF50",
            "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#795548", "#9E9E9E", "#607D8B"
        ];
        for (var a = 0; a < colors.length; a++) {
            var modelDiv = _PaletteDom.getBottomQuickModelDiv(colors[a]);
            _BottomQuickModelOutDiv.appendChild(modelDiv);
            // 绑定色块单击事件
            modelDiv.addEventListener("click", function () {
                _PaletteEvent.modelDivClickEvent.apply(this, [_changeByModel]);
            });
        }
    }
    // 初始化canvas
    function _initCanvas_0() {
        if (!_PaletteCanvas.getContext) {
            throw "Your Browser don't support Canvas!";
            return;
        }
        _PaletteCtx = _PaletteCanvas.getContext("2d");
        _MidShowCtx = _MidShowCanvas.getContext("2d");
        _HueCtx = _HueCanvas.getContext("2d");
        _drawHue();
        _TransparentCtx = _TransparentCanvas.getContext("2d");
        _BottomChangeCtx = _BottomChangeCanvas.getContext("2d");
        _drawChangeNoBack();
        _BottomDefinePlusCtx = _BottomDefinePlusCanvas.getContext("2d");
        _drawDefinePlus();
    }
    // 绑定事件
    function _bindEvent_0() {
        _PaletteVo = {
            eventDom: _PaletteOutDiv,
            callBack: _selectByPalette
        };
        _HueVo = {
            eventDom: _MidBarHueOutDiv,
            callBack: _selectByHue
        };
        _TransparentVo = {
            eventDom: _MidBarTransOutDiv,
            callBack: _selectByTrans
        };
        // 最外框阻止冒泡
        _OutDiv.addEventListener("mousedown", function () {
            _PaletteEvent.outDivMouseDownEvent.apply(this, [_PaletteVo, _HueVo, _TransparentVo]);
        });
        // 阻止右键默认事件 需要直接绑定 
        _OutDiv.oncontextmenu = function () {
            return _PaletteEvent.outDivContextMenuEvent.apply(this);
        };
        // 色盘区域 单击，移动事件
        _PaletteOutDiv.addEventListener("mousedown", function () {
            _PaletteEvent.paletteOutDivMouseDownEvent.apply(this, [_selectByPalette]);
        });
        _MidBarHueOutDiv.addEventListener("mousedown", function () {
            _PaletteEvent.midBarHueOutDivMouseDownEvent.apply(this, [_selectByHue]);
        });
        _MidBarTransOutDiv.addEventListener("mousedown", function () {
            _PaletteEvent.midBarTransOutDivMouseDownEvent.apply(this, [_selectByTrans]);
        });
        document.addEventListener("mousemove", function () {
            _PaletteEvent.docMouseMoveEvent.apply(this, [_PaletteVo, _HueVo, _TransparentVo]);
        });
        document.addEventListener("mouseup", function () {
            _PaletteEvent.docMouseUpEvent.apply(this);
        });
        // >> 切换事件
        _BottomChangeCanvas.addEventListener("click", function () {
            _PaletteEvent.bottomChangeCanvasClickEvent.apply(this, [_changeBottomType]);
        });
        _BottomChangeCanvas.addEventListener("mouseenter", function () {
            _PaletteEvent.bottomChangeCanvasMouseEnterEvent.apply(this, [_drawChangeHasBack]);
        });
        _BottomChangeCanvas.addEventListener("mouseleave", function () {
            _PaletteEvent.bottomChangeCanvasMouseLeaveEvent.apply(this, [_drawChangeNoBack]);
        });
        // HEX oninput事件
        _BottomHexInput.addEventListener("input", function () {
            _PaletteEvent.bottomInputEvent.apply(this, [_bottomInput]);
        });
        _BottomRInput.addEventListener("input", function () {
            _PaletteEvent.bottomInputEvent.apply(this, [_bottomInput]);
        });
        _BottomGInput.addEventListener("input", function () {
            _PaletteEvent.bottomInputEvent.apply(this, [_bottomInput]);
        });
        _BottomBInput.addEventListener("input", function () {
            _PaletteEvent.bottomInputEvent.apply(this, [_bottomInput]);
        });
        _BottomAInput.addEventListener("input", function () {
            _PaletteEvent.bottomInputEvent.apply(this, [_bottomInput]);
        });
        // 加号单击，添加自定义颜色
        _BottomDefinePlusCanvas.addEventListener("click", function () {
            _PaletteEvent.bottomDefinePlusCanvasClickEvent.apply(this, [_addUserDefinedColor]);
        });
    }
    // 设置颜色
    function _setColor() {
        _currentVo["target"] = this;
        _setColorDetail(this.value);
        _setBottomInfo();
    }
    // 设置颜色详细
    function _setColorDetail(value) {
        _getCurrentVo(value);
        _setPalette();
        _setPalettePosition();
        _setMidShowColor();
        _setMidHuePosition();
        _setMidTransPosition();
    }
    // 获取当前颜色RGB,hex,hsv和活动dom
    function _getCurrentVo(value) {
        var rgb = [];
        if (value && value.toUpperCase().substring(0, 1) == "#") {
            rgb = _PaletteUtil.color.HexToRGB(value);
        } else if (value && value.toUpperCase().substring(0, 3) == "RGB") {
            var _rgbArray = _PaletteUtil.color.RGBToArray(value);
            var hex = _PaletteUtil.color.RGBToHex(_rgbArray);
            rgb = _PaletteUtil.color.HexToRGB("#" + hex);
        } else {
            rgb = [255, 255, 255, 1];
        }
        var hex = _PaletteUtil.color.RGBToHex(rgb);
        var hsv = _PaletteUtil.color.RGBToHSV(rgb.slice(0, 3));
        _currentVo["RGB"] = rgb;
        _currentVo["HEX"] = hex;
        _currentVo["HSV"] = hsv;
        var left = hsv[1] / 100 * _PaletteCanvas.width;
        var top = (100 - hsv[2]) / 100 * _PaletteCanvas.height;
        _currentVo["POS"] = [left, top];
    }
    // 绘制彩虹条
    function _drawHue() {
        _HueCtx.save();
        var hueGradient = _HueCtx.createLinearGradient(0, 0, _HueCanvas.width, 0);
        hueGradient.addColorStop(0, "RGB(255, 0, 0)");
        hueGradient.addColorStop(0.17, "RGB(255, 255, 0)");
        hueGradient.addColorStop(0.34, "RGB(0, 255, 0)");
        hueGradient.addColorStop(0.51, "RGB(0, 255, 255)");
        hueGradient.addColorStop(0.68, "RGB(0, 0, 255)");
        hueGradient.addColorStop(0.85, "RGB(255, 0, 255)");
        hueGradient.addColorStop(1, "RGB(255, 0, 0)");
        _HueCtx.fillStyle = hueGradient;
        _HueCtx.beginPath();
        _HueCtx.rect(0, 0, _HueCanvas.width, _HueCanvas.height);
        _HueCtx.fill();
        _HueCtx.closePath();
        _HueCtx.restore();
    }
    // 绘制切换按钮
    function _drawChangeTriangle() {
        _BottomChangeCtx.save();
        _BottomChangeCtx.fillStyle = "#000";
        _BottomChangeCtx.beginPath();
        _BottomChangeCtx.moveTo(9, 4);
        _BottomChangeCtx.lineTo(12, 9);
        _BottomChangeCtx.lineTo(6, 9);
        _BottomChangeCtx.fill();
        _BottomChangeCtx.closePath();
        _BottomChangeCtx.beginPath();
        _BottomChangeCtx.moveTo(6, 12);
        _BottomChangeCtx.lineTo(12, 12);
        _BottomChangeCtx.lineTo(9, 17);
        _BottomChangeCtx.fill();
        _BottomChangeCtx.closePath();
        _BottomChangeCtx.restore();
    }
    // 绘制切换按钮
    function _drawChangeNoBack() {
        _BottomChangeCtx.clearRect(0, 0, _BottomChangeCanvas.width, _BottomChangeCanvas.height);
        _drawChangeTriangle();
    }
    // 绘制切换按钮
    function _drawChangeHasBack() {
        _BottomChangeCtx.clearRect(0, 0, _BottomChangeCanvas.width, _BottomChangeCanvas.height);
        _BottomChangeCtx.save();
        _BottomChangeCtx.fillStyle = "#ddd";
        _BottomChangeCtx.beginPath();
        _BottomChangeCtx.rect(0, 0, _BottomChangeCanvas.width, _BottomChangeCanvas.height);
        _BottomChangeCtx.fill();
        _BottomChangeCtx.closePath();
        _BottomChangeCtx.restore();
        _drawChangeTriangle();
    }
    // 自定义加号
    function _drawDefinePlus() {
        _BottomDefinePlusCtx.lineWidth = 2;
        _BottomDefinePlusCtx.strokeStyle = "gray";
        _BottomDefinePlusCtx.beginPath();
        _BottomDefinePlusCtx.moveTo(_BottomDefinePlusCanvas.width / 2, 0);
        _BottomDefinePlusCtx.lineTo(_BottomDefinePlusCanvas.width / 2, _BottomDefinePlusCanvas.height);
        _BottomDefinePlusCtx.stroke();
        _BottomDefinePlusCtx.closePath();
        _BottomDefinePlusCtx.beginPath();
        _BottomDefinePlusCtx.moveTo(0, _BottomDefinePlusCanvas.height / 2);
        _BottomDefinePlusCtx.lineTo(_BottomDefinePlusCanvas.width, _BottomDefinePlusCanvas.height / 2);
        _BottomDefinePlusCtx.stroke();
        _BottomDefinePlusCtx.closePath();
    }
    // 设置色盘
    function _setPalette() {
        _PaletteCtx.clearRect(0, 0, _PaletteCanvas.width, _PaletteCanvas.height);
        var hsv = _currentVo["HSV"];
        var h = Math.round(hsv[0]);
        var height = 1.1;
        _PaletteCtx.lineWidth = height * 3;
        for (var x = 0; x <= 100; x++) {
            var leftRgb = _PaletteUtil.color.HSVToRGB([h, 1, 100 - x]);
            var rightRgb = _PaletteUtil.color.HSVToRGB([h, 100, 100 - x]);
            _PaletteCtx.save();
            var lineGradient = _PaletteCtx.createLinearGradient(0, x * height, _PaletteCanvas.width, x * height);
            lineGradient.addColorStop(0, "#" + _PaletteUtil.color.RGBToHex(leftRgb));
            lineGradient.addColorStop(1, "#" + _PaletteUtil.color.RGBToHex(rightRgb));
            _PaletteCtx.strokeStyle = lineGradient;
            _PaletteCtx.beginPath();
            _PaletteCtx.moveTo(0, x * height);
            _PaletteCtx.lineTo(_PaletteCanvas.width, x * height);
            _PaletteCtx.stroke();
            _PaletteCtx.closePath();
            _PaletteCtx.restore();
        }
        _setTransparent();
    }
    // 设置透明度条
    function _setTransparent() {
        _TransparentCtx.clearRect(0, 0, _TransparentCanvas.width, _TransparentCanvas.height);
        _TransparentCtx.save();
        var cellWidth = _TransparentCanvas.height / 2;
        var size = Math.ceil(_TransparentCanvas.width / cellWidth);
        _TransparentCtx.save();
        for (var a = 0; a < 2; a++) {
            for (var b = 0; b < size; b++) {
                var ab = a + b;
                _TransparentCtx.fillStyle = (ab % 2 == 0 ? "#fff" : "#ddd");
                _TransparentCtx.beginPath();
                _TransparentCtx.rect(b * cellWidth, a * cellWidth, cellWidth, cellWidth);
                _TransparentCtx.fill();
                _TransparentCtx.closePath();
            }
        }
        _TransparentCtx.restore();
        var rgb = _currentVo["RGB"];
        var transGradient = _TransparentCtx.createLinearGradient(0, 0, _TransparentCanvas.width, 0);
        try {
            // IE 不识别透明度 会报 SyntaxError，捕获不处理
            transGradient.addColorStop(0, "RGB(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", 0)");
            transGradient.addColorStop(1, "RGB(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", 1)");
        } catch (e) {}
        _TransparentCtx.fillStyle = transGradient;
        _TransparentCtx.beginPath();
        _TransparentCtx.rect(0, 0, _TransparentCanvas.width, _TransparentCanvas.height);
        _TransparentCtx.fill();
        _TransparentCtx.closePath();
        _TransparentCtx.restore();
    }
    // 设置色盘选择器位置
    function _setPalettePosition() {
        _PaletteCircleDiv.style["left"] = (Number(_currentVo["POS"][0]) - 6) + "px";
        _PaletteCircleDiv.style["top"] = (Number(_currentVo["POS"][1]) - 6) + "px";
    }
    // 设置显示区域颜色
    function _setMidShowColor() {
        var cellWidth = 5;
        var sizeX = _MidShowCanvas.width / cellWidth;
        var sizeY = _MidShowCanvas.height / cellWidth;
        _MidShowCtx.clearRect(0, 0, _MidShowCanvas.width, _MidShowCanvas.height);
        _MidShowCtx.save();
        for (var a = 0; a < sizeX; a++) {
            for (var b = 0; b < sizeY; b++) {
                var ab = a + b;
                _MidShowCtx.fillStyle = (ab % 2 == 0 ? "#fff" : "#ddd");
                _MidShowCtx.beginPath();
                _MidShowCtx.rect(b * cellWidth, a * cellWidth, cellWidth, cellWidth);
                _MidShowCtx.fill();
                _MidShowCtx.closePath();
            }
        }
        _MidShowCtx.restore();
        _MidShowCtx.save();
        _MidShowCtx.fillStyle = "#" + _currentVo["HEX"];
        _MidShowCtx.beginPath();
        _MidShowCtx.rect(0, 0, _MidShowCanvas.width, _MidShowCanvas.height);
        _MidShowCtx.fill();
        _MidShowCtx.closePath();
        _MidShowCtx.restore();
    }
    // 设置彩虹条的位置
    function _setMidHuePosition() {
        var hsv = _currentVo["HSV"];
        var left = hsv[0] / 360 * _HueCanvas.width;
        // 获取彩虹条的doms
        _MidBarHueCircleDiv.style["left"] = (left - 7) + "px";
    }
    // 设置透明度条的位置
    function _setMidTransPosition() {
        var a = _currentVo["RGB"][3];
        a == undefined && (a = 1);
        var left = Math.round(a * _TransparentCanvas.width);
        // 获取透明度dom ,
        _MidBarTransCircleDiv.style["left"] = (left - 7) + "px";
    }
    // 设置底部信息
    function _setBottomInfo() {
        _BottomInputDiv.innerHTML = "";
        _BottomLabelSpan.innerHTML = _typeLabel;
        if (_typeLabel == "HEX") {
            _BottomHexInput.value = "#" + _currentVo["HEX"];
            _BottomInputDiv.appendChild(_BottomHexInput);
        } else {
            _BottomRInput.value = _currentVo["RGB"][0];
            _BottomGInput.value = _currentVo["RGB"][1];
            _BottomBInput.value = _currentVo["RGB"][2];
            _BottomAInput.value = _currentVo["RGB"][3];
            _BottomInputDiv.appendChild(_BottomRInput);
            _BottomInputDiv.appendChild(document.createTextNode(" - "));
            _BottomInputDiv.appendChild(_BottomGInput);
            _BottomInputDiv.appendChild(document.createTextNode(" - "));
            _BottomInputDiv.appendChild(_BottomBInput);
            _BottomInputDiv.appendChild(document.createTextNode(" - "));
            _BottomInputDiv.appendChild(_BottomAInput);
        }
    }
    // 色盘选择
    function _selectByPalette(left, top) {
        // 取色 H不变，S V变化，不通过getImageData，不准确
        var s = left / _PaletteCanvas.width * 100;
        var v = 100 - top / _PaletteCanvas.height * 100;
        _currentVo.HSV[1] = s;
        _currentVo.HSV[2] = v;
        var rgb = _PaletteUtil.color.HSVToRGB(_currentVo.HSV);
        // 设置活动dom
        _currentVo.RGB[0] = rgb[0];
        _currentVo.RGB[1] = rgb[1];
        _currentVo.RGB[2] = rgb[2];
        // 设置圆圈位置
        _currentVo["POS"] = [left, top];
        _setPalettePosition();
        // 设置底部信息
        _currentVo.HEX = _PaletteUtil.color.RGBToHex(_currentVo.RGB);
        _setBottomInfo();
        // 设置色卡颜色
        _setMidShowColor();
        // 设置透明度条颜色
        _setTransparent()
        // 设置原始input值
        _currentVo.target.value = "#" + _currentVo.HEX;
        // 执行方法
        _fire();
    }
    // 彩虹条选择
    function _selectByHue(left) {
        var h = left / _HueCanvas.width * 360;
        _currentVo.HSV[0] = h;
        // 保留透明度
        var a = _currentVo.RGB[3];
        // 生成新的RGB,HEX
        _currentVo.RGB = _PaletteUtil.color.HSVToRGB(_currentVo.HSV);
        _currentVo.RGB.push(a);
        _currentVo.HEX = _PaletteUtil.color.RGBToHex(_currentVo.RGB);
        // 色盘 透明度重置
        _setPalette();
        // 彩虹条位置调整
        _setMidHuePosition();
        // 设置色卡颜色和底部信息
        _setMidShowColor();
        _setBottomInfo();
        // 设置原始input值
        _currentVo.target.value = "#" + _currentVo.HEX;
        // 执行方法
        _fire();
    }
    // 透明度选择
    function _selectByTrans(left) {
        var a = left / _TransparentCanvas.width;
        _currentVo.RGB[3] = Number(a).toFixed(2);
        _currentVo.HEX = _PaletteUtil.color.RGBToHex(_currentVo.RGB);
        // 设置透明度条
        _setMidTransPosition();
        // 设置色卡颜色和底部信息
        _setMidShowColor();
        _setBottomInfo();
        // 设置原始input值
        _currentVo.target.value = "#" + _currentVo.HEX;
        // 执行方法
        _fire();
    }
    // HEX输入
    function _bottomInput() {
        var value = "";
        if (_typeLabel == "HEX") {
            value = _BottomHexInput.value;
        } else {
            value = "rgb(" + _BottomRInput.value + "," + _BottomGInput.value + "," + _BottomBInput.value + "," + _BottomAInput.value + ")";
        }
        _setColorDetail(value);
        // 设置原始input值
        _currentVo.target.value = "#" + _currentVo.HEX;
        // 执行方法
        _fire();
    }
    // 切换显示类型
    function _changeBottomType() {
        _typeLabel = (_typeLabel == "HEX") ? "RGBA" : "HEX";
        _setBottomInfo();
    }
    // 色块单击改变
    function _changeByModel(color) {
        _setColorDetail(color);
        _setBottomInfo();
        // 设置原始input值
        _currentVo.target.value = "#" + _currentVo.HEX;
        // 执行方法
        _fire();
    }
    // 添加自定义色块 一共9个child，不算加号，最多8个自定义颜色
    function _addUserDefinedColor() {
        var childCount = _BottomDefineOutDiv.childElementCount;
        if (childCount == 9) {
            return;
        }
        var modelDiv = _PaletteDom.getBottomQuickModelDiv("#" + _currentVo.HEX);
        _BottomDefineOutDiv.insertBefore(modelDiv, _BottomDefinePlusCanvas);
        // 绑定色块单击事件
        modelDiv.addEventListener("click", function () {
            _PaletteEvent.modelDivClickEvent.apply(this, [_changeByModel]);
        });
        // 绑定右键删除事件
        modelDiv.addEventListener("contextmenu", function () {
            _PaletteEvent.modelDivContextMenuEvent.apply(this);
        });
    }
}
/**
 * 事件类
 */
du.yue.PaletteEvent = function () {
    var _PaletteUtil = du.yue.PaletteUtil;
    var _paletteDragVo = {}; // 色盘drag对象
    var _hueDragVo = {}; // 彩虹条drag对象
    var _transDragVo = {}; // 透明条drag对象
    // 对外暴露接口
    Object.defineProperties(this, {
        docMouseDownEvent: {
            writable: false,
            value: _docMouseDownEvent
        },
        outDivMouseDownEvent: {
            writable: false,
            value: _outDivMouseDownEvent
        },
        outDivContextMenuEvent: {
            writable: false,
            value: _outDivContextMenuEvent
        },
        paletteOutDivMouseDownEvent: {
            writable: false,
            value: _paletteOutDivMouseDownEvent
        },
        midBarHueOutDivMouseDownEvent: {
            writable: false,
            value: _midBarHueOutDivMouseDownEvent
        },
        midBarTransOutDivMouseDownEvent: {
            writable: false,
            value: _midBarTransOutDivMouseDownEvent
        },
        docMouseUpEvent: {
            writable: false,
            value: _docMouseUpEvent
        },
        docMouseMoveEvent: {
            writable: false,
            value: _docMouseMoveEvent
        },
        bottomInputEvent: {
            writable: false,
            value: _bottomInputEvent
        },
        bottomChangeCanvasClickEvent: {
            writable: false,
            value: _bottomChangeCanvasClickEvent
        },
        bottomChangeCanvasMouseEnterEvent: {
            writable: false,
            value: _bottomChangeCanvasMouseEnterEvent
        },
        bottomChangeCanvasMouseLeaveEvent: {
            writable: false,
            value: _bottomChangeCanvasMouseLeaveEvent
        },
        modelDivClickEvent: {
            writable: false,
            value: _modelDivClickEvent
        },
        modelDivContextMenuEvent: {
            writable: false,
            value: _modelDivContextMenuEvent
        },
        bottomDefinePlusCanvasClickEvent: {
            writable: false,
            value: _bottomDefinePlusCanvasClickEvent
        }
    });
    // 加号单击
    function _bottomDefinePlusCanvasClickEvent() {
        arguments[0].call();
    }
    // 色块单击
    function _modelDivClickEvent() {
        var color = this.style["background-color"];
        arguments[0].call(null, color);
    }
    // 自定义色块右键
    function _modelDivContextMenuEvent() {
        this.parentElement.removeChild(this);
    }
    // 切换显示类型
    function _bottomChangeCanvasClickEvent() {
        var e = _PaletteUtil.event.getEvent(event);
        // 禁止默认事件
        _PaletteUtil.event.preventDefault(e);
        arguments[0].call();
    }

    function _bottomChangeCanvasMouseEnterEvent() {
        arguments[0].call();
    }

    function _bottomChangeCanvasMouseLeaveEvent() {
        arguments[0].call();
    }
    // hex改变事件
    function _bottomInputEvent() {
        arguments[0].call();
    }
    // 色盘鼠标按下
    function _paletteOutDivMouseDownEvent() {
        var e = _PaletteUtil.event.getEvent(event);
        // 禁止默认事件
        _PaletteUtil.event.preventDefault(e);
        var clientX = e.clientX;
        var clientY = e.clientY;
        var thisLeft = this.getBoundingClientRect().left;
        var thisTop = this.getBoundingClientRect().top;
        var left = clientX - thisLeft;
        var top = clientY - thisTop;
        arguments[0].call(null, left, top);
        // 开启drag
        _paletteDragVo.flag = true;
    }
    // 彩虹条鼠标按下
    function _midBarHueOutDivMouseDownEvent() {
        var e = _PaletteUtil.event.getEvent(event);
        // 禁止默认事件
        _PaletteUtil.event.preventDefault(e);
        var clientX = e.clientX;
        var bbox = this.getBoundingClientRect();
        var x = clientX < bbox.left ? 0 : clientX > bbox.right ? bbox.width : (clientX - bbox.left);
        arguments[0].call(null, x);
        // 开启drag
        _hueDragVo.flag = true;
    }
    // 透明度条鼠标按下
    function _midBarTransOutDivMouseDownEvent() {
        var e = _PaletteUtil.event.getEvent(event);
        // 禁止默认事件
        _PaletteUtil.event.preventDefault(e);
        var clientX = e.clientX;
        var bbox = this.getBoundingClientRect();
        var x = clientX < bbox.left ? 0 : clientX > bbox.right ? bbox.width : (clientX - bbox.left);
        arguments[0].call(null, x);
        // 开启drag
        _transDragVo.flag = true;
    }
    // doc鼠标按下事件  [_start, _className, _OutDiv, _setColor]
    function _docMouseDownEvent() {
        var _start = arguments[0];
        if (!_start) {
            return;
        }
        var _OutDiv = arguments[2];
        var e = _PaletteUtil.event.getEvent(event);
        var target = _PaletteUtil.event.getTarget(e);
        // 判断input type='text'
        var tagName = target.tagName;
        var type = target.type;
        if (!tagName || tagName.toLowerCase() != "input" || !type || type.toLowerCase() != "text") {
            // 隐藏弹框
            document.body.contains(_OutDiv) && document.body.removeChild(_OutDiv);
            return;
        }
        // 判断class
        var classList = target.className.split(" ");
        var _className = arguments[1];
        var index = classList.indexOf(_className);
        if (index < 0) {
            // 隐藏弹框
            document.body.contains(_OutDiv) && document.body.removeChild(_OutDiv);
            return;
        }
        document.body.appendChild(_OutDiv);
        // 确定弹框位置
        var top = target.offsetTop + target.offsetHeight;
        _OutDiv.style["top"] = top + "px";
        var winWidth = document.body.scrollWidth;
        var targetLeft = target.offsetLeft;
        var targetWidth = target.offsetWidth;
        var outDivWidth = parseInt(_OutDiv.style["width"].replace("px", ""));
        if ((targetLeft + outDivWidth) <= winWidth) {
            _OutDiv.style["left"] = targetLeft + "px";
        } else {
            _OutDiv.style["left"] = (winWidth - outDivWidth - 10) + "px";
        }
        arguments[3].call(target);
    }
    // doc鼠标移动事件
    function _docMouseMoveEvent() {
        var e = _PaletteUtil.event.getEvent(event);
        _paletteDragVo.flag && _paletteMouseMoveEvent.call(this, e, arguments[0]);
        _hueDragVo.flag && _hueMouseMoveEvent.call(this, e, arguments[1]);
        _transDragVo.flag && _transMouseMoveEvent.call(this, e, arguments[2]);
    }
    // 色盘鼠标移动事件
    function _paletteMouseMoveEvent(e, _PaletteVo) {
        // 禁止默认事件
        _PaletteUtil.event.preventDefault(e);
        var eventDom = _PaletteVo.eventDom;
        var bbox = eventDom.getBoundingClientRect();
        var clientX = e.clientX;
        var clientY = e.clientY;
        var x = clientX < bbox.left ? 0 : clientX > bbox.right ? bbox.width : (clientX - bbox.left);
        var y = clientY < bbox.top ? 0 : clientY > bbox.bottom ? bbox.height : (clientY - bbox.top);
        _PaletteVo.callBack.call(null, x, y);
    }
    // 彩虹条鼠标移动事件
    function _hueMouseMoveEvent(e, _HueVo) {
        // 禁止默认事件
        _PaletteUtil.event.preventDefault(e);
        var eventDom = _HueVo.eventDom;
        var bbox = eventDom.getBoundingClientRect();
        var clientX = e.clientX;
        var x = clientX < bbox.left ? 0 : clientX > bbox.right ? bbox.width : (clientX - bbox.left);
        _HueVo.callBack.call(null, x);
    }
    // 透明度条鼠标移动事件
    function _transMouseMoveEvent(e, _TransparentVo) {
        // 禁止默认事件
        _PaletteUtil.event.preventDefault(e);
        var eventDom = _TransparentVo.eventDom;
        var bbox = eventDom.getBoundingClientRect();
        var clientX = e.clientX;
        var x = clientX < bbox.left ? 0 : clientX > bbox.right ? bbox.width : (clientX - bbox.left);
        _TransparentVo.callBack.call(null, x);
    }
    // doc鼠标弹起
    function _docMouseUpEvent() {
        // 停止drag
        _paletteDragVo.flag && (_paletteDragVo.flag = false);
        _hueDragVo.flag && (_hueDragVo.flag = false);
        _transDragVo.flag && (_transDragVo.flag = false);
    }
    // 最外框阻止冒泡
    function _outDivMouseDownEvent() {
        var e = _PaletteUtil.event.getEvent(event);
        _PaletteUtil.event.stopPropagation(e);
    }
    // 最外框阻止右键默认事件
    function _outDivContextMenuEvent() {
        return false;
    }
}
/**
 * dom类
 */
du.yue.PaletteDom = function () {
    var _PaletteUtil = du.yue.PaletteUtil;
    Object.defineProperties(this, {
        getOutDiv: {
            writable: false,
            value: _getOutDiv
        },
        getPaletteOutDiv: {
            writable: false,
            value: _getPaletteOutDiv
        },
        getPaletteInnDiv: {
            writable: false,
            value: _getPaletteInnDiv
        },
        getPaletteCanvas: {
            writable: false,
            value: _getPaletteCanvas
        },
        getPaletteCircleDiv: {
            writable: false,
            value: _getPaletteCircleDiv
        },
        getMidOutDiv: {
            writable: false,
            value: _getMidOutDiv
        },
        getMidShowCanvas: {
            writable: false,
            value: _getMidShowCanvas
        },
        getMidBarOutDiv: {
            writable: false,
            value: _getMidBarOutDiv
        },
        getMidBarHueOutDiv: {
            writable: false,
            value: _getMidBarHueOutDiv
        },
        getMidBarCircleDiv: {
            writable: false,
            value: _getMidBarCircleDiv
        },
        getMidBarHueDiv: {
            writable: false,
            value: _getMidBarHueDiv
        },
        getMidBarHueCanvas: {
            writable: false,
            value: _getMidBarHueCanvas
        },
        getBottomOutDiv: {
            writable: false,
            value: _getBottomOutDiv
        },
        getBottomLabelDiv: {
            writable: false,
            value: _getBottomLabelDiv
        },
        getBottomInputDiv: {
            writable: false,
            value: _getBottomInputDiv
        },
        getBottomHexInput: {
            writable: false,
            value: _getBottomHexInput
        },
        getBottomRGBInput: {
            writable: false,
            value: _getBottomRGBInput
        },
        getBottomLabelSpan: {
            writable: false,
            value: _getBottomLabelSpan
        },
        getBottomChangeDiv: {
            writable: false,
            value: _getBottomChangeDiv
        },
        getBottomChangeCanvas: {
            writable: false,
            value: _getBottomChangeCanvas
        },
        getBottomQuickOutDiv: {
            writable: false,
            value: _getBottomQuickOutDiv
        },
        getBottomQuickModelOutDiv: {
            writable: false,
            value: _getBottomQuickModelOutDiv
        },
        getBottomQuickModelDiv: {
            writable: false,
            value: _getBottomQuickModelDiv
        },
        getBottomDefineOutDiv: {
            writable: false,
            value: _getBottomDefineOutDiv
        },
        getBottomDefinePlusCanvas: {
            writable: false,
            value: _getBottomDefinePlusCanvas
        },

    });

    function _$c(tagName) {
        return document.createElement(tagName);
    }
    // 创建最外框DIV --
    function _getOutDiv() {
        var div = _$c("div");
        div.style["position"] = "absolute";
        div.style["width"] = "220px";
        div.style["height"] = "282px";
        // div.style["border"] = "1px solid #d0d0d0";
        div.style["overflow"] = "hidden";
        div.style["background-color"] = "#fff";
        div.style["position"] = "absolute";
        div.style["z-index"] = "999999";
        div.style["box-shadow"] = "1px 1px 5px #aaa";
        return div;
    }
    // 创建色盘包裹DIV
    function _getPaletteOutDiv() {
        var div = _$c("div");
        div.style["position"] = "relative";
        div.style["width"] = "220px";
        div.style["height"] = "111px";
        div.style["overflow"] = "hidden";
        return div;
    }
    // 创建选择圆圈
    function _getPaletteCircleDiv() {
        var div = _$c("div");
        div.style["position"] = "absolute";
        div.style["z-index"] = "1";
        div.style["width"] = "10px";
        div.style["height"] = "10px";
        div.style["border"] = "1px solid #ffffff";
        div.style["border-radius"] = "50px";
        return div;
    }
    // 色盘内包裹
    function _getPaletteInnDiv() {
        var div = _$c("div");
        div.style["width"] = "220px";
        div.style["height"] = "111px";
        return div;
    }
    // 创建色盘
    function _getPaletteCanvas() {
        var canvas = _$c("canvas");
        canvas.innerHTML = "Your browser is not support canvas";
        canvas.width = 220;
        canvas.height = 111;
        return canvas;
    }
    // 创建中间区域外框
    function _getMidOutDiv() {
        var div = _$c("div");
        div.style["width"] = "220px";
        div.style["height"] = "50px";
        return div;
    }
    // 创建显示色卡
    function _getMidShowCanvas() {
        var canvas = _$c("canvas");
        canvas.width = 35;
        canvas.height = 35;
        canvas.style["float"] = "left";
        canvas.style["margin"] = "5px 8px 0px 8px";
        canvas.style["border-radius"] = "50px";
        canvas.style["border"] = "1px solid #d0d0d0";
        return canvas;
    }
    // 创建条形包裹
    function _getMidBarOutDiv() {
        var div = _$c("div");
        div.style["float"] = "left";
        div.style["width"] = "150px";
        div.style["height"] = "50px";
        return div;
    }
    // 创建彩虹条外框
    function _getMidBarHueOutDiv() {
        var div = _$c("div");
        div.style["position"] = "relative";
        div.style["width"] = "150px";
        div.style["height"] = "10px";
        div.style["margin"] = "8px 0px 0px 4px";
        // div.style["border"] = "1px solid #dadada";
        return div;
    }
    // 创建彩虹条和透明度选择圆圈
    function _getMidBarCircleDiv() {
        var div = _$c("div");
        div.style["position"] = "absolute";
        div.style["top"] = "-2px";
        div.style["z-index"] = "1";
        div.style["width"] = "12px";
        div.style["height"] = "12px";
        div.style["border"] = "1px solid #a9a9a9";
        div.style["border-radius"] = "50px";
        div.style["background-color"] = "#fff";
        return div;
    }
    // 创建彩虹条包裹
    function _getMidBarHueDiv() {
        var div = _$c("div");
        div.style["position"] = "relative";
        div.style["width"] = "150px";
        div.style["height"] = "10px";
        return div;
    }
    // 创建彩虹条和透明度canvas
    function _getMidBarHueCanvas() {
        var canvas = _$c("canvas");
        canvas.innerHTML = "Your browser is not support canvas";
        canvas.style["position"] = "absolute";
        canvas.width = 150;
        canvas.height = 10;
        return canvas;
    }
    // 创建显示栏
    function _getBottomOutDiv() {
        var div = _$c("div");
        div.style["width"] = "220px";
        div.style["height"] = "50px";
        return div;
    }
    // 创建输入包裹框
    function _getBottomInputDiv() {
        var div = _$c("div");
        div.style["float"] = "left";
        div.style["width"] = "195px";
        div.style["height"] = "30px";
        div.style["text-align"] = "center";
        return div;
    }
    // 创建输入框
    function _getBottomHexInput() {
        var ipt = _$c("input");
        ipt.type = "text";
        ipt.style["text-align"] = "center";
        ipt.style["color"] = "#464646";
        ipt.style["background-color"] = "#fff";
        ipt.style["width"] = "180px";
        ipt.style["height"] = "20px";
        ipt.style["line-height"] = "20px";
        ipt.style["font-size"] = "12px";
        ipt.style["font-family"] = "Consolas";
        ipt.style["border"] = "1px solid #d0d0d0";
        ipt.setAttribute("maxlength", "9");
        return ipt;
    }
    // 创建输入框
    function _getBottomRGBInput() {
        var ipt = _$c("input");
        ipt.type = "text";
        ipt.style["text-align"] = "center";
        ipt.style["color"] = "#464646";
        ipt.style["background-color"] = "#fff";
        ipt.style["width"] = "30px";
        ipt.style["height"] = "20px";
        ipt.style["line-height"] = "20px";
        ipt.style["font-size"] = "12px";
        ipt.style["font-family"] = "Consolas";
        ipt.style["border"] = "1px solid #d0d0d0";
        ipt.setAttribute("maxlength", "3");
        return ipt;
    }
    // 创建显示类型
    function _getBottomLabelDiv() {
        var div = _$c("div");
        div.style["float"] = "left";
        div.style["width"] = "195px";
        div.style["height"] = "20px";
        div.style["text-align"] = "center";
        div.style["font-size"] = "12px";
        div.style["color"] = "#9d9d9d";
        return div;
    }
    // 创建显示类型文字
    function _getBottomLabelSpan() {
        var span = _$c("span");
        return span;
    }
    // 创建切换标签
    function _getBottomChangeDiv() {
        var div = _$c("div");
        div.style["float"] = "right";
        div.style["width"] = "23px";
        div.style["height"] = "40px";
        return div;
    }
    // 创建切换canvas
    function _getBottomChangeCanvas() {
        var canvas = _$c("canvas");
        canvas.innerHTML = "Your browser is not support canvas";
        canvas.width = 18;
        canvas.height = 22;
        canvas.style["margin-top"] = "13px";
        canvas.style["margin-left"] = "-2px";
        return canvas;
    }
    // 快速色块选择区
    function _getBottomQuickOutDiv() {
        var div = _$c("div");
        div.style["width"] = "220px";
        div.style["height"] = "68px";
        div.style["border-top"] = "1px solid #ddd";
        return div;
    }
    // 样例色块包裹
    function _getBottomQuickModelOutDiv() {
        var div = _$c("div");
        div.style["width"] = "220px";
        div.style["height"] = "46px";
        div.style["margin-left"] = "5px";
        return div;
    }
    // 样例色块
    function _getBottomQuickModelDiv(rgb) {
        var div = _$c("div");
        div.style["float"] = "left";
        div.style["width"] = "11px";
        div.style["height"] = "11px";
        div.style["margin"] = "5px 5px 5px 5px";
        div.style["border-radius"] = "3px";
        div.style["border"] = "1px solid #ddd";
        div.style["overflow"] = "hidden";
        div.style["background-color"] = rgb;
        return div;
    }
    // 自定义色块包裹
    function _getBottomDefineOutDiv() {
        var div = _$c("div");
        div.style["width"] = "220px";
        div.style["height"] = "23px";
        div.style["margin-left"] = "5px";
        return div;
    }
    // 自定义色块 + 号
    function _getBottomDefinePlusCanvas() {
        var canvas = _$c("canvas");
        canvas.innerHTML = "Your browser is not support canvas";
        canvas.width = 11;
        canvas.height = 11;
        canvas.style["float"] = "left";
        canvas.style["margin"] = "6px 6px 6px 6px";
        canvas.style["border-radius"] = "3px";
        return canvas;
    }
}
/**
 * 工具类
 */
du.yue.PaletteUtil = {
    // 事件工具
    event: {
        getEvent: function (event) {
            return event ? event : window.event;
        },
        getTarget: function (event) {
            return event.target || event.srcElement;
        },
        preventDefault: function (event) {
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
        },
        stopPropagation: function (event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
        },
        fire: function (target, eventName) {
            if (document.createEventObject) {
                var evt = document.createEventObject();
                target.fireEvent("on" + eventName, evt);
            } else {
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent(eventName, true, true);
                target.dispatchEvent(evt);
            }
        }
    },
    // 颜色转换
    color: {
        HSVToRGB: function (hsv) {
            var h = hsv[0];
            var s = hsv[1];
            var v = hsv[2];
            if (h == undefined || isNaN(h) || h < 0 || h > 360) {
                throw "H must be a number, greater than 0 and less than 360";
                return;
            }
            if (s == undefined || isNaN(s) || s < 0 || s > 100) {
                throw "S must be a number, greater than 0 and less than 100";
                return;
            }
            if (v == undefined || isNaN(v) || v < 0 || v > 100) {
                throw "V must be a number, greater than 0 and less than 100";
                return;
            }
            s = s / 100;
            v = v / 100;
            var c = v * s;
            var x = c * (1 - Math.abs((h / 60) % 2 - 1));
            var m = v - c;
            var _rgb = [];
            if (h >= 0 && h < 60) {
                _rgb = [c, x, 0];
            } else if (h >= 60 && h < 120) {
                _rgb = [x, c, 0];
            } else if (h >= 120 && h < 180) {
                _rgb = [0, c, x];
            } else if (h >= 180 && h < 240) {
                _rgb = [0, x, c];
            } else if (h >= 240 && h < 300) {
                _rgb = [x, 0, c];
            } else {
                _rgb = [c, 0, x];
            }
            return [Math.round((_rgb[0] + m) * 255), Math.round((_rgb[1] + m) * 255), Math.round((_rgb[2] + m) * 255)];
        },
        RGBToHSV: function (rgb) {
            var r = rgb[0];
            var g = rgb[1];
            var b = rgb[2];
            // 错误判断
            (r == undefined || isNaN(r) || r > 255) && (r = 255);
            (r < 0) && (r = 0);
            (g == undefined || isNaN(g) || g > 255) && (g = 255);
            (g < 0) && (g = 0);
            (b == undefined || isNaN(b) || b > 255) && (b = 255);
            (b < 0) && (b = 0);
            // 计算
            var _r = r / 255;
            var _g = g / 255;
            var _b = b / 255;
            var cMax = Math.max(_r, _g, _b);
            var cMin = Math.min(_r, _g, _b);
            var x = cMax - cMin;
            var hsv = [];
            // H
            if (x == 0) {
                hsv[0] = 0;
            } else if (cMax == _r && _g >= _b) {
                hsv[0] = (x == 0 ? 0 : (60 * (_g - _b) / x));
            } else if (cMax == _r && _g < _b) {
                hsv[0] = (x == 0 ? 0 : (60 * (_g - _b) / x) + 360);
            } else if (cMax == _g) {
                hsv[0] = (x == 0 ? 0 : (60 * (((_b - _r) / x) + 2)));
            } else if (cMax == _b) {
                hsv[0] = (x == 0 ? 0 : (60 * (((_r - _g) / x) + 4)));
            }
            // S
            if (cMax == 0) {
                hsv[1] = 0;
            } else {
                hsv[1] = (cMax == 0 ? 0 : (x / cMax * 100));
            }
            // V
            hsv[2] = (cMax * 100);
            return hsv;
        },
        HexToRGB: function (hex) {
            var _hex = [];
            hex = hex && hex.trim();
            if (hex.substring(0, 1) == "#") {
                hex = hex.substr(1, hex.length).replace(/\s*/g, "");
            } else {
                return [255, 255, 255, 1];
            }
            switch (hex.length) {
                case 0:
                    return [255, 255, 255, 1];
                    break;
                case 1:
                    _hex = [hex + hex, hex + hex, hex + hex, "FF"];
                    break;
                case 2:
                    _hex = [hex, hex, hex, "FF"];
                    break;
                case 3:
                    var arr = hex.split('');
                    _hex = [arr[0] + arr[0], arr[1] + arr[1], arr[2] + arr[2], "FF"];
                    break;
                case 4:
                    var arr = hex.split('');
                    _hex = [arr[0] + arr[0], arr[1] + arr[1], arr[2] + arr[2], arr[3] + arr[3]];
                    break;
                case 4:
                    var arr = hex.split('');
                    _hex = [arr[0] + arr[0], arr[1] + arr[1], arr[2] + arr[2], arr[3] + arr[3]];
                    break;
                case 5:
                    var arr = hex.split('');
                    _hex = [arr[0] + arr[0], arr[1] + arr[1], arr[2] + arr[2], arr[3] + arr[4]];
                    break;
                case 6:
                    var arr = hex.split('');
                    _hex = [arr[0] + arr[1], arr[2] + arr[3], arr[4] + arr[5], "FF"];
                    break;
                case 7:
                    var arr = hex.split('');
                    _hex = [arr[0] + arr[1], arr[2] + arr[3], arr[4] + arr[5], arr[6] + arr[6]];
                    break;
                default:
                    var arr = hex.split('');
                    _hex = [arr[0] + arr[1], arr[2] + arr[3], arr[4] + arr[5], arr[6] + arr[7]];
                    break;
            }
            var r = parseInt("0x" + _hex[0]);
            r = isNaN(r) ? 255 : r;
            var g = parseInt("0x" + _hex[1]);
            g = isNaN(g) ? 255 : g;
            var b = parseInt("0x" + _hex[2]);
            b = isNaN(b) ? 255 : b;
            var a = parseInt("0x" + _hex[3]);
            a = isNaN(a) ? 1 : Number(Number(a / 255).toFixed(2));
            return [r, g, b, a];
        },
        RGBToHex: function (rgb) {
            var _rgb = (rgb instanceof Array) ? rgb : this.RGBToArray(rgb);
            var _hex = [];
            for (var x = 0; x < 3; x++) {
                var y = _rgb[x];
                if (isNaN(Number(y))) {
                    _hex[x] = "FF";
                } else {
                    var _y = Number(y).toString(16);
                    _hex[x] = _y.length == 1 ? "0" + _y : _y;
                }
            }
            // 透明度单独处理
            if (!isNaN(Number(_rgb[3]))) {
                var a = Math.floor(Number(_rgb[3]) * 255);
                if (a != 255) {
                    a = a.toString(16).toUpperCase();
                    _hex[3] = a.length == 1 ? "0" + a : a;
                }
            }
            return _hex.join("").toUpperCase();
        },
        RGBToArray: function (rgb) {
            var _rgb = [];
            rgb = rgb && rgb.trim().toUpperCase();
            if (rgb.substring(0, 4) == "RGBA") {
                _rgb = rgb.replace("RGBA(", "").replace(")", "").replace(/\s*/g, "").split(",");
            } else if (rgb.substring(0, 3) == "RGB") {
                _rgb = rgb.replace("RGB(", "").replace(")", "").replace(/\s*/g, "").split(",");
            } else {
                _rgb = [255, 255, 255, 1];
            }
            return _rgb;
        }
    }
}

var PaletteTopVo = new du.yue.PaletteTop();
PaletteTopVo.start("palette");