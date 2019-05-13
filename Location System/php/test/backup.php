<!DOCTYPE html>
<html>
<?php include 'tables_position.php'; ?>
<head>
    <title>Location System</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel=stylesheet type="text/css" href="http:\\localhost\Location%20System\css\head_type.css">
    <link rel=stylesheet type="text/css" href="http:\\localhost\Location%20System\css\drop_down_menu.css">
    <style>
    /* Create three unequal columns that floats next to each other */
    .column {
        float: left;
        padding: 10px;
    }

    /* Left and right column */
    .column.side {
        width: 30%;
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

    </style>
    <script type="text/javascript" src="http:\\localhost\Location%20System\js\use_canvas.js"></script>
    <script type="text/javascript" src="http:\\localhost\Location%20System\js\getTable1.js"></script>
</head>

<body>
        <div class="header">
            <label>RFID Monitoring Station</label>
        </div>
        <ul class="head-title">
            <li><a class="active" href="#">Position</a></li>
            <li><a href="Device Connection.html">Device Connection</a></li>
            <li><a href="Device Setting.html">Device Setting</a></li>
            <li><a href="RF Setting.html">RF Setting</a></li>
            <li><a href="Inventory.html">Inventory</a></li>
            <li><a href="Reference.html">Reference</a></li>
            <li><a href="Advance cmd.html">Advance cmd</a></li>
            <li><a href="Update.html">Update</a></li>
            <li style="float:right"><a href="About.html">About</a></li>
        </ul>

        <ul class="drop-down-menu">
            <li><a href="#">Setting</a>
                <ul>
                    <li><a href="#">Map Setting</a>
                        <ul>
                            <li><a href="#">Map Select</a>
                            </li>
                            <li><a href="#">Map Scale</a>
                            </li>
                        </ul>
                    </li>
                    <li><a href="#">Anchor Setting</a>
                        <ul>
                            <li><a href="#">Anchor Position</a>
                            </li>
                            <li><a href="#">Anchor List</a>
                            </li>
                            <li><a href="#">Anchor Group</a>
                            </li>
                        </ul>
                    </li>
                    <li><a href="#">Tag Setting</a>
                    </li>
                </ul>
            </li>
            <li><a href="#">Start</a>
            </li>
            <li><a href="#">Record Mode</a>
            </li>
            <li><a href="#">Windows Interface Setting</a>
                <ul>
                    <li><a href="#">Tag List Window</a>
                        <ul>
                            <li><a href="#">Window Display</a>
                            </li>
                            <li><a href="#">Latest Items</a>
                            </li>
                        </ul>
                    </li>
                    <li><a href="#">Alarm List Window</a>
                        <ul>
                            <li><a href="#">Window Display</a>
                            </li>
                            <li><a href="#">Latest Items</a>
                            </li>
                        </ul>
                    </li>
                    <li><a href="#">Alarm Window</a>
                    </li>
                    <li><a href="#">Anchor Display</a>
                    </li>
                </ul>
            </li>
        </ul>
        <div class="column main">
            <div class="row">
                <nav>
                    <canvas id="canvas"></canvas>
                </nav>
                <form name='form' id='form' style="float: right;">
                    <br><div id="txtHint3">position_coordinate</div>
                </form>
                <div style="float: right;">
                    <br><input type="file" id="file" accept="image/png" onchange="loadFile(this)"><br><br>
                </div>
            </div>
            <div class="row" style="overflow:auto; margin:5px;">
                <div id="txtHint1">position_history</div>
            </div>
        </div>
        <div class="column side" style="overflow:auto; margin-top:10px;">
            <div id="txtHint2">position_member</div>
        </div>
</body>

</html>
