var crossMul = function (v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
}

//javascript判断两条线段是否相交  
var checkCross = function (p1, p2, p3, p4) {
    var v1 = {
        x: p1.x - p3.x,
        y: p1.y - p3.y
    };
    v2 = {
        x: p2.x - p3.x,
        y: p2.y - p3.y
    };
    v3 = {
        x: p4.x - p3.x,
        y: p4.y - p3.y
    };
    v = crossMul(v1, v3) * crossMul(v2, v3);
    v1 = {
        x: p3.x - p1.x,
        y: p3.y - p1.y
    };
    v2 = {
        x: p4.x - p1.x,
        y: p4.y - p1.y
    };
    v3 = {
        x: p2.x - p1.x,
        y: p2.y - p1.y
    };
    return (v <= 0 && crossMul(v1, v3) * crossMul(v2, v3) <= 0) ? true : false;
}

//判断点是否在多边形内  
var checkInside = function (point, polygon) {
    var p1, p2, p3, p4;
    p1 = point;
    p2 = {
        x: -100,
        y: point.y
    };
    var count = 0;
    //对每条边都和射线作对比  
    for (var i = 0; i < polygon.length - 1; i++) {
        p3 = polygon[i];
        p4 = polygon[i + 1];
        if (checkCross(p1, p2, p3, p4) == true) {
            count++;
        }
    }
    p3 = polygon[polygon.length - 1];
    p4 = polygon[0];
    if (checkCross(p1, p2, p3, p4) == true) {
        count++;
    }
    return (count % 2 == 0) ? false : true;
}

var checkPP = function (polygon1, polygon2) {
    var p1, p2, p3, p4;
    var count = 0;
    //对每条边都和射线作对比  
    for (var i = 0; i < polygon1.length; i++) {
        p1 = polygon1[i];
        if (i == polygon1.length - 1)
            p2 = polygon1[0];
        else
            p2 = polygon1[i + 1];

        for (var j = 0; j < polygon2.length; j++) {
            p3 = polygon2[j];
            if (j == polygon2.length - 1)
                p4 = polygon2[0];
            else
                p4 = polygon2[j + 1];

            if (checkCross(p1, p2, p3, p4) == true)
                count++;
        }
    }
    return (count > 0) ? true : false;
}