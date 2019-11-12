/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2019-05-15 16:00:13
 * @version $Id$
 */
// function stop() {
//     return false;
// }
// document.oncontextmenu = stop;
// // document.oncontextmenu = function(){return false;}
// document.onkeydown = function (e) {
//     var currKey = 0, evt = e || window.event;
//     currKey = evt.keyCode || evt.which || evt.charCode;
//     if (currKey == 123) {
//         window.event.cancelBubble = true;
//         window.event.returnValue = false;
//     }
// }
// 背景特效
window.onload = function () {
    function rgbToString(rgb) {
        rgb += 0.000001;
        var r = parseInt((0.5 + Math.sin(rgb) * 0.5) * 16);
        var g = parseInt((0.5 + Math.cos(rgb) * 0.5) * 16);
        var b = parseInt((0.5 - Math.sin(rgb) * 0.5) * 16);
        return "#" + r.toString(16) + g.toString(16) + b.toString(16);
    }
    //获取rbg数组
    function rgbArray(col) {
        col += 0.000001;
        var r = parseInt((0.5 + Math.sin(col) * 0.5) * 256);
        var g = parseInt((0.5 + Math.cos(col) * 0.5) * 256);
        var b = parseInt((0.5 - Math.sin(col) * 0.5) * 256);
        return [r, g, b];
    }
    function interpolateColors(RGB1, RGB2, degree) {
        var w2 = degree;
        var w1 = 1 - w2;
        return [w1 * RGB1[0] + w2 * RGB2[0], w1 * RGB1[1] + w2 * RGB2[1], w1 * RGB1[2] + w2 * RGB2[2]];
    }
    function colorString(arr) {
        var r = parseInt(arr[0]);
        var g = parseInt(arr[1]);
        var b = parseInt(arr[2]);
        return "#" + ("0" + r.toString(16)).slice(-2) + ("0" + g.toString(16)).slice(-2) + ("0" + b.toString(16)).slice(-2);
    }
    //获取点（x,y,z）与原点的线段与y轴形成的角度大小，特殊情况返回默认值0.00000001;
    function elevation(x, z, y) {
        var dist = Math.sqrt(x * x + y * y + z * z);//获取三维点（x,y,z）与原点距离长
        var num = y / dist;//三维空间的坐标（x,y,z）与原点的的线段和y轴形成的角度的余弦值
        if (dist && num >= -1 && num <= 1) return Math.acos(num);//获取num的反余弦值，即是上述的角度大小
        return 0.00000001;
    }
    //生成颗粒
    function createParticle(vars) {
        var pt = {};
        var p = Math.PI * 2 * Math.random();
        var ls = Math.sqrt(Math.random() * vars.distributionRadius);
        pt.x = Math.sin(p) * ls;
        pt.y = -vars.vortexHeight / 2;
        pt.vy = vars.initV / 20 + Math.random() * vars.initV;
        pt.z = Math.cos(p) * ls;
        pt.radius = 200 + 800 * Math.random();
        pt.color = pt.radius / 1000 + vars.frameNumber / 250;
        vars.points.push(pt);
    }
    function project3D(x, y, z, vars) {
        x -= vars.camX;
        y -= vars.camY - 8;
        z -= vars.camZ;
        var p = Math.atan2(x, z);
        var d = Math.sqrt(x * x + z * z);
        x = Math.sin(p - vars.yaw) * d;
        z = Math.cos(p - vars.yaw) * d;
        p = Math.atan2(y, z);
        d = Math.sqrt(y * y + z * z);
        y = Math.sin(p - vars.pitch) * d;
        z = Math.cos(p - vars.pitch) * d;
        var rx1 = -1000;
        var ry1 = 1;
        var rx2 = 1000;
        var ry2 = 1;
        var rx3 = 0;
        var ry3 = 0;
        var rx4 = x;
        var ry4 = z;
        var uc = (ry4 - ry3) * (rx2 - rx1) - (rx4 - rx3) * (ry2 - ry1);
        var ua = ((rx4 - rx3) * (ry1 - ry3) - (ry4 - ry3) * (rx1 - rx3)) / uc;
        var ub = ((rx2 - rx1) * (ry1 - ry3) - (ry2 - ry1) * (rx1 - rx3)) / uc;
        if (!z) z = 0.000000001;
        if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
            return {
                x: vars.cx + (rx1 + ua * (rx2 - rx1)) * vars.scale,
                y: vars.cy + y / z * vars.scale,
                d: (x * x + y * y + z * z)
            };
        }
        else {
            return { d: -1 };
        }
    }
    function drawSomeFloor(vars, isFalse) {
        for (var i = -25; i <= 25; i++) {
            for (var j = -25; j <= 25; j++) {
                var x = i * 2;
                var z = j * 2;
                var y = -vars.floor;
                var d = Math.sqrt(x * x + z * z);
                y = y + d * d / 50;//让上下背景产生弯曲感
                if (isFalse) {
                    y = -y;
                }
                var point = project3D(x, y, z, vars);
                if (point.d != -1) {

                    var rgb1, rgb2; var degree;
                    var size = 1 + 15000 / (1 + point.d);
                    var a = 0.15 - Math.pow(d / 50, 4) * 0.15;
                    if (a > 0) {
                        if (isFalse) {
                            rgb1 = rgbArray(d / 26 - vars.frameNumber / 40);
                            rgb2 = [0, 128, 32];
                            degree = .5 + Math.sin(d / 6 - vars.frameNumber / 8) / 2;
                        }
                        else {
                            rgb1 = rgbArray(-d / 26 - vars.frameNumber / 40);
                            rgb2 = [32, 0, 128];
                            degree = .5 + Math.sin(-d / 6 - vars.frameNumber / 8) / 2;
                        }
                        vars.context.fillStyle = colorString(interpolateColors(rgb1, rgb2, degree));//选色
                        vars.context.globalAlpha = a;//透明度
                        vars.context.fillRect(point.x - size / 2, point.y - size / 2, size, size);//用颜色涂满方框
                    }
                }
            }
        }
    }
    //绘制背景效果
    function drawFloor(vars) {
        drawSomeFloor(vars, true);//下面背景
        vars.context.fillStyle = "#82f";
        drawSomeFloor(vars, false);//上面背景
    }
    function sortFunction(a, b) {
        return b.dist - a.dist;
    }
    //绘制颗粒
    function drawParticles(vars) {
        vars.context.globalAlpha = .15;
        vars.context.fillStyle = "#000";
        vars.context.fillRect(0, 0, vars.canvas.width, vars.canvas.height);
        var point, x, y, z, a;
        for (var i = 0; i < vars.points.length; ++i) {
            x = vars.points[i].x;
            y = vars.points[i].y;
            z = vars.points[i].z;
            point = project3D(x, y, z, vars);
            if (point.d != -1) {
                vars.points[i].dist = point.d;
                size = 1 + vars.points[i].radius / (1 + point.d);
                d = Math.abs(vars.points[i].y);
                a = .8 - Math.pow(d / (vars.vortexHeight / 2), 1000) * .8;
                vars.context.globalAlpha = a >= 0 && a <= 1 ? a : 0;
                vars.context.fillStyle = rgbToString(vars.points[i].color);
                if (point.x > -1 && point.x < vars.canvas.width && point.y > -1 && point.y < vars.canvas.height)
                    vars.context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
            }
        }
        vars.points.sort(sortFunction);
    }
    function process(vars) {
        if (vars.points.length < vars.MaxParticles)
            for (var i = 0; i < 5; i++) {
                createParticle(vars);
            }
        var angle_xz = Math.atan2(vars.camX, vars.camZ)//camX/camZ的反正切值，即对应角度大小
        //也可： var angle_xz = Math.atan(vars.camX/vars.camZ)
        //xz页面上的斜边长
        var hypotenuse_xz = Math.sqrt(vars.camX * vars.camX + vars.camZ * vars.camZ);
        hypotenuse_xz -= Math.sin(vars.frameNumber / 80) / 25;
        var t = Math.cos(vars.frameNumber / 300) / 165;
        vars.camX = Math.sin(angle_xz + t) * hypotenuse_xz;
        vars.camZ = Math.cos(angle_xz + t) * hypotenuse_xz;
        vars.camY = -Math.sin(vars.frameNumber / 220) * 15;
        vars.yaw = Math.PI + angle_xz + t;
        vars.pitch = elevation(vars.camX, vars.camZ, vars.camY) - Math.PI / 2;
        for (var i = 0; i < vars.points.length; ++i) {
            var x = vars.points[i].x;
            var y = vars.points[i].y;
            var z = vars.points[i].z;
            var d = Math.sqrt(x * x + z * z) / 1.0075;
            var t = .1 / (1 + d * d / 5);
            var p = Math.atan2(x, z) + t;
            vars.points[i].x = Math.sin(p) * d;
            vars.points[i].z = Math.cos(p) * d;
            vars.points[i].y += vars.points[i].vy * t * ((Math.sqrt(vars.distributionRadius) - d) * 2);
            if (vars.points[i].y > vars.vortexHeight / 2 || d < .25) {
                vars.points.splice(i, 1);
                createParticle(vars);
            }
        }
    }
    //创建设置页面
    function createFrame() {
        var newVars = {};
        newVars.canvas = document.querySelector("canvas");//回文档中匹配指定 CSS 选择器的一个元素
        newVars.context = newVars.canvas.getContext("2d");
        //设置画布的高和宽
        newVars.canvas.width = document.body.clientWidth;
        newVars.canvas.height = document.body.clientHeight;
        newVars.cx = newVars.canvas.width / 2;
        newVars.cy = newVars.canvas.height / 2;
        //窗体高宽发生改变时，触发事件
        window.onresize = function () {
            //重新再次设置画布的高和宽
            newVars.canvas.width = document.body.clientWidth;
            newVars.canvas.height = document.body.clientHeight;
            newVars.cx = newVars.canvas.width / 2;
            newVars.cy = newVars.canvas.height / 2;
        }
        newVars.frameNumber = 0;
        newVars.camX = 0;
        newVars.camY = 0;
        newVars.camZ = -14;
        newVars.pitch = elevation(newVars.camX, newVars.camZ, newVars.camY) - Math.PI / 2;
        newVars.yaw = 0;
        newVars.bounding = 10;
        newVars.scale = 500;
        newVars.floor = 26.5;
        newVars.points = [];//点集合
        newVars.MaxParticles = 500;//最大数量
        newVars.initV = .01;
        newVars.distributionRadius = 800;
        newVars.vortexHeight = 25;
        return newVars;
    }
    //打开页面
    function OpenFrame(vars) {
        if (vars == undefined) {
            vars = createFrame();
        }
        vars.frameNumber++;
        //页面重绘之前，通知浏览器调用一个指定的函数，以满足开发者操作动画的需求,
        requestAnimationFrame(function () { OpenFrame(vars) });
        process(vars);
        drawFloor(vars);
        drawParticles(vars);
    }
    OpenFrame();
    // 背景样式结束
    var name = document.getElementById("name");
    var number = document.getElementById("number");
    var password = document.getElementById("password");
    var nameSpan = document.getElementById("nameSpan");
    var numberSpan = document.getElementById("numberSpan");
    var passwordSpan = document.getElementById("passwordSpan");
    var submit = document.getElementById("submit");
    var shortcut = document.getElementById("shortcut");
    //姓名验证  
    //获得焦点
    name.onfocus = function () {
        if (name.value == "吕德高") {
            nameSpan.innerHTML = "<font color='green' size='3'>√姓名正确</font>";
        } else if (name.value !== "吕德高") {
            nameSpan.innerHTML = " <font color='buff' size='2'>姓名:吕德高</font>";
        }
    }
    // 失去焦点
    name.onblur = function () {
        if (name.value == "") {
            nameSpan.innerHTML = "<font color='red' size='2'>×姓名不能为空</font>";
            return false;
        } else if (name.value == "吕德高") {
            nameSpan.innerHTML = "<font color='green' size='3'>√姓名正确</font>";
            return true;
        }
        else {
            nameSpan.innerHTML = "<font color='red' size='2'>×姓名错误</font>";
            return false;
        }
    }
    // 账号验证
    //获得焦点
    number.onfocus = function () {
        if (number.value == "Administrator") {
            numberSpan.innerHTML = "<font color='green' size='3'>√账号正确</font>";
        } else if (number.value !== "Administrator") {
            numberSpan.innerHTML = " <font color='buff' size='1'>账号:Administrator</font>";
        }
    }
    number.onblur = function () {
        if (number.value == "") {
            numberSpan.innerHTML = "<font color='red' size='2'>×账号不能为空</font>";
        } else if (number.value == "Administrator") {
            numberSpan.innerHTML = "<font color='green' size='3'>√账号正确</font>";
        }
        else {
            numberSpan.innerHTML = numberSpan.innerHTML = "<font color='red' size='2'>×账号错误</font>";
        }
    }
    // 密码验证
    password.onfocus = function () {
        if (password.value == "452566060") {
            passwordSpan.innerHTML = "<font color='green' size='3'>√密码正确</font>";
        } else if (password.value !== "452566060") {
            passwordSpan.innerHTML = " <font color='buff' size='2'>密码:452566060</font>";
        }
    }
    password.onblur = function () {
        if (password.value == "") {
            passwordSpan.innerHTML = "<font color='red' size='2'>×密码不能为空</font>";
        } else if (password.value == "452566060") {
            passwordSpan.innerHTML = "<font color='green' size='3'>√密码正确</font>";
        }
        else {
            passwordSpan.innerHTML = "<font color='red' size='2'>×密码错误</font>";
        }
    }


 // 弹框id
        var modal = document.getElementById("simpleModal");
        // X 的类名
        var closeBtn = document.getElementsByClassName("closeBtn")[0];
        var h2=document.getElementsByTagName("h2")[0];
        var ps=document.getElementsByTagName("p");
        var as=document.getElementsByTagName("a");
        // 要求登录提示弹框函数
       var analy= function(){
           event.preventDefault();
            modal.style.display = "block";
            h2.innerHTML="<h4 style='color:red'>没有权限,请先登录</h4>";
            ps[0].innerHTML="";
            ps[1].innerHTML="<h4 style='color:coral'><center>您可以把光标放在输入框里根据提示登录或者您的时间宝贵直接点击一键登录</center></h4>";
            ps[2].innerHTML="<h4 style='color:coral'><center>有问题请点击下方的\"点我联系管理员\"</center></h4>"; 
        }

         as[1].onclick=function(){analy();}
         as[2].onclick=function(){analy();}
         as[3].onclick=function(){analy();}
         as[4].onclick=function(){analy();}
         //错误提示弹框函数
        function point(analysis){
            event.preventDefault();
            modal.style.display = "block";
            h2.innerHTML="<h5 style='color:#000'>登录失败 原因:<span style='color:red'>"+analysis+"</span></h5>"
            ps[0].innerHTML="";
            ps[1].innerHTML="<h4 style='color:coral'><center>您可以把光标放在输入框里根据提示登录或者您的时间宝贵直接点击一键登录</center></h4>";
            ps[2].innerHTML="<h4 style='color:coral'><center>有问题请点击下方的\"点我联系管理员\"</center></h4>";
        }


    // 登录验证
    submit.onclick = function () {
        if (name.value == "吕德高" && number.value == "Administrator" && password.value == "452566060") {
            // window.open("http://39.106.88.142/April/April.html");
             event.preventDefault();
            window.location.href="../April/April.html";
        } else if (name.value !== "吕德高") {
            point("姓名错误");    
        } else if (number.value !== "Administrator") {
            point("账号错误");
        } else if (password.value !== "452566060") {
            point("密码错误");
        }
    }

    // 一键登录提示
    shortcut.onclick = function (e) {
        e.preventDefault();
        name.value = "吕德高";
        number.value = "Administrator";
        password.value = "452566060";
    }




}
 // 背景特效结束