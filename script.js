(function () {
  var HAS_PAID_KEY = "hasPaid";
  var PREMIUM_KEY = "fitai_premium";
  var PAYMENT_URL = "ТВОЯ_ССЫЛКА_ЮMONEY";

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

  function showToast(message, type) {
    var toast = document.createElement("div");
    toast.className = "toast " + (type === "error" ? "toast--error" : "toast--success");
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
    showToast("Оплата прошла успешно!", "success");
  }

  function activateCode(code) {
    if (code === "FITAI2026") {
      localStorage.setItem(HAS_PAID_KEY, "true");
      localStorage.setItem(PREMIUM_KEY, "true");
      updateStatusBadge();
      updatePremiumVisibility();
      showToast("Успешно! Доступ открыт", "success");
      renderPremiumWelcome();
      return true;
    }
    showToast("Неверный код", "error");
    return false;
  }

  function renderPremiumWelcome() {
    var box = document.getElementById("premiumWelcome");
    if (!box) return;
    var paid = hasPaid();
    box.classList.toggle("is-visible", paid);
    box.setAttribute("aria-hidden", paid ? "false" : "true");
  }

  function initScrollReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  function handlePaymentSuccessFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var isSuccess = params.get("success") === "true" || params.get("status") === "success";
    if (!isSuccess) return false;
    completePaymentSuccess();
    params.delete("success");
    params.delete("status");
    var nextQuery = params.toString();
    var cleanUrl = window.location.pathname + (nextQuery ? "?" + nextQuery : "") + window.location.hash;
    window.history.replaceState({}, "", cleanUrl);
    return true;
  }

  function initiatePayment() {
    window.open(PAYMENT_URL, "_blank", "noopener,noreferrer");
  }

  function makePayment() {
    initiatePayment();
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
      window.location.href = "index.html?paywall=required#pricing";
    }
  }

  window.FitAIAuth = {
    hasPaid: hasPaid,
    isPremium: isPremium,
    updateStatusBadge: updateStatusBadge,
    updatePremiumVisibility: updatePremiumVisibility,
    showToast: showToast,
    completePaymentSuccess: completePaymentSuccess,
    activateCode: activateCode,
    renderPremiumWelcome: renderPremiumWelcome,
    initScrollReveal: initScrollReveal,
    handlePaymentSuccessFromUrl: handlePaymentSuccessFromUrl,
    initiatePayment: initiatePayment,
    makePayment: makePayment,
    setFreePlan: setFreePlan,
    protectDashboard: protectDashboard
  };

  document.addEventListener("DOMContentLoaded", function () {
    handlePaymentSuccessFromUrl();
    protectDashboard();
    updateStatusBadge();
    updatePremiumVisibility();
    renderPremiumWelcome();
    initScrollReveal();
  });
})();
