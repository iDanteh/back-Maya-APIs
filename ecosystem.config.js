module.exports = {
    apps: [
        {
        name: "backend-maya",
        script: "src/index.js",
        instances: "max", 
        exec_mode: "cluster", 
        watch: false, 
        autorestart: true,
        merge_logs: true,
        out_file: "/var/log/backend-maya/out.log",
        error_file: "/var/log/backend-maya/error.log",
        env: {
            NODE_ENV: "production",
            PORT: "5000",  
            TZ: "America/Mexico_City"
        }
        }
    ]
};