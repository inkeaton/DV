// --- CONFIGURAZIONE ---
const width = window.innerWidth;
const height = window.innerHeight;
const colors = { "Vis": "#5E60CE", "InfoVis": "#4EA8DE", "VAST": "#F48C06", "SciVis": "#5E60CE" };

// --- DATASET & SETUP ---
const DATA_URL = "data.csv"; 

const svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

const circlesLayer = svg.append("g");
const labelsLayer = svg.append("g");
const tooltip = d3.select("#tooltip");

let nodes = [];
let simulation;

// --- 1. DATA LOADING ---
d3.csv(DATA_URL).then(raw_data => {
    
    // Process Data
    nodes = raw_data.map((d, i) => {
        const citations = +d.AminerCitationCount || 0;
        const year = +d.Year || 2000;
        let conf = d.Conference === "SciVis" ? "Vis" : d.Conference;
        
        // Affiliation Logic (North America vs World)
        let aff = (d.AuthorAffiliation || "").toLowerCase();
        let isNA = aff.includes("usa") || aff.includes("canada") || aff.includes("north america");
        let region = isNA ? "North America" : (aff.includes("europe") || aff.includes("germany") || aff.includes("uk") ? "Europe" : "Asia/Other");

        // Simula un mese casuale (per Calendar Plot)
        let month = Math.floor(Math.random() * 12); 

        return {
            id: i,
            title: d.Title,
            year: year,
            month: month,
            citations: citations,
            group: conf,
            region: region,
            isNA: isNA,
            // Radius basato sulle citazioni (min 2.5px, max 10px)
            r: Math.min(10, Math.sqrt(citations) * 0.4 + 2.5), 
            x: width/2 + (Math.random()-0.5)*20,
            y: height/2 + (Math.random()-0.5)*20
        };
    });

    // Filtro per demo fluida (opzionale, rimuovi per full data)
    // nodes = nodes.filter(d => d.year >= 1995); 

    initVis();
}).catch(e => {
    console.error(e);
    alert("Errore caricamento CSV. Usa un Server Locale!");
});

// --- 2. INIT VISUALIZATION ---
function initVis() {
    
    // Draw Circles
    const circles = circlesLayer.selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => d.r)
        .attr("fill", d => colors[d.group] || "#999")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .on("mouseover", (e, d) => {
            d3.select(e.currentTarget).attr("stroke", "#000").attr("stroke-width", 2);
            tooltip.style("opacity", 1).html(`<strong>${d.title}</strong><br>${d.year} • ${d.citations} Cit.`);
        })
        .on("mousemove", e => tooltip.style("left", (e.pageX+10)+"px").style("top", (e.pageY+10)+"px"))
        .on("mouseout", (e) => {
            d3.select(e.currentTarget).attr("stroke", "#fff").attr("stroke-width", 0.5);
            tooltip.style("opacity", 0);
        });

    // Setup Simulation
    simulation = d3.forceSimulation(nodes)
        .velocityDecay(0.4) // High friction for smooth feel
        .force("collide", d3.forceCollide().radius(d => d.r + 1).iterations(2));

    simulation.on("tick", () => {
        circles.attr("cx", d => d.x).attr("cy", d => d.y);
    });

    initScroller();
}

// --- 3. FORCES (THE 10 PLOTS) ---

const forces = {
    
    // 1. GRID (Unit Chart)
    grid: () => {
        const cols = Math.ceil(Math.sqrt(nodes.length * (width/height)));
        const cellSize = 12; // Spaziatura
        const startX = (width - cols * cellSize) / 2;
        const startY = height * 0.15;

        simulation
            .force("x", d3.forceX(d => startX + (d.id % cols) * cellSize).strength(0.8))
            .force("y", d3.forceY(d => startY + Math.floor(d.id / cols) * cellSize).strength(0.8))
            .force("charge", null) // Disabilita repulsione per griglia perfetta
            .alpha(0.8).restart();
            
        updateLabels([]);
    },

    // 2. BEESWARM (Timeline)
    timeline: () => {
        const scaleX = d3.scaleLinear().domain([1990, 2024]).range([50, width-50]);
        
        simulation
            .force("x", d3.forceX(d => scaleX(d.year)).strength(0.8))
            .force("y", d3.forceY(height/2).strength(0.05))
            .force("charge", d3.forceManyBody().strength(-3)) // Leggera repulsione
            .alpha(0.5).restart();

        updateLabels([
            {text: "1990", x: 60, y: height/2 + 80},
            {text: "2024", x: width-60, y: height/2 + 80}
        ]);
    },

    // 3. BAR CHART (Stacked)
    barchart: () => {
        const centers = { "Vis": width*0.25, "InfoVis": width*0.5, "VAST": width*0.75 };
        
        simulation
            .force("x", d3.forceX(d => centers[d.group] || width/2).strength(0.4))
            .force("y", d3.forceY(height).strength(0.1)) // Gravità giù
            .force("charge", d3.forceManyBody().strength(-1))
            .alpha(0.5).restart();

        updateLabels([
            {text: "Vis/SciVis", x: width*0.25, y: 100},
            {text: "InfoVis", x: width*0.5, y: 100},
            {text: "VAST", x: width*0.75, y: 100}
        ]);
    },

    // 4. BUTTERFLY (Binary Comparison)
    butterfly: () => {
        // North America (Left) vs World (Right)
        simulation
            .force("x", d3.forceX(d => d.isNA ? width*0.35 : width*0.65).strength(0.3))
            .force("y", d3.forceY(height/2).strength(0.05))
            .force("charge", d3.forceManyBody().strength(-2))
            .alpha(0.5).restart();

        updateLabels([
            {text: "North America", x: width*0.35, y: 80},
            {text: "Rest of World", x: width*0.65, y: 80}
        ]);
    },

    // 5. SCATTER PLOT
    scatter: () => {
        const scaleX = d3.scaleLinear().domain([1990, 2024]).range([100, width-100]);
        const scaleY = d3.scaleLog().domain([1, 2000]).range([height-100, 50]).clamp(true);

        simulation
            .force("x", d3.forceX(d => scaleX(d.year)).strength(0.5))
            .force("y", d3.forceY(d => scaleY(Math.max(1, d.citations))).strength(0.5))
            .force("charge", null) // No repulsione, posizione esatta
            .alpha(0.8).restart();

        updateLabels([
            {text: "High Impact", x: width/2, y: 40},
            {text: "Year", x: width-50, y: height-50}
        ]);
    },

    // 6. HISTOGRAM (Binning)
    histogram: () => {
        // 3 Bins: <10, 10-50, >50
        const centers = [width*0.25, width*0.5, width*0.75];
        
        simulation
            .force("x", d3.forceX(d => {
                if(d.citations < 10) return centers[0];
                if(d.citations < 50) return centers[1];
                return centers[2];
            }).strength(0.4))
            .force("y", d3.forceY(height).strength(0.1)) // Gravità giù
            .force("charge", d3.forceManyBody().strength(-1))
            .alpha(0.5).restart();

        updateLabels([
            {text: "< 10 Cites", x: centers[0], y: height-50},
            {text: "10-50 Cites", x: centers[1], y: height-50},
            {text: "50+ Cites", x: centers[2], y: height-50}
        ]);
    },

    // 7. RADIAL / PIE
    radial: () => {
        const groups = ["Vis", "InfoVis", "VAST"];
        const angleScale = d3.scalePoint().domain(groups).range([0, Math.PI*2]).padding(0.5);
        const r = Math.min(width, height) * 0.3; // Raggio

        simulation
            .force("x", d3.forceX(d => width/2 + Math.cos(angleScale(d.group) - Math.PI/2) * r).strength(0.2))
            .force("y", d3.forceY(d => height/2 + Math.sin(angleScale(d.group) - Math.PI/2) * r).strength(0.2))
            .force("charge", d3.forceManyBody().strength(-5))
            .alpha(0.5).restart();

        updateLabels(groups.map(g => ({
            text: g,
            x: width/2 + Math.cos(angleScale(g) - Math.PI/2) * (r+60),
            y: height/2 + Math.sin(angleScale(g) - Math.PI/2) * (r+60)
        })));
    },

    // 8. GEO MAP (Simulated)
    map: () => {
        // Approssimazione coordinate schermo per regioni
        const geoCenters = {
            "North America": {x: width*0.3, y: height*0.4},
            "Europe": {x: width*0.55, y: height*0.4},
            "Asia/Other": {x: width*0.75, y: height*0.5}
        };

        simulation
            .force("x", d3.forceX(d => geoCenters[d.region].x).strength(0.2))
            .force("y", d3.forceY(d => geoCenters[d.region].y).strength(0.2))
            .force("charge", d3.forceManyBody().strength(-3))
            .alpha(0.5).restart();

        updateLabels([
            {text: "North America", x: width*0.3, y: height*0.6},
            {text: "Europe", x: width*0.55, y: height*0.6},
            {text: "Asia & Oceania", x: width*0.75, y: height*0.7}
        ]);
    },

    // 9. NETWORK (Clusters)
    network: () => {
        simulation
            .force("x", d3.forceX(width/2).strength(0.01)) // Debole centro
            .force("y", d3.forceY(height/2).strength(0.01))
            // Questa è la forza magica: attrai verso il centro del tuo gruppo
            .force("cluster", alpha => {
                const foci = {
                    "Vis": {x: width*0.3, y: height*0.4},
                    "InfoVis": {x: width*0.7, y: height*0.4},
                    "VAST": {x: width*0.5, y: height*0.75}
                };
                nodes.forEach(d => {
                    const focus = foci[d.group] || {x:width/2, y:height/2};
                    d.vx += (focus.x - d.x) * 0.05 * alpha;
                    d.vy += (focus.y - d.y) * 0.05 * alpha;
                });
            })
            .force("charge", d3.forceManyBody().strength(-5))
            .alpha(0.5).restart();

        updateLabels([
            {text: "Vis Cluster", x: width*0.3, y: height*0.3},
            {text: "InfoVis Cluster", x: width*0.7, y: height*0.3},
            {text: "VAST Cluster", x: width*0.5, y: height*0.9}
        ]);
    },

    // 10. CALENDAR HEATMAP
    calendar: () => {
        // X = Mese (0-11), Y = Anno
        const years = d3.extent(nodes, d => d.year);
        const cellW = (width - 100) / 12;
        const cellH = (height - 100) / (years[1] - years[0]);
        
        simulation
            .force("x", d3.forceX(d => 50 + d.month * cellW + cellW/2).strength(0.8))
            .force("y", d3.forceY(d => 50 + (d.year - years[0]) * cellH).strength(0.8))
            .force("charge", null) // Griglia stretta
            .alpha(0.8).restart();

        updateLabels([
            {text: "Jan", x: 50 + 0 * cellW, y: 30},
            {text: "Dec", x: 50 + 11 * cellW, y: 30},
            {text: "1990", x: 30, y: 50},
            {text: "2024", x: 30, y: height-50}
        ]);
    }
};

// --- HELPER: LABEL UPDATER ---
function updateLabels(data) {
    const texts = labelsLayer.selectAll("text").data(data, d => d.text);
    texts.exit().transition().duration(500).style("opacity", 0).remove();
    texts.enter().append("text")
        .attr("class", "annotation")
        .attr("x", d => d.x).attr("y", d => d.y)
        .text(d => d.text).style("opacity", 0)
        .merge(texts)
        .transition().duration(1000)
        .attr("x", d => d.x).attr("y", d => d.y).style("opacity", 1);
}

// --- SCROLLAMA ---
function initScroller() {
    scrollama().setup({ step: "#scrolly article .step", offset: 0.6 })
        .onStepEnter(res => {
            const mode = d3.select(res.element).attr("data-mode");
            d3.selectAll(".step").classed("is-active", false);
            d3.select(res.element).classed("is-active", true);
            if(forces[mode]) forces[mode]();
        });
}