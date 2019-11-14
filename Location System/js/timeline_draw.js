function drawTag(dctx, id, x, y, color) {
    dctx.globalCompositeOperation = "source-over";
    dctx.beginPath();
    dctx.fillStyle = color; //'#66ccff';
    dctx.arc(x, y, 5, 0, Math.PI * 2, true); // circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
    dctx.fill(); //填滿圓形
    //dctx.strokeStyle = color; //'#0084ff';
    //dctx.stroke(); //畫圓形的線
    dctx.closePath();
}


function drawArrow(dctx, fromX, fromY, toX, toY, theta, headlen, width, color) {
    ctx.globalCompositeOperation = "destination-over";
    var deltaX = toX - fromX;
    var deltaY = toY - fromY;
    if (Math.sqrt(Math.abs(deltaX) ^ 2 + Math.abs(deltaY) ^ 2) > 5) {
        if (deltaX != 0 && deltaY != 0) {
            if (deltaX > 0) //正 
                toX -= 5 * Math.cos(1 / 12) * Zoom;
            else //負
                toX += 5 * Math.cos(1 / 12) * Zoom;
            if (deltaY > 0) //正
                toY -= 5 * Math.sin(1 / 12) * Zoom;
            else //負
                toY += 5 * Math.sin(1 / 12) * Zoom;
        } else if (deltaX != 0) {
            if (deltaX > 0) //正 
                toX -= 5 * Zoom;
            else //負
                toX += 5 * Zoom;
        } else if (deltaY != 0) {
            if (deltaY > 0) //正
                toY -= 5 * Zoom;
            else //負
                toY += 5 * Zoom;
        }
        theta = typeof (theta) != 'undefined' ? theta : 30;
        headlen = typeof (headlen) != 'undefined' ? headlen : 10;
        width = typeof (width) != 'undefined' ? width : 1;
        color = typeof (color) != 'color' ? color : '#000';
        // 计算各角度和对应的P2,P3坐标 
        var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
            angle1 = (angle + theta) * Math.PI / 180,
            angle2 = (angle - theta) * Math.PI / 180,
            topX = headlen * Math.cos(angle1),
            topY = headlen * Math.sin(angle1),
            botX = headlen * Math.cos(angle2),
            botY = headlen * Math.sin(angle2);
        dctx.save();
        dctx.beginPath();
        var arrowX = fromX - topX,
            arrowY = fromY - topY;
        dctx.moveTo(arrowX, arrowY);
        dctx.moveTo(fromX, fromY);
        dctx.lineTo(toX, toY);
        arrowX = toX + topX;
        arrowY = toY + topY;
        dctx.moveTo(arrowX, arrowY);
        dctx.lineTo(toX, toY);
        arrowX = toX + botX;
        arrowY = toY + botY;
        dctx.lineTo(arrowX, arrowY);
        dctx.strokeStyle = color;
        dctx.lineWidth = width;
        dctx.stroke();
        dctx.restore();
    } else {
        dctx.beginPath();
        dctx.moveTo(fromX, fromY);
        dctx.lineTo(toX, toY);
        dctx.strokeStyle = color;
        dctx.lineWidth = width;
        dctx.stroke();
        dctx.closePath();
    }
}

function getEventPosition(event) { //獲取滑鼠點擊位置
    var x, y;
    if (event.layerX || event.layerX == 0) {
        x = event.layerX;
        y = event.layerY;
    } else if (event.offsetX || event.offsetX == 0) { // Opera
        x = event.offsetX;
        y = event.offsetY;
    } //注：如果使用此方法無效的話，需要給Canvas元素的position設為absolute。
    return {
        x: x,
        y: y
    };
}

function getPointOnCanvas(x, y) { //獲取滑鼠在Canvas物件上座標
    var BCR = canvas.getBoundingClientRect();
    var pos_x = (x - BCR.left) * (canvasImg.width / BCR.width);
    var pos_y = (y - BCR.top) * (canvasImg.height / BCR.height);
    return {
        x: pos_x,
        y: pos_y
    }
}