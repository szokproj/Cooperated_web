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
    <link rel=stylesheet type="text/css" href="http://localhost/Location System/css/bootstrap_collapsible_navbar.css">
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

        .center {margin: auto; padding: 20px; text-align: left;}
        table {border-collapse: collapse; width: 60%; margin: auto;}
        th,td {padding: 8px; text-align: left; border: 0px}

    </style>
    <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script type="text/javascript" src="http://localhost/Location System/js/navbar_setting.js"></script>
    <script type="text/javascript">

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
                                            <li><a href="Device_Setting.php">Device Setting</a></li>
                                            <li><a href="#">RF Setting</a></li>
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
            <div class="col-lg-12" style="background-color:white;">
                <div class="center">
                    <TABLE>
                        <tr>
                            <th>
                                <label>Model</label>
                            </th>
                            <th>
                                <label id="model"></label>
                            </th>
                            <th>
                                <label>Version:</label>
                            </th>
                            <th>
                                <label id="version"></label>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <label>MODE:</label>
                            </th>
                            <th>
                                <label id="mode"></label>
                            </th>
                            <th>
                                <label>Device ID:</label>
                            </th>
                            <th>
                                <label id="device_id"></label>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <label>Channel:</label>
                            </th>
                            <th>
                                <select>
                                    <option value="CH1(3.5GHz)">CH1(3.5GHz)</option>
                                    <option value="CH2(4.0GHz)">CH2(4.0GHz)</option>
                                </select>
                            </th>
                            <th>
                                <label>TX Power:</label>
                            </th>
                            <th>
                                <select>
                                    <option value="CH1_NOSMART_16M">CH1_NOSMART_16M</option>
                                    <option value="CH2_NOSMART_16M">CH2_NOSMART_16M</option>
                                </select>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <label>Datarate:</label>
                            </th>
                            <th>
                                <select>
                                    <option value="110Kbps">110Kbps</option>
                                    <option value="850Kbps">850Kbps</option>
                                    <option value="6.8Mbps">6.8Mbps</option>
                                </select>
                            </th>
                            <th>
                                <label>NSD:</label>
                            </th>
                            <th>
                                <select>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                </select>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <label>PRF:</label>
                            </th>
                            <th>
                                <select>
                                    <option value="16M">16M</option>
                                    <option value="64M">64M</option>
                                </select>
                            </th>
                            <th>
                                <label>SDF_timeoutr:</label>
                            </th>
                            <th>
                                <select>
                                    <option value="1089">1089</option>
                                </select>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <label>PreambleCode:</label>
                            </th>
                            <th>
                                <select>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                </select>
                            </th>
                            <th>
                                <label>SMARTPOWER:</label>
                            </th>
                            <th>
                                <select>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                </select>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <label>PreambleLength:</label>
                            </th>
                            <th>
                                <select>
                                    <option value="64">64</option>
                                    <option value="128">128</option>
                                </select>
                            </th>
                            <th>
                                <label>NTM:</label>
                            </th>
                            <th>
                                <select>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                </select>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <label>PAC:</label>
                            </th>
                            <th>
                                <select>
                                    <option value="8">8</option>
                                    <option value="16">16</option>
                                </select>
                            </th>
                            <th>
                                <label>MULT:</label>
                            </th>
                            <th>
                                <select>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                </select>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <label>TX PGdelay:</label>
                            </th>
                            <th>
                                <select>
                                    <option value="CH1">CH1</option>
                                    <option value="CH2">CH2</option>
                                </select>
                            </th>
                        </tr>
                    </TABLE>
                </div>
                <br><br>
                <div style="padding: 30px 0px 30px 0px; width: 100%; text-align: center;">
                    <button type="button" onclick="alert('Read...')">Read</button>
                    <button type="button" onclick="alert('Write...')">Write</button>
                </div>
            </div>
        </div>
    </div>
</body>

</html>