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
            padding: 20px;
            text-align: left;
        }

        table {
            border-collapse: collapse;
            width: 60%;
            margin: auto;
        }

        th,
        td {
            padding: 8px;
            text-align: left;
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
        <li><a class="active" href="RF Setting.php">RF Setting</a></li>
        <li><a href="Inventory.php">Inventory</a></li>
        <li><a href="Reference.php">Reference</a></li>
        <li><a href="Advance cmd.php">Advance cmd</a></li>
        <li><a href="Update.php">Update</a></li>
        <li style="float:right"><a href="About.php">About</a></li>
    </ul>
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
    <div style="margin: auto; width: 100px;">
        <button type="button" onclick="alert('Read...')">Read</button>
        <button type="button" onclick="alert('Write...')">Write</button>
    </div>
</body>

</html>