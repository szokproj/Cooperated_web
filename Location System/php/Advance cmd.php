<!DOCTYPE html>
<html>

<head>
    <title>Location System</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel=stylesheet type="text/css" href="http:\\localhost\Location System\css\head_type.css">
    <style>
    .rectangle {
        margin: auto;
        width: 300px;
        border: 2px solid #e6e6e6;
        padding: 10px;
    }

    /* Create three unequal columns that floats next to each other */
    .column {
        float: left;
        padding: 5px;
    }

    /* Middle column */
    .column.main {
        width: 70%;
    }

    /* Left and right column */
    .column.side {
        width: 30%; 
        margin:auto; 
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

    table {
        border-collapse: collapse;
        width: 100%;
    }

    th,
    td {
        max-height: 10px;
        padding: 8px;
        text-align: left;
        border: 1px solid #ddd;
    }

    tr:hover {
        background-color: #f5f5f5;
    }

    </style>
</head>

<body>
    <div class="header">
        <label>RFID Monitoring Station</label>
    </div>
    <ul class="head-title">
        <li><a href="Position.php">Position</a></li>
        <li><a href="Device Connection.php">Device Connection</a></li>
        <li><a href="Device Setting.php">Device Setting</a></li>
        <li><a href="RF Setting.php">RF Setting</a></li>
        <li><a href="Inventory.php">Inventory</a></li>
        <li><a href="Reference.php">Reference</a></li>
        <li><a class="active" href="Advance cmd.php">Advance cmd</a></li>
        <li><a href="Update.php">Update</a></li>
        <li style="float:right"><a href="About.php">About</a></li>
    </ul>
    <div class="column main">
        <div class="row" style="overflow:auto; margin:5px;">
            <table>
                <tr style="background:lightgray;">
                    <th>Item</th>
                    <th>Source ID</th>
                    <th>Anchor ID</th>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </table>
        </div>
    </div>
    <div class="column side">
        <div style="text-align: center;">
            <form>
                <br><br><br>
                <h4 style="display:inline;">OUT:&nbsp;</h4>
                <input type="text" name="write_cmd" style="width: 300px"><br>
                <br><br><br>
                <h4 style="display:inline;">IN:&nbsp;</h4>
                <input type="text" name="read_cmd" style="width: 300px"><br>
                <br><br><br>
                <div class="rectangle">
                    <input type="radio" name="active_cmd" value="read">Read
                    <input type="radio" name="active_cmd" value="write" style="margin-left: 30px">Write
                </div>
                <br><br><br>
                <button type="button" onclick="alert('Sending...')">Send</button>
            </form>
        </div>
    </div>
</body>

</html>