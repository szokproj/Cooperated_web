<?php
require_once 'db.php';

$sql = "SELECT * FROM `position_coordinate`order by `time` desc limit 1;";

$result = mysqli_query($link, $sql);

if ($result) {
    if (mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            $x = $row["x_bar"];
            $y = $row["y_bar"];
        }
    }
    mysqli_free_result($result);
} else {
    echo "{$sql}語法執行失敗，錯誤訊息:" . mysqli_error($link);
}

echo "X:<input type=\"text\" name=\"x\" id=\"x\" value=\"";
echo $x;
echo "\" style=\"max-width: 50px;\">";
echo "Y:<input type=\"text\" name=\"y\" id=\"y\" value=\"";
echo $y;
echo "\" style=\"max-width: 50px;\">";

//mysqli_close($con);
unset($_SESSION['$sql'],
    $_SESSION['$result'],
    $_SESSION['$datas'],
    $_SESSION['$key'],
    $_SESSION['$row']);
?>