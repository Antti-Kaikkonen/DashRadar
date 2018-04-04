# DashRadar
https://dashradar.com

## Prerequisites
[Angular CLI](https://github.com/angular/angular-cli)

## Configuration
[Development config file](src/environments/environment.ts)  
[Production config file](src/environments/environment.prod.ts)

* insightApiUrl: HTTP API URL of https://github.com/dashpay/insight-api-dash
* insightSocketUrl: WebSocket API URL of https://github.com/dashpay/insight-api-dash
* cypherUrl: URL of running https://github.com/Antti-Kaikkonen/Neo4jReadOnly
* chartJsImageURL: URL of running https://github.com/Antti-Kaikkonen/chartjs-cypher

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.
