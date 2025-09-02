"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const SchoolForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [contact, setContact] = useState("");
  const [imageBase64, setImageBase64] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "School name is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Invalid email";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!state.trim()) newErrors.state = "State is required";
    if (!/^[0-9]{10}$/.test(contact)) newErrors.contact = "Invalid contact number";
    // if (!imageBase64) newErrors.image = "Image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Compress image before converting to base64
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imgElement = new window.Image();

    imgElement.onload = () => {
      // Calculate new dimensions (max 800x600 while maintaining aspect ratio)
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = imgElement;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(imgElement, 0, 0, width, height);

      // Convert to base64 with compression (quality: 0.8 = 80%)
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      
      // Log compression info
      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const compressedSize = (compressedBase64.length * 0.75 / 1024 / 1024).toFixed(2); // Approximate size
      // console.log(`Image compressed: ${originalSize}MB → ${compressedSize}MB`);

      setImageBase64(compressedBase64);
    };

    imgElement.src = URL.createObjectURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const formData = {
      name,
      email,
      address,
      city,
      state,
      contact,
      image: imageBase64,
    };
    try{
      const response = await fetch('/api/add', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      // console.log(data);
      if(data.success){
        alert("School added successfully");
        window.location.href = "/schools";
      }else{
        alert(data.message);
      }
    }catch(error){
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-2xl font-bold relative text-center text-black"><Link href="/"><svg xmlns="http://www.w3.org/2000/svg" className="w-[30px] h-[30px] absolute left-0 top-0 cursor-pointer" viewBox="0 0 640 640"><path d="M73.4 297.4C60.9 309.9 60.9 330.2 73.4 342.7L233.4 502.7C245.9 515.2 266.2 515.2 278.7 502.7C291.2 490.2 291.2 469.9 278.7 457.4L173.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L173.3 288L278.7 182.6C291.2 170.1 291.2 149.8 278.7 137.3C266.2 124.8 245.9 124.8 233.4 137.3L73.4 297.3z"/></svg></Link>Add School</h2>

        {/* School Name */}
        <div>
          <label className="block text-sm font-medium text-black">School Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 text-black"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-black">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 text-black"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-black">Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 text-black"
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-black">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 text-black"
          />
          {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-black">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 text-black"
          />
          {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-black">Contact Number</label>
          <input
            type="tel"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 text-black"
          />
          {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-black">School Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-1 block w-full p-2 border rounded-lg text-black"
          />
          {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
          {imageBase64 && (
            <Image
              src={imageBase64}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded-lg border"
              width={100}
              height={100}
            />
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-lg transition-all duration-200 ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            'Submit'
          )}
        </button>
      </form>
    </div>
  );
};

export default SchoolForm;
