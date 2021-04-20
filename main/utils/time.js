//int str uinx 时间戳
//如果是uinx时间戳记得乘于1000
function date(str){
    var n = parseInt(str)*1000;
    var D = new Date(n);
    var year = D.getFullYear();//四位数年份
  
    var month = D.getMonth()+1;//月份(0-11),0为一月份
    month = month<10?('0'+month):month;
  
    var day = D.getDate();//月的某一天(1-31)
    day = day<10?('0'+day):day;
  
    var hours = D.getHours();//小时(0-23)
    hours = hours<10?('0'+hours):hours;
  
    var minutes = D.getMinutes();//分钟(0-59)
    minutes = minutes<10?('0'+minutes):minutes;
  
    // var seconds = D.getSeconds();//秒(0-59)
    // seconds = seconds<10?('0'+seconds):seconds;
    // var week = D.getDay();//周几(0-6),0为周日
    // var weekArr = ['周日','周一','周二','周三','周四','周五','周六'];
  
    var now_time = year+'/'+month+'/'+day+' '+hours+':'+minutes;
    return now_time;
  }

  export default date