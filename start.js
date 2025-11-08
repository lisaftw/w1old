require("dotenv").config()

console.log("Starting Discord Bot with integrated OAuth Server...")

const bot = require("./index.js")

process.on("SIGINT", () => {
  console.log("Shutting down...")
  process.exit()
})
