<!DOCTYPE html>
<html>

<head>
	<title>Location System</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel=stylesheet type="text/css" href="http:\\localhost\Location System\css\head_type.css">
	<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <link rel="stylesheet" href="/resources/demos/style.css">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
	<style>
	ul {
		/* 取消ul預設的內縮及樣式 */
		margin: 0;
		padding: 0;
		list-style: none;
	}

	ul.drop-down-menu {
		border: #ccc 1px solid;
		display: inline-block;
		font-family: 'Open Sans', Arial, sans-serif;
		font-size: 13px;
	}

	ul.drop-down-menu li {
		position: relative;
		white-space: nowrap;
		border-right: #ccc 1px solid;
	}

	ul.drop-down-menu>li:last-child {
		border-right: none;
	}

	ul.drop-down-menu>li {
		float: left;
		/* 只有第一層是靠左對齊*/
	}

	ul.drop-down-menu input {
		background-color: #fff;
		color: #333;
		display: block;
		padding: 0 30px;
		text-decoration: none;
		line-height: 40px;
	}

	ul.drop-down-menu input:hover {
		/* 滑鼠滑入按鈕變色*/
		background-color: #ef5c28;
		color: #fff;
	}

	ul.drop-down-menu li:hover>input {
		/* 滑鼠移入次選單上層按鈕保持變色*/
		background-color: #ef5c28;
		color: #fff;
	}

	ul.drop-down-menu button {
		background-color: #fff;
		color: #333;
		display: block;
		padding: 0 30px;
		text-decoration: none;
		line-height: 40px;
	}

	ul.drop-down-menu button:hover {
		/* 滑鼠滑入按鈕變色*/
		background-color: #ef5c28;
		color: #fff;
	}

	ul.drop-down-menu li:hover>button {
		/* 滑鼠移入次選單上層按鈕保持變色*/
		background-color: #ef5c28;
		color: #fff;
	}

	ul.drop-down-menu ul {
		border: #ccc 1px solid;
		position: absolute;
		z-index: 99;
		left: -1px;
		top: 100%;
		min-width: 180px;
	}

	ul.drop-down-menu ul li {
		border-bottom: #ccc 1px solid;
	}

	ul.drop-down-menu ul li:last-child {
		border-bottom: none;
	}

	ul.drop-down-menu ul ul {
		/*第三層以後的選單出現位置與第二層不同*/
		z-index: 999;
		top: 10px;
		left: 90%;
	}

	ul.drop-down-menu ul {
		/*隱藏次選單*/
		display: none;
	}

	ul.drop-down-menu li:hover>ul {
		/* 滑鼠滑入展開次選單*/
		display: block;
	}

	/*
	** dropDownMenu
	*/

    /* Create three unequal columns that floats next to each other */
    .column {
        float: left;
        padding: 10px;
    }

    /* Left and right column */
    .column.side {
        width: 30%;
		max-height: 600px;
		overflow: auto;
    }

    /* Middle column */
    .column.main {
        width: 70%;
    }

    /* Clear floats after the columns */
    .row:after {
        content: "";
        display: table;
        clear: both;
    }

    /* Responsive layout - makes the three columns stack on top of each other instead of next to each other */
    @media screen and (max-width: 600px) {

        .column.main,
        .column.side {
            width: 100%;
        }
    }


    /* Style the navigation menu */
    nav {
        -webkit-flex: 1;
        -ms-flex: 1;
        flex: 1;
        background: #ccc;
        height: 400px;
        overflow: auto;
        border: 1px black solid;
    }

    table {
        border-collapse: collapse;
        width: 100%;
    }

    th,
    td {
        padding: 8px;
        text-align: left;
        border: 1px solid #808080;
    }

    tr:hover {
        background-color: #f5f5f5;
	}
	
    /*
    * 網頁內的輸入框
    */
    label, input { display:inline block;}
    input.text { margin-bottom:12px; width:95%; padding: .4em; }
    fieldset { padding:0; border:0; margin-top:25px; }
    h1 { font-size: 1.2em; margin: .6em 0; }
    .ui-dialog .ui-state-error { padding: .3em; }
	
	</style>
	<script src="https://code.jquery.com/jquery-1.12.4.js"></script>
	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
	<script type="text/javascript" src="http:\\localhost\Location System\js\dialog_anchor_list.js"></script>
	<script type="text/javascript" src="http:\\localhost\Location System\js\dialog_anchor_position.js"></script>
	<script type="text/javascript" src="http:\\localhost\Location System\js\canvas_request.js"></script>
	<script type="text/javascript" src="http:\\localhost\Location System\js\dialog_map_scale.js"></script>
	<script type="text/javascript">

	</script>
</head>

<body>
	<div class="header">
		<label>RFID Monitoring Station</label>
	</div>
	<ul class="head-title">
		<li><a class="active" href="Position.php">Position</a></li>
		<li><a href="Device Connection.php">Device Connection</a></li>
		<li><a href="Device Setting.php">Device Setting</a></li>
		<li><a href="RF Setting.php">RF Setting</a></li>
		<li><a href="Inventory.php">Inventory</a></li>
		<li><a href="Reference.php">Reference</a></li>
		<li><a href="Advance cmd.php">Advance cmd</a></li>
		<li><a href="Update.php">Update</a></li>
		<li style="float:right"><a href="About.php">About</a></li>
	</ul>

	<ul class="drop-down-menu">
		<li><input type="button" id="Setting" value="Setting">
			<ul>
				<li><input type="button" id="Map_Setting" value="Map Setting">
					<ul>
						<li><input type="file" id="Map_Select" accept="image/png" onchange="loadImage(this.files[0])">			
						</li>
						<li><button id="Map_Scale">Map Scale</button>
						</li>
					</ul>
				</li>
				<li><input type="button" id="Anchor_Setting" value="Anchor Setting">
					<ul>
						<li><input type="button" id="Anchor_Position" value="Anchor Position" onclick="clickAnchorPosition();">
						</li>
						<li><button id="Anchor_List">Anchor List</button>
						</li>
						<li><input type="button" id="Anchor_Group" value="Anchor Group" onclick="">
						</li>
					</ul>
				</li>
				<li><input type="button" id="Tag_Setting" value="Tag Setting" onclick="">
				</li>
			</ul>
		</li>
		<li><input type="button" id="Start" value="Start" onclick="getServerImage();">
		</li>
		<li><input type="button" id="Record_Mode" value="Record Mode" onclick="">
		</li>
		<li><input type="button" id="Windows_Interface_Setting" value="Windows Interface Setting" onclick="">
			<ul>
				<li><input type="button" id="Tag_List_Window" value="Tag List Window" onclick="">
					<ul>
						<li><input type="button" id="Window_Display" value="Window Display" onclick="">
						</li>
						<li><input type="button" id="Latest_Items" value="Latest Items" onclick="">
						</li>
					</ul>
				</li>
				<li><input type="button" id="Alarm_List_Window" value="Alarm List Window" onclick="">
					<ul>
						<li><input type="button" id="Window_Display" value="Window Display" onclick="">
						</li>
						<li><input type="button" id="Latest_Items" value="Latest Items" onclick="">
						</li>
					</ul>
				</li>
				<li><input type="button" id="Alarm_Window" value="Alarm Window" onclick="">
				</li>
				<li><input type="button" id="Anchor_Display" value="Anchor Display" onclick="">
				</li>
			</ul>
		</li>
	</ul>
	<div class="column main">
		<div class="row">
			<nav id="cvsBlock">
				<canvas id="canvas">
					此瀏覽器不支援canvas，請更換成Chrome瀏覽器
				</canvas>
			</nav>
			<!-- Following is a dialog to add set the scale of map -->
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

			<br>
			<div>
				<span id="scale_visible" style="margin-right:30px;">Map Scale: initial</span>
                X:<input type="text" name="x" id="x" value="" style="max-width: 50px;">
                Y:<input type="text" name="y" id="y" value="" style="max-width: 50px;">
				<button onclick="restoreCanvas();" style="margin-right:30px;">恢復原比例</button>
				<button onclick="getServerImage();" style="margin-right:30px;">導入地圖</button>
				<button onclick="readMainAnchorSet();" style="margin-right:30px;">導入Main Anchor</button>
				<button onclick="readAnchorSet();" style="margin-right:30px;">導入Anchor</button>
				<button id="Show_Anchor_List">Anchor List</button>
			</div>
		</div>
		<div class="row" style="overflow:auto; margin:5px;">
			<div id="txtHint1">尚未載入資料</div>
		</div>
	</div>
	<div class="column side" style="overflow:auto; margin-top:10px;">
		<div id="txtHint2">尚未載入資料</div>
	</div>
</body>

</html>
