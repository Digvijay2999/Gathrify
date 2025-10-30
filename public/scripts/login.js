document.addEventListener("DOMContentLoaded", function () {
  // ✅ Handle login/register toggle
  const container = document.querySelector(".container");
  const registerBtn = document.querySelector(".register-btn");
  const loginBtn = document.querySelector(".login-btn");

  if (registerBtn && loginBtn && container) {
    registerBtn.addEventListener("click", () => {
      container.classList.add("active");
    });

    loginBtn.addEventListener("click", () => {
      container.classList.remove("active");
    });
  }

  
});
function showCustomAlert(message) {
  const alertBox = document.getElementById("custom-alert");
  const messageElement = document.getElementById("alert-message");
  messageElement.textContent = message;
  alertBox.classList.remove("hidden");
}

function hideCustomAlert() {
  document.getElementById("custom-alert").classList.add("hidden");
}

