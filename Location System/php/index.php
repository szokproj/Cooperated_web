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
    <!--Jquery庫-->
    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
	<!-- Add icon library -->
	<link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.7.0/css/all.css' integrity='sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ' crossorigin='anonymous'>
	<!--編寫css-->
    <link rel=stylesheet type="text/css" href="http:\\localhost\Location System\css\bootstrap_collapsible_navbar.css">
	<link rel=stylesheet type="text/css" href="http:\\localhost\Location System\css\jquery_right_side_nav.css">
	<link rel=stylesheet type="text/css" href="http:\\localhost\Location System\css\alarm_sideBar.css">
    <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 8px; text-align: left; border: 1px solid #808080; }
        tr:hover { background-color: #f5f5f5; }
        /*
        * 網頁內的輸入框
        */
        label, input { display:inline block; }
        input.text { margin-bottom:12px; width:95%; padding: .4em; }
        fieldset { padding:0; border:0; margin-top:25px; }
        h1 { font-size: 1.2em; margin: .6em 0; }
        .ui-dialog .ui-state-error { padding: .3em; }

        /*修改原本Navbar的寬度*/
        .navbar-nav > li > a { padding-top:5px !important; padding-bottom:5px !important; }
        .navbar { min-height:50px !important }

        #wrapper.right_open { padding-right: 320px;}
		
		#wrapper.left_open { padding-left: 340px;}

        .cvsBlock {
            -webkit-flex: 1;
            -ms-flex: 1;
            flex: 1;
            background: #ccc;
            height: 630px;
            overflow: auto;
            /*border-radius: 25px;*/
            /*border: 1px black solid;*/
        }

        /*Alarm Dialog*/
        .thumbnail{
            display: inline-block;
			background: #ff3333;
            width: 300px;
		}
		
		.thumbnail:hover{
			background: green;
			border: 1px solid white;
			cursor: pointer;
        }

        .thumbnail img{
			background: white;
			height: 100px;
			weight: 100px;
        }

        .thumbnail p{
            font-weight:bold;
            line-height: 7px;
        }

		.icon_btn {
			background-color: DodgerBlue;
			border: none;
			color: white;
			padding: 5px 12px;
			font-size: 16px;
			cursor: pointer;
		}

		.icon_btn:hover {
			background-color: RoyalBlue;
		}

		.dropup{
			display: inline-block; 
			margin-right:30px;
			font-size: 16px;
		}

		.dropup .dropdown-menu li input {
			color: #000000;
			background-color: rgba(0, 0, 0, 0);
			width: 100%;
			height: 100%;
			display: block;
			border: 0px;
			padding: 10px 0px 10px 30px;
			text-decoration: none;
			text-align: start;
			font-family: Sans-serif;
			font-size: 14px;
		}
		/*------------------------------------------*/

    </style>
    <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
	<script type="text/javascript" src="http:\\localhost\Location System\js\dialog_anchor_list.js"></script>
	<script type="text/javascript" src="http:\\localhost\Location System\js\dialog_anchor_position.js"></script>
	<script type="text/javascript" src="http:\\localhost\Location System\js\canvas_request.js"></script>
    <script type="text/javascript" src="http:\\localhost\Location System\js\dialog_map_scale.js"></script>
	<script type="text/javascript" src="http:\\localhost\Location System\js\navbar_setting.js"></script>
	<script type="text/javascript" src="http:\\localhost\Location System\js\sideBar.js"></script>
	<script type="text/javascript">
	/*	var revObj = { id: [0, 1], alarm_status: [123, 456], time: ["2019/2/12/14:49:00:00", "2019/2/12/15:49:00:00"], name: [234, 123], image: [234, 123] };

		function testAlarm() {
			var list = "", items;
			var alarmIndex = -1;
			var tbody = document.getElementById("table_rightbar_alarm_list").getElementsByTagName("tbody");
			for (var i = 0; i < revObj.id.length; i++) {
				items = i + 1;
				list += "<tr><td>" + items +
					"</td><td>" + revObj.id[i] +
					"</td><td>" + revObj.alarm_status[i] +
					"</td><td>" + revObj.time[i] +
					"</td><td>" + revObj.name[i] +
					"</td><td>" + revObj.image[i] +
					"</td></tr>";
			}
			tbody[0].innerHTML = list;

			var time_arr = TimeToArray(revObj.time[items - 1]);
			var thumb_id = "alarmCard_" + items;
			$(".thumbnail_columns").append("<div class=\"thumbnail\" id=\"" + thumb_id + "\">" +
				"<table>" +
				"<tr>" +
				"<td style=\"border: none;\">" +
				"<img src=\"http://localhost/Location System/image/user2.png\">" +
				"</td>" +
				"<td style=\"border: none;\">" +
				"<p>Number:" + items + "</p>" +
				"<p>Name:" + revObj.name[items - 1] + "</p>" +
				"<p>ID:" + revObj.id[items - 1] + "</p>" +
				"<p>Date:" + time_arr.date + "</p>" +
				"<p>Time:" + time_arr.time + "</p>" +
				"<p>Status:" + revObj.alarm_status[items - 1] + "</p>" +
				"<p><a href=\"#\" class=\"btn btn-success\" role=\"button\">進行處理</a>" +
				"<a href=\"#\" class=\"btn btn-info\" role=\"button\" style=\"margin-left: 10px;\">定位</a></p>" +
				"</td>" +
				"</tr>" +	
				"</table>" +
				"</div>");
			document.getElementById(thumb_id).addEventListener("click", function(){
				$("#" + thumb_id).hide();
			});
			if (revObj.id.length > 0){
				document.getElementById("sideBarLeft_light").src = "http://localhost/Location System/image/alarm1.png";
			}else{
				document.getElementById("sideBarLeft_light").src = "http://localhost/Location System/image/alarm3.png";
			}
		}
				
	function TimeToArray(time_str) {
    	if (time_str.length > 0) {
			var break_index = time_str.lastIndexOf("/");
			return {
				date: time_str.substring(0, break_index),
				time: time_str.substring(break_index + 1, time_str.length)
			};
		}
	}
	*/

    </script>
</head>

<body>
	<div class="container">
		<div class="row">
			<div class="col-lg-12" style="background-color:white;">
				<!-- 最上方黑色區塊 -->
				<div class="navbar navbar-fixed-top navbar-inverse" role="navigation">
				</div>
				<div style="height: 60px;width: 100%;">
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

					<div id="dialog_map_scale" title="Set Map Scale">
						<form>
							<fieldset style="text-align: center;">
								<label for="scale">1 : </label>
								<input type="text" name="scale" id="scale" value="3" style="max-width: 30px;">
								<!-- Allow form submission with keyboard without duplicating the dialog button -->
								<input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
							</fieldset>
						</form>
					</div>
					<!-- Following is a dialog to add a new anchor -->
					<div id="dialog_add_new_anchor" title="Add New Anchor">
						<form>
							<fieldset style="text-align: left;">
								<label for="anchor_type">Anchor Type:</label>
								<select id="anchor_type" name="anchor_type">
									<option value="Anchor" selected="selected">Anchor</option>
									<option value="Main Anchor">Main Anchor</option>
								</select>
								<br><br>
								<label for="anchor_id">Anchor ID:</label>
								<input type="text" name="anchor_id" id="anchor_id" value="" style="max-width:100px;">
								(0 ~ 65535)
								<br><br>
								<label for="anchor_x">X:</label>
								<input type="text" name="anchor_x" id="anchor_x" value="" style="max-width:100px;">
								<br><br>
								<label for="anchor_y">Y:</label>
								<input type="text" name="anchor_y" id="anchor_y" value="" style="max-width:100px;">
								<br><br>
								<!-- Allow form submission with keyboard without duplicating the dialog button -->
								<input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
							</fieldset>
						</form>
					</div>
					<!-- Following is a dialog to show all anchors -->
					<div id="dialog_anchor_list" title="Anchor List">
						<form>
							<fieldset style="text-align: center;">
								<table id="table_main_anchor_list" class="ui-widget ui-widget-content">
									<thead>
										<tr class="ui-widget-header ">
											<th>Main Anchor ID</th>
											<th>X</th>
											<th>Y</th>
										</tr>
									</thead>
									<tbody></tbody>
								</table>
								<br><br>
								<table id="table_anchor_list" class="ui-widget ui-widget-content">
									<thead>
										<tr class="ui-widget-header ">
											<th>Anchor ID</th>
											<th>X</th>
											<th>Y</th>
										</tr>
									</thead>
									<tbody></tbody>
								</table>
								<!-- Allow form submission with keyboard without duplicating the dialog button -->
								<input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
							</fieldset>
						</form>
					</div>

					<!-- Modal -->
					<div class="modal fade" id="myModal" role="dialog">
						<div class="modal-dialog">
							<div class="modal-content">
								<div class="modal-header">
									<button type="button" class="close" data-dismiss="modal">&times;</button>
									<h4 class="modal-title">Alarm Dialog</h4>
								</div>
								<div class="modal-body">
									<img src="http:\\localhost\Location System\image\user.png">
									<p>Number:</p>
									<p>Name:</p>
									<p>ID:</p>
									<p>Date:</p>
									<p>Time:</p>
									<p>Status:</p>
								</div>
								<div class="modal-footer">
                                    <button type="button" class="btn btn-danger" data-dismiss="modal">地圖定位</button> 
                                    <button type="button" class="btn btn-default"data-dismiss="modal">進行處理</button>
								</div>
							</div>
						</div>
                    </div>
                


					<!--網頁內容-->
					<div class="cvsBlock" id="cvsBlock">
						<canvas id="canvas" style="height: 300px;">
							此瀏覽器不支援canvas，請更換成Chrome瀏覽器
						</canvas>
                    </div>
                    <br>
					<div>
						<div style="float: right;">
							<span id="scale_visible" style="margin-right:30px;">Map Scale: initial</span>
							X:<input type="text" name="x" id="x" value="" style="max-width: 50px;">
							Y:<input type="text" name="y" id="y" value="" style="max-width: 50px;">
						</div>
						<div>
							<button class="btn icon_btn" onclick="restoreCanvas();" style="margin-right:30px;">恢復原比例 <i class="fas fa-compress"></i></button>
							<button class="btn icon_btn" onclick="getServerImage();" style="margin-right:30px;">導入地圖 <i class="far fa-image"></i></button>
							<button class="btn icon_btn" id="btn_start" onclick="StartClick();" style="margin-right:30px;">Start <i class="fas fa-play"></i></button>
							<div class="dropup">
								<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">
									設定 <i class="fas fa-cog"></i> <span class="caret"></span>
								</button>
								<ul class="dropdown-menu">
									<li><input type="button" id="Map_Scale" value="Map Scale"></li>
									<li><input type="button" id="Anchor_Position" value="Anchor Position" onclick="clickAnchorPosition();"></li>
								</ul>
							</div>
						<button onclick="testAlarm();" style="margin-right:30px;">test</button>
						</div>
						
					</div>
					
					<!--左側邊欄(Alarm)-->
					<div class="sideBar">
						<div class="sideBar-left">
							<div class="thumbnail_columns"></div>	
						</div>
						<div class="nav-icon">
							<img id="sideBarLeft_light" src="http:\\localhost\Location System\image\alarm3.png">
						</div>
					</div>
				
					
                    <!--右側邊欄-->
					<div class="page-main" id="page_rightSide">
						<aside>
							<div class="main-place">
								<ul id="sidebarRightTab" class="nav nav-tabs">
									<li class="active">
										<a href="#sidebar_right_member" data-toggle="tab">人員名單</a>
									</li>
									<li><a href="#sidebar_right_alarm" data-toggle="tab">警報</a>
									</li>
									<li><a href="#sidebar_right_search" data-toggle="tab">搜尋</a>
									</li>
								</ul>
								<div id="sidebarRightTabContent" class="tab-content">
									<div class="tab-pane fade in active" id="sidebar_right_member">
										<div style="overflow:auto; height: 600px; margin: 10px 5px 0px 0px;">
											<table id="table_rightbar_member_list" class="ui-widget ui-widget-content">
												<thead>
													<tr class="ui-widget-header ">
														<th style="width: 10px;">Items</th>
														<th>Display ID</th>
														<th>Name</th>
														<th>Tag List</th>
													</tr>
												</thead>
												<tbody></tbody>
											</table>
										</div>
									</div>
									<div class="tab-pane fade" id="sidebar_right_alarm">
										<div style="overflow:auto; height: 600px; width: 300px; margin: 10px 10px 0px 0px;">
											<div style="width: 800px;">
												<table id="table_rightbar_alarm_list" class="ui-widget ui-widget-content">
													<thead>
														<tr class="ui-widget-header ">
															<th style="width: 10px;">Items</th>
															<th style="width: 60px;">ID</th>
															<th>Alarm Status</th>
															<th>Time</th>
															<th>Name</th>
															<th>Image</th>
														</tr>
													</thead>
													<tbody></tbody>
												</table>
											</div>
										</div>
									</div>
									<div class="tab-pane fade" id="sidebar_right_search">
										<label>搜尋類型 : </label>
										<select id="search_select_type">
											<option value="group" selected="selected">群組</option>
											<option value="id">ID</option>
											<option value="name">名稱</option>
										</select>
										<br>
										<label>輸入資料 : </label>
										<input type="text" id="search_input_target">
										<br>
										<label>時間 : </label>
										<br>
										<div style="margin-left: 10px;">
											<label>開始 : </label>
											<input type="date" id="start_date">
											<label>時 : </label>
											<input type="text" id="start_time" style="width: 30px;">
											<br>
											<label>結束 : </label>
											<input type="date" id="end_date">
											<label>時 : </label>
											<input type="text" id="end_time" style="width: 30px;">
											<br>
										</div>
										<br><br>
										<div style="text-align: center;">
											<input type="button" id="search_start" value="搜尋" onclick="">
										</div>
									</div>
								</div>
							</div>
							<button class="button_arrow"><img src="https://c2.staticflickr.com/6/5635/31065147822_9b6e31ab5f_o.png"></button>
						</aside>
					</div>
				</div>
            </div>
        </div>
	</div>
</body>


</html>