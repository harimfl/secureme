package com.hari.secureme;

import android.Manifest;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.location.LocationProvider;
import android.net.Uri;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends AppCompatActivity {
    static MainActivity mainActivityInstance = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mainActivityInstance = this;
    }

    private void sendRequest(final Integer requestType, final boolean requestStatus) {

        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    LocationManager locationManager = (LocationManager)
                            getSystemService(Context.LOCATION_SERVICE);
                    if (ActivityCompat.checkSelfPermission(mainActivityInstance, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(mainActivityInstance, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                        // TODO: Consider calling
                        //    ActivityCompat#requestPermissions
                        // here to request the missing permissions, and then overriding
                        //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                        //                                          int[] grantResults)
                        // to handle the case where the user grants the permission. See the documentation
                        // for ActivityCompat#requestPermissions for more details.
                        return;
                    }
                    Location loc = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                    Double latitude = -1.0;
                    Double longitude = -1.0;
                    if (loc != null) {
                        latitude = loc.getLatitude();
                        longitude = loc.getLongitude();
                    }
                    SharedPreferences settings = getSharedPreferences("com.hari.secureme", Context.MODE_PRIVATE);
                    String userId = settings.getString("userid", "");
                    String dataUrl = "http://dev-in-3.aliathegame.com:10000/request";
                    String dataUrlParameters = "userid="+userId+"&type="+requestType.toString()+"&gps="+latitude+","+longitude;
                    if (requestStatus) {
                        dataUrl = "http://dev-in-3.aliathegame.com:10000/getRequestForId";
                        dataUrlParameters = "requestid="+settings.getString("requestId", "");
                    }
                    URL url;
                    HttpURLConnection connection = null;
                    try {
// Create connection
                        url = new URL(dataUrl);
                        connection = (HttpURLConnection) url.openConnection();
                        connection.setRequestMethod("GET");
                        connection.setRequestProperty("Content-Type","application/x-www-form-urlencoded");
                        connection.setRequestProperty("Content-Length","" + Integer.toString(dataUrlParameters.getBytes().length));
                        connection.setRequestProperty("Content-Language", "en-US");
                        connection.setUseCaches(false);
                        connection.setDoInput(true);
                        connection.setDoOutput(true);
// Send request
                        DataOutputStream wr = new DataOutputStream(
                                connection.getOutputStream());
                        wr.writeBytes(dataUrlParameters);
                        wr.flush();
                        wr.close();
// Get Response
                        InputStream is = connection.getInputStream();
                        BufferedReader rd = new BufferedReader(new InputStreamReader(is));
                        String line;
                        StringBuffer response = new StringBuffer();
                        while ((line = rd.readLine()) != null) {
                            response.append(line);
                            response.append('\r');
                        }
                        rd.close();
                        String responseStr = response.toString();
                        Log.d("Server response",responseStr);
                        if (!responseStr.isEmpty()) {
                            final JSONObject jObject  = new JSONObject(responseStr);
                            final String requestid = jObject.getString("requestId"); // get the name from data.
                            if (!requestid.isEmpty()) {
                                mainActivityInstance.runOnUiThread(new Runnable() {
                                    public void run() {
                                        SharedPreferences settings = getSharedPreferences("com.hari.secureme", Context.MODE_PRIVATE);
                                        SharedPreferences.Editor editor = settings.edit();
                                        editor.putString("requestId", requestid);
                                        editor.commit();
                                        String message = "Request Registered!\nHelp is on its way!!!!";
                                        if (requestStatus) {
                                            try {
                                                if (jObject.getString("status") == "0") {
                                                    message = "Status : "+jObject.getString("status") + "\nTime Remaining:"+jObject.getString("timestamp");
                                                } else if (jObject.getString("status") == "0") {
                                                    message = "Status : Completed";
                                                } else {
                                                    message = "Fake Request, please avoid such things";
                                                }
                                            } catch (JSONException e) {
                                                e.printStackTrace();
                                            }
                                        }
                                        AlertDialog.Builder builder = new AlertDialog.Builder(mainActivityInstance, AlertDialog.THEME_DEVICE_DEFAULT_DARK);
                                        builder.setMessage(message)
                                                .setCancelable(false)
                                                .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                                                    public void onClick(DialogInterface dialog, int id) {
                                                        //do things
                                                    }
                                                });
                                        AlertDialog alert = builder.create();
                                        alert.show();
                                        TextView textView = (TextView) alert.findViewById(android.R.id.message);
                                        textView.setTextSize(24);
                                        Button button = alert.getButton(Dialog.BUTTON_POSITIVE);
                                        button.setTextSize(24);
                                    }
                                });
                            }
                        }
                    } catch (Exception e) {

                        e.printStackTrace();

                    } finally {

                        if (connection != null) {
                            connection.disconnect();
                        }
                    }
                }
                catch (Exception e)
                {
                    e.printStackTrace();
                }
            }
        });

        thread.start();
    }

    public void onEveClicked(View button) {
            this.sendRequest(0, false);
    }

    public void onRobberyClicked(View button) {
        this.sendRequest(1, false);
    }

    public void onAccidentClicked(View button) {
        this.sendRequest(2, false);
    }

    public void onMurderClicked(View button) {
        this.sendRequest(3, false);
    }

    public void onKidnappClicked(View button) {
        this.sendRequest(4, false);
    }

    public void onEmergencyCallClicked(View button) {
        this.sendRequest(1, true);

//        SharedPreferences settings = getSharedPreferences("com.hari.secureme", Context.MODE_PRIVATE);
//        String emergency = settings.getString("emergency", "");
//
//        if (emergency.isEmpty()) {
//            AlertDialog.Builder builder = new AlertDialog.Builder(mainActivityInstance, AlertDialog.THEME_DEVICE_DEFAULT_DARK);
//            builder.setMessage("No Emergency Contact Found!")
//                    .setCancelable(false)
//                    .setPositiveButton("OK", new DialogInterface.OnClickListener() {
//                        public void onClick(DialogInterface dialog, int id) {
//                            //do things
//                        }
//                    });
//            AlertDialog alert = builder.create();
//            alert.show();
//            TextView textView = (TextView) alert.findViewById(android.R.id.message);
//            textView.setTextSize(24);
//            Button button1 = alert.getButton(Dialog.BUTTON_POSITIVE);
//            button1.setTextSize(24);
//        } else {
//            String url = "tel:"+emergency;
//            Intent intent = new Intent(Intent.ACTION_CALL, Uri.parse(url));
//            startActivity(intent);
//        }

    }
}
