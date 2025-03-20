// Global variables and arrays
let zoneClicked = false;
let currentRouteLine = null;
let healthCenterMarkers = [];
let zonePolygons = [];
let hotspotMarkers = [];
let selectedHealthCenterId = null;
let userMarkers = [];

// Initialize the Leaflet map
var map = L.map('map').setView([0.4601, 34.1115], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// Parse JSON data from template
let healthCenters = JSON.parse(document.getElementById('healthcenters_json').textContent);
let zones = JSON.parse(document.getElementById('zones_json').textContent);
let hotspots = JSON.parse(document.getElementById('hotspots_json').textContent);

// Update statistics
document.getElementById('total-centers').textContent = healthCenters.length;
document.getElementById('total-zones').textContent = zones.length;
document.getElementById('total-hotspots').textContent = hotspots.length;

// Count total stories
let totalStories = 0;
healthCenters.forEach(center => {
    totalStories += center.stories.length;
});
document.getElementById('total-stories').textContent = totalStories;

// Define icons
var hotspotIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

var userIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Plot Health Centers
healthCenters.forEach(center => {
    let marker = L.marker([center.latitude, center.longitude]).addTo(map);
    healthCenterMarkers.push(marker);
    
    let popupContent = `
        <div class="p-3">
            <h3 class="font-bold text-blue-600 text-lg mb-1">${center.name}</h3>
            <p class="text-sm text-gray-600 mb-3">${center.stories.length} community ${center.stories.length === 1 ? 'story' : 'stories'}</p>
            <button onclick="showHealthCenterDetails(${center.id})" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors w-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
            </button>
        </div>
    `;
    
    marker.bindPopup(popupContent);
    marker.on('click', function() {
        selectedHealthCenterId = center.id;
    });
});

// Plot Hotspots
hotspots.forEach(hotspot => {
    let marker = L.marker([hotspot.latitude, hotspot.longitude], { icon: hotspotIcon }).addTo(map);
    hotspotMarkers.push(marker);
    marker.bindPopup(`
        <div class="p-2">
            <h3 class="font-bold text-red-600">${hotspot.name}</h3>
            <p class="text-sm text-gray-600 mt-1">${hotspot.description || 'No description available'}</p>
        </div>
    `);
});

// Plot Zones as polygons
zones.forEach(zone => {
    let coordinates = zone.coordinates[0][0];
    let latlngs = coordinates.map(coord => [coord[1], coord[0]]);
    let polygon = L.polygon(latlngs, { 
        color: 'DarkGreen', 
        fillColor: '#023020', 
        fillOpacity: 0.6,
        weight: 2
    }).addTo(map);
    zonePolygons.push(polygon);
    
    // Hover effect
    polygon.on('mouseover', (e) => {
        polygon.setStyle({ fillColor: '#028A0F', weight: 3 });
        let tooltip = L.tooltip({
            permanent: false,
            direction: 'center',
            className: 'zone-tooltip'
        })
        .setContent(`Zone ${zone.zone_id}`)
        .setLatLng(e.latlng);
        polygon.bindTooltip(tooltip).openTooltip();
    });
    polygon.on('mouseout', () => {
        polygon.setStyle({ fillColor: '#023020', weight: 2 });
    });
    
    // Click event to open side panel
    polygon.on('click', function(e) {
        L.DomEvent.stopPropagation(e);
        zoneClicked = true;
        openZonePanel(zone);
        setTimeout(() => { zoneClicked = false; }, 50);
    });
});
    
// Side panel handling for zones
const zonePanel = document.getElementById('zonePanel');
function openZonePanel(zone) {
    let riskPercentage = zone.highlight_stat ? Math.min(zone.highlight_stat, 100) : 0;
    let riskLevel, riskColor, riskBgColor;
    if (riskPercentage <= 33) {
        riskLevel = "Low";
        riskColor = "#10b981";
        riskBgColor = "#d1fae5";
    } else if (riskPercentage <= 66) {
        riskLevel = "Medium";
        riskColor = "#f59e0b";
        riskBgColor = "#fef3c7";
    } else {
        riskLevel = "High";
        riskColor = "#ef4444";
        riskBgColor = "#fee2e2";
    }
    let imageHTML = zone.image_url ? `<img src="${zone.image_url}" alt="Zone Image" class="rounded-lg shadow-sm w-full h-48 object-cover mb-4">` : "";
    zonePanel.innerHTML = `
        <div class="p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800">Zone ${zone.zone_id}</h2>
                <button onclick="closeZonePanel()" class="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            ${imageHTML}
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-5">
                <p class="text-gray-700 leading-relaxed">
                    ${zone.description ? zone.description : "No description available for this hot zone."}
                </p>
            </div>
            <div class="mb-5">
                <h3 class="font-bold text-gray-700 mb-3">HIV Risk Assessment</h3>
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm text-gray-600">Risk Level:</span>
                    <span class="px-3 py-1 rounded-full text-white text-sm font-medium" style="background-color: ${riskColor}">
                        ${riskLevel}
                    </span>
                </div>
                <div class="relative w-48 h-48 mx-auto">
                    <canvas id="donutChart"></canvas>
                    <div class="absolute inset-0 flex items-center justify-center flex-col">
                        <div class="text-3xl font-bold" style="color: ${riskColor}">${riskPercentage}%</div>
                        <div class="text-xs text-gray-500">Risk Factor</div>
                    </div>
                </div>
                <p class="mt-3 text-sm text-gray-600 text-center">
                    Based on reported sexual interactions
                </p>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 class="font-bold text-blue-600 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recommendations
                </h3>
                <ul class="space-y-2 text-sm text-gray-700 list-disc pl-5">
                    <li>Regular HIV testing every 3-6 months</li>
                    <li>Use protection during sexual encounters</li>
                    <li>Visit the nearest health center for counseling</li>
                </ul>
            </div>
        </div>
    `;
    zonePanel.style.width = "30%";
    document.getElementById('map').style.width = "70%";
    setTimeout(() => {
        map.invalidateSize();
        renderDonutChart(riskPercentage, riskColor);
    }, 300);
}
function closeZonePanel() {
    zonePanel.style.width = "0";
    document.getElementById('map').style.width = "100%";
    setTimeout(() => { map.invalidateSize(); }, 300);
}
    
// Donut chart using Chart.js
function renderDonutChart(riskPercentage, riskColor) {
    let remaining = 100 - riskPercentage;
    let ctx = document.getElementById('donutChart').getContext('2d');
    if (window.myDonutChart) { window.myDonutChart.destroy(); }
    window.myDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [riskPercentage, remaining],
                backgroundColor: [riskColor, '#e0e0e0'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '75%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });
}
    
// Map click for user marker placement
map.on('click', (event) => {
    if (zoneClicked) return;
    let lat = event.latlng.lat;
    let lng = event.latlng.lng;
    
    // Remove previous route line if exists
    if (currentRouteLine) {
        map.removeLayer(currentRouteLine);
    }
    
    let newMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
    userMarkers.push(newMarker);
    
    fetch(`/core/get-nearest-healthcenter/?latitude=${lat}&longitude=${lng}`)
        .then(response => response.json())
        .then(result => {
            let nearestCoords = result.coordinates;
            let userCoords = [lat, lng];
            currentRouteLine = L.polyline([userCoords, nearestCoords], { 
                color: '#339fff', 
                weight: 3,
                dashArray: '5, 10',
                opacity: 0.8
            }).addTo(map);
            newMarker.bindPopup(`
                <div class="p-3">
                    <h3 class="font-bold text-purple-600 mb-2">Your Location</h3>
                    <p class="text-sm">Nearest health center: <b>${result.name}</b></p>
                    <p class="text-sm">Distance: <b>${result.distance.toFixed(2)} km</b></p>
                </div>
            `).openPopup();
        })
        .catch(error => {
            console.error("Error:", error);
            newMarker.bindPopup(`
                <div class="p-3 text-center">
                    <p class="text-red-600 font-medium">Error finding nearest health center.</p>
                    <p class="text-sm text-gray-600 mt-1">Please try again later.</p>
                </div>
            `).openPopup();
        });
});
    
// Health center details panel
window.showHealthCenterDetails = function(centerId) {
    const center = healthCenters.find(c => c.id === centerId);
    if (!center) return;
    selectedHealthCenterId = centerId;
    document.getElementById('selected-center-name').textContent = center.name;
    document.getElementById('center-location').textContent = `${center.latitude.toFixed(4)}, ${center.longitude.toFixed(4)}`;
    document.getElementById('center-stories-count').textContent = `${center.stories.length} ${center.stories.length === 1 ? 'story' : 'stories'}`;
    
    if (userMarkers.length > 0) {
        let minDistance = Infinity;
        const centerLatLng = L.latLng(center.latitude, center.longitude);
        userMarkers.forEach(marker => {
            const distance = marker.getLatLng().distanceTo(centerLatLng);
            if (distance < minDistance) { minDistance = distance; }
        });
        document.getElementById('center-distance').textContent = `${(minDistance / 1000).toFixed(2)} km`;
    } else {
        document.getElementById('center-distance').textContent = 'Not calculated';
    }
    
    const storiesList = document.getElementById('center-stories-list');
    if (center.stories.length > 0) {
        let storiesHTML = center.stories.map(story => `
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div class="flex justify-between items-start">
                    <h4 class="font-bold text-gray-800">${story.title}</h4>
                    <span class="text-xs text-gray-500 ml-2">by ${story.author} on ${story.timestamp}</span>
                </div>
                <p class="mt-2 text-sm text-gray-600 leading-relaxed">${story.content}</p>
            </div>
        `).join('');
        storiesList.innerHTML = storiesHTML;
    } else {
        storiesList.innerHTML = '<div class="text-gray-500 text-center py-8">No stories available for this health center.</div>';
    }
    
    document.getElementById('health-center-details').classList.remove('hidden');
    document.getElementById('close-center-details').addEventListener('click', function() {
        document.getElementById('health-center-details').classList.add('hidden');
    });
    
    // Open the story form container when "Add Story" is clicked
    document.getElementById('add-story-button').addEventListener('click', function() {
        openStoryForm(centerId);
    });
};
    
// Layer toggles
document.getElementById('layer-health-centers').addEventListener('change', function(e) {
    healthCenterMarkers.forEach(marker => {
        e.target.checked ? map.addLayer(marker) : map.removeLayer(marker);
    });
});
document.getElementById('layer-zones').addEventListener('change', function(e) {
    zonePolygons.forEach(polygon => {
        e.target.checked ? map.addLayer(polygon) : map.removeLayer(polygon);
    });
});
document.getElementById('layer-hotspots').addEventListener('change', function(e) {
    hotspotMarkers.forEach(marker => {
        e.target.checked ? map.addLayer(marker) : map.removeLayer(marker);
    });
});
    
// Reset view and fullscreen controls
document.getElementById('reset-view').addEventListener('click', function() {
    map.setView([0.4601, 34.1115], 12);
});
document.getElementById('toggle-fullscreen').addEventListener('click', function() {
    const mapContainer = document.getElementById('map-container');
    if (!document.fullscreenElement) {
        mapContainer.requestFullscreen && mapContainer.requestFullscreen();
        this.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-8a2 2 0 01-2-2z" />
            </svg>
        `;
    } else {
        document.exitFullscreen && document.exitFullscreen();
        this.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
        `;
    }
});
    
// Story form functions (appearing outside the map)
function openStoryForm(centerId) {
    document.getElementById('storyFormContainer').classList.remove('hidden');
    document.getElementById('storyCenterId').value = centerId;
    
    // Scroll to the form
    document.getElementById('storyFormContainer').scrollIntoView({ behavior: 'smooth' });
}
document.getElementById('closeStoryForm').addEventListener('click', function() {
    document.getElementById('storyFormContainer').classList.add('hidden');
});
document.getElementById('submitStory').addEventListener('click', function() {
    const centerId = document.getElementById('storyCenterId').value;
    const title = document.getElementById('storyTitle').value;
    const content = document.getElementById('storyContent').value;
    const author = document.getElementById('storyAuthor').value || 'Anonymous';
    
    if (!title || !content) {
        alert("Please enter both a title and a story.");
        return;
    }
    
    fetch('/core/add-story/', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-CSRFToken': '{{ csrf_token }}'
        },
        body: JSON.stringify({
            health_center_id: centerId,
            title: title,
            content: content,
            author: author
        })
    })
    .then(response => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        // Build the new story HTML snippet using data returned from Django
        const newStoryHtml = `
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div class="flex justify-between items-start">
                    <h4 class="font-bold text-gray-800">${data.story.title}</h4>
                    <span class="text-xs text-gray-500 ml-2">by ${data.story.author} on ${data.story.timestamp}</span>
                </div>
                <p class="mt-2 text-sm text-gray-600 leading-relaxed">${data.story.content}</p>
            </div>
        `;
    
        // Append the new story to the list in the health center details
        const storiesList = document.getElementById('center-stories-list');
        if (storiesList.innerHTML.includes("No stories available")) {
            storiesList.innerHTML = newStoryHtml;
        } else {
            storiesList.innerHTML = newStoryHtml + storiesList.innerHTML;
        }
        
        // Update the story count display
        const center = healthCenters.find(c => c.id === parseInt(centerId));
        if (center) {
            center.stories.push(data.story);
            document.getElementById('center-stories-count').textContent = `${center.stories.length} ${center.stories.length === 1 ? 'story' : 'stories'}`;
        }
        
        // Update the total story count display
        let totalStoriesElement = document.getElementById('total-stories');
        totalStoriesElement.textContent = parseInt(totalStoriesElement.textContent) + 1;
        
        // Clear form fields and hide the form
        document.getElementById('storyForm').reset();
        document.getElementById('storyFormContainer').classList.add('hidden');
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md animate-fade-in z-50';
        successMessage.innerHTML = `
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <p>Story submitted successfully!</p>
            </div>
        `;
        document.body.appendChild(successMessage);
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit story. Please try again.');
    });
});
