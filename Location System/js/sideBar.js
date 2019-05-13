$(function () {
    var leftSide_isOpen = false;
    //側邊欄由左向右滑動
    $('#alarmSideBar_icon').on('click', function () {
        if (!leftSide_isOpen) {
            $('#content').addClass('left_open');
            $('.sideBar').animate({ left: '0px' }, 370);
            //$('.hamburger').addClass('left_active');
        } else {
            //側邊欄由右向左滑動
            $('#content').removeClass('left_open');
            $('.sideBar').animate({ left: '-330px' }, 310);
            //$('.hamburger').removeClass('left_active');    
        }
        leftSide_isOpen = !leftSide_isOpen;
    });

    var $aside = $('#page_rightSide > aside');
    var $asidButton = $aside.find('.button_arrow')
        .on('click', function () {
            $aside.toggleClass('open');
            if ($aside.hasClass('open')) {
                $aside.stop(true).animate({ right: '-80px' }, 370);
                $asidButton.find('img').attr('src', 'https://c2.staticflickr.com/6/5555/31208490685_5c55f2f28f_o.png');
                $('#content').addClass('right_open');
            } else {
                $aside.stop(true).animate({ right: '-400px' }, 310);
                $asidButton.find('img').attr('src', 'https://c2.staticflickr.com/6/5635/31065147822_9b6e31ab5f_o.png');
                $('#content').removeClass('right_open');
            }
        });
    //$('#sidebarRightTab li:eq(1) a').tab('show');
});