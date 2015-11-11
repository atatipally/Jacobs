package jacobs.application;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.GregorianCalendar;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.PowerManager;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.FrameLayout.LayoutParams;
import android.widget.Toast;

@SuppressLint("SetJavaScriptEnabled")
public class MainActivity extends Activity {
	String update_string, create_string;
	public  String queryURL = "";
		
	//public final static String URL_UPDATE = "https://etsmobile.jacobs.com/restful/UpdateTimeCard_4";
	public final static String connectionURL = "http://202.153.40.237:8080/restful/";  //Development Server
	public final static String altConnectionURL = "http://192.168.110.10:8080/restful/";  //Development Server

//	public final static String connectionURL = "https://etstmobile.jacobs.com/restful/";   //Production Test server
//	public final static String altConnectionURL = "http://pasappt64.jacobs.com:18001/restful/";   //Production Test server

//	public final static String connectionURL = "https://etsmobile.jacobs.com/restful/";   //Production Live server
//	public final static String altConnectionURL = "http://10.64.0.128:18001/restful/";   //Production Live server
	
	public final static String jemsURL = "http://jemsmobile.jacobs.com/jacobsmobile/login";  //Internal JEMS URL
	public final static String altJemsURL = "http://pasapp38.jacobs.com:9080/jacobsmobile/login";  //External JEMS URL

	
	public static boolean goingToloadExpense = false;
	
	public static Object SPLASH_LOCK = new Object();
	public static final String PREFS_NAME = "User Info";
	public static final String RUN_BEFORE = "Run Before";
	public static final int id1 = 1111;
	public static final int id2 = 2222;
	public static final int id3 = 3333;
	public static final int id4 = 4444;
	public static boolean flag = false;
	protected FrameLayout webViewPlaceholder;
	protected WebView webView;


	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		setContentView(R.layout.activity_main);
		
		// Initialize the UI
		initUI();
	
		startActivity(new Intent(this, Splash.class));
	}
	
	
	@Override
	public void onBackPressed() {
		// TODO Auto-generated method stub
		//super.onBackPressed();
		if (webView.getUrl().trim().equals("file:///android_asset/bundle/menu.html") || webView.getUrl().trim().equals("file:///android_asset/bundle/login.html")) {
			System.exit(0);
		}else{
			webView.loadUrl("javascript:backAction()");
		}
		
	//	System.exit(0);

	}
	
/*
	// ovveride home key
	@Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_HOME)) {
            System.out.println("KEYCODE_HOME");
           finish();
            return true;
        }
        if ((keyCode == KeyEvent.KEYCODE_BACK)) {
            System.out.println("KEYCODE_BACK");
            onBackPressed();
            return false;
        }
        return false;
    }
		
	@Override
	public void onAttachedToWindow() {
		super.onAttachedToWindow();
		this.getWindow().setType(WindowManager.LayoutParams.TYPE_KEYGUARD_DIALOG); 
	}
	*/
	
	@Override
	protected void onPause() {
//		onAttachedToWindow();
//		if (ScreenReceiver.wasScreenOn) {
//			System.out.println("onPause() called because screen turned off.");
//		}
//		else {
//			System.out.println("normal onPause() call");
//			
//		}
		super.onPause();
				
		if(!goingToloadExpense){
			System.out.println("On Pause");
			PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
		    boolean isScreenOn = powerManager.isScreenOn();

		    if (!isScreenOn) {
		    	System.out.println("Screen Locked");
		    }
		    else{
		    	System.out.println("Screen Not Locked");
		    }		
			if(flag  && isScreenOn){
				flag = false;
				System.out.println("Finishing Activity");
				finish();
			}			
		}
	}

	
	@Override
	protected void onResume() {
//		if (!ScreenReceiver.wasScreenOn) {
//			System.out.println("onResume() called when screen turns on");
//		//	System.exit(0);
//		} else {
//			System.out.println("normal onResume() call");
//		}
		System.out.println("On Resume");
		super.onResume();
	}

//	@Override
//	public void onConfigurationChanged(Configuration newConfig) {
//		if (webView != null) {
//			// Remove the WebView from the old placeholder
//			webViewPlaceholder.removeView(webView);
//		}
//
//		super.onConfigurationChanged(newConfig);
//
//		// Load the layout resource for the new configuration
//		setContentView(R.layout.activity_main);
//
//		// Reinitialize the UI
//		initUI();
//	}

	@Override
	protected void onSaveInstanceState(Bundle outState) {
		super.onSaveInstanceState(outState);

		// Save the state of the WebView
		webView.saveState(outState);
	}

	@Override
	protected void onRestoreInstanceState(Bundle savedInstanceState) {
		super.onRestoreInstanceState(savedInstanceState);

		// Restore the state of the WebView
		webView.restoreState(savedInstanceState);
	}
	
	
	public void toggleNotifications(){
		SharedPreferences prefs = getSharedPreferences(PREFS_NAME, 0);

		boolean runBefore = prefs.getBoolean(RUN_BEFORE, false);

//		if (!runBefore) {
			Calendar cur_cal = new GregorianCalendar();
			cur_cal.setTimeInMillis(System.currentTimeMillis());//set the current time and date for this calendar
			
			int weekDay = cur_cal.get(cur_cal.DAY_OF_WEEK);
		    while (weekDay>6 || weekDay<3) {
		    	cur_cal.add(cur_cal.DATE, 1);
		    	System.out.println(cur_cal.toString());
		    	weekDay = cur_cal.get(cur_cal.DAY_OF_WEEK);
		    }

		    if (weekDay==3) { // Tuesday
		    	createNotification(cur_cal, id1);
		    	cur_cal.add(cur_cal.DATE, 1);
		    	createNotification(cur_cal, id2);
		    	cur_cal.add(cur_cal.DATE, 1);
		    	createNotification(cur_cal, id3);
		    	cur_cal.add(cur_cal.DATE, 1);
		    	createNotification(cur_cal, id4);
		    }else if(weekDay == 4){ //Wednesday
		    	cur_cal.add(cur_cal.DATE, 1);
		    	createNotification(cur_cal, id1);
		    	cur_cal.add(cur_cal.DATE, 1);
		    	createNotification(cur_cal, id2);
		    	cur_cal.add(cur_cal.DATE, 4);
		    	createNotification(cur_cal, id3);
		    	cur_cal.add(cur_cal.DATE, 1);
		    	createNotification(cur_cal, id4);
		    }else if(weekDay == 5){ //Thursday
		    	cur_cal.add(cur_cal.DATE, 1);
		    	createNotification(cur_cal, id1);
		    	cur_cal.add(cur_cal.DATE, 4);
		    	createNotification(cur_cal, id2);
		    	cur_cal.add(cur_cal.DATE, 1);
		    	createNotification(cur_cal, id3);
		    	cur_cal.add(cur_cal.DATE, 1);
		    	createNotification(cur_cal, id4);
		    }else if(weekDay == 6){ //Friday
		    	cur_cal.add(cur_cal.DATE, 4);
		    	createNotification(cur_cal, id1);
		    	cur_cal.add(cur_cal.DATE, 1);
		    	createNotification(cur_cal, id2);
		    	cur_cal.add(cur_cal.DATE, 1);
		    	createNotification(cur_cal, id3);
		    	cur_cal.add(cur_cal.DATE, 1);
		    	createNotification(cur_cal, id4);
		    }
						
			SharedPreferences.Editor editor = prefs.edit();
			editor.putBoolean(RUN_BEFORE, true);
			editor.commit();
//		}
	}
	public void createNotification(Calendar cur_cal, int alarmId){
		
		 // get a Calendar object with current time
		 Calendar cal = Calendar.getInstance();
		 cal.set(Calendar.HOUR_OF_DAY, 9);
		 cal.set(Calendar.MINUTE, 0);
		 cal.set(Calendar.SECOND, 0);
		 cal.set(Calendar.MILLISECOND, 0);
		 cal.set(Calendar.DATE, cur_cal.get(Calendar.DATE));
		 cal.set(Calendar.MONTH, cur_cal.get(Calendar.MONTH));
		 // add 5 minutes to the calendar object
		 //cal.add(Calendar.MINUTE, 5);
		 Intent intent = new Intent(this, AlarmReceiver.class);
		 intent.putExtra("Jacobs", "Please enter your time");
		 // In reality, you would want to have a static variable for the request code instead of 192837
		 PendingIntent sender = PendingIntent.getBroadcast(this, alarmId, intent, PendingIntent.FLAG_UPDATE_CURRENT);
		 
		 // Get the AlarmManager service
		 AlarmManager am = (AlarmManager) getSystemService(ALARM_SERVICE);
		 am.set(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), sender);
		 am.setRepeating(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), 1000*60*60*24*7, sender);
	}
	
	
	private void initUI() {
		// TODO Auto-generated method stub
		// Retrieve UI elements
		webViewPlaceholder = ((FrameLayout) findViewById(R.id.webViewPlaceholder));

		if (webView == null) {
			// Create the webview
			webView = new WebView(this);
			webView.setLayoutParams(new ViewGroup.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
			webView.getSettings().setJavaScriptEnabled(true);
			webView.setScrollBarStyle(WebView.SCROLLBARS_OUTSIDE_OVERLAY);
			webView.setScrollbarFadingEnabled(true);
			webView.getSettings().setLoadsImagesAutomatically(true);
			webView.getSettings().setDomStorageEnabled(true);
			webView.setWebViewClient(new WebViewClient());
			webView.setWebChromeClient(new WebChromeClient());
			webView.setVerticalScrollbarOverlay(true);
			webView.getSettings().setDatabasePath("/data/data/" + webView.getContext().getPackageName()+"/databases/");
			// Bind this object as a JavaScript object
			// webview.addJavascriptInterface(this, "contactSupport");

			webView.setWebViewClient(new WebViewClient() {
				@Override
				public void onPageFinished(WebView view, String url) {
					super.onPageFinished(webView, url);
//					System.out.println("hai");
//					if (webView.getUrl().trim().equals("file:///android_asset/bundle/timesheetdata.html")) {
//						changedOrientation("loadtimesheet");
//					} else {
//						changedOrientation("notloadtimesheet");
//					}
					changedOrientation("loadtimesheet");
				}

				@Override
				public void onReceivedError(WebView view, int errorCode,String description, String failingUrl) {
					Toast.makeText(getApplicationContext(),"Oh no! " + description, Toast.LENGTH_SHORT).show();
				}
			});

			webView.loadUrl("file:///android_asset/bundle/login.html");
			webView.addJavascriptInterface(this, "Android");

		}
		// Attach the WebView to its placeholder
		webViewPlaceholder.addView(webView);

	}

	public void changedOrientation(String from) {
		if (from.trim().equals("loadtimesheet")) {
			this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
		} else if (from.trim().equals("notloadtimesheet")) {
			this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
		}
	}
	public void enableNotifications(int x) {
		System.out.println("Notify  : "+x);
		if(x==1){
			toggleNotifications();
		}else{
/*			 AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
			    Intent updateServiceIntent = new Intent(getApplicationContext(), AlarmReceiver.class);
			    PendingIntent pendingUpdateIntent = PendingIntent.getService(getApplicationContext(), 0, updateServiceIntent, PendingIntent.FLAG_UPDATE_CURRENT);
			    // Cancel alarms
			    try {
			        alarmManager.cancel(pendingUpdateIntent);
			    } catch (Exception e) {
			       //Log.e(TAG, "AlarmManager update was not canceled. " + e.toString());
			    }
*/
/*			AlarmManager am = (AlarmManager) getSystemService(getApplicationContext().ALARM_SERVICE);
			Intent I = new Intent(getApplicationContext(),AlarmReceiver.class);
			PendingIntent P = PendingIntent.getBroadcast(getApplicationContext(), 0, I, 0);
			am.cancel(P);
			P.cancel();
*/
			int ids = 1111;
			for(int i=0;i<4;i++){
				int alrmId = ids*(i+1);
				Intent I = new Intent(getApplicationContext(),AlarmReceiver.class);
	            PendingIntent pendingIntent = PendingIntent.getBroadcast(getApplicationContext(), alrmId, I, PendingIntent.FLAG_UPDATE_CURRENT);
	            AlarmManager alarmManager = (AlarmManager) getApplicationContext().getSystemService(ALARM_SERVICE);
	            alarmManager.cancel(pendingIntent);
			}
		}
	}
	
	public void openUsefulInfo(String policy) {
		
		goingToloadExpense = true;
		String loadURL = "";

        if (policy.equals("spoc")) {
            //IT Spoc
            loadURL = "http://itcoresites.jacobs.com/public/spoc_lookup.aspx";
        }else if (policy.equals("trvl")){
            //Travel policy
            loadURL = "file:///android_asset/bundle/info/travelpolicy.html";
        }else if (policy.equals("tmkp")){
            //Timekeeping Policy
        	loadURL = "file:///android_asset/bundle/info/timekeeping.html";
        }else if (policy.equals("expns")){
            //Expense Policy
        	loadURL = "file:///android_asset/bundle/info/expensepolicy.html";
        }else if (policy.equals("mbrst")){
            //Expense Policy
        	loadURL = "file:///android_asset/bundle/info/mealbreakpolicy.html";
        }
		
		Intent in = new Intent(MainActivity.this,ExpensesActivity.class);

		in.putExtra("jemsurl", loadURL);
		startActivity(in);		
	}	
	public void loadExpenses(String urlFlag) {
		
		goingToloadExpense = true;
		
		Intent in = new Intent(MainActivity.this,ExpensesActivity.class);
		String expenseURL = jemsURL;
		if(urlFlag.equals("1")){
			expenseURL = altJemsURL;
		}
		in.putExtra("jemsurl", expenseURL);
		startActivity(in);		
	}
	
	
	public void update(String up,String urlFlag) {
		update_string = up;
		queryURL = connectionURL;
		if(urlFlag.equals("1")){
			queryURL = altConnectionURL;
		}
		System.out.println("calling from client : "+queryURL);

		// Toast.makeText(getApplicationContext(), "update",
		// Toast.LENGTH_LONG).show();
		new update().execute();

	}

	public void create(String cr,String urlFlag) {
		 System.out.println("Create" +cr);
		// Toast.makeText(getApplicationContext(), "cREATE",
		// Toast.LENGTH_LONG).show();
		queryURL = connectionURL;
		if(urlFlag.equals("1")){
			queryURL = altConnectionURL;
		}
		System.out.println("calling from client : "+queryURL);
		create_string = cr;
		new create().execute();
	}

	private class update extends AsyncTask<String, Void, String> {
		String response = null;

		@Override
		protected void onPreExecute() {
			super.onPreExecute();
		}

		@Override
		protected String doInBackground(String... up) {
			// final String update_data =
			// "updatetimecardrequest={\"mode\":\"SAVE\",\"data\":[{\"DID\":\"366974373\",\"H\":\"5\",\"OVN\":\"1\",\"ID\":\"366974365\",\"DY\":\"MON\"}]}";
			ArrayList<NameValuePair> nameValuePairs;
			nameValuePairs = new ArrayList<NameValuePair>();
			nameValuePairs.add(new BasicNameValuePair("updatetimecardrequest",update_string));
			// ArrayList<String> result = new ArrayList<String>();
			// ArrayList<String> passed = up[0];
			// "{\"mode\":\"SAVE\",\"data\":[{\"DID\":\"366974373\",\"H\":\"5\",\"OVN\":\"1\",\"ID\":\"366974365\",\"DY\":\"MON\"}]}"
			String url = queryURL+"UpdateTimeCard_4";
	/*		response = HTTPPost.sendPost("https://etsmobile.jacobs.com/restful/UpdateTimeCard_4",nameValuePairs);
	*/
			response = HTTPPost.sendPost(
					url,
					nameValuePairs);
			System.out.println("Response  : " + response);
			return response;
		}

		protected void onPostExecute(String result) {
			result = result.substring(5, result.length() - 2);
			webView.loadUrl("javascript:timecardUpdated(" + result + ")");
			// webview.loadUrl("javascript:timecardUpdated(result)");
			System.out.println("Result :" + result);
		}
	}

	private class create extends AsyncTask<String, Void, String> {
		String response = null;

		@Override
		protected void onPreExecute() {
			super.onPreExecute();
		}

		@Override
		protected String doInBackground(String... cr) {
			ArrayList<NameValuePair> nameValuePairs;
			nameValuePairs = new ArrayList<NameValuePair>();
			nameValuePairs.add(new BasicNameValuePair("ctc_request",
					create_string));
			String url = queryURL+"CreateTimeCard_4";
/*			
 			response = HTTPPost.sendPost("https://etsmobile.jacobs.com/restful/CreateTimeCard_4",nameValuePairs);  
*/
			response = HTTPPost.sendPost(url,nameValuePairs);
			System.out.println("Response  : " + response);
			return response;
		}

		protected void onPostExecute(String result) {
			result = result.substring(5, result.length() - 2);
			webView.loadUrl("javascript:timecardCreated(" + result + ")");
			System.out.println("Result :" + result);
		}
	}


}
