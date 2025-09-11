import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import path from "path";

const app = express();

// Trust proxy for proper IP detection in development and production
app.set('trust proxy', 1);

// Security Middleware
app.use(cors()); // Enable CORS

// Configure helmet for development-friendly security headers
if (process.env.NODE_ENV === 'development') {
  // Permissive security headers for development
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP in development for Vite compatibility
    crossOriginEmbedderPolicy: false, // Allow cross-origin embedder policy for dev tools
  }));
} else {
  // Full security headers for production
  app.use(helmet());
}

// Rate Limiting - Completely disabled in development to prevent 429 blocking
if (process.env.NODE_ENV !== 'development') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests, please try again later.",
  });
  app.use(limiter);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request Validation Middleware (Example - could be more sophisticated)
app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body cannot be empty." });
    }
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      // Assuming 'log' is a function defined elsewhere for logging
      // If not, it should be imported or defined. For now, using console.log
      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Centralized Error Handling Middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`Error: ${err.stack || err}`); // Log the error stack for debugging

    res.status(status).json({ message });
    // Do not re-throw here if you want the error handling to be the last step
    // throw err; // Removed to prevent double error handling or unexpected behavior
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    // Default to no-HMR mode in development to avoid WebSocket handshake issues in Replit
    console.log("🔨 Building frontend (no-HMR mode to avoid WebSocket issues)...");
    const { build } = await import('vite');
    const viteConfig = (await import('../vite.config.js')).default;
    await build({ ...viteConfig, configFile: false });
    console.log("✅ Frontend build complete, serving static assets");
    // Use the correct build output directory from vite config
    const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
    app.use(express.static(distPath));
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(`serving on port ${port}`); // Assuming 'log' is console.log
  });
})();