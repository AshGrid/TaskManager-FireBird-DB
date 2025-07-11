import puppeteer from "puppeteer";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

// Configuration constants
const PDF_DIR = './reports';
const TEMPLATE_DIR = '../pdfs';
const DEFAULT_PDF_OPTIONS = {
    format: 'A4',
    printBackground: true,
    margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
    }
};

// Mock data for the report card
const mockReportData = {
    // School information
    schoolname: "Future Christian Academy",
    schooladdress: "123 Education Way",
    schoolcsz: "Learningville, CA 90210",
    schoolphone: "(555) 123-4567",
    schoolwebpage: "www.futurechristian.edu",

    // Student information
    stu_fullname: "Alexandra Marie Johnson",
    Stu_GradeLevel: "10",
    stu_address: "456 Scholar Lane",
    stu_csz: "Academic City, CA 90211",
    stu_id: "STU2023001",
    stu_firstname: "Alexandra",
    stu_nextGradeLevel: "11",
    Stu_NextStatus: "Active",

    // Academic year
    yearname: "2023-2024 Academic Year",

    // Class/grades data (array of classes)
    RC_Class_Line: 2,
    classes: [
        {
            rc_ClassName: "English Literature",
            rc_Classgrade1: "A",
            rc_Classgrade2: "A-",
            rc_Classgrade3: "B+",
            rc_Classgrade4: "",
            rc_ClassFinalavg: "A-",
            rc_Instructor: "Mr. James Wilson",
            rc_ClassComment: "Excellent analytical skills. Could participate more in class discussions.",
            rc_Credit: "1.0"
        },
        {
            rc_ClassName: "Algebra II",
            rc_Classgrade1: "B+",
            rc_Classgrade2: "A-",
            rc_Classgrade3: "A",
            rc_Classgrade4: "",
            rc_ClassFinalavg: "A-",
            rc_Instructor: "Ms. Sarah Chen",
            rc_ClassComment: "Shows great improvement in problem-solving. Consistently completes assignments.",
            rc_Credit: "1.0"
        },
        // Add more classes as needed...
    ],

    // Term averages and GPAs
    rc_TotalTerm1AVG_2: "3.67",
    rc_TotalTerm2AVG_2: "3.83",
    rc_TotalTerm3AVG_2: "3.92",
    rc_TotalTerm4AVG_2: "",
    rc_TotalfinalAVG_2: "3.81",
    rc_Totalterm1GPA_3: "3.7",
    rc_Totalterm2GPA_3: "3.8",
    rc_Totalterm3GPA_3: "3.9",
    rc_Totalterm4GPA_3: "",
    rc_TotalFinalGPA_3: "3.8",

    // Attendance data
    HR_Present_YTD: "135",
    HR_Present: ["45", "45", "45", ""],
    HR_AE: ["2", "1", "0", ""],
    HR_AE_YTD: "3",
    HR_AU: ["0", "0", "0", ""],
    HR_AU_YTD: "0",
    HR_TE: ["1", "2", "1", ""],
    HR_TE_YTD: "4",
    HR_TU: ["0", "1", "0", ""],
    HR_TU_YTD: "1",

    // Transcript data
    trans_totalgpa3: "3.75",
    trans_totalavg2: "88.6",
    hsonly: "High School ",

    // Class rank
    Rank_rank: "15 of 120"
};

/**
 * Inject mock data into HTML template
 * @param {string} htmlContent - The HTML template content
 * @param {object} data - The mock data to inject
 * @returns {string} - HTML with injected data
 */
function injectMockData(htmlContent, data) {
    // First handle the class loop separately to avoid nested replacements
    const classLoopStart = '{Start Class Loop}';
    const classLoopEnd = '{End Class Loop}';
    const loopStartIndex = htmlContent.indexOf(classLoopStart);
    const loopEndIndex = htmlContent.indexOf(classLoopEnd);

    let processedHtml = htmlContent;

    if (loopStartIndex !== -1 && loopEndIndex !== -1 && data.classes) {
        const beforeLoop = processedHtml.substring(0, loopStartIndex);
        const loopContent = processedHtml.substring(
            loopStartIndex + classLoopStart.length,
            loopEndIndex
        );
        const afterLoop = processedHtml.substring(loopEndIndex + classLoopEnd.length);

        let renderedClasses = '';
        data.classes.forEach(cls => {
            let classHtml = loopContent;
            // Replace variables within each class
            classHtml = replaceTemplateVars(classHtml, cls);
            renderedClasses += classHtml;
        });

        processedHtml = beforeLoop + renderedClasses + afterLoop;
    }

    // Now replace all other variables in the main template
    processedHtml = replaceTemplateVars(processedHtml, data);

    return processedHtml;
}

function replaceTemplateVars(content, data) {
    // This regex matches template variables but avoids CSS content
    return content.replace(/\{([^{}]+)\}(?![^{]*})/g, (match, token) => {
        // Handle array index notation like HR_Present[1]
        if (token.includes('[')) {
            const match = token.match(/^(\w+)\[(\d+)]$/);
            if (match) {
                const [, arrayName, indexStr] = match;
                const array = data[arrayName];
                const index = parseInt(indexStr, 10) - 1; // Convert to 0-based index
                return Array.isArray(array) && array[index] !== undefined ? array[index] : '';
            }
        }

        // Handle conditionals - leave them as is for now
        if (token.startsWith('if condition=') ||
            token.startsWith('else if condition=') ||
            token === 'end if' ||
            token === 'Start Class Loop' ||
            token === 'End Class Loop') {
            return match; // Leave the original token
        }

        // Default key replacement
        return data[token] !== undefined ? data[token] : match;
    });
}

/**
 * Generate a PDF from an HTML template with mock data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} options - Additional options
 * @param {String} options.templateName - Name of the HTML template file
 * @param {Object} options.pdfOptions - Custom PDF options
 * @param {Object} options.mockData - Custom mock data to use
 * @returns {Promise<void>}
 */
export async function generatePDF(req, res, options = {}) {
    try {
        // Set up directories
        ensureDirectoryExists(PDF_DIR);

        // Get file paths
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const templatePath = path.resolve(__dirname, `${TEMPLATE_DIR}/${options.templateName || 'report.html'}`);

        // Read the template
        const htmlContent = fs.readFileSync(templatePath, 'utf8');

        // Inject mock data
        const dataToUse = options.mockData || mockReportData;
        const htmlWithData = injectMockData(htmlContent, dataToUse);

        // Generate unique filename
        const timestamp = new Date().getTime();
        const fileName = `report-${timestamp}`;
        const filePath = path.join(PDF_DIR, fileName);

        // Launch browser and create page
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 1600 });

        // Set the HTML content directly with injected data
        await page.setContent(htmlWithData, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Generate PDF with merged options
        const pdfOptions = { ...DEFAULT_PDF_OPTIONS, ...options.pdfOptions };
        await page.pdf({
            path: `${filePath}.pdf`,
            ...pdfOptions
        });

        await browser.close();

        // Return success response with file info
        res.status(200).json({
            success: true,
            message: "PDF generated successfully",
            filename: `${fileName}.pdf`,
            path: `${filePath}.pdf`,
            timestamp
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            success: false,
            message: "Failed to generate PDF",
            error: error.message
        });
    }
}

/**
 * Ensure a directory exists, create if it doesn't
 * @param {String} dirPath - Directory path
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Legacy function for backward compatibility
export async function puppetPdf(req, res) {
    return generatePDF(req, res);
}