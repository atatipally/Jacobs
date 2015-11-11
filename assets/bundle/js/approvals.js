/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var userId = localStorage.userid;
var baseURL = connectionURL;
if(localStorage.currentURL == "1"){
    baseURL = altConnectionURL;
}

$(document).ready(function(){
    $("#user_name").text(localStorage.username);
    $("#loading_screen").show();
    $("#loading_screen1").show();
    localStorage.timecardData = undefined;
    var hash = getHash();
    var url = baseURL+'GetPrimaryApprovals_1'; //'https://etsmobile.jacobs.com/restful/GetPrimaryApprovals_1'
    var params = '{\"approver_id":\"'+userId+'\",\"secondaryapprover_id":\"'+userId+'\",\"hash":\"'+hash+'\"}';
    //  show();
    if(isMobile.iOS()){
        window.location = BASE_DELI_MITER+'approvalsrequest'+DELI_MITER+userId+DELI_MITER+hash;
    }
    else{
        //REQUEST FOR PRIMARY APPROVALS
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'jsonp',
            data:'approvalsrequest='+params,
            timeout: 30000,
            async: false,
            success: function (data, textStatus, xhr) {
                //   alert('success : '+data);
                showApprovals(data);
            },
            error: function (request, status, error) {
                $("#loading_screen").hide();
                alert("error");
            }
 
        });
    }
         
    $("input[name=radio-view]").change(function () {
        //alert('clicked'+$(this).val()); 
        if($(this).val()==0){
            localStorage.selectedApprovalItem = 0;
            $("#content").show();
            $("#content1").hide();
        }else if($(this).val()==1){
            localStorage.selectedApprovalItem = 1;
            $("#content").hide();
            $("#content1").show();
        }
    }); 
    
    if(localStorage.selectedApprovalItem==1){
        //   alert(localStorage.selectedApprovalItem);
        $('#radio-view-a').attr('checked', false).checkboxradio("refresh");
        $('#radio-view-b').attr('checked', true).checkboxradio("refresh");
        $("#content").hide();
        $("#content1").show();
    }
});

//OVERRIDING DEFAULT ALERT FUNCTION IN JAVASCRIPT
function alert(msg){
    $("#error_msg").text(msg);
    $("#canceldialog").popup('open');
}

//OPENS TIME ENTRY FORM FOR SELECTED TIMECARD
function loadTimesheet(emp_id,endDate,startDate,approval_status,userName){
    localStorage.initfromts = false
    localStorage.editable=false;
    localStorage.loadTimeSheetForResourse = emp_id;
    localStorage.resourceNameForTimeSheet = userName;
    localStorage.timesheetid = '-';
    localStorage.tsenddate = endDate;
    localStorage.tsstartdate = startDate;
    localStorage.approvalstatus = approval_status;
    document.location = 'timesheetdata.html';
}

//REQUEST FOR SECONDARY APPROVALS
function getSecondaryApprovals(){
    var hash = getHash();
    var url = baseURL+'GetSecondaryApprovals_1'; 
    var params = '{\"approver_id":\"'+userId+'\",\"secondaryapprover_id":\"'+userId+'\",\"hash":\"'+hash+'\"}';
    //  show();
    if(isMobile.iOS()){
        window.location = BASE_DELI_MITER+'secondaryapprovals'+DELI_MITER+userId+DELI_MITER+hash;
    }
    else{
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'jsonp',
            data:'approvalsrequest='+params,
            timeout: 30000,
            async: false,
            success: function (data, textStatus, xhr) {
                //   alert('success : '+data);
                showSecondaryApprovals(data)
            },
            error: function (request, status, error) {
                $("#loading_screen").hide();
                alert(error);
            }
 
        });
    }  
    
}

function urldecode(str) {
    return decodeURIComponent((str+'').replace(/\+/g, '%20'));
}

//GENERATING DYNAMIC HTML FOR PRIMARY APPROVALS BASED ON SERVER RESPONSE
function showApprovals(data){
    data = urldecode(data);
    localStorage.primaryapprovals = data;
    getSecondaryApprovals();
    $("#loading_screen").hide();
    var response = JSON.parse(data);
    if(response.response == 'success'){
        // For Primary Approvals  
        var resdata = response.primary_approvals;
        var html = '';
        var array = new Array;
        //alert(array.length);
        if(resdata.length == 0){
            html = '<div style="margin: auto;padding-top:2%;"> <h3 align="center">No Data Found</h3></div>';
        }
        // GROUPING TIMECARDS BASED ON WEEK THEY ENTERD FOR
        for (var i=0;i<resdata.length;i++){
            var arrayIn = new Array;
            arrayIn[arrayIn.length] = resdata[i];
            var tobj = resdata[i];
            for(var j=i+1;j<resdata.length;j++){
                var tplusobj = resdata[j];
                if(tplusobj.WEEK_START_DATE == tobj.WEEK_START_DATE){
                    arrayIn[arrayIn.length] = tplusobj;
                    resdata.splice(j,1);
                    j--;
                }
            }  
            array[array.length] = arrayIn;
        }
        //LOOP THROUGH SORTED TIMECARDS     
        html += '<ul id="" data-role="listview" data-divider-theme="d" data-inset="true" style="margin-top: 0px;">';
        for (var k=0;k<array.length;k++){

            var tlist = array[k];
            
            var item = '<li class="approval_header">'+tlist[0].WEEK_START_DATE+' to '+tlist[0].WEEK_END_DATE+'</li>';
            for(var l=0;l<tlist.length;l++){
                var tobj1 = tlist[l];
                var fringeHours = parseFloat(tobj1.GRAND_THRS)-(parseFloat(tobj1.RP_THRS)+parseFloat(tobj1.OT_THRS));
                item += '<li onClick="loadTimesheet(\''+tobj1.RESOURCE_ID+'\',\''+tobj1.WEEK_END_DATE+'\',\''+tobj1.WEEK_START_DATE+'\',\''+tobj1.APPROVAL_STATUS_DISP+'\',\''+tobj1.EMPLOYEE_NAME.replace(/'/g, "\\'").replace(/"/g, "&quot;")+'\');" data-theme=c class=listview_li><a href=# class=listview_bg><p class=tstitle>'+tobj1.EMPLOYEE_NAME+'</p></a><span class="arrow_img">'+tobj1.GRAND_THRS+'&nbsp&nbsp&nbsp&nbsp</span><div class="ts_open_state type">'+tobj1.APPROVAL_STATUS_DISP+'<span class="rp_hours">Fringe: '+fringeHours+'&nbsp;&nbsp;</span><span class="ot_hours">OT: '+tobj1.OT_THRS+'&nbsp;&nbsp;</span><span class="reg_hours">Reg: '+tobj1.RP_THRS+'&nbsp;&nbsp;</span></div></li>';
            }
            item += '</fieldset>';
            html += item;
            
        /*            var item = '<fieldset data-role="controlgroup">';
            item += '<legend>'+tlist[0].WEEK_START_DATE+' to '+tlist[0].WEEK_END_DATE+'</legend>';
            for(var l=0;l<tlist.length;l++){
                var tobj1 = tlist[l];
                item += '<label class="approval_lable listview_li"><input type="checkbox" name="checkbox-'+(l+1)+'" value="'+tobj1.RESOURCE_ID+'@@@'+tobj1.WEEK_END_DATE+'@@@'+tobj1.WEEK_START_DATE+'@@@'+tobj1.APPROVAL_STATUS_DISP+'@@@'+tobj1.EMPLOYEE_NAME+'"/><p> <p class="listview_bg tstitle" >'+tobj1.EMPLOYEE_NAME+'Marqueeeeeeeee asdfdfs'+'</p></p><p class="approval_arrow_img">'+tobj1.GRAND_THRS+'</p><table class="type_table"><tr><td>'+tobj1.APPROVAL_STATUS_DISP+'</td><td><span class="rp_hours">Fringe: 0</span><span class="ot_hours">OverTime: '+tobj1.OT_THRS+'&nbsp;&nbsp;</span><span class="reg_hours">Regular: '+tobj1.REG_THRS+'&nbsp;&nbsp;</span></td></tr></table></label><span class="approval_arrow_bg" onclick="loadTimesheet(\''+tobj1.RESOURCE_ID+'\',\''+tobj1.WEEK_END_DATE+'\',\''+tobj1.WEEK_START_DATE+'\',\''+tobj1.APPROVAL_STATUS_DISP+'\',\''+tobj1.EMPLOYEE_NAME+'\');"><span class="approval_arrow"></span></span>';
            }
            item += '</fieldset>';
            html += item;*/
        }
        html += '</ul>';
        $("#content").html(html).trigger( "create" );//.page();
    }else{
        if(response.primary_approvals.length == 0){
            var html = '<div style="margin: auto;padding-top:2%;"> <h3 align="center">No Data Found</h3></div>';
            $("#content").html(html).trigger( "create" );//.page();
        }
        
        var dataObj = response.data;
        alert(dataObj.status);
    }
    
    $("input[type=checkbox]").change(function () {
        //   alert('Prim  :  '+$(this).val());
        var vals = $(this).val().split('@@@');
        loadTimesheet(vals[0],vals[1],vals[2],vals[3],vals[4]);
    });
}

//GENERATING DYNAMIC HTML FOR SECONDARY APPROVALS BASED ON SERVER RESPONSE
function showSecondaryApprovals(data){
    data = urldecode(data);
    // For Secondary Approvals   
    $("#loading_screen1").hide();
    var response = JSON.parse(data);
    if(response.response == 'success'){
        var resdata1 = response.secondary_approvals;
        var html1 = '';
        var array1 = new Array;
        //alert(array.length);
        if(resdata1.length == 0){
            html1 = '<div style="margin:auto;padding-top:2%;"> <h3 align="center">No Data Found</h3></div>';
        }
        // GROUPING TIMECARDS BASED ON WEEK THEY ENTERD FOR
        for (var m=0;m<resdata1.length;m++){
            var arrayIn1 = new Array;
            arrayIn1[arrayIn1.length] = resdata1[m];
            var tobj2 = resdata1[m];
            for(var n=m+1;n<resdata1.length;n++){
                var tplusobj1 = resdata1[n];
                if(tplusobj1.WEEK_START_DATE == tobj2.WEEK_START_DATE){
                    arrayIn1[arrayIn1.length] = tplusobj1;
                    resdata1.splice(n,1);
                    n--;
                }
            }  
            array1[array1.length] = arrayIn1;
        }
        //LOOP THROUGH SORTED TIMECARDS 
        html1 += '<ul id="" data-role="listview" data-divider-theme="d" data-inset="true" style="margin-top: 0px;">';
        for (var o=0;o<array1.length;o++){
            var tlist1 = array1[o];
            var item1 = '<li class="approval_header">'+tlist1[0].WEEK_START_DATE+' to '+tlist1[0].WEEK_END_DATE+'</li>';
            for(var l=0;l<tlist1.length;l++){
                var tobj1 = tlist1[l];
                var fringeHours = parseFloat(tobj1.GRAND_THRS)-(parseFloat(tobj1.RP_THRS)+parseFloat(tobj1.OT_THRS));
                item1 += '<li onClick="loadTimesheet(\''+tobj1.RESOURCE_ID+'\',\''+tobj1.WEEK_END_DATE+'\',\''+tobj1.WEEK_START_DATE+'\',\''+tobj1.APPROVAL_STATUS_DISP+'\',\''+tobj1.EMPLOYEE_NAME.replace(/'/g, "\\'").replace(/"/g, "&quot;")+'\');" data-theme=c class=listview_li><a href=# class=listview_bg><p class=tstitle>'+tobj1.EMPLOYEE_NAME+'</p></a><span class="arrow_img">'+tobj1.GRAND_THRS+'&nbsp&nbsp&nbsp&nbsp</span><p class="ts_open_state type">'+tobj1.APPROVAL_STATUS_DISP+'<span class="rp_hours">Fringe: '+fringeHours+'&nbsp;&nbsp;</span><span class="ot_hours">OT: '+tobj1.OT_THRS+'&nbsp;&nbsp;</span><span class="reg_hours">Reg: '+tobj1.RP_THRS+'&nbsp;&nbsp;</span></p></li>';
            }
            item1 += '</fieldset>';
            html1 += item1;
        /*            var item1 = '<fieldset data-role="controlgroup">';
            item1 += '<legend>'+tlist1[0].WEEK_START_DATE+' to '+tlist1[0].WEEK_END_DATE+'</legend>';
            for(var p=0;p<tlist1.length;p++){
                var tobj3 = tlist1[p];
                //item1 += '<label class="approval_lable listview_li"><input type="checkbox" name="checkbox-'+(p+1)+'" style="display:none;" value="'+tobj3.RESOURCE_ID+'@@@'+tobj3.WEEK_START_DATE+'@@@'+tobj3.WEEK_END_DATE+'"/> <span class="listview_bg tstitle" >'+tobj3.EMPLOYEE_NAME+'</span><span class="approval_arrow_img">'+tobj3.GRAND_THRS+'</span><span class="task_type">'+tobj3.APPROVAL_STATUS_DISP+'<span class="reg_hours">REG: '+tobj3.REG_THRS+'</span>&nbsp;&nbsp;<span class="ot_hours">OT: '+tobj3.OT_THRS+'</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="rp_hours"></span></span> </label><span class="approval_arrow_bg" onclick="loadTimesheet(\''+tobj3.RESOURCE_ID+'\',\''+tobj3.WEEK_END_DATE+'\',\''+tobj3.WEEK_START_DATE+'\',\''+tobj3.APPROVAL_STATUS_DISP+'\');"><span class="approval_arrow"></span></span>';
                item1 += '<label class="approval_lable listview_li"><input type="checkbox" name="checkbox-'+(p+1)+'" style="display:none;" value="'+tobj3.RESOURCE_ID+'@@@'+tobj3.WEEK_END_DATE+'@@@'+tobj3.WEEK_START_DATE+'@@@'+tobj3.APPROVAL_STATUS_DISP+'@@@'+tobj3.EMPLOYEE_NAME+'"/> <span class="listview_bg tstitle" >'+tobj3.EMPLOYEE_NAME+'</span><span class="approval_arrow_img">'+tobj3.GRAND_THRS+'</span><table class="type_table"><tr><td>'+tobj3.APPROVAL_STATUS_DISP+'</td><td><span class="rp_hours">Fringe: 0</span><span class="ot_hours">OverTime: '+tobj3.OT_THRS+'&nbsp;&nbsp;</span><span class="reg_hours">Regular: '+tobj3.REG_THRS+'&nbsp;&nbsp;</span></td></tr></table> </label><span class="approval_arrow_bg" onclick="loadTimesheet(\''+tobj3.RESOURCE_ID+'\',\''+tobj3.WEEK_END_DATE+'\',\''+tobj3.WEEK_START_DATE+'\',\''+tobj3.APPROVAL_STATUS_DISP+'\',\''+tobj3.EMPLOYEE_NAME+'\');"><span class="approval_arrow"></span></span>';
            }
            item1 += '</fieldset>';
            html1 += item1;*/
        }
        html1 += '</ul>';
        $("#content1").html(html1).trigger( "create" );//.page();
    }else{
        if(response.secondary_approvals.length == 0){
            var html1 = '<div style="width: 100%;height: 100%;margin: 50% auto;"> <h3 align="center">No Data Found</h3></div>';
            $("#content1").html(html1).trigger( "create" );//.page();
        }
        var dataObj = response.data;
        alert(dataObj.status);
    }
    $("input[type=checkbox]").change(function () {
        var vals = $(this).val().split('@@@');
        loadTimesheet(vals[0],vals[1],vals[2],vals[3],vals[4]);
    });
}


function backAction(){
    localStorage.selectedApprovalItem = 0;
    document.location='approvalcontainer.html';
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























// APPROVE OR REJECT TIMECARDS
function performAction(action){
    var comments = $("#comments").val();
    if(comments.length){
        var json = JSON.parse('{"action":"'+action+'","comment":"'+comments+'","data":[]}');
    
        var segment;
        $("input[type=radio]:checked").each ( function() {
            segment = $(this).val();
        });
    
        if(segment == 0){
    
            $("#content input[type=checkbox]:checked").each ( function() {
                //  alert ( $(this).val() );
                var val = $(this).val();
                var data = val.split('@@@');
                //  var attrJson = JSON.parse('{"resource_id": "1896","startdate": "09-Feb-2013","enddate":"15-Feb-2013"}');
                var attrJson = JSON.parse('{"resource_id": "'+data[0]+'","startdate": "'+data[1]+'","enddate":"'+data[2]+'"}');
                //                              alert(""+JSON.stringify(attrJson));
                json.data[json.data.length] = attrJson;
            });
        }else{
            $("#content1 input[type=checkbox]:checked").each ( function() {
                //  alert ( $(this).val() );
                var val = $(this).val();
                var data = val.split('@@@');
                var attrJson = JSON.parse('{"resource_id": "'+data[0]+'","startdate": "'+data[1]+'","enddate":"'+data[2]+'"}');
                //                              alert(""+JSON.stringify(attrJson));
                json.data[json.data.length] = attrJson;
            });
        }
        //   alert(""+JSON.stringify(json)); 
   
        if(json.data.length){
   
            var url = 'https://etsmobile.jacobs.com/restful/ApproveTimeCards';
            $("#loading_screen").show();
            var params = JSON.stringify(json);

            console.log(params);
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'jsonp',
                data:'approvetimecardrequest='+params,
                timeout: 30000,
                async: false,
                contentType: "application/json; charset=utf-8",
                success: function (data, textStatus, xhr) {
                    //     alert(data);
                    var res = JSON.parse(data);//jQuery.parseJSON(myObject);
                    $("#loading_screen").hide();  
                    //   alert(res.data.status);
                    if(res.response == 'success'){
                        alert(res.data.status);
                        document.location = 'approvals.html';
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
    }else{
        alert('Comments Missing');
    }
}
function actionMenuApprove(){
    performAction('Approved');
}
function actionMenuReject(){
    performAction('Rejected');
}
function checkAll(){
    var check = true;
    if($("#checkall").text() == 'Check All'){
        $("#checkall").text('Uncheck All');
    }else{
        check = false;
        $("#checkall").text('Check All');
    }
    $("input[type=checkbox]").each ( function() {
        // $(this).attr('checked', 'checked');
        $("input[type='checkbox']").attr("checked",check).checkboxradio("refresh");
    });
}



