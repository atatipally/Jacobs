/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var userId = localStorage.userid;
var start_date;
var baseURL = connectionURL;
if(localStorage.currentURL == "1"){
    baseURL = altConnectionURL;
}

function alert(msg){
    $("#error_msg").text(msg);
    $("#canceldialog").popup('open');
}
function showDates(data){
    //   alert(data);
    
    var hash = getHash();
    //Date List for next available timesheets        
    var url = baseURL+'TemplateList'; 
    $("#loading_screen1").show();
    var params = '{\"resource_id":'+userId+',\"hash":\"'+hash+'\"}';
    //  alert(params);
    if(isMobile.iOS()){
        window.location = BASE_DELI_MITER+'templatelistrequest'+DELI_MITER+userId+DELI_MITER+hash;
    }
    else{
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'jsonp',
            data:'templatelistrequest='+params,
            timeout: 30000,
            async: false,
            success: function (data, textStatus, xhr) {
                // var data1 = '{"response":"success","data":[{"recorded_hours":"40","submission_date":"2012-06-29 07:34:00","delete_checked":"N","transferred_to":"None","timecard_ovn":"2","absence_days":"0","stop_time":"2012-06-29 23:59:59","start_time":"2012-06-23 00:00:00","resource_id":"14007","absence_hours":"0","timecard_id":366167570,"approval_status":"Approved"},{"recorded_hours":"40","submission_date":"2012-06-22 05:36:35","delete_checked":"N","transferred_to":"None","timecard_ovn":"2","absence_days":"0","stop_time":"2012-06-22 23:59:59","start_time":"2012-06-16 00:00:00","resource_id":"14007","absence_hours":"0","timecard_id":364329994,"approval_status":"Approved"},{"recorded_hours":"40","submission_date":"2012-06-15 07:59:30","delete_checked":"N","transferred_to":"None","timecard_ovn":"2","absence_days":"0","stop_time":"2012-06-15 23:59:59","start_time":"2012-06-09 00:00:00","resource_id":"14007","absence_hours":"0","timecard_id":362930597,"approval_status":"Approved"},{"recorded_hours":"40","submission_date":"2012-06-08 07:02:50","delete_checked":"N","transferred_to":"None","timecard_ovn":"2","absence_days":"0","stop_time":"2012-06-08 23:59:59","start_time":"2012-06-02 00:00:00","resource_id":"14007","absence_hours":"0","timecard_id":361530861,"approval_status":"Approved"},{"recorded_hours":"40","submission_date":"2012-06-01 08:55:41","delete_checked":"N","transferred_to":"None","timecard_ovn":"2","absence_days":"0","stop_time":"2012-06-01 23:59:59","start_time":"2012-05-26 00:00:00","resource_id":"14007","absence_hours":"0","timecard_id":360105534,"approval_status":"Approved"},{"recorded_hours":"40","submission_date":"2012-05-24 07:38:07","delete_checked":"N","transferred_to":"None","timecard_ovn":"2","absence_days":"0","stop_time":"2012-05-25 23:59:59","start_time":"2012-05-19 00:00:00","resource_id":"14007","absence_hours":"0","timecard_id":358769016,"approval_status":"Approved"},{"recorded_hours":"40","submission_date":"2012-05-18 05:16:16","delete_checked":"N","transferred_to":"None","timecard_ovn":"2","absence_days":"0","stop_time":"2012-05-18 23:59:59","start_time":"2012-05-12 00:00:00","resource_id":"14007","absence_hours":"0","timecard_id":357641774,"approval_status":"Approved"}]}';
                showTemplates(data);
            },
            error: function (request, status, error) {
                $("#loading_screen1").hide();
                alert(error);
            }
                            
        });
    }
    
    
    
    
    $("#loading_screen").hide();
    var response = JSON.parse(data);
    if(response.response == 'success'){
        if(response.data.length){
            
            var item1 = '<fieldset data-role="controlgroup">';
            for(var p=0;p<response.data.length;p++){
                //  var tobj3 = tlist1[p];
                var date2 = new Date(response.data[p]);
                // date2.setDate(date2.getDate()+6);
                var mon = parseInt(date2.getMonth(),10)+1;
                var day = parseInt(date2.getDate(),10);
                var month = ''+mon;
                var dayStr = ''+day;
                if(mon<10)
                    month = '0'+mon;
                // date = date1.getFullYear()+'/0'+mon+'/'+date1.getDate();
                if(day<10)
                    dayStr = '0'+day;
                
                var enddate = date2.getFullYear()+'/'+month+'/'+dayStr;
                var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
                var enddatedisp = dayStr+'-'+months[mon-1]+'-'+date2.getFullYear();
                item1 += '<label class="approval_lable listview_li"><input type="checkbox" name="datecheck" value="'+enddate+'"/> <span class="listview_bg tstitle" >'+enddatedisp+'</span> </label><span class="approval_arrow_bg" ></span>';
            }
            item1 += '</fieldset>';
            $("#date_select").html(item1).trigger( "create" );//.page();
        }else{
            $("#dialoglink").attr('href','timesheet.html');
            alert("Timecards already exists for next 3 weeks");
        //document.location = "timesheet.html";
        }
    }else{
        
    }
        
        
    $( 'input[name=datecheck]' ).change(        function ( )        {

        $("input[name=datecheck]").each ( function() {
            $("input[name=datecheck]").attr("checked",false).checkboxradio("refresh");
        });
        if ( $( this ).attr( 'checked' ) )            {
            $( this ).attr("checked",false);
        } else            {
            $( this ).attr("checked",true);
        }
        next();
    });

}
function urldecode(str) {
    return decodeURIComponent((str+'').replace(/\+/g, '%20'));
}
function showTemplates(data){
    data = urldecode(data);
    //    alert(data);
    $("#loading_screen1").hide();
    var response = JSON.parse(data);
    if(response.response == 'success'){
            
        var item1 = '<fieldset data-role="controlgroup">';
        //        item1 += '<label class="approval_lable listview_li"><input type="checkbox" name="templatecheck" value="LAST_TIME_CARD"/> <span class="listview_bg tstitle" >Last Timecard</span> </label><span class="approval_arrow_bg" ></span>';
        for(var p=0;p<response.data.length;p++){
            var obj = response.data[p];
            item1 += '<label class="approval_lable listview_li"><input type="checkbox" name="templatecheck" value="'+obj.TEMPLATE_ID+'"/> <span class="listview_bg tstitle" >'+obj.TEMPLATE_NAME+'</span> </label><span class="approval_arrow_bg" ></span>';
        }
        item1 += '</fieldset>';
        //           alert(item1);
        $("#template_select").html(item1).trigger( "create" );//.page();

    }else{
        
    }
    $( 'input[name=templatecheck]' ).change(        function ( )        {

        var check = false;
        if ( $( this ).attr( 'checked' ) )            {
            check = true;
        } //alert(check);
        $("input[name=templatecheck]").each ( function() {
            $("input[name=templatecheck]").attr("checked",false).checkboxradio("refresh");
        });
        $( this ).attr("checked",check).checkboxradio("refresh");
    });
}

$(document).ready(function(){
    $("#user_name").text(localStorage.username);

    var hash = getHash();
    //Date List for next available timesheets        
    var url = baseURL+'DateList'; //'https://etsmobile.jacobs.com/restful/DateList';
    $("#loading_screen").show();
    var params = '{\"resource_id":\"'+userId+'\",\"hash":\"'+hash+'\"}';
    //   alert(params);
    if(isMobile.iOS()){
        window.location = BASE_DELI_MITER+'datelistrequest'+DELI_MITER+userId+DELI_MITER+hash;
    }
    else{
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'jsonp',
            data:'datelistrequest='+params,
            timeout: 30000,
            async: false,
            success: function (data, textStatus, xhr) {
                showDates(data);
            },
            error: function (request, status, error) {
                $("#loading_screen").hide();
                alert(error);
            }
                            
        });
    }
       
   
    $( "#canceldialog" ).bind({
        popupafterclose: function(event, ui) {
            var location = $("#dialoglink").attr('href');
            $("#dialoglink").attr('href','');
            //   console.log(location);
            if(location.length)
                document.location = location;                  
        }
    });

});



//NEXT BUTTON ACTION
function next(){

    start_date = '';
    start_date = $("input[type=checkbox]:checked").val();
    if(start_date == undefined){
        alert("Select date");
        return;
    }

    $("#cancel_create").hide();
    $("#cancel_date").show();
    
    $("#next").hide();
    $("#create").show();
    $("#date_select").hide();
    $("#template_select").show(0);
// }
}
//CANCEL BUTTON ACTION
function cancelDate(){
    $("#cancel_create").show();
    $("#cancel_date").hide();
    
    $("#next").show();
    $("#create").hide();
    $("#template_select").hide();
    $("#date_select").show(0);
}

// CREATE BUTTON ACTION
function create(){

    var template = $("input[name=templatecheck]:checked").val();
    template = (template == undefined)?0:template;
    //    alert(template);
    var targetDate = new Date(start_date);
    targetDate.setDate(targetDate.getDate() - 6);
    var dd = targetDate.getDate();
    var mm = targetDate.getMonth(); // 0 is January, so we must add 1
    var yyyy = targetDate.getFullYear();
    var arr = new Array( "JAN", "FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC");
    //    var dateString = dd + "-" + arr[mm] + "-" + yyyy;
    var dateString = yyyy + "-" + (mm+1) + "-" + dd +' 00:00:00';
    //    alert(dateString);
    localStorage.timesheetid='';
    localStorage.templateid = template;
    localStorage.tsenddate=start_date;  //2013/03/01
    localStorage.editable=true;
    localStorage.initfromts=true;
    localStorage.timesheetovn = '';
    localStorage.tsstartdate = dateString; //2013-2-23 00:00:00          //start_date.replace (/\//g, "-")+' 00:00:00';
    localStorage.fromcreate = true; 
    document.location='timesheetdata.html';
      
}  


function backAction(){
    document.location='timesheet.html';
}