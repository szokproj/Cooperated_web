<!DOCTYPE html>
<html>

<head>
    <title>Location System</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel=stylesheet type="text/css" href="http:\\localhost\Location System\css\head_type.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

    <style>
    .top{
        text-align: center;
        padding: 10px;
    }

    .body{
        background-color: #eee;
        border: 1px black solid;
        height: 400px;
        overflow: auto;
        margin: 5px;
    }

    .bottom{
        height: auto;
        max-height: 20%;
        max-width: 100%;
        text-align: center;
    }

    table {
        border-collapse: collapse;
        width: 100%;
    }

    th,
    td {
        max-height: 20px;
        padding: 8px;
        text-align: left;
        border: 1px solid #808080;
    }

    tr:hover {
        background-color: #f5f5f5;
    }

    .mode_comport {
        margin: auto; 
        width: 400px; 
        padding: 100px; 
        text-align: left;
        display: none;
    }

    </style>

    <script type="text/javascript">
        $(document).ready(function(){
            $("#select_connect_mode").change(function(){
                var opt = $(this).children('option:selected').val();
                if(opt == "ethernet") {
                    $(".mode_ethernet").show();
                    $(".mode_comport").hide();
                    $("#btn_search").show();
                } else {
                    $(".mode_ethernet").hide();
                    $(".mode_comport").show();
                    $("#btn_search").hide();
                }
            });
        });


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

        function Search() {
            var xmlHttp = GetXmlHttpObject();
            if (xmlHttp == null) {
                alert("Browser does not support HTTP Request");
                return;
            }
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var table = "<table><tr style=\"background:lightgray;\">" +
                        "<th>Check</th>" +
                        "<th>Status</th>" +
                        "<th>Machine Number</th>" +
                        "<th>Model Name</th>" +
                        "<th>IP Address</th>" +
                        "<th>Gateway</th>" +
                        "<th>Subnet Mask</th>" +
                        "<th>Client IP</th>" +
                        "<th>MAC Address</th>" +
                        "<th>TCP Server Port</th>" +
                        "<th>Udp Server Port</th>" +
                        "<th>Tcp Client Src Port</th>" +
                        "<th>Tcp Client Des Port</th>";
                    var udpInfo = JSON.parse(this.responseText);
                    for (var i = 0; i < udpInfo.Machine_Number.length; i++) {
                        table += "<tr><td>" + "<input type=\"checkbox\" name=\"" + (i + 1) + "\" value=\"" + true + "\"/>" +
                            "</td><td>" + "<img src=\"redLight.png\"/>" +
                            "</td><td>" + udpInfo.Machine_Number[i] +
                            "</td><td>" + udpInfo.Model[i] +
                            "</td><td>" + udpInfo.IP_address[i] +
                            "</td><td>" + udpInfo.Gateway_address[i] +
                            "</td><td>" + udpInfo.Mask_address[i] +
                            "</td><td>" + udpInfo.Client_ip_addr[i] +
                            "</td><td>" + udpInfo.MAC_address[i] +
                            "</td><td>" + udpInfo.TCP_Serve_Port[i] +
                            "</td><td>" + udpInfo.UDP_Serve_Port[i] +
                            "</td><td>" + udpInfo.TCP_Client_Src_Port[i] +
                            "</td><td>" + udpInfo.TCP_Client_Des_Port[i] +
                            "</td></tr>";
                    }
                    table += "</table>";
                    document.getElementById("txtHint1").innerHTML = JSON.table;
                }
            }
            xmlHttp.open("POST", "search", true);
            xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlHttp.send();
        }

        function Connect() {
            var xmlHttp = GetXmlHttpObject();
            if (xmlHttp == null) {
                alert("Browser does not support HTTP Request");
                return;
            }
            xmlHttp.open("GET", "connect", true);
            xmlHttp.responseType = "text";
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == xmlHttp.DONE) {
                    var blob = xmlHttp.response;
                    loadImage(blob);
                }
            }
            xmlHttp.send();
        }
    </script>
</head>

<body>
    <div class="header">
        <label>RFID Monitoring Station</label>
    </div>
    <ul class="head-title">
        <li><a href="Position.php">Position</a></li>
        <li><a class="active" href="Device Connection.php">Device Connection</a></li>
        <li><a href="Device Setting.php">Device Setting</a></li>
        <li><a href="RF Setting.php">RF Setting</a></li>
        <li><a href="Inventory.php">Inventory</a></li>
        <li><a href="Reference.php">Reference</a></li>
        <li><a href="Advance cmd.php">Advance cmd</a></li>
        <li><a href="Update.php">Update</a></li>
        <li style="float:right"><a href="About.php">About</a></li>
    </ul>
    <div class="top">
        <label>Interface: </label>
        <select id="select_connect_mode">
            <option value="ethernet" selected="selected">Ethernet</option>
            <option value="comport">Comport</option>
        </select>
        <button type="button" id="btn_search" onclick="Search()">Search</button>
        <button type="button" id="btn_connect" onclick="alert('Connecting...')">Connection</button>
    </div>
    <div class="mode_comport">
        <label>Comport: </label>
        <select>
            <option value="">COM5</option>
        </select>
    </div>
    <div class="mode_ethernet">
        <div class="body">
            <div id="txtHint1">尚未載入資料</div>
        </div>
        <div style="padding: 20px;">
            <button type="button" onclick="alert('Deselect All!')" style="float:right;margin: 10px;">Deselect All</button>
            <button type="button" onclick="alert('Select All!')" style="float:right;margin: 10px;">Select All</button>
        </div>
        <div style="padding: 20px;">
        </div>
        <div class="bottom">
            <form action="xxx.php">
                <label>Local IP: </label>
                <input type="text" name="local_ip">
                <br><br>
                <input type="checkbox" name="is_fixed_ip_connect" value="true">Fixed IP connect:
                <input type="text" name="fixed_ip_1" style="max-width: 30px;">
                <label>.</label>
                <input type="text" name="fixed_ip_2" style="max-width: 30px;">
                <label>.</label>
                <input type="text" name="fixed_ip_3" style="max-width: 30px;">
                <label>.</label>
                <input type="text" name="fixed_ip_4" style="max-width: 30px;">
                <br><br>
                <label>Network interface card: </label>
                <select>
                    <option value="connection">Intel(R) 82583V Gigabit Network Connection</option>
                    <option value="loopback interface">Software Loopback Interface 1</option>
                </select>
            </form>
        </div>
    </div>
</body>

</html>