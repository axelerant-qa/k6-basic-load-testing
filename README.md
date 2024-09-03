# K6 Load Testing with Grafana and InfluxDB
This guide demonstrates how to perform load testing using containerized instances of K6, Grafana, and InfluxDB.

### Usage

If you haven't installed Docker Compose yet, you can download it from here: https://docs.docker.com/compose/install/ 

#### Note: Update your base URL in `/scripts/*.js` file before execution.

Run the following commands:

 - `docker compose up -d influxdb grafana`
 - `docker compose run k6 run /scripts/home.js`

### Dashboards Live Tracking
The dashboard is adapted from the excellent K6 / Grafana dashboard.

 - Hit this URL once your k6 script starts executing: http://localhost:3000/d/k6/k6-load-testing-results

### Reporting

1. *Custom HTML Report*

   After your K6 script completes, run the following command:

    - `node html_report.js`

    This will generate a HTML report under `report/report.html` directory.

2. *Default HTML Report*

   After your K6 script completes, you'll get auto-generated report under `/scripts/report.html`directory.


