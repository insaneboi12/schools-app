import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

let values = [
    ["St. Joseph School", "Richmond Road", "Bangalore", "Karnataka", 9876543211, '', 'stj@gmail.com'],
    ["Delhi Public School", "Vasant Kunj", "New Delhi", "Delhi", 9876543212, '', 'dps@gmail.com'],
    ["Mount Carmel School", "Andheri West", "Mumbai", "Maharashtra", 9876543213, '', 'mcs@gmail.com'],
]

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
