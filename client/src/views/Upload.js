import React, { useState } from "react";
import "./stylesheets/Upload.css";

const Upload = () => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("description", description);

        try {
            const response = await fetch("http://localhost:7000/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            console.log("File uploaded successfull: ", data);
        } catch (error) {
            console.error("Error uploading file: ", error);
        }
    };

    return (
        <div className="upload-form">
            <h1>新增攀岩紀錄</h1>
            <form onSubmit={handleSubmit}>
                <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"    
                />
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    placeholder="Enter description"
                />
                <button type="submit">Upload</button>
            </form>
        </div>
    )
};

export default Upload;