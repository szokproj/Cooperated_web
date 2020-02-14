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
    let h = document.documentElement.clientHeight;
    $("#block_files_list").css("max-height", h - 432 + "px");

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
        $("#update_file").removeClass("ui-state-error");
        if (fileArray.length == 0) {
            $("#update_file").addClass("ui-state-error");
            alert($.i18n.prop('i_selectFirmwareFirst'));
        } else {
            if (confirm($.i18n.prop('i_confirmUploadFirmware'))) {
                let file_name = $("#update_file").val().substring($("#update_file").val().lastIndexOf('\\') + 1);
                setProgress(0);
                sendFileToServer(file_name, 0);
            }
        }
    });
    $("#btn_reset").click(function () {
        setTimeout(reset);
    });
    $("#btn_refresh").on("click", getFileList);
    $("#btn_check_fm").on("click", checkFileByName);
    $("#btn_delete").on("click", function () {
        if (fileName.length == 0)
            alert($.i18n.prop('i_selectFileFirst'));
        else if (confirm($.i18n.prop('i_confirmDeleteFile')))
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
                    temp += uint8ToHex16(file_data[i]);
                }
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
            alert($.i18n.prop('i_browserNotSupport'));
        }
    } else {
        document.getElementById('file_form').reset();
        alert($.i18n.prop('i_firmwareFileExt'));
    }
}

function sendFileToServer(file_name, index) { //上傳bin檔到Server
    let total_files = fileArray.length;
    let requestArray = {
        "Command_Type": ["Write"],
        "Command_Name": ["uploadFW"],
        "Value": {
            "File_Name": [file_name],
            "File_Data": [fileArray[index]]
        },
        "api_token": [token]
    };
    let xmlHttp = createJsonXmlHttp("Update_fw");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                //當Server回傳接收成功後, 持續向Server傳送取得更新進度的要求
                if (revObj.Value[0].Status == "Upload OK") {
                    index++;
                    setProgress(Math.ceil(index / total_files * 100));
                    $("#btn_upload").prop("disabled", true);
                    if (index != total_files) {
                        setTimeout(function () {
                            sendFileToServer(file_name, index);
                        }, 500);
                    }
                } else {
                    alert($.i18n.prop('i_uploadFirmwareFailed'));
                }
            } else {
                alert($.i18n.prop('i_uploadFirmwareFailed'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function stop() {
    $("#prog").removeClass("progress-bar-info").css("width", "0%");
}

function setProgress(percent) {
    if (percent == 0) { //reset
        $("#prog").removeClass("progress-bar-info").css("width", "0%");
    } else if (percent > 0 && percent < 100) {
        $("#prog").css("width", percent + "%").text(percent + "%");
        $("#prog").addClass("progress-bar-info");
    } else if (percent == 100) {
        $("#prog").css("width", percent + "%").text(percent + "%");
        $("#btn_upload").prop("disabled", false);
        getFileList();
        setTimeout(function () {
            alert($.i18n.prop('i_uploadFirmwareCompleted'));
        }, 1000);
    }
}

function reset() {
    fileArray = [];
    document.getElementById("file_upload").value = "";
    document.getElementById("update_file").value = "";
    $("#prog").removeClass("progress-bar-info").css("width", "0%");
}

function updateFileToDevice() {
    $("#sel_device_ip").removeClass("ui-state-error");
    let ip_addr = $("#sel_device_ip").val();
    if (!ip_addr || ip_addr == "") {
        $("#sel_device_ip").addClass("ui-state-error");
        alert($.i18n.prop('i_selectIpAddress'));
        return;
    } else if (fileName == "") {
        alert($.i18n.prop('i_selectFirmware'));
        return;
    }
    if (confirm($.i18n.prop('i_checkUpdateFirmware_1') + fileName + $.i18n.prop('i_checkUpdateFirmware_2') +
            $("#sel_device_ip").val() + $.i18n.prop('i_checkUpdateFirmware_3'))) {
        let requestArray = {
                "Command_Type": ["Read"],
                "Command_Name": ["updateFW"],
                "Value": {
                    "File_Name": [fileName],
                    "IP_address": [ip_addr]
                },
                "api_token": [token]
            },
            xmlHttp = createJsonXmlHttp("Update_fw");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                let revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    alert($.i18n.prop('i_updateFirmwareOK'));
                } else {
                    alert($.i18n.prop('i_updateFirmwareFailed'));
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
                alert($.i18n.prop('i_deleteFirmwareOK'));
            } else {
                alert($.i18n.prop('i_deleteFirmwareFailed'));
            }
        }
    };
    xmlHttp.send(JSON.stringify(requestArray));
}

function checkFileByName() {
    if (fileName.length == 0)
        return alert($.i18n.prop('i_selectFileFirst'));
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
                alert($.i18n.prop('i_checkFirmwareOK'));
            } else {
                switch (revObj.Value[0].Status) {
                    case "open file error":
                        alert($.i18n.prop('i_openFileError'));
                        break;
                    case "file data error":
                        alert($.i18n.prop('i_checkFirmwareError'));
                        break;
                    default:
                        alert($.i18n.prop('i_checkFirmwareError'));
                        break;
                }
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
                fileName = ""; //清空指定的檔名
                $("#block_files_list").empty();
                revInfo.forEach(function (element, i) {
                    let id = "files_" + i;
                    $("#block_files_list").append("<button class=\"btn file-img-name\" id=\"" + id + "\"" +
                        " name=\"files\" onclick=\"setSelected(\'" + id + "\',\'" + element + "\')\">" +
                        "<img src=\"../image/file.png\"><br>" +
                        "<label>" + element + "</label></button>");
                });
            } else {
                alert($.i18n.prop('i_getFileListFailed'));
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