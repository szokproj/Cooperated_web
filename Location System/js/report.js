'use strict';
var token = "",
    sel_members_number = [],
    mapList = {},
    memberList = {},
    timeDelay = {};

$(function () {
    token = getToken();
    /*
     * Check this page's permission and load navbar
     */
    if (!getPermissionOfPage("Report")) {
        alert("Permission denied!");
        window.location.href = '../index.html';
    }
    setNavBar("Report", "");

    getMap();
    setMembersDialog();
    setDisplayRowsDialog();

    $("#select_report_type").on("change", function () {
        switch ($(this).val()) {
            case "daily_report":
                $("#select_report_name").html(
                    "<option value=\"person_timeline\">個人一日軌跡</option>" +
                    "<option value=\"member_attendance\">人員出勤表</option>" +
                    "<option value=\"all_member_attend\">全部人員出勤表</option>");
                selectPage("person_timeline");
                $("#report_time").html("<label>選擇日期 :</label> <input type='date' id=\"date_one_day\" />");
                break;
            case "weekly_report":
                $("#select_report_name").html(
                    "<option value=\"member_attendance\">人員出勤表</option>" +
                    "<option value=\"all_member_attend\">全部人員出勤表</option>");
                selectPage("member_attendance");
                $("#report_time").html("<label>開始日期 :</label> <input type='date' id=\"date_aweek_start\" /><br>" +
                    "<label>結束日期 :</label> <input type='date' id=\"date_aweek_end\" readonly/>");
                $("#date_aweek_start").on("change", function () {
                    var date = new Date($(this).val());
                    date.setDate(date.getDate() + 6); //取得６天後的日期
                    $("#date_aweek_end").val(new Date(date).format("yyyy-MM-dd")); //轉換成日期元件可使用的格式
                });
                break;
            case "monthly_report":
                $("#select_report_name").html(
                    "<option value=\"member_attendance\">人員出勤表</option>" +
                    "<option value=\"all_member_attend\">全部人員出勤表</option>");
                selectPage("member_attendance");
                $("#report_time").html("<label>選擇年月 :</label> <input type='month' id=\"month_select\" value=\"\" />");
                break;
            default:
                break;
        }
    });

    $("#select_report_name").on("change", function () {
        selectPage($(this).val());
    });

    $("#btn_create_report").on("click", function () {
        switch ($("#select_report_name").val()) {
            case "person_timeline":
                if (sel_members_number.length > 1 &&
                    !confirm("此報表為個人一日軌跡，如選擇多個人員，也只會搜尋第一個人員，確認繼續?")) {
                    return;
                } else if (sel_members_number.length == 0) {
                    alert("請選擇人員!")
                    return;
                }
                getPersonTimeline(sel_members_number[0]);
                break;
            case "member_attendance":
            case "all_member_attend":
                if (sel_members_number.length == 0) {
                    alert("請選擇人員!")
                    return;
                }
                getAttendanceList();
                break;
            default:
                break;
        }
    });

    $("#btn_delete_members").on("click", function () {
        if ($("#select_report_name").val() == "all_member_attend")
            return;
        let checkbox = document.getElementsByName("select_members");
        sel_members_number = [];
        for (let i = 0; i < checkbox.length; i++) {
            if (!checkbox[i].checked)
                sel_members_number.push(checkbox[i].value);
        }
        $("#table_members tbody").empty();
        sel_members_number.forEach(function (number, i) {
            $("#table_members tbody").append("<tr>" +
                "<td><input type='checkbox' name=\"select_members\" value=\"" + number + "\" /> " +
                (i + 1) + "</td>" +
                "<td>" + number + "</td>" +
                "<td>" + memberList[number].Name + "</td></tr>");
        });
        $("#count_sel_members").text(sel_members_number.length);
        $("#chk_all_member").prop("checked", false);
    });

    $("#chk_all_search_member").on("click", function () {
        let checkboxs = document.getElementsByName("chk_members"),
            isChecked = $(this).prop("checked");
        checkboxs.forEach(element => {
            element.checked = isChecked;
        });
        if (isChecked)
            $("#search_member_list tbody tr").addClass("selected");
        else
            $("#search_member_list tbody tr").removeClass("selected");
    });

    $("#chk_all_member").on("click", function () {
        let checkboxs = document.getElementsByName("select_members"),
            isChecked = $(this).prop("checked");
        checkboxs.forEach(element => {
            element.checked = isChecked;
        });
    });
});



function selectPage(page_name) {
    switch (page_name) {
        case "person_timeline":
            $("#report_page_member").hide();
            $("#report_page_all_member").hide();
            $("#report_page_timeline").show();
            break;
        case "member_attendance":
            $("#report_page_timeline").hide();
            $("#report_page_all_member").hide();
            $("#report_page_member").show();
            $("#report_attend_title").text("人員出勤表");
            break;
        case "all_member_attend":
            let count = 0;
            $("#report_page_timeline").hide();
            $("#report_page_all_member").hide();
            $("#report_page_member").show();
            $("#report_attend_title").text("全部人員出勤表");
            $("#table_members tbody").empty();
            sel_members_number = []
            for (let number in memberList) {
                sel_members_number.push(number);
                count++;
                $("#table_members tbody").append("<tr>" +
                    "<td><input type='checkbox' name=\"select_members\" value=\"" + number + "\" /> " +
                    count + "</td>" +
                    "<td>" + number + "</td>" +
                    "<td>" + memberList[number].Name + "</td></tr>");
            }
            $("#count_sel_members").text(count);
            break;
        default:
            break;
    }
}

function getMap() {
    var xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                $("#target_map").empty();
                revObj.Value[0].Values.forEach(element => {
                    //mapList => key: map_id | value: {map_id, map_name, map_src, map_scale}
                    mapList[element.map_id] = {
                        map_id: element.map_id,
                        map_name: element.map_name,
                        map_src: "data:image/" + element.map_file_ext + ";base64," + element.map_file,
                        map_scale: element.map_scale
                    }
                    $("#target_map").append("<option value=\"" + element.map_id + "\">" + element.map_name + "</option>");
                });
                $("#target_map").on('change', function () {
                    var mapInfo = mapList[$(this).val()];
                    loadImage(mapInfo.map_src, mapInfo.map_scale);
                    restartCanvas();
                });
            }
        }
    };
    xmlHttp.send(JSON.stringify({
        "Command_Type": ["Read"],
        "Command_Name": ["GetMaps"],
        "api_token": [token]
    }));
}


function getPersonTimeline(number) {
    let person = memberList[number],
        count_times = 0,
        row_count = 0,
        date = document.getElementById("date_one_day").value,
        date_arr = date.split("-");;

    if (date == "") {
        alert("請選擇日期!");
        return;
    }

    for (let title in RowsList) {
        if (RowsList[title]["timeline"] == true)
            $("#report_person_" + title).text(person[title]);
    }
    if (timeDelay["search"]) {
        timeDelay["search"].forEach(timeout => {
            clearTimeout(timeout);
        });
    }
    timeDelay["search"] = [];
    showSearching();

    document.getElementById("report_date").innerText = date_arr[0] + "年" + date_arr[1] + "月" + date_arr[2] + "日";
    $("#table_person_timeline tbody").empty();
    sendRequest({
        "Command_Type": ["Read"],
        "Command_Name": ["GetLocus_combine_hour"],
        "Value": {
            "tag_id": person.tag_id.substring(8),
            "start_date": date,
            "start_time": "00:00:00",
            "end_date": date,
            "end_time": "23:59:59"
        },
        "api_token": [token]
    });

    function sendRequest(request) {
        let xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                if (!this.responseText) {
                    $('#progress_block').hide();
                    clearTimeout(timeDelay["progress"]);
                    alert("搜尋失敗，請稍候再試一次!");
                    return;
                }
                let revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success == 1) {
                    let revInfo = revObj.Value[0].Values || [];
                    let record_sec = "";
                    revInfo.forEach(timeline => {
                        let sec = parseInt(timeline.time.split(" ")[1].split(":")[2], 10);
                        if (sec != record_sec) {
                            row_count++;
                            record_sec = sec;
                            $("#table_person_timeline tbody").append("<tr>" +
                                "<td>" + row_count + "</td>" +
                                "<td>" + timeline.time.split(" ")[1] + "</td>" +
                                "<td>" + mapList[timeline.map_id].map_name +
                                " ( " + parseInt(timeline.coordinate_x, 10) +
                                " , " + parseInt(timeline.coordinate_y, 10) +
                                " ) </td></tr>");
                        }
                    });

                    if (revObj.Value[0].Status == "1") {
                        //以1小時為基準，分批接受並傳送要求
                        count_times++;
                        $("#progress_bar").text(Math.round(count_times / 24 * 100) + " %");
                        timeDelay["search"].push(setTimeout(function () {
                            sendRequest({
                                "Command_Type": ["Read"],
                                "Command_Name": ["GetLocus_combine_hour"],
                                "Value": {
                                    "tag_id": revObj.Value[0].tag_id,
                                    "start_date": revObj.Value[0].start_date,
                                    "start_time": revObj.Value[0].start_time,
                                    "end_date": revObj.Value[0].end_date,
                                    "end_time": revObj.Value[0].end_time
                                },
                                "api_token": [token]
                            });
                        }, 100));
                    } else {
                        count_times++;
                        $("#progress_bar").text(Math.round(count_times / 24 * 100) + " %");
                        if (count_times >= 24)
                            completeSearch();
                    }
                }
            }
        };
        xmlHttp.send(JSON.stringify(request));
    }
}


/**
 * Show Search Model
 */
function showSearching() {
    $("#progress_bar").text("0 %");
    $('#progress_block').show();
    timeDelay["progress"] = setTimeout(function () {
        $('#progress_block').hide();
        clearTimeout(timeDelay["progress"]);
    }, 3600000);
}

function completeSearch() {
    $('#progress_block').hide();
    clearTimeout(timeDelay["progress"]);
    alert($.i18n.prop('i_searchOver'));
}

function getAttendanceList() {
    let interval_times = 0,
        count_times = 0,
        historyData = {},
        tagid_number = {},
        date = document.getElementById("date_one_day").value,
        date_arr = date.split("-"),
        members_length = sel_members_number.length,
        packge_percent = 100 / members_length / 24,
        alreadyFailed = false;

    document.getElementById("report_attend_date").innerText = date_arr[0] + "年" + date_arr[1] + "月" + date_arr[2] + "日";

    if (timeDelay["search"]) {
        timeDelay["search"].forEach(timeout => {
            clearTimeout(timeout);
        });
    }
    timeDelay["search"] = [];
    showSearching();

    $("#table_member_attendance tbody").empty();

    sel_members_number.forEach(function (number, i) {
        let member_data = memberList[number],
            tag_id = member_data.tag_id.substring(8);
        tagid_number[tag_id] = number;
        timeDelay["search"].push(setTimeout(function () {
            historyData[tag_id] = {
                first: null,
                last: null
            };
            sendRequest({
                "Command_Type": ["Read"],
                "Command_Name": ["GetLocus_combine_hour"],
                "Value": {
                    "tag_id": tag_id,
                    "start_date": date,
                    "start_time": "00:00:00",
                    "end_date": date,
                    "end_time": "23:59:59"
                },
                "api_token": [token]
            });
        }), 200 * i);
    });


    function sendRequest(request) {
        let xmlHttp = createJsonXmlHttp("sql");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                if (!this.responseText) {
                    $('#progress_block').hide();
                    clearTimeout(timeDelay["progress"]);
                    alert("搜尋失敗，請稍候再試一次!");
                    return;
                }
                let revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    let revInfo = revObj.Value[0].Values || [],
                        tag_id = revObj.Value[0].tag_id;
                    revInfo.forEach(timeline => {
                        if (!historyData[tag_id].first) {
                            historyData[tag_id].first = timeline;
                        } else {
                            historyData[tag_id].last = timeline;
                        }
                    });
                    interval_times++;
                    $("#progress_bar").text(Math.round(packge_percent * interval_times) + " %");

                    if (revObj.Value[0].Status == "1") {
                        //以1小時為基準，分批接受並傳送要求
                        timeDelay["search"].push(setTimeout(function () {
                            sendRequest({
                                "Command_Type": ["Read"],
                                "Command_Name": ["GetLocus_combine_hour"],
                                "Value": {
                                    "tag_id": tag_id,
                                    "start_date": revObj.Value[0].start_date,
                                    "start_time": revObj.Value[0].start_time,
                                    "end_date": revObj.Value[0].end_date,
                                    "end_time": revObj.Value[0].end_time
                                },
                                "api_token": [token]
                            });
                        }, 100));
                    } else {
                        let member_info = memberList[tagid_number[tag_id]],
                            attend_from = historyData[tag_id].first,
                            attend_end = historyData[tag_id].last,
                            tr_context = "";
                        count_times++;
                        tr_context += "<tr><td>" + count_times + "</td>";
                        for (let title in RowsList) {
                            if (RowsList[title]["attendance"] == true)
                                tr_context += "<td>" + member_info[title] + "</td>";
                        }
                        tr_context += "<td>" + (attend_from ? attend_from.time.split(" ")[1] : "缺席") + "</td>" +
                            "<td>" + (attend_end ? attend_end.time.split(" ")[1] : "缺席") + "</td></tr>";

                        $("#table_member_attendance tbody").append(tr_context);
                        if (members_length <= count_times) {
                            $("#progress_bar").text("100 %");
                            completeSearch();
                        }
                    }
                }
            }
        };
        xmlHttp.send(JSON.stringify(request));
    }
}