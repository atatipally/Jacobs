/* ****************** AMPM BUILD (updating AMPM for all days)*****************
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var obj;    //SELECTED LINE ITEM(JSON OBJECT FOR LINE ITEM)
var selectedDay;
var selectedProjectIndex;
var tsdata;
var track_tsdata;
var track_obj;
Date.daysBetween = function( date1, date2 ) {
    //Get 1 day in milliseconds
    var one_day=1000*60*60*24;
    
    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();
    
    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;
    console.log("-------+++++++"+date1+"======"+date2);
    // Convert back to days and return
    return Math.round(difference_ms/one_day);
}
$(document).ready(function(){
    var userId = localStorage.userid;
    $("#user_name").text(localStorage.username);
    /*TYPES LOGIC*/
    //localStorage.type_values = '[{"ELEMENTID": "367","ALIAS_VALUE_NAME": "PTO"},{"ELEMENTID": "67","ALIAS_VALUE_NAME": "REGULAR"},{"ELEMENTID": "68","ALIAS_VALUE_NAME": "OVERTIME"},{"ELEMENTID": "72","ALIAS_VALUE_NAME": "HOLIDAY"}]';
    var types = JSON.parse(localStorage.type_values);
    var typeOptions = '';
    for(var i=0;i<types.length;i++){
        var n=types[i].ALIAS_VALUE_NAME.indexOf("REGULAR");
        var selected = (n==0)?'selected':'';
        typeOptions += '<option value="'+types[i].ELEMENTID+'" '+selected+'>'+types[i].ALIAS_VALUE_NAME+'</option>';
    }
    $("#input_type").html(typeOptions).selectmenu('refresh');
/****************************/    
    if(localStorage.editable == 'false'){
        //DISABLING ALL ELEMENTS
        $("#input_hours").attr('readonly', true).addClass("disabled_text");
        $("#input_ampm").attr('disabled', true).addClass("disabled_text");
        $("#input_project").attr('readonly', true).addClass("disabled_text");
        $("#input_task").attr('readonly', true).addClass("disabled_text");
        $("#input_func").attr('readonly', true).addClass("disabled_text");
        $("#input_shift").attr('readonly', true).addClass("disabled_text");
        $("#input_client").attr('readonly', true).addClass("disabled_text");  
        $("#input_type").attr('disabled', true).addClass("disabled_text");
        //     $("#input_type").addClass("disabled_text");
        $("#input_billable").attr('disabled', true).addClass("disabled_text");
        //     $("#input_billable").addClass("disabled_text");
        $(".ui-select .ui-btn").addClass("remove_arrow");
                    
        $("#save_button").hide();
        $("#delete_button").hide();
    }
    
    selectedDay = localStorage.selectedDay;
    
/*    if(selectedDay != 6){
        $("#ampm").hide();
    }*/
    selectedProjectIndex = localStorage.selectedProjectIndex;
    tsdata = JSON.parse(localStorage.timecardData);//jQuery.parseJSON(localStorage.timecardData);
    //   alert(localStorage.trackChanges);
    track_tsdata = JSON.parse(localStorage.trackChanges);
    var startDate = localStorage.tsstartdate;
    
    if (selectedProjectIndex >= 0){ //CONDITION TO CHECK NEW LINE ITEM OR EDIT EXISTING LINE
        $("#header_title").text('Edit Time Entry');
        obj = tsdata.data[selectedProjectIndex];//jQuery.parseJSON(localStorage.selectedProject);
        track_obj = track_tsdata.data[selectedProjectIndex];        
        var project = obj.PROJECT_NUMBER;
        var ampm = obj.AMPM;
        var task = obj.TASK_NUMBER;
        try{
          task = decodeURIComponent(obj.TASK_NUMBER);
        }catch(e){
          task = obj.TASK_NUMBER;
        }
        task = task.replace(/%20/g, " ");
        var type = obj.LINE_TYPE;
        var billable = (obj.BILLABLE_FLAG == 'B')?'Y':obj.BILLABLE_FLAG;
        var hours = getHours();
        var func = (obj.JOB_FUNCTION=='-')?'':obj.JOB_FUNCTION;
        var shift = (obj.SHIFT=='-')?'':obj.SHIFT;
        var client = (obj.CLIENT_CODE=='-')?'':obj.CLIENT_CODE;
        try{
            client = decodeURIComponent(client);
        }catch(e){
            client = client;
        }
        client = client.replace(/%20/g, " ");
        //   alert(billable);
        $("#input_hours").val(hours);
        $("#input_ampm").val(ampm).selectmenu('refresh');
        $("#input_project").val(project);
        $("#input_task").val(task);
        $("#input_type").val(type).selectmenu('refresh');
        //     (billable == 'Y' || billable == 'B')?$("#BNcheckmark").toggleClass("check_mark_off check_mark_on"):'';
        $("#input_billable").val(billable).selectmenu('refresh');
        $("#input_func").val(func);
        $("#input_shift").val(shift);
        $("#input_client").val(client);
    //      $("#BNcheckmark").val(billable);
    }else{  
        $("#header_title").text('Add Time Entry');
        selectedProjectIndex = tsdata.data.length;
        var day = parseInt(selectedDay,10)+1;
        // CREATING A JSON OBJECT FOR NEW LINE.  FOR THIS ATTR_STATE VALUE IS 1
        var json = '{"TASK_NUMBER":"-","BILLABLE_FLAG":"-","PROJECT_NUMBER":"-","TC_BB_OVN": "'+localStorage.timesheetovn+'","LINE_TYPE": "-","AMPM": "-","TC_BB_ID": "'+localStorage.timesheetid+'","JOB_FUNCTION": "-","SHIFT": "-","CLIENT_CODE": "-","DAY1": 0,"DAY2": 0,"DAY3": 0,"DAY4": 0,"DAY5": 0,"DAY6": 0,"DAY7": 0,"ATTR_STATE": 1,"DAY'+day+'_CHANGED": 1,"PARTIAL_WEEK_REASON":""}';
        var track_json = '{"TASK_NUMBER":"-","BILLABLE_FLAG":"-","PROJECT_NUMBER":"-","TC_BB_OVN": "'+localStorage.timesheetovn+'","LINE_TYPE": "-","AMPM": "-","TC_BB_ID": "'+localStorage.timesheetid+'","JOB_FUNCTION": "-","SHIFT": "-","CLIENT_CODE": "-","DAY1": "-","DAY2": "-","DAY3": "-","DAY4": "-","DAY5": "-","DAY6": "-","DAY7": "-","ATTR_STATE": 1,"DAY'+day+'_CHANGED": 1,"PARTIAL_WEEK_REASON":"-"}';
        // alert(json);
        obj = JSON.parse(json);
        track_obj = JSON.parse(track_json);
        $("#delete_button").hide();
    }

    $("table tr td input").live('focus', function() {
        $(this).val($(this).val());
        if(parseInt($(this).val(),10) == 0){
            $(this).val('');
        }
    // $(this).select();
    });
    var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    var endDate = localStorage.tsenddate;//18-OCT-2013
    var endArr = endDate.split('/');
    if(localStorage.timesheetid.length == 0){
                  endDate = endArr[2]+'-'+months[parseInt(endArr[1],10)-1]+'-'+endArr[0]; //2013/11/01
    }
    endArr = endDate.split('-');
    endDate = new Date(endArr[2],months.indexOf(endArr[1]),endArr[0]);
    if(localStorage.initfromts == 'false'){
    //04-Aug-2012
        var date = startDate.split("-");
        var dt = date[0];
        var m = date[1];
        var mon = months.indexOf(m.toUpperCase(), 0);
        var dateObj = new Date(date[2],mon,dt);
        var diffBwStartEND = Date.daysBetween(dateObj, endDate);
        if(diffBwStartEND < 6){
            dateObj.setDate(endDate.getDate()-6);
        }
        dateObj.setDate(dateObj.getDate()+parseInt(selectedDay,10));
        var date = dateObj.getDate()+'-'+months[dateObj.getMonth()]+'-'+dateObj.getFullYear(); //7+parseInt(selectedDay);

        $("#input_date").val(date).attr('readonly', true);
    }else{
        //new Date('2011-04-11') // 2012-12-08 00:00:00
        var dt = startDate.split(" ")[0].split("-");
        // alert(dt);
        var mon = parseInt(dt[1],10)-1;
        var dateObj = new Date(dt[0],mon,dt[2]);
        var diffBwStartEND = Date.daysBetween(dateObj, endDate);
        if(diffBwStartEND < 6){
            dateObj.setDate(endDate.getDate()-6);
        }
        dateObj.setDate(dateObj.getDate()+parseInt(selectedDay,10));
        var date = dateObj.getDate()+'-'+months[dateObj.getMonth()]+'-'+dateObj.getFullYear(); //7+parseInt(selectedDay);

        $("#input_date").val(date).attr('readonly', true);
    }
                  
    $("#BNcheckmark").click(function(){
        if(localStorage.editable == 'true')
            $(this).toggleClass("check_mark_off check_mark_on");
    });
                
    $("#input_hours").blur(function(){
        if($(this).val().length == 0){
            $(this).val(getHours());
        }else{
            //obj.hours[selectedDay] = parseFloat($(this).val());
            setHours($(this).val());
        // alert(obj.hours[selectedDay]);
        }
        var y = $(window).scrollTop();  //your current y position on the page
        $(window).scrollTop(y-50);
    });
    $("#input_project").focus(function(){
        $("#project_help").show();
    });
    $("#input_project").blur(function(){
        // alert($(this).val());
        $("#project_help").hide();
        var val = obj.PROJECT_NUMBER;
        if($(this).val().length == 0){
            //  $(this).val(obj.PROJECT_NUMBER);
            obj.PROJECT_NUMBER = '';
            track_obj.PROJECT_NUMBER = '';
        }else{
            obj.PROJECT_NUMBER = $(this).val().toUpperCase();
            track_obj.PROJECT_NUMBER = $(this).val().toUpperCase();
        //  alert(obj.projectid);
        }
        if(val != $(this).val()){
            enableChangeFlag();
        }
        var y = $(window).scrollTop();  //your current y position on the page
        $(window).scrollTop(y-50);
    });
    $("#input_task").blur(function(){
        var val = obj.TASK_NUMBER;
        if($(this).val().length == 0){
            // $(this).val(obj.TASK_NUMBER);
            obj.TASK_NUMBER = '';
            track_obj.TASK_NUMBER = '';
        }else{
            obj.TASK_NUMBER = encodeURIComponent($(this).val().replace(/"/g, ""));
            track_obj.TASK_NUMBER = encodeURIComponent($(this).val().replace(/"/g, ""));
        }
        if(val != $(this).val()){
            enableChangeFlag();
        }
        var y = $(window).scrollTop();  //your current y position on the page
        $(window).scrollTop(y-50);
    });

    $("#input_func").blur(function(){
        var val = obj.JOB_FUNCTION;
        if($(this).val().length == 0){
            //  $(this).val(obj.JOB_FUNCTION);
            obj.JOB_FUNCTION = '';
            track_obj.JOB_FUNCTION = '';
        }else{
            obj.JOB_FUNCTION = $(this).val();
            track_obj.JOB_FUNCTION = $(this).val();
        }
        if(val != $(this).val()){
            enableChangeFlag();
        }
    });
    $("#input_shift").blur(function(){
        var val = obj.SHIFT;
        if($(this).val().length == 0){
            //$(this).val(obj.SHIFT);
            obj.SHIFT = '';
            track_obj.SHIFT = '';
        }else{
            obj.SHIFT = $(this).val();
            track_obj.SHIFT = $(this).val();
        }
        if(val != $(this).val()){
            enableChangeFlag();
        }
    });
    $("#input_client").blur(function(){
        var val = obj.CLIENT_CODE;
        if($(this).val().length == 0){
            // $(this).val(obj.CLIENT_CODE);
            obj.CLIENT_CODE = '';
            track_obj.CLIENT_CODE = '';
        }else{
            obj.CLIENT_CODE = encodeURIComponent($(this).val().replace(/"/g, ""));
            track_obj.CLIENT_CODE = encodeURIComponent($(this).val().replace(/"/g, ""));
        }
        if(val != $(this).val()){
            enableChangeFlag();
        }
    });
    
    $("#dialoglink").click(function(e) {
        e.preventDefault();
    });
        
    $( "#canceldialog" ).bind({
        popupafterclose: function(event, ui) {
            var location = $("#dialoglink").attr('href');
            $("#dialoglink").attr('href','');
            if(location.length)
                document.location = location;
        }
    });
});
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
function validateAlphaNumeric(evt) {
    var value = $(evt.target).val();
    
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode( key );
    var regex = /^[a-z0-9]+$/i;
    if( !regex.test(key) ) {
        theEvent.returnValue = false;
        if(theEvent.preventDefault) theEvent.preventDefault();
    }
}

// SAVE ACTION
function save(){
    //  alert($("#input_date").val());
    var ampm_val = $("#input_ampm").val();
    console.log(ampm_val);
    if(obj.PROJECT_NUMBER.split(' ').join('').length && (obj.PROJECT_NUMBER != "-")/* && (selectedDay != 6 ||ampm_val.length) */){
        var val = obj.BILLABLE_FLAG;

        obj.BILLABLE_FLAG = $("#input_billable").val();
        if(val != obj.BILLABLE_FLAG){
            track_obj.BILLABLE_FLAG = $("#input_billable").val();
            enableChangeFlag();
        }
        val = obj.LINE_TYPE;
        obj.LINE_TYPE = $("#input_type").val();
        
        if(val != obj.LINE_TYPE){
            track_obj.LINE_TYPE = $("#input_type").val();
            enableChangeFlag();
        }

        val = obj.AMPM;
        obj.AMPM = $("#input_ampm").val();
        
        if(val != obj.AMPM){
            track_obj.AMPM = $("#input_ampm").val();
            enableChangeFlag();
        }
        
        
        (obj.AMPM == undefined)?(obj.AMPM = '-'):obj.AMPM;
        obj.BILLABLE_FLAG = (obj.BILLABLE_FLAG == undefined)?'-':obj.BILLABLE_FLAG;
        (obj.JOB_FUNCTION == undefined)?(obj.JOB_FUNCTION = '-'):obj.JOB_FUNCTION;
        (obj.SHIFT == undefined)?(obj.SHIFT = '-'):obj.SHIFT;
        (obj.CLIENT_CODE == undefined)?(obj.CLIENT_CODE = '-'):obj.CLIENT_CODE;
        //      track_obj.AMPM = obj.AMPM;
        //        track_obj.JOB_FUNCTION = obj.JOB_FUNCTION;
        //        track_obj.SHIFT = obj.SHIFT;
        //        track_obj.CLIENT_CODE = obj.CLIENT_CODE;
        //     alert(JSON.stringify(track_obj));
        tsdata.data[selectedProjectIndex] = obj;
        track_tsdata.data[selectedProjectIndex] = track_obj;        
        localStorage.timecardData = JSON.stringify(tsdata);
        localStorage.trackChanges = JSON.stringify(track_tsdata);
  //      enableChangeFlag(); // called here because we dont need to check which parameter got changed, irrespective of changes we will pass all details.
        document.location='timesheetdata.html'
    }/*else if((selectedDay == 6 && ampm_val == "")){
        alert("Select AM/PM");
    }*/
    else{
        alert("Enter Project details");
    }
}
function backAction(){
    localStorage.selectedProjectIndex = -1;
    document.location='timesheetdata.html';
}
function alert(msg){
    $("#error_msg").text(msg);
    $("#canceldialog").popup('open');
}           
function getHours(){
    switch(parseInt(selectedDay,10)){
        case 0:
            return obj.DAY1;
            break;
        case 1:
            return obj.DAY2;
            break;
        case 2:
            return obj.DAY3;
            break;
        case 3:
            return obj.DAY4;
            break;
        case 4:
            return obj.DAY5;
            break;
        case 5:
            return obj.DAY6;
            break;
        case 6:
            return obj.DAY7;
            break;
        default:
            return 0;
    }
}
function setHours(value){
    var val = 0;
    switch(parseInt(selectedDay,10)){
        case 0:
            val = obj.DAY1;
            obj.DAY1 = parseFloat(value);
            track_obj.DAY1 = parseFloat(value);
            if(val != value){
                obj.DAY1_CHANGED = 1;
            }
            break;
        case 1:
            val = obj.DAY2;
            obj.DAY2 = parseFloat(value);
            track_obj.DAY2 = parseFloat(value);
            if(val != value){
                obj.DAY2_CHANGED = 1;
            }
            break;
        case 2:
            val = obj.DAY3;
            obj.DAY3 = parseFloat(value);
            track_obj.DAY3 = parseFloat(value);
            if(val != value){
                obj.DAY3_CHANGED = 1;
            }
            break;
        case 3:
            val = obj.DAY4;
            obj.DAY4 = parseFloat(value);
            track_obj.DAY4 = parseFloat(value);
            if(val != value){
                obj.DAY4_CHANGED = 1;
            }
            break;
        case 4:
            val = obj.DAY5;
            obj.DAY5 = parseFloat(value);
            track_obj.DAY5 = parseFloat(value);
            if(val != value){
                obj.DAY5_CHANGED = 1;
            }
            break;
        case 5:
            val = obj.DAY6;
            obj.DAY6 = parseFloat(value);
            track_obj.DAY6 = parseFloat(value);
            if(val != value){
                obj.DAY6_CHANGED = 1;
            }
            break;
        case 6:
            val = obj.DAY7;
            obj.DAY7 = parseFloat(value);
            track_obj.DAY7 = parseFloat(value);
            if(val != value){
                obj.DAY7_CHANGED = 1;
            }
            break;
 
    }
}
function enableChangeFlag(){
    switch(parseInt(selectedDay,10)){
        case 0:
            obj.DAY1_CHANGED = 1;
            break;
        case 1:
            obj.DAY2_CHANGED = 1;
            break;
        case 2:
            obj.DAY3_CHANGED = 1;
            break;
        case 3:
            obj.DAY4_CHANGED = 1;
            break;
        case 4:
            obj.DAY5_CHANGED = 1;
            break;
        case 5:
            obj.DAY6_CHANGED = 1;
            break;
        case 6:
            obj.DAY7_CHANGED = 1;
            break;
 
    }
}

function makeIdSeparate(id){    // Split the comma separated ids into an array and returns the same.
    var attrids = id.split(',');
    return attrids; //JSON.parse('{"id":"'+singleId+'","ids":"'+attrids+'"}');
}
function deleteDetail(){
    if(obj.ATTR_STATE == 1){    //IF LINE IS ADDED LOCALLY AND NOT UPDATED ON DATABASE
        tsdata.data.splice(selectedProjectIndex,1);
        track_tsdata.data.splice(selectedProjectIndex,1);
        localStorage.timecardData = JSON.stringify(tsdata);
        localStorage.trackChanges = JSON.stringify(track_tsdata);
        //           alert(JSON.stringify(track_tsdata));
        document.location='timesheetdata.html';

    }else{
        //  alert(JSON.stringify(obj));
        var json = JSON.parse('{"data" : []}');
        var idObj = '';
        if(localStorage.deleterowids.length){
            var restoreJson = JSON.parse(localStorage.deleterowids);
            json.data = restoreJson.data;
        }
        if(obj.DAY1_DETAIL_ID != 0&& obj.DAY1_DETAIL_ID != undefined){
            idObj = makeIdSeparate(obj.DAY1_DETAIL_ID);
            //json.data[json.data.length] = obj.DAY1_DETAIL_ID;
            json.data = json.data.concat(idObj);
        }
        if(obj.DAY2_DETAIL_ID != 0&& obj.DAY2_DETAIL_ID != undefined){
            idObj = makeIdSeparate(obj.DAY2_DETAIL_ID);
            //json.data[json.data.length] = obj.DAY2_DETAIL_ID;
            json.data = json.data.concat(idObj);
        }
        if(obj.DAY3_DETAIL_ID != 0&& obj.DAY3_DETAIL_ID != undefined){
            idObj = makeIdSeparate(obj.DAY3_DETAIL_ID);
            //json.data[json.data.length] = obj.DAY3_DETAIL_ID;
            json.data = json.data.concat(idObj);
        }
        if(obj.DAY4_DETAIL_ID != 0&& obj.DAY4_DETAIL_ID != undefined){
            idObj = makeIdSeparate(obj.DAY4_DETAIL_ID);
            //json.data[json.data.length] = obj.DAY4_DETAIL_ID;
            json.data = json.data.concat(idObj);
        }
        if(obj.DAY5_DETAIL_ID != 0&& obj.DAY5_DETAIL_ID != undefined){
            idObj = makeIdSeparate(obj.DAY5_DETAIL_ID);
            //json.data[json.data.length] = obj.DAY5_DETAIL_ID;
            json.data = json.data.concat(idObj);
        }
        if(obj.DAY6_DETAIL_ID != 0&& obj.DAY6_DETAIL_ID != undefined){
            idObj = makeIdSeparate(obj.DAY6_DETAIL_ID);
            //json.data[json.data.length] = obj.DAY6_DETAIL_ID;
            json.data = json.data.concat(idObj);
        }
        if(obj.DAY7_DETAIL_ID != 0&& obj.DAY7_DETAIL_ID != undefined){
            idObj = makeIdSeparate(obj.DAY7_DETAIL_ID);
            //json.data[json.data.length] = obj.DAY7_DETAIL_ID;
            json.data = json.data.concat(idObj);
        }
        //    console.log(JSON.stringify(json));
        // alert(JSON.stringify(json));
    
        if(json.data.length){
            localStorage.deleterowids = JSON.stringify(json);
            
            tsdata.data.splice(selectedProjectIndex,1);
            track_tsdata.data.splice(selectedProjectIndex,1);
            localStorage.timecardData = JSON.stringify(tsdata);
            localStorage.trackChanges = JSON.stringify(track_tsdata);
            document.location='timesheetdata.html';
 
        }
    }
}