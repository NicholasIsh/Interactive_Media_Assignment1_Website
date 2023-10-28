const API_KEY = 'raGr2ktvfncBRDB6x4deDM1nfsrJHKrEetIrJVF0';
const today = new Date();
const endDate = new Date(today);
endDate.setDate(today.getDate() + 7); 
const START_DATE = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const END_DATE = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;


    fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${START_DATE}&end_date=${END_DATE}&api_key=${API_KEY}`)
        .then(response => response.json())
        .then(data => visualizeNEO(data))
        .catch(error => console.error('Error fetching NEO data:', error));
    
    function visualizeNEO(data) {
        const neos = data.near_earth_objects;
        let plotData = [];
        
        for (let date in neos) {
            for (let neo of neos[date]) {

            
                plotData.push({
                    diameter: neo.estimated_diameter.meters.estimated_diameter_max,
                    velocity: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second),
                    miss_distance: parseFloat(neo.close_approach_data[0].miss_distance.kilometers)
                });
            }
        }
        const width = 1100;
        const height = 600;
        const margin = { top: 20, right: 200, bottom: 50, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
    
        const svg = d3.select("#neoGraph").append("svg")
                      .attr("width", width)
                      .attr("height", height);
    
        const xScale = d3.scaleLinear()
                        .domain([0, d3.max(plotData, d => d.miss_distance)])
                        .range([0, innerWidth]);
    
        const yScale = d3.scaleLinear()
                        .domain([0, d3.max(plotData, d => d.velocity)])
                        .range([innerHeight, 0]);
    
        const sizeScale = d3.scaleLinear()
                            .domain([0, d3.max(plotData, d => d.diameter)])
                            .range([5, 50]);

        const g = svg.append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);
        
        g.selectAll("circle")
            .data(plotData)
            .enter().append("circle")
            .attr("cx", d => xScale(d.miss_distance))
            .attr("cy", d => yScale(d.velocity))
            .attr("r", d => sizeScale(d.diameter))
            .attr("fill", "orange")
            .attr("opacity", 0.6);
    
        g.append("g")
            .call(d3.axisLeft(yScale));
            
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale));
        
        const keyData = [5, 1000, 2000]; 
        const key = svg.append("g")
                       .attr("transform", `translate(${width - margin.right + 20},${margin.top + 140})`);

                       
        key.selectAll("circle")
            .data(keyData)
            .enter().append("circle")
            .attr("cx", 130)
            .attr("cy", (d, i) => i * 80)
            .attr("r", d => sizeScale(d))
            .attr("fill", "orange")
            .attr("opacity", 0.6)
            
        key.selectAll("text")
            .data(keyData)
            .enter().append("text")
            .attr("x", 10)
            .attr("y", (d, i) => i * 80)
            .attr("dy", "0.32em")
            .style("fill", "white")
            .text(d => `${d}m`);
    
        svg.append("text")
           .attr("x", width / 2)
           .attr("y", height - 10)
           .style("text-anchor", "middle")
           .style("fill", "white")
           .text("Miss Distance (km)");
    
        svg.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 0)
           .attr("x", -300)
           .attr("dy", "1em")
           .style("text-anchor", "middle")
           .style("fill", "white")
           .text("Velocity (km/h)");

        const keyTitle = svg.append("g")
            .attr("transform", `translate(${width - margin.right + 20},${margin.top + 100})`);

        keyTitle.append("text")
            .attr("x", 70) 
            .attr("y", -30) 
            .style("text-anchor", "middle")
            .style("fill", "white")
            .text("Diameter Key");
    }


    const flrEndDate = new Date();
    const flrStartDate = new Date(flrEndDate);
    flrStartDate.setDate(flrStartDate.getDate() - 15);
    const FLR_START_DATE = `${flrStartDate.getFullYear()}-${String(flrStartDate.getMonth() + 1).padStart(2, '0')}-${String(flrStartDate.getDate()).padStart(2, '0')}`;
    const FLR_END_DATE = `${flrEndDate.getFullYear()}-${String(flrEndDate.getMonth() + 1).padStart(2, '0')}-${String(flrEndDate.getDate()).padStart(2, '0')}`;

    fetch(`https://api.nasa.gov/DONKI/FLR?startDate=${FLR_START_DATE}&endDate=${FLR_END_DATE}&api_key=${API_KEY}`)
    .then(response => response.json())
    .then(function(data) {
        const processedData = data.map(d => ({
            date: new Date(d.beginTime).toDateString(),
            time: new Date(d.beginTime).getHours() + new Date(d.beginTime).getMinutes() / 60 
        }));

        const svg = d3.select("#flareGraph"),
        margin = {top: 20, right: 20, bottom: 50, left: 50},
        width = 1000,
        height = 500;

        svg.attr("width", width + margin.left + margin.right);
        svg.attr("height", height + margin.top + margin.bottom);

        const x = d3.scaleTime().rangeRound([0, width]),
        y = d3.scaleLinear().rangeRound([height, 0]);

        const g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(d3.extent(processedData, d => new Date(d.date)));
        y.domain([0, 24]);

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        g.append("g")
            .call(d3.axisLeft(y).ticks(24))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Time of day (hours)");

        g.append("path")
            .datum(processedData)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(new Date(d.date)))
                .y(d => y(d.time)));

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .append("text") 
            .attr("y", margin.bottom - 20)
            .attr("x", width / 2) 
            .attr("dy", "1em")  
            .attr("text-anchor", "middle") 
            .attr("fill", "white") 
            .text("Date")
            .style("font-size", "16px")
            .style("font-family", "Orbitron"); 

        g.append("g")
            .call(d3.axisLeft(y).ticks(24))
            .append("text") 
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 6) 
            .attr("x", -height / 2)  
            .attr("dy", "1em")  
            .attr("text-anchor", "middle") 
            .attr("fill", "white")
            .text("Time of day (hours)")
            .style("font-size", "16px")
            .style("font-family", "Orbitron");  

    })
    .catch(error => {
        console.error("Error fetching or processing the data:", error);
    });

    

    const cmeEndDate = new Date();
    const cmeStartDate = new Date(cmeEndDate);
    cmeStartDate.setDate(cmeStartDate.getDate() - 7);
    const CME_START_DATE = `${cmeStartDate.getFullYear()}-${String(cmeStartDate.getMonth() + 1).padStart(2, '0')}-${String(cmeStartDate.getDate()).padStart(2, '0')}`;
    const CME_END_DATE = `${cmeEndDate.getFullYear()}-${String(cmeEndDate.getMonth() + 1).padStart(2, '0')}-${String(cmeEndDate.getDate()).padStart(2, '0')}`;

    fetch(`https://api.nasa.gov/DONKI/CME?startDate=${CME_START_DATE}&endDate=${CME_END_DATE}&api_key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
        console.log("Returned data:", data); 
        createCMEGraph(data);
    });


    function createCMEGraph(data) {
        d3.select("#cmeGraph").selectAll("*").remove();

  
        data = data.map(d => {
        if (d.cmeAnalyses && d.cmeAnalyses.length > 0) {
            return {
                startDate: d.startTime,
                speed: d.cmeAnalyses[0].speed
            };
        }
        }).filter(item => item); 

        data = data.filter(d => d.startDate && d.speed);
        const width = 1100;
        const height = 500;
        const margin = {top: 20, right: 20, bottom: 50, left: 50};

        const x = d3.scaleTime().range([margin.left, width - margin.right]);
        const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

        const line = d3.line()
        .x(d => x(new Date(d.startDate)))
        .y(d => y(d.speed));
        

        const svg = d3.select("#cmeGraph").append("svg")
            .attr("width", width)
            .attr("height", height);

        x.domain(d3.extent(data, d => new Date(d.startDate)));
        y.domain([0, d3.max(data, d => d.speed)]);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(new Date(d.startDate)))
            .attr("cy", d => y(d.speed))
            .attr("r", 5)
            .attr("fill", "orange");

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height )
            .style("text-anchor", "middle")
            .style("fill", "white")
            .text("Date")
            .style("font-size", "16px")
            .style("font-family", "Orbitron");  
    
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", -height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "white")
            .text("Speed (km/s)")
            .style("font-size", "16px")
            .style("font-family", "Orbitron");  
    }
    
    const slider = document.getElementById('daySlider');
    const sliderValueDisplay = document.getElementById('sliderValue');


    slider.addEventListener('input', function() {
        sliderValueDisplay.textContent = slider.value;
    });

    slider.addEventListener('change', function() {
        updateGraph(parseInt(slider.value));
    });

    function updateGraph(days) {
        const cmeEndDate = new Date();
        const cmeStartDate = new Date(cmeEndDate);
        cmeStartDate.setDate(cmeEndDate.getDate() - days);
        const CME_START_DATE = `${cmeStartDate.getFullYear()}-${String(cmeStartDate.getMonth() + 1).padStart(2, '0')}-${String(cmeStartDate.getDate()).padStart(2, '0')}`;
        const CME_END_DATE = `${cmeEndDate.getFullYear()}-${String(cmeEndDate.getMonth() + 1).padStart(2, '0')}-${String(cmeEndDate.getDate()).padStart(2, '0')}`;
    
        fetch(`https://api.nasa.gov/DONKI/CME?startDate=${CME_START_DATE}&endDate=${CME_END_DATE}&api_key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            createCMEGraph(data);
        });
    }

    // Calls the update function initially with the default value of 7 days
    updateGraph(7);
    