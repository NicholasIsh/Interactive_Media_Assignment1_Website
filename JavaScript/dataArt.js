const API_KEY = 'raGr2ktvfncBRDB6x4deDM1nfsrJHKrEetIrJVF0';
const EndDate = new Date();
const StartDate = new Date(EndDate);
StartDate.setDate(StartDate.getDate() - 90);
const START_DATE = `${StartDate.getFullYear()}-${String(StartDate.getMonth() + 1).padStart(2, '0')}-${String(StartDate.getDate()).padStart(2, '0')}`;
const END_DATE = `${EndDate.getFullYear()}-${String(EndDate.getMonth() + 1).padStart(2, '0')}-${String(EndDate.getDate()).padStart(2, '0')}`;

// Check if data is already stored in session storage
const savedData = JSON.parse(sessionStorage.getItem('myData'));
if (savedData) {
    console.log("Returned data from session storage:", savedData);
    createDataArt(savedData);
} else {
    fetch(`https://api.nasa.gov/DONKI/CME?startDate=${START_DATE}&endDate=${END_DATE}&api_key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            console.log("Returned data from API:", data);
            sessionStorage.setItem('myData', JSON.stringify(data));  // Save data to session storage
            createDataArt(data);
        });
}
    function createDataArt(data) {
        
        data = data.map(d => {
            if (d.cmeAnalyses && d.cmeAnalyses.length > 0) {
                return {
                    startDate: d.startTime,
                    speed: d.cmeAnalyses[0].speed
                };
            }
            }).filter(item => item); 
    
        data = data.filter(d => d.startDate && d.speed);
        const width = 1000;
        const height = 1000;

        // Create a linear scale for the speed values
        const maxSpeed = d3.max(data, d => d.speed);
        const speedScale = d3.scaleLinear()
            .domain([0, maxSpeed])
            .range([0, Math.min(width, height) / 2 - 50]);  


        // Create the SVG element
        const svg = d3.select("#dataArt")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const defs = svg.append("defs");

        const filter = defs.append("filter")
            .attr("id", "glow")
            .attr("x", "-50%")  // extend the rendering area 50% to the left
            .attr("y", "-50%")  // extend the rendering area 50% to the top
            .attr("width", "200%")  // make the rendering area 200% the width of the SVG
            .attr("height", "200%");  // make the rendering area 200% the height of the SVG
        
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

        // Draw the center circle
        const circleRadius = 50;
        const circle = svg.append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("r", circleRadius)
            .style("fill", "#fffd7a")
            .style("filter", "url(#glow)");  

        

        // Draw lines representing your data
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
                .style("stroke-width", 1);
        });

        let angle = 0;  // Initial angle
        let rotationSpeed = 0.05;  // Adjust this value to control the speed of rotation
        const maxRotationSpeed = 0.05;  // Maintain a constant for maximum rotation speed
        let rotating = true;  // Add a new variable to keep track of whether or not to rotate
        const deceleration = 0.002;  // Adjust this value to control the rate of deceleration
        // Function to update the rotation
        function update() {
            if (rotating) {  // Only update the angle if rotating is true
                rotationSpeed = Math.min(maxRotationSpeed, rotationSpeed + deceleration);
            }else {
                // If not rotating, gradually decelerate to 0
                rotationSpeed = Math.max(0, rotationSpeed - deceleration);
            }
            angle += rotationSpeed;
            group.attr("transform", `rotate(${angle}, ${width / 2}, ${height / 2})`);  // Rotate around the center of the SVG
            
            requestAnimationFrame(update);  // Call update again for the next frame
        }

        update();  // Start the animation

        // Add a mousemove event listener to the SVG
        svg.on("mousemove", function(event) {
            // Get the mouse coordinates
            const [mouseX, mouseY] = d3.pointer(event);
            // Calculate the distance between the mouse and the center of the circle
            const dx = mouseX - width / 2;
            const dy = mouseY - height / 2;
            const distance = Math.sqrt(dx*dx + dy*dy);
            // If the distance is less than the circle radius plus a certain threshold, pause the rotation
            rotating = distance > circleRadius + 300;  
        });
    }

