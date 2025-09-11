import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

let values = [
    ["St. Joseph School", "Richmond Road", "Bangalore", "Karnataka", 9876543211, '', 'stj@gmail.com'],
    ["Delhi Public School", "Vasant Kunj", "New Delhi", "Delhi", 9876543212, '', 'dps@gmail.com'],
    ["Mount Carmel School", "Andheri West", "Mumbai", "Maharashtra", 9876543213, '', 'mcs@gmail.com'],
]

// Create a single database connection function
async function createDBConnection() {
    let DB_SSL_CERT = '-----BEGIN CERTIFICATE-----\nMIIEUDCCArigAwIBAgIUc5D242sHj0jjVVcMDAezLrA8qPUwDQYJKoZIhvcNAQEM\nBQAwQDE+MDwGA1UEAww1OTNhNDczMWItMTY4NS00YjYyLWJlY2YtZDFkNDg1OGI1\nZmZlIEdFTiAxIFByb2plY3QgQ0EwHhcNMjUwOTAxMTM0OTEzWhcNMzUwODMwMTM0\nOTEzWjBAMT4wPAYDVQQDDDU5M2E0NzMxYi0xNjg1LTRiNjItYmVjZi1kMWQ0ODU4\nYjVmZmUgR0VOIDEgUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC\nAYoCggGBALg6q22LRjn5sQvXOzlkfhi7XsAEoFL3LA/xymXS0BfG8YfFItwkKauJ\nftVRDRA9YcQRbVyF4TsdMH35ttpQRyaLmhdGJ2z4cB6D46bd74i/DSThFBBV2zBQ\nS3hnVoAeOnC17Z410uatVu7vH9sp3D02X8zsIp5A7nfmCuwQ7/z1YSLf0PWFQY04\nZ3Mm7zCCp1Wm7sAs+lOU2Mx9Lrrvw3/NatQ5Yi0Zs5X223ZfvBzoTZBAJxq1T+gN\niMENJM8rETrKqsjEqPTVxoSmb587D2G09k3apZ880eVFf6ds184ZvWqVjruPU9Fo\nl4l7jzdbOrbHePz/KvVWSXO884laNxr5HX3Px6zRFSFq4AaTfOY0VCgBLfRfwa5y\nnkbL9pMf6mnTnqUhz58DBIpxpJb1Bnt/XHEwELrzCrTNQydrJ6IEUubujny3ucAL\nAeL51bY8znKaMruXyN/ZwkMlcEV/sv0hMaHDWMFFKilzWiLXVU7cGfBGjHhd7Ark\nL/EtyCBrjwIDAQABo0IwQDAdBgNVHQ4EFgQUSL4BjmD7LZTycwe6y+RpRidNwvAw\nEgYDVR0TAQH/BAgwBgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQAD\nggGBABipgs9m7QEm3LIHoDmfLLgiPa3W5yI4oT/aDtP33p41fOJ0JzqW4D6oT26A\nIq2UB8g7bQOj1jpl1MXxPJ0nb1Gq0QYfwbCamXKXUBREFMg18e/N07KmD31xbqrh\nqJFUZICrf2F5XhlqFRE+ACAUkGsWzrePhdUxxrgyRcqTS4D/gQ83OTdQ5wFXSrQ5\nuMZFIzoSSIIAP/PesiQ04A1j6G2mjUmNVb4W7ryBP675zt/NncsxgMjRnV5e6ZrO\nfHdTUg2L12Ux4AN8oCgmcEwAbCrgsB7tNosfmvXQ8CWPwlbcyUFZv6YcUDCLe0ZW\nBtR2ufu63enuuvd5n4B8KTnfoE7mHqtedhn3/yVJ9D6J6DUUYUL3KsHq/dNsSYzU\nfJLEWst7DDonaOsZbAKFvDICerHABUT1+cQsDyBBHiLc3lklckXsWow6LqGmIXW3\nwhGyxOcDuzWcrnkYAeiVnVetV9ssmBOiX+ZPMAIlDt2nK/PjOXAfWllsfvmRE7+b\nmf0YqQ==\n-----END CERTIFICATE-----'
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            port: parseInt(process.env.DB_PORT),
            password: process.env.DB_PASSWORD,
            database: "school_db",
            ssl: {
                ca: DB_SSL_CERT
            }
        });
        return connection;
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
}

export async function POST(request) {
    let data = await request.json();
    let db;
    
    try {
        db = await createDBConnection();
        let dataA = await db.execute("INSERT INTO schools (name,address,city,state,contact,image,email_id) VALUES (?, ?, ?, ?, ?, ?, ?)", [data.name, data.address, data.city, data.state, data.contact, data.image, data.email]);
        return NextResponse.json({success: true, message: "School added successfully" });
    } catch(error) {
        return NextResponse.json({success: false, message: error.message });
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
        let data = await db.execute("SELECT * FROM schools");
        
        if(data[0].length <= 0) {
            let dataA = await db.query("INSERT INTO schools (name,address,city,state,contact,image,email_id) VALUES ?", [values]);
        }
        
        data = await db.execute("SELECT * FROM schools");
        return NextResponse.json({success: true, schools: data[0] });
    } catch(error) {
        return NextResponse.json({success: false, message: error.message });
    } finally {
        if (db) {
            await db.end();
        }
    }
}

export async function DELETE(request) {
    let data = await request.json();
    let db;
    
    try {
        db = await createDBConnection();
        let dataA = await db.execute("DELETE FROM schools WHERE id=?", [data.id]);
        return NextResponse.json({success: true, message: "School deleted successfully" });
    } catch(error) {
        return NextResponse.json({success: false, message: error.message });
    } finally {
        if (db) {
            await db.end();
        }
    }
}
