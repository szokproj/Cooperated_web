<?php
define('HOST', 'localhost');
define('USERNAME', 'root');
define('PASSWORD', '');
define('DB', 'location_system');

$con = mysqli_connect(HOST, USERNAME, PASSWORD, DB);
mysqli_query($con, "SET NAMES utf8");

$time = $_POST['time'];
$x_bar = $_POST['x'];
$y_bar = $_POST['y'];

$sql = "insert into `position_coordinate` (`time`, `x_bar`, `y_bar`) values ('$time','$x_bar','$y_bar')";

if (mysqli_query($con, $sql)) {
    echo 'success';
} else {
    echo '無法連線mysql資料庫:<br/>' . mysqli_connect_error();
}
?>