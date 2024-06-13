import React, { useState, useEffect } from "react";
// import "./stylesheets/Personal.css";
import Plotly from "plotly.js-dist";

const Personal = () => {
    const [quiz3Data, setQuiz3Data] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        fetch("http://localhost:7000/api/personal")
          .then((response) => response.json())
          .then((data) => {
            setQuiz3Data(data);
          })
          .catch((error) => console.error("Error fetching data: ", error));
        };

        useEffect(() => {
            const data2 = [
                {
                  values: [7330, 14564, 14206, 7153, 6237],
                  labels: ["Fuchsia", "Green", "White", "Silver", "Red"],
                  marker: {
                    colors: ["#EE00EE", "00EE00", "EEEEEE", "C0C0C0", "EE0000"],
                  },
                  type: "pie",
                },
              ];
              const layout2 = {
                title: {
                  text: "Product sold percentage in different colors",
                  font: {
                    family: "Arial",
                    size: 16,
                  },
                  height: 400,
                  width: 600,
                },
              };
              Plotly.newPlot("quiz2", data2, layout2);

              const trace = {
                x: quiz3Data,
                type: "histogram",
              };
              const data3 = [trace];
              const layout3 = {
                bargap: 0.05,
                bargroupgap: 0.2,
                barmode: "overlay",
                title: {
                  text: "Product sold quantity in different price range",
                  font: {
                    family: "Arial",
                    size: 16,
                  },
                },
                xaxis: { title: "Price Range" },
                yaxis: { title: "Qunatity" },
                height: 400,
                width: 600,
              };
              Plotly.newPlot("quiz3", data3, layout3);
          
              const trace1 = {
                x: [1, 2, 3, 4, 5],
                y: [1, 4, 9, 16, 14],
                name: "S",
                type: "bar",
              };
              const trace2 = {
                x: [1, 2, 3, 4, 5],
                y: [6, -8, -4.5, 8, 5],
                name: "M",
                type: "bar",
              };
              const trace3 = {
                x: [1, 2, 3, 4, 5],
                y: [-15, -3, 4.5, -8, 5],
                name: "L",
                type: "bar",
              };
              const data4 = [trace1, trace2, trace3];
              const layout4 = {
                bargap: 0.05,
                bargroupgap: 0.2,
                barmode: "overlay",
                title: {
                  text: "Quantity of top 5 sold products in different size",
                  font: {
                    family: "Arial",
                    size: 16,
                  },
                },
                yaxis: { title: "Qunatity" },
                barmode: "relative",
                height: 400,
                width: 600,
              };
              Plotly.newPlot("quiz4", data4, layout4);
            }, [quiz3Data]);

    return (
        <div>
            <h1>個人空間</h1>
            <div id="quiz2" style={{ width: 600, height: 400 }}></div>
            <div id="quiz3" style={{ width: 600, height: 400 }}></div>
            <div id="quiz4" style={{ width: 600, height: 400 }}></div>
        </div>
    );
};

export default Personal;