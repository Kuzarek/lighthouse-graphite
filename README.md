# lighthouse-graphite

NodeJS app that get metrics from a website using [lighthouse](https://github.com/GoogleChrome/lighthouse/) and sends them to a graphite service.

## Usage

`lighthouse-graphite url [flags]`

### flags
- `--runs` (Number, defaults to `3`): number of lighthouse runs.
- `--graphite-host` (String): the host of the graphite service where metrics are going to be sent to. If not defined, the metrics will be only printed in the console.
- `--graphite-prefix` (String, defaults to empty string): the argument's value will be added as a prefix to all metrics sent to graphite. You should at least set the website's url (replace all dots and other special characters to avoid issues with graphite), to be able to collect different metrics for different pages without metric collision.
- `--metrics-blacklist` (Values separated by commas, defaults to empty string): set this argument to ignore one or more metrics from being sent to graphite. This is useful when you have a limit on the number of metrics stored by graphite. Names of metrics are listed below.
- `--function-blacklist` (Values separated by commas, defaults to empty string): set this argument to ignore one or more aggregation functions from being sent to graphite. This is useful when you have a limit on the number of metrics stored by graphite. Possible values: `min`, `max`, `mean` and `median`.
- `--blocked-url-patterns` (Values separated by commas, defaults to empty string): set this argument to tell Chrome what URLs of requests to block while loading the page. Basic wildcard support using `*`.
- `--throughput-mbps` (Intiger value in Mbps, `1.6` by default): setting network throttling in Mbps, will not work with `--throttling-method=provided` example: `--throughput-mbps=5.0`.
- `--cpu-slowdown-multiplier` (Integer value, defaults to `4`): set this flag to use cpu slowdown setting provided by lighthouse. Setting slowdown to `1x` will not affect the statistics. example: `--cpu-slowdown-multiplier=2`.
- `--name` (String): this value will add prefix to the generated report, it's mandatory for report to be generated.
- `--output` (String, defaults to html): generated report extension. Possible values: `csv`, `json`, `html`.
- `--chrome-flags` (Values separated by commas, defaults to empty): set these values to change chrome behaviour. Example: `--chrome-flags=--headless,--disable-gpu,--no-sandbox,--incognito`

The following command will run `lighthouse` 5 times on `https://www.example.com`, ignore the `mean` and `max` functions, and ignore the `seo-score` and `best-practices-score` metrics:

`lighthouse-graphite https://www.example.com --run=5 --graphite-host=graphite.example.com --graphite-prefix=lighthouse.example_com --metrics-blacklist=seo-score,best-practices-score --function-blacklist=mean,max`

These metrics would be sent to `graphite.example.com`:

```
lighthouse.example_com.first-contentful-paint.min 751
lighthouse.example_com.first-contentful-paint.median 751
lighthouse.example_com.first-meaningful-paint.min 788
lighthouse.example_com.first-meaningful-paint.median 788
lighthouse.example_com.speed-index.min 869
lighthouse.example_com.speed-index.median 900
lighthouse.example_com.estimated-input-latency.min 12
lighthouse.example_com.estimated-input-latency.median 12
lighthouse.example_com.time-to-first-byte.min 106
lighthouse.example_com.time-to-first-byte.median 107
lighthouse.example_com.first-cpu-idle.min 824
lighthouse.example_com.first-cpu-idle.median 825
lighthouse.example_com.interactive.min 824
lighthouse.example_com.interactive.median 825
lighthouse.example_com.network-requests.min 1
lighthouse.example_com.network-requests.median 1
lighthouse.example_com.total-byte-weight.min 800
lighthouse.example_com.total-byte-weight.median 800
lighthouse.example_com.dom-size.min 13
lighthouse.example_com.dom-size.median 13
lighthouse.example_com.performance-score.min 100
lighthouse.example_com.performance-score.median 100
lighthouse.example_com.pwa-score.min 50
lighthouse.example_com.pwa-score.median 50
lighthouse.example_com.accessibility-score.min 88
lighthouse.example_com.accessibility-score.median 88
lighthouse.example_com.total-time.min 4568
lighthouse.example_com.total-time.median 4627
```

## Metrics

The app will collect a sub-set of metrics returned by `lighthouse`, most of them are related to performance. The documentation of these metrics can be found in the [Audit Reference section](https://developers.google.com/web/tools/lighthouse/) of the Lighthouse documentation.

The list of the collected metrics is:
- first-contentful-paint
- first-meaningful-paint
- speed-index
- estimated-input-latency
- time-to-first-byte
- first-cpu-idle
- interactive
- network-requests
- total-byte-weight
- dom-size
- total-time
- performance-score
- pwa-score
- accessibility-score
- best-practices-score
- seo-score

## Generated report
The report will be genarated and saved in a folder named after the last word before the dot in the adress, for example using `http://www.reddit.com` will create `reddit` folder. 
