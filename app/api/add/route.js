import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import fs from "fs";

const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: parseInt(process.env.DB_PORT),
    password: process.env.DB_PASSWORD,
    database: "school_db",
    ssl: {
        ca: fs.readFileSync(process.cwd() + '/public/ca.pem')  
      }
});
// console.log("dirName", process.cwd());

// db.execute("CREATE DATABASE IF NOT EXISTS school_db");

// create table - 
// await db.execute("CREATE TABLE schools (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100) NOT NULL,address TEXT,city VARCHAR(50),state VARCHAR(50),contact BIGINT NOT NULL UNIQUE,image TEXT,email_id VARCHAR(150) UNIQUE)");

// insert data - 
// This way not recommended because we are not using any prepared statement or any other security features to prevent SQL injection
// await db.execute("INSERT INTO schools (name,address,city,state,contact,image,email_id) VALUES ('Vidyaranyapura school','Malleshwaram','Bangalore','Karnataka',9876543210,'image.jpg','vrs@gmail.com')");

// Recommended way to insert data - 
// await db.execute("INSERT INTO schools (name,address,city,state,contact,image,email_id) VALUES (?, ?, ?, ?, ?, ?, ?)", ["Vidyaranyapura school", "Malleshwaram", "Bangalore", "Karnataka", 9876543210, 'image.jpg', 'vrs@gmail.com']);

// Multiple data insertion - 
let values = [
    ["St. Joseph School", "Richmond Road", "Bangalore", "Karnataka", 9876543211, '', 'stj@gmail.com'],
    ["Delhi Public School", "Vasant Kunj", "New Delhi", "Delhi", 9876543212, '', 'dps@gmail.com'],
    ["Mount Carmel School", "Andheri West", "Mumbai", "Maharashtra", 9876543213, '', 'mcs@gmail.com'],
]
// await db.query("INSERT INTO schools (name,address,city,state,contact,image,email_id) VALUES ?", [values]);
// for large data we use query instead of execute

// Return data - 
// let dataA = await db.execute("SELECT * FROM schools");
// console.log(dataA[0]);
// in data we get an 2d array of in which array at 0 position is the data and 1 index position is the field names/ metadata
// let data = await db.execute("SELECT * FROM schools where name='Vidyaranyapura school'");
// console.log("data with where clause");
// console.log(data[0]);

// Update Query -
// Not recommended code - 
// try{
//     let data = await db.execute("UPDATE schools SET image='newimage.jpg' WHERE id=1");
//     console.log(data[0]);
// }catch(error){
//     console.log(error);
// }

// Recommended code - 
// try{
//     let data = await db.execute("UPDATE schools SET image=? WHERE id=?", ['newimage2.jpg', 2]);
//     console.log(data[0]);
// }catch(error){
//     console.log(error);
// }
// Delete Query -
// try{
//     let data = await db.execute("DELETE FROM schools WHERE id=1");
//     console.log(data[0]);
// }catch(error){
//     console.log(error);
// }

console.log('mysql connected');

export async function POST(request) {
    let data = await request.json();
    // console.log(data);
    try{
    let dataA = await db.execute("INSERT INTO schools (name,address,city,state,contact,image,email_id) VALUES (?, ?, ?, ?, ?, ?, ?)", [data.name, data.address, data.city, data.state, data.contact, data.image, data.email]);
    // console.log("school added", dataA);
    return NextResponse.json({success: true, message: "School added successfully" });
    }catch(error){
        return NextResponse.json({success: false, message: error.message });
    }

}

export async function GET() {
    try{
    let data = await db.execute("SELECT * FROM schools");
    // console.log("data",data[0].length);
    if(data[0].length<= 0){
        // console.log("values",values);
        let dataA = await db.query("INSERT INTO schools (name,address,city,state,contact,image,email_id) VALUES ?", [values]);
        // console.log("dataA",dataA);
    }
    data = await db.execute("SELECT * FROM schools");
    return NextResponse.json({success: true, schools: data[0] });
    }catch(error){
        return NextResponse.json({success: false, message: error.message });
    }

}

export async function DELETE(request) {
    try{
    let data = await request.json();
        // console.log(data);
    let dataA = await db.execute("DELETE FROM schools WHERE id=?", [data.id]);
    // console.log(dataA);
    
    return NextResponse.json({success: true, message: "School deleted successfully" });
    }catch(error){
        return NextResponse.json({success: false, message: error.message });
    }
}
