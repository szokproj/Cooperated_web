<?php
require_once 'db.php';

$datas_1 = array();

$datas_2 = array();

$datas_3 = array();

$sql_1 = "SELECT * FROM `position_history`;";

$sql_2 = "SELECT * FROM `position_member`;";

$sql_3 = "SELECT * FROM `position_coordinate`order by `time` desc limit 1;";

$result_1 = mysqli_query($link, $sql_1);

$result_2 = mysqli_query($link, $sql_2);

$result_3 = mysqli_query($link, $sql_3);

if ($result_1) {
    if (mysqli_num_rows($result_1) > 0) {
        while ($row = mysqli_fetch_assoc($result_1)) {
            $datas_1[] = $row;
        }
    }
    mysqli_free_result($result_1);
} else {
    echo "{$sql}語法執行失敗，錯誤訊息:" . mysqli_error($link);
}

if ($result_2) {
    if (mysqli_num_rows($result_2) > 0) {
        while ($row = mysqli_fetch_assoc($result_2)) {
            $datas_2[] = $row;
        }
    }
    mysqli_free_result($result_2);
} else {
    echo "{$sql}語法執行失敗，錯誤訊息:" . mysqli_error($link);
}

if ($result_3) {
    if (mysqli_num_rows($result_3) > 0) {
        while ($row = mysqli_fetch_assoc($result_3)) {
            $x = $row["x_bar"];
            $y = $row["y_bar"];
        }
    }
    mysqli_free_result($result_3);
} else {
    echo "{$sql}語法執行失敗，錯誤訊息:" . mysqli_error($link);
}
?>