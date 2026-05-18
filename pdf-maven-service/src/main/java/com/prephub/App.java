package com.prephub;

import io.javalin.Javalin;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.jsoup.Jsoup;
import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;

public class App {
    public static void main(String[] args) {
        System.out.println("Starting PDF Generation Microservice on port 8080...");
        
        Javalin app = Javalin.create().start(8080);

        // Simple health check endpoint
        app.get("/", ctx -> ctx.result("PDF Generation Microservice is running!"));

        // Endpoint to generate PDF from HTML
        app.post("/generate-pdf", ctx -> {
            try {
                // The Node.js backend will send the raw HTML string as the body
                String htmlContent = ctx.body();
                
                if (htmlContent == null || htmlContent.trim().isEmpty()) {
                    ctx.status(400).result("Error: HTML body cannot be empty");
                    return;
                }
                
                // Parse and clean HTML using Jsoup to ensure well-formed XHTML
                org.jsoup.nodes.Document doc = Jsoup.parse(htmlContent, "UTF-8");
                doc.outputSettings().syntax(org.jsoup.nodes.Document.OutputSettings.Syntax.xml);
                String xhtmlContent = doc.html();
                
                // Output stream to hold the generated PDF
                ByteArrayOutputStream os = new ByteArrayOutputStream();
                
                // Build the PDF using OpenHTMLtoPDF
                PdfRendererBuilder builder = new PdfRendererBuilder();
                builder.useFastMode();
                builder.withHtmlContent(xhtmlContent, "/"); // "/" is the base URI
                builder.toStream(os);
                builder.run();
                
                // Convert to byte array
                byte[] pdfBytes = os.toByteArray();
                
                // Send the PDF back in the HTTP response
                ctx.contentType("application/pdf");
                ctx.header("Content-Disposition", "attachment; filename=\"resume.pdf\"");
                ctx.result(new ByteArrayInputStream(pdfBytes));
                
                System.out.println("Successfully generated and sent PDF (" + pdfBytes.length + " bytes)");
                
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Error generating PDF: " + e.getMessage());
            }
        });
    }
}
