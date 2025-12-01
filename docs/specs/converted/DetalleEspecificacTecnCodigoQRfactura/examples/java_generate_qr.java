/**
 * Veri-Factu QR Code Generator - Java Example
 *
 * This class demonstrates how to generate a QR code payload and image
 * for a Veri-Factu invoice based on the specification in qr_spec.json.
 *
 * Dependencies (Maven):
 *   <dependency>
 *     <groupId>com.google.zxing</groupId>
 *     <artifactId>core</artifactId>
 *     <version>3.5.2</version>
 *   </dependency>
 *   <dependency>
 *     <groupId>com.google.zxing</groupId>
 *     <artifactId>javase</artifactId>
 *     <version>3.5.2</version>
 *   </dependency>
 *   <dependency>
 *     <groupId>com.google.code.gson</groupId>
 *     <artifactId>gson</artifactId>
 *     <version>2.10.1</version>
 *   </dependency>
 *
 * Usage:
 *   javac -cp .:gson-2.10.1.jar:core-3.5.2.jar:javase-3.5.2.jar java_generate_qr.java
 *   java -cp .:gson-2.10.1.jar:core-3.5.2.jar:javase-3.5.2.jar java_generate_qr
 *
 * @version 0.4.7
 * @see ../qr_spec.json for field definitions
 */

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DecimalFormat;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class java_generate_qr {

    private static final String DEFAULT_SEPARATOR = "|";
    private static final String DEFAULT_DATE_FORMAT = "dd-MM-yyyy";
    private static final String VERSION = "0.4.7";

    /**
     * Invoice data class
     */
    public static class Invoice {
        public String nifEmisor;
        public String numeroFactura;
        public LocalDate fechaExpedicion;
        public double importeTotal;

        public Invoice(String nifEmisor, String numeroFactura, LocalDate fechaExpedicion, double importeTotal) {
            this.nifEmisor = nifEmisor;
            this.numeroFactura = numeroFactura;
            this.fechaExpedicion = fechaExpedicion;
            this.importeTotal = importeTotal;
        }
    }

    /**
     * QR payload result class
     */
    public static class PayloadResult {
        public String payload;
        public String payloadWithoutHash;
        public String hash;
        public List<String> fields;

        public PayloadResult(String payload, String payloadWithoutHash, String hash, List<String> fields) {
            this.payload = payload;
            this.payloadWithoutHash = payloadWithoutHash;
            this.hash = hash;
            this.fields = fields;
        }
    }

    /**
     * Normalize a string value according to the specification.
     * - Trim whitespace
     * - Apply Unicode NFC normalization
     *
     * @param value The value to normalize
     * @return Normalized value
     */
    public static String normalizeValue(String value) {
        if (value == null) {
            return "";
        }
        return Normalizer.normalize(value.trim(), Normalizer.Form.NFC);
    }

    /**
     * Format a number with the specified precision.
     *
     * @param value     The numeric value
     * @param precision Decimal places (default: 2)
     * @return Formatted number string
     */
    public static String formatAmount(double value, int precision) {
        StringBuilder pattern = new StringBuilder("0.");
        for (int i = 0; i < precision; i++) {
            pattern.append("0");
        }
        DecimalFormat df = new DecimalFormat(pattern.toString());
        return df.format(value);
    }

    /**
     * Format a date according to the specification.
     *
     * @param date   The date to format
     * @param format Date format pattern
     * @return Formatted date string
     */
    public static String formatDate(LocalDate date, String format) {
        String pattern = format.equals("YYYY-MM-DD") ? "yyyy-MM-dd" : "dd-MM-yyyy";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        return date.format(formatter);
    }

    /**
     * Compute the SHA-256 hash of the payload.
     *
     * @param payload  The payload to hash
     * @param encoding Output encoding: "base64", "base64url", or "hex"
     * @return Encoded hash string
     */
    public static String computeHash(String payload, String encoding) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(payload.getBytes(StandardCharsets.UTF_8));

            switch (encoding.toLowerCase()) {
                case "hex":
                    StringBuilder hexString = new StringBuilder();
                    for (byte b : hashBytes) {
                        String hex = Integer.toHexString(0xff & b);
                        if (hex.length() == 1) {
                            hexString.append('0');
                        }
                        hexString.append(hex);
                    }
                    return hexString.toString();

                case "base64url":
                    return Base64.getUrlEncoder().withoutPadding().encodeToString(hashBytes);

                case "base64":
                default:
                    return Base64.getEncoder().encodeToString(hashBytes);
            }
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Build the QR code payload from invoice data.
     *
     * @param invoice   Invoice data
     * @param separator Field separator
     * @return PayloadResult containing payload and hash
     */
    public static PayloadResult buildPayload(Invoice invoice, String separator) {
        List<String> fields = new ArrayList<>();

        // Add fields in order
        fields.add(normalizeValue(invoice.nifEmisor));
        fields.add(normalizeValue(invoice.numeroFactura));
        fields.add(formatDate(invoice.fechaExpedicion, DEFAULT_DATE_FORMAT));
        fields.add(formatAmount(invoice.importeTotal, 2));

        // Build payload without hash
        String payloadWithoutHash = String.join(separator, fields);

        // Compute hash
        String hash = computeHash(payloadWithoutHash, "base64");

        // Final payload with hash
        String finalPayload = payloadWithoutHash + separator + hash;

        return new PayloadResult(finalPayload, payloadWithoutHash, hash, fields);
    }

    /**
     * Generate QR code image from payload.
     * Note: Requires ZXing library (com.google.zxing)
     *
     * To enable QR generation, add these Maven dependencies:
     *   - com.google.zxing:core:3.5.2
     *   - com.google.zxing:javase:3.5.2
     *
     * And add these imports at the top of the file:
     *   import com.google.zxing.BarcodeFormat;
     *   import com.google.zxing.client.j2se.MatrixToImageWriter;
     *   import com.google.zxing.common.BitMatrix;
     *   import com.google.zxing.qrcode.QRCodeWriter;
     *
     * @param payload    QR code payload
     * @param outputPath Output file path
     * @param width      Image width
     * @param height     Image height
     */
    public static void generateQRImage(String payload, String outputPath, int width, int height) {
        System.out.println("\nNote: QR image generation requires ZXing library.");
        System.out.println("Add the following Maven dependencies:");
        System.out.println("  - com.google.zxing:core:3.5.2");
        System.out.println("  - com.google.zxing:javase:3.5.2");
        System.out.println("\nThen add the following imports at the top of the file:");
        System.out.println("  import com.google.zxing.BarcodeFormat;");
        System.out.println("  import com.google.zxing.client.j2se.MatrixToImageWriter;");
        System.out.println("  import com.google.zxing.common.BitMatrix;");
        System.out.println("  import com.google.zxing.qrcode.QRCodeWriter;");
        System.out.println("\nExample code to generate QR image:");
        System.out.println("  QRCodeWriter qrWriter = new QRCodeWriter();");
        System.out.println("  BitMatrix bitMatrix = qrWriter.encode(payload, BarcodeFormat.QR_CODE, width, height);");
        System.out.println("  Path path = Paths.get(outputPath);");
        System.out.println("  MatrixToImageWriter.writeToPath(bitMatrix, \"PNG\", path);");

        // Uncomment to enable QR generation with ZXing:
        // (add imports at the top of the file and ZXing dependencies)
        /*
        QRCodeWriter qrWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrWriter.encode(payload, BarcodeFormat.QR_CODE, width, height);
        Path path = Paths.get(outputPath);
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", path);
        System.out.println("\nQR Code image saved to: " + outputPath);
        */
    }

    /**
     * Main example method
     */
    public static void main(String[] args) {
        System.out.println("=== Veri-Factu QR Code Generator (Java) ===\n");
        System.out.println("Specification version: " + VERSION);

        // Sample invoice data
        Invoice invoice = new Invoice(
            "B12345678",
            "2024/001234",
            LocalDate.of(2024, 12, 1),
            1210.50
        );

        System.out.println("\nInvoice Data:");
        System.out.println("  NIF Emisor: " + invoice.nifEmisor);
        System.out.println("  Número Factura: " + invoice.numeroFactura);
        System.out.println("  Fecha Expedición: " + invoice.fechaExpedicion);
        System.out.println("  Importe Total: " + invoice.importeTotal);

        // Build payload
        PayloadResult result = buildPayload(invoice, DEFAULT_SEPARATOR);

        System.out.println("\nGenerated Payload:");
        System.out.println("  Fields: " + String.join(" | ", result.fields));
        System.out.println("  Hash: " + result.hash);
        System.out.println("  Full Payload: " + result.payload);

        // Generate QR image (requires ZXing)
        String outputPath = "output_qr.png";
        generateQRImage(result.payload, outputPath, 200, 200);

        System.out.println("\n=== Done ===");
    }
}
