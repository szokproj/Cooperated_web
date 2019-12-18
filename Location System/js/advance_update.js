'use strict';
var isStart = false;
var token = "";
var fileData = "";
var fileName = "";
var fileArray = [];
var st = 0;
var time = 100;
var ipPortList = {};

$(function () {
    token = getToken();
    /*
     * Check this page's permission and load navbar
     */
    if (!getPermissionOfPage("Reference")) {
        alert("Permission denied!");
        window.location.href = '../index.html';
    }
    setNavBar("Reference", "Update");

    $("#btn_upload").click(function () {
        if (fileArray == []) {
            alert("請先載入更新檔");
        } else {
            setProgress(0);
            sendFileToServer(0);
        }
    });
    $("#btn_reset").click(function () {
        setTimeout(reset);
    });
    $("#btn_refresh").on("click", getFileList);
    $("#btn_check_fm").on("click", checkFileByName);
    $("#btn_delete").on("click", function () {
        if (confirm("Are you sure to delete this file ?"))
            deleteFileByName();
    });
    $("#btn_update").on("click", updateFileToDevice)
    searchNetworkCards();
    getFileList();
});

function uint8ToHex16(str) {
    let str_hex = parseInt(str, 10).toString(16);
    while (str_hex.length < 2) {
        str_hex = "0" + str_hex;
    }
    return str_hex;
}


function handleFiles(files) {
    $("#btn_upload").prop("disabled", true);
    $("#btn_reset").prop("disabled", true);
    let file = files[0];
    fileName = file.name;
    let fileExt = (file.name.substring(file.name.lastIndexOf('.'))).toLowerCase();
    if (fileExt == ".bin") {
        let src = document.getElementById('file_upload').value;
        document.getElementById('update_file').value = src;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            let fr = new FileReader();
            fr.onloadend = function (e) {
                let file_data = new Uint8Array(e.target.result);
                let temp = "";
                for (let i = 0; i < file_data.length; i++) {
                    //fileArray.push(uint8ToHex16(file_data[i]));
                    temp += uint8ToHex16(file_data[i]);
                }
                let len = temp.length;
                fileArray = [];
                while (temp.length > 51200) {
                    fileArray.push(temp.substr(0, 51200));
                    temp = temp.substring(51200);
                }
                if (temp.length > 0) {
                    fileArray.push(temp);
                }
                $("#btn_upload").prop("disabled", false);
                $("#btn_reset").prop("disabled", false);
            };
            fr.readAsArrayBuffer(file);
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    } else {
        document.getElementById('file_form').reset();
        alert("The uploading file's ext should be .bin!");
    }
}

function sendFileToServer(index) { //傳輸bin檔到Server
    let total_files = fileArray.length;
    let file_name = $("#update_file").val().substring($("#update_file").val().lastIndexOf('\\') + 1);
    let requestArray = {
        "Command_Type": ["Write"],
        "Command_Name": ["uploadFW"],
        "Value": {
            "File_Name": [file_name],
            "File_Data": [fileArray[index]]
        },
        "api_token": [token]
    };
    //return;
    let xmlHttp = createJsonXmlHttp("Update_fw");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                //當Server回傳接收成功後, 持續向Server傳送取得更新進度的要求
                //let revInfo = revObj.Value[0].Values ? revObj.Value[0].Values : [];
                if (revObj.Value[0].Status == "Upload OK") {
                    index++;
                    setProgress(Math.ceil(index / total_files * 100));
                    $("#btn_upload").prop("disabled", true);
                    if (index != total_files) {
                        setTimeout(function () {
                            sendFileToServer(index);
                        }, 500);
                    }
                } else {
                    alert("傳送更新檔失敗，請稍候再試一次!");
                    //stop();
                }
            } else {
                alert("傳送更新檔失敗，請稍候再試一次!");
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function stop() {
    //clearTimeout(st);
    $("#prog").removeClass("progress-bar-info").css("width", "0%");
}

function setProgress(percent) {
    if (percent == 0) { //reset
        //clearTimeout(st);
        $("#prog").removeClass("progress-bar-info").css("width", "0%");
        //st = setTimeout(increment, time);
    } else if (percent > 0 && percent < 100) {
        $("#prog").css("width", percent + "%").text(percent + "%");
        $("#prog").addClass("progress-bar-info");
        //st = setTimeout(increment, time);
    } else if (percent == 100) {
        $("#prog").css("width", percent + "%").text(percent + "%");
        $("#btn_upload").prop("disabled", false);
        getFileList();
        //alert("Update Success!");
        setTimeout(function () {
            alert("開檔上傳成功");
        }, 1000);
    }
}

function reset() {
    //clearTimeout(st);
    fileName = "";
    fileArray = [];
    document.getElementById("file_upload").value = "";
    document.getElementById("update_file").value = "";
    $("#prog").removeClass("progress-bar-info").css("width", "0%");
}

function updateFileToDevice() {
    let ip_addr = $("#sel_device_ip").val();
    if (!ip_addr || ip_addr == "") {
        alert("請選擇裝置的IP address!");
        return;
    } else if (fileName == "") {
        alert("請先點選下方資料夾內的更新檔!");
        return;
    }
    if (confirm("確定將檔名為 [" + fileName + "] 更新到裝置 IP address : " + $("#sel_device_ip").val() + "的韌體?(建議先確認更新檔是否符合規定)")) {
        let requestArray = {
                "Command_Type": ["Read"],
                "Command_Name": ["update_data"],
                "Value": {
                    "File_Name": [fileName],
                    "IP_address": [ip_addr]
                },
                "api_token": [token]
            },
            xmlHttp = createJsonXmlHttp("test2");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                let revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0]) {
                    if (revObj.Value[0].success > 0) {
                        alert("Updated the firmware successfully.");
                    } else {
                        alert("Failed to update firmware!");
                    }
                }
            }
        };
        xmlHttp.send(JSON.stringify(requestArray));
    }
}

function deleteFileByName() {
    let requestArray = {
            "Command_Type": ["Read"],
            "Command_Name": ["deleteFW"],
            "Value": {
                "File_Name": [fileName]
            },
            "api_token": [token]
        },
        xmlHttp = createJsonXmlHttp("Update_fw");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                getFileList();
                alert("The file was successfully deleted.");
            } else {
                alert("Failed to delete file!");
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function checkFileByName() {
    if (fileArray == []) {
        alert("請先載入更新檔");
        return;
    }
    let requestArray = {
            "Command_Type": ["Read"],
            "Command_Name": ["checkFW"],
            "Value": {
                "File_Name": [fileName]
            },
            "api_token": [token]
        },
        xmlHttp = createJsonXmlHttp("Update_fw");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                if (revObj.Value[0].Status == "FW check OK")
                    alert("檔案格式正確");
                else
                    alert("檔案格式錯誤");
            } else {
                alert(revObj.Value[0].Status);
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function getFileList() {
    let requestArray = {
            "Command_Type": ["Read"],
            "Command_Name": ["checkFWlist"],
            "api_token": [token]
        },
        xmlHttp = createJsonXmlHttp("Update_fw");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                let revInfo = revObj.Value[0].FileName ? revObj.Value[0].FileName : [];
                $("#block_files_list").empty();
                revInfo.forEach(function (element, i) {
                    let id = "files_" + i;
                    $("#block_files_list").append("<button" +
                        " class=\"btn file-img-name\" id=\"" + id + "\"" +
                        " name=\"files\" onclick=\"setSelected(\'" + id + "\',\'" +
                        element + "\')\"><img src=\"../image/file.png\"><br>" +
                        "<label>" + element + "</label></button>");
                });
            } else {
                alert(revObj.Value[0].Status);
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function setSelected(btn_id, file_name) {
    fileName = file_name;
    $("[name='files']").removeClass("onselected");
    $("#" + btn_id).addClass("onselected");
}