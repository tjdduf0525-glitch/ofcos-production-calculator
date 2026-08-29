package com.ofcos.productioncalculator;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import androidx.core.content.FileProvider;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView webView;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        webView = new WebView(this);
        setContentView(webView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.loadUrl("file:///android_asset/index.html");
        checkForUpdate();
    }

    private void checkForUpdate() {
        new Thread(() -> {
            try {
                URL url = new URL("https://raw.githubusercontent.com/tjdduf0525-glitch/ofcos-production-calculator/main/updates/beginner-android.json");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestProperty("Accept", "application/vnd.github+json");
                InputStream input = connection.getInputStream();
                String json = new String(input.readAllBytes());
                JSONObject release = new JSONObject(json);
                String latest = release.getString("version");
                String current = getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
                if (!latest.equals(current)) {
                    String downloadUrl = release.getString("downloadUrl");
                    runOnUiThread(() -> new AlertDialog.Builder(this)
                        .setTitle("생산계산기 업데이트")
                        .setMessage("새 버전이 있습니다. 지금 업데이트하시겠습니까?")
                        .setPositiveButton("업데이트", (d, w) -> downloadUpdate(downloadUrl))
                        .setNegativeButton("나중에", null).show());
                }
            } catch (Exception ignored) {}
        }).start();
    }

    private void downloadUpdate(String downloadUrl) {
        File apk = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "production-calculator-update.apk");
        if (apk.exists()) apk.delete();
        new Thread(() -> {
            try {
                InputStream input = new URL(downloadUrl).openStream();
                FileOutputStream output = new FileOutputStream(apk);
                input.transferTo(output);
                input.close();
                output.close();
                runOnUiThread(() -> {
                Uri uri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", apk);
                Intent install = new Intent(Intent.ACTION_VIEW).setDataAndType(uri, "application/vnd.android.package-archive").addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(install);
                });
            } catch (Exception ignored) {}
        }).start();
    }

    @Override public void onBackPressed() {
        webView.evaluateJavascript("document.getElementById('tool').classList.contains('active')", value -> {
            if ("true".equals(value)) {
                webView.evaluateJavascript("goHome()", null);
            } else {
                new AlertDialog.Builder(this)
                    .setTitle("생산계산기")
                    .setMessage("종료하시겠습니까?")
                    .setPositiveButton("예", (dialog, which) -> finish())
                    .setNegativeButton("아니오", null)
                    .show();
            }
        });
    }
}

