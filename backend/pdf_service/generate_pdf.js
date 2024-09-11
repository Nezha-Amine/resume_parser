const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const htmlToDocx = require('html-to-docx')

const app = express();
app.use(express.json({ limit: '50mb' }));  // Adjust limit as needed

app.post("/generate-pdf", async (req, res) => {
  try {
    const { htmlContent, format, file_path_original }  = req.body;

    if (!htmlContent) {
      return res.status(400).json({ error: "No HTML content provided" });
    }

    


    // Dynamically import the base64 data
    const { cache } = await import("../../frontend/src/cache-base64.js");
    const { logoNetsense } = await import("../../frontend/src/logo-netsense-base64.js");
    const { logolink4u } = await import("../../frontend/src/link4u-base64.js");
    let logoSrc = logoNetsense;
    if (format == 'link4u'){
      logoSrc = logolink4u ;
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(60000);

    // Set the content of the page
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Define header template
    const headerTemplate = `
      <div style="
            width: 90%;
            text-align: center;
            font-family: Arial, sans-serif;
            position: fixed;
            top: -15px;
            left: 0px;
            right: 0px;
            height: 130px; /* Increased header height */
            background-color: #fff;
            box-sizing: border-box;
            margin-right : 5%;
            margin-left:5%;
          ">
        <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              height: 100%;
            ">
          <img src="${cache}" alt="cache logo" style="
                height: 70px; 
                width: auto; 
                background-size: contain; 
                background-repeat: no-repeat;" />
          <img src="${logoSrc}" alt="logo" style="
                height: 60px; 
                width: auto; 
                background-size: contain; 
                background-repeat: no-repeat;" />
        </div>
      </div>
    `;

    // Define footer template
    const footerTemplate = `
      <div style="
            font-size: 12px;
            width: 100%;
            text-align: center;
            padding: 10px;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px; /* Increased footer height */
            background-color: #fff;
            box-sizing: border-box;
          ">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    `;

    // Generate the PDF with header and footer
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerTemplate,
      footerTemplate: footerTemplate,
      margin: {
        top: '135px',   // Adjusted to accommodate increased header height
        bottom: '70px', // Adjusted to accommodate increased footer height
        left: '0px',
        right: '0px'
      },
      scale: 1,
      deviceScaleFactor: 2
    });



    const fileNameWithoutExtension = path.basename(file_path_original, path.extname(file_path_original));
    await browser.close();
    // Output directory and file path
    const outputDir = path.join(__dirname, "generated");
    const pdfPath = path.join(outputDir, `${fileNameWithoutExtension}.pdf`);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(pdfPath, pdfBuffer);
    // fs.writeFileSync(wordPath, docxBlob);


    res.json({ pdf_path: pdfPath });


  } catch (error) {
    console.error("Error generating PDF:", error.message ? error.message : error);
    res.status(500).json({ error: "Failed to generate PDF", details: error.message });
  }
});

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Node.js PDF service running on port ${port}`);
});
