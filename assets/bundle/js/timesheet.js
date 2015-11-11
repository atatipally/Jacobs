
var baseURL = connectionURL;
if(localStorage.currentURL == "1"){
    baseURL = altConnectionURL;
}

$(document).ready(function(){
    var userId = localStorage.userid;//=96381; 
    $("#user_name").text(localStorage.username);
    //var url = 'http://10.0.133.30:8001/jacobsMServer/TimeSheets';
    var url = baseURL+'TimeSheets'; //'https://etsmobile.jacobs.com/restful/TimeSheets'
    $("#loading_screen").show();
    localStorage.timecardData = undefined;
    localStorage.deleterowids = '';
    localStorage.timecardSubmitted = 0;
    localStorage.initfromts = true;
    var hash = getHash();
    var params = '{\"employeeid":\"'+userId+'\",\"hash":\"'+hash+'\"}';
    if(isMobile.iOS()){
        window.location = BASE_DELI_MITER+'timesheetrequest'+DELI_MITER+userId+DELI_MITER+hash;
    }
    else{
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'jsonp',
            data:'timesheetrequest='+params,
            timeout: 30000,
            async: false,
            success: function (data, textStatus, xhr) {
                // var data1 = '{"response":"success","data":[{"recorded_hours":"40","submission_date":"2012-06-29 07:34:00","delete_checked":"N","transferred_to":"None","timecard_ovn":"2","absence_days":"0","stop_time":"2012-06-29 23:59:59","start_time":"2012-06-23 00:00:00","resource_id":"14007","absence_hours":"0","timecard_id":366167570,"approval_status":"Approved"},{"recorded_hours":"40","submission_date":"2012-06-22 05:36:35","delete_checked":"N","transferred_to":"None","timecard_ovn":"2","absence_days":"0","stop_time":"2012-06-22 23:59:59","start_time":"2012-06-16 00:00:00","resource_id":"14007","absence_hours":"0","timecard_id":364329994,"approval_status":"Approved"},{"recorded_hours":"40","submission_date":"2012-06-15 07:59:30","delete_checked":"N","transferred_to":"None","timecard_ovn":"2","absence_days":"0","stop_time":"2012-06-15 23:59:59","start_time":"2012-06-09 00:00:00","resource_id":"14007","absence_hours":"0","timecard_id":362930597,"approval_status":"Approved"},{"recorded_hours":"40","submission_date":"2012-06-08 07:02:50","delete_checked":"N","transferred_to":"None","timecard_ovn":"2","absence_days":"0","stop_time":"2012-06-08 23:59:59","start_time":"2012-06-02 00:00:00","resource_id":"14007","absence_hours":"0","timecard_id":361530861,"approval_status":"Approved"},{"recorded_hours":"40","submission_date":"2012-06-01 08:55:41","delete_checked":"N","transferred_to":"None","timecard_ovn":"2","absence_days":"0","stop_time":"2012-06-01 23:59:59","start_time":"2012-05-26 00:00:00","resource_id":"14007","absence_hours":"0","timecard_id":360105534,"approval_status":"Approved"},{"recorded_hours":"40","submission_date":"2012-05-24 07:38:07","delete_checked":"N","transferred_to":"None","timecard_ovn":"2","absence_days":"0","stop_time":"2012-05-25 23:59:59","start_time":"2012-05-19 00:00:00","resource_id":"14007","absence_hours":"0","timecard_id":358769016,"approval_status":"Approved"},{"recorded_hours":"40","submission_date":"2012-05-18 05:16:16","delete_checked":"N","transferred_to":"None","timecard_ovn":"2","absence_days":"0","stop_time":"2012-05-18 23:59:59","start_time":"2012-05-12 00:00:00","resource_id":"14007","absence_hours":"0","timecard_id":357641774,"approval_status":"Approved"}]}';
                showTimesheets(data);
            },
            error: function (request, status, error) {
                $("#loading_screen").hide();
                //alert(error);
                $("#error_msg").text(error);
                $("#canceldialog").popup('open');
            }
                            
        });
    }
});

function urldecode(str) {
    return decodeURIComponent((str+'').replace(/\+/g, '%20'));
}

// GENERATING TIMESHEET LIST HTML
function showTimesheets(data){
    data = urldecode(data);
    // alert(data);
    var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    $("#loading_screen").hide();
    var response = JSON.parse(data);
    if(response.response == 'success'){
        var resdata = response.data;
                
        var html = '';
        for (var i=0;i<resdata.length;i++){
            var obj = resdata[i];
            
            var startDate = obj.start_time.split(' ')[0];
            var start = startDate.split('-');
            var sdate = start[2]+'-'+months[(parseInt(start[1],10)-1)]+'-'+start[0];
                     
            
            var endDate = obj.stop_time.split(' ')[0];
            var end = endDate.split('-');
            var date = end[2]+'-'+months[(parseInt(end[1],10)-1)]+'-'+end[0];
            //alert(date);
            
            var period = date;//obj.start_time.split(' ')[0];
            //   period += ' to '+obj.stop_time.split(' ')[0];
            var item = '<li onClick="loadTimesheet(\''+obj.timecard_id+'\',\''+date+'\',\''+obj.approval_status+'\',\''+obj.timecard_ovn+'\',\''+obj.start_time+'\')" data-theme=c class=listview_li><a href=# class=listview_bg><p class=tstitle>'+period+'</p></a>';
            item += '<span class=arrow_img>'+obj.recorded_hours+'&nbsp&nbsp&nbsp&nbsp</span>';
            
            if(obj.approval_status.toUpperCase() == 'APPROVED'){
                item += '<p class="ts_approved_state">Approved</p>';
            }else if(obj.approval_status.toUpperCase() == 'SUBMITTED'){
                item += '<p class="ts_submitted_state">Submitted</p>';
            }else if(obj.approval_status.toUpperCase() == 'REJECTED'){
                item += '<p class="ts_declined_state">Rejected</p>';
            }else if(obj.approval_status.toUpperCase() == 'WORKING'){
                item += '<p class=ts_open_state>Working</p>';
            }
            item += '</li>';
                                    
            html += item;
           
        }
    }else{
        var dataObj = response.data;
        // alert('Error : '+dataObj.status);
        $("#error_msg").text(dataObj.status);
        $("#canceldialog").popup('open');
    }
    $("#content").html(html).listview("refresh");

}


//NOT IN USE
function quickAdd(){
    localStorage.editable=true;
    localStorage.timesheetid=0;
    document.location = "timesheetdata.html";
}

// LOAD SELECTED TIMESHEET (CLICK ACTION FOR LIST OF TIMECARDS)
function loadTimesheet(id,endDate,state,ovn,startTime){
    // alert(id+'-'+state);
    localStorage.timesheetid=id;
    localStorage.tsenddate=endDate; //22-FEB-2013
    localStorage.editable=true;
    localStorage.initfromts = true;
    localStorage.timesheetovn = ovn;
    localStorage.tsstartdate = startTime;   //2013-02-16 00:00:00
    var editable = true;
    if (state.toUpperCase() == 'APPROVED' || state.toUpperCase() == 'SUBMITTED'){
        localStorage.editable=false;
        editable=false;
    }
    document.location = "timesheetdata.html";    
}

function backAction(){
    document.location = "menu.html";
}