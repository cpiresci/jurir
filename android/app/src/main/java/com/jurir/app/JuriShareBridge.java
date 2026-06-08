package com.jurir.app;
import android.content.Intent;
import android.net.Uri;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Base64;
public class JuriShareBridge {
    private final BridgeActivity activity;
    public JuriShareBridge(BridgeActivity activity) { this.activity = activity; }
    @JavascriptInterface
    public void shareImage(String base64Data, String mimeType, String filename) {
        try {
            byte[] bytes = Base64.getDecoder().decode(base64Data);
            File f = new File(activity.getCacheDir(), filename);
            try (FileOutputStream o = new FileOutputStream(f)) { o.write(bytes); }
            Uri uri = FileProvider.getUriForFile(activity, activity.getPackageName()+".fileprovider", f);
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType(mimeType); i.putExtra(Intent.EXTRA_STREAM, uri);
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            activity.startActivity(Intent.createChooser(i, "Compartilhar análise"));
        } catch (Exception e) {
            activity.runOnUiThread(() -> Toast.makeText(activity, "Erro: "+e.getMessage(), Toast.LENGTH_SHORT).show());
        }
    }
    @JavascriptInterface
    public void openExternalUrl(String url) {
        try { activity.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); }
        catch (Exception e) { activity.runOnUiThread(() -> Toast.makeText(activity, "Erro ao abrir link", Toast.LENGTH_SHORT).show()); }
    }
    @JavascriptInterface
    public void downloadPdf(String url, String filename) {
        try { Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url)); i.setType("application/pdf"); activity.startActivity(i); }
        catch (Exception e) { openExternalUrl(url); }
    }
}
