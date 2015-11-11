package jacobs.application;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.FrameLayout.LayoutParams;
import android.widget.Toast;

public class ExpensesActivity extends Activity{
	
	protected FrameLayout webViewPlaceholder;
	protected WebView webView;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.expenses_screen);	
		
		MainActivity.goingToloadExpense = false;
		String url;
		Bundle extras;
		if (savedInstanceState == null) {
		    extras = getIntent().getExtras();
		    if(extras == null) {
		    	url= null;
		    } else {
		    	url= extras.getString("jemsurl");
		    }
		} else {
			url= (String) savedInstanceState.getSerializable("jemsurl");
		}
		initUI(url);		
	}
	
	
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
	
	
	private void initUI(String url) {
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
			webView.getSettings().setDatabasePath("/data/data/" + webView.getContext().getPackageName()
							+ "/databases/");
			// Bind this object as a JavaScript object
			// webview.addJavascriptInterface(this, "contactSupport");

			webView.setWebViewClient(new WebViewClient() {
				@Override
				public void onPageFinished(WebView view, String url) {
					super.onPageFinished(webView, url);
					changedOrientation("loadtimesheet");					
				}

				@Override
				public void onReceivedError(WebView view, int errorCode,String description, String failingUrl) {
					Toast.makeText(getApplicationContext(),"Oh no! " + description, Toast.LENGTH_SHORT).show();
				}
			});
			System.out.println("JEMS URL : "+url);
//			webView.loadUrl("file:///android_asset/bundle/login.html");
			webView.loadUrl(url);
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

}
