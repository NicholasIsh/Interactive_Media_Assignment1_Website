const API_KEY = 'raGr2ktvfncBRDB6x4deDM1nfsrJHKrEetIrJVF0';
const today = new Date();
const endDate = new Date(today);
endDate.setDate(today.getDate() + 7); // 7 days from now
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
        
        // Key
        const keyData = [5, 1000, 2000]; // Modify as needed
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
            .attr("dy", "0.32em")  // Center text vertically in circle
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
            .attr("x", 70)  // Adjust this if needed
            .attr("y", -30) // This places the text 30 units above the first circle in the key
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
            time: new Date(d.beginTime).getHours() + new Date(d.beginTime).getMinutes() / 60 // hours + fraction of the hour
        }));

        // Set up SVG and scales
        const svg = d3.select("#flareGraph"),
        margin = {top: 20, right: 200, bottom: 50, left: 50},
        width = 1100,
        height = 500;

        // Set SVG height and width
        svg.attr("width", width + margin.left + margin.right);
        svg.attr("height", height + margin.top + margin.bottom);

        const x = d3.scaleTime().rangeRound([0, width]),
        y = d3.scaleLinear().rangeRound([height, 0]);

        const g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(d3.extent(processedData, d => new Date(d.date)));
        y.domain([0, 24]); // 24 hours in a day

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
        // X-axis
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .append("text") // Adding label for x-axis
            .attr("y", margin.bottom - 20) // Adjust as per your design
            .attr("x", width / 2)  // Centered within the axis
            .attr("dy", "1em")  // Adjust distance from the x-axis
            .attr("text-anchor", "middle")  // Center the text
            .attr("fill", "white") 
            .text("Date")
            .style("font-size", "16px")
            .style("font-family", "Orbitron");  // Set the font-family

        // Y-axis
        g.append("g")
            .call(d3.axisLeft(y).ticks(24))
            .append("text") 
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 6) // Adjust the position
            .attr("x", -height / 2)  // Vertically center the text
            .attr("dy", "1em")  // Adjust distance from the y-axis
            .attr("text-anchor", "middle")  // Center the text
            .attr("fill", "white")
            .text("Time of day (hours)")
            .style("font-size", "16px")
            .style("font-family", "Orbitron");  // Set the font-family

    })
    .catch(error => {
        console.error("Error fetching or processing the data:", error);
    });