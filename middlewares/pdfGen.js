// import PDFDocument from 'pdfkit';
// import fs from 'fs';
// import path from 'path';
// import { getConnection } from "../dbConnect.js";


import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { getConnection } from "../dbConnect.js";



export function generateStudentReport(req, res) {
    // Create directory if it doesn't exist
    const pdfDir = './reports';
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir);
    }

    // Generate completely mock data
    const student = {
        name: "Emily Johnson",
        grade_level: "8",
        homeroom: "Room 203",
        teacher_name: "Mr. Rodriguez",
        student_id: "STU-2023-8472"
    };

    const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
            Title: `Annual Report - ${student.name}`,
            Author: 'Greenwood High School',
            Subject: 'Academic Progress Report'
        }
    });

    const fileName = `report-${student.name.replace(' ', '-')}-${new Date().getFullYear()}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    // Mock academic data
    const subjects = [
        { name: 'Mathematics', grade: 'A', comment: 'Excellent problem-solving skills.' },
        { name: 'English Literature', grade: 'B+', comment: 'Strong analytical writing.' },
        { name: 'Science', grade: 'A-', comment: 'Very engaged in experiments.' },
        { name: 'History', grade: 'B', comment: 'Good participation in discussions.' },
        { name: 'Physical Education', grade: 'A', comment: 'Outstanding performance in team sports.' },
        { name: 'Art', grade: 'A', comment: 'Exceptional creativity shown in portfolio.' },
        { name: 'Music', grade: 'B+', comment: 'Good progress with violin.' }
    ];

    const attendance = {
        present: 172,
        absent: 3,
        tardy: 2,
        perfectMonths: ['September', 'November', 'March']
    };

    const overallComment = `${student.name} has had an excellent academic year, showing particular 
    strength in analytical subjects. They participate well in class discussions and have shown 
    consistent improvement throughout the year. ${student.name} works well independently and 
    collaborates effectively in group projects.`;

    // Create write stream
    const fileStream = fs.createWriteStream(filePath);
    doc.pipe(fileStream);

    const buffers = [];
    doc.on('data', chunks => buffers.push(chunks));
    doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(pdfBuffer);
    });

    // --------------------------
    // REPORT CONTENT STARTS HERE
    // --------------------------

    // School Header with blue background
    doc.rect(0, 0, 612, 80).fill('#1155cc');
    doc.fillColor('#ffffff')
        .fontSize(20)
        .text('GREENWOOD HIGH SCHOOL', 0, 30, { align: 'center' });
    doc.fontSize(14)
        .text('ACADEMIC PROGRESS REPORT', 0, 55, { align: 'center' });

    // Reset styles
    doc.fillColor('#000000').font('Helvetica');

    // Student Information Box
    doc.rect(50, 100, 512, 80).stroke('#dddddd').fill('#f8f8f8');
    doc.fillColor('#1155cc')
        .fontSize(16)
        .text('STUDENT INFORMATION', 60, 110);

    doc.fillColor('#000000')
        .fontSize(10)
        .text(`Name: ${student.name}`, 60, 135)
        .text(`Grade: ${student.grade_level}`, 250, 135)
        .text(`Student ID: ${student.student_id}`, 400, 135)
        .text(`Homeroom: ${student.homeroom}`, 60, 155)
        .text(`Teacher: ${student.teacher_name}`, 250, 155)
        .text(`Year: ${new Date().getFullYear()-1}-${new Date().getFullYear()}`, 400, 155);

    // Academic Performance Section
    doc.moveTo(50, 200).lineTo(562, 200).stroke('#aaaaaa');
    doc.fillColor('#1155cc')
        .fontSize(16)
        .text('ACADEMIC PERFORMANCE', 50, 210)
        .fillColor('#000000');

    // Subjects table header
    const tableTop = 240;
    doc.font('Helvetica-Bold')
        .text('Subject', 50, tableTop)
        .text('Grade', 150, tableTop, { width: 100, align: 'center' })
        .text('Teacher Comments', 350, tableTop)
        .font('Helvetica');

    // Subjects rows with alternating background
    let currentY = tableTop + 25;
    subjects.forEach((subject, i) => {
        if (i % 2 === 0) {
            doc.rect(50, currentY - 5, 512, 25).fill('#f5f5f5');
        }

        doc.fillColor('#000000')
            .fontSize(10)
            .text(subject.name, 50, currentY)
            .fillColor(subject.grade.includes('A') ? '#009933' :
                subject.grade.includes('B') ? '#0066cc' : '#cc0000')
            .text(subject.grade, 150, currentY, { width: 100, align: 'center' })
            .fillColor('#000000')
            .text(subject.comment, 350, currentY, { width: 150 });

        currentY += 25;
    });

    // Attendance Section (on new page if needed)
    if (currentY > 650) doc.addPage();
    doc.moveTo(50, currentY + 20).lineTo(562, currentY + 20).stroke('#aaaaaa');
    doc.fillColor('#1155cc')
        .fontSize(16)
        .text('ATTENDANCE RECORD', 50, currentY + 30)
        .fillColor('#000000');

    doc.fontSize(12)
        .text(`▪ Days Present: ${attendance.present}`, 50, currentY + 60)
        .text(`▪ Days Absent: ${attendance.absent}`, 50, currentY + 80)
        .text(`▪ Days Tardy: ${attendance.tardy}`, 50, currentY + 100)
        .text(`▪ Perfect Attendance Months: ${attendance.perfectMonths.join(', ')}`, 50, currentY + 120);

    // Overall Comments
    if (currentY > 500) doc.addPage();
    doc.moveTo(50, doc.y + 20).lineTo(562, doc.y + 20).stroke('#aaaaaa');
    doc.fillColor('#1155cc')
        .fontSize(16)
        .text('OVERALL COMMENTS', 50, doc.y + 30)
        .fillColor('#000000');

    doc.fontSize(12)
        .text(overallComment, {
            align: 'justify',
            indent: 10,
            columns: 2,
            columnGap: 20,
            height: 150,
            width: 500
        });

    // Signature lines
    doc.moveDown(2);
    doc.text('__________________________', 100, doc.y, { width: 200 })
        .text(student.teacher_name, 100, doc.y + 20, { width: 200, align: 'center' })
        .text('Homeroom Teacher', 100, doc.y + 40, { width: 200, align: 'center' })
        .text('__________________________', 350, doc.y - 40, { width: 200 })
        .text('Dr. Sarah Williams', 350, doc.y - 20, { width: 200, align: 'center' })
        .text('School Principal', 350, doc.y, { width: 200, align: 'center' });

    // Footer
    doc.fontSize(10)
        .text('© ' + new Date().getFullYear() + ' Greenwood High School • 123 Education Blvd • (555) 123-4567', { align: 'center' });

    doc.end();
}


export function generateTaskPdf(req, res) {
    const { user } = req.body;

    // Create a directory for PDFs if it doesn't exist
    const pdfDir = './pdfs';
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir);
    }

    getConnection((db) => {
        db.query(
            `SELECT * FROM TASKS WHERE user_id = ?`,
            [user],
            (err, result) => {
                db.detach();

                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!result || result.length === 0) {
                    return res.status(404).json({ error: 'No tasks found' });
                }

                const doc = new PDFDocument();
                const fileName = `tasks-${user}-${Date.now()}.pdf`;
                const filePath = path.join(pdfDir, fileName);

                // Create a write stream to save the file
                const fileStream = fs.createWriteStream(filePath);
                doc.pipe(fileStream);

                // Buffer the PDF content
                const buffers = [];
                doc.on('data', chunks => buffers.push(chunks));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(buffers);

                    // Set response headers
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

                    // Send the PDF buffer
                    res.send(pdfBuffer);

                    console.log(`PDF saved to ${filePath} and sent to client`);
                });

                // Add PDF content
                doc.fontSize(20).text(`Task Report for User ${user}`, { align: 'center', underline: true });
                doc.moveDown();

                result.forEach((task, index) => {
                    doc.fontSize(14).text(`Task #${index + 1}`);
                    doc.text(`Name: ${task.NAME}`);
                    doc.text(`Description: ${task.DESCRIPTION}`);
                    doc.text(`Priority: ${task.PRIORITY}`);
                    doc.text(`Due Date: ${task.DUE_DATE}`);
                    doc.text(`Status: ${task.STATUS}`);
                    doc.moveDown();
                });

                doc.end();
            }
        );
    });
}