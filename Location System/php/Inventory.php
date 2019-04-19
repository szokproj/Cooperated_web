<!DOCTYPE html>
<html>

<head>
    <title>Location System</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel=stylesheet type="text/css" href="http:\\localhost\Location System\css\head_type.css">
    <style>
    /* Create three unequal columns that floats next to each other */
    .column {
        float: left;
        padding: 10px;
    }

    /* Left and right column */
    .column.side {
        width: 40%;
    }

    /* Middle column */
    .column.main {
        width: 60%;
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
        <li><a class="active" href="Inventory.php">Inventory</a></li>
        <li><a href="Reference.php">Reference</a></li>
        <li><a href="Advance cmd.php">Advance cmd</a></li>
        <li><a href="Update.php">Update</a></li>
        <li style="float:right"><a href="About.php">About</a></li>
    </ul>
    <div class="column main">
        <div class="row" style="overflow:auto; margin:5px;">
            <table>
                <tr style="background:lightgray;">
                    <th>Item</th>
                    <th>TagID</th>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                </tr>
            </table>
        </div>
    </div>
    <div class="column side">
        <div style="text-align: center;">
            <h4>Total Count:</h4><br><br>
            <h4 id="total_count"></h4><br><br>
            <button type="button" onclick="alert('Start!')">Start</button><br><br>
            <input type="checkbox" name="latest_items" value="true">Latest Items
        </div>
    </div>
</body>

</html>