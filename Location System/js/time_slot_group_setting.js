let includeSlotsArr = [],
    count_time_groups = 0,
    count_time_group_slots = 0;

function importTimeSlotGroup() {
    inputTimeGroups();

    //Dialog to edit time group.
    let dialog, form,
        add_group_id = $("#add_time_group_id"),
        add_group_name = $("#add_time_group_name"),
        add_group_slots = document.getElementsByName("time_group_slot"),
        allFields = $([]).add(add_group_name);

    function submitTimeGroup() {
        allFields.removeClass("ui-state-error");
        if (checkLength(add_group_name, $.i18n.prop('i_alarmAlert_4'), 1, 50)) {
            if (add_group_slots.length == 0)
                return alert($.i18n.prop('i_alarmAlert_8'));
            let isRepeat = false;
            for (let i = 0; i < add_group_slots.length; i++) {
                for (let j = i + 1; j < add_group_slots.length; j++) {
                    if (add_group_slots[i].value == add_group_slots[j].value)
                        isRepeat = true;
                }
            }
            if (isRepeat)
                return alert($.i18n.prop('i_alarmAlert_16'));
            if (submit_type["time_group"] == "Add") {
                if (!confirm($.i18n.prop('i_alarmAlert_19')))
                    return;
                let requestJSON = JSON.stringify({
                    "Command_Type": ["Write"],
                    "Command_Name": ["AddTimeGroup"],
                    "Value": {
                        "time_group_name": add_group_name.val()
                    },
                    "api_token": [token]
                });
                let xmlHttp = createJsonXmlHttp("sql");
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                        let revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                            let revInfo = revObj.Value[0].Values || [];
                            add_group_id.val(revInfo.time_gid);
                            addTimeGroup_Slots();
                        } else {
                            alert($.i18n.prop('i_alarmAlert_18'));
                        }
                    }
                };
                xmlHttp.send(requestJSON);
            } else {
                let requestJSON = JSON.stringify({
                    "Command_Type": ["Write"],
                    "Command_Name": ["EditTimeGroup"],
                    "Value": {
                        "time_group_id": add_group_id.val(),
                        "time_group_name": add_group_name.val()
                    },
                    "api_token": [token]
                });
                let xmlHttp = createJsonXmlHttp("sql");
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                        let revObj = JSON.parse(this.responseText);
                        if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0)
                            updateTimeGroup_Slots();
                    }
                };
                xmlHttp.send(requestJSON);
            }
        }
    }

    dialog = $("#dialog_time_group_slot").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Confirm": submitTimeGroup,
            Cancel: function () {
                form[0].reset();
                allFields.removeClass("ui-state-error");
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        submitTimeGroup();
    });

    //新增時段群組與時段的關聯
    $("#btn_add_time_group_slot").on("click", function () {
        let count_time_group_slots = document.querySelectorAll("#table_time_group_slot tr").length,
            tr_id = "tr_time_group_slot" + count_time_group_slots;
        $("#table_time_group_slot tbody").append(
            "<tr id=\"" + tr_id + "\">" +
            "<td><input type='checkbox' name=\"chkbox_time_group_slot\" value=\"" + tr_id +
            "\" onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_time_group_slots + "</td>" +
            "<td><select name=\"time_group_slot\">" + createOptions_name(TimeSlotArr, TimeSlotArr[0].id) +
            "</select></td></tr>");
    });

    //刪除時段群組與時段的關聯
    $("#btn_delete_time_group_slot").on("click", function () {
        let save_time_slots = [],
            items = document.getElementsByName("chkbox_time_group_slot"),
            timeslots = document.getElementsByName("time_group_slot"); //timeslot_ids
        for (let k = 0; k < items.length; k++) {
            if (!items[k].checked)
                save_time_slots.push(timeslots[k].value);
        }
        if (save_time_slots.length == items.length)
            return alert($.i18n.prop('i_alarmAlert_9'));
        $("#table_time_group_slot tbody").empty();
        save_time_slots.forEach(function (time_slot_id, index) {
            let tr_id = "tr_time_group_slot" + (index + 1);
            $("#table_time_group_slot tbody").append(
                "<tr id=\"" + tr_id + "\">" +
                "<td><input type='checkbox' name=\"chkbox_time_group_slot\" value=\"" + tr_id +
                "\" onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + (index + 1) + "</td>" +
                "<td><select name=\"time_group_slot\">" + createOptions_name(TimeSlotArr, time_slot_id) +
                "</select></td></tr>");
        });
    });

    //按下新增Time Group
    $("#btn_add_time_group").button().on("click", function () {
        submit_type["time_group"] = "Add";
        $("#add_time_group_id").val("");
        $("#add_time_group_name").val("");
        $("#table_time_group_slot tbody").empty();
        dialog.dialog("open");
    });

    //按下刪除Time Group
    $("#btn_delete_time_group").button().on("click", function () {
        let checkboxs = document.getElementsByName("chkbox_time_group"),
            delete_arr = [];
        for (k in checkboxs) {
            if (checkboxs[k].checked)
                delete_arr.push({
                    "time_group_id": checkboxs[k].value
                });
        }
        if (delete_arr.length == 0) {
            alert($.i18n.prop('i_alarmAlert_10'));
            return;
        }
        let requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["DeleteTimeGroup"],
            "Value": delete_arr,
            "api_token": [token]
        });
        let deleteXmlHttp = createJsonXmlHttp("sql");
        deleteXmlHttp.onreadystatechange = function () {
            if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
                let revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    inputTimeGroups();
                }
            }
        };
        deleteXmlHttp.send(requestJSON);
    });

    function updateTimeGroup_Slots() {
        if (includeSlotsArr.length == 0)
            return;
        let requestJSON = JSON.stringify({
            "Command_Type": ["Write"],
            "Command_Name": ["DeleteTimeSlotGroup"],
            "Value": includeSlotsArr,
            "api_token": [token]
        });
        let deleteXmlHttp = createJsonXmlHttp("sql");
        deleteXmlHttp.onreadystatechange = function () {
            if (deleteXmlHttp.readyState == 4 || deleteXmlHttp.readyState == "complete") {
                let revObj = JSON.parse(this.responseText);
                if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                    addTimeGroup_Slots();
                }
            }
        };
        deleteXmlHttp.send(requestJSON);
    }

    function addTimeGroup_Slots() {
        let count = 0;
        addTimeSlot(add_group_slots[count].value);

        function addTimeSlot(time_slot_id) {
            let request = {
                "Command_Type": ["Write"],
                "Command_Name": ["AddTimeSlotGroup"],
                "Value": {
                    "time_group_id": $("#add_time_group_id").val(),
                    "time_slot_id": time_slot_id
                },
                "api_token": [token]
            };
            let addXmlHttp = createJsonXmlHttp("sql");
            addXmlHttp.onreadystatechange = function () {
                if (addXmlHttp.readyState == 4 || addXmlHttp.readyState == "complete") {
                    let revObj = JSON.parse(this.responseText);
                    if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                        count++;
                        if (count < add_group_slots.length) {
                            addTimeSlot(add_group_slots[count].value);
                        } else {
                            inputTimeGroups();
                            dialog.dialog("close");
                        }
                    } else {
                        alert($.i18n.prop('i_alarmAlert_18'));
                        inputTimeGroups();
                        return;
                    }
                }
            };
            addXmlHttp.send(JSON.stringify(request));
        }
    }
}

function inputTimeGroups() {
    let request = {
        "Command_Type": ["Read"],
        "Command_Name": ["GetTimeGroup_list"],
        "api_token": [token]
    };
    let xmlHttp = createJsonXmlHttp("sql");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            let revObj = JSON.parse(this.responseText);
            if (checkTokenAlive(token, revObj) && revObj.Value[0].success > 0) {
                count_time_groups = 0;
                $("#table_time_group tbody").empty();
                TimeGroupArr = revObj.Value[0].Values.slice(0) || [];
                inputAlarmGroupTable(); //載入警報群組已設定的內容
                for (i = 0; i < TimeGroupArr.length; i++) {
                    let timelist_name = [];
                    TimeGroupArr[i]["id"] = TimeGroupArr[i].time_group_id;
                    TimeGroupArr[i]["name"] = TimeGroupArr[i].time_group_name;
                    if (TimeGroupArr[i].elements) {
                        TimeGroupArr[i].elements.forEach(element => {
                            timelist_name.push(element.time_slot_name);

                        });
                    }
                    count_time_groups++;
                    let tr_id = "tr_time_group_" + count_time_groups;
                    $("#table_time_group tbody").append("<tr id=\"" + tr_id + "\">" +
                        "<td><input type='checkbox' name=\"chkbox_time_group\" value=\"" + TimeGroupArr[i].time_group_id +
                        "\" onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_time_groups + "</td>" +
                        "<td><label name=\"time_group_name\">" + TimeGroupArr[i].time_group_name + "</label></td>" +
                        "<td><label name=\"time_group_slots\">" + timelist_name.toString() + "</label></td>" +
                        "<td style='text-align:center;'><label for=\"btn_edit_time_group_" + count_time_groups +
                        "\" class='btn-edit' title='" + $.i18n.prop('i_editTimeSlotGroup') + "'><i class='fas fa-edit'" +
                        " style='font-size:18px;'></i></label>" +
                        "<input id=\"btn_edit_time_group_" + count_time_groups + "\" type='button' class='btn-hidden'" +
                        " onclick=\"inputTimeGroupSlots(\'" + TimeGroupArr[i].time_group_id + "\')\" /></td></tr>");
                }
            } else {
                alert($.i18n.prop('i_alarmAlert_6'));
                return;
            }
        }
    };
    xmlHttp.send(JSON.stringify(request));
}


function inputTimeGroupSlots(time_group_id) {
    submit_type["time_group"] = "Edit";
    let index = TimeGroupArr.findIndex(function (info) {
        return info.time_group_id == time_group_id;
    });
    if (index > -1) {
        $("#add_time_group_id").val(time_group_id);
        $("#add_time_group_name").val(TimeGroupArr[index].time_group_name);
        $("#table_time_group_slot tbody").empty();
        includeSlotsArr = [];
        count_time_group_slots = 0;
        if (TimeGroupArr[index].elements) {
            TimeGroupArr[index].elements.forEach(element => {
                count_time_group_slots++;
                let tr_id = "tr_time_group_slot" + count_time_group_slots;
                $("#table_time_group_slot tbody").append(
                    "<tr id=\"" + tr_id + "\">" +
                    "<td><input type='checkbox' name=\"chkbox_time_group_slot\" value=\"" + tr_id +
                    "\" onchange=\"selectColumn(\'" + tr_id + "\')\" />  " + count_time_group_slots + "</td>" +
                    "<td><select name=\"time_group_slot\">" + createOptions_name(TimeSlotArr, element.time_slot_id) +
                    "</select></td></tr>");

                //紀錄原本時段群組內包含多少時段，以便更新時使用
                includeSlotsArr.push({
                    "time_group_id": time_group_id,
                    "time_slot_id": element.time_slot_id
                });
            });
        }
        $("#dialog_time_group_slot").dialog("open");
    } else {
        alert($.i18n.prop('i_alarmAlert_7'));
    }
}