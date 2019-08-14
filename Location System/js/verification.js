//完整js验证Email
//https://www.cnblogs.com/hakuci/archive/2010/10/20/1856462.html

function char_test(chr)
//字符检测函数    
{
    var i;
    var smallch = "abcdefghijklmnopqrstuvwxyz";
    var bigch = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (i = 0; i < 26; i++)
        if (chr == smallch.charAt(i) || chr == bigch.charAt(i))
            return (1);
    return (0);
}

function spchar_test(chr)
//数字和特殊字符检测函数    
{
    var i;
    var spch = "_-.0123456789";
    for (i = 0; i < 13; i++)
        if (chr == spch.charAt(i))
            return (1);
    return (0);
}

function email_test(str) {
    var i, flag = 0;
    var at_symbol = 0;
    //“@”检测的位置    
    var dot_symbol = 0;
    //“.”检测的位置    
    if (char_test(str.charAt(0)) == 0)
        return (1);
    //首字符必须用字母    

    for (i = 1; i < str.length; i++)
        if (str.charAt(i) == '@') {
            at_symbol = i;
            break;
        }
    //检测“@”的位置    

    if (at_symbol == str.length - 1 || at_symbol == 0)
        return (2);
    //没有邮件服务器域名    

    if (at_symbol < 3)
        return (3);
    //帐号少于三个字符    

    if (at_symbol > 19)
        return (4);
    //帐号多于十九个字符    

    for (i = 1; i < at_symbol; i++)
        if (char_test(str.charAt(i)) == 0 && spchar_test(str.charAt(i)) == 0)
            return (5);
    for (i = at_symbol + 1; i < str.length; i++)
        if (char_test(str.charAt(i)) == 0 && spchar_test(str.charAt(i)) == 0)
            return (5);
    //不能用其它的特殊字符      

    for (i = at_symbol + 1; i < str.length; i++)
        if (str.charAt(i) == '.') dot_symbol = i;
    for (i = at_symbol + 1; i < str.length; i++)
        if (dot_symbol == 0 || dot_symbol == str.length - 1)
            //简单的检测有没有“.”，以确定服务器名是否合法    
            return (6);

    return (0);
    //邮件名合法 
}

function emailCheck(str) {
    //var st=email_test(str);
    if (str.length == 0) {
        alert("请输入Email");
    } else {
        if (email_test(str) == 1) alert("Email首字符必须用字母");
        if (email_test(str) == 2) alert("Email没有邮件服务器域名");
        if (email_test(str) == 3) alert("Email帐号少于三个字符 ");
        if (email_test(str) == 4) alert("Email帐号多于十九个字符");
        if (email_test(str) == 5) alert("Email不能用其它的特殊字符");
        if (email_test(str) == 6) alert("简单的检测有没有“.”，以确定服务器名是否合法");
    }
}