import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

// Import highlight.js styles - use the CDN version instead
// import "highlight.js/styles/atom-one-dark.css"

const root = document.getElementById("root")
if (root) {
  root.classList.remove("loading-fallback")
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} else {
  console.error("❌ No root element found in index.html")
}
