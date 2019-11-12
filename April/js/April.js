/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2019-05-10 21:43:34
 * @version $Id$
 */
window.onload=function(){
    // 轮播图
    var c=0;
    // 登录样式延时加载显示
    $(".shop").fadeIn(2000);
   // var banner=document.getElementsByClassName("banner");//是个数组
   // var imgs=banner[0].getElementsByTagName("img");//是个数组
   setInterval(function(){
        // for(var i=0;i<imgs.length;i++){
        // imgs[i].style.display="none";
        // }
        // c=c==4?0:c;
        // imgs[c].style.display="block";
        // c++;
        $(".banner img").eq(c).fadeIn(3000).siblings("img").fadeOut(3000);
        c++;
        c=c==4?0:c;

},5000);




}
