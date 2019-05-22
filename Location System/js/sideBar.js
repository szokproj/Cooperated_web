$(function () {
    var leftSide_isOpen = false;
    //側邊欄由左向右滑動
    $('#alarmSideBar_icon').on('click', function () {
        if (!leftSide_isOpen) {
            $('#content').addClass('left_open');
            $('.sideBar').animate({
                left: '0px'
            }, 370);
            //$('.hamburger').addClass('left_active');
        } else {
            //側邊欄由右向左滑動
            $('#content').removeClass('left_open');
            $('.sideBar').animate({
                left: '-330px'
            }, 310);
            //$('.hamburger').removeClass('left_active');    
        }
        leftSide_isOpen = !leftSide_isOpen;
    });

    var $aside = $('#page_rightSide > aside');
    var $asidButton = $aside.find('.button_arrow')
        .on('click', function () {
            $aside.toggleClass('open');
            if ($aside.hasClass('open')) {
                $aside.stop(true).animate({
                    right: '-80px'
                }, 370);
            } else {
                $aside.stop(true).animate({
                    right: '-400px'
                }, 310);
            }
            $asidButton.find('i').toggleClass('fa-angle-double-left').toggleClass('fa-angle-double-right');
            $('#content').toggleClass('right_open');
        });
    //$('#sidebarRightTab li:eq(1) a').tab('show');
});