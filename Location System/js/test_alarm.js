var alarmArray = [];
var alarmObj = {};
var locating_id = "";

$(function () {
    //input draw
    setSize();
    alarmArray.forEach(function (v) {
        if (groupfindMap[v.group_id] == Map_id)
            drawAlarmTags(ctx, v.id, v.x, v.y, v.status, dot_size.alarm, 1 / Zoom);;
    });
    //Focus the position of this locating tag.
    if (isFocus) {
        var index = tagArray.findIndex(function (info) {
            return info.id == locating_id;
        });
        if (index > -1) {
            //console.log("focus_index: " + index);
            var target = tagArray[index];
            //console.log("group_id: " + target.group_id);
            var target_map_id = target.group_id in groupfindMap ? groupfindMap[target.group_id] : "";
            if (target_map_id != Map_id)
                changeFocusMap(target.group_id);
            focusAlarmTag(target.x, target.y);
            if (target.type == "alarm")
                drawAlarmFocusFrame(ctx, target.x, target.y, dot_size.alarm, 1 / Zoom);
            else
                drawFocusFrame(ctx, target.x, target.y, dot_size.tag, 1 / Zoom);
            //drawFocusMark(ctx, target.x, target.y, 1 / Zoom);
        }
    }

    var alarm = new Alarm("000000000000000A");
    alarmObj["000000000000000A"] = alarm;


});


function Alarm(tag_id) {
    var x, y, alarm_type = "";
    this.alarm_tag = tag_id;
    this.getTagID = function () {
        return tag_id;
    };
    this.alarm_type = alarm_type;
    this.setCoordinate = function (set_x, set_y) {
        if (set_x && set_y) {
            x = set_x;
            y = set_y;
        }
    };
    this.Focus = function () {
        locating_id = tag_id
    };
    this.ReleaseFocus = function () {
        locating_id = "";
    };
    this.Add = function () {
        alarmArray.push({
            tag_id: tag_id,
            x: x,
            y: y
        });
    };
    this.Delete = function () {
        var index = alarmArray.findIndex(function (info) {
            return info.tag_id == tag_id;
        });
        if (index > -1)
            alarmArray.splice(index, 1);
    };
}