/* ****************** AMPM BUILD (updating AMPM for all days)*****************
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


//  var hours = new Array();
var selectedDay = 0;
var selectedProject = 0;
var days = ['sat','sun','mon','tue','wed','thu','fri'];
var projects;
var project_track;
var response;
var res_track;
var timesheetid;
var updateData;
var userId;
var tcComment = '';
var mode_update; //SAVE/SUBMIT
var newHireDays = 0; //If employee is a new hire, it indicates how many days should disable in that joining week starting from satureday
var jsonToUpdate;   // used when mealbreak popup is open
//var resData = '{"response":"success","data":[{"TASK_NUMBER":"CALCD","BILLABLE_FLAG":"N","ITEMKEY":"14656299","DETAIL_WARNING":"DetailWarningNo","PROJECT_NUMBER":"501000","APPROVAL_STATUS_DISP":"Approved","TOTAL_HOURS":23,"TC_BB_OVN":5,"CLASS_DETAIL":"CALCD","WEEK_END_DATE":"2012-06-29 00:00:00.0","PERIOD_DISP":"23-Jun-2012 - 29-Jun-2012","LINE_TYPE":"RG","AM":"AM","TC_BB_ID":365911810,"RESOURCE_ID":96381,"APPROVAL_STATUS":"APPROVED","HOUR_TYPE":"REGULAR PAY","DAY1":0,"WEEK_START_DATE":"2012-06-23 00:00:00.0","DAY2":0,"DAY3":4,"DAY4":6,"DAY5":4,"DAY6":5,"DAY7":4,"FULL_NAME":"Seshadri, Rajinikanthan"},{"TASK_NUMBER":"ETS","BILLABLE_FLAG":"N","ITEMKEY":"14656299","DETAIL_WARNING":"DetailWarningNo","PROJECT_NUMBER":"501000","APPROVAL_STATUS_DISP":"Approved","TOTAL_HOURS":4,"TC_BB_OVN":5,"CLASS_DETAIL":"ETS","WEEK_END_DATE":"2012-06-29 00:00:00.0","PERIOD_DISP":"23-Jun-2012 - 29-Jun-2012","LINE_TYPE":"RG","AMPM":"AM","TC_BB_ID":365911810,"RESOURCE_ID":96381,"APPROVAL_STATUS":"APPROVED","HOUR_TYPE":"REGULAR PAY","DAY1":0,"WEEK_START_DATE":"2012-06-23 00:00:00.0","DAY2":0,"DAY3":3,"DAY4":0,"DAY5":1,"DAY6":0,"DAY7":0,"FULL_NAME":"Seshadri, Rajinikanthan"},{"TASK_NUMBER":"JEMS","BILLABLE_FLAG":"N","ITEMKEY":"14656299","DETAIL_WARNING":"DetailWarningNo","PROJECT_NUMBER":"501000","APPROVAL_STATUS_DISP":"Approved","TOTAL_HOURS":7,"TC_BB_OVN":5,"CLASS_DETAIL":"JEMS","WEEK_END_DATE":"2012-06-29 00:00:00.0","PERIOD_DISP":"23-Jun-2012 - 29-Jun-2012","LINE_TYPE":"RG","AMPM":"AM","TC_BB_ID":365911810,"RESOURCE_ID":96381,"APPROVAL_STATUS":"APPROVED","HOUR_TYPE":"REGULAR PAY","DAY1":0,"WEEK_START_DATE":"2012-06-23 00:00:00.0","DAY2":0,"DAY3":2,"DAY4":3,"DAY5":2,"DAY6":0,"DAY7":0,"FULL_NAME":"Seshadri, Rajinikanthan"},{"TASK_NUMBER":"TRS","BILLABLE_FLAG":"N","ITEMKEY":"14656299","DETAIL_WARNING":"DetailWarningNo","PROJECT_NUMBER":"501000","APPROVAL_STATUS_DISP":"Approved","TOTAL_HOURS":6,"CLASS_DETAIL":"TRS","TC_BB_OVN":5,"WEEK_END_DATE":"2012-06-29 00:00:00.0","PERIOD_DISP":"23-Jun-2012 - 29-Jun-2012","LINE_TYPE":"RG","TC_BB_ID":365911810,"RESOURCE_ID":96381,"APPROVAL_STATUS":"APPROVED","HOUR_TYPE":"REGULAR PAY","DAY1":0,"WEEK_START_DATE":"2012-06-23 00:00:00.0","DAY2":0,"DAY3":0,"DAY4":0,"DAY5":2,"DAY6":4,"DAY7":0,"FULL_NAME":"Seshadri, Rajinikanthan"}]}';
//localStorage.timecardData = resData;
var tc_state = ''; //Working, Submitted, Approved, Rejected

var baseURL = connectionURL;
if(localStorage.currentURL == "1"){
    baseURL = altConnectionURL;
}

function alert(msg){
    $("#error_msg").text(msg);
    $("#canceldialog").popup('open');
}
Date.daysBetween = function( date1, date2 ) {
    //Get 1 day in milliseconds
    var one_day=1000*60*60*24;
    
    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();
    
    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;
    
    // Convert back to days and return
    return Math.round(difference_ms/one_day);
}
$(document).ready(function(){
    window.orientation = 0;
    switch(window.orientation) 
    {  
        case -90:
        case 90:
            $('#week_table').hide();
            $("#datatable").hide();
            $("#datatable_header").hide();
            $("#datatable_landscape").show();
            $("#datatable_landscape_header").show();
            console.log("OnLoad : "+window.orientation);
            break;
        default:
            //portrait
            $("#datatable").show();
            $("#datatable_header").show();
            $("#datatable_landscape").hide();
            $("#datatable_landscape_header").hide();
            console.log("OnLoad : "+window.orientation);
            break; 
    }
    //   localStorage.editable = true;//Has to remove: added for testing when no network connection.
    //   localStorage.timecardData = resData;//Has to remove: added for testing when no network connection.
    userId = localStorage.userid;
    $("#user_name").text(localStorage.username);
    if(localStorage.editable == 'false'){
        if(localStorage.initfromts == 'true'){
            $('#comments').attr('readonly','readonly');
        }
        $(".projects_table").css("margin-top","30px");
        $('#new_project').hide();
        $('#action_menu').hide();
        $('#week_table').hide();
    }
    if(localStorage.initfromts == 'false'){
        userId = localStorage.loadTimeSheetForResourse;
        $("#user_name").text(localStorage.resourceNameForTimeSheet);
        $("#save_action_button").hide();
        $("#submit_action_button").hide();
        $("#delete_action_button").hide();
        $("#approve_action_button").show();
        $("#reject_action_button").show();
        //       if((localStorage.approvalstatus != 'Approved')&&(localStorage.approvalstatus != 'In Process')&&(localStorage.approvalstatus != 'Missing'))
        if(localStorage.approvalstatus == 'Submitted')
            $('#action_menu').show();
        
        $("#employee_comment").show();
    // $("#comments_div").hide();
    }
    if(localStorage.timesheetid.length == 0){
        $("#delete_action_button").hide();
        $("#submit_action_button").hide();
    }

    var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    var title = '';
    var sDate = localStorage.tsstartdate;//2013-10-12 00:00:00
    var dtArr = sDate.split(' ')[0].split('-');
    if(localStorage.initfromts == 'false'){
        sDate = dtArr[0]+'-'+dtArr[1]+' to ';   //18-OCT-2013
    }else{
        sDate = dtArr[2]+'-'+months[parseInt(dtArr[1],10)-1]+' to ';
    }
    var endDate = localStorage.tsenddate;//18-OCT-2013
    var endArr = endDate.split('/');
    if(localStorage.timesheetid.length == 0){
        endDate = endArr[2]+'-'+months[parseInt(endArr[1],10)-1]+'-'+endArr[0]; //2013/11/01
    }
    title = sDate + endDate;
    $("#header_title").text(title);
    
    //NEW HIRE LOGIC STARTS
    endArr = endDate.split('-');    //DD-MMM-YYYY
    var jDate = localStorage.joindate.split('-');//"05-MAR-01"
    var joinDate = new Date("20"+jDate[2],months.indexOf(jDate[1]),jDate[0]);   // YYYY,MM,DD
    //    var joinDate = new Date("2013","09","31");   // YYYY,MM,DD
    sDate = new Date(dtArr[0],parseInt(dtArr[1],10)-1,dtArr[2]);
    endDate = new Date(endArr[2],months.indexOf(endArr[1]),endArr[0]);
    var diffBwStartEND = Date.daysBetween(sDate, endDate);
    console.log(sDate+"------"+joinDate+"-----"+endDate+"---------diff :"+diffBwStartEND);
    newHireDays = 0;
    if(diffBwStartEND < 6){
        sDate.setDate(endDate.getDate()-6);
    }
    if((sDate <= joinDate)&&(joinDate <= endDate)){
        //        alert("You are a New Hire");
        var i=1;
        while(sDate < joinDate){
            console.log("Date : "+sDate);
            sDate.setDate(sDate.getDate() + 1);
            //$("#week_table tr td:nth-child("+i+")").hide();
            $('#week_table tr:nth-child(1) td:nth-child('+i+')').hide();
            $("#week_table").children()
            $("#daytotal"+newHireDays).parent().hide();
            i++;
            newHireDays++;
        }
    }
    //NEW HIRE LOGIC END
    
    //Checking whether data is available locally or else need to load from server
    if((localStorage.timecardData == undefined) || (localStorage.timecardData == 'undefined')){
        var enddate = localStorage.tsenddate;
        timesheetid = localStorage.timesheetid;
        localStorage.selectedDay = -1;
        var hash = getHash();
 
        //var url = 'http://10.0.133.30:8001/jacobsMServer/TimeCardInfo';
        var url = baseURL+'TimeCardInfo_1'; 
        var params = '{"resource_id":"'+userId+'","weekend_date":"'+enddate+'","hash":"'+hash+'"}';
        var template = localStorage.templateid;
        //alert(template);
        if(localStorage.fromcreate == 'true'){
            if(template == 1){
                url = baseURL+'LastTimeCardDetails_1'; 
                console.log("Last time card details : "+url);
            }else{
                url = baseURL+'TemplateTimeCardDetails'; 
                params = '{"resource_id":"'+userId+'","timecard_id":"'+template+'","hash":"'+hash+'"}';
            }
        }
       
        $("#loading_screen").show(1,scrollDownPage);
        if(isMobile.iOS()){
            if(localStorage.fromcreate == 'true'){
                if(template == 1)
                    window.location = BASE_DELI_MITER+'last_tc_request'+DELI_MITER+userId+DELI_MITER+hash;
                else
                    window.location = BASE_DELI_MITER+'templatedetailsrequest'+DELI_MITER+userId+DELI_MITER+template+DELI_MITER+hash;
            }else{
                window.location = BASE_DELI_MITER+'timecardsrequest'+DELI_MITER+userId+DELI_MITER+enddate+DELI_MITER+hash;
            }
            
        }
        else{
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'jsonp',
                data:'timecardsrequest='+params,
                timeout: 30000,
                async: false,
                contentType: "application/json; charset=utf-8",
                success: function (data, textStatus, xhr) {

                    //    localStorage.timecardData = data;
                    //    updatePage();
                    showTimesheetDetails(data);    
                },
                error: function (request, status, error) {
                    $("#loading_screen").hide();
                    alert(error);
                }
 
            });
        }

    }else{
        updatePage(localStorage.timecardData);
    }

    // Tracking change in comments
    $("#comments").change( function(){ 
        //  alert($(this).val());
        res_track.comments = $(this).val();
    });


    // Portrait mode Input field focus
    $("#datatable tr td input").live('focus', function() {
        $(this).val($(this).val());
        if(parseFloat($(this).val()) == 0){
            $(this).val('');
        } 

    });
    // Portrait mode Input field BLUR
    $("#datatable tr td input").live('blur', function() {
        //   $("#datatable tr td input").blur(function() {
        if($(this).val().length == 0){
            $(this).val('0');
        }
        var intRegex = /^\d+$/;
        if(!intRegex.test($(this).val())) {
            $(this).val(parseFloat($(this).val()).toFixed(2));
        }
        
        var i = $("#datatable tr td input").index($(this));
        if(window.orientation == 90 || window.orientation == -90){
            selectedDay = i%7;
            //    console.log('day:'+selectedDay+'       index:'+parseInt(i/7));
            setHours(parseInt(i/7),($(this).val()))
        }
        else{
            setHours(i,($(this).val()))
        }
        response.data = projects;
        res_track.data = project_track;
        setWeekHours(selectedDay);
        
        var y = $(window).scrollTop();  //your current y position on the page
        $(window).scrollTop(y-70);
        
    });
    // Landscape mode Input field focus
    $("#datatable_landscape tr td input").live('focus', function() {
        $(this).val($(this).val());
        if(parseFloat($(this).val()) == 0){
            $(this).val('');
        }
    // $(this).select();
    });
    // Landscape mode Input field BLUR
    $("#datatable_landscape tr td input").live('blur', function() {
        if($(this).val().length == 0){
            $(this).val('0');
        }
        var intRegex = /^\d+$/;
        if(!intRegex.test($(this).val())) {
            $(this).val(parseFloat($(this).val()).toFixed(2));
        }
        
        var i = $("#datatable_landscape tr td input").index($(this));
        if(window.orientation == 90 || window.orientation == -90){
            selectedDay = i%7;
            //       console.log('day:'+selectedDay+'       index:'+parseInt(i/7));
            setHours(parseInt(i/7),($(this).val()))
        }
        else{
            setHours(i,($(this).val()))
        }
        response.data = projects;
        res_track.data = project_track;
        setWeekHours(selectedDay);
        
        var y = $(window).scrollTop();  //your current y position on the page
        $(window).scrollTop(y-50);
       
    });

    if(typeof(Storage)!=="undefined")
    {
    // alert('Yes! localStorage and sessionStorage support!');
    }
    else
    {
    //     alert('Sorry! No web storage support..');
    }
    // DELETE TIMECARD ACTION
    $("#delete_action_button").click(function(){
        //  alert('delete:'+timesheetid);
        var hash = getHash();
        var url = baseURL+'DeleteTimeCard'; //'https://etsmobile.jacobs.com/restful/DeleteTimeCard';
        $("#loading_screen").show(1,scrollDownPage);
        var params = '{"timecard_id":"'+timesheetid+'","hash":"'+hash+'"}';
        if(isMobile.iOS()){
            window.location = BASE_DELI_MITER+'deleterequest'+DELI_MITER+timesheetid+DELI_MITER+hash;
        }else{
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'jsonp',
                data:'deleterequest='+params,
                timeout: 30000,
                async: false,
                contentType: "application/json; charset=utf-8",
                success: function (data, textStatus, xhr) {
                    //alert(data);
                    //backAction();
                    var res = JSON.parse(data);//jQuery.parseJSON(myObject);
                    $("#loading_screen").hide();          
                    if(res.response == 'success'){
                        localStorage.timecardData = undefined;
                        $("#dialoglink").attr('href','timesheet.html');
                        alert(res.data.status);
                    //document.location = 'timesheet.html';
                    }else{
                        alert(res.data.status);
                    }
                },
                error: function (request, status, error) {
                    $("#loading_screen").hide();
                    alert(error);
                }
     
            });
        }
    });
    $("#save_action_button").click(function(){
        upDateTimeCard("SAVE");
    });
    $("#submit_action_button").click(function(){
        upDateTimeCard("SUBMIT");
    });
    
    
    $("#dialoglink").click(function(e) {
        e.preventDefault();

    });
        
    $( "#canceldialog" ).bind({
        popupafterclose: function(event, ui) {
            var location = $("#dialoglink").attr('href');
            $("#dialoglink").attr('href','');
            //            console.log(location);
            if(location.length)
                document.location = location;
        }
    });
    $( "#confirmdialog" ).bind({
        popupafterclose: function(event, ui) {
            var location = $("#confirmcancel").attr('href');
            $("#confirmcancel").attr('href','');
            //            console.log(location);
            if(location == "save"){
                upDateTimeCard("SAVE");
            }
            else if(location.length>4)   //4 because url must have .html so it's length is greater than 4
                document.location = location;
        }
    });
    $( "#certificatedialog" ).bind({
        popupafterclose: function(event, ui) {
            var location = $("#disagree").attr('href');
            $("#disagree").attr('href','');
                                   
            //            console.log(location);
            if(location == "agree"){
                completeUpdateProcess(jsonToUpdate);
            }
        }
    });
    $("#confirmcancel").click(function(){
        $("#confirmcancel").attr('href','timesheet.html');
        localStorage.timecardData = undefined;
        localStorage.deleterowids = '';
        localStorage.timecardSubmitted = 0;
    //        document.location = 'timesheet.html';
    });
    $("#confirmok").click(function(){
        $("#confirmcancel").attr('href','save');
    //        setTimeout(function() {
    //            upDateTimeCard("SAVE");
    //        }, 1); 
    });
});

function setCursorAtEnd(ctrl){
    if(ctrl.value == 0){
        ctrl.value = '';
    }else{
        setTimeout(function() {
            ctrl.setSelectionRange(ctrl.value.length, 9999);
        }, 1); 
    }
}
function scrollDownPage(){
    console.log("loading show")
    $('html,body').scrollTop(0);  //your current y position on the page
// $(window).scrollTop(y-300);
}
function urldecode(str) {
    return decodeURIComponent((str+'').replace(/\+/g, '%20'));
}

// PROCESSING RESPONSE FOR TIMECARD DETAILS
function showTimesheetDetails(data){
    data = urldecode(data);
    //    alert(data);
    if(localStorage.fromcreate == 'true'){
        localStorage.fromcreate = false;
        data = JSON.stringify(makeZeroHours(data));
    }else{
    // data = JSON.stringify(makeSeperateAttrIds(data));
    }
    updatePage(data);
}
function timecardDeleted(data){ // Called after getting response for delete timecard from IOS native code
    var res = JSON.parse(data);
    $("#loading_screen").hide();          
    if(res.response == 'success'){
        $("#dialoglink").attr('href','timesheet.html');
        localStorage.timecardData = undefined;
        alert(res.data.status);
    //  document.location = 'timesheet.html';
    }else{
        alert(res.data.status);
    }
}
// VALIDATION FOR NUMBER FIELDS
function validate(evt) {
    var value = $(evt.target).val();
    
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode( key );
    var regex = /[0-9]|\./;
    if( !regex.test(key) ) {
        theEvent.returnValue = false;
        if(theEvent.preventDefault) theEvent.preventDefault();
    }
    if(value.length > 4){
        theEvent.returnValue = false;
        if(theEvent.preventDefault) theEvent.preventDefault();
    }
}

// UPDATING ENTIRE PAGE WITH RESPONSE
function updatePage(data){
    $("#loading_screen").hide();   
    var myObject = data;
    response = JSON.parse(myObject);//jQuery.parseJSON(myObject);
    var empComment = '';
    if((localStorage.timecardData == undefined) || (localStorage.timecardData == 'undefined')){
        res_track = JSON.parse(myObject);
        startTrack();
    }else{
        res_track = JSON.parse(localStorage.trackChanges);
    //  alert(JSON.stringify(res_track));
    }
    localStorage.timecardData = data;
    localStorage.trackChanges = JSON.stringify(res_track);
    if(response.response == 'success'){
        console.log("About to build UI : "+window.orientation);
        var resdata = response.data;
        var trackdata = res_track.data;
        projects = resdata;
        project_track = trackdata;
        var html = '';
                        
             
        var d = new Date();
        var n = d.getDay();
        if(localStorage.selectedDay == -1){
                
            n += 1;
            if(n>6){
                n=0;
            }
        }else{
            n = parseInt(localStorage.selectedDay,10);
        }
        if(newHireDays > n){ //NEW HIRE LOGIC
            n = newHireDays;
        }
        var editable = localStorage.editable;
        var partial_week_reason = '';
        
        
        if(window.orientation == 0 && localStorage.editable == 'true'){ // PORTRAIT Editing Mode
            console.log("Normal portrait mode");
            //  $("#time_entry_form").css("margin-top", "55px");
            for(var i=0;i<resdata.length;i++){

                var obj = resdata[i];
                //            console.log(obj.PROJECT_NUMBER+'----'+obj.TASK_NUMBER+'----'+obj.LINE_TYPE+'----'+obj.BILLABLE_FLAG+'----'+obj.AMPM+'----'+obj.JOB_FUNCTION+'----'+obj.SHIFT+'----'+obj.CLIENT_CODE);
                obj.PROJECT_NUMBER = (obj.PROJECT_NUMBER == undefined)?'':obj.PROJECT_NUMBER;
                obj.TASK_NUMBER = (obj.TASK_NUMBER == undefined)?'':obj.TASK_NUMBER;
                obj.LINE_TYPE = (obj.LINE_TYPE == undefined)?'':obj.LINE_TYPE;
                obj.BILLABLE_FLAG = (obj.BILLABLE_FLAG == undefined)?'':obj.BILLABLE_FLAG;
                obj.AMPM = (obj.AMPM == undefined)?'':obj.AMPM;
                obj.JOB_FUNCTION = (obj.JOB_FUNCTION == undefined)?'':obj.JOB_FUNCTION;
                obj.SHIFT = (obj.SHIFT == undefined)?'':obj.SHIFT;
                obj.CLIENT_CODE = (obj.CLIENT_CODE == undefined)?'':obj.CLIENT_CODE;
            
                //            console.log(obj.PROJECT_NUMBER+'----'+obj.TASK_NUMBER+'----'+obj.LINE_TYPE+'----'+obj.BILLABLE_FLAG+'----'+obj.AMPM+'----'+obj.JOB_FUNCTION+'----'+obj.SHIFT+'----'+obj.CLIENT_CODE);
     
                var project = obj.PROJECT_NUMBER;
                var task = '';
                try{
                    task = decodeURIComponent(obj.TASK_NUMBER);
                }catch(e){
                    task = obj.TASK_NUMBER;
                }
                task = task.replace(/%20/g, " ");
                var type = obj.LINE_TYPE;
                var billable = (obj.BILLABLE_FLAG == 'Y')?'B':obj.BILLABLE_FLAG;
                var hours = getHours(obj,n);
                var ampm = obj.AMPM;
                var disabled = '';
                if(editable == 'false'){
                    disabled = 'disabled="disabled"';
                }
                
                if(!isNaN(parseInt(type,10))){
                    //     console.log("TYPE : "+parseInt(type));
                    for(var l=0;l<response.types.length;l++){
                        var tObj = response.types[l];
                        //        console.log("TYPE_OBJ : "+parseInt(tObj.ELEMENTID));
                        if(parseInt(tObj.ELEMENTID,10) == parseInt(type,10)){
                            type = tObj.TASK_CODE;
                            break;
                        }
                    }
                }else{
                    var typeCode = obj.HOUR_TYPE;
                    typeCode = typeCode.split('#')[1];
                    //     console.log("TYPE CODE : "+parseInt(typeCode));
                    for(var l=0;l<response.types.length;l++){
                        var tObj = response.types[l];
                        //  console.log("TYPE_OBJ : "+parseInt(tObj.ELEMENTID));
                        if(parseInt(tObj.ELEMENTID,10) == parseInt(typeCode,10)){
                            type = tObj.TASK_CODE;
                            response.data[i].LINE_TYPE = tObj.ELEMENTID;
                            console.log("TYPE_CHANGED : "+response.data[i].LINE_TYPE);
                            break;
                        }
                    }
                }

                timesheetid = obj.TC_BB_ID;
                var item = '<tr><td class="projects_table_row_td">'+project+'</td><td class="projects_table_row_td">'+task+'</td><td class="projects_table_row_td">'+type+'</td><td class="projects_table_row_td">'+billable+'</td><td class="projects_table_row_td"><input type="number" id="input_hours'+i+'" class="projects_table_input_box" '+disabled+' value="'+hours+'" maxlength="5" onkeypress="validate(event)"/></td><td class="projects_table_row_td">'+ampm+'</td><td class="projects_table_row_td_arrow" onclick="openProjectDetails('+i+');"></td></tr>';
                html += item;
                if(i==0){
                    //   alert(':'+obj.TC_BB_OVN+':');
                    if(obj.TC_BB_OVN){
                        localStorage.timesheetovn = obj.TC_BB_OVN;
                        console.log('OVN length -  '+obj.TC_BB_OVN);
                    }
                    partial_week_reason = obj.PARTIAL_WEEK_REASON;
                    try{
                        if(obj.TIMECARD_COMMENT != undefined)
                            empComment = decodeURIComponent(obj.TIMECARD_COMMENT);
                    }
                    catch(e){
                        console.log('Exception: '+e)
                        empComment = (obj.TIMECARD_COMMENT != undefined)?obj.TIMECARD_COMMENT:"";
                    }
                    
                    tcComment = empComment;
                    if(res_track.comments != '-' && res_track.comments != tcComment && res_track.comments.length)
                        empComment = res_track.comments;
                
                    //$("#employee_comment span").text(empComment);
                    $("#employee_comment_box").val(empComment);
                    if(localStorage.initfromts == 'true'){
                        empComment = (empComment == '-')?'':empComment;
                        $("#comments").val(empComment);
                    }
                    if(obj.APPROVAL_STATUS == 'REJECTED'){
                        $("#approver_comment").show();
                        //$("#approver_comment span").text(obj.REJECTED_REASON);
                        $("#supervisor_comment_box").val(obj.REJECTED_REASON);
                    }    
                    tc_state = obj.APPROVAL_STATUS;
                }
            }
            if(localStorage.editable !== 'false'){
                html += '<tr><td id="new_project" colspan="7" class="projects_table_row_td new_project_td" onclick="addNewLine();">+ Add Line Item</td></tr>'
            }
            $("#datatable").append(html);
            setWeekHours(n);
        }
        else if(window.orientation == 0 && localStorage.editable == 'false'){ // Vertical Review Mode
            console.log("Readonly portrait mode");
            //  $("#time_entry_form").css("margin-top", "0px");
            var days = ['Satureday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'];
            for(var day=0;day<7;day++){
                var section = ''; 
                var totalHours = 0;
                for(var i=0;i<resdata.length;i++){
  
                    var obj = resdata[i];
            
                    // console.log(day+'-----'+obj.PROJECT_NUMBER+'----'+obj.TASK_NUMBER+'----'+obj.LINE_TYPE+'----'+obj.BILLABLE_FLAG+'----'+obj.AMPM+'----'+obj.JOB_FUNCTION+'----'+obj.SHIFT+'----'+obj.CLIENT_CODE);
                    obj.PROJECT_NUMBER = (obj.PROJECT_NUMBER == undefined)?'':obj.PROJECT_NUMBER;
                    obj.TASK_NUMBER = (obj.TASK_NUMBER == undefined)?'':obj.TASK_NUMBER;
                    obj.LINE_TYPE = (obj.LINE_TYPE == undefined)?'':obj.LINE_TYPE;
                    obj.BILLABLE_FLAG = (obj.BILLABLE_FLAG == undefined)?'':obj.BILLABLE_FLAG;
                    obj.AMPM = (obj.AMPM == undefined)?'':obj.AMPM;
                    obj.JOB_FUNCTION = (obj.JOB_FUNCTION == undefined)?'':obj.JOB_FUNCTION;
                    obj.SHIFT = (obj.SHIFT == undefined)?'':obj.SHIFT;
                    obj.CLIENT_CODE = (obj.CLIENT_CODE == undefined)?'':obj.CLIENT_CODE;
            
                    //            console.log(obj.PROJECT_NUMBER+'----'+obj.TASK_NUMBER+'----'+obj.LINE_TYPE+'----'+obj.BILLABLE_FLAG+'----'+obj.AMPM+'----'+obj.JOB_FUNCTION+'----'+obj.SHIFT+'----'+obj.CLIENT_CODE);
     
                    var project = obj.PROJECT_NUMBER;
                    var task = '';
                    try{
                        task = decodeURIComponent(obj.TASK_NUMBER);
                    }catch(e){
                        task = obj.TASK_NUMBER;
                    }
                    task = task.replace(/%20/g, " ");
                    var type = obj.LINE_TYPE;
                    var billable = (obj.BILLABLE_FLAG == 'Y')?'B':obj.BILLABLE_FLAG;
                    var hours = getHours(obj,day);
                    totalHours += hours;
                    
                    var disabled = '';
                    if(editable == 'false'){
                        disabled = 'disabled="disabled"';
                    }
            
 
                    if(!isNaN(parseInt(type,10))){
                        //     console.log("TYPE : "+parseInt(type));
                        for(var l=0;l<response.types.length;l++){
                            var tObj = response.types[l];
                            //        console.log("TYPE_OBJ : "+parseInt(tObj.ELEMENTID));
                            if(parseInt(tObj.ELEMENTID,10) == parseInt(type,10)){
                                type = tObj.TASK_CODE;
                                break;
                            }
                        }
                    }else{
                        var typeCode = obj.HOUR_TYPE;
                        typeCode = typeCode.split('#')[1];
                        //     console.log("TYPE CODE : "+parseInt(typeCode));
                        for(var l=0;l<response.types.length;l++){
                            var tObj = response.types[l];
                            //  console.log("TYPE_OBJ : "+parseInt(tObj.ELEMENTID));
                            if(parseInt(tObj.ELEMENTID,10) == parseInt(typeCode,10)){
                                type = tObj.TASK_CODE;
                                response.data[i].LINE_TYPE = tObj.ELEMENTID;
                                console.log("TYPE_CHANGED : "+response.data[i].LINE_TYPE);
                                break;
                            }
                        }
                    }

                    timesheetid = obj.TC_BB_ID;

                    var item = '';
                    if(hours!=0){
                        item = '<tr><td class="projects_table_row_td review_text">'+project+'</td><td class="projects_table_row_td review_text">'+task+'</td><td class="projects_table_row_td review_text">'+type+'</td><td class="projects_table_row_td review_text">'+billable+'</td><td class="projects_table_row_td review_text">'+hours+'</td><td class="projects_table_row_td_arrow" onclick="openProjectDetailsForDay('+i+','+day+');"></td></tr>';
                    }
                    section += item;
                    if(i==0 && day==0){
                        //   alert(':'+obj.TC_BB_OVN+':');
                        if(obj.TC_BB_OVN){
                            localStorage.timesheetovn = obj.TC_BB_OVN;
                            console.log('OVN length -  '+obj.TC_BB_OVN);
                        }
                        partial_week_reason = obj.PARTIAL_WEEK_REASON;
                        try{
                            if(obj.TIMECARD_COMMENT != undefined)
                                empComment = decodeURIComponent(obj.TIMECARD_COMMENT);
                        }
                        catch(e){
                            console.log('Exception: '+e)
                            empComment = (obj.TIMECARD_COMMENT != undefined)?obj.TIMECARD_COMMENT:"";
                        }
                        tcComment = empComment;
                        if(res_track.comments != '-' && res_track.comments != tcComment && res_track.comments.length)
                            empComment = res_track.comments;
                        empComment = empComment.replace(/%20/g, " ");
                        //$("#employee_comment span").text(empComment);
                        $("#employee_comment_box").val(empComment);
                        if(localStorage.initfromts == 'true'){
                            empComment = (empComment == '-')?'':empComment;
                            $("#comments").val(empComment);
                        }

                        tc_state = obj.APPROVAL_STATUS;
                    }
                }
                if(section.length)
                    section = '<tbody><th class="legend" colspan="6">'+days[day]+'<span class="review_day_total">Total Hours : '+totalHours.toFixed(2)+'</span></th>'+section;
                html += section;
            }

            $("#datatable").append(html+'</tbody>');
            setWeekHours(n);
            $("#datatablediv").trigger('create');
        }
        if(window.orientation == 90 || window.orientation == -90){ // Landscape Mode
            console.log("Landscape mode");
            //   $("#time_entry_form").css("margin-top", "0px");
            var total = [0,0,0,0,0,0,0];
            var tabindex = 0;
            for(var i=0;i<resdata.length;i++){

                var obj = resdata[i];
            
                //            console.log(obj.PROJECT_NUMBER+'----'+obj.TASK_NUMBER+'----'+obj.LINE_TYPE+'----'+obj.BILLABLE_FLAG+'----'+obj.AMPM+'----'+obj.JOB_FUNCTION+'----'+obj.SHIFT+'----'+obj.CLIENT_CODE);
                obj.PROJECT_NUMBER = (obj.PROJECT_NUMBER == undefined)?'':obj.PROJECT_NUMBER;
                obj.TASK_NUMBER = (obj.TASK_NUMBER == undefined)?'':obj.TASK_NUMBER;
                obj.LINE_TYPE = (obj.LINE_TYPE == undefined)?'':obj.LINE_TYPE;
                obj.BILLABLE_FLAG = (obj.BILLABLE_FLAG == undefined)?'':obj.BILLABLE_FLAG;
                obj.AMPM = (obj.AMPM == undefined)?'':obj.AMPM;
                obj.JOB_FUNCTION = (obj.JOB_FUNCTION == undefined)?'':obj.JOB_FUNCTION;
                obj.SHIFT = (obj.SHIFT == undefined)?'':obj.SHIFT;
                obj.CLIENT_CODE = (obj.CLIENT_CODE == undefined)?'':obj.CLIENT_CODE;
            
                //            console.log(obj.PROJECT_NUMBER+'----'+obj.TASK_NUMBER+'----'+obj.LINE_TYPE+'----'+obj.BILLABLE_FLAG+'----'+obj.AMPM+'----'+obj.JOB_FUNCTION+'----'+obj.SHIFT+'----'+obj.CLIENT_CODE);
     
                var project = obj.PROJECT_NUMBER;
                var task = '';
                try{
                    task = decodeURIComponent(obj.TASK_NUMBER);
                }catch(e){
                    task = obj.TASK_NUMBER;
                }
                task = task.replace(/%20/g, " ");
                var type = obj.LINE_TYPE;
                var billable = (obj.BILLABLE_FLAG == 'Y')?'B':obj.BILLABLE_FLAG;
                var ampm = obj.AMPM;
                var hours = getHours(obj,n);
                var disabled = '';//'disabled="disabled"';
                var class_disabled = "";
                if(editable == 'false'){
                    disabled = 'disabled="disabled"';
                    class_disabled = " review_text";
                }
            
                for(var day=0;day<7;day++){
                    var h = total[day];
                    h += getHours(obj, day);
                    total[day] = h;
                }
                
                if(!isNaN(parseInt(type,10))){
                    //     console.log("TYPE : "+parseInt(type));
                    for(var l=0;l<response.types.length;l++){
                        var tObj = response.types[l];
                        //        console.log("TYPE_OBJ : "+parseInt(tObj.ELEMENTID));
                        if(parseInt(tObj.ELEMENTID,10) == parseInt(type,10)){
                            type = tObj.TASK_CODE;
                            break;
                        }
                    }
                }else{
                    var typeCode = obj.HOUR_TYPE;
                    typeCode = typeCode.split('#')[1];
                    //     console.log("TYPE CODE : "+parseInt(typeCode));
                    for(var l=0;l<response.types.length;l++){
                        var tObj = response.types[l];
                        //  console.log("TYPE_OBJ : "+parseInt(tObj.ELEMENTID));
                        if(parseInt(tObj.ELEMENTID,10) == parseInt(typeCode,10)){
                            type = tObj.TASK_CODE;
                            response.data[i].LINE_TYPE = tObj.ELEMENTID;
                            console.log("TYPE_CHANGED : "+response.data[i].LINE_TYPE);
                            break;
                        }
                    }
                }

                timesheetid = obj.TC_BB_ID;

                var item = '<tr><td class="review_table_row_td'+class_disabled+'">'+project+'</td>'+
                '<td class="review_table_row_td'+class_disabled+'">'+task+'</td>'+
                '<td class="review_table_row_td'+class_disabled+'">'+type+'</td>'+
                '<td class="review_table_row_td'+class_disabled+'">'+billable+'</td>';
                for(var j=0;j<7;j++){
                    if(disabled.length){
                        item += '<td class="review_table_row_td'+class_disabled+'">'+getHours(obj,j)+'</td>';
                    }else{
                        if(newHireDays>j){//NEW HIRE LOGIC
                            item += '<td class="review_table_row_td" style="display:none;"><input type="number" tabindex="'+ tabindex +'" id="input_hours'+i+''+j+'" class="review_table_input_box" disabled="disabled" value="'+getHours(obj,j)+'" maxlength="5" onkeypress="validate(event)" onfocus="setCursorAtEnd(this);"/></td>';
                        }else{
                            item += '<td class="review_table_row_td"><input type="number" tabindex="'+ tabindex +'" id="input_hours'+i+''+j+'" class="review_table_input_box" '+disabled+' value="'+getHours(obj,j)+'" maxlength="5" onkeypress="validate(event)" onfocus="setCursorAtEnd(this);"/></td>';
                        }
                    }
                    tabindex++;
                }
                
                item += '<td class="new_project_table_td"><select id="input_ampm" tabindex="'+ tabindex +'" '+disabled+'  onchange="ampmChanged(this,'+i+')"><option value=""></option><option value="AM"'+((ampm=="AM")?' selected="selected"':'')+'>AM</option><option value="PM"'+((ampm=="PM")?' selected="selected"':'')+'>PM</option></select></td>'+
                '<td class="projects_table_row_td_arrow" onclick="openProjectDetails('+i+');"></td></tr>';
                html += item;
                tabindex++;
                if(i==0){
                    if(obj.TC_BB_OVN){
                        localStorage.timesheetovn = obj.TC_BB_OVN;
                        console.log('OVN length -  '+obj.TC_BB_OVN);
                    }
                    partial_week_reason = obj.PARTIAL_WEEK_REASON;
                    try{
                        if(obj.TIMECARD_COMMENT != undefined)
                            empComment = decodeURIComponent(obj.TIMECARD_COMMENT);
                    }
                    catch(e){
                        console.log('Exception: '+e)
                        empComment = (obj.TIMECARD_COMMENT != undefined)?obj.TIMECARD_COMMENT:"";
                    }
                    tcComment = empComment;
                    if(res_track.comments != '-' && res_track.comments != tcComment && res_track.comments.length)
                        empComment = res_track.comments;
                
                    //$("#employee_comment span").text(empComment);
                    $("#employee_comment_box").val(empComment);
                    if(localStorage.initfromts == 'true'){
                        empComment = (empComment == '-')?'':empComment;
                        $("#comments").val(empComment);
                    }
                    if(obj.APPROVAL_STATUS == 'REJECTED'){
                        $("#approver_comment").show();
                        //$("#approver_comment span").text(obj.REJECTED_REASON);
                        $("#supervisor_comment_box").val(obj.REJECTED_REASON);
                    }     
                    tc_state = obj.APPROVAL_STATUS;
                }
            }
 
            if(localStorage.editable != 'false'){
                //   uncomment below while implementing horizontal editing mode
                html += '<tr><td id="new_project" colspan="13" class="projects_table_row_td new_project_td" onclick="addNewLine();">+ Add Line Item</td></tr>'
            }
            $("#datatable_landscape").append(html);
            setWeekHours(n);
         
            $("#datatablediv").trigger('create');
        }
        if(response.show_pwr>0){    // IF Partial week reason is enabled for user
            $("#partial_week_table").show();
            console.log("PARTIAL_WEEK : "+partial_week_reason);
            partial_week_reason = (partial_week_reason==undefined)?'':partial_week_reason;
            partial_week_reason = (res_track.PARTIAL_WEEK_REASON != '-')?res_track.PARTIAL_WEEK_REASON:partial_week_reason;
            console.log("PARTIAL_WEEK_TARCK : "+res_track.PARTIAL_WEEK_REASON);
            console.log("PARTIAL_WEEK1111 : "+partial_week_reason);
            var disabled = '';//'disabled="disabled"';
            if(editable == 'false'){
                //       $("#partial_week_table").css("opacity","0.8");
                disabled = 'disabled="disabled"';
            }
            var partial_week_html = '<select class="partial_week_select" id="input_partial_week" onchange="partialWeekChanged(this)" '+disabled+'><option value=""></option>';
            for(var k=0;k<response.partialdata.length;k++){
                var pObj = response.partialdata[k];
                var selected = '';
                if((partial_week_reason == pObj.DESCRIPTION) || (partial_week_reason == pObj.FLEX_VALUE)){
                    selected = 'selected';
                    if(localStorage.initfromts == 'false'){
                        switch(parseInt(pObj.FLEX_VALUE,10)){
                            case 1:
                                alert('Exempt Employee with less than 40 total hours - REASON - I REQUESTED, RECEIVED APPROVAL FOR AND TOOK A FULL DAY OFF (WITHOUT PAY) FOR PERSONAL PURPOSES, SUCH AS VACATION, SICKNESS, OR DISABILITY');
                                break;
                            case 2:
                                alert('Exempt Employee with less than 40 total hours - REASON - I AM CURRENTLY ON INTERMITTENT LEAVE OR UNPAID LEAVE AS PROVIDED BY THE FAMILY AND MEDICAL LEAVE ACT.');
                                break;
                            case 3:
                                alert('Exempt Employee with less than 40 total hours - REASON - THIS IS MY FIRST OR FINAL WEEK OF EMPLOYMENT WITH THE COMPANY.');
                                break;
                            case 4:
                                alert('Exempt Employee with less than 40 total hours - REASON - I WAS SUSPENDED FOR A FULL DAY OR MORE FOR DISCIPLINARY PURPOSES OR VIOLATION OF SAFETY RULES OF MAJOR SIGNIFICANCE.');
                                break;
                            default:
                                break;
                        }
                    }
                }
                partial_week_html += '<option value="'+pObj.FLEX_VALUE+'" '+selected+'>'+pObj.DESCRIPTION+'</option>';
            }
            partial_week_html += '</select>';
            $("#partial_week_td").html(partial_week_html);
            $("#partial_week_table").trigger('create');
            $('#partial_week_table').click(function(){
                $('#input_partial_week').focus();
            });
        }
        localStorage.type_values = JSON.stringify(response.types); 
    }else{
        var dataObj1 = response.data;
        alert(dataObj1.status);
    }
 
    $("#datatable tr td").click(function() {
        if(window.orientation == 0 && localStorage.editable == 'true'){
            var i = $("#datatable tr td").index($(this));
            var tdCount = 7;
            console.log('td clicked'+((i-13)%tdCount));
            if((i-6)%tdCount){
                i=parseInt(i/tdCount);
                $("#input_hours"+i).focus();
            }else{
                if((i-6)/tdCount >= 0){
                    var index = (i-6)/tdCount;
                    localStorage.timecardData = JSON.stringify(response);
                    localStorage.selectedProjectIndex = index;
                
                    localStorage.selectedDay = selectedDay;
                //   document.location = "newproject.html";
                }
            }
        }
    });

}
function addNewLine(){
    localStorage.timecardData = JSON.stringify(response);
    localStorage.trackChanges = JSON.stringify(res_track);
    localStorage.selectedProjectIndex = -1;
    localStorage.selectedDay = selectedDay;
    document.location = "newproject.html";
}
window.onorientationchange = function() {
    switch(window.orientation) 
    {  
        case -90:
        case 90:
            //landscape
            $("#week_table").hide();
            $("#datatable").hide();
            $("#datatable_header").hide();
            
            //            $("#datatable_landscape").find("tr:gt(0)").remove();
            $("#datatable_landscape").find("tr").remove();
            $("#datatable_landscape").show();
            $("#datatable_landscape_header").show();
            //  document.location = "review.html";
            break; 
        default:
            //portrait
            //document.location = "timesheetdata.html";
            $("#datatable_landscape").hide();
            $("#datatable_landscape_header").hide();
            
            //            $("#datatable").find("tr:gt(0)").remove();
            $("#datatable").find("tr").remove();
            $("#datatable").show();
            $("#datatable_header").show();
            if(localStorage.editable == 'true')
                $('#week_table').show();
            break; 
    }
    localStorage.timecardData = JSON.stringify(response);
    localStorage.trackChanges = JSON.stringify(res_track);
    updatePage(JSON.stringify(response));
};

/*Used in Horizontal edit mode only --- Update AMPM onChange*/
function ampmChanged(element,n){
    var value = $(element).val();
    console.log('AMPM: '+value);
    var val = projects[n].AMPM;
    if(val != value){
        console.log('Changed AMPM: '+value+'----'+project_track[n].AMPM);
        projects[n].AMPM = value;
        project_track[n].AMPM = value;
    }
    response.data = projects;
    res_track.data = project_track;
}

function partialWeekChanged(element){
    var value = $(element).val();
    console.log('Changed PartiaWeek: '+res_track.PARTIAL_WEEK_REASON);
    res_track.PARTIAL_WEEK_REASON = value;
    console.log('Changed PartiaWeek: '+res_track.PARTIAL_WEEK_REASON);
}

/* returns hours for perticular project on selected day
 obj - JSON object of a project, n - day for which you want hours(0-6) */
function getHours(obj,n){
    var hours = 0;
    switch(n){
        case 0:
            hours = parseFloat(obj.DAY1);
            return isNaN(hours)?0:hours;
            break;
        case 1:
            hours = parseFloat(obj.DAY2);
            return isNaN(hours)?0:hours;
            break;
        case 2:
            hours = parseFloat(obj.DAY3);
            return isNaN(hours)?0:hours;
            break;
        case 3:
            hours = parseFloat(obj.DAY4);
            return isNaN(hours)?0:hours;
            break;
        case 4:
            hours = parseFloat(obj.DAY5);
            return isNaN(hours)?0:hours;
            break;
        case 5:
            hours = parseFloat(obj.DAY6);
            return isNaN(hours)?0:hours;
            break;
        case 6:
            hours = parseFloat(obj.DAY7);
            return isNaN(hours)?0:hours;
            break;
        default:
            return 0;
    }
}
 
function setWeekHours(today){
    
    $(".day_td,.day_td_highlight").click(function(){
        //  console.log(".day_td,.day_td_highlight click");
        $(this).siblings().removeClass('day_td_highlight');
        $(this).siblings().children().removeClass('day_hours_highlight');
                    
        $(this).addClass('day_td_highlight');
        $(this).children().addClass('day_hours_highlight');
                    
        var id = $(this).children().attr('id');
        selectedDay = days.indexOf(id);
        
        changeContents();
                    
    });
    
    selectedDay = today;
    var totalHours = 0;
    var otHours = 0;
    var regHours = 0;
    var fringeHours = 0;
    var intRegex = /^\d+$/;
    for(var i=0;i<days.length;i++){
        var hours = 0;
        for(var j=0;j<projects.length;j++){
            var obj = projects[j];
            var h = parseFloat(getHours(obj,i));
            hours += h;
            var type = obj.LINE_TYPE;
            for(var l=0;l<response.types.length;l++){
                var tObj = response.types[l];
                //  console.log("TYPE_OBJ : "+parseInt(tObj.ELEMENTID));
                if(parseInt(tObj.ELEMENTID,10) == parseInt(type,10)){
                    if(tObj.TASK_CODE == 'OT'){
                        otHours += h;
                    }
                    if(tObj.TASK_CODE == 'RG'){
                        regHours += h;
                    }
                    break;
                }
            }
            
            
        }
        totalHours += hours;

        if(window.orientation == 90 || window.orientation == -90)
            $('#daytotal'+i).text(parseFloat(hours.toFixed(2)));
        else
            $('#'+days[i]).text(parseFloat(hours.toFixed(2)));

    }
    fringeHours = totalHours - otHours - regHours;
    //    console.log(otHours+' : '+regHours+' : '+fringeHours);
    $("#"+days[today]).click();
    
    
    totalHours = intRegex.test(totalHours)?totalHours:totalHours.toFixed(2);
    otHours = intRegex.test(otHours)?otHours:otHours.toFixed(2);
    regHours = intRegex.test(regHours)?regHours:regHours.toFixed(2);
    fringeHours = (intRegex.test(fringeHours)?fringeHours:fringeHours.toFixed(2));//<0?0:fringeHours;
    $("#total_hours").html('<td class="projects_table_row_td ot_td">Overtime:<br/>'+otHours+'</td><td class="projects_table_row_td reg_td">Regular:<br/>'+regHours+'</td><td class="projects_table_row_td fringe_td">Fringe:<br/>'+fringeHours+'</td><td colspan="2" class="projects_table_row_td total_hours_td">Total Hours: <br/>'+totalHours+'</td>');
     
        
}
function changeContents(){
    for(var i=0;i<projects.length;i++){
        var obj = projects[i];
        //        var project = obj.PROJECT_NUMBER;
        //        var task = obj.TASK_NUMBER;
        //        var type = obj.LINE_TYPE;
        //        var billable = obj.BILLABLE_FLAG;
        var hours = getHours(obj,selectedDay);//obj.hours[selectedDay];
        var id = 'input_hours'+i;
            
        $('#'+id).val(hours);

    }
}
function setHours(p_ind,value){
    var val = 0;
    switch(selectedDay){
        case 0:
            val = projects[p_ind].DAY1;
            projects[p_ind].DAY1 = parseFloat(value);
            project_track[p_ind].DAY1 = parseFloat(value);
            if(val != value){
                projects[p_ind].DAY1_CHANGED = 1;
            }
            break;
        case 1:
            val = projects[p_ind].DAY2;
            projects[p_ind].DAY2 = parseFloat(value);
            project_track[p_ind].DAY2 = parseFloat(value);
            if(val != value){
                projects[p_ind].DAY2_CHANGED = 1;
            }
            break;
        case 2:
            val = projects[p_ind].DAY3;
            projects[p_ind].DAY3 = parseFloat(value);
            project_track[p_ind].DAY3 = parseFloat(value);
            if(val != value){
                projects[p_ind].DAY3_CHANGED = 1;
            }
            break;
        case 3:
            val = projects[p_ind].DAY4;
            projects[p_ind].DAY4 = parseFloat(value);
            project_track[p_ind].DAY4 = parseFloat(value);
            if(val != value){
                projects[p_ind].DAY4_CHANGED = 1;
            }
            break;
        case 4:
            val = projects[p_ind].DAY5;
            projects[p_ind].DAY5 = parseFloat(value);
            project_track[p_ind].DAY5 = parseFloat(value);
            if(val != value){
                projects[p_ind].DAY5_CHANGED = 1;
            }
            break;
        case 5:
            val = projects[p_ind].DAY6;
            projects[p_ind].DAY6 = parseFloat(value);
            project_track[p_ind].DAY6 = parseFloat(value);
            if(val != value){
                projects[p_ind].DAY6_CHANGED = 1;
            }
            break;
        case 6:
            val = projects[p_ind].DAY7;
            projects[p_ind].DAY7 = parseFloat(value);
            project_track[p_ind].DAY7 = parseFloat(value);
            if(val != value){
                projects[p_ind].DAY7_CHANGED = 1;
                console.log("DAY7 changed: "+projects[p_ind].AMPM+"     Track:"+project_track[p_ind].AMPM);
            //Code Commented as AMPM value should not defaluted to AM
            // var flag = ((projects[p_ind].AMPM == undefined) || (projects[p_ind].AMPM == ''));
            // projects[p_ind].AMPM = flag?'AM':projects[p_ind].AMPM;
            // project_track[p_ind].AMPM = flag?'AM':project_track[p_ind].AMPM;
            // console.log("DAY7 changed after: "+projects[p_ind].AMPM+"     Track:"+project_track[p_ind].AMPM+"   FLAG:"+flag);
            }
            break;
 
    }
}

function startTrack(){
    for(var i=0; i < res_track.data.length;i++){
        var obj = res_track.data[i];
        obj.PROJECT_NUMBER = '-';
        obj.TASK_NUMBER = '-';
        obj.BILLABLE_FLAG = '-';
        obj.LINE_TYPE = '-';
        obj.DAY1 = '-';
        obj.DAY2 = '-';
        obj.DAY3 = '-';
        obj.DAY4 = '-';
        obj.DAY5 = '-';
        obj.DAY6 = '-';
        obj.DAY7 = '-';
        obj.AMPM = '-';
        obj.JOB_FUNCTION = '-';
        obj.SHIFT = '-';
        obj.CLIENT_CODE = '-';
        res_track.data[i] = obj;
    }
    res_track.comments = '-';
    res_track.PARTIAL_WEEK_REASON = '-';
//  alert(JSON.stringify(res_track))
}
function openProjectDetailsForDay(pid,day){
    selectedDay = day;
    openProjectDetails(pid);
}
function openProjectDetails(pid){
    console.log(selectedDay+' td clicked '+pid);
    localStorage.timecardData = JSON.stringify(response);
    localStorage.trackChanges = JSON.stringify(res_track);
    localStorage.selectedProjectIndex = pid;
    //  alert(JSON.stringify(localStorage.trackChanges));            
    localStorage.selectedDay = selectedDay;
    document.location = "newproject.html";
}
function isTimecardChanged(){
    var isChanged = false;
    if(localStorage.initfromts != 'false'){
        for(var i=0;i<projects.length;i++){
            var obj = makeSeperateDetailIds(projects[i]);
            var comment = $("#comments").val().replace(/"/g, "");
            var cmtVal = tcComment.replace(/"/g, "");
            if(comment == cmtVal)// || (comment.trim().length == 0))
                comment = '-';
            //   comment = comment.replace(/'/g, "\\\'").replace(/"/g, "\\\"");
            // comment = escape(comment);//encodeURIComponent(comment);
            var partialweek = res_track.PARTIAL_WEEK_REASON;
            if((obj.ATTR_STATE == 1)|| (comment != '-' || partialweek != '-') ||((obj.DAY1_CHANGED == 1)||(obj.DAY2_CHANGED == 1)||(obj.DAY3_CHANGED == 1)||(obj.DAY4_CHANGED == 1)||(obj.DAY5_CHANGED == 1)||(obj.DAY6_CHANGED == 1)||(obj.DAY7_CHANGED == 1))){
                isChanged = true;
                break;
            }
        }
    }
    return isChanged;
}
function backAction(){

    if((localStorage.editable != 'false')&& isTimecardChanged()){
        $("#confirm_msg").text("Save timecard changes?");
        $("#confirmdialog").popup('open');
    }else{
        localStorage.timecardData = undefined;
        localStorage.deleterowids = '';
        localStorage.timecardSubmitted = 0;
        if(localStorage.initfromts == 'false'){
            localStorage.initfromts = true;
            document.location = 'approvals.html';
        }else{
            document.location = 'timesheet.html';
        }
    }
//history.back();
}
function goHome(){
    if((localStorage.editable != 'false')&& isTimecardChanged()){
        $("#confirm_msg").text("Save timecard changes?");
        $("#confirmdialog").popup('open');
    }else{
        localStorage.timecardData = undefined;
        localStorage.deleterowids = '';
        localStorage.timecardSubmitted = 0;
        document.location = "menu.html";
    }
}
function actionsheetOpened(){
    if(localStorage.editable != 'false'){
        $("#submit_action_button").show();
        if(isTimecardChanged()){
            $("#submit_action_button").hide();
        }
    }
}

function upDateTimeCard(mode){
    //   alert("save");
    //    console.log(response.types);
    mode_update = mode;
    var hash = getHash();
    var json = JSON.parse('{"mode":"'+mode+'","meal":"N","hash":"'+hash+'","data":[]}');
    var isMealType = false;
    // var data = makeSeperateAttrIds('{"response":"success","data":"'+JSON.stringify(projects)+'"}');
    console.log(JSON.string)
    for(var n=0;n<response.types.length;n++){
        var typeObj = response.types[n];
        if(typeObj.ELEMENTID == "9526" || typeObj.ALIAS_VALUE_NAME == "NO MEAL/REST"){
            isMealType = true;
            json.meal = "Y";
            break;
        }
    }
    for(var i=0;i<projects.length;i++){
        var obj = makeSeperateDetailIds(projects[i]);
        var track_obj = makeSeperateDetailIds(project_track[i]);
        //        (obj.BILLABLE_FLAG == undefined || obj.BILLABLE_FLAG == '')?(obj.BILLABLE_FLAG = 'N'):obj.AMPM;
        //        (track_obj.BILLABLE_FLAG == '')?(track_obj.BILLABLE_FLAG = 'N'):track_obj.AMPM;
        (obj.AMPM == undefined || obj.AMPM == '')?(obj.AMPM = '-'):obj.AMPM;
        console.log(obj.AMPM);
        (obj.JOB_FUNCTION == undefined)?(obj.JOB_FUNCTION = '-'):obj.JOB_FUNCTION;
        (obj.SHIFT == undefined)?(obj.SHIFT = '-'):obj.SHIFT;
        (obj.CLIENT_CODE == undefined)?(obj.CLIENT_CODE = '-'):obj.CLIENT_CODE;
        //   track_obj.AMPM = obj.AMPM;
        //        track_obj.JOB_FUNCTION = obj.JOB_FUNCTION;
        //        track_obj.SHIFT = obj.SHIFT;
        //        track_obj.CLIENT_CODE = obj.CLIENT_CODE;

        if(obj.ATTR_STATE == 1){
            //   alert("create : "+json.data.length);
            for(var j=0;j<7;j++){
                var attrJson = '';
               
                switch(j){
                    case 0:
                        if(obj.DAY1_CHANGED == 1){
                            if(track_obj.DAY1 == '-')
                                track_obj.DAY1 = 0;
                            attrJson = JSON.parse('{"P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","H": "'+track_obj.DAY1+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SAT"}');
                            json.data[json.data.length] = attrJson;
                        }
                        break;
                    case 1:
                        if(obj.DAY2_CHANGED == 1){
                            if(track_obj.DAY2 == '-')
                                track_obj.DAY2 = 0;
                            attrJson = JSON.parse('{"P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","H": "'+track_obj.DAY2+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SUN"}');
                            json.data[json.data.length] = attrJson;
                        }
                        break;
                    case 2:
                        if(obj.DAY3_CHANGED == 1){
                            if(track_obj.DAY3 == '-')
                                track_obj.DAY3 = 0;
                            attrJson = JSON.parse('{"P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","H": "'+track_obj.DAY3+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"MON"}');
                            json.data[json.data.length] = attrJson;
                        }
                        break;
                    case 3:
                        if(obj.DAY4_CHANGED == 1){
                            if(track_obj.DAY4 == '-')
                                track_obj.DAY4 = 0;
                            attrJson = JSON.parse('{"P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","H": "'+track_obj.DAY4+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"TUE"}');
                            json.data[json.data.length] = attrJson;
                        }
                        break;
                    case 4:
                        if(obj.DAY5_CHANGED == 1){
                            if(track_obj.DAY5 == '-')
                                track_obj.DAY5 = 0;
                            attrJson = JSON.parse('{"P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","H": "'+track_obj.DAY5+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"WED"}');
                            json.data[json.data.length] = attrJson;
                        }
                        break;
                    case 5:
                        if(obj.DAY6_CHANGED == 1){
                            if(track_obj.DAY6 == '-')
                                track_obj.DAY6 = 0;
                            attrJson = JSON.parse('{"P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","H": "'+track_obj.DAY6+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"THU"}');
                            json.data[json.data.length] = attrJson;
                        }
                        break;
                    case 6:
                        if(obj.DAY7_CHANGED == 1){
                            if(track_obj.DAY7 == '-')
                                track_obj.DAY7 = 0;
                            attrJson = JSON.parse('{"P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","H": "'+track_obj.DAY7+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"FRI"}');
                            json.data[json.data.length] = attrJson;
                        }
                        break;
                    default:
                        break;
                }
                
            }
        }else{
            //   alert("update");
            //atteChanged is used to identify whether any attribute changed.
            var attrChanged = ((track_obj.PROJECT_NUMBER != '-') || (track_obj.TASK_NUMBER != '-') || (track_obj.BILLABLE_FLAG != '-') || (track_obj.AMPM != '-') || (track_obj.LINE_TYPE != '-') || (track_obj.JOB_FUNCTION != '-') || (track_obj.SHIFT != '-') || (track_obj.CLIENT_CODE != '-'))?true:false;
            
            for(var k=0;k<7;k++){
                var updateattrJson = '';
                var idObj = "";
                switch(k){
                    case 0:
                        //if(obj.DAY1_CHANGED == 1){/*Cahnged on 18-Dec to send all details even if hours modified. This change made for everyday upto case 6 below*/
                            if(obj.DAY1_CHANGED == 1 && (obj.DAY1_DETAIL_ID == 0|| obj.DAY1_DETAIL_ID == undefined)){//Create
                                updateattrJson = JSON.parse('{"P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","H": "'+obj.DAY1+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SAT"}');
                                json.data[json.data.length] = updateattrJson;
                            }else if(obj.DAY1_ATTR_ID != 0&& obj.DAY1_ATTR_ID != undefined){//(track_obj.DAY1 != '-' || (obj.DAY1_ATTR_ID != 0&& obj.DAY1_ATTR_ID != undefined && attrChanged)){//Update
                                //updateattrJson = JSON.parse('{"DID": "'+track_obj.DAY1_DETAIL_ID+'","H": "'+track_obj.DAY1+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SAT"}');
                                /*Cahnged on 18-Dec to send all details even if hours modified. This change made for everyday upto case 6 below*/
                                idObj = makeIdSeparate(obj.DAY1_ATTR_ID);
                                updateattrJson = JSON.parse('{"DID": "'+obj.DAY1_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY1+'","P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SAT"}');
                                json.data[json.data.length] = updateattrJson;
                            }
                            
                        //}
                        break;
                    case 1:
                        //if(obj.DAY2_CHANGED == 1){
                            if(obj.DAY2_CHANGED == 1 && (obj.DAY2_DETAIL_ID == 0|| obj.DAY2_DETAIL_ID == undefined)){//Create
                                updateattrJson = JSON.parse('{"P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","H": "'+obj.DAY2+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SUN"}');
                                json.data[json.data.length] = updateattrJson;
                            }else if(obj.DAY2_ATTR_ID != 0&& obj.DAY2_ATTR_ID != undefined){//(track_obj.DAY2 != '-' || (obj.DAY2_ATTR_ID != 0&& obj.DAY3_ATTR_ID != undefined && attrChanged)){
                                //updateattrJson = JSON.parse('{"DID": "'+track_obj.DAY2_DETAIL_ID+'","H": "'+track_obj.DAY2+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SUN"}');
                                idObj = makeIdSeparate(obj.DAY2_ATTR_ID);
                                updateattrJson = JSON.parse('{"DID": "'+obj.DAY2_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY2+'","P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SUN"}');
                                json.data[json.data.length] = updateattrJson;
                            }
                        //}
                        break;
                    case 2:
                        //if(obj.DAY3_CHANGED == 1){
                            if(obj.DAY3_CHANGED == 1 && (obj.DAY3_DETAIL_ID == 0|| obj.DAY3_DETAIL_ID == undefined)){//Create
                                updateattrJson = JSON.parse('{"P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","H": "'+obj.DAY3+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"MON"}');
                                json.data[json.data.length] = updateattrJson;
                            }else if(obj.DAY3_ATTR_ID != 0&& obj.DAY3_ATTR_ID != undefined){//(track_obj.DAY3 != '-' || (obj.DAY3_ATTR_ID != 0&& obj.DAY3_ATTR_ID != undefined && attrChanged)){
                                //updateattrJson = JSON.parse('{"DID": "'+track_obj.DAY3_DETAIL_ID+'","H": "'+track_obj.DAY3+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"MON"}');
                                idObj = makeIdSeparate(obj.DAY3_ATTR_ID);
                                updateattrJson = JSON.parse('{"DID": "'+obj.DAY3_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY3+'","P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"MON"}');
                                json.data[json.data.length] = updateattrJson;
                            }
                        //}
                        break;
                    case 3:
                        //if(obj.DAY4_CHANGED == 1){
                            if(obj.DAY4_CHANGED == 1 && (obj.DAY4_DETAIL_ID == 0|| obj.DAY4_DETAIL_ID == undefined)){//Create
                                updateattrJson = JSON.parse('{"P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","H": "'+obj.DAY4+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"TUE"}');
                                json.data[json.data.length] = updateattrJson;
                            }else if(obj.DAY4_ATTR_ID != 0&& obj.DAY4_ATTR_ID != undefined){//(track_obj.DAY4 != '-' || (obj.DAY4_ATTR_ID != 0&& obj.DAY4_ATTR_ID != undefined && attrChanged)){
                                //updateattrJson = JSON.parse('{"DID": "'+track_obj.DAY4_DETAIL_ID+'","H": "'+track_obj.DAY4+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"TUE"}');
                                idObj = makeIdSeparate(obj.DAY4_ATTR_ID);
                                updateattrJson = JSON.parse('{"DID": "'+obj.DAY4_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY4+'","P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"TUE"}');
                                json.data[json.data.length] = updateattrJson;
                            }
                        //}
                        break;
                    case 4:
                        //if(obj.DAY5_CHANGED == 1){
                            if(obj.DAY5_CHANGED == 1 && (obj.DAY5_DETAIL_ID == 0|| obj.DAY5_DETAIL_ID == undefined)){//Create
                                updateattrJson = JSON.parse('{"P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","H": "'+obj.DAY5+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"WED"}');
                                json.data[json.data.length] = updateattrJson;
                            }else if(obj.DAY5_ATTR_ID != 0&& obj.DAY5_ATTR_ID != undefined){//(track_obj.DAY5 != '-' || (obj.DAY5_ATTR_ID != 0&& obj.DAY5_ATTR_ID != undefined && attrChanged)){
                                //updateattrJson = JSON.parse('{"DID": "'+track_obj.DAY5_DETAIL_ID+'","H": "'+track_obj.DAY5+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"WED"}');
                                idObj = makeIdSeparate(obj.DAY5_ATTR_ID);
                                updateattrJson = JSON.parse('{"DID": "'+obj.DAY5_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY5+'","P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"WED"}');
                                json.data[json.data.length] = updateattrJson;
                            }
                        //}
                        break;
                    case 5:
                        //if(obj.DAY6_CHANGED == 1){
                            if(obj.DAY6_CHANGED == 1 && (obj.DAY6_DETAIL_ID == 0|| obj.DAY6_DETAIL_ID == undefined)){//Create
                                updateattrJson = JSON.parse('{"P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","H": "'+obj.DAY6+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"THU"}');
                                json.data[json.data.length] = updateattrJson;
                            }else if(obj.DAY6_ATTR_ID != 0&& obj.DAY6_ATTR_ID != undefined){//(track_obj.DAY6 != '-' || (obj.DAY6_ATTR_ID != 0&& obj.DAY6_ATTR_ID != undefined && attrChanged)){
                                //updateattrJson = JSON.parse('{"DID": "'+track_obj.DAY6_DETAIL_ID+'","H": "'+track_obj.DAY6+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"THU"}');
                                idObj = makeIdSeparate(obj.DAY6_ATTR_ID);
                                updateattrJson = JSON.parse('{"DID": "'+obj.DAY6_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY6+'","P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"THU"}');
                                json.data[json.data.length] = updateattrJson;
                            }
                        //}
                        break;
                    case 6:
                        //if(obj.DAY7_CHANGED == 1){
                            if(obj.DAY7_CHANGED == 1 && (obj.DAY7_DETAIL_ID == 0|| obj.DAY7_DETAIL_ID == undefined)){//Create
                                updateattrJson = JSON.parse('{"P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","H": "'+obj.DAY7+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"FRI"}');
                                json.data[json.data.length] = updateattrJson;
                            }else if(obj.DAY7_ATTR_ID != 0&& obj.DAY7_ATTR_ID != undefined){//(track_obj.DAY7 != '-' || (obj.DAY7_ATTR_ID != 0&& obj.DAY7_ATTR_ID != undefined && attrChanged)){
                                //updateattrJson = JSON.parse('{"DID": "'+track_obj.DAY7_DETAIL_ID+'","H": "'+track_obj.DAY7+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"FRI"}');
                                idObj = makeIdSeparate(obj.DAY7_ATTR_ID);
                                updateattrJson = JSON.parse('{"DID": "'+obj.DAY7_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY7+'","P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"FRI"}');
                                json.data[json.data.length] = updateattrJson;
                            }
                        //}
                        break;
                    default:
                        break;
                }
            }
            //atteChanged is used to identify whether any other attribute changed other than AMPM. If changed then update Mon to Thu if record exist.
            //var attrChanged = ((track_obj.PROJECT_NUMBER != '-') || (track_obj.TASK_NUMBER != '-') || (track_obj.BILLABLE_FLAG != '-') || (track_obj.LINE_TYPE != '-') || (track_obj.JOB_FUNCTION != '-') || (track_obj.SHIFT != '-') || (track_obj.CLIENT_CODE != '-'))?true:false;
/*  Changed on 18-DEC            
            if((track_obj.PROJECT_NUMBER != '-') || (track_obj.TASK_NUMBER != '-') || (track_obj.BILLABLE_FLAG != '-') || (track_obj.AMPM != '-') || (track_obj.LINE_TYPE != '-') || (track_obj.JOB_FUNCTION != '-') || (track_obj.SHIFT != '-') || (track_obj.CLIENT_CODE != '-')){
                var updateJson = '';
                var idObj = '';
                if(obj.DAY1_ATTR_ID != 0&& obj.DAY1_ATTR_ID != undefined){// && attrChanged){
                    idObj = makeIdSeparate(obj.DAY1_ATTR_ID);
                    //                    updateJson = JSON.parse('{"DID": "'+obj.DAY1_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY1+'","P":"'+track_obj.PROJECT_NUMBER+'","TK":"'+track_obj.TASK_NUMBER+'","TP":"'+track_obj.LINE_TYPE+'","B":"'+track_obj.BILLABLE_FLAG+'","AM":"'+track_obj.AMPM+'","F":"'+track_obj.JOB_FUNCTION+'","S":"'+track_obj.SHIFT+'","CC":"'+track_obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SAT"}');
                    updateJson = JSON.parse('{"DID": "'+obj.DAY1_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY1+'","P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SAT"}');
                    json.data[json.data.length] = updateJson;
                }
                if(obj.DAY2_ATTR_ID != 0&& obj.DAY2_ATTR_ID != undefined){// && attrChanged){
                    idObj = makeIdSeparate(obj.DAY2_ATTR_ID);
                    //                    updateJson = JSON.parse('{"DID": "'+obj.DAY2_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY2+'","P":"'+track_obj.PROJECT_NUMBER+'","TK":"'+track_obj.TASK_NUMBER+'","TP":"'+track_obj.LINE_TYPE+'","B":"'+track_obj.BILLABLE_FLAG+'","AM":"'+track_obj.AMPM+'","F":"'+track_obj.JOB_FUNCTION+'","S":"'+track_obj.SHIFT+'","CC":"'+track_obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SUN"}');
                    updateJson = JSON.parse('{"DID": "'+obj.DAY2_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY2+'","P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SUN"}');
                    json.data[json.data.length] = updateJson;
                }
                if(obj.DAY3_ATTR_ID != 0&& obj.DAY3_ATTR_ID != undefined){// && attrChanged){
                    idObj = makeIdSeparate(obj.DAY3_ATTR_ID);
                    //                    updateJson = JSON.parse('{"DID": "'+obj.DAY3_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY3+'","P":"'+track_obj.PROJECT_NUMBER+'","TK":"'+track_obj.TASK_NUMBER+'","TP":"'+track_obj.LINE_TYPE+'","B":"'+track_obj.BILLABLE_FLAG+'","AM":"'+track_obj.AMPM+'","F":"'+track_obj.JOB_FUNCTION+'","S":"'+track_obj.SHIFT+'","CC":"'+track_obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"MON"}');
                    updateJson = JSON.parse('{"DID": "'+obj.DAY3_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY3+'","P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"MON"}');
                    json.data[json.data.length] = updateJson;
                }
                if(obj.DAY4_ATTR_ID != 0&& obj.DAY4_ATTR_ID != undefined){// && attrChanged){
                    idObj = makeIdSeparate(obj.DAY4_ATTR_ID);
                    //                    updateJson = JSON.parse('{"DID": "'+obj.DAY4_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY4+'","P":"'+track_obj.PROJECT_NUMBER+'","TK":"'+track_obj.TASK_NUMBER+'","TP":"'+track_obj.LINE_TYPE+'","B":"'+track_obj.BILLABLE_FLAG+'","AM":"'+track_obj.AMPM+'","F":"'+track_obj.JOB_FUNCTION+'","S":"'+track_obj.SHIFT+'","CC":"'+track_obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"TUE"}');
                    updateJson = JSON.parse('{"DID": "'+obj.DAY4_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY4+'","P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"TUE"}');
                    json.data[json.data.length] = updateJson;
                }
                if(obj.DAY5_ATTR_ID != 0&& obj.DAY5_ATTR_ID != undefined){// && attrChanged){
                    idObj = makeIdSeparate(obj.DAY5_ATTR_ID);
                    //                    updateJson = JSON.parse('{"DID": "'+obj.DAY5_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY5+'","P":"'+track_obj.PROJECT_NUMBER+'","TK":"'+track_obj.TASK_NUMBER+'","TP":"'+track_obj.LINE_TYPE+'","B":"'+track_obj.BILLABLE_FLAG+'","AM":"'+track_obj.AMPM+'","F":"'+track_obj.JOB_FUNCTION+'","S":"'+track_obj.SHIFT+'","CC":"'+track_obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"WED"}');
                    updateJson = JSON.parse('{"DID": "'+obj.DAY5_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY5+'","P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"WED"}');
                    json.data[json.data.length] = updateJson;
                }
                if(obj.DAY6_ATTR_ID != 0&& obj.DAY6_ATTR_ID != undefined){// && attrChanged){
                    idObj = makeIdSeparate(obj.DAY6_ATTR_ID);
                    //                    updateJson = JSON.parse('{"DID": "'+obj.DAY6_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY6+'","P":"'+track_obj.PROJECT_NUMBER+'","TK":"'+track_obj.TASK_NUMBER+'","TP":"'+track_obj.LINE_TYPE+'","B":"'+track_obj.BILLABLE_FLAG+'","AM":"'+track_obj.AMPM+'","F":"'+track_obj.JOB_FUNCTION+'","S":"'+track_obj.SHIFT+'","CC":"'+track_obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"THU"}');
                    updateJson = JSON.parse('{"DID": "'+obj.DAY6_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY6+'","P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"THU"}');
                    json.data[json.data.length] = updateJson;
                }
                if(obj.DAY7_ATTR_ID != 0&& obj.DAY7_ATTR_ID != undefined){
                    idObj = makeIdSeparate(obj.DAY7_ATTR_ID);
                    //                    updateJson = JSON.parse('{"DID": "'+obj.DAY7_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY7+'","P":"'+track_obj.PROJECT_NUMBER+'","TK":"'+track_obj.TASK_NUMBER+'","TP":"'+track_obj.LINE_TYPE+'","B":"'+track_obj.BILLABLE_FLAG+'","AM":"'+track_obj.AMPM+'","F":"'+track_obj.JOB_FUNCTION+'","S":"'+track_obj.SHIFT+'","CC":"'+track_obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"FRI"}');
                    updateJson = JSON.parse('{"DID": "'+obj.DAY7_DETAIL_ID+'","AID": "'+idObj.id+'","AIDS": "'+idObj.ids+'","H": "'+obj.DAY7+'","P":"'+obj.PROJECT_NUMBER+'","TK":"'+obj.TASK_NUMBER+'","TP":"'+obj.LINE_TYPE+'","B":"'+obj.BILLABLE_FLAG+'","AM":"'+obj.AMPM+'","F":"'+obj.JOB_FUNCTION+'","S":"'+obj.SHIFT+'","CC":"'+obj.CLIENT_CODE+'","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"FRI"}');
                    json.data[json.data.length] = updateJson;
                }
            }*/
        }

    }  
    
    var comment = $("#comments").val().replace(/"/g, "");
    /* Commented on 17-DEC 
 if(comment == tcComment)// || (comment.trim().length == 0))
        comment = '-';*/
    //   comment = comment.replace(/'/g, "\\\'").replace(/"/g, "\\\"");
    // comment = escape(comment);//encodeURIComponent(comment);
    //    var partialweek = res_track.PARTIAL_WEEK_REASON; // Commented on 17-DEC
    var partialweek = $("#input_partial_week").val();
    if(mode == 'SUBMIT' && json.data.length == 0 && (tc_state != 'REJECTED')){
        //   alert("submit without changes");
        if(projects.length){
            var project = makeSeperateDetailIds(projects[0]);
            var submitJson = '';
            if(project.DAY1_DETAIL_ID != 0&& project.DAY1_DETAIL_ID != undefined){//Create
                submitJson = JSON.parse('{"DID": "'+project.DAY1_DETAIL_ID+'","AID": "-","P":"-","TK":"-","TP":"-","B":"-","H": "'+project.DAY1+'","AM":"-","F":"-","S":"-","CC":"-","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SAT"}');
            }else if(project.DAY2_DETAIL_ID != 0&& project.DAY2_DETAIL_ID != undefined){//Create
                submitJson = JSON.parse('{"DID": "'+project.DAY2_DETAIL_ID+'","AID": "-","P":"-","TK":"-","TP":"-","B":"-","H": "'+project.DAY2+'","AM":"-","F":"-","S":"-","CC":"-","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SUN"}');
            }else if(project.DAY3_DETAIL_ID != 0&& project.DAY3_DETAIL_ID != undefined){//Create
                submitJson = JSON.parse('{"DID": "'+project.DAY3_DETAIL_ID+'","AID": "-","P":"-","TK":"-","TP":"-","B":"-","H": "'+project.DAY3+'","AM":"-","F":"-","S":"-","CC":"-","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"MON"}');
            }else if(project.DAY4_DETAIL_ID != 0&& project.DAY4_DETAIL_ID != undefined){//Create
                submitJson = JSON.parse('{"DID": "'+project.DAY4_DETAIL_ID+'","AID": "-","P":"-","TK":"-","TP":"-","B":"-","H": "'+project.DAY4+'","AM":"-","F":"-","S":"-","CC":"-","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"TUE"}');
            }else if(project.DAY5_DETAIL_ID != 0&& project.DAY5_DETAIL_ID != undefined){//Create
                submitJson = JSON.parse('{"DID": "'+project.DAY5_DETAIL_ID+'","AID": "-","P":"-","TK":"-","TP":"-","B":"-","H": "'+project.DAY5+'","AM":"-","F":"-","S":"-","CC":"-","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"WED"}');
            }else if(project.DAY6_DETAIL_ID != 0&& project.DAY6_DETAIL_ID != undefined){//Create
                submitJson = JSON.parse('{"DID": "'+project.DAY6_DETAIL_ID+'","AID": "-","P":"-","TK":"-","TP":"-","B":"-","H": "'+project.DAY6+'","AM":"-","F":"-","S":"-","CC":"-","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"THU"}');
            }else if(project.DAY7_DETAIL_ID != 0&& project.DAY7_DETAIL_ID != undefined){//Create
                submitJson = JSON.parse('{"DID": "'+project.DAY7_DETAIL_ID+'","AID": "-","P":"-","TK":"-","TP":"-","B":"-","H": "'+project.DAY7+'","AM":"-","F":"-","S":"-","CC":"-","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"FRI"}');
            }
            json.data[json.data.length] = submitJson;
        }
    }        
    
    
    
    if((comment != '-' || partialweek != '-')  && json.data.length == 0 && (comment != tcComment || res_track.PARTIAL_WEEK_REASON != '-')){
        //   alert("submit without changes");
        if(projects.length){
            var project = makeSeperateDetailIds(projects[0]);
            var submitJson = '';
            if(project.DAY1_DETAIL_ID != 0&& project.DAY1_DETAIL_ID != undefined){//Create
                submitJson = JSON.parse('{"DID": "'+project.DAY1_DETAIL_ID+'","AID": "-","P":"-","TK":"-","TP":"-","B":"-","H": "-","AM":"-","F":"-","S":"-","CC":"-","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SAT"}');
            }else if(project.DAY2_DETAIL_ID != 0&& project.DAY2_DETAIL_ID != undefined){//Create
                submitJson = JSON.parse('{"DID": "'+project.DAY2_DETAIL_ID+'","AID": "-","P":"-","TK":"-","TP":"-","B":"-","H": "-","AM":"-","F":"-","S":"-","CC":"-","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"SUN"}');
            }else if(project.DAY3_DETAIL_ID != 0&& project.DAY3_DETAIL_ID != undefined){//Create
                submitJson = JSON.parse('{"DID": "'+project.DAY3_DETAIL_ID+'","AID": "-","P":"-","TK":"-","TP":"-","B":"-","H": "-","AM":"-","F":"-","S":"-","CC":"-","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"MON"}');
            }else if(project.DAY4_DETAIL_ID != 0&& project.DAY4_DETAIL_ID != undefined){//Create
                submitJson = JSON.parse('{"DID": "'+project.DAY4_DETAIL_ID+'","AID": "-","P":"-","TK":"-","TP":"-","B":"-","H": "-","AM":"-","F":"-","S":"-","CC":"-","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"TUE"}');
            }else if(project.DAY5_DETAIL_ID != 0&& project.DAY5_DETAIL_ID != undefined){//Create
                submitJson = JSON.parse('{"DID": "'+project.DAY5_DETAIL_ID+'","AID": "-","P":"-","TK":"-","TP":"-","B":"-","H": "-","AM":"-","F":"-","S":"-","CC":"-","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"WED"}');
            }else if(project.DAY6_DETAIL_ID != 0&& project.DAY6_DETAIL_ID != undefined){//Create
                submitJson = JSON.parse('{"DID": "'+project.DAY6_DETAIL_ID+'","AID": "-","P":"-","TK":"-","TP":"-","B":"-","H": "-","AM":"-","F":"-","S":"-","CC":"-","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"THU"}');
            }else if(project.DAY7_DETAIL_ID != 0&& project.DAY7_DETAIL_ID != undefined){//Create
                submitJson = JSON.parse('{"DID": "'+project.DAY7_DETAIL_ID+'","AID": "-","P":"-","TK":"-","TP":"-","B":"-","H": "-","AM":"-","F":"-","S":"-","CC":"-","OVN":"'+localStorage.timesheetovn+'","ID":"'+localStorage.timesheetid+'","DY":"FRI"}');
            }
            json.data[json.data.length] = submitJson;
        }
    }        
    

    if(localStorage.deleterowids.length){
        var restoreJson = JSON.parse(localStorage.deleterowids);
        for(var c = 0; c<restoreJson.data.length; c++){
            json.data[json.data.length] = JSON.parse('{"DID": "'+restoreJson.data[c]+'","delete": "Y"}');
        }
    }

    json.resource_id = userId;
    json.stop_date = localStorage.tsenddate;
    json.comment_text = comment;
    json.pwr = partialweek;
    
    if(mode == 'SUBMIT' && isMealType){
        showCertificate(json);
    }else{
        completeUpdateProcess(json);
    }
}
function openMealBreakPolicy(){
    if(isMobile.Android()){
        Android.openUsefulInfo('mbrst');
    }else if(isMobile.iOS()){
        window.location = BASE_DELI_MITER+'openinfo'+DELI_MITER+'mbrst';
    }
}
function showCertificate(json){
    jsonToUpdate = json;
    //    $("#certify_msg").text("I am familiar with Jacobs Time keeping policy and understand that I must promptly and accurately include all my hours of work in Jacobs weekly timesheet.");
    $("#certificatedialog").popup('open');
    $("#agree").click(function(){
        $("#disagree").attr("href","agree");
    //completeUpdateProcess(json);
    });
}
function completeUpdateProcess(json){
    if(json.data.length){    
        var url = baseURL;
        $("#loading_screen").show(1,scrollDownPage);
        if(localStorage.timesheetid.length == 0){
            //   alert('create_timecard');
            url = url+'CreateTimeCard_4'; 
            //            json.resource_id = userId;
            //            json.stop_date = localStorage.tsenddate;
            //            json.comment_text = (comment == '-')?'':comment;
            json.comment_text = (json.comment_text == '-')?'':json.comment_text;
            //            json.pwr = partialweek;
            var params = JSON.stringify(json);
            console.log(params);
            if(isMobile.iOS()){
                window.location = BASE_DELI_MITER+'ctc_request'+DELI_MITER+params;
            }else if(isMobile.Android()){
                Android.create(params,localStorage.currentURL);
            }else{
                $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: 'jsonp',
                    data:'ctc_request='+params,
                    timeout: 30000,
                    async: false,
                    contentType: "application/json; charset=utf-8",
                    success: function (data, textStatus, xhr) {
                        //  alert(data);
                        //backAction();
                        timecardCreated(data);
                    },
                    error: function (request, status, error) {
                        $("#loading_screen").hide();
                        alert(error);
                    }
     
                });
            }
        }
        else{
                        
            url = url+'UpdateTimeCard_4'; 
            //            json.resource_id = userId;
            //            json.stop_date = localStorage.tsenddate;
            //            json.comment_text = comment;
            //            json.pwr = partialweek;
            var params = JSON.stringify(json);
            console.log(params);
            //                    alert(params);
            if(isMobile.iOS()){
                window.location = BASE_DELI_MITER+'updatetimecardrequest'+DELI_MITER+params;
            }else if(isMobile.Android()){
                Android.update(params,localStorage.currentURL);
            }else{
                $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: 'jsonp',//'application/json',
                    data:{
                        updatetimecardrequest:params
                    },
                    timeout: 30000,
                    async: false,
                    //contentType: "application/json",
                    success: function (data, textStatus, xhr) {
                        //  alert(data);
                        //backAction();
                        timecardUpdated(data);
                    },
                    error: function (request, status, error) {
                        $("#loading_screen").hide();
                        alert(error);
                    }
     
                });
            }
        }
    }else{
        alert("You cannot save/submit an unchanged timecard");
    }
}
function escape (val) {
    if (typeof(val)!="string") return val;
    return val
    .replace(/[\\]/g, '\\\\')
    .replace(/[\/]/g, '\\/')
    .replace(/[\b]/g, '\\b')
    .replace(/[\f]/g, '\\f')
    .replace(/[\n]/g, '\\n')
    .replace(/[\r]/g, '\\r')
    .replace(/[\t]/g, '\\t')
    .replace(/[\"]/g, '\\"')
    .replace(/\\'/g, "\\'");
}

function makeZeroHours(data){
    //   alert("????? - "+data);
    var responsedata = JSON.parse(data);//jQuery.parseJSON(myObject);
    if(responsedata.response == 'success'){
        for(var i=0;i<responsedata.data.length;i++){
            responsedata.data[i].ATTR_STATE = 1;
            responsedata.data[i].DAY1 = 0;
            responsedata.data[i].DAY2 = 0;
            responsedata.data[i].DAY3 = 0;
            responsedata.data[i].DAY4 = 0;
            responsedata.data[i].DAY5 = 0;
            responsedata.data[i].DAY6 = 0;
            responsedata.data[i].DAY7 = 0;
            responsedata.data[i].TIMECARD_COMMENT = '';
            if(newHireDays<1)
                responsedata.data[i].DAY1_CHANGED = 1;
        //       responsedata.data[i].AMPM = '';
        }
    }
    return responsedata;
}

function makeIdSeparate(id){
    var attrids = id.split(',');
    var singleId = attrids[0];
    return JSON.parse('{"id":"'+singleId+'","ids":"'+attrids+'"}');
}
function makeSeperateDetailIds(obj){
    //    console.log("SEPARATE: "+obj.ATTR_STATE+'-------------'+JSON.stringify(obj));
    if(((obj.ATTR_STATE != 'undefined')||(obj.ATTR_STATE != undefined))&&(obj.ATTR_STATE != 1)){
        
        var idArr = obj.DAY1_DETAIL_ID.split(',');
        if(idArr.length > 1){
            obj.DAY1_DETAIL_ID = idArr[0];
        }
        idArr = obj.DAY2_DETAIL_ID.split(',');
        if(idArr.length > 1){
            obj.DAY2_DETAIL_ID = idArr[0];
        }
        idArr = obj.DAY3_DETAIL_ID.split(',');
        
        if(idArr.length > 1){
            obj.DAY3_DETAIL_ID = idArr[0];
        }
        idArr = obj.DAY4_DETAIL_ID.split(',');
        if(idArr.length > 1){
            obj.DAY4_DETAIL_ID = idArr[0];
        }
        idArr = obj.DAY5_DETAIL_ID.split(',');
        if(idArr.length > 1){
            obj.DAY5_DETAIL_ID = idArr[0];
        }
        idArr = obj.DAY6_DETAIL_ID.split(',');
        if(idArr.length > 1){
            obj.DAY6_DETAIL_ID = idArr[0];
        }
        idArr = obj.DAY7_DETAIL_ID.split(',');
        if(idArr.length > 1){
            obj.DAY7_DETAIL_ID = idArr[0];
        }
    }
    //    console.log("AFTER SEPARATE: "+JSON.stringify(obj));
    return obj;
}


// CALLBACK FOR TIMECARD CREATION
function timecardCreated(data){
    if (data.length){
        data = urldecode(data).replace(/\u000f/g, "\n");
        console.log("-----0000----"+data);
        var res = JSON.parse(data);//jQuery.parseJSON(myObject);
        $("#loading_screen").hide();          
        if(res.response.toLowerCase() == 'success'){
            localStorage.timesheetid = res.data.timecard_id;
            localStorage.timesheetovn = res.data.timecard_ovn;
            localStorage.tsenddate = res.data.stop_date;
            //  alert(localStorage.timesheetovn);
            if(res.data.result.trim().length){
                //   alert(res.data.result);
                var err = res.data.result;
                $("#dialoglink").attr('href', '');
                if(err.indexOf('<html>') >= 0){
                    // err.replace('<html>', '');
                    $("#error_msg").html(err);
                    $("#canceldialog").popup('open');
                }
                else{
                    alert(res.data.result);
                }
            }
            else{

                if(mode_update == 'SUBMIT'){
                    $("#dialoglink").attr('href', 'timesheetdata.html');
                    if(res.data.updatestatus == 'Updated timecard successfully'){
                        res.data.updatestatus = 'Submitted timecard successfully';
                    }
                    //  localStorage.timecardData = undefined;
                    localStorage.deleterowids = '';
                    localStorage.editable=false;
                }else{
                    localStorage.timecardSubmitted = 0;
                    $("#dialoglink").attr('href', 'timesheetdata.html');
                    //  document.location = 'timesheetdata.html';
                    //Below two lines of code would be outside else block but to fix the issue: not getting data for submitted TC this hack used
                    localStorage.timecardData = undefined;
                    localStorage.deleterowids = '';
                }
                alert(res.data.updatestatus);
            }
        }else{
            alert(res.data.status);
        }
    }else{
        localStorage.timecardData = undefined;
        $("#dialoglink").attr('href', 'timesheetdata.html');
        alert('Unknown error occured');
    }
}

// CALLBACK FOR UPDATE TIMECARD
function timecardUpdated(data){
    if (data.length){
        data = urldecode(data).replace(/\u000f/g, "");
        console.log("-----0000----"+data);
        var res = JSON.parse(data);//jQuery.parseJSON(myObject);
        $("#loading_screen").hide();          
        if(res.response == 'success'){
            
            if(res.data.result.trim().length){
                var err = res.data.result;
                $("#dialoglink").attr('href', '');
                if(err.indexOf('<html>') >= 0){
                    // err.replace('<html>', '');
                    $("#error_msg").html(err);
                    $("#canceldialog").popup('open');
                }
                else{
                    alert(res.data.result);
                }
            // $("#error_msg").html("<p><b>Recording less than 40 hours as an exempt/salaried employee is only allowed under very specific conditions.</b></p><p>To submit your timesheet with less than 40 hours, you must select an appropriate reason from the list available in the time entry screen.<br><p>* I requested, received approval for and took a full day off (without pay) for personal purposes, such as vacation, sickness, or disability <br> * I am currently on intermittent leave or unpaid leave as provided by the Family and Medical Leave Act.<br>* This is my first or final week of employment with the company.<br>* I was suspended for a full day or more for disciplinary purposes or violation of safety rules of major significance <p> If none of the conditions stated above exist, please return to your timesheet and make the necessary corrections so that your total hours reported for the week equal 40");
            // $("#error_msg").html("<p><b>Recording less than 40 hours as an exempt/salaried employee is only allowed under very specific conditions.</b></p> <p>To submit your timesheet with less than 40 hours, you must select an appropriate reason from the list available in the time entry screen.</p><br><p>* I requested, received approval for and took a full day off (without pay) for personal purposes, such as vacation, sickness, or disability <br> * I am currently on intermittent leave or unpaid leave as provided by the Family and Medical Leave Act.<br>* This is my first or final week of employment with the company.<br>* I was suspended for a full day or more for disciplinary purposes or violation of safety rules of major significance</p><p> If none of the conditions stated above exist, please return to your timesheet and make the necessary corrections so that your total hours reported for the week equal 40</p>");
                
            }else{
                if(mode_update == 'SUBMIT'){
                    $("#dialoglink").attr('href', 'timesheetdata.html');
                    if(res.data.status == 'Updated timecard successfully'){
                        res.data.status = 'Submitted timecard successfully';
                    }
                    //  localStorage.timecardData = undefined;
                    localStorage.deleterowids = '';
                    localStorage.editable=false;
                }else{
                    localStorage.timecardSubmitted = 0;
                    $("#dialoglink").attr('href', 'timesheetdata.html');
                    //  document.location = 'timesheetdata.html';
                    //Below two lines of code would be outside else block but to fix the issue: not getting data for submitted TC this hack used
                    localStorage.timecardData = undefined;
                    localStorage.deleterowids = '';
                }
                alert(res.data.status)
            }

        
        }else{
            alert(res.data.status);
        }
    }else{
        localStorage.timecardData = undefined;
        localStorage.deleterowids = '';
        $("#dialoglink").attr('href', 'timesheetdata.html');
        alert('Unknown error occured');
    }
}


// APPROVE/REJECT ACTION
function performAction(action){
    var comments = $("#comments").val().replace(/"/g, "");
    //    if(comments.length || (action == 'Approved')){
    var hash = getHash();
    var json = JSON.parse('{"action":"'+action+'","comment":"'+encodeURIComponent(comments)+'","hash":"'+hash+'","data":[]}');
    json.comment = comments;
    var attrJson = JSON.parse('{"resource_id": "'+userId+'","approver_id": "'+localStorage.userid+'","startdate": "'+localStorage.tsstartdate+'","enddate":"'+localStorage.tsenddate+'"}');
    json.data[json.data.length] = attrJson;

   
    if(json.data.length){
   
        var url = baseURL+'ApproveTimeCards'; 
        $("#loading_screen").show(1,scrollDownPage);
        var params = JSON.stringify(json);
        console.log(params);
        if(isMobile.iOS()){
            //  window.location = '@@@@approvetimecardrequest&&&'+params;
            window.location = BASE_DELI_MITER+'approvetimecardrequest'+DELI_MITER+params;
        }
        else{
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'jsonp',
                data:'approvetimecardrequest='+encodeURIComponent(params),
                timeout: 30000,
                async: false,
                contentType: "application/json; charset=utf-8",
                success: function (data, textStatus, xhr) {
                    //     alert(data);
                    timecardApproved(data);
                },
                error: function (request, status, error) {
                    $("#loading_screen").hide();
                    alert(error);
                }
     
            });
        }
    }
/*    }else{
        alert('Comments Missing');
    }*/
}

// CALL BACK FOR APPROVE/REJECT TIMECARD
function timecardApproved(data){
    var res = JSON.parse(data);//jQuery.parseJSON(myObject);
    $("#loading_screen").hide();  
    //   alert(res.data.status);
    if(res.response == 'success'){
        alert(res.data.status);
        //document.location = 'approvals.html';
        localStorage.timecardData = undefined;
        $("#dialoglink").attr('href', 'approvals.html');
    }else{
        alert(res.data.status);
    }
}
// APPROVE ACTION
function actionMenuApprove(){
    performAction('Approved');
}
// REJECT ACTION
function actionMenuReject(){
    performAction('Rejected');
}

