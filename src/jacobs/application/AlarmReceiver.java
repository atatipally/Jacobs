package jacobs.application;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;
import android.media.RingtoneManager;
import android.os.Bundle;
 
public class AlarmReceiver extends BroadcastReceiver {
 //hi sai krishna
// @Override
// public void onReceive(Context context, Intent intent) {
//   try {
//     Bundle bundle = intent.getExtras();
//     String message = bundle.getString("alarm_message");
//     Toast.makeText(context, message, Toast.LENGTH_SHORT).show();
//    } catch (Exception e) {
//     Toast.makeText(context, "There was an error somewhere, but we still received an alarm", Toast.LENGTH_SHORT).show();
//     e.printStackTrace();
// 
//    }
// }
// 
 
	NotificationManager nm;
	static int notifyID=1234;

	
 @Override
 public void onReceive(Context context, Intent intent) {
   try {
 /*    Bundle bundle = intent.getExtras();
     String message = bundle.getString("Jacobs");
     
     Intent newIntent = new Intent(context, MainActivity.class);
     newIntent.putExtra("Jacobs", message);
     newIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
     context.startActivity(newIntent);*/
	   
		nm = (NotificationManager) context
				.getSystemService(Context.NOTIFICATION_SERVICE);
		Notification notifyDetails = new Notification(R.drawable.ic_launcherjacobs,
				"Please Enter your time.", System.currentTimeMillis());
		// Context context = getApplicationContext();
		CharSequence from = "Jacobs";
		CharSequence message = "Please Enter your time.";
		notifyDetails.flags |= Notification.FLAG_AUTO_CANCEL;
		notifyDetails.defaults |= Notification.DEFAULT_SOUND;
		notifyDetails.defaults |= Notification.DEFAULT_VIBRATE;
		PendingIntent contentIntent = PendingIntent.getActivity(context, 0,
				new Intent(context, MainActivity.class), PendingIntent.FLAG_ONE_SHOT);

		notifyDetails.setLatestEventInfo(context, from, message, contentIntent);
		nm.notify(notifyID, notifyDetails);  
	   
	   
    } catch (Exception e) {
//     Toast.makeText(context, "There was an error somewhere, but we still received an alarm", Toast.LENGTH_SHORT).show();
     e.printStackTrace();
 
    }
 }
}
