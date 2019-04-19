<!DOCTYPE html>
<html>

<head>
    <title>Location System</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!--BootStrap3-->
    <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
	<script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
    <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <!--JQuery庫-->
    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <link rel="stylesheet" href="/resources/demos/style.css">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <link rel="stylesheet" href="style.css" />
    <!--編寫css-->
    <link rel=stylesheet type="text/css" href="http:\\localhost\Location System\css\bootstrap_collapsible_navbar.css">
    <style>
        table {border-collapse: collapse; width: 100%;}
        th, td {padding: 8px; text-align: left; border: 1px solid #808080;}
        tr:hover {background-color: #f5f5f5;}
        /*
        * 網頁內的輸入框
        */
        label, input { display:inline block;}
        input.text { margin-bottom:12px; width:95%; padding: .4em; }
        fieldset { padding:0; border:0; margin-top:25px; }
        h1 { font-size: 1.2em; margin: .6em 0; }
        .ui-dialog .ui-state-error { padding: .3em; }

        .top{
            text-align: center;
            padding: 0px 10px 10px 10px;
        }

        .middle{
            background-color: #eee;
            border: 1px #1d6795 solid;
            height: 300px;
            margin: 5px;
            overflow: auto;
        }

        .bottom{
            height: auto;
            max-height: 20%;
            max-width: 100%;
            text-align: center;
        }
        .mode_comport {
            margin: auto; 
            width: 400px; 
            padding: 100px; 
            text-align: left;
            display: none;
        }

        .checkBox_block{
            margin: auto;
            width: 400px;
            text-align: left;
            padding-top: 10px;
            padding-bottom: 10px;
        }

        .line_block {
            margin: auto;
            width: 400px;
            border: 2px solid #a8d3ee;
            padding: 20px;
            text-align: left;
        }

        .line_block th, td 
        {
            padding: 8px; 
            text-align: left; 
            border: none;
        }

    </style>
    <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script type="text/javascript" src="http:\\localhost\Location System\js\navbar_setting.js"></script>
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
                    var udpInfo = JSON.parse(this.responseText);
                    var list = "";
                    var tbody = document.getElementById("table_ip_address_info").getElementsByTagName("tbody");
                    for (var i = 0; i < udpInfo.Machine_Number.length; i++) {
                        list += "<tr><td>" + "<input type=\"checkbox\" name=\"" + (i + 1) + "\" value=\"" + true + "\"/>" +
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
                    tbody[0].innerHTML = list;                   
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
    <div class="container">
        <div class="row">
            <div class="col-lg-12" style="background-color:white;">
                <!-- 最上方黑色區塊 -->
                <div class="navbar navbar-fixed-top navbar-inverse" role="navigation">
                </div>
                <div style="height: 70px;width: 100%;">
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-12" style="background-color:white;">
                <!-- 側滑導航欄 -->
                <div id="wrapper">
                    <!-- 導航欄開啟時的遮罩，設定顏色和長寬就可以形成遮罩 -->
                    <div class="overlay">
                    </div>
                    <!-- Sidebar(Left) -->
                    <nav class="navbar navbar-inverse navbar-fixed-top" id="sidebar-wrapper" role="navigation">
                        <ul class="nav sidebar-nav">
                            <li class="sidebar-brand"><a href="#">Location Station</a></li>
                            <li><a href="index.php">地圖</a></li>
                            <li><a href="#">人員設置</a></li>
                            <li><a href="#">歷史軌跡</a></li>
                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                                    <i class="fa fa-fw fa-plus"></i>進階設定<span class="caret"></span>
                                </a>
                                <ul class="dropdown-menu" role="menu">
                                    <li class="dropdown-header"></li>
                                    <li class="dropdown">
                                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                                            <i class="fa fa-fw fa-plus"></i>高級設定<span class="caret"></span>
                                        </a>
                                        <ul class="dropdown-menu" role="menu">
                                            <li class="dropdown-header"></li>
                                            <li><a href="#">Inventory + Reference</a></li>
                                            <li><a href="#">Instruction</a></li>
                                            <li><a href="#">Device Setting</a></li>
                                            <li><a href="RF_Setting.php">RF Setting</a></li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </nav>
                    <!-- /#sidebar-wrapper -->

                    <!-- Page Content -->
                    <div id="page-content-wrapper">
                        <button type="button" class="hamburger is-closed animated fadeInLeft" data-toggle="offcanvas">
                            <!--<span class="hamb-center"></span>-->
                            <span class="hamb-top"></span>
                            <span class="hamb-middle"></span>
                            <span class="hamb-bottom"></span>
                        </button>
                    </div>
                    <!-- /#page-content-wrapper -->
                </div>
            </div>
        </div>
            
        <!-- 網頁內容 -->
        <div class="row">
            <h4>Device Connection:</h4>
            <div class="col-lg-12" style="background-color:white;">
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
                    <div class="middle">
                        <div style="width: 1400px;">
                            <table id="table_ip_address_info" class="ui-widget ui-widget-content">
                                <thead>
                                    <tr class="ui-widget-header ">
                                        <th>Check</th>
                                        <th>Status</th>
                                        <th>Machine Number</th>
                                        <th>Model Name</th>
                                        <th>IP Address</th>
                                        <th>Gateway</th>
                                        <th>Subnet Mask</th>
                                        <th>Client IP</th>
                                        <th>MAC Address</th>
                                        <th>TCP Server Port</th>
                                        <th>Udp Server Port</th>
                                        <th>Tcp Client Src Port</th>
                                        <th>Tcp Client Des Port</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                    <div style="padding: 0px 20px 0px 0px;">
                        <button type="button" onclick="alert('Deselect All!')" style="float:right;margin: 10px;">Deselect All</button>
                        <button type="button" onclick="alert('Select All!')" style="float:right;margin: 10px;">Select All</button>
                    </div>
                    <br>
                    <div class="bottom">
                        <form action="xxx.php">
                            <label>Local IP: </label>
                            <input type="text" name="local_ip" style="margin-right: 40px;">
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
                <div style="height: 30px;width: 100%;">
                </div>
            </div>
        </div>
        <div class="row">
            <h4>Device Setting:</h4>
            <div class="col-lg-6" style="background-color:white;">
                <div>
                    <div class="checkBox_block">
                        <input type="checkbox" name="is_network_setting" value="true">Network Setting:<br>
                    </div>
                    <div class="line_block">
                        <table style="border: 0px;">
                            <tr>
                                <th>
                                    <label>IP Address:</label>
                                </th>
                                <th>
                                    <input type="text" name="ip_address_1" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="ip_address_2" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="ip_address_3" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="ip_address_4" style="max-width: 30px;">
                                </th>
                            </tr>
                            <tr>
                                <th>
                                    <label>Mask Address:</label>
                                </th>
                                <th>
                                    <input type="text" name="mask_address_1" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="mask_address_2" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="mask_address_3" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="mask_address_4" style="max-width: 30px;">
                                </th>
                            </tr>
                            <tr>
                                <th>
                                    <label>Gateway Address:</label>
                                </th>
                                <th>
                                    <input type="text" name="gateway_address_1" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="gateway_address_2" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="gateway_address_3" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="gateway_address_4" style="max-width: 30px;">
                                </th>
                            </tr>
                            <tr>
                                <th>
                                    <label>Client IP:</label>
                                </th>
                                <th>
                                    <input type="text" name="client_ip_1" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="client_ip_2" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="client_ip_3" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="client_ip_4" style="max-width: 30px;">
                                </th>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-lg-6" style="background-color:white;">
                <div>
                    <div class="checkBox_block">
                        <input type="checkbox" name="basic_setting" value="true">Basic Setting:<br>
                    </div>
                    <div class="line_block">
                        <table>
                            <tr>
                                <th>
                                    <label>Sent Cycle:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        &nbsp;&nbsp;&nbsp;</label>
                                </th>
                                <th>
                                    <input type="text" name="sent_cycle_1" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="sent_cycle_2" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="sent_cycle_3" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="sent_cycle_4" style="max-width: 30px;">
                                </th>
                            </tr>
                            <tr>
                                <th>
                                    <label>Device ID:</label>
                                </th>
                                <th>
                                    <input type="text" name="device_id_1" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="device_id_2" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="device_id_3" style="max-width: 30px;">
                                    <label>.</label>
                                    <input type="text" name="device_id_4" style="max-width: 30px;">
                                </th>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-12" style="background-color:white;">
                <div style="padding: 30px 0px 30px 0px; width: 100%; text-align: center;">
                    <button type="button" onclick="alert('Read...')">Read</button>
                    <button type="button" onclick="alert('Write...')">Write</button>
                </div>
            </div>
        </div>
    </div>
</body>

</html>