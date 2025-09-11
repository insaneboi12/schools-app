import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";

// Create a single database connection function
async function createDBConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            port: parseInt(process.env.DB_PORT),
            password: process.env.DB_PASSWORD,
            database: "school_db",
            ssl: {
                ca: process.env.DB_SSL_CERT
            }
        });
        return connection;
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
}

// Generate 6 digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Create Gmail transporter
function createGmailTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Your Gmail address
            pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (not regular password)
        }
    });
}

export async function POST(request) {
    let data = await request.json();
    let db;
    
    try {
        db = await createDBConnection();
        
        if (data.type === 'generate') {
            // Generate new OTP
            const otp = generateOTP();
            const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
            
            // Check if email exists and update or insert OTP
            await db.execute(
                "INSERT INTO user_otps (email, otp, expiry_time,is_used) VALUES (?, ?, ?,?) ON DUPLICATE KEY UPDATE otp = VALUES(otp), expiry_time = VALUES(expiry_time)",
                [data.email, otp, expiryTime,0]
            );

            // Send OTP via email
            const userName = data.userName || 'User';
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
                    <h2 style="color: #2563eb; text-align: center; margin-bottom: 30px;">Welcome to SchoolList!</h2>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${userName},</p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Thank you for using SchoolList. Here is your one-time authentication code:</p>
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px;">${otp}</span>
                    </div>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">This code will expire in <strong>10 minutes</strong>.</p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">If you didn't request this code, please ignore this email.</p>
                    <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
                        <p>© 2024 SchoolList. All rights reserved.</p>
                    </div>
                </div>
            `;

            // Send OTP via Gmail
            const transporter = createGmailTransporter();
            await transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: data.email,
                subject: 'Welcome to SchoolList - Your Authentication Code',
                html: emailHtml
            });
            
            return NextResponse.json({
                success: true,
                message: "OTP sent to your email"
            });
            
        } else if (data.type === 'verify') {
            let email = data.email;
            let otp = data.otp;
            let userName = data.userName;
            // Verify OTP
            const rows = await db.execute(
                "SELECT * FROM user_otps WHERE email = ? AND otp = ? AND expiry_time > NOW() AND is_used = 0",
                [email, otp]
            );
            // console.log(rows);
            
            if (rows[0].length > 0) {
                await db.execute(
                    "UPDATE user_otps SET is_used = 1 WHERE email = ? AND otp = ?",
                    [email, otp]
                );
                // Check if user already exists by email
                const existingUser = await db.execute(
                    "SELECT * FROM users WHERE email = ?",
                    [email]
                );
                
                if (existingUser[0].length === 0) {
                    // User doesn't exist, create new user
                    await db.execute(
                        "INSERT INTO users (email, userName) VALUES (?, ?)", 
                        [email, userName]
                    );
                } else {
                    // User exists, update with latest data
                    await db.execute(
                        "UPDATE users SET userName = ? WHERE email = ?",
                        [userName, email]
                    );
                }
                return NextResponse.json({
                    success: true,
                    message: "OTP verified successfully"
                });
            } else {
                return NextResponse.json({
                    success: false,
                    message: "Invalid or expired OTP"
                });
            }
        }
        
        return NextResponse.json({
            success: false,
            message: "Invalid request type"
        });
        
    } catch(error) {
        return NextResponse.json({
            success: false,
            message: error.message
        });
    } finally {
        if (db) {
            await db.end();
        }
    }
}

export async function GET() {
    let db;
    try {
        db = await createDBConnection();
        let data = await db.execute(
            "SELECT * FROM user_otps WHERE email = ? AND otp = ? AND expiry_time > NOW() AND is_used = 0",
            ["meghshamjade50@gmail.com", '973558'])
        console.log(data[0].length);
        console.log(data);
        return NextResponse.json({success: true, message: "root" });
    } catch(error) {
        return NextResponse.json({success: false, message: error.message });
    } finally {
        if (db) {
            await db.end();
        }
    }
}
