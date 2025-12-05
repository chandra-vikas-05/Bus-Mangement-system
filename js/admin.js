document.addEventListener("DOMContentLoaded", () => {
    const adminLoginForm = document.getElementById("adminLoginForm");
    const adminDashboard = document.getElementById("adminDashboard");
    const adminLogoutBtn = document.getElementById("adminLogoutBtn");
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    // State for editing
    let currentEditingId = null;

    // Check if admin is already logged in
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
        showDashboard();
        loadStats();
    }

    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabName = btn.getAttribute("data-tab");
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(tc => tc.classList.remove("active"));
            
            // Add active class to clicked button and corresponding content
            btn.classList.add("active");
            document.getElementById(tabName).classList.add("active");
            
            // Load tab data
            if (tabName === "buses") loadBuses();
            if (tabName === "routes") loadRoutes();
            if (tabName === "users") loadUsers();
            if (tabName === "bookings") loadBookings();
        });
    });

    // Admin Login
    adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("adminLoginEmail").value;
        const password = document.getElementById("adminLoginPassword").value;
        
        const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
        try {
            const result = await api.login(email, password);
            
            if (result.token && result.user && result.user.role === 'admin') {
                localStorage.setItem("adminToken", result.token);
                localStorage.setItem("adminUser", JSON.stringify(result.user));
                showDashboard();
                loadStats();
                adminLoginForm.reset();
            } else {
                alert("Access denied! Admin credentials required.");
                submitBtn.disabled = false;
                submitBtn.textContent = 'Admin Login';
            }
        } catch (error) {
            alert("Login failed: " + (error.message || "Unknown error"));
            submitBtn.disabled = false;
            submitBtn.textContent = 'Admin Login';
        }
    });

    // Admin Logout
    adminLogoutBtn.addEventListener("click", () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        adminLoginForm.reset();
        adminLoginForm.style.display = "block";
        adminDashboard.style.display = "none";
    });

    // Show Dashboard
    function showDashboard() {
        adminLoginForm.style.display = "none";
        adminDashboard.style.display = "block";
    }

    // Load Statistics
    async function loadStats() {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) return;
            
            const stats = await api.getAdminDashboardStats(token);
            
            if (stats.success) {
                document.getElementById("totalUsers").textContent = stats.stats.totalUsers || 0;
                document.getElementById("totalBuses").textContent = stats.stats.totalBuses || 0;
                document.getElementById("totalRoutes").textContent = stats.stats.totalRoutes || 0;
                document.getElementById("totalBookings").textContent = stats.stats.totalBookings || 0;
            }
        } catch (error) {
            console.error("Error loading stats:", error);
        }
    }

    // ==================== BUSES ====================

    // Load Buses
    window.loadBuses = async function() {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                alert("Please login first");
                return;
            }
            
            const result = await api.getAdminBuses(token);
            const buses = result.buses || [];
            const busList = document.getElementById("busList");
            busList.innerHTML = "";
            
            if (buses.length === 0) {
                busList.innerHTML = '<div class="empty-state"><p>No buses found. Add a new bus to get started!</p></div>';
                return;
            }
            
            buses.forEach(bus => {
                const item = document.createElement("div");
                item.className = "list-item";
                item.innerHTML = `
                    <div class="list-item-info">
                        <h4>${bus.busNumber || 'N/A'}</h4>
                        <p><strong>Name:</strong> ${bus.busName || 'N/A'} | <strong>Type:</strong> ${bus.busType || 'N/A'}</p>
                        <p><strong>Seats:</strong> ${bus.totalSeats || 0} | <strong>Price:</strong> ₹${bus.pricePerSeat || 0}</p>
                        <p><strong>Departure:</strong> ${bus.departureTime || 'N/A'} | <strong>Arrival:</strong> ${bus.arrivalTime || 'N/A'}</p>
                        <p><span class="status-badge ${bus.isActive ? 'status-active' : 'status-inactive'}">${bus.isActive ? 'Active' : 'Inactive'}</span></p>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn-edit" onclick="editBus('${bus._id}')">Edit</button>
                        <button class="btn-delete" onclick="deleteBus('${bus._id}')">Delete</button>
                    </div>
                `;
                busList.appendChild(item);
            });
        } catch (error) {
            console.error("Error loading buses:", error);
            alert("Failed to load buses: " + error.message);
        }
    };

    // Add Bus
    document.getElementById("addBusForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem("adminToken");
        if (!token) {
            alert("Please login first");
            return;
        }
        
        // Get routes for bus assignment
        try {
            const routesResult = await api.getAdminRoutes(token);
            const routes = routesResult.routes || [];
            
            if (routes.length === 0) {
                alert("Please create at least one route before adding a bus!");
                return;
            }
            
            // Get form values
            const busNumber = document.getElementById("busName").value.trim();
            const totalSeats = parseInt(document.getElementById("busSeats").value);
            const busType = document.getElementById("busType").value.trim();
            const pricePerSeat = parseFloat(document.getElementById("busFare").value);
            
            if (!busNumber || !totalSeats || !busType || !pricePerSeat) {
                alert("Please fill in all required fields");
                return;
            }
            
            const busData = {
                busNumber: busNumber,
                busName: busNumber,
                totalSeats: totalSeats,
                busType: busType,
                pricePerSeat: pricePerSeat,
                route: routes[0]._id,
                departureTime: "08:00",
                arrivalTime: "14:00",
                departureDate: new Date().toISOString().split('T')[0]
            };
            
            const result = await api.createAdminBus(token, busData);
            
            if (result.success) {
                alert("Bus added successfully!");
                document.getElementById("addBusForm").reset();
                loadBuses();
            } else {
                alert("Failed to add bus: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    });

    // Edit Bus
    window.editBus = async (busId) => {
        const token = localStorage.getItem("adminToken");
        try {
            currentEditingId = busId;
            const result = await api.getAdminBuses(token);
            const buses = result.buses || [];
            const bus = buses.find(b => b._id === busId);
            
            if (!bus) {
                alert("Bus not found");
                return;
            }
            
            // Populate edit form with bus data
            document.getElementById("editBusName").value = bus.busName || bus.busNumber;
            document.getElementById("editBusSeats").value = bus.totalSeats;
            document.getElementById("editBusType").value = bus.busType;
            document.getElementById("editBusPrice").value = bus.pricePerSeat;
            document.getElementById("editBusStatus").value = bus.isActive ? "true" : "false";
            
            openModal('editBusModal');
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    // Save Edit Bus
    document.getElementById("editBusForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem("adminToken");
        if (!token || !currentEditingId) return;
        
        try {
            const busData = {
                busName: document.getElementById("editBusName").value.trim(),
                totalSeats: parseInt(document.getElementById("editBusSeats").value),
                busType: document.getElementById("editBusType").value.trim(),
                pricePerSeat: parseFloat(document.getElementById("editBusPrice").value),
                isActive: document.getElementById("editBusStatus").value === "true"
            };
            
            if (!busData.busName || !busData.totalSeats || !busData.busType || !busData.pricePerSeat) {
                alert("Please fill in all required fields");
                return;
            }
            
            const result = await api.updateAdminBus(token, currentEditingId, busData);
            
            if (result.success) {
                alert("Bus updated successfully!");
                closeModal('editBusModal');
                currentEditingId = null;
                loadBuses();
            } else {
                alert("Failed to update bus: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    });

    // Delete Bus
    window.deleteBus = async (busId) => {
        if (!confirm("Are you sure you want to delete this bus? This action cannot be undone.")) return;
        
        const token = localStorage.getItem("adminToken");
        try {
            const result = await api.deleteAdminBus(token, busId);
            
            if (result.success) {
                alert("Bus deleted successfully!");
                loadBuses();
            } else {
                alert("Failed to delete bus: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    // Delete Bus
    window.deleteBus = async (busId) => {
        if (!confirm("Are you sure you want to delete this bus?")) return;
        
        const token = localStorage.getItem("adminToken");
        try {
            const result = await api.deleteAdminBus(token, busId);
            
            if (result.success) {
                alert("Bus deleted successfully!");
                loadBuses();
            } else {
                alert("Failed to delete bus: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    // ==================== ROUTES ====================

    // Load Routes
    window.loadRoutes = async function() {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                alert("Please login first");
                return;
            }
            
            const result = await api.getAdminRoutes(token);
            const routes = result.routes || [];
            const routeList = document.getElementById("routeList");
            routeList.innerHTML = "";
            
            if (routes.length === 0) {
                routeList.innerHTML = '<div class="empty-state"><p>No routes found. Add a new route to get started!</p></div>';
                return;
            }
            
            routes.forEach(route => {
                const item = document.createElement("div");
                item.className = "list-item";
                item.innerHTML = `
                    <div class="list-item-info">
                        <h4>${route.source} → ${route.destination}</h4>
                        <p><strong>Distance:</strong> ${route.distance} km | <strong>Duration:</strong> ${route.duration} minutes</p>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn-edit" onclick="editRoute('${route._id}')">Edit</button>
                        <button class="btn-delete" onclick="deleteRoute('${route._id}')">Delete</button>
                    </div>
                `;
                routeList.appendChild(item);
            });
        } catch (error) {
            console.error("Error loading routes:", error);
            alert("Failed to load routes");
        }
    };

    // Add Route
    document.getElementById("addRouteForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem("adminToken");
        if (!token) {
            alert("Please login first");
            return;
        }
        
        const routeData = {
            routeName: document.getElementById("routeFrom").value + " - " + document.getElementById("routeTo").value,
            source: document.getElementById("routeFrom").value,
            destination: document.getElementById("routeTo").value,
            distance: parseInt(document.getElementById("routeDistance").value),
            duration: parseInt(document.getElementById("routeDuration").value)
        };
        
        try {
            const result = await api.createAdminRoute(token, routeData);
            
            if (result.success) {
                alert("Route added successfully!");
                document.getElementById("addRouteForm").reset();
                loadRoutes();
            } else {
                alert("Failed to add route: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    });

    // Edit Route
    window.editRoute = async (routeId) => {
        const token = localStorage.getItem("adminToken");
        try {
            currentEditingId = routeId;
            const result = await api.getAdminRoutes(token);
            const routes = result.routes || [];
            const route = routes.find(r => r._id === routeId);
            
            if (!route) {
                alert("Route not found");
                return;
            }
            
            document.getElementById("editRouteSource").value = route.source;
            document.getElementById("editRouteDestination").value = route.destination;
            document.getElementById("editRouteDistance").value = route.distance;
            document.getElementById("editRouteDuration").value = route.duration;
            
            openModal('editRouteModal');
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    // Save Edit Route
    document.getElementById("editRouteForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem("adminToken");
        if (!currentEditingId) return;
        
        const routeData = {
            routeName: document.getElementById("editRouteSource").value + " - " + document.getElementById("editRouteDestination").value,
            source: document.getElementById("editRouteSource").value,
            destination: document.getElementById("editRouteDestination").value,
            distance: parseInt(document.getElementById("editRouteDistance").value),
            duration: parseInt(document.getElementById("editRouteDuration").value)
        };
        
        try {
            const result = await api.updateAdminRoute(token, currentEditingId, routeData);
            
            if (result.success) {
                alert("Route updated successfully!");
                closeModal('editRouteModal');
                currentEditingId = null;
                loadRoutes();
            } else {
                alert("Failed to update route: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    });

    // Delete Route
    window.deleteRoute = async (routeId) => {
        if (!confirm("Are you sure you want to delete this route?")) return;
        
        const token = localStorage.getItem("adminToken");
        try {
            const result = await api.deleteAdminRoute(token, routeId);
            
            if (result.success) {
                alert("Route deleted successfully!");
                loadRoutes();
            } else {
                alert("Failed to delete route: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    // ==================== USERS ====================

    // Load Users
    window.loadUsers = async function() {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                alert("Please login first");
                return;
            }
            
            const result = await api.getAdminUsers(token);
            const users = result.users || [];
            const userList = document.getElementById("userList");
            userList.innerHTML = "";
            
            if (users.length === 0) {
                userList.innerHTML = '<div class="empty-state"><p>No users found</p></div>';
                return;
            }
            
            users.forEach(user => {
                const item = document.createElement("div");
                item.className = "list-item";
                item.innerHTML = `
                    <div class="list-item-info">
                        <h4>${user.name}</h4>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Phone:</strong> ${user.phone || 'N/A'} | <strong>Role:</strong> <span class="status-badge status-${user.role === 'admin' ? 'active' : 'inactive'}">${user.role}</span></p>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn-edit" onclick="editUser('${user._id}')">Edit</button>
                        <button class="btn-delete" onclick="deleteUser('${user._id}')">Delete</button>
                    </div>
                `;
                userList.appendChild(item);
            });
        } catch (error) {
            console.error("Error loading users:", error);
            alert("Failed to load users");
        }
    };

    // Edit User
    window.editUser = async (userId) => {
        const token = localStorage.getItem("adminToken");
        try {
            currentEditingId = userId;
            const result = await api.getAdminUserById(token, userId);
            
            if (!result.user) {
                alert("User not found");
                return;
            }
            
            const user = result.user;
            document.getElementById("editUserName").value = user.name;
            document.getElementById("editUserEmail").value = user.email;
            document.getElementById("editUserPhone").value = user.phone || '';
            document.getElementById("editUserAddress").value = user.address || '';
            document.getElementById("editUserRole").value = user.role;
            
            openModal('editUserModal');
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    // Save Edit User
    document.getElementById("editUserForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem("adminToken");
        if (!currentEditingId) return;
        
        const userData = {
            name: document.getElementById("editUserName").value,
            email: document.getElementById("editUserEmail").value,
            phone: document.getElementById("editUserPhone").value,
            address: document.getElementById("editUserAddress").value,
            role: document.getElementById("editUserRole").value
        };
        
        try {
            const result = await api.updateAdminUser(token, currentEditingId, userData);
            
            if (result.success) {
                alert("User updated successfully!");
                closeModal('editUserModal');
                currentEditingId = null;
                loadUsers();
            } else {
                alert("Failed to update user: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    });

    // Delete User
    window.deleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        
        const token = localStorage.getItem("adminToken");
        try {
            const result = await api.deleteAdminUser(token, userId);
            
            if (result.success) {
                alert("User deleted successfully!");
                loadUsers();
            } else {
                alert("Failed to delete user: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    // ==================== BOOKINGS ====================

    // Load Bookings
    window.loadBookings = async function() {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                alert("Please login first");
                return;
            }
            
            const result = await api.getAdminBookings(token);
            const bookings = result.bookings || [];
            const bookingList = document.getElementById("bookingList");
            bookingList.innerHTML = "";
            
            if (bookings.length === 0) {
                bookingList.innerHTML = '<div class="empty-state"><p>No bookings found</p></div>';
                return;
            }
            
            bookings.forEach(booking => {
                const item = document.createElement("div");
                item.className = "list-item";
                const userName = booking.user?.name || 'Unknown';
                const busNumber = booking.bus?.busNumber || 'Unknown';
                item.innerHTML = `
                    <div class="list-item-info">
                        <h4>Booking ID: ${booking.bookingId || booking._id}</h4>
                        <p><strong>Passenger:</strong> ${userName} | <strong>Bus:</strong> ${busNumber}</p>
                        <p><strong>Passengers:</strong> ${booking.passengers} | <strong>Total Price:</strong> $${booking.totalPrice}</p>
                        <p><span class="status-badge ${getStatusClass(booking.status)}">${booking.status}</span></p>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn-edit" onclick="updateBookingStatus('${booking._id}')">Change Status</button>
                        <button class="btn-delete" onclick="deleteBooking('${booking._id}')">Cancel</button>
                    </div>
                `;
                bookingList.appendChild(item);
            });
        } catch (error) {
            console.error("Error loading bookings:", error);
            alert("Failed to load bookings");
        }
    };

    // Update Booking Status
    window.updateBookingStatus = async (bookingId) => {
        const token = localStorage.getItem("adminToken");
        const newStatus = prompt("Enter new status (confirmed/cancelled/completed):");
        
        if (!newStatus) return;
        if (!['confirmed', 'cancelled', 'completed'].includes(newStatus)) {
            alert("Invalid status! Use: confirmed, cancelled, or completed");
            return;
        }
        
        try {
            const result = await api.updateAdminBookingStatus(token, bookingId, newStatus);
            
            if (result.success) {
                alert("Booking status updated successfully!");
                loadBookings();
            } else {
                alert("Failed to update booking: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    // Delete Booking
    window.deleteBooking = async (bookingId) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        
        const token = localStorage.getItem("adminToken");
        try {
            const result = await api.cancelAdminBooking(token, bookingId);
            
            if (result.success) {
                alert("Booking cancelled successfully!");
                loadBookings();
            } else {
                alert("Failed to cancel booking: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    // ==================== MODALS ====================

    // Open Modal
    window.openModal = function(modalId) {
        document.getElementById(modalId).style.display = "block";
    };

    // Close Modal
    window.closeModal = function(modalId) {
        document.getElementById(modalId).style.display = "none";
        currentEditingId = null;
    };

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains("modal")) {
            event.target.style.display = "none";
        }
    };

    // ==================== HELPERS ====================

    function getStatusClass(status) {
        if (status === 'confirmed' || status === 'Confirmed') return 'status-active';
        if (status === 'cancelled' || status === 'Cancelled') return 'status-inactive';
        return 'status-inactive';
    }
});
