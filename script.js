(function () {
  var HAS_PAID_KEY = "hasPaid";
  var PREMIUM_KEY = "fitai_premium";
  var PAYMENT_URL = "https://yandex.ru";

  function hasPaid() {
    return localStorage.getItem(HAS_PAID_KEY) === "true";
  }

  function isPremium() {
    return localStorage.getItem(PREMIUM_KEY) === "true";
  }

  function updateStatusBadge() {
    var badge = document.getElementById("subscriptionStatus");
    if (!badge) return;
    var paid = hasPaid();
    badge.textContent = paid ? "Status: Premium" : "Status: Free";
    badge.classList.toggle("status-badge--premium", paid);
  }

  function updatePremiumVisibility() {
    var premium = isPremium();
    document.querySelectorAll("[data-premium-hide]").forEach(function (el) {
      el.classList.toggle("ad-slot--hidden", premium);
    });
    document.querySelectorAll("[data-free-only]").forEach(function (el) {
      el.classList.toggle("is-hidden", premium);
    });
  }

  function showToast(message) {
    var toast = document.createElement("div");
    toast.className = "toast toast--success";
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    setTimeout(function () {
      toast.classList.remove("is-visible");
      setTimeout(function () {
        toast.remove();
      }, 240);
    }, 2800);
  }

  function completePaymentSuccess() {
    localStorage.setItem(HAS_PAID_KEY, "true");
    localStorage.setItem(PREMIUM_KEY, "true");
    updateStatusBadge();
    updatePremiumVisibility();
    showToast("Оплата прошла успешно!");
  }

  function handlePaymentSuccessFromUrl() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("success") !== "true") return false;
    completePaymentSuccess();
    params.delete("success");
    var nextQuery = params.toString();
    var cleanUrl = window.location.pathname + (nextQuery ? "?" + nextQuery : "") + window.location.hash;
    window.history.replaceState({}, "", cleanUrl);
    return true;
  }

  function makePayment() {
    window.location.href = PAYMENT_URL;
  }

  function setFreePlan() {
    localStorage.setItem(HAS_PAID_KEY, "false");
    localStorage.setItem(PREMIUM_KEY, "false");
    updateStatusBadge();
    updatePremiumVisibility();
  }

  function protectDashboard() {
    if (handlePaymentSuccessFromUrl()) return;
    if (window.location.pathname.toLowerCase().endsWith("/dashboard.html") && !hasPaid()) {
      window.location.href = "index.html#pricing";
    }
  }

  window.FitAIAuth = {
    hasPaid: hasPaid,
    isPremium: isPremium,
    updateStatusBadge: updateStatusBadge,
    updatePremiumVisibility: updatePremiumVisibility,
    showToast: showToast,
    completePaymentSuccess: completePaymentSuccess,
    handlePaymentSuccessFromUrl: handlePaymentSuccessFromUrl,
    makePayment: makePayment,
    setFreePlan: setFreePlan,
    protectDashboard: protectDashboard
  };

  document.addEventListener("DOMContentLoaded", function () {
    handlePaymentSuccessFromUrl();
    protectDashboard();
    updateStatusBadge();
    updatePremiumVisibility();
  });
})();
