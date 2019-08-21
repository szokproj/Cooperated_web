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
        var x = clientX < b