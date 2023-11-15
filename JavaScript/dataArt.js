let loadingText = 'Loading.';
const loadingElement = document.querySelector('#loading h2');

let loadingInterval = setInterval(updateLoadingText, 1000);


const API_KEY = 'raGr2ktvfncBRDB6x4deDM1nfsrJHKrEetIrJVF0';
const EndDate = new Date();
const StartDate = new Date(EndDate);
StartDate.setDate(StartDate.getDate() - 90); 
const START_DATE = `${StartDate.getFullYear()}-${String(StartDate.getMonth() + 1).padStart(2, '0')}-${String(StartDate.getDate()).padStart(2, '0')}`;
const END_DATE = `${EndDate.getFullYear()}-${String(EndDate.getMonth() + 1).padStart(2, '0')}-${String(EndDate.getDate()).padStart(2, '0')}`;

// Check if data is already stored in session storage
const savedData = JSON.parse(sessionStorage.getItem('myData'));
const savedExamData = JSON.parse(sessionStorage.getItem('examData'));
if (savedData) {
    console.log("Returned data from session storage:", savedData);
    createDataArt(savedData);
    clearInterval(loadingInterval);  
} else {
    document.getElementById('loading').style.display = 'block';  
    fetch(`https://api.nasa.gov/DONKI/CME?startDate=${START_DATE}&endDate=${END_DATE}&api_key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            console.log("Returned data from API:", data);
            sessionStorage.setItem('myData', JSON.stringify(data));  // Save data to session storage

            createDataArt(data);
            clearInterval(loadingInterval);
        });
}
if (savedExamData) {
    console.log("Returned data from session storage:", savedExamData);
    createExamDataArt(savedExamData);

} else {
    fetch(`https://api.nasa.gov/neo/rest/v1/feed?startDate=${START_DATE}&endDate=${END_DATE}&api_key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            console.log("Returned data from API:", data);
            sessionStorage.setItem('examData', JSON.stringify(data));  // Save data to session storage

            createExamDataArt(data);
            // clearInterval(loadingInterval);
        });
    }

function createDataArt(data) {
    const formatDate = d3.timeFormat("%Y-%m-%d");
    data = data.map(d => {
        if (d.cmeAnalyses && d.cmeAnalyses.length > 0) {
            return {
                startDate: d.startTime,
                speed: d.cmeAnalyses[0].speed,
                type: d.cmeAnalyses[0].type,  
                longitude: d.cmeAnalyses[0].longitude, 
                latitude: d.cmeAnalyses[0].latitude 
            };
        }
        }).filter(item => item); 

    data = data.filter(d => d.startDate && d.speed);
    const width = 1000;
    const height = 1000;
    const maxSpeed = d3.max(data, d => d.speed);
    const speedScale = d3.scaleLinear()
        .domain([0, maxSpeed])
        .range([0, Math.min(width, height) / 2 - 50]);  
    const svg = d3.select("#dataArt")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    const defs = svg.append("defs");
    const filter = defs.append("filter")
        .attr("id", "glow")
        .attr("x", "-50%")  
        .attr("y", "-50%")  
        .attr("width", "200%")  
        .attr("height", "200%");  

    filter.append("feGaussianBlur")
        .attr("stdDeviation", "10")
        .attr("result", "coloredBlur");

    filter.append("feFlood")
        .attr("flood-color", "white")
        .attr("result", "whiteColor");

    filter.append("feComposite")
        .attr("in", "whiteColor")
        .attr("in2", "coloredBlur")
        .attr("operator", "in")
        .attr("result", "whiteBlur");
    
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
        
    const group = svg.append("g");
    const circleRadius = 50;
    const circle = svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", circleRadius)
        .style("fill", "#fffd7a")
        .style("filter", "url(#glow)");  

    data.forEach((d, i) => {
        const angle = (i / data.length) * 2 * Math.PI;  // Calculate angle for each line
        const lineLength = speedScale(d.speed);  
        const x1 = (width / 2) + (circleRadius-1) * Math.cos(angle);
        const y1 = (height / 2) + (circleRadius-1) * Math.sin(angle);
        const x2 = x1 + lineLength * Math.cos(angle);
        const y2 = y1 + lineLength * Math.sin(angle);

    group.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .style("stroke", "yellow")
        .style("stroke-width", 1)
        .on("mouseover", function(event) {
            d3.select(this)  
            .style("stroke", "orange");

            d3.select("#tooltip")
                .interrupt()
                .style("display", "block")
                .style("opacity", 1) 
                .html(`Start Time: ${formatDate(new Date(d.startDate))}<br>Speed: ${d.speed}<br>Type: ${d.type}<br>Longitude: ${d.longitude}<br>Latitude: ${d.latitude}`)
                .style("left", (event.pageX + 10) + "px")  
                .style("top", (event.pageY - 10) + "px"); 
        })
        .on("mousemove", function(event, d) {
            d3.select("#tooltip").style("left", (event.pageX + 10) + "px")  
                .style("top", (event.pageY - 10) + "px");  
        })
        .on("mouseout", function() {
            d3.select(this)  
            .style("stroke", "yellow"); 

            d3.select("#tooltip")
                .transition()  
                .duration(500)  
                .style("opacity", 0) 
                .on("end", function() { 
                    d3.select("#tooltip").style("display", "none");  // hide the tooltip
                });
        });
        document.getElementById('loading').style.display = 'none';
    });

    let angle = 0;  
    let rotationSpeed = 0.05;  
    const maxRotationSpeed = 0.05; 
    const rotating = true;  
    const deceleration = 0.002;  
    // Function to update the rotation
    function update() {
        if (rotating) {  // Only update the angle if rotating is true
            rotationSpeed = Math.min(maxRotationSpeed, rotationSpeed + deceleration);
        }else {
            // If not rotating decelerate to 0
            rotationSpeed = Math.max(0, rotationSpeed - deceleration);
        }
        angle += rotationSpeed;
        group.attr("transform", `rotate(${angle}, ${width / 2}, ${height / 2})`);  
        requestAnimationFrame(update);  // Call update again
    }
    update();  // Start the animation

    svg.on("mousemove", function(event) {
        const [mouseX, mouseY] = d3.pointer(event);
        const dx = mouseX - width / 2;
        const dy = mouseY - height / 2;
        const distance = Math.sqrt(dx*dx + dy*dy);
        rotating = distance > circleRadius + 300;  
    });
    
}
function updateLoadingText() {
    loadingText = loadingText === 'Loading...' ? 'Loading.' : loadingText + '.';
    loadingElement.textContent = loadingText;
}

function createExamDataArt(data){
    const neos = data.near_earth_objects;
    const plotData = [];
    
    for (const date in neos) {
        for (const neo of neos[date]) {

        
            plotData.push({
                diameter: neo.estimated_diameter.meters.estimated_diameter_max,
                velocity: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second),
                miss_distance: parseFloat(neo.close_approach_data[0].miss_distance.kilometers),
                closest_approach: neo.close_approach_data[0].close_approach_date,
                neo_name: neo.name,
                is_potentially_hazardous_asteroid: neo.is_potentially_hazardous_asteroid,
            });
        }
    }

    

    const width = 1000;
    const height = 1000;
    const svg = d3.select("#examDataArt")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const defs = svg.append("defs");
    const glowFilter = defs.append("filter")
        .attr("id", "blue-glow")
        .attr("x", "-50%") // Expand the filter region to accommodate the glow
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");

    glowFilter.append("feGaussianBlur")
        .attr("stdDeviation", "4") // Adjust for desired blur amount
        .attr("result", "coloredBlur");

    glowFilter.append("feFlood")
        .attr("flood-color", "#60b3fc") // Set the color of the glow
        .attr("result", "color");

    glowFilter.append("feComposite")
        .attr("in", "color")
        .attr("in2", "coloredBlur")
        .attr("operator", "in")
        .attr("result", "coloredBlur");

    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");
   
    const pattern = defs.append("pattern")
        .attr("id", "circleImage")
        .attr("height", 1)
        .attr("width", 2) 
        .attr("patternContentUnits", "objectBoundingBox");
    

    pattern.append("image")
        .attr("height", 1)
        .attr("width", 1)
        .attr("preserveAspectRatio", "xMidYMid slice")
        .attr("xlink:href", "https://web.archive.org/web/20150807125159if_/http://www.noirextreme.com/digital/Earth-Color4096.jpg"); 
    
    pattern.append("image")
        .attr("height", 1)
        .attr("width", 1)
        .attr("x", 1) 
        .attr("preserveAspectRatio", "xMidYMid slice")
        .attr("xlink:href", "https://web.archive.org/web/20150807125159if_/http://www.noirextreme.com/digital/Earth-Color4096.jpg");
    
    pattern.append("animateTransform")
        .attr("attributeName", "patternTransform")
        .attr("type", "translate")
        .attr("from", "0,0")
        .attr("to", "100") 
        .attr("dur", "15s") 
        .attr("repeatCount", "indefinite");

    const circleRadius = 50;
    const circle = svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", circleRadius)
        .style("fill", "url(#circleImage)")
        .style("filter", "url(#blue-glow)"); 


        
        const lineLength = 900;
        const halfLineLength = lineLength / 2; 
        const scalingFactor = 6000000; 
        const initialDelay = 200; 
        let accumulatedDelay = 0; 
        const decayFactor = 0.97; 

        // COLOUR STUFF
        const maxMissDistance = d3.max(plotData, d => d.miss_distance);
        const minMissDistance = d3.min(plotData, d => d.miss_distance);
        const colorScale = d3.scaleLinear()
        .domain([minMissDistance, maxMissDistance])
        .range(["red", "green"]); // Red for close, green for far
        const originalColors = [];
        plotData.forEach((neo, i) => {
            
            const scaledMissDistance = neo.miss_distance / scalingFactor;
            const lineGenerator = d3.line().curve(d3.curveBasis); 
            
            const angle = (i * 360 / plotData.length) * Math.PI / 180; 
            const middleX = width / 2 + (circleRadius + scaledMissDistance) * Math.cos(angle);
            const middleY = height / 2 + (circleRadius + scaledMissDistance) * Math.sin(angle);
        

            
            const controlPoints = calculateControlPoints(neo.velocity, scaledMissDistance, angle, middleX, middleY, halfLineLength);
            const lineColor = colorScale(neo.miss_distance);
            originalColors.push(lineColor); 



            const path = svg.append("path")
                .attr("d", lineGenerator(controlPoints))
                .style("stroke", lineColor) 
                .style("fill", "none")
                .style("stroke-width", 1)
                .attr("class", "neo-line") 
                .on("mouseover", function(event) {
                    d3.selectAll(".neo-line").style("stroke", "#1f2124");
                    d3.select(this).style("stroke", originalColors[i])
                            .style("stroke-width", 4);
                    
                            d3.select("#tooltip")
                            .style("display", "block")
                            .style("opacity", 1) 
                            .html(`Name: ${neo.neo_name} <br>Velocity: ${parseFloat(neo.velocity).toFixed(2)} km/s<br>Diameter: ${parseFloat(neo.diameter).toFixed(2)} m<br>Miss Distance: ${parseFloat(neo.miss_distance).toFixed(2)} km<br>Closest Approach: ${neo.closest_approach}<br>Potentially Hazardous: ${neo.is_potentially_hazardous_asteroid}`)
                            .style("left", (event.pageX + 10) + "px")  
                            .style("top", (event.pageY - 10) + "px"); 
                })
                .on("mouseout", function(event) {
                    d3.selectAll(".neo-line").style("stroke", (d, j) => originalColors[j]) 
                            .style("stroke-width", 1);

                            d3.select("#tooltip")
                            .style("opacity", 0) 
                            .transition()
                            .duration(500) 
                            .style("display", "none");
                });

                const totalLength = path.node().getTotalLength();
                path.attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(500) 
                    .delay(accumulatedDelay)
                    .attr("stroke-dashoffset", 0);

                
                accumulatedDelay += initialDelay * Math.pow(decayFactor, i);
        });

        
}

function calculateControlPoints(velocity, missDistance, angle, middleX, middleY, halfLineLength) {
    
    const velocityFactor = 21.5; 
    const distanceFactor = 21.5; 

    const curvature = (3 / (velocity / velocityFactor + 1)) * (missDistance * distanceFactor);
    const startX = middleX - halfLineLength * Math.cos(angle + Math.PI / 2);
    const startY = middleY - halfLineLength * Math.sin(angle + Math.PI / 2);
    const endX = middleX + halfLineLength * Math.cos(angle + Math.PI / 2);
    const endY = middleY + halfLineLength * Math.sin(angle + Math.PI / 2);
    const peakX = middleX + curvature * Math.cos(angle);
    const peakY = middleY + curvature * Math.sin(angle);


    return [[startX, startY], [peakX, peakY], [endX, endY]];
}

