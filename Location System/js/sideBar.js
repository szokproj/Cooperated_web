var leftSide_isOpen = false;
var rightSide_isOpen = false;

function alarmSidebarMove() {
    $(function () {
        //側邊欄由左向右滑動
        if (!leftSide_isOpen) {
            $('#content').addClass('left_open');
            $('.sideBar').animate({
                left: '30px'
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

function tagSidebarMove() {
    $(function () {
        var $aside = $('#page_rightSide > aside');
        if (!rightSide_isOpen) {
            $('#content').addClass('right_open');
            $aside.stop(true).animate({
                right: '0px'
            }, 350);
        } else {
            $('#content').removeClass('right_open');
            $aside.stop(true).animate({
                right: '-350px'
            }, 310);
        }
        rightSide_isOpen = !rightSide_isOpen;
    });
}