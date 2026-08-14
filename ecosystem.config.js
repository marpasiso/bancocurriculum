module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || "banco-curriculos",
      script: "node",
      args: ".next/standalone/server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
