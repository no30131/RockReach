import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./stylesheets/Footprint.css";

const Footprint = () => {
  const [userId, setUserId] = useState(null);
  const [currentGym, setCurrentGym] = useState(null);
  const [footprint, setFootprint] = useState(null);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [visitTimes, setVisitTimes] = useState(1);
  const [expiryDate, setExpiryDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0]);

  useEffect(() => {
    const getCookie = (name) => {
      const cookieArr = document.cookie.split("; ");
      for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].split("=");
        if (name === cookiePair[0]) {
          return decodeURIComponent(cookiePair[1]);
        }
      }
      return null;
    };

    const token = getCookie("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);
    }

    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=places`;
      script.async = true;
      document.body.appendChild(script);

      window.initMap = async function () {
        const map = new window.google.maps.Map(document.getElementById("map"), {
          center: { lat: 25.0478, lng: 121.517 },
          zoom: 12,
        });

        let currentInfoWindow = null;

        try {
          const response = await axios.get(
            "http://localhost:7000/api/gyms/all"
          );
          const gyms = response.data;

          const service = new window.google.maps.places.PlacesService(map);

          gyms.forEach(async (gym) => {
            try {
              const geocodeResponse = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                  gym.address
                )}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
              );

              const { lat, lng } =
                geocodeResponse.data.results[0].geometry.location;

              const request = {
                location: { lat, lng },
                radius: "50",
                query: gym.name,
              };

              service.textSearch(request, (results, status) => {
                if (
                  status === window.google.maps.places.PlacesServiceStatus.OK
                ) {
                  const existingPlace = results[0];
                  const marker = new window.google.maps.Marker({
                    position: existingPlace.geometry.location,
                    map,
                    title: gym.name,
                    icon: {
                      url: "../images/boulder.png",
                      scaledSize: new window.google.maps.Size(28, 28),
                    },
                  });

                  const infoWindowContent = `
                    <div>
                      <strong>${existingPlace.name}</strong><br/>
                      ${existingPlace.formatted_address || gym.address}<br/>
                      ${existingPlace.formatted_phone_number || gym.phone}<br/>
                      <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank">在 Google 地圖上查看</a>
                      <br></br>
                      <button onclick="manageGym('${
                        gym._id
                      }')">足跡管理</button>
                    </div>
                  `;

                  const infoWindow = new window.google.maps.InfoWindow({
                    content: infoWindowContent,
                  });

                  marker.addListener("click", () => {
                    if (currentInfoWindow) {
                      currentInfoWindow.close();
                    }
                    setCurrentGym(gym);
                    fetchFootprint(gym._id);
                    infoWindow.open(map, marker);
                    currentInfoWindow = infoWindow;
                  });
                } else {
                  const marker = new window.google.maps.Marker({
                    position: { lat, lng },
                    map,
                    title: gym.name,
                  });

                  const infoWindowContent = `
                    <div>
                      <strong>${gym.name}</strong><br/>
                      ${gym.address}<br/>
                      ${gym.phone}<br/>
                      <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank">在 Google 地圖上查看</a>
                      <br></br>
                      <button onclick="manageGym('${gym._id}')">足跡管理</button>
                    </div>
                  `;

                  const infoWindow = new window.google.maps.InfoWindow({
                    content: infoWindowContent,
                  });

                  marker.addListener("click", () => {
                    if (currentInfoWindow) {
                      currentInfoWindow.close();
                    }
                    setCurrentGym(gym);
                    fetchFootprint(gym._id);
                    infoWindow.open(map, marker);
                    currentInfoWindow = infoWindow;
                  });
                }
              });
            } catch (error) {
              console.error("Error fetching geocode:", error);
            }
          });
        } catch (error) {
          console.error("Error fetching gyms:", error);
        }
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

  const fetchFootprint = async (gymId) => {
    try {
      console.log("userId: ", userId);
      const response = await axios.get(`http://localhost:7000/api/footprints/${userId}`);
      const userFootprints = response.data;
      const gymFootprint = userFootprints.find((footprint) => footprint.gymId === gymId);
      if (gymFootprint) {
        setFootprint(gymFootprint);
        setVisitDate(gymFootprint.lastVisit);
        setVisitTimes(gymFootprint.visitTimes);
        setExpiryDate(gymFootprint.expiryDate);
      } else {
        setFootprint(null);
      }
    } catch (error) {
      console.error("Error fetching footprints:", error);
    }
  };

  const registerVisit = async () => {
    setFootprint({
      gymId: currentGym,
      userId: userId,
      lastVisit: visitDate,
      visitTimes: visitTimes,
      expiryDate: expiryDate,
    });
  };

  const saveVisit = async () => {
    // console.log("save");
    try {
      const updatedFootprint ={
        gymId: currentGym,
        userId: userId,
        lastVisit: visitDate,
        visitTimes: visitTimes,
        expiryDate: expiryDate,
      };
      // console.log("footprint:", footprint);
      // console.log("currentGym:", currentGym);
      const response = await axios.post("http://localhost:7000/api/footprints/create", updatedFootprint);
      setFootprint(response.data);
    } catch (error) {
      console.error("Error creating footprint:", error);
    }
  };

  window.manageGym = (gymId) => {
    setCurrentGym(gymId);
    fetchFootprint(gymId);
  };

  return (
    <div className="footprint-container">
      <div className="map-details" style={{ display: currentGym ? "block" : "none" }}>
      {footprint ? (
          <div>
            <div className="map-detail">
              <h3>上次到訪日期:</h3>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
              />
            </div>
            <div className="map-detail">
              <h3>到訪次數:</h3>
              <input
                type="number"
                value={visitTimes}
                onChange={(e) => setVisitTimes(e.target.value)}
              />
            </div>
            <div className="map-detail">
              <h3>會員到期日:</h3>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            <button onClick={saveVisit}>儲存</button>
          </div>
        ) : (
          <div>
            <button onClick={registerVisit}>登記到訪</button>
          </div>
        )}
      </div>
      <div id="map"></div>
    </div>
  );
};

export default Footprint;
