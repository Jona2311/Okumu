document.addEventListener("DOMContentLoaded", function () {
    let selectedHealthCenter = null;
    
    // ===================== Story Submission Modal Code =====================
    // Function to show the story submission modal
    function openStoryModal(healthCenterId) {
        selectedHealthCenter = healthCenterId;
        document.getElementById("selectedHealthCenterId").value = healthCenterId;
        document.getElementById("storyModal").classList.remove("hidden");
        document.body.style.overflow = "hidden"; // Prevent scrolling
    }
    
    // Function to hide the story modal
    function closeStoryModal() {
        document.getElementById("storyModal").classList.add("hidden");
        document.body.style.overflow = "auto"; // Re-enable scrolling
    }
    
    // Close modal when clicking the X button
    document.getElementById("closeModal").addEventListener("click", closeStoryModal);
    
    // Cancel button action
    document.getElementById("cancelStory").addEventListener("click", closeStoryModal);
    
    // Submit story action (manual submission via modal)
    document.getElementById("submitStory").addEventListener("click", function () {
        let title = document.getElementById("storyTitle").value;
        let content = document.getElementById("storyContent").value;
        let author = document.getElementById("storyAuthor").value || "Anonymous";
    
        if (!title || !content) {
            showNotification("Please enter both a title and a story.", "error");
            return;
        }
    
        // Show loading state
        this.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
        this.disabled = true;
    
        fetch("/add-story/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": "{{ csrf_token }}"
            },
            body: JSON.stringify({
                health_center_id: selectedHealthCenter,
                title: title,
                content: content,
                author: author
            })
        })
        .then(response => response.json())
        .then(data => {
            closeStoryModal();
            // Clear form fields
            document.getElementById("storyTitle").value = "";
            document.getElementById("storyContent").value = "";
            document.getElementById("storyAuthor").value = "";
            
            // Reset button state
            this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>Submit';
            this.disabled = false;
            
            // Show success notification
            showNotification("Your story has been submitted successfully!", "success");
        })
        .catch(error => {
            console.error("Error:", error);
            // Reset button state
            this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>Submit';
            this.disabled = false;
            
            // Show error notification
            showNotification("Failed to submit story. Please try again.", "error");
        });
    });
    
    // Make openStoryModal globally available
    window.openStoryModal = openStoryModal;
    
    // ===================== Notification Function =====================
    window.showNotification = function(message, type = "info") {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-fade-in flex items-center ${
            type === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-700' :
            type === 'error' ? 'bg-red-100 border-l-4 border-red-500 text-red-700' :
            'bg-blue-100 border-l-4 border-blue-500 text-blue-700'
        }`;
        
        let icon = '';
        if (type === 'success') {
            icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
        } else if (type === 'error') {
            icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
        } else {
            icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
        }
        
        notification.innerHTML = `<div class="flex items-center">${icon}${message}</div>`;
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('animate-fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    };
    
    // ===================== Enhanced Chatbot Logic =====================
    // conversationContext will now hold the topic, step, and story details.
    var conversationContext = {
        topic: null,   // e.g., "report_hotspot", "add_story", or "add_health_center"
        step: null,    // for "add_story": "center", "title", "content", "author"; for "add_health_center": "name"
        story: {}      // To store story details or the health center name
    };
    
    // Function to compute Levenshtein distance for fuzzy matching
    function levenshteinDistance(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }
    
    // Function to find a health center by name (with fuzzy matching)
    function findHealthCenterByName(inputName) {
        inputName = inputName.trim().toLowerCase();
        let exactMatch = window.healthCenters && window.healthCenters.find(function(center) {
            return center.name.toLowerCase() === inputName;
        });
        if (exactMatch) {
            return { found: true, center: exactMatch };
        }
        let suggestions = [];
        let bestMatch = null;
        let minDistance = Infinity;
        if (window.healthCenters) {
            for (let center of window.healthCenters) {
                let centerName = center.name.toLowerCase();
                let distance = levenshteinDistance(inputName, centerName);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestMatch = center;
                }
                if (distance <= 3) {
                    suggestions.push(center.name);
                }
            }
        }
        if (minDistance <= Math.floor(inputName.length / 2) || suggestions.length > 0) {
            return { found: true, center: bestMatch, suggestions: suggestions };
        }
        return { found: false, suggestions: suggestions };
    }
    
    // Function to pin a hotspot using geolocation and persist it to the backend
    function pinHotspot(name, description) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;

                fetch('/core/add-hotspot/', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": "{{ csrf_token }}"
                    },
                    body: JSON.stringify({
                        name: name || "Reported Hotspot",
                        description: description || "",
                        latitude: lat,
                        longitude: lng
                    })
                })
                .then(response => {
                    if (response.status === 403) {
                        // Not logged in or insufficient permission
                        appendMessage('bot', "Please login to do this.");
                        return null;
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data) return; // If 403, we bail out

                    // Otherwise, same success logic as before
                    if (data.hotspot) {
                        var marker = L.marker(
                            [data.hotspot.latitude, data.hotspot.longitude],
                            { icon: hotspotIcon }
                        ).addTo(map);

                        hotspotMarkers.push(marker);
                        marker.bindPopup(
                            `<div class='p-3'>
                                <h3 class='font-bold text-red-600'>${data.hotspot.name}</h3>
                                <p class='text-sm'>${description || "No description provided."}</p>
                            </div>`
                        ).openPopup();

                        showNotification("Hotspot added successfully!", "success");
                    } else {
                        showNotification("Failed to save hotspot.", "error");
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    showNotification("Error reporting hotspot.", "error");
                });
            }, function (error) {
                showNotification("Unable to retrieve your location.", "error");
            });
        } else {
            showNotification("Geolocation is not supported by your browser.", "error");
        }
    }
    
    
    // Function to submit a story via chatbot conversation
    function submitStoryViaChat(story, healthCenterId) {
        fetch('/core/add-story/', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": "{{ csrf_token }}"
            },
            body: JSON.stringify({
                health_center_id: healthCenterId,
                title: story.title,
                content: story.content,
                author: story.author
            })
        })
        .then(response => response.json())
        .then(data => {
            appendMessage('bot', "Your story was submitted successfully!");
        })
        .catch(error => {
            console.error(error);
            appendMessage('bot', "There was an error submitting your story. Please try again later.");
        });
    }
    
    // ===================== NEW HEALTH CENTER ADDITION LOGIC =====================
    // Helper function to add a health center
    function addHealthCenter(name) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;

                fetch('/core/add-health-center/', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": "{{ csrf_token }}"
                    },
                    body: JSON.stringify({
                        name: name,
                        latitude: lat,
                        longitude: lng
                    })
                })
                .then(response => {
                    if (response.status === 403) {
                        // Not logged in or insufficient permission
                        appendMessage('bot', "Please login to do this.");
                        return null;
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data) return; // If 403, bail out

                    // Otherwise, same success logic as before
                    if (data.health_center) {
                        var marker = L.marker(
                            [data.health_center.latitude, data.health_center.longitude]
                        ).addTo(map);

                        healthCenterMarkers.push(marker);
                        marker.bindPopup(
                            `<div class='p-3'>
                                <h3 class='font-bold text-blue-600'>${data.health_center.name}</h3>
                            </div>`
                        ).openPopup();

                        showNotification("Health center added successfully!", "success");
                    } else {
                        showNotification("Failed to add health center.", "error");
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    showNotification("Error adding health center.", "error");
                });
            }, function (error) {
                showNotification("Unable to retrieve your location.", "error");
            });
        } else {
            showNotification("Geolocation is not supported by your browser.", "error");
        }
    }
    
    
    // ===================== Enhanced rule-based Chatbot Response =====================
    // Save the original getBotResponse in case you want to reuse it
    var originalGetBotResponse = function(userMessage) {
        var msg = userMessage.toLowerCase().trim();
        // ----- Handle "add story" flow -----
        if (conversationContext.topic === "add_story") {
            if (conversationContext.step === "center") {
                let result = findHealthCenterByName(userMessage);
                if (result.found) {
                    conversationContext.story.center = { id: result.center.id, name: result.center.name };
                    conversationContext.step = "title";
                    return "Health center found: " + result.center.name + ". Please provide the title for your story.";
                } else {
                    if (result.suggestions && result.suggestions.length > 0) {
                        return "No exact match found. Did you mean: " + result.suggestions.join(", ") + "? Please re-enter the health center name.";
                    } else {
                        return "No health center found with that name. Please check the spelling and try again.";
                    }
                }
            }
            if (conversationContext.step === "title") {
                conversationContext.story.title = userMessage;
                conversationContext.step = "content";
                return "Got it. Now please provide the content for your story.";
            }
            if (conversationContext.step === "content") {
                conversationContext.story.content = userMessage;
                conversationContext.step = "author";
                return "Thanks. Lastly, please provide your name (or say 'Anonymous').";
            }
            if (conversationContext.step === "author") {
                conversationContext.story.author = (msg === "anonymous" ? "Anonymous" : userMessage);
                submitStoryViaChat(conversationContext.story, conversationContext.story.center.id);
                conversationContext.topic = null;
                conversationContext.step = null;
                conversationContext.story = {};
                return "Your story is being submitted. Thank you!";
            }
        }
    
        // ----- Handle "report hotspot" flow -----
        if (conversationContext.topic === "report_hotspot") {
            if (conversationContext.step === "name") {
                conversationContext.story.hotspot_name = userMessage;
                conversationContext.step = "description";
                return "Got it. Would you like to add a description for this hotspot? (Type 'skip' to leave it blank.)";
            }
            if (conversationContext.step === "description") {
                if (userMessage.toLowerCase() === "skip") {
                    conversationContext.story.hotspot_description = "";
                } else {
                    conversationContext.story.hotspot_description = userMessage;
                }
                let hotspotName = conversationContext.story.hotspot_name;
                let hotspotDescription = conversationContext.story.hotspot_description;
                conversationContext.topic = null;
                conversationContext.step = null;
                conversationContext.story = {};
                pinHotspot(hotspotName, hotspotDescription);
                return "Thank you! I'm now pinning your hotspot with the provided details.";
            }
        }
        if (msg.includes("report hotspot") || msg.includes("pin hotspot") || msg.includes("new hotspot")) {
            conversationContext.topic = "report_hotspot";
            conversationContext.step = "name";
            conversationContext.story = {};
            return "Let's report a hotspot. Please provide a name for the hotspot.";
        }
    
        // ----- NEW: Handle "hotzone" queries -----
        if (msg.includes("hot zone")) {
            return "A hot zone represents an area with high sexual activity and an elevated HIV risk, based on reported sexual interactions. It highlights regions where increased testing and prevention efforts may be needed.";
        }

        // New branch: Respond to health center description queries
        if (msg.includes("health center") || msg.includes("health center description") || msg.includes("healthcenters") || msg.includes("what is a health center") || msg.includes("health centers") || msg.includes("healthcenter")){
            return "Health centers provide essential services such as HIV testing, counseling, STI treatment, contraceptive distribution, and community outreach programs. They play a critical role in harm reduction by offering safe spaces for education, prevention, and support for individuals at higher risk.";
        }
    
        // ----- Other FAQs and common queries -----
        if (msg.includes("story") || msg.includes("stories")) {
            return "Community stories help us understand local challenges. To submit your story, type 'add story' or click the 'Add Story' button in a health center's details.";
        } else if (msg.includes("map")) {
            return "The interactive map displays health centers, hot zones, and hotspots. Tap on markers for more details.";
        } else if (msg.includes("help")) {
            return "I can help answer questions about app features such as stories, map details, and hotspots. You can say 'add story' or 'report hotspot'.";
        } else if (msg.includes("hotspot")) {
            return "Hotspots indicate areas with elevated health risks. To report one, simply say 'report hotspot'.";
        } else if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
            return "Hello! I'm your assistant. How can I help you today?";
        } else if (msg.includes("thank")) {
            return "You're welcome! Let me know if there's anything else I can help you with.";
        } else {
            return "I'm not sure I understand. Could you please rephrase or ask about 'stories', 'map features', or 'hotspots'?";
        }
    };
    
    // Extend the chatbot's getBotResponse function to handle health center addition
    function getBotResponse(userMessage) {
        var msg = userMessage.toLowerCase().trim();
    
        // ===================== Check for "add health center" =====================
        if (msg.includes("add health center") || msg.includes("submit health center")) {
            // If not logged in, stop immediately
            if (!IS_USER_LOGGED_IN) {
                conversationContext.topic = null;
                conversationContext.step = null;
                conversationContext.story = {};
                return "Please login to do this.";
            }
            // Otherwise proceed
            conversationContext.topic = "add_health_center";
            conversationContext.step = "name";
            conversationContext.story = {};
            return "Let's add a new health center. Please provide the name of the health center.";
        }
    
        // ===================== Check for "report hotspot" =====================
        if (msg.includes("report hotspot") || msg.includes("pin hotspot") || msg.includes("new hotspot")) {
            // If not logged in, stop immediately
            if (!IS_USER_LOGGED_IN) {
                conversationContext.topic = null;
                conversationContext.step = null;
                conversationContext.story = {};
                return "Please login to do this.";
            }
            // Otherwise proceed
            conversationContext.topic = "report_hotspot";
            conversationContext.step = "name";
            conversationContext.story = {};
            return "Let's report a hotspot. Please provide a name for the hotspot.";
        }
    
        // ===================== Handle "add_health_center" flow =====================
        if (conversationContext.topic === "add_health_center") {
            if (conversationContext.step === "name") {
                conversationContext.story.name = userMessage;
                addHealthCenter(conversationContext.story.name);
                // Reset context and confirm
                conversationContext.topic = null;
                conversationContext.step = null;
                conversationContext.story = {};
                return "Your health center is being added with the name: " + userMessage;
            }
        }
    
        // ===================== Handle "report_hotspot" flow =====================
        if (conversationContext.topic === "report_hotspot") {
            if (conversationContext.step === "name") {
                conversationContext.story.hotspot_name = userMessage;
                conversationContext.step = "description";
                return "Got it. Would you like to add a description for this hotspot? (Type 'skip' to leave it blank.)";
            }
            if (conversationContext.step === "description") {
                if (userMessage.toLowerCase() === "skip") {
                    conversationContext.story.hotspot_description = "";
                } else {
                    conversationContext.story.hotspot_description = userMessage;
                }
                let hotspotName = conversationContext.story.hotspot_name;
                let hotspotDescription = conversationContext.story.hotspot_description;
                // Reset context and call pinHotspot
                conversationContext.topic = null;
                conversationContext.step = null;
                conversationContext.story = {};
                pinHotspot(hotspotName, hotspotDescription);
                return "Thank you! I'm now pinning your hotspot with the provided details.";
            }
        }
    
        // ===================== Otherwise, fallback to original bot logic =====================
        return originalGetBotResponse(userMessage);
    }
    
    
    
    // Function to handle sending a chatbot message (text/voice)
    function sendMessage() {
        var inputField = document.getElementById('chatbot-input');
        var userText = inputField.value.trim();
        if (userText) {
            appendMessage('user', userText);
            var botResponse = getBotResponse(userText);
            setTimeout(function() {
                appendMessage('bot', botResponse);
            }, 500);
            inputField.value = '';
        }
    }
    
    // Event listener for chatbot send button
    document.getElementById('chatbot-send').addEventListener('click', sendMessage);
    
    // Allow Enter key to send message
    document.getElementById('chatbot-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Setup voice input using Web Speech API if supported
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition;
    
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
    
        recognition.onresult = function(event) {
            var transcript = event.results[0][0].transcript;
            document.getElementById('chatbot-input').value = transcript;
        };
    
        recognition.onspeechend = function() {
            setTimeout(() => {
                let inputField = document.getElementById('chatbot-input');
                if (inputField.value.trim() !== "") {
                    sendMessage();
                }
            }, 1000);
        };
    
        recognition.onerror = function(event) {
            console.error("Speech recognition error:", event.error);
        };
    }
    
    // Event listener for microphone button to trigger voice input
    document.getElementById('chatbot-mic').addEventListener('click', function() {
        if (recognition) {
            recognition.start();
            this.classList.add('bg-blue-200');
            setTimeout(() => this.classList.remove('bg-blue-200'), 1000);
        } else {
            showNotification("Voice recognition is not supported in this browser.", "error");
        }
    });
    
    // Function to append a message to the chatbot messages area with custom styling
    function appendMessage(sender, text) {
        var messagesDiv = document.getElementById('chatbot-messages');
        var messageElement = document.createElement('div');
        if (sender === 'bot') {
            messageElement.className = 'chat-message chat-message-bot animate-fade-in';
        } else {
            messageElement.className = 'chat-message chat-message-user animate-fade-in';
        }
        messageElement.textContent = text;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    // ===================== Chatbot Panel Toggle Logic =====================
    document.getElementById('chatbot-toggle-button').addEventListener('click', function() {
        const panel = document.getElementById('chatbot-panel');
        panel.classList.remove('hidden');
        this.classList.add('hidden');
        if (document.getElementById('chatbot-messages').children.length === 0) {
            appendMessage('bot', "Hello! I'm your assistant. How can I help you today?");
            appendMessage('bot', "You can ask me about stories, the map, or hotspots.");
        }
    });
    
    document.getElementById('chatbot-close').addEventListener('click', function() {
        let chatbotPanel = document.getElementById('chatbot-panel');
        chatbotPanel.classList.add('animate-fade-out');
        setTimeout(() => {
            chatbotPanel.classList.add('hidden');
            chatbotPanel.classList.remove('animate-fade-out');
            document.getElementById('chatbot-toggle-button').classList.remove('hidden');
        }, 300);
    });
});
