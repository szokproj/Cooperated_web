'use strict';

function RTLS_Canvas(number) {
    let cvsBlock = document.getElementById("cvsBlock" + number),
        canvas = document.getElementById("canvas" + number),
        ctx = canvas.getContext("2d"),
        coordinate = {
            x: document.getElementById("x" + number),
            y: document.getElementById("y" + number)
        },
        restore = {
            btn: document.getElementById("btn_restore" + number),
            label: document.getElementById("label_restore" + number)
        },
        visibleScale = document.getElementById("scale_visible" + number),
        visibleMapName = document.getElementById("visible_map_name" + number),
        inputMapList = document.getElementById("input_map_list" + number),
        closeMap = document.getElementById("btn_close" + number),
        serverImg = new Image(),
        canvasImg = {
            isLoad: false,
            width: 0,
            height: 0,
            scale: 1 //預設比例尺為1:1
        },
        Map_id = "",
        anchorArray = [],
        fenceList = {},
        isFitWindow = true,
        // View parameters
        lastX = 0, //滑鼠最後位置的X座標
        lastY = 0, //滑鼠最後位置的Y座標
        xleftView = 0, //canvas的X軸位移(負值向左，正值向右)
        ytopView = 0, //canvas的Y軸位移(負值向上，正值向下)
        Zoom = 1.0, //縮放比例
        PIXEL_RATIO = (function () {
            let dpr = window.devicePixelRatio || 1,
                bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
            return dpr / bsr;
        })(),
        mouse = {
            canvasLeft: 0,
            canvasTop: 0,
            downX: 0,
            downY: 0
        },
        adjust = {
            setCanvas: function (img_src, width, height) {
                canvas.style.backgroundImage = "url(" + img_src + ")";
                canvas.style.backgroundSize = width + "px " + height + "px";
                canvas.width = width * PIXEL_RATIO;
                canvas.height = height * PIXEL_RATIO;
                canvas.style.width = width + 'px';
                canvas.style.height = height + 'px';
            },
            setSize: function () { //縮放canvas與背景圖大小
                if (canvasImg.isLoad) {
                    canvas.style.backgroundSize = (canvasImg.width * Zoom) + "px " + (canvasImg.height * Zoom) + "px";
                    canvas.width = canvasImg.width * PIXEL_RATIO * Zoom;
                    canvas.height = canvasImg.height * PIXEL_RATIO * Zoom;
                    canvas.style.width = canvasImg.width * Zoom + 'px';
                    canvas.style.height = canvasImg.height * Zoom + 'px';
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
                    ctx.scale(Zoom, Zoom);
                    ctx.translate(0, 0);
                }
            },
            restoreCanvas: function () {
                if (canvasImg.isLoad) {
                    let cvsBlock_width = parseFloat(cvsBlock.clientWidth),
                        cvsBlock_height = parseFloat(cvsBlock.clientHeight);
                    xleftView = 0;
                    ytopView = 0;
                    Zoom = 1.0;
                    if (isFitWindow) {
                        isFitWindow = false; //目前狀態:原比例
                        ctx.restore();
                        ctx.save();
                        restore.label.innerHTML = "<i class=\"fas fa-expand\"" +
                            " style='font-size:20px;' title=\"" + $.i18n.prop('i_fit_window') + "\"></i>";
                    } else {
                        isFitWindow = true; //目前狀態:依比例拉伸(Fit in Window)
                        if ((serverImg.width / serverImg.height) > (cvsBlock_width / cvsBlock_height)) //原圖比例寬邊較長
                            Zoom = (cvsBlock_width / serverImg.width).toFixed(2);
                        else
                            Zoom = (cvsBlock_height / serverImg.height).toFixed(2);
                        restore.label.innerHTML = "<i class=\"fas fa-compress\"" +
                            " style='font-size:20px;' title=\"" + $.i18n.prop('i_restore_scale') + "\"></i>";
                    }
                    canvas.style.marginLeft = "0px";
                    canvas.style.marginTop = "0px";
                    draw();
                }
            },
            focusCenter: function (x, y) {
                if (display_setting.lock_window) {
                    let cvsBlock_width = parseFloat(cvsBlock.clientWidth),
                        cvsBlock_height = parseFloat(cvsBlock.clientHeight),
                        focus_x = cvsBlock_width / 2 - parseFloat(x) * Zoom,
                        focus_y = cvsBlock_height / 2 - parseFloat(y) * Zoom;
                    canvas.style.marginLeft = focus_x + "px";
                    canvas.style.marginTop = focus_y + "px";
                }
            },
            unlockFocusCenter: function () { //解除定位
                if (display_setting.lock_window) {
                    let cvsBlock_width = parseFloat(cvsBlock.clientWidth),
                        cvsBlock_height = parseFloat(cvsBlock.clientHeight);
                    xleftView = 0; //恢復原比例
                    ytopView = 0;
                    Zoom = 1.0;
                    ctx.restore();
                    ctx.save();
                    isFitWindow = false;
                    canvas.style.marginLeft = "0px";
                    canvas.style.marginTop = "0px";
                    if ((serverImg.width / serverImg.height) > (cvsBlock_width / cvsBlock_height)) //原圖比例寬邊較長
                        Zoom = (cvsBlock_width / serverImg.width).toFixed(2);
                    else
                        Zoom = (cvsBlock_height / serverImg.height).toFixed(2);
                    adjust.setSize();
                }
            },
            resetCanvas_Anchor: function () {
                cvsBlock.style.background = 'rgb(185, 185, 185)';
                canvasImg.isPutImg = false;
                canvasImg.width = 0;
                canvasImg.height = 0;
                canvasImg.scale = 1;
                adjust.setCanvas("", 1, 1);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                xleftView = 0;
                ytopView = 0;
                Zoom = 1.0;
                Map_id = "";
                visibleMapName.innerText = "";
                visibleScale.innerText = "";
                coordinate.x.innerText = "";
                coordinate.y.innerText = "";
                changeMapToCookie(parseInt(number, 10) - 1, "");
                anchorArray = [];
            }
        },
        get = {
            anchors: function (map_id) {
                anchorArray = [];
                //get anchor
                const jr = JSON.stringify({
                    "Command_Type": ["Read"],
                    "Command_Name": ["GetAnchorsInMap"],
                    "Value": {
                        "map_id": map_id
                    },
                    "api_token": [token]
                });
                let jxh = createJsonXmlHttp("sql");
                jxh.onreadystatechange = function () {
                    if (jxh.readyState == 4 || jxh.readyState == "complete") {
                        let revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                            let anchorList = revObj.Value[0].Values,
                                x, y;
                            for (let i in anchorList) {
                                x = anchorList[i].set_x / canvasImg.scale;
                                y = canvasImg.height - anchorList[i].set_y / canvasImg.scale; //因為Server回傳的座標為左下原點
                                anchorArray.push({
                                    id: anchorList[i].anchor_id,
                                    type: "",
                                    x: x,
                                    y: y
                                });
                                drawAnchor(ctx, anchorList[i].anchor_id, "", x, y, dot_size.anchor, 1 / Zoom); //畫出點的設定
                            }
                        }
                    }
                };
                jxh.send(jr);
                //get main anchor
                const jr_main = JSON.stringify({
                    "Command_Type": ["Read"],
                    "Command_Name": ["GetMainAnchorsInMap"],
                    "Value": {
                        "map_id": map_id
                    },
                    "api_token": [token]
                });
                let jxh_main = createJsonXmlHttp("sql");
                jxh_main.onreadystatechange = function () {
                    if (jxh_main.readyState == 4 || jxh_main.readyState == "complete") {
                        let revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                            let anchorList = revObj.Value[0].Values,
                                x, y;
                            for (let i in anchorList) {
                                x = anchorList[i].set_x / canvasImg.scale;
                                y = canvasImg.height - anchorList[i].set_y / canvasImg.scale;
                                anchorArray.push({
                                    id: anchorList[i].main_anchor_id,
                                    type: "main",
                                    x: x,
                                    y: y
                                });
                                drawAnchor(ctx, anchorList[i].main_anchor_id, "main", x, y, dot_size.anchor, 1 / Zoom);
                            }
                        }
                    }
                };
                jxh_main.send(jr_main);
            },
            fences: function (map_id) {
                fenceList = {};
                const json_request = JSON.stringify({
                    "Command_Type": ["Read"],
                    "Command_Name": ["GetFencesInMap"],
                    "Value": {
                        "map_id": map_id
                    },
                    "api_token": [token]
                });
                let jxh = createJsonXmlHttp("sql");
                jxh.onreadystatechange = function () {
                    if (jxh.readyState == 4 || jxh.readyState == "complete") {
                        let revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                            let revInfo = revObj.Value[0].Values || [];
                            for (let i = 0; i < revInfo.length; i++) {
                                fenceList[revInfo[i].fence_id] = {
                                    name: revInfo[i].fence_name,
                                    dots: []
                                };
                                get.fencePointArray(revInfo[i].fence_id);
                            }
                        } else {
                            alert($.i18n.prop('i_alarmAlert_30'));
                        }
                    }
                };
                jxh.send(json_request);
            },
            fencePointArray: function (fence_id) {
                const json_request = JSON.stringify({
                    "Command_Type": ["Read"],
                    "Command_Name": ["GetFence_point"],
                    "Value": {
                        "fence_id": fence_id
                    },
                    "api_token": [token]
                });
                let jxh = createJsonXmlHttp("sql");
                jxh.onreadystatechange = function () {
                    if (jxh.readyState == 4 || jxh.readyState == "complete") {
                        let revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                            let revInfo = revObj.Value[0].Values || [];
                            for (let i = 0; i < revInfo.length; i++)
                                fenceList[fence_id].dots.push(revInfo[i]);
                        } else {
                            alert($.i18n.prop('i_alarmAlert_30'));
                        }
                    }
                };
                jxh.send(json_request);
            },
            pointOnCanvas: function (x, y) {
                //獲取滑鼠在Canvas物件上座標(座標起始點從左上換到左下)
                let BCR = canvas.getBoundingClientRect(),
                    pos_x = (x - BCR.left) / Zoom,
                    pos_y = (y - BCR.top) / Zoom;
                lastX = pos_x;
                lastY = canvasImg.height - pos_y;
                coordinate.x.innerText = lastX < 0 ? 0 : (lastX).toFixed(2);
                coordinate.y.innerText = lastY < 0 ? 0 : (lastY).toFixed(2);
                return {
                    x: pos_x,
                    y: pos_y
                }
            }
        },
        setMapList = function () {
            let html = "";
            for (let id in MapList) {
                html += "<a style=\"color:#000000;\" " +
                    "href=\"javascript: selectMap(\'" + number + "\',\'" + id + "\');\">" +
                    MapList[id].name + "</a>";
            }
            inputMapList.innerHTML = html;
        },
        createFences = function () {
            for (let i in fenceList) {
                let fence = new Fence(ctx, canvasImg.scale),
                    fence_name = fenceList[i].name,
                    count = 0;
                fenceList[i].dots.forEach(dot_info => {
                    count++;
                    fence.setFenceDot(
                        fence_name,
                        dot_info.point_x / canvasImg.scale,
                        canvasImg.height - dot_info.point_y / canvasImg.scale
                    );
                });
                if (count > 0)
                    fence.drawFence();
            }
        },
        draw = function () {
            if (Map_id == "") //reset canvas map
                return;
            adjust.setSize();
            if (display_setting.display_fence)
                createFences();
            anchorArray.forEach(function (v) {
                drawAnchor(ctx, v.id, v.type, v.x, v.y, dot_size.anchor, 1 / Zoom);
            });
            for (let tag_id in tagArray) {
                let v = tagArray[tag_id];
                if (groupfindMap[v.group_id] == Map_id)
                    drawTags(ctx, v.id, v.x / canvasImg.scale, canvasImg.height - v.y / canvasImg.scale,
                        v.color, dot_size.tag, 1 / Zoom);
            }
            alarmArray.forEach(function (v) {
                if (groupfindMap[v.group_id] == Map_id)
                    drawAlarmTags(ctx, v.id, v.x / canvasImg.scale, canvasImg.height - v.y / canvasImg.scale,
                        v.status, dot_size.alarm, 1 / Zoom);
            });
            //Focus the position of this locating tag.
            if (isFocus) {
                if (locating_id in tagArray) {
                    let target = tagArray[locating_id],
                        target_map = target.group_id in groupfindMap ? groupfindMap[target.group_id] : "",
                        x = target.x / canvasImg.scale,
                        y = canvasImg.height - target.y / canvasImg.scale;
                    if (target_map == Map_id) {
                        adjust.focusCenter(x, y);
                        if (target.type == "alarm")
                            drawAlarmFocusFrame(ctx, x, y, dot_size.alarm, 1 / Zoom);
                        else
                            drawFocusFrame(ctx, x, y, dot_size.tag, 1 / Zoom);
                        //drawFocusMark(ctx, x, y, 1 / Zoom);
                    } else if (number == 1) { //canvas1 = Main Canvas
                        checkMapIsUsed(target_map);
                    }
                }
            }
        },
        event = {
            handleMouseMove: function (e) { //滑鼠移動事件
                if (canvasImg.isLoad)
                    get.pointOnCanvas(e.clientX, e.clientY);
                //抓取在物件上的點擊位置用clientX和clientY比較準確(位置不受滾動條影響)
            },
            handleMouseWheel: function (e) { //滑鼠滾輪事件
                let BCR = canvas.getBoundingClientRect(),
                    pos_x = e.clientX - BCR.left,
                    pos_y = e.clientY - BCR.top,
                    scale = 1.0;
                if (e.wheelDelta < 0 || e.detail > 0) {
                    if (Zoom > 0.1)
                        scale = 0.9;
                } else {
                    scale = 1.1;
                }
                Zoom = (Zoom * scale).toFixed(2); //縮放比例
                if (display_setting.lock_window && isFocus)
                    return;
                draw();
                let Next_x = lastX * Zoom, //縮放後滑鼠位移後的位置(x坐標)
                    Next_y = (canvasImg.height - lastY) * Zoom; //縮放後滑鼠位移後的位置(y坐標)
                //let canvas_left = parseFloat(canvas.style.marginLeft); //canvas目前相對於div的位置(x坐標)
                //let canvas_top = parseFloat(canvas.style.marginTop); //canvas目前相對於div的位置(y坐標)
                xleftView += pos_x - Next_x;
                ytopView += pos_y - Next_y;
                canvas.style.marginLeft = xleftView + "px";
                canvas.style.marginTop = ytopView + "px";
            },
            handleMouseClick: function (e) { //滑鼠點擊事件
                let p = {
                    x: lastX * canvasImg.scale,
                    y: lastY * canvasImg.scale
                };
                for (let tag_id in tagArray) {
                    let v = tagArray[tag_id];
                    if (v.type == "normal" && groupfindMap[v.group_id] == Map_id) {
                        let radius = dot_size.tag / Zoom,
                            distance = Math.sqrt(Math.pow(v.x - p.x, 2) + Math.pow(v.y - (p.y - radius * 2), 2));
                        if (distance <= radius) {
                            setTagDialog(v);
                        }
                    }
                }
                alarmArray.forEach(function (v) {
                    if (groupfindMap[v.group_id] == Map_id) {
                        let radius = dot_size.alarm / Zoom,
                            distance = Math.sqrt(Math.pow(v.x - p.x, 2) + Math.pow(v.y - (p.y - radius * 2), 2));
                        if (distance <= radius) {
                            setAlarmDialog({
                                id: v.id,
                                number: v.id in MemberList ? MemberList[v.id].number : "",
                                name: v.id in MemberList ? MemberList[v.id].name : "",
                                status: v.status,
                                alarm_time: v.alarm_time
                            });
                        }
                    }
                });
            },
            handleCanvasDown: function (e) {
                if (display_setting.lock_window && isFocus)
                    return;
                e.preventDefault();
                mouse.canvasLeft = parseInt(canvas.style.marginLeft);
                mouse.canvasTop = parseInt(canvas.style.marginTop);
                //e.pageX, e.pageY:獲取滑鼠按下時的坐標
                mouse.downX = e.pageX;
                mouse.downY = e.pageY;
                canvas.addEventListener("mousemove", event.handleCanvasMove);
                canvas.addEventListener("mouseup", function () {
                    //滑鼠彈起時=>div取消事件 
                    canvas.removeEventListener("mousemove", event.handleCanvasMove);
                });
            },
            handleCanvasMove: function (e) {
                //滑鼠按下時=>div綁定事件
                //e.pageX, e.pageY:獲取滑鼠移動後的坐標 
                xleftView = e.pageX - mouse.downX + mouse.canvasLeft;
                ytopView = e.pageY - mouse.downY + mouse.canvasTop;
                //計算div的最終位置,加上單位
                canvas.style.marginLeft = xleftView + "px";
                canvas.style.marginTop = ytopView + "px";
            }
        };

    closeMap.addEventListener("click", adjust.resetCanvas_Anchor, false);
    restore.btn.addEventListener("click", adjust.restoreCanvas, false);
    canvas.addEventListener("mousemove", event.handleMouseMove, false); //滑鼠在畫布中移動的座標
    canvas.addEventListener("mousedown", event.handleCanvasDown, false); //滑鼠按住畫布綁定畫布拖移事件
    canvas.addEventListener("DOMMouseScroll", event.handleMouseWheel, false); // 畫面縮放(for Firefox)
    canvas.addEventListener('click', event.handleMouseClick, false); //點擊地圖上的tag，跳出tag的訊息框
    canvas.addEventListener("mousewheel", event.handleMouseWheel, { //畫布縮放
        passive: true
    });
    /*canvas.addEventListener("touchstart", handleMobileTouch, { //手指點擊畫布中座標，跳出tag的訊息框
        passive: true
    });*/

    this.Map_id = function () {
        return Map_id;
    };

    this.adjust = adjust;

    this.draw = draw;

    this.inputMap = function (map_id) {
        Map_id = map_id;
        setMapList();
        if (map_id == "") return;
        changeMapToCookie(parseInt(number, 10) - 1, map_id);
        serverImg.src = MapList[map_id].src;
        serverImg.onload = function () {
            cvsBlock.style.background = "lightgray"; //none
            canvasImg.isLoad = true;
            canvasImg.width = serverImg.width;
            canvasImg.height = serverImg.height;
            canvasImg.scale = MapList[map_id].scale;
            visibleScale.innerText = MapList[map_id].scale;
            visibleMapName.innerText = "[" + MapList[map_id].name + "]";
            adjust.setCanvas(this.src, serverImg.width, serverImg.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            xleftView = 0;
            ytopView = 0;
            Zoom = 1.0;
            ctx.save(); //紀錄原比例
            canvas.style.marginLeft = "0px";
            canvas.style.marginTop = "0px";
            let serImgSize = serverImg.width / serverImg.height,
                cvsBlock_width = parseFloat(cvsBlock.clientWidth),
                cvsBlock_height = parseFloat(cvsBlock.clientHeight),
                cvsSize = cvsBlock_width / cvsBlock_height;
            if (serImgSize > cvsSize) { //原圖比例寬邊較長
                Zoom = (cvsBlock_width / serverImg.width).toFixed(2);
                adjust.setCanvas(this.src, cvsBlock_width, serverImg.height * Zoom);
            } else {
                Zoom = (cvsBlock_height / serverImg.height).toFixed(2);
                adjust.setCanvas(this.src, serverImg.width * Zoom, cvsBlock_height);
            }
            //在設定好地圖後，導入Anchors & Tags' setting
            get.anchors(map_id);
            get.fences(map_id);
            adjust.setSize();
        };
    };
}

function canvasMode(blocks) {
    let content = document.getElementById("content");
    let h = document.documentElement.clientHeight - 43; //window_height - nav_bar
    //console.log("h : " + h);
    let number = 1;
    content.innerHTML = "";
    switch (blocks) {
        case "1":
            number = 1;
            content.innerHTML += createCanvasHtml(1, "100%", h - 40 + "px");
            //page_height-(bar_height(20)*1 + space(20)) = h - 40
            break;
        case "2_v": //vertical
            number = 2;
            for (let i = 1; i < 3; i++)
                content.innerHTML += createCanvasHtml(i, "100%", (h - 60) / 2 + "px");
            //page_height-(bar_height(20)*2 + space(20)) = h - 60
            break;
        case "2_h": //horizontal
            number = 2;
            for (let i = 1; i < 3; i++)
                content.innerHTML += createCanvasHtml(i, "50%", h - 40 + "px");
            //page_height-(bar_height(20)*1 + space(20)) = h - 40
            break;
        case "4":
            number = 4;
            for (let i = 1; i < 5; i++)
                content.innerHTML += createCanvasHtml(i, "50%", (h - 60) / 2 + "px");
            //page_height-(bar_height(20)*2 + space(20)) = h - 60
            break;
        case "6":
            number = 6;
            content.innerHTML += createCanvasHtml(1, "66.6%", Math.ceil((h - 80) * 2 / 3 + 21) + "px");
            //page_height-(bar_height(20)*3 + space(20)) = h - 80
            for (let i = 2; i < 7; i++)
                content.innerHTML += createCanvasHtml(i, "33.3%", (h - 80) * 1 / 3 + "px");
            break;
        default:
            number = 1;
            content.innerHTML += createCanvasHtml(1, "100%", h - 100 + "px");
            break;
    }
    canvasArray = [];
    for (let j = 0; j < number; j++)
        canvasArray.push(new RTLS_Canvas(j + 1));
}

function createCanvasHtml(num, width, height) {
    return "<div class='content-blocks' style='width: " + width + ";'>" +
        "<div class='canvas-control-bar'>" +
        "<label class='canvas-visible-map-name' id=\"visible_map_name" + num + "\"></label>" +
        "<div style='display: none;'><label class='i18n' name='i_mapScale'>" + $.i18n.prop("i_mapScale") + "</label> : " +
        "<label id=\"scale_visible" + num + "\" style='margin-right:20px;'></label></div>" +
        "<label class='i18n' name='i_posX'>" + $.i18n.prop("i_posX") + "</label> : " +
        "<label type='text' id=\"x" + num + "\" class='coordinate'></label>" +
        "<label class='i18n' name='i_posY' style='margin-left:10px;'>" + $.i18n.prop("i_posY") + "</label> : " +
        "<label type='text' id=\"y" + num + "\" class='coordinate'></label>" +
        "<div style='float: right;'><div class='dropdown'>" +
        "<label class='btn-set i18n-input' selectattr='title' selectname='i_input_map' title=\"" + $.i18n.prop("i_input_map") +
        "\" style='margin-right: 5px;'><i class='far fa-image'></i></label>" +
        "<div class='dropdown-content' style='left:-120px;' id=\"input_map_list" + num + "\"></div>" +
        "</div>" +
        "<label for=\"btn_restore" + num + "\" id=\"label_restore" + num + "\" class='btn-icon i18n-input' selectattr='title'" +
        " selectname='i_restore_scale' title=\"" + $.i18n.prop("i_restore_scale") + "\" style='margin-right: 5px;'>" +
        "<i class='fas fa-compress'></i></label>" +
        "<input id=\"btn_restore" + num + "\" type='button' class='btn-hidden' />" +
        "<label for=\"btn_close" + num + "\" class='btn-delete i18n-input' selectattr='title'" +
        "title=\"" + $.i18n.prop("i_closeMap") + "\" selectname='i_closeMap'><i class='fas fa-times'></i></label>" +
        "<input id=\"btn_close" + num + "\" type='button' class='btn-hidden' />" +
        "</div></div>" +
        "<div class='cvsBlock' id=\"cvsBlock" + num + "\" style='height: " + height + ";'>" +
        "<canvas id=\"canvas" + num + "\" style='height:1px; width:1px;'>" +
        "<label class='i18n' name='i_no_canvas'>" + $.i18n.prop("i_no_canvas") + "</label>" +
        "</canvas>" +
        "</div>" +
        "</div>";
}