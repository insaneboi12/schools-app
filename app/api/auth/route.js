import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

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
            
            // Encrypt the OTP using bcrypt
            const saltRounds = 10;
            const encryptedOTP = await bcrypt.hash(otp.toString(), saltRounds);
            
            // Check if email exists and update or insert OTP
            await db.execute(
                "INSERT INTO user_otps (email, otp, expiry_time,is_used) VALUES (?, ?, ?,?) ON DUPLICATE KEY UPDATE otp = VALUES(otp), expiry_time = VALUES(expiry_time)",
                [data.email, encryptedOTP, expiryTime,0]
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
                subject: 'Welcome to SchoolList - Your Authentication Code is - '+otp+' expires by '+dayjs(expiryTime).tz("Asia/Kolkata").format("HH:mm"),
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
            
            // Get the encrypted OTP from database
            const rows = await db.execute(
                "SELECT * FROM user_otps WHERE email = ? AND expiry_time > NOW() AND is_used = 0",
                [email]
            );
            
            if (rows[0].length > 0) {
                const storedEncryptedOTP = rows[0][0].otp;
                
                // Compare the provided OTP with the encrypted OTP using bcrypt
                const isOTPValid = await bcrypt.compare(otp.toString(), storedEncryptedOTP);
                
                if (isOTPValid) {
                    await db.execute(
                        "UPDATE user_otps SET is_used = 1 WHERE email = ? AND otp = ?",
                        [email, storedEncryptedOTP]
                    );
                    // Check if user already exists by email
                    const existingUser = await db.execute(
                        "SELECT * FROM users WHERE email = ?",
                        [email]
                    );
                    
                    if (existingUser[0].length === 0) {
                        // User doesn't exist, create new user
                        await db.execute(
                            "INSERT INTO users (email, userName,isAuth) VALUES (?, ?,?)", 
                            [email, userName,1]
                        );
                    } else {
                        let userId = existingUser[0][0].id;
                        // User exists, update with latest data
                        await db.execute(
                            "UPDATE users SET userName = ?, isAuth = 1 WHERE id = ?",
                            [userName, userId]
                        );
                    }
                    return NextResponse.json({
                        success: true,
                        message: "OTP verified successfully"
                    });
                } else {
                    return NextResponse.json({
                        success: false,
                        message: "Invalid OTP"
                    });
                }
            } else {
                return NextResponse.json({
                    success: false,
                    message: "Invalid or expired OTP"
                });
            }
        }else if(data.type === 'logout'){
            let user = await db.execute(
                "SELECT * FROM users WHERE email = ?",
                [data.email]
            );
            if(user[0].length === 0){
                return NextResponse.json({
                    success: false,
                    message: "User not found"
                });
            }
            let userId = user[0][0].id;
            await db.execute(
                "UPDATE users SET isAuth = 0 WHERE id = ?",
                [userId]
            );
            return NextResponse.json({
                success: true,
                message: "Logged out successfully"
            });
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

export async function GET(request) {
    let db;
    try {
        db = await createDBConnection();
        
        // Get email from query parameters
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        
        if (!email) {
            return NextResponse.json({
                success: false, 
                message: "Email parameter is required" 
            });
        }
        
        // Retrieve user by email
        let data = await db.execute(
            "SELECT userName, email, isAuth FROM users WHERE email = ?",
            [email]
        );
        
        if (data[0].length === 0) {
            return NextResponse.json({
                success: false, 
                message: "User not found" 
            });
        }
        
        const user = data[0][0];
        return NextResponse.json({
            success: true, 
            user: {
                userName: user.userName,
                email: user.email,
                isAuth: user.isAuth
            }
        });
    } catch(error) {
        return NextResponse.json({success: false, message: error.message });
    } finally {
        if (db) {
            await db.end();
        }
    }
}
