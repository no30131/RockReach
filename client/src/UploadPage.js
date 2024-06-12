import React, { useState } from 'react';
import axios from 'axios';
import './UploadPage.css';

const UploadPage = () => {
    const [image, setImage] = useState(null);
    const [video, setVideo] = useState(null);
    const [description, setDescription] = useState('');

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleVideoChange = (e) => {
        setVideo(e.target.files[0]);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('image', image);
        formData.append('video', video);
        formData.append('description', description);

        try {
            const response = await axios.post('http://localhost:7000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('File uploaded successfull', response.data);
        } catch (error) {
            console.error('Error uploading file', error);
        }
    };

    return (
        <div className="upload-page">
            <h1>Upload Page</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="image">Image:</label>
                    <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="video">Video:</label>
                    <input type="file" id="video" accept="video/*" onChange={handleVideoChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea id="description" value={description} onChange={handleDescriptionChange}></textarea>
                </div>
                <button type="submit">Upload</button>
            </form>
        </div>
    )
};

export default UploadPage;