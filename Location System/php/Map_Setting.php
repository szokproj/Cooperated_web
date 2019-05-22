<!DOCTYPE html>
<html>

<head>
    <title>Location System</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!--BootStrap3-->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
    <!--JQuery庫-->
    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <link rel="stylesheet" href="/resources/demos/style.css">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <link rel="stylesheet" href="style.css" />
    <!-- Add icon library -->
    <link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.7.0/css/all.css' integrity='sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ' crossorigin='anonymous'>
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

        .custom-file-download {
            background-color: DodgerBlue;
			border: none;
			color: white;
			padding: 5px 12px;
			font-size: 16px;
			cursor: pointer;
        }

        .thumbnail img{
            width:100%
        }

    </style>
    <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script type="text/javascript" src="http:\\localhost\Location System\js\navbar_setting.js"></script>
    <script type="text/javascript" src="http:\\localhost\Location System\js\dialog_map_scale.js"></script>
    <script type="text/javascript">
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

        //測試用選取圖片的方式，實際上應該是接收Server上所有的地圖，並存成Cookie
        var img_count = 0;

		function loadImage(input) {
			var file = input.files[0];
			var src = URL.createObjectURL(file);
            img_count++;
			var map_id = "map_id_" + img_count;
			$("#maps_gallery").append("<div class=\"thumbnail\">"  +
				"<a href=\"" + src + "\" target=\"_blank\">" +
                "<img src=\"" + src + "\">" +
                "</a>" +
				"<div class=\"caption\">" +
                "<label>name: " +  
                "<input type=\"text\" id=\"" + map_id + "\"  value=\"_" + map_id + "\" style=\"max-width:80%;\">" +
                "</label>" +
				"</div>" +
			"</div>");
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
            <div class="col-lg-4" style="background-color:white;">
                <div>
                    <label for="map_download" class="custom-file-download">
                        Download Map <i class="	far fa-images"></i>
                    </label><br><br>
                    <input id="map_download" type="file" accept="image/*" onchange="loadImage(this)" />
                </div>
                <div id="maps_gallery"></div>
                
            </div>
            
            <div class="col-lg-8" style="background-color:white;">
                <div id="dialog_map_scale" title="Set Map Scale">
					<form>
						<fieldset style="text-align: center;">
							<label for="scale">1 : </label>
							<input type="text" name="scale" id="scale" value="3" style="max-width: 30px;">
							<!-- Allow form submission with keyboard without duplicating the dialog button -->
							<input type="submit" tabindex="-1" style="position:absolute; top:-1000px;">
						</fieldset>
                    </form>
                </div>
                <button id="Map_Scale" style="margin-right:30px;">Map Scale</button>
            </div>
        </div>    
    </div>
</body>

</html>