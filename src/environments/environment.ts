// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  insightApiUrl: 'https://dashradar.com/insight-api',
  insightSocketUrl: 'https://dashradar.com',
  //cypherUrl: 'http://localhost:3002/db/data/read-only_query',
  cypherUrl: 'https://dashradar.com/db/data/read-only_query',
  //chartJsImageURL: 'http://localhost:3000'
  chartJsImageURL: 'https://dashradar.com',
  privateSendAnalysisURL: "https://dashradar.com/psresults"
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
