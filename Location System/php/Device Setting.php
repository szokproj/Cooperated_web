<!DOCTYPE html>
<html>

<head>
    <title>Location System</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel=stylesheet type="text/css" href="http:\\localhost\Location System\css\head_type.css">
    <style>
        .center {
            margin: auto;
            width: 400px;
            border: 2px solid lightgray;
            padding: 20px;
            text-align: left;
        }

        .line_block{
            margin: auto;
            width: 400px;
            text-align: left;
            padding-top: 10px;
            padding-bottom: 10px;
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
        <li><a class="active" href="Device Setting.php">Device Setting</a></li>
        <li><a href="RF Setting.php">RF Setting</a></li>
        <li><a href="Inventory.php">Inventory</a></li>
        <li><a href="Reference.php">Reference</a></li>
        <li><a href="Advance cmd.php">Advance cmd</a></li>
        <li><a href="Update.php">Update</a></li>
        <li style="float:right"><a href="About.php">About</a></li>
    </ul>
    <div class="line_block">
        <input type="checkbox" name="is_network_setting" value="true">Network Setting:<br>
    </div>
    <div class="center">
        <table>
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
    <div class="line_block">
        <input type="checkbox" name="basic_setting" value="true">Basic Setting:<br>
    </div>
    <div class="center">
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
</body>

</html>