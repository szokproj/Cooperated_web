<!DOCTYPE html>
<html>

<head>
    <title>Location System</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.bootcss.com/jquery/2.1.1/jquery.min.js"></script>
    <script src="F:/tools/bootstrap/bootstrap-3.3.7-dist/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="style.css" />
    <!--<link rel=stylesheet type="text/css" href="http:\\localhost\Location System\css\bootstrap_collapsible_navbar.css">-->
    <link rel=stylesheet type="text/css" href="http:\\localhost\Location System\css\jquery_side_nav.css">
    <style>
        .cvsBlock {
            -webkit-flex: 1;
            -ms-flex: 1;
            flex: 1;
            background: #ccc;
            height: 400px;
            overflow: auto;
            border-radius: 25px; 
            border: 1px black solid;
        }
        /*------------------------------------------*/
        .font-type {
            color: white;
        }

        .position1 {
            position: relative;
            float: left;
            width: 20%;
            height: 50px;
            text-align: center;
            line-height: 50px;
        }

        @import "https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css";
        body {
            position: relative;
            overflow-x: hidden;
        }

        body,
        html {
            height: 100%;
            background-color: white;
        }

        .nav .open>a {
            background-color: transparent;
        }

        .nav .open>a:hover {
            background-color: transparent;
        }

        .nav .open>a:focus {
            background-color: transparent;
        }

        /*-------------------------------*/

        /*           Wrappers            */

        /*-------------------------------*/

        #wrapper {
            -moz-transition: all 0.5s ease;
            -o-transition: all 0.5s ease;
            -webkit-transition: all 0.5s ease;
            padding-right: 0;
            transition: all 0.5s ease;
        }

        #wrapper.toggled {
            padding-right: 380px;
        }

        #wrapper.toggled #sidebar-wrapper {
            width: 350px;
        }

        #wrapper.toggled #page-content-wrapper {
            margin-right: -350px;
            position: absolute;
        }

        #sidebar-wrapper {
            -moz-transition: all 0.5s ease;
            -o-transition: all 0.5s ease;
            -webkit-transition: all 0.5s ease;
            background: #1a1a1a;
            height: 100%;
            left: 1100px;
            margin-right: -350px;
            overflow-x: hidden;
            overflow-y: auto;
            transition: all 0.5s ease;
            width: 0;
            z-index: 1000;
        }

        #sidebar-wrapper::-webkit-scrollbar {
            display: none;
        }

        #page-content-wrapper {
            /*padding-top: 70px;*/
            width: 100%;
        }

        /*-------------------------------*/

        /*     Sidebar nav styles        */

        /*-------------------------------*/

        .sidebar-nav {
            list-style: none;
            margin: 0;
            padding: 0;
            position: absolute;
            top: 0;
            width: 350px;
        }

        .sidebar-nav li {
            display: inline-block;
            line-height: 20px;
            position: relative;
            width: 100%;
        }

        .sidebar-nav li:before {
            background-color: #1c1c1c;
            content: '';
            height: 100%;
            left: 0;
            position: absolute;
            top: 0;
            -webkit-transition: width 0.2s ease-in;
            transition: width 0.2s ease-in;
            width: 3px;
            z-index: -1;
        }

        .sidebar-nav li:first-child a {
            background-color: #1a1a1a;
            color: #ffffff;
        }

        .sidebar-nav li:nth-child(2):before {
            background-color: #402d5c;
        }

        .sidebar-nav li:nth-child(3):before {
            background-color: #4c366d;
        }

        .sidebar-nav li:nth-child(4):before {
            background-color: #583e7e;
        }

        .sidebar-nav li:nth-child(5):before {
            background-color: #64468f;
        }

        .sidebar-nav li:nth-child(6):before {
            background-color: #704fa0;
        }

        .sidebar-nav li:nth-child(7):before {
            background-color: #7c5aae;
        }

        .sidebar-nav li:nth-child(8):before {
            background-color: #8a6cb6;
        }

        .sidebar-nav li:nth-child(9):before {
            background-color: #987dbf;
        }

        .sidebar-nav li:hover:before {
            -webkit-transition: width 0.2s ease-in;
            transition: width 0.2s ease-in;
            width: 100%;
        }

        .sidebar-nav li a {
            color: #dddddd;
            display: block;
            padding: 10px 15px 10px 30px;
            text-decoration: none;
        }

        .sidebar-nav li.open:hover before {
            -webkit-transition: width 0.2s ease-in;
            transition: width 0.2s ease-in;
            width: 100%;
        }

        .sidebar-nav .dropdown-menu {
            background-color: #222222;
            border-radius: 0;
            border: none;
            box-shadow: none;
            margin: 0;
            padding: 0;
            position: relative;
            width: 100%;
        }

        .sidebar-nav li a:hover,
        .sidebar-nav li a:active,
        .sidebar-nav li a:focus,
        .sidebar-nav li.open a:hover,
        .sidebar-nav li.open a:active,
        .sidebar-nav li.open a:focus {
            background-color: transparent;
            color: #ffffff;
            text-decoration: none;
        }

        .sidebar-nav>.sidebar-brand {
            font-size: 20px;
            height: 65px;
            line-height: 44px;
        }

        /*-------------------------------*/

        /*       Hamburger-Cross         */

        /*-------------------------------*/

        .hamburger {
            background: black;
            border: none;
            display: block;
            height: 32px;
            right: 350px;
            margin-right: 15px;
            position: fixed;
            top: 70px;
            width: 32px;
            z-index: 999;
        }

        .hamburger:hover {
            outline: none;
        }

        .hamburger:focus {
            outline: none;
        }

        .hamburger:active {
            outline: none;
        }

        .hamburger.is-closed:before {
            -webkit-transform: translate3d(0, 0, 0);
            -webkit-transition: all 0.35s ease-in-out;
            color: #ffffff;
            content: '';
            display: block;
            font-size: 14px;
            line-height: 32px;
            opacity: 0;
            text-align: center;
            width: 100px;
        }

        .hamburger.is-closed:hover before {
            -webkit-transform: translate3d(100px, 0, 0);
            -webkit-transition: all 0.35s ease-in-out;
            display: block;
            opacity: 1;
        }

        .hamburger.is-closed:hover .hamb-top {
            -webkit-transition: all 0.35s ease-in-out;
            top: 0;
        }

        .hamburger.is-closed:hover .hamb-bottom {
            -webkit-transition: all 0.35s ease-in-out;
            bottom: 0;
        }

        .hamburger.is-closed .hamb-top {
            -webkit-transition: all 0.35s ease-in-out;
            background-color: rgba(255, 255, 255, 0.7);
            top: 5px;
        }

        .hamburger.is-closed .hamb-middle {
            background-color: rgba(255, 255, 255, 0.7);
            margin-top: -2px;
            top: 50%;
        }

        .hamburger.is-closed .hamb-bottom {
            -webkit-transition: all 0.35s ease-in-out;
            background-color: rgba(255, 255, 255, 0.7);
            bottom: 5px;
        }

        .hamburger.is-closed .hamb-top,
        .hamburger.is-closed .hamb-middle,
        .hamburger.is-closed .hamb-bottom,
        .hamburger.is-open .hamb-top,
        .hamburger.is-open .hamb-middle,
        .hamburger.is-open .hamb-bottom {
            height: 4px;
            left: 0;
            position: absolute;
            width: 100%;
        }

        .hamburger.is-open .hamb-top {
            -webkit-transform: rotate(45deg);
            -webkit-transition: -webkit-transform 0.2s cubic-bezier(0.73, 1, 0.28, 0.08);
            background-color: #ffffff;
            margin-top: -2px;
            top: 50%;
        }

        .hamburger.is-open .hamb-middle {
            background-color: #ffffff;
            display: none;
        }

        .hamburger.is-open .hamb-bottom {
            -webkit-transform: rotate(-45deg);
            -webkit-transition: -webkit-transform 0.2s cubic-bezier(0.73, 1, 0.28, 0.08);
            background-color: #ffffff;
            margin-top: -2px;
            top: 50%;
        }

        .hamburger.is-open:before {
            -webkit-transform: translate3d(0, 0, 0);
            -webkit-transition: all 0.35s ease-in-out;
            color: #ffffff;
            content: '';
            display: block;
            font-size: 14px;
            line-height: 32px;
            opacity: 0;
            text-align: center;
            width: 100px;
        }

        .hamburger.is-open:hover before {
            -webkit-transform: translate3d(-100px, 0, 0);
            -webkit-transition: all 0.35s ease-in-out;
            display: block;
            opacity: 1;
        }

        /*-------------------------------*/

        /*          Dark Overlay         */

        /*-------------------------------*/

        .overlay {
            position: fixed;
            display: none;
            width: 0%;
            height: 0%;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.4);
            z-index: 1;
        }

        /* SOME DEMO STYLES - NOT REQUIRED */

        /*body,
        html {
        background-color: #583e7e;
        }
        body h1,
        body h2,
        body h3,
        body h4 {
        color: rgba(255, 255, 255, 0.9);
        }
        body p,
        body blockquote {
        color: rgba(255, 255, 255, 0.7);
        }
        body a {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: underline;
        }
        body a:hover {
        color: #ffffff;
        }*/
    </style>
    <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
	<script type="text/javascript" src="http:\\localhost\Location System\js\dialog_anchor_list.js"></script>
	<script type="text/javascript" src="http:\\localhost\Location System\js\dialog_anchor_position.js"></script>
	<script type="text/javascript" src="http:\\localhost\Location System\js\canvas_request.js"></script>
	<script type="text/javascript" src="http:\\localhost\Location System\js\dialog_map_scale.js"></script>
    <script>
        $(document).ready(function () {
            var trigger = $('.hamburger'),
                overlay = $('.overlay'),
                isClosed = false;
            trigger.click(function () {
                hamburger_cross();
            });
            function hamburger_cross() {
                if (isClosed == true) {
                    overlay.hide();
                    trigger.removeClass('is-open');
                    trigger.addClass('is-closed');
                    isClosed = false;
                } else {
                    overlay.show();
                    trigger.removeClass('is-closed');
                    trigger.addClass('is-open');
                    isClosed = true;
                }
            }
            $('[data-toggle="offcanvas"]').click(function () {
                $('#wrapper').toggleClass('toggled');
            });
        });
        
        $(function(){
            // 
            var duration = 300;
            // aside ----------------------------------------
            var $aside = $('.page-main > aside');
            var $asidButton = $aside.find('.qq')
                .on('click', function(){
                    $aside.toggleClass('open');
                    if($aside.hasClass('open')){
                        $aside.stop(true).animate({right: '-70px'}, duration, 'easeOutBack');
                        $asidButton.find('img').attr('src', 'https://c2.staticflickr.com/6/5555/31208490685_5c55f2f28f_o.png');
                        $('#wrapper').addClass('open');
                    }else{
                        $aside.stop(true).animate({right: '-350px'}, duration, 'easeInBack');
                        $asidButton.find('img').attr('src', 'https://c2.staticflickr.com/6/5635/31065147822_9b6e31ab5f_o.png');
                        $('#wrapper').removeClass('open');
                    };
                });
        });

    </script>
</head>

<body>
    <div class="navbar navbar-fixed-top navbar-inverse" role="navigation">
        <!-- 最上方黑色區塊 -->
    </div>
    <div style="height: 70px;width: 100%;">
    </div>

    <!-- 側滑導航欄 -->
    <div id="wrapper">
        <div class="overlay">
            <!-- 導航欄開啟時的遮罩，設定顏色和長寬就可以形成遮罩 -->
        </div>
        <!-- Sidebar -->
        <nav class="navbar navbar-inverse navbar-fixed-top" id="sidebar-wrapper" role="navigation">
            <div id="txtHint1">尚未載入資料</div>
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

        <div>
            <div class="container">
                <div class="row">
                    <div class="col-lg-11" style="background-color:white;">
                        <div class="cvsBlock" id="cvsBlock" style="overflow: auto;">
                            <canvas id="canvas" style="height: 300px;">
                                此瀏覽器不支援canvas，請更換成Chrome瀏覽器
                            </canvas>
                        </div>
                        <div class="page-main" role="main">
                            <aside>
                                <ul>
                                    <li class="sidebar-brand"><a href="#">Location Station</a></li>
                                    <li><a class="active" href="Position.php">Position</a></li>
                                    <li><a href="Device Connection.php">Device Connection</a></li>
                                    <li><a href="Device Setting.php">Device Setting</a></li>
                                    <li><a href="RF Setting.php">RF Setting</a></li>
                                    <li><a href="Inventory.php">Inventory</a></li>
                                    <li><a href="Reference.php">Reference</a></li>
                                    <li><a href="Advance cmd.php">Advance cmd</a></li>
                                    <li><a href="Update.php">Update</a></li>
                                    <li><a href="About.php">About</a></li>
                                </ul>
                                <button class="qq"><img src="https://c2.staticflickr.com/6/5635/31065147822_9b6e31ab5f_o.png"></button>
                            </aside>
                        </div>
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

                        <div class="column side" style="overflow:auto; margin-top:10px;">
                            <div id="txtHint2">尚未載入資料</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
<script src="huadong.js"></script>

</html>