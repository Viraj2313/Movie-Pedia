import "../assets/styles/Notification.css";

export const triggerNotification = (message, type) => {
  const notificationDiv = document.createElement("div");
  notificationDiv.className = `notification ${type}`;
  notificationDiv.textContent = message;

  document.body.appendChild(notificationDiv);

  setTimeout(() => {
    notificationDiv.remove();
  }, 5000);
};
