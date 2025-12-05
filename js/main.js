document.addEventListener("DOMContentLoaded", async () => {
    // --- AUTHENTICATION CHECK ---
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const token = localStorage.getItem("token");
    
    // Show admin link if user is admin
    const adminLink = document.getElementById("adminLink");
    if (adminLink && currentUser && currentUser.role === "admin") {
        adminLink.style.display = "block";
    }
    
    // Get current page path
    const currentPath = window.location.pathname.toLowerCase();
    const isLoginPage = currentPath.endsWith("login.html") || currentPath === "/";
    const isAuthPage = isLoginPage || currentPath.endsWith("contact.html");
    
    // If user is not logged in and not on login/auth pages, redirect to login
    if (!currentUser || !token) {
        if (!isAuthPage) {
            window.location.href = "login.html";
            return;
        }
    }

    // --- LOGOUT BUTTON ---
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("currentUser");
            localStorage.removeItem("token");
            window.location.href = "login.html";
        });
    }


    // --- BUS SEARCH (index.html) ---
    const searchBusForm = document.getElementById("searchBusForm");
    if (searchBusForm) {
        searchBusForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // Get search values
            const source = document.getElementById("from").value;
            const destination = document.getElementById("to").value;
            const date = document.getElementById("date").value;

            // Disable button during search
            const submitBtn = searchBusForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Searching...';

            // Fetch buses from API with filters
            const result = await api.getAllBuses({ source, destination, date });
            
            if (result.error) {
                alert("Error fetching buses: " + result.message);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Search Buses';
                return;
            }

            const results = result.buses || [];

            // Save search criteria and results to localStorage
            localStorage.setItem("busSearchResults", JSON.stringify(results));
            localStorage.setItem("searchQuery", JSON.stringify({ source, destination, date }));

            // Redirect to routes page
            window.location.href = "routes.html";
        });
    }


    // --- DISPLAY SEARCH RESULTS (routes.html) ---
    const busListContainer = document.getElementById("busList");
    if (busListContainer) {
        const results = JSON.parse(localStorage.getItem("busSearchResults")) || [];
        const query = JSON.parse(localStorage.getItem("searchQuery"));
        
        const searchQueryTitle = document.getElementById("searchQueryTitle");
        if (query) {
             searchQueryTitle.textContent = `Showing buses from ${query.source} to ${query.destination} on ${query.date}`;
        }

        if (results.length === 0) {
            busListContainer.innerHTML = "<p>No buses found for your search.</p>";
        } else {
            results.forEach(bus => {
                const busCard = document.createElement("div");
                busCard.className = "bus-card";
                busCard.innerHTML = `
                    <div class="info">
                        <h4>${bus.busName}</h4>
                        <p><strong>Bus:</strong> ${bus.busNumber} (${bus.busType})</p>
                        <p><strong>Departs:</strong> ${bus.departureTime} | <strong>Arrives:</strong> ${bus.arrivalTime}</p>
                        <p>Seats Available: ${bus.seatsAvailable}</p>
                        <p>Amenities: ${bus.amenities.join(', ') || 'None'}</p>
                    </div>
                    <div class="price-book">
                        <p class="price">₹ ${bus.pricePerSeat}</p>
                        <button class="book-btn" data-bus-id="${bus._id}">Book Now</button>
                    </div>
                `;
                busListContainer.appendChild(busCard);
            });

            // Add event listeners to "Book Now" buttons
            document.querySelectorAll(".book-btn").forEach(button => {
                button.addEventListener("click", (e) => {
                    const busId = e.target.getAttribute("data-bus-id");
                    localStorage.setItem("selectedBusId", busId);
                    window.location.href = "booking.html";
                });
            });
        }
    }
});