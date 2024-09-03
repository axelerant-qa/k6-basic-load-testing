import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// A simple counter for http requests

export const requests = new Counter('http_reqs');

// you can specify stages of your test (ramp up/down patterns) through the options object
// target is the number of VUs you are aiming for

export const options = {
  //Smoke testing
  // vus: 1, // 1 user looping for 1 minute
  // duration: '1m',

  stages: [
    { duration: "1m", target: 200 }, // ramp up to 200 VUs in 1m
    // { duration: "1m30s", target: 100 }, // maintain 100 VUs for 1 minute and 30 seconds
    // { duration: "30s", target: 0 }, // ramp down to 0 VUs in 30s
  ],


  //“Average” load test or Soak testig if system under pressure for an extended period.
  // stages: [
  //   { duration: '5m', target: 100 }, // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
  //   { duration: '10m', target: 100 }, // stay at 100 users for 10 minutes
  //   { duration: '5m', target: 0 }, // ramp-down to 0 users
  // ],

  //Stress testing
//   scenarios: {
//     stress: {
//       executor: 'ramping-arrival-rate',
//       // Our test with at a rate of 300 iterations started per `timeUnit` (e.g minute).
//       startRate: 300,
//       // It should start `startRate` iterations per minute
//       timeUnit: '1m',
//       // It should preallocate 2 VUs before starting the test.
//       preAllocatedVUs: 2,
//       // It is allowed to spin up to 50 maximum VUs in order to sustain the defined
//       // constant arrival rate.
//       maxVUs: 50,
//       stages: [
//         // It should start 300 iterations per `timeUnit` for the first minute.
//         { target: 300, duration: '1m' },
//         // It should linearly ramp-up to starting 600 iterations per `timeUnit` over the following two minutes.
//         { target: 600, duration: '2m' },
//         // It should continue starting 600 iterations per `timeUnit` for the following four minutes.
//         { target: 600, duration: '4m' },
//         // It should linearly ramp-down to starting 60 iterations per `timeUnit` over the last two minute.
//         { target: 60, duration: '2m' },
//       ],
//     },
//   },
// spike: {
//   executor: "ramping-arrival-rate",
//   preAllocatedVUs: 1000,
//   timeUnit: "1s",
//   stages: [
//     { duration: "10s", target: 10 }, // below normal load
//     { duration: "1m", target: 10 },
//     { duration: "10s", target: 140 }, // spike to 140 iterations
//     { duration: "3m", target: 140 }, // stay at 140 for 3 minutes
//     { duration: "10s", target: 10 }, // scale down. Recovery stage.
//     { duration: "3m", target: 10 },
//     { duration: "10s", target: 0 },
//   ],
//   gracefulStop: "2m",
// },
// };

  thresholds: {
    // http_req_duration: ["p(95)<1000"], // 95% of requests should complete in less than 1 second
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    checks: ['rate>0.9'], // the rate of successful checks should be higher than 90%
    // http_req_duration: ['p(95)<700'], // 95% of requests should be below 700ms
  },

};

let errors_metrics = new Counter("my_errors");


export default function () {
  // our HTTP request, note that we are saving the response to res, which can be accessed later
  let headers = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  };
  const response = http.get('https://the-internet.herokuapp.com/frames',{headers:headers});

  sleep(1);

  let checkRes = check(response, {
    'status is 200': (r) => r.status === 200,
  });

  if (!checkRes) {
    console.log(
      `URL: ${response.request.url} STATUS CODE: ${response.status}`
    );
    console.log(
      "FAILED RESPOSE TIME: " + String(response.timings.duration) + " ms"
    );
    errors_metrics.add(1, { url: response.request.url });
}
}

import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export function handleSummary(data) {
  console.log('Preparing the end-of-test summary...');
  return {
    "/scripts/result.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
      '/scripts/test_results.json': JSON.stringify(data),
  }
}