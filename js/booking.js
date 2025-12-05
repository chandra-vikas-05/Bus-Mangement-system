document.addEventListener("DOMContentLoaded", async () => {
    // --- AUTH CHECK ---
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const token = localStorage.getItem("token");
    
    const currentPath = window.location.pathname.toLowerCase();
    const isLoginPage = currentPath.endsWith("login.html") || currentPath === "/";
    
    if (!currentUser || !token) {
        if (!isLoginPage) {
            window.location.href = "login.html";
            return;
        }
    }

    // --- DISPLAY BOOKING DETAILS (booking.html) ---
    const busDetailsContainer = document.getElementById("busDetails");
    const paymentForm = document.getElementById("paymentForm");
    
    if (busDetailsContainer && paymentForm) {
        const selectedBusId = localStorage.getItem("selectedBusId");
        if (!selectedBusId) {
            alert("No bus selected. Redirecting to home.");
            window.location.href = "index.html";
            return;
        }

        // Fetch bus details from API
        const busResult = await api.getBusById(selectedBusId);
        const bus = busResult.bus;

        if (!bus) {
            alert("Error finding bus details.");
            window.location.href = "index.html";
            return;
        }

        // Display bus details
        busDetailsContainer.innerHTML = `
            <h3>${bus.busName}</h3>
            <p><strong>Bus Number:</strong> ${bus.busNumber}</p>
            <p><strong>Type:</strong> ${bus.busType}</p>
            <p><strong>Departure:</strong> ${bus.departureTime}</p>
            <p><strong>Arrival:</strong> ${bus.arrivalTime}</p>
            <p><strong>Seats Available:</strong> ${bus.seatsAvailable}</p>
            <hr>
            <h3 class="price">Price per seat: ₹ ${bus.pricePerSeat}</h3>
        `;

        // --- PAYMENT FORM SUBMISSION ---
        paymentForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const passengers = parseInt(document.getElementById("passengerName")?.value || 1);
            const seatNumbers = document.getElementById("passengerAge")?.value?.split(',').map(s => s.trim()) || ['1'];

            if (!passengers || seatNumbers.length === 0) {
                alert("Please enter number of passengers and seat numbers.");
                return;
            }

            // Create booking via API
            const bookingResult = await api.createBooking(token, selectedBusId, passengers, seatNumbers);

            if (bookingResult.booking) {
                alert("Booking Successful! Your booking ID: " + bookingResult.booking.bookingId);
                localStorage.removeItem("selectedBusId");
                localStorage.removeItem("busSearchResults");
                localStorage.removeItem("searchQuery");
                window.location.href = "profile.html";
            } else {
                alert(bookingResult.message || "Booking failed!");
            }
        });
    }


    // --- DISPLAY PROFILE & BOOKINGS (profile.html) ---
    const userInfoContainer = document.getElementById("userInfo");
    const myBookingsContainer = document.getElementById("myBookings");

    if (userInfoContainer && myBookingsContainer) {
        // Display user info
        userInfoContainer.innerHTML = `
            <p><strong>Name:</strong> ${currentUser.name}</p>
            <p><strong>Email:</strong> ${currentUser.email}</p>
        `;

        // Fetch user bookings from API
        const bookingsResult = await api.getUserBookings(token);
        const myBookings = bookingsResult.bookings || [];

        if (myBookings.length === 0) {
            myBookingsContainer.innerHTML = "<p>You have no bookings yet.</p>";
        } else {
            myBookings.forEach(booking => {
                const bus = booking.bus;
                const ticketCard = document.createElement("div");
                ticketCard.className = "bus-card";
                ticketCard.innerHTML = `
                    <div class="info">
                        <h4>${bus.busName} (${booking.status})</h4>
                        <p>Booking ID: ${booking.bookingId}</p>
                        <p><strong>Passengers:</strong> ${booking.passengers}</p>
                        <p><strong>Seats:</strong> ${booking.seatNumbers.join(', ')}</p>
                        <p><strong>Status:</strong> ${booking.status}</p>
                        <p><strong>Payment:</strong> ${booking.paymentStatus}</p>
                    </div>
                    <div class="price-book">
                        <p class="price">₹ ${booking.totalPrice}</p>
                        ${booking.status !== 'Cancelled' ? `<button class="cancel-btn" data-booking-id="${booking._id}">Cancel Booking</button>` : ''}
                    </div>
                `;
                myBookingsContainer.appendChild(ticketCard);
            });

            // Add cancel event listeners
            document.querySelectorAll(".cancel-btn").forEach(button => {
                button.addEventListener("click", async () => {
                    const bookingId = button.getAttribute("data-booking-id");
                    if (confirm("Are you sure you want to cancel this booking?")) {
                        const result = await api.cancelBooking(token, bookingId);
                        if (result.booking) {
                            alert("Booking cancelled successfully!");
                            location.reload();
                        } else {
                            alert(result.message || "Failed to cancel booking");
                        }
                    }
                });
            });
        }
    }
});