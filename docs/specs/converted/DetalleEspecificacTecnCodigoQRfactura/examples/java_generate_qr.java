// Java example using ZXing to generate QR code and MessageDigest for SHA-256
// Requires ZXing core and javase on the classpath
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.Base64;

public class GenerateInvoiceQR {
    public static String sha256Base64(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] digest = md.digest(input.getBytes("UTF-8"));
        return Base64.getEncoder().encodeToString(digest);
    }
    public static String buildPayload(String version, String nif, String invoice, String date, String amount, String currency) throws Exception {
        String clear = String.join("|", version, nif, invoice, date, amount, currency);
        String hash = sha256Base64(clear);
        return String.join("|", version, nif, invoice, date, amount, currency, hash);
    }
    public static void generateQRImage(String data, String filePath, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, width, height);
        Path path = FileSystems.getDefault().getPath(filePath);
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", path);
    }
    public static void main(String[] args) throws Exception {
        String payload = buildPayload("0.4.7","B12345678","FAC-2025-0001","2025-11-30","1234.56","EUR");
        System.out.println("Payload: " + payload);
        generateQRImage(payload, "invoice_qr.png", 300, 300);
    }
}