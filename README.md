# RockReach | 岩途 🧗‍♂️

*A recording website for bouldering climbers, offered personalized chart analysis to track
progress, custom route design, and a community platform for sharing experiences.*

## Architecture 🏗️

![Architecture Diagram](https://rockreach-0618.s3.ap-southeast-2.amazonaws.com/Architecture.png)

## Features ✨

- 📁 Upload Records: Keep detailed records of each climbing route and upload photos and videos.
- 📊 Personal Space: View personalized data analysis, track your progress, and see all your climbing records.
- 🌐 Explore Wall: See all player posts, interact with likes, comments, and shares. Use our intelligent recommendation system to sort posts.
- 🤝 Friends: Check out your friends' personal walls and chat with them using the online chat room.
- ✏️ Custom Routes: Create custom routes on your own. Simply click on desired rock to auto-draw edges. Upload and share your designed routes.
- 🌟 Achievement: Collect routes of specific colors on designated walls.
- 🗺️ Footprint Map: Display your visits to different climbing gyms and keep track of your membership expiration dates.

## Tech Stack 🛠️

- Applied **React / React Router** for **SPA**.
- Packaged Front-End as static files and uploaded to **S3**, served via **CloudFront**.
- Built the Back-End with **Node.js** and **Express**, packaged the environment into **Docker**
containers, and deployed on **EC2**.
- Automated **CI/CD** deployments for Front-End and Back-End using **GitHub Actions**.
- Utilized **Plotly** for creating personalized chart analysis.
- Implemented an online chat room using **Socket.IO**.
- Developed a recommendation system that sorts posts based on user activity.
- Integrated **Google Maps API** to display personalized footprint maps.
- Employed **Python** and **OpenCV** for custom route rock contour recognition.
- Used **MongoDB Atlas** as the database and built **RESTful API** in **MVC** framework.

