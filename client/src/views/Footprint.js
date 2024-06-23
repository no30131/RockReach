// import React, { useEffect, useState } from "react";
// import "./stylesheets/Footprint.css";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";

// const Footprint = () => {
//   const [gyms, setGyms] = useState([]);
//   const [footprints, setFootprints] = useState([]);

//   useEffect(() => {
//     // 獲取所有岩館資料
//     fetch("/api/gyms")
//       .then((response) => response.json())
//       .then((data) => setGyms(data))
//       .catch((error) => console.error("Error fetching gyms:", error));

//     // 嘗試獲取用戶足跡資料
//     const fetchUserData = async () => {
//       const token = getCookie("token");
//       if (!token) return;

//       const decoded = jwtDecode(token);
//       const userId = decoded.userId;

//       try {
//         const footprintsResponse = await axios.get(`/api/footprints/${userId}`);
//         setFootprints(footprintsResponse.data);
//       } catch (error) {
//         console.error("Error fetching footprints:", error);
//       }
//     };

//     fetchUserData();
//   }, []);

//   useEffect(() => {
//     if (gyms.length > 0) {
//       const map = L.map("map").setView([0, 0], 2);

//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);

//       gyms.forEach((gym) => {
//         // 預設為黑色標記
//         let markerColor = "black";
//         const footprint = footprints.find((fp) => fp.gymId._id === gym._id);

//         if (footprint) {
//           // 如果有足跡記錄，設置為紅色標記
//           markerColor = "red";
//         }

//         if (gym.latitude && gym.longitude) {
//           L.circleMarker([gym.latitude, gym.longitude], {
//             color: markerColor,
//             radius: 8,
//           }).addTo(map).bindPopup(`
//               <b>${gym.name}</b><br>
//               地址: ${gym.address}<br>
//               ${
//                 footprint
//                   ? `
//               上次到訪日期: ${new Date(
//                 footprint.lastVisit
//               ).toLocaleDateString()}<br>
//               到訪次數: ${footprint.visitTimes}<br>
//               會員到期日: ${new Date(footprint.expiryDate).toLocaleDateString()}
//               `
//                   : ""
//               }
//             `);
//         }
//       });

//       if (gyms[0].latitude && gyms[0].longitude) {
//         map.setView([gyms[0].latitude, gyms[0].longitude], 10);
//       }
//     }
//   }, [gyms, footprints]);

//   const getCookie = (name) => {
//     const cookieArr = document.cookie.split("; ");
//     for (let i = 0; i < cookieArr.length; i++) {
//       const cookiePair = cookieArr[i].split("=");
//       if (name === cookiePair[0]) {
//         return decodeURIComponent(cookiePair[1]);
//       }
//     }
//     return null;
//   };

//   return (
//     <div>
//       <h1>足跡地圖</h1>
//       <div className="footprint-content">
//         <div className="gym-data">1
//           {footprints.map((fp) => (
//             <div key={fp._id}>
//               <p>岩館：</p>
//               <p>上次到訪日期：</p>
//               <p>到訪次數：</p>
//               <p>會員到期日：</p>
//               <button>編輯</button>
//             </div>
//           ))}
//         </div>
//         <div className="map-view"></div>
//       </div>
//     </div>
//   );
// };

// export default Footprint;





// import React, { useEffect } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import "./stylesheets/Footprint.css";
// import axios from "axios";

// const Footprint = () => {
//   useEffect(() => {
//     // 檢查地圖是否已經初始化
//     if (L.DomUtil.get("map") !== null) {
//       L.DomUtil.get("map")._leaflet_id = null;
//     }
//     // 初始化地圖
//     const map = L.map("map").setView([25.0478, 121.517], 13);

//     // 設置地圖瓦片層
//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution:
//         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     }).addTo(map);

//     // 添加標記
//     L.marker([25.0478, 121.517])
//       .addTo(map)
//       .bindPopup("Taipei Main Station")
//       .openPopup();
//   }, []);

//   return <div id="map"></div>;
// };

// export default Footprint;



// import React, { useState, useEffect } from 'react';
// import MapGL, { Marker } from 'react-map-gl';
// import axios from 'axios';

// const Footprint = () => {
//   const [viewport, setViewport] = useState({
//     latitude: 25.0330,
//     longitude: 121.5654,
//     zoom: 12,
//     width: '100vw',
//     height: '100vh'
//   });
//   const [gyms, setGyms] = useState([]);

//   useEffect(() => {
//     axios.get('http://localhost:7000/api/gyms/all')
//       .then(response => {
//         setGyms(response.data);
//       })
//       .catch(error => {
//         console.error('Error fetching gyms:', error);
//       });
//   }, []);

//   return (
//     <MapGL
//       {...viewport}
//       mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
//       onViewportChange={nextViewport => setViewport(nextViewport)}
//     >
//       {gyms.map(gym => (
//         <Marker
//           key={gym._id}
//           latitude={gym.latitude}
//           longitude={gym.longitude}
//         >
//           <div style={{ backgroundColor: gym.color, width: '10px', height: '10px', borderRadius: '50%' }}></div>
//         </Marker>
//       ))}
//     </MapGL>
//   );
// };

// export default Footprint;


// import React, { useState, useEffect } from 'react';
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
// import axios from 'axios';

// const containerStyle = {
//   width: '100%',
//   height: '100vh'
// };

// const center = {
//   lat: 25.0478,
//   lng: 121.5170
// };

// const Footprint = () => {
//   const [gyms, setGyms] = useState([]);

//   useEffect(() => {
//     const fetchGyms = async () => {
//       try {
//         const response = await axios.get('http://localhost:7000/api/gyms/all');
//         setGyms(response.data);
//       } catch (error) {
//         console.error('Error fetching gyms:', error);
//       }
//     };
    
//     fetchGyms();
//   }, []);

//   return (
//     <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={center}
//         zoom={13}
//       >
//         {gyms.map(gym => (
//           <Marker
//             key={gym._id}
//             position={{ lat: gym.latitude, lng: gym.longitude }}
//             title={gym.name}
//           />
//         ))}
//       </GoogleMap>
//     </LoadScript>
//   );
// };

// export default Footprint;


// import React, { useEffect } from 'react';
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

// const containerStyle = {
//   width: '100%',
//   height: '100vh'
// };

// const center = {
//   lat: 25.0478,
//   lng: 121.5170
// };

// const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// const Footprint = () => {
//   return (
//     <LoadScript googleMapsApiKey={googleMapsApiKey}>
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={center}
//         zoom={13}
//       >
//         <Marker
//           position={{ lat: 25.0478, lng: 121.5170 }}
//           title="Taipei Main Station"
//         />
//       </GoogleMap>
//     </LoadScript>
//   );
// };

// export default Footprint;








import React, { useEffect } from 'react';

const Footprint = () => {
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=places`;
      script.async = true;
      document.body.appendChild(script);
      
      window.initMap = function() {
        const map = new window.google.maps.Map(document.getElementById('map'), {
          center: { lat: 25.0478, lng: 121.5170 },
          zoom: 13,
        });

        new window.google.maps.Marker({
          position: { lat: 25.0478, lng: 121.5170 },
          map,
          title: 'Taipei Main Station',
        });
      };

      return () => {
        if (script) {
          document.body.removeChild(script);
        }
      };
    } else {
      window.initMap();
    }
  }, []);

  return <div id="map" style={{ width: '100%', height: '100vh' }}></div>;
};

export default Footprint;
