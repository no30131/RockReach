import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";
import "./stylesheets/Footprint.css";

const Footprint = () => {
  const { id } = useParams();
  const [userId, setUserId] = useState(null);
  const [footprints, setFootprints] = useState([]);
  const [currentGym, setCurrentGym] = useState(null);
  const [footprint, setFootprint] = useState(null);
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [visitTimes, setVisitTimes] = useState(1);
  const [expiryDate, setExpiryDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .split("T")[0]
  );
  const [showDetails, setShowDetails] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

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

    const fetchUserFootprints = useCallback(async (userId) => {
      try {
        const response = await axios.get(`https://node.me2vegan.com/api/footprints/${userId}`);
        setFootprints(response.data);
      } catch (error) {
        console.error("Error fetching footprints:", error);
      }
    }, []);

    useEffect(() => {
    if (id) {
      fetchUserFootprints(id);
    } else {
      const token = getCookie("token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        fetchUserFootprints(decoded.userId);
      }
    }

    axios
      .get(`https://node.me2vegan.com/api/footprints/google-maps-api-url`)
      .then((response) => {
        const { url } = response.data;
        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.onload = () => {
          setIsMapLoaded(true);
        };
        document.body.appendChild(script);
      });

    return () => {
      if (window.google) {
        window.google.maps.event.clearInstanceListeners(window.map);
      }
    };
  }, [id, fetchUserFootprints]);

  const fetchFootprint = async (gymId) => {
    try {
      const fetchId = id || userId;
      if (!fetchId) return;

      const response = await axios.get(`https://node.me2vegan.com/api/footprints/${fetchId}`);
      const userFootprints = response.data;
      const gymFootprint = userFootprints.find(
        (footprint) => String(footprint.gymId._id) === String(gymId)
      );
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

  const initMap = useCallback(async () => {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    window.map = new window.google.maps.Map(mapElement, {
      center: { lat: 25.0478, lng: 121.517 },
      zoom: 12,
    });

    let currentInfoWindow = null;

    try {
      const response = await axios.get(`https://node.me2vegan.com/api/gyms/all`);
      const gyms = response.data;

      const service = new window.google.maps.places.PlacesService(window.map);

      gyms.forEach(async (gym) => {
        try {
          const geocodeResponse = await axios.get(
            `https://node.me2vegan.com/api/footprints/google-maps/geocode`,
            {
              params: {
                address: gym.address,
              },
            }
          );

          const { lat, lng } =
            geocodeResponse.data.results[0].geometry.location;

          const request = {
            location: { lat, lng },
            radius: "50",
            query: gym.name,
          };

          service.textSearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              const existingPlace = results[0];
              const userFootprint = footprints.find(
                (footprint) => String(footprint.gymId._id) === String(gym._id)
              );
              const marker = new window.google.maps.Marker({
                position: existingPlace.geometry.location,
                map: window.map,
                title: gym.name,
                icon: {
                  url: userFootprint
                    ? "/images/boulder-orange.png"
                    : "/images/boulder-grey.png",
                  scaledSize: new window.google.maps.Size(28, 28),
                },
              });

              const visitTimesText = "到訪次數：";
              const visitDateText = "上次到訪：";

              const infoWindowContent = `
                <div>
                  ${userFootprint ? `${visitTimesText}${userFootprint.visitTimes}<br/>` : "" }
                  ${userFootprint ? `${visitDateText}${userFootprint.lastVisit}<br/><br/>` : ""}
                  <strong>${existingPlace.name}</strong><br/>
                  ${existingPlace.formatted_address || gym.address}<br/>
                  ${existingPlace.formatted_phone_number || gym.phone}<br/><br/>
                  <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank">在 Google 地圖上查看</a>
                  <br></br>
                  ${id ? '' : `<button onclick="manageGym('${gym._id}')">足跡管理</button>`}
                </div>
              `;

              const infoWindow = new window.google.maps.InfoWindow({
                content: infoWindowContent,
              });

              marker.addListener("click", () => {
                if (currentInfoWindow) {
                  currentInfoWindow.close();
                }
                infoWindow.open(window.map, marker);
                currentInfoWindow = infoWindow;
                setShowDetails(false);
              });
            } else {
              const marker = new window.google.maps.Marker({
                position: { lat, lng },
                map: window.map,
                title: gym.name,
              });

              const infoWindowContent = `
                <div>
                  <strong>${gym.name}</strong><br/>
                  ${gym.address}<br/>
                  ${gym.phone}<br/>
                  <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank">在 Google 地圖上查看</a>
                  <br></br>
                  ${id ? '' : `<button onclick="manageGym('${gym._id}')">足跡管理</button>`}
                </div>
              `;

              const infoWindow = new window.google.maps.InfoWindow({
                content: infoWindowContent,
              });

              marker.addListener("click", () => {
                if (currentInfoWindow) {
                  currentInfoWindow.close();
                }
                infoWindow.open(window.map, marker);
                currentInfoWindow = infoWindow;
                setShowDetails(false);
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
  }, [id, footprints]);

  useEffect(() => {
    if (isMapLoaded && footprints.length > 0) {
      initMap();
    }
  }, [isMapLoaded, footprints, initMap]);

  const registerVisit = async () => {
    setFootprint({
      gymId: currentGym,
      userId: userId,
      lastVisit: visitDate,
      visitTimes: visitTimes,
      expiryDate: expiryDate,
    });
    setShowDetails(true);
  };

  const saveVisit = async () => {
    try {
      const updatedFootprint = {
        gymId: currentGym,
        userId: userId,
        lastVisit: visitDate,
        visitTimes: visitTimes,
        expiryDate: expiryDate,
      };
      const response = await axios.post(
        `https://node.me2vegan.com/api/footprints/create`,
        updatedFootprint
      );
      setFootprint(response.data);
      closeDetails();
      const footprintsResponse = await axios.get(
        `https://node.me2vegan.com/api/footprints/${userId}`
      );
      setFootprints(footprintsResponse.data);
    } catch (error) {
      console.error("Error creating footprint:", error);
    }
  };

  window.manageGym = (gymId) => {
    setCurrentGym(gymId);
    fetchFootprint(gymId);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setCurrentGym(null);
    setFootprint(null);
  };

  const handleShare = () => {
    const shareLink = `https://rockreach.me2vegan.com/footprint/${userId}`;
    prompt("Share this link:", shareLink);
  };

  return (
    <div className="footprint-container">
      <div
        className="map-details"
        style={{ display: showDetails ? "block" : "none" }}
      >
        <button className="close-btn" onClick={closeDetails}>
          X
        </button>
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
      {!id && <button onClick={() => handleShare()}>分享</button>}
    </div>
  );
};

export default Footprint;
