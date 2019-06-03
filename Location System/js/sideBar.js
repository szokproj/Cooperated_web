var leftSide_isOpen = false;
var rightSide_isOpen = false;

function alarmSidebarMove() {
    $(function () {
        //側邊欄由左向右滑動
        if (!leftSide_isOpen) {
            $('#content').addClass('left_open');
            $('.sideBar').animate({
                left: '50px'
            }, 370); //0
        } else {
            //側邊欄由右向左滑動
            $('#content').removeClass('left_open');
            $('.sideBar').animate({
                left: '-330px'
            }, 310); //-330
        }
        leftSide_isOpen = !leftSide_isOpen;
    });
}

function memberSidebarMove() {
    $(function () {
        var $aside = $('#page_rightSide > aside');
        if (!rightSide_isOpen) {
            $('#content').addClass('right_open');
            $aside.stop(true).animate({
                right: '-80px'
            }, 370);
        } else {
            $('#content').removeClass('right_open');
            $aside.stop(true).animate({
                right: '-400px'
            }, 310);
        }
        rightSide_isOpen = !rightSide_isOpen;
    });
}