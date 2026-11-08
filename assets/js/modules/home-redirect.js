(() => {
  try {
    if (localStorage.getItem("agro_app_current_user")) {
      window.location.replace("pages/dashboard.html");
    }
  } catch (error) {
    console.error("Unable to check the saved session:", error);
  }
})();
