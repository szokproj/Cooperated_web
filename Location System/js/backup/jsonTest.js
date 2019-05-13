var myObj = '{"items":["1","2"],' +
    '"name":["2","4"],' +
    '"id":["3","6"],' +
    '"time":["4","8"],' +
    '"alarm_status":["5","10"],' +
    '"image":["6","12"]}';

$(document).ready(function () {
    htmlobj = $.post({ url: "test.php", async: false });
    var revObj = JSON.parse(htmlobj.responseText);

    var table1 = "<table><tr style=\"background:lightgray;\">" +
        "<th>Items</th>" +
        "<th>Name</th>" +
        "<th>ID</th>" +
        "<th>Time</th>" +
        "<th>Alarm Status</th>" +
        "<th>Image</th></tr>";

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

    $("#txtHint1").html(table1);
});
