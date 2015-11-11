/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var userId = localStorage.userid;

$(document).ready(function(){
    switch(window.orientation){  
        case -90:
        case 90:
            window.onorientationchange();
                            
    }
    // USED FOR TESTING 
    //   localStorage.userid = '14007';
    //   localStorage.usertype = 'Manager';
    //localStorage.username = 'Sahni, Himanshu';
    var userType = localStorage.usertype;
    //alert(localStorage.userid+' - '+localStorage.username+' - '+localStorage.usertype);  Enter Time Sheet , All Approvals , Enter Expenses
    $("#user_name").text(localStorage.username);
    var i=0;

    var disable = 'opacity: 0.5;';
    var html = '<tr>';
    var html1 = '<tr>';
    //    if(parseInt(localStorage.show_timesheets,10)){
    html += ' <td class="icon_home_menu" style="background-image: url(\'./images/common/clock_icon.png\');" onclick="location.href=\'timesheet.html\';"></td>';
    html1 += '     <td class="icon_home_menu_titles" >Timecards</td>';
    /*    }else{
        html += ' <td class="icon_home_menu" style="background-image: url(\'./images/common/clock_icon.png\');'+disable+'" ></td>';
        html1 += '     <td class="icon_home_menu_titles"  style="'+disable+'">Timecards</td>';
    }
    /*    if(userType == 'Manager'){
        html += '  <td class="icon_home_menu" style="background-image: url(\'./images/common/approvals_icon.png\'); " onclick="loadApprovals();"></td>';
        html1 += '    <td class="icon_home_menu_titles" >Approvals</td>';
    }else{
        html += '  <td class="icon_home_menu" style="background-image: url(\'./images/common/approvals_icon.png\'); '+disable+'" ></td>';
        html1 += '    <td class="icon_home_menu_titles" style="'+disable+'">Approvals</td>';
    }*/
    /*Always enabling Approvals icon : input from RAj*/
    html += '  <td class="icon_home_menu" style="background-image: url(\'./images/common/approvals_icon.png\'); " onclick="loadApprovals();"></td>';
    html1 += '    <td class="icon_home_menu_titles" >Approvals</td>';
    /*END*/
    html += '  <td class="icon_home_menu" style="background-image: url(\'./images/common/info_icon.png\'); " onclick="location.href=\'usefulinfo.html\';"></td>';
    html += '  </tr>';   
    html1 += '    <td class="icon_home_menu_titles" >Useful info</td>';
    html1 += '  </tr>';
    $("#menu").append(html+html1);
    
    //REQUEST FOR STOCK TICKER
    var today = get_yyyy_mm_dd_hh_mm_ss(new Date());
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1);
    yesterday.setHours(00, 00, 00, 00);
    yesterday = get_yyyy_mm_dd_hh_mm_ss(yesterday);
    var stockurl = 'http://jacobs.q4web.com/feed/StockQuote.svc/GetStockQuoteList?apiKey=F4016603325A41D1BA01A4395983FF2F&symbol=JEC&exchange=NYSE&startDate='+yesterday+'&endDate='+today;//'http://finance.google.com/finance/info?client=ig&q=JEC';//'http://finance.google.com/finance/info?q=JEC';//'http://finance.yahoo.com/d/quotes.csv?s=JEC&f=snl1&callback=?';//'http://d.yimg.com/autoc.finance.yahoo.com/autoc?query=JEC&callback=YAHOO.Finance.SymbolSuggest.ssCallback';
    $.ajax({
        url: stockurl,
        type: 'GET',
        dataType: 'jsonp',
        timeout: 30000,
        async: false,
        success: function (data, textStatus, xhr) {
            //   alert('success : '+data);
            var jec = data.GetStockQuoteListResult[0];
            var html = '<marquee style="width: 100%;height: 44px;line-height: 44px;">JEC&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+jec.TradePrice+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+jec.TradeDate+'</marquee>';
             
            /*           var jec = data[0];
        //alert(JSON.stringify(jec));
        var html = '<marquee style="width: 100%;height: 44px;line-height: 44px;">'+jec.t+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+jec.l_cur+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+jec.lt+'</marquee>'
        */
            $("#ticker").append(html);
        },
        error: function (request, status, error) {
            $("#loading_screen").hide();
            alert(error);
        }
             
    });
    

    
});
window.onorientationchange = function() {
    if(isMobile.Android()){
        switch(window.orientation) 
        {  
            case -90:
            case 90:
                //landscape
                $(".ui-body-c").removeClass("ui-body-c").removeClass("ui-overlay-c").addClass("landscape_bg");
                $(".menu_iconsdiv").css("margin-top","100px");
                break; 
            default:
                //portrait
                $(".landscape_bg").addClass("ui-body-c").addClass("ui-overlay-c").removeClass("landscape_bg");
                $(".menu_iconsdiv").css("margin-top","130px");
        }
    }
}
function get_yyyy_mm_dd_hh_mm_ss (now) {
    //   var now = new Date();
    var year = "" + now.getFullYear();
    var month = "" + (now.getMonth() + 1);
    if (month.length == 1) {
        month = "0" + month;
    }
    var day = "" + now.getDate();
    if (day.length == 1) {
        day = "0" + day;
    }
    var hour = "" + now.getHours();
    if (hour.length == 1) {
        hour = "0" + hour;
    }
    var minute = "" + now.getMinutes();
    if (minute.length == 1) {
        minute = "0" + minute;
    }
    var second = "" + now.getSeconds();
    if (second.length == 1) {
        second = "0" + second;
    }
    return year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;
}

function logout(){
    document.location='login.html';
}
//APPROVALS ICON CLICK ACTION
function loadApprovals(){
    
    //   if(localStorage.primaryapprovals.length){ // commented as a part of showing approvals icon to all
    //    alert(localStorage.primaryapprovals);
    location.href='approvalcontainer.html';
//   }
}





