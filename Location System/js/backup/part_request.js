setInterval('autoSendRequest()', 100);

function GetXmlHttpObject() {
    var xmlHttp = null;
    try {// Firefox, Opera 8.0+, Safari
        xmlHttp = new XMLHttpRequest();
    }
    catch (e) {//Internet Explorer
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    return xmlHttp;
}

function update1(url, locationID) {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var table1 = "<table><tr style=\"background:lightgray;\">" +
                "<th>Items</th>" +
                "<th>Name</th>" +
                "<th>ID</th>" +
                "<th>Time</th>" +
                "<th>Alarm Status</th>" +
                "<th>Image</th></tr>";
            var revObj = JSON.parse(this.responseText);
            for (i in revObj.items) {
                table1 += "<tr><td>" + revObj.items[i] +
                    "</td><td>" + revObj.name[i] +
                    "</td><td>" + revObj.id[i] +
                    "</td><td>" + revObj.time[i] +
                    "</td><td>" + revObj.alarm_status[i] +
                    "</td><td>" + revObj.image[i] +
                    "</td></tr>";
            }
            table1 += "</table>";
            document.getElementById(locationID).innerHTML = table1;
        }
    };
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.send();
}

function update2(url, locationID) {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var table2 = "<table><tr style=\"background:lightgray;\">" +
                "<th>Items</th>" +
                "<th>Display ID</th>" +
                "<th>Name</th>" +
                "<th>Tag List</th></tr>";
            var revObj = JSON.parse(this.responseText);
            var id;
            for (var i = 0; i < revObj.tag_list.length; i++) {
                id = i + 1;
                table2 += "<tr><td>" + id +
                    "</td><td>" + " " +
                    "</td><td>" + revObj.name[i] +
                    "</td><td>" + revObj.tag_list[i].substring(14) +
                    "</td></tr>";
            }
            table2 += "</table>";
            document.getElementById(locationID).innerHTML = table2;
        }
    };
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.send();
}

function update3(url) {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (canvasImg.isPutImg) {
                //setSize();
                var id, x, y;
                tagArray = [];
                for (i in revObj.x) {
                    id = revObj.tag_list[i].substring(14);
                    x = revObj.x[i];
                    y = canvasImg.height - revObj.y[i]; //因為Server回傳的座標為左下原點 
                    //drawTags(dctx, id, x, y); //畫出點的設定
                    tagArray.push({ x: x, y: y, id: id, name: "", image: "" });
                }
            }
        }
    };
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.send();
}

function readMainAnchorSet() {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (canvasImg.isPutImg) {
                setSize();
                var id, x, y;
                anchorMainArray = [];
                for (i in revObj.main_id) {
                    id = revObj.main_id[i];
                    x = revObj.main_x[i] / 3;
                    y = canvasImg.height - revObj.main_y[i] / 3; //因為Server回傳的座標為左下原點
                    drawMainAnchor(ctx, id, x, y); //畫出點的設定
                    anchorMainArray.push({ id: id, x: x, y: y });
                }
            }
        }
    };
    xmlHttp.open("POST", "requestMainAnchorPosition", true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.send();
}

function readAnchorSet() {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (canvasImg.isPutImg) {
                setSize();
                var id, x, y;
                anchorArray = [];
                for (i in revObj.id) {
                    id = revObj.id[i];
                    x = revObj.x[i] / 3;
                    y = canvasImg.height - revObj.y[i] / 3; //因為Server回傳的座標為左下原點
                    drawAnchor(ctx, id, x, y); //畫出點的設定
                    anchorArray.push({ id: id, x: x, y: y });
                }
            }
        }
    };
    xmlHttp.open("POST", "requestAnchorPosition", true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.send();
}

function getServerImage() {
    var oReq = new XMLHttpRequest();
    if (oReq == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    oReq.open("POST", "requestImage", true);
    oReq.responseType = "blob";
    oReq.onreadystatechange = function () {
        if (oReq.readyState == oReq.DONE) {
            var blob = oReq.response;
            loadImage(blob);
        }
    }
    oReq.send();
}

function drawMainAnchor(dctx, id, x, y) {
    dctx.fillStyle = "red";
    dctx.font = '13px serif';
    dctx.fillText(id, x, y); //MainAnchorID
    dctx.fillRect(x, y, 10, 10);
}

function drawAnchor(dctx, id, x, y) {
    dctx.fillStyle = "blue";
    dctx.font = '13px serif';
    dctx.fillText(id, x, y); //anchorID
    dctx.fillRect(x, y, 10, 10);
}

function drawTags(dctx, id, x, y) {
    dctx.fillStyle = '#ff8c1a';
    dctx.beginPath();
    dctx.arc(x, y, 2, 0, Math.PI * 2, true); // circle(x座標,y座標,半徑,開始弧度,結束弧度,順t/逆f時針)
    dctx.fill(); //填滿圓形
    //dctx.stroke(); //畫線圓形
    //dctx.closePath();
    //dctx.font = '10px serif';
    //dctx.strokeText(id, x, y); //tagID
}

function drawAnchorPosition(dctx, x, y) {
    dctx.fillStyle = '#99cc00';
    dctx.beginPath();
    dctx.arc(x, y, 4, 0, Math.PI * 2, true);
    dctx.fill();
}

function draw() {
    setSize();
    anchorMainArray.forEach(function (v) {
        drawMainAnchor(ctx, v.id, v.x, v.y);
    });
    anchorArray.forEach(function (v) {
        drawAnchor(ctx, v.id, v.x, v.y);
    });
    tagArray.forEach(function (v) {
        drawTags(ctx, v.id, v.x, v.y);
    });
}

function clickAnchorPosition() {
    AnchorPosition = !AnchorPosition;
}

function handleAnchorPosition() {
    setAddAnchorDialog(); //函式內容在dialog_anchor_setting.js中
    document.getElementById("anchor_x").value = lastX;
    document.getElementById("anchor_y").value = lastY;
}

function autoSendRequest() {
    if (!AnchorPosition) {
        update2("request2", "txtHint2");
        update3("requestTagList");
        draw();
        canvas.removeEventListener("click", handleAnchorPosition);
    } else {
        draw();
        var posX = lastX * Zoom;
        var posY = (canvas.height - lastY) * Zoom;
        drawAnchorPosition(ctx, posX, posY);
        canvas.addEventListener('click', handleAnchorPosition);
    }
}