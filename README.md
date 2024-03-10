![CG Header](https://raw.githubusercontent.com/chaos-genius/.github/main/images/CG-banner.png)

<p align="center">
    <a href="https://www.chaosgenius.io/"><b>Website</b></a> •
    <a href="https://docs.chaosgenius.io"><b>Docs</b></a> •
    <a href="https://www.chaosgenius.io/blog/"><b>Blog</b></a> •
    <a href="https://www.linkedin.com/company/chaosgenius/"><b>LinkedIn</b></a> •
    <a href="https://join.slack.com/t/chaosgenius/shared_invite/zt-140042uac-rrm~xbx9o_aydi6PTmp_Mg"><b>Community Slack</b></a>
</p>

<p align="center">
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href="#contributors-"><img src="https://img.shields.io/badge/all_contributors-32-orange.svg" alt="All Contributors"></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<a href="https://github.com/chaos-genius/chaos_genius/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/chaos-genius/chaos_genius" alt="License"></a>
<a href="https://github.com/chaos-genius/chaos_genius/releases"><img src="https://img.shields.io/github/v/release/chaos-genius/chaos_genius" alt="Latest release"></a>
<a href="https://github.com/chaos-genius/chaos_genius/actions/workflows/python-test.yml"><img src="https://github.com/chaos-genius/chaos_genius/actions/workflows/python-test.yml/badge.svg" alt="Test status"></a>
<a href="https://github.com/chaos-genius/chaos_genius"><img src="https://img.shields.io/github/stars/chaos-genius/chaos_genius" alt="Give us a star!"></a>
<a href="https://github.com/chaos-genius/chaos_genius/tree/develop"><img src="https://img.shields.io/github/last-commit/chaos-genius/chaos_genius/develop" alt="Last commit"></a>

</p>

<h3 align="center">ML powered analytics engine for outlier detection and root cause analysis</h3>

<br/>

## ✨ What is Chaos Genius?


Chaos Genius is an open source ML powered analytics engine for outlier detection and root cause analysis. Chaos Genius can be used to monitor and analyse high dimensionality business, data and system metrics at scale. 

Using Chaos Genius, users can segment large datasets by key performance metrics (e.g. Daily Active Users, Cloud Costs, Failure Rates) and important dimensions (e.g., countryID, DeviceID, ProductID, DayofWeek) across which they want to monitor and analyse the key metrics.

<!--Chaos Genius comes with a UI that offers simple point-and-click functionality for various tasks like adding data sources, defining the key performance metrics with dimensions and setting up advaned analytics. -->


### Use Chaos Genius if you want: 
- Multidimensional Drill Downs & Insights
- Anomaly Detection
- Smart Alerting
- Seasonality Detection*
- Automated Root Cause Analysis*
- Forecasting*
- What-If Analysis*

**in Short and Medium-term Roadmap*

### Demo

<!--
To try it out, check out our [Demo.](https://demo-github.chaosgenius.io/#/0) Or explore live dashboards for:

- [E-commmerce](https://demo-github.chaosgenius.io/#/dashboard/1/deepdrills/4)
- [Music](https://demo-github.chaosgenius.io/#/dashboard/3/deepdrills/8)
- [Ride-Hailing](https://demo-github.chaosgenius.io/#/dashboard/4/deepdrills/25)
- [Cloud Monitoring](https://demo-github.chaosgenius.io/#/dashboard/2/deepdrills/27)
- [Data Quality](#) (coming soon)
-->

<!--[See more on our website. ](https://chaosgenius.io/)-->

[A small demo of Chaos Genius](https://chaosgenius-public.s3.amazonaws.com/test-cg-1-small.gif)


<!-- ## Architecture

![image](/img/cg-high-level-arch.png) -->

## ⚙️ Quick Start

<a href="https://docs.chaosgenius.io/docs/setup/local-setup/"><img src=".github/images/local_button_noborder.png" width="120px" /><a/>
<a href="https://docs.chaosgenius.io/docs/setup/aws-setup/"><img src=".github/images/aws_button_noborder.png" width="120px" /><a/>
<a href="https://docs.chaosgenius.io/docs/setup/gcp-setup/"><img src=".github/images/gcp_button_noborder.png" width="120px" /><a/>

```
git clone https://github.com/chaos-genius/chaos_genius

cd chaos_genius

docker-compose up
```

Visit [http://localhost:8080](http://localhost:8080/)

Follow this [Quick Start guide](https://docs.chaosgenius.io/docs/Quick_Start/prereqs) or read our [Documentation](https://docs.chaosgenius.io/docs/introduction) for more details.

## :dizzy: Key Features

### 1. Automated DeepDrills 

Generate multidimensional drilldowns to identify the key drivers of change in defined metrics (e.g. Sales) across a large number of high cardinality dimensions (e.g. CountryID, ProductID, BrandID, Device_type).
- Techniques: Statistical Filtering, A* like path based search to deal with combinatorial explosion

![DD](https://raw.githubusercontent.com/chaos-genius/.github/main/images/DeepDrills.png)

<!-- TODO: add an image or illustration here -->

### 2. Anomaly Detection

Modular anomaly detection toolkit for monitoring high-dimensional time series with ability to select from different models. Tackle variations caused by seasonality, trends and holidays in the time series data.
- Models: Prophet, EWMA, EWSTD, Neural Prophet, Greykite
    
![Anomaly](https://raw.githubusercontent.com/chaos-genius/.github/main/images/AnomalyDrillDowns.png)


<!-- TODO: add an image or illustration here -->


### 3. Smart Alerts

Actionable alerts with self-learning thresholds. Configurations to setup alert frequency & reporting to combat alert fatigue. 
- Channels: Email, Slack
<!-- TODO: add an image or illustration here -->
    
![Alerting](https://raw.githubusercontent.com/chaos-genius/.github/main/images/Alerting-Dark.png)

## :octocat: Community

For any help, discussions and suggestions feel free to reach out to the Chaos Genius team and the community here:

-   [GitHub](https://github.com/chaos-genius/.github) (report bugs, contribute, follow roadmap)

-   [Slack](https://join.slack.com/t/chaosgenius/shared_invite/zt-140042uac-rrm~xbx9o_aydi6PTmp_Mg) (discuss with the community and Chaos Genius team)

-   [Book Office Hours](https://calendly.com/chaosgenius/30min) (set up time with the Chaos Genius team for any questions or help with setup)

-   [Blog](https://chaosgenius.io/blog/) (follow us on latest trends on Data, Machine Learning, Open Source and more)


## 🚦 Roadmap

Our goal is to make Chaos Genius production ready for all organisations irrespective of their data infrasturcture, data sources and scale requirements. With that in mind we have created a [roadmap](https://docs.chaosgenius.io/docs/roadmap/) for Chaos Genius. If you see something missing or wish to make suggestions, please drop us a line on our [Community Slack](https://join.slack.com/t/chaosgenius/shared_invite/zt-140042uac-rrm~xbx9o_aydi6PTmp_Mg) or raise an issue.



## :seedling: Contributing 

Want to contribute? Get started with:

-   Show us some love - Give us a :star2:!
    
-   Submit an issue.

-   Share a part of the documentation that you find difficult to follow.

-   [Translate our Readme](https://github.com/chaos-genius/chaos_genius/blob/main/README.md).

-   Create a pull request. Here's a [list of issues](https://github.com/chaos-genius/chaos_genius/issues) to start with. Please review our [contribution guidelines](https://github.com/chaos-genius/chaos_genius/blob/main/CONTRIBUTING.md) before opening a pull request. Thank you for contributing!



## :heart: Contributors 

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
    <td align="center"><a href="https://buggydebugger.com/"><img src="https://avatars.githubusercontent.com/u/7734938?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rajdeep Sharma</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=rjdp" title="Code">💻</a> <a href="https://github.com/chaos-genius/chaos_genius/pulls?q=is%3Apr+reviewed-by%3Arjdp" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/balakumar9493"><img src="https://avatars.githubusercontent.com/u/98518511?v=4?s=100" width="100px;" alt=""/><br /><sub><b>balakumar9493</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=balakumar9493" title="Code">💻</a> <a href="#design-balakumar9493" title="Design">🎨</a></td>
    <td align="center"><a href="https://bandism.net/"><img src="https://avatars.githubusercontent.com/u/22633385?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ikko Ashimine</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=eltociear" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/rsohlot"><img src="https://avatars.githubusercontent.com/u/5600987?v=4?s=100" width="100px;" alt=""/><br /><sub><b>rohit sohlot</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/commits?author=rsohlot" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/athul-osmo"><img src="https://avatars.githubusercontent.com/u/99287880?v=4?s=100" width="100px;" alt=""/><br /><sub><b>athul-osmo</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3Aathul-osmo" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://blog.kshivendu.dev/"><img src="https://avatars.githubusercontent.com/u/47217984?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kumar Shivendu</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3AKShivendu" title="Bug reports">🐛</a> <a href="#ideas-KShivendu" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://pratham-sharma.com"><img src="https://avatars.githubusercontent.com/u/63733573?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pratham Sharma</b></sub></a><br /><a href="https://github.com/chaos-genius/chaos_genius/issues?q=author%3AprathamSharma25" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/churchill1973"><img src="https://avatars.githubusercontent.com/u/62685164?v=4?s=100" width="100px;" alt=""/><br /><sub><b>churchill1973</b></sub></a><br /><a href="#ideas-churchill1973" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## 📜 License

Chaos Genius is licensed under the [MIT license](https://github.com/chaos-genius/chaos_genius/blob/main/LICENSE.md).
