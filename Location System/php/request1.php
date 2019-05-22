<?php
require_once 'db.php';

$sql = "SELECT * FROM `position_history`;";

$result = mysqli_query($link, $sql);

echo "<table>
        <tr style= \"background : lightgray;\">
            <th>Items</th>
            <th>Name</th>
            <th>ID</th>
            <th>Time</th>
            <th>Alarm Status</th>
            <th>Image</th>
        </tr>";

if ($result) {
    if (mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            $datas[] = $row;
        }
    }
    mysqli_free_result($result);
} else {
    echo "{$sql}語法執行失敗，錯誤訊息:" . mysqli_error($link);
}


if (!empty($datas)) :
    foreach ($datas as $key => $row) :
        echo "<tr>";
        echo "<td>" . $row['items'] . "</td>";
        echo "<td>" . $row['name'] . "</td>";
        echo "<td>" . $row['id'] . "</td>";
        echo "<td>" . $row['time'] . "</td>";
        echo "<td>" . $row['alarm_status'] . "</td>";
        echo "<td>" . $row['image'] . "</td>";
        echo "</tr>";
    endforeach;
else : 
    echo "查無資料";
endif;

echo "</table>";
//mysqli_close($con);
unset($_SESSION['$sql'],
    $_SESSION['$result'],
    $_SESSION['$datas'],
    $_SESSION['$key'],
    $_SESSION['$row']);
?>