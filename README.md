# Chaos Genius 🔮 (Private Access)
![CG Header](https://github.com/chaos-genius/.github/blob/main/github-cover.png)


<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-24-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Chaos Genius is an open-source business observability platform. Chaos Genius enables businesses to monitor thousands of KPIs, across multiple data sources, and perform automated root cause analysis for any deviation in the KPIs. 

Chaos Genius can help teams reduce their Mean-Time-To-Detect (MTTD) and Mean-Time-To-Resolve (MTTR) for any issues in their business and system KPIs. 

Standard BI dashboards enable data visualization to track how select metrics are trending. However, diagnosing why a particular metric or KPI has changed, remains a woefully manual process involving slicing & dicing the data, coordination with multiple teams in an organisation to identify related events and monitoring externalities. 

With Chaos Genius, we aim to automate the diagnosis and root-cause-analysis for deviations in different business and system KPIs at scale. 

Find detailed [Documentation](https://docs.chaosgenius.io/docs/introduction) here!

![](https://chaosgenius-public.s3.amazonaws.com/test-cg-1-small.gif)



## :white_check_mark: Key Use-Cases

**Business KPI Observability**  - All important business KPIs such as Sign Ups, Payment Gateway Failures, Fraud Detection, Ad Spend, Campaign Performance, DAUs, Retention, Engagement and many others. 

**Data Quality KPI Observability** - Data quality metrics like Data Volume, Freshness, Max, Mean, Median, Min, Missing Data, Null Count and many others. 

**Systems KPI Observability** - System metrics like Cloud Costs, Cloud Failure, Infra performance and many others. 

**IOT/Device KPI Observability** - Device metrics like performance, data volumes, uptime and many others. 


## 🧰 Key Features

**DeepDrills** - Multidimensional drill-downs & waterfall analysis to identify the top drivers of change in a KPI across multiple dimensions. 

**Anomaly Detection** - Modular anomaly detection toolkit for monitoring high-dimensional time series with ability to select from different models. Anomaly investigation across multiple dimensions and data quality metrics like volume, max, mean and missing data. 

**Smart Alerts** - No more alert fatigue from static alerts. Self-learning thresholds to reduce false positives. Configurations to setup alert frequency & severity. Choose from multiple destinations like Slack, Email and other channels for your team.

**Integrations** - Modular architecture to enable multiple data sources including databases, data warehouses and multiple third party connectors like Stripe, Shopify, Zendesk, Google Analytics, and many others.

[See more on our website. ](https://chaosgenius.io/)

<!-- ## Architecture

![image](/img/cg-high-level-arch.png) -->

## ⚙️ Quick Install

```
git clone https://github.com/chaos-genius/chaos_genius

cd chaos_genius

docker-compose up
```

Visit[  http://127.0.0.1:8080](http://localhost:8080/)

### Upgrade from earlier versions

To update the install first make sure the docker containers are down with docker-compose down

Then update the repo & docker builds by following commands:

git pull
docker-compose pull

And then bring back the containers with docker-compose up

### Quick start & support

Follow this [Quick Start guide](https://docs.chaosgenius.io/docs/Quick_Start/Install-Chaos-Genius) showing you how to connect a data source, define your first KPI, configure Anomaly Detector on your local machine. 

If you want to schedule office hours with our team to help you get set up, please select [some time directly here.](https://calendly.com/chaosgenius/30min)

## :seedling: Community

Chaos Genius is a community driven initiative. For any help, discussions, suggestions feel free to reach out to the Chaos Genius team and the Community on either of the following channels. 

-   [GitHub](https://github.com/chaos-genius/.github) (report bugs, contribute, follow roadmap)

-   Slack (For discussion with the Community and Chaos Genius team)

-   [Book Office Hours](https://calendly.com/chaosgenius/30min)(Set Up time with Chaos Genius team for any questions or help with setup)

-   [Blog](https://chaosgenius.io/blog/) (Follow us on latest trends on Data, Machine Learning, Open Source and more)


## 🚦 Roadmap

Our goal is to make Chaos Genius production ready for all organisations irrespective of their data infrasturcture, data sources and scale requirements. With that in mind we have created the following [roadmap](https://docs.chaosgenius.io/docs/Roadmap/Roadmap) for Chaos Genius. If you see something missing or wish to make suggestions, please drop us a line on our community Slack or raise an issue.



## 🐛 Contributing 

Here's a shout out to all our contributors.

Want to contribute? Visit our Github repo and get started with:

-   Try Chaos Genius and share your feedback.

-   Submit an issue. 

-   Create a pull request. Here's a [list of issues](https://github.com/chaos-genius/chaos_genius/issues) to start with.

-   Share a part of the documentation that you find difficult to follow.

-   [Translate our Readme](https://github.com/chaos-genius/chaos_genius/blob/main/README.md).

-   Show us some love - Give us a star!


## 📜 License

Chaos Genius is licensed under the MIT license.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/pshrimal21"><img src="https://avatars.githubusercontent.com/u/83073282?v=4?s=100" width="100px;" alt=""/><br /><sub><b>pshrimal21</b></sub></a><br /><a href="#projectManagement-pshrimal21" title="Project Management">📆</a> <a href="https://github.com/chaos-genius/chaos_genius/commits?author=pshrimal21" title="Documentation">📖</a> <a href="#ideas-pshrimal21" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-pshrimal21" title="Design">🎨</a></td>
    <td align="center"><a href="http://harshitsurana.com"><img src="https://avatars.githubusercontent.com/u/948291?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Harshit Surana</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=suranah" title="Code">💻</a> <a href="#data-suranah" title="Data">🔣</a> <a href="#research-suranah" title="Research">🔬</a> <a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3Asuranah" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://www.manassolanki.com/"><img src="https://avatars.githubusercontent.com/u/20757311?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Manas Solanki</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=manassolanki" title="Code">💻</a> <a href="https://github.com/chaos-genius/chaos_genius/pulls?q=is%3Apr+reviewed-by%3Amanassolanki" title="Reviewed Pull Requests">👀</a> <a href="#tool-manassolanki" title="Tools">🔧</a> <a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3Amanassolanki" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://kartikaybagla.com"><img src="https://avatars.githubusercontent.com/u/19384906?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kartikay Bagla</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=kartikay-bagla" title="Code">💻</a> <a href="#maintenance-kartikay-bagla" title="Maintenance">🚧</a> <a href="#research-kartikay-bagla" title="Research">🔬</a></td>
    <td align="center"><a href="https://github.com/varunp2k"><img src="https://avatars.githubusercontent.com/u/46447751?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Varun P</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=varunp2k" title="Code">💻</a> <a href="#maintenance-varunp2k" title="Maintenance">🚧</a> <a href="#research-varunp2k" title="Research">🔬</a></td>
    <td align="center"><a href="http://keshprad.ml"><img src="https://avatars.githubusercontent.com/u/32313895?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Keshav Pradeep</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=keshprad" title="Code">💻</a> <a href="#data-keshprad" title="Data">🔣</a> <a href="https://github.com/chaos-genius/chaos_genius/commits?author=keshprad" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/dajkatal"><img src="https://avatars.githubusercontent.com/u/47812481?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daj Katal</b></sub></a><br /><a href="#plugin-dajkatal" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/chaos-genius/chaos_genius/commits?author=dajkatal" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/Amatullah"><img src="https://avatars.githubusercontent.com/u/22439823?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Amatullah Sethjiwala</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=Amatullah" title="Code">💻</a> <a href="#data-Amatullah" title="Data">🔣</a> <a href="https://github.com/chaos-genius/chaos_genius/commits?author=Amatullah" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/juzarbhori"><img src="https://avatars.githubusercontent.com/u/49563636?v=4?s=100" width="100px;" alt=""/><br /><sub><b>juzarbhori</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=juzarbhori" title="Code">💻</a> <a href="#design-juzarbhori" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/amoghdhardiwan"><img src="https://avatars.githubusercontent.com/u/41579921?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Amogh Dhar Diwan</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=Fletchersan" title="Code">💻</a> <a href="#data-Fletchersan" title="Data">🔣</a> <a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3AFletchersan" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://samyaks.xyz"><img src="https://avatars.githubusercontent.com/u/34161949?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Samyak Sarnayak</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=Samyak2" title="Code">💻</a> <a href="#platform-Samyak2" title="Packaging/porting to new platform">📦</a> <a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3ASamyak2" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/NaikAayush"><img src="https://avatars.githubusercontent.com/u/57558584?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aayush Naik</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=NaikAayush" title="Code">💻</a> <a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3ANaikAayush" title="Bug reports">🐛</a> <a href="#platform-NaikAayush" title="Packaging/porting to new platform">📦</a></td>
    <td align="center"><a href="https://github.com/kshitij123456"><img src="https://avatars.githubusercontent.com/u/42891697?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kshitij Agarwal</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=kshitij123456" title="Code">💻</a> <a href="#tool-kshitij123456" title="Tools">🔧</a> <a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3Akshitij123456" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/bhargavsk1077"><img src="https://avatars.githubusercontent.com/u/51043479?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bhargav S. Kumar</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=bhargavsk1077" title="Code">💻</a> <a href="#platform-bhargavsk1077" title="Packaging/porting to new platform">📦</a> <a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3Abhargavsk1077" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/moghankumar06"><img src="https://avatars.githubusercontent.com/u/87368217?v=4?s=100" width="100px;" alt=""/><br /><sub><b>moghankumar06</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=moghankumar06" title="Code">💻</a> <a href="#design-moghankumar06" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/Santhoshkumar1023"><img src="https://avatars.githubusercontent.com/u/87367866?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Santhoshkumar1023</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=Santhoshkumar1023" title="Code">💻</a> <a href="#design-Santhoshkumar1023" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/Mansi-Chauhan27"><img src="https://avatars.githubusercontent.com/u/86592223?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mansi-Chauhan27</b></sub></a><br /><a href="#plugin-Mansi-Chauhan27" title="Plugin/utility libraries">🔌</a></td>
    <td align="center"><a href="https://github.com/davidhayter-karhoo"><img src="https://avatars.githubusercontent.com/u/43238713?v=4?s=100" width="100px;" alt=""/><br /><sub><b>davidhayter-karhoo</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3Adavidhayter-karhoo" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://www.floryn.com"><img src="https://avatars.githubusercontent.com/u/73708?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Marijn van Aerle</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3Amvaerle" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/gxu-kangaroo"><img src="https://avatars.githubusercontent.com/u/84041080?v=4?s=100" width="100px;" alt=""/><br /><sub><b>gxu-kangaroo</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3Agxu-kangaroo" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/RamneekKaur983"><img src="https://avatars.githubusercontent.com/u/51482282?v=4?s=100" width="100px;" alt=""/><br /><sub><b>RamneekKaur983</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=RamneekKaur983" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/arvind-27"><img src="https://avatars.githubusercontent.com/u/57091402?v=4?s=100" width="100px;" alt=""/><br /><sub><b>arvind-27</b></sub></a><br /><a href="#data-arvind-27" title="Data">🔣</a></td>
    <td align="center"><a href="https://joshtaylor.id.au"><img src="https://avatars.githubusercontent.com/u/225131?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Josh Taylor</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3Ajoshuataylor" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/ChartistDev"><img src="https://avatars.githubusercontent.com/u/50948001?v=4?s=100" width="100px;" alt=""/><br /><sub><b>ChartistDev</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=ChartistDev" title="Code">💻</a> <a href="#design-ChartistDev" title="Design">🎨</a> <a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3AChartistDev" title="Bug reports">🐛</a> <a href="https://github.com/chaos-genius/chaos_genius/pulls?q=is%3Apr+reviewed-by%3AChartistDev" title="Reviewed Pull Requests">👀</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
