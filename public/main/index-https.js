
window.debug = false;
if (window.location.protocol == "https:") {
  console.log("🔒10 Running in https");
} else if (
  window.location.protocol !== "https:" &&
  window.location.hostname !== "localhost" &&
  window.location.protocol !== "file:"
) {
  window.location.protocol = "https";
  console.log("🔒10 Enforcing https");
} else {
  console.log("🛠️10 Running in localhost or file, not enforcing https");
}