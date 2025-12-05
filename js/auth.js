document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");

    // Toggle between login and register forms
    showRegister.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.style.display = "none";
        registerForm.style.display = "block";
    });

    showLogin.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.style.display = "block";
        registerForm.style.display = "none";
    });

    // --- REGISTRATION ---
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Get user data
        const name = document.getElementById("registerName").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const phone = document.getElementById("registerPhone")?.value || '';
        const address = document.getElementById("registerAddress")?.value || '';

        // Disable submit button
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';

        // Call backend API
        const result = await api.register(name, email, password, phone, address);

        if (result.token) {
            alert("Registration successful! Welcome aboard!");
            localStorage.setItem("token", result.token);
            localStorage.setItem("currentUser", JSON.stringify(result.user));
            window.location.href = "index.html";
        } else {
            alert(result.message || "Registration failed! Please try again.");
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
    });

    // --- LOGIN ---
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        // Disable submit button
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        // Call backend API
        const result = await api.login(email, password);

        if (result.token) {
            localStorage.setItem("token", result.token);
            localStorage.setItem("currentUser", JSON.stringify(result.user));
            window.location.href = "index.html";
        } else {
            alert(result.message || "Invalid email or password.");
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });
});