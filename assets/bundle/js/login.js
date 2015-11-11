/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var errorMessage = 'We are unable to login App at this time. Please contact your IT';
var baseURL = connectionURL;
var primaryRequest = true;
localStorage.currentURL = "0";  // 0 if app uses external URL, 1 if fails to get data from primary URL i.e app using alternate URL.

$(document).ready(function(){
    
    switch(window.orientation){  
        case -90:
        case 90:
            window.onorientationchange();
                            
    }
    
    
    setDefaultStorage();
    
    $("#loading_screen").css('display','none');
    $("#login_btn").click(function(){
        var uname=$("#username").val().replace(/\s/g, '').replace(/\\/g, '/');
        var passwd=$("#pwd").val().replace(/\s/g, '');
        var hash = getHash();
        //alert(uname+','+passwd);
        if(uname.length&&passwd.length){
            $("#loginform_div").hide();
            $("#loading_screen").css('display','block');
            var params = '{\"username\":\"'+encodeURIComponent(uname)+'\",\"password\":\"'+encodeURIComponent(passwd.replace(/\"/g, '\\\"'))+'\",\"hash\":\"'+hash+'\",\"apostrophe\":\"\"}';
            //alert(getHash());
            localStorage.remembermedetails = params;
            if(navigator.onLine){
                if(isMobile.iOS()){
                    window.location = BASE_DELI_MITER+'loginrequest'+DELI_MITER+uname+DELI_MITER+passwd+DELI_MITER+hash;
                }else{
                    login(params);
                }
            }else{
                $("#error_msg").text("No Internet Connection");
                $("#canceldialog").popup('open');
                $("#loading_screen").hide();
                $("#loginform_div").show();
            }
        }
        else{
            // alert("Invalid Credentials");
            $("#error_msg").text("Invalid Credentials");
            $("#canceldialog").popup('open');
            /*   $("#canceldialog").popup({
                history:false//,
              //  overlayTheme: "a"
            }).popup('open');*/
            
            $("#loginform_div").css('display','block');
        }
    });
    if(localStorage.rememberme == 'true'){
        var logindetails = urldecode(localStorage.remembermedetails);
        var rem_obj = JSON.parse(logindetails);
        $("#username").val(rem_obj.username);

    }
    function login(params){
        //  alert(params);
        var url = baseURL+'Login';
        alert(url+params);
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'jsonp',
            data:'loginrequest='+params,
            timeout: 30000,
            // contentType: "application/json; charset=utf-8",
            success: function (data, textStatus, xhr) {
                //                 alert('success: '+xhr.status);
                didLogin(data)
 
            },
            error: function (request, status, error) {
                if(primaryRequest){
                    primaryRequest = false;
                    baseURL = altConnectionURL;
                    localStorage.currentURL = "1";
                    login(params);
                }else{
                    $("#loading_screen").css('display','none');
                    $("#loginform_div").show();
                                
                    //alert("error : "+error);
                    //$("#error_msg").text(error);
                    $("#error_msg").text(errorMessage);
                    $("#canceldialog").popup('open');              
                }
            }
        });
    }
});

function urldecode(str) {
    return decodeURIComponent((str+'').replace(/\+/g, '%20'));
}
function didLogin(data){
    //$("#loading_screen").css('display','none');
    // var myObject = JSON.parse(data);
    $("#loading_screen").css('display','none');
  

    if(data.length){
        var login = JSON.parse(data);//jQuery.parseJSON(myObject);
        //   alert(data);
        if(login.response == 'success'){
            var dataObj = login.data;
            if(dataObj.employee_id != undefined && dataObj.employee_id.length !=0){
                localStorage.userid = dataObj.employee_id;//5665;
                localStorage.username = urldecode(dataObj.username);
                localStorage.usertype = dataObj.usertype;
                localStorage.joindate = dataObj.joindate;
                //                localStorage.show_timesheets = dataObj.show_timesheets;
                document.location="menu.html";
            }else{
                //alert("Unknown error occured");
                $("#error_msg").text("Unknown error occured");
                $("#canceldialog").popup('open');
                $("#loginform_div").show();
            }
        }else{
            $("#loginform_div").show();
            var dataObj;
            if(login.data){
                dataObj = login.data;
                //alert('Error : '+dataObj.status);
                $("#error_msg").text(dataObj.status);
                $("#canceldialog").popup('open');
            }else{
                //alert("Login failed");
                $("#error_msg").text("Login failed");
                //$("#error_msg").text(errorMessage);
                $("#canceldialog").popup('open');
            }
        
        
        //location.reload();
        }
    }else{
        //alert('Request time out');
        $("#loginform_div").show();
        $("#error_msg").text(errorMessage);
        //$("#error_msg").text('Request time out');
        $("#canceldialog").popup('open');
    }
    
}
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

// CLEARING LOCAL STORAGE
function setDefaultStorage(){
    localStorage.userid = '';// UserId
    localStorage.usertype = '';//Type of user
    localStorage.username = '';//Name of user
    localStorage.show_timesheets = "0"; //Flag used to determine the user is allowed to access timesheets app.
    localStorage.timesheetid = '';
    localStorage.tsenddate = '';
    localStorage.editable = true;
    localStorage.initfromts = true;// to detect timesheetdata initiated from timesheet or approvals
    localStorage.fromcreate = false;
    ///localStorage.selectedProject // save appropriate project when click on detail disclosure in ts entry page 
    localStorage.selectedDay = -1;//day selected 
    localStorage.selectedProjectIndex = -1;//selected project index Default value '-1'
    localStorage.timecardData = undefined;//Entire time card data Default value 'undefined'
    localStorage.primaryapprovals = '';
    localStorage.deleterowids = '';
    localStorage.selectedApprovalItem = 0;
    localStorage.resourceNameForTimeSheet = ''; // User name to display on timesheet entry page when approver selects a Timecard to approve
    localStorage.timecardSubmitted = 0; // Used as hacky solution for issue "Not getting data immediatly after submitting timecard"
    localStorage.joindate = ''; //Joining date of employee
}