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
                <div id="wrapper">
					<!-- 導航欄開啟時的遮罩，設定顏色和長寬就可以形成遮罩 -->
					<div class="overlay">
					</div>
					<!-- Sidebar(Left) -->
					<nav class="navbar navbar-inverse navbar-fixed-top" id="sidebar-wrapper" role="navigation">
						<ul class="nav sidebar-nav">
							<li><a href="index.php"><img src="http:\\localhost\Location System\image\home.png" alt="首頁">首頁</a></li>
							<li><a href="Member_Setting.php"><img src="http:\\localhost\Location System\image\member_setting.png" alt="人員設置">人員設置</a></li>
							<li><a href="Timeline.php"><img src="http:\\localhost\Location System\image\timeline.png" alt="歷史軌跡">歷史軌跡</a></li>
							<li><a href="Map_Setting.php"><img src="http:\\localhost\Location System\image\map_setting.png" alt="地圖設定">地圖設定</a></li>
							<li><a href="Anchor_Setting.php"><img src="http:\\localhost\Location System\image\anchor_setting.svg" alt="Anchor設定">Anchor設定</a></li>
							<li><a href="Tag_Setting.php"><img src="http:\\localhost\Location System\image\tag_setting.png" alt="Tag設定">Tag設定</a></li>		
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
            <div class="col-lg-6" style="background-color:white;">
                
            </div>
            <div class="col-lg-6" style="background-color:white;">
                
            </div>
        </div>
        
    </div>
</body>

</html>