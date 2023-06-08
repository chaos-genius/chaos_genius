![CG Header](https://raw.githubusercontent.com/chaos-genius/.github/main/images/CG-banner.png)

<p align="center">
    <a href="https://www.chaosgenius.io/"><b>网站</b></a> •
    <a href="https://docs.chaosgenius.io"><b>文档</b></a> •
    <a href="https://www.chaosgenius.io/blog/"><b>博客</b></a> •
    <a href="https://www.linkedin.com/company/chaosgenius/"><b>领英</b></a> •
    <a href="https://join.slack.com/t/chaosgenius/shared_invite/zt-140042uac-rrm~xbx9o_aydi6PTmp_Mg"><b>社区Slack</b></a>
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

<h3 align="center">机器学习驱动，用于异常值检测和根本原因分析的引擎</h3>

<br/>

## ✨ 什么是Chaos Genius?


Chaos Genius 是一个开源的机器学习驱动的分析引擎，用于异常值检测和根本原因分析。Chaos Genius 可用于大规模监控和分析高维业务、数据和系统指标。

使用 Chaos Genius，用户可以根据关键性能指标（例如每日活跃用户、云成本、故障率）和他们想要监控和分析关键指标的重要维度（例如，countryID、DeviceID、ProductID、DayofWeek）对大型数据集进行细分.

<!--Chaos Genius comes with a UI that offers simple point-and-click functionality for various tasks like adding data sources, defining the key performance metrics with dimensions and setting up advaned analytics. -->


### 当你有以下需求时可以使用 Chaos Genius：
- 多维钻取和见解 Multidimensional Drill Downs & Insights
- 异常检测 Anomaly Detection
- 智能警报 Smart Alerting
- 季节性检测* Seasonality Detection*
- 自动根本原因分析* Automated Root Cause Analysis*
- 预测* Forecasting*
- 假设分析* What-If Analysis*

**在短期和中期规划中*

### 演示
查看[演示.](https://demo-github.chaosgenius.io/#/0) 来试用一下或者探索实时仪表板:

- [电子商务](https://demo-github.chaosgenius.io/#/dashboard/1/deepdrills/4)
- [音乐](https://demo-github.chaosgenius.io/#/dashboard/3/deepdrills/8)
- [网约车](https://demo-github.chaosgenius.io/#/dashboard/4/deepdrills/25)
- [云监控](https://demo-github.chaosgenius.io/#/dashboard/2/deepdrills/27)
- [数据质量](#) (即将推出)

<!--[See more on our website. ](https://chaosgenius.io/)-->



<!--![A small demo of Chaos Genius](https://chaosgenius-public.s3.amazonaws.com/test-cg-1-small.gif)-->

<!-- ## Architecture

![image](/img/cg-high-level-arch.png) -->

## ⚙️ 快速开始

<a href="https://docs.chaosgenius.io/docs/setup/local-setup/"><img src=".github/images/local_button_noborder.png" width="120px" /><a/>
<a href="https://docs.chaosgenius.io/docs/setup/aws-setup/"><img src=".github/images/aws_button_noborder.png" width="120px" /><a/>
<a href="https://docs.chaosgenius.io/docs/setup/gcp-setup/"><img src=".github/images/gcp_button_noborder.png" width="120px" /><a/>

```
git clone https://github.com/chaos-genius/chaos_genius

cd chaos_genius

docker-compose up
```

访问 [http://localhost:8080](http://localhost:8080/)

遵循 [快速指南](https://docs.chaosgenius.io/docs/Quick_Start/prereqs) 或阅读我们的 [文档](https://docs.chaosgenius.io/docs/introduction) 获取更多信息。

## :dizzy: 主要功能

### 1. 自动化钻取 Automated DeepDrills 
    
生成多维向下钻取以识别大量高基数维度（例如 CountryID、ProductID、BrandID、Device_type）中已定义指标（例如 Sales）变化的关键驱动指标。
- 技巧: 统计过滤, A*类基于路径的搜索来处理组合爆炸（Statistical Filtering, A* like path based search to deal with combinatorial explosion）

![DD](https://raw.githubusercontent.com/chaos-genius/.github/main/images/DeepDrills.png)

<!-- TODO: add an image or illustration here -->

### 2. 异常检测 Anomaly Detection

用于监控高维时间序列的模块化异常检测工具包，具有从不同模型中进行选择的能力。处理由时间序列数据中的季节性、趋势和假期引起的变化。
- 模型: Prophet, EWMA, EWSTD, Neural Prophet, Greykite
    
![Anomaly](https://raw.githubusercontent.com/chaos-genius/.github/main/images/AnomalyDrillDowns.png)


<!-- TODO: add an image or illustration here -->


### 3. 智能警报

具有自学习阈值的可操作警报。配置设置警报频率和报告以减少警报的疲劳。
- 通知渠道: 电子邮件, Slack
<!-- TODO: add an image or illustration here -->
    
![Alerting](https://raw.githubusercontent.com/chaos-genius/.github/main/images/Alerting-Dark.png)

## :octocat: 社区

如需任何帮助、讨论和建议，请随时联系 Chaos Genius 团队和社区：

-   [GitHub](https://github.com/chaos-genius/.github) (报告错误、贡献、路线图)

-   [Slack](https://join.slack.com/t/chaosgenius/shared_invite/zt-140042uac-rrm~xbx9o_aydi6PTmp_Mg) (与社区和 Chaos Genius 团队讨论)

-   [Book Office Hours](https://calendly.com/chaosgenius/30min) (与 Chaos Genius 团队安排时间以解决任何问题或帮助设置)

-   [Blog](https://chaosgenius.io/blog/) (关注我们关于数据、机器学习、开源等的最新趋势)


## 🚦 路线图

我们的目标是让 Chaos Genius 产品为所有使用者做好准备，无论他们的数据基础设施、数据源和规模要求如何。 考虑到这一点，我们为Chaos Genius制定了 [路线图](https://docs.chaosgenius.io/docs/roadmap/)。 如果你发现有什么缺失或者希望提出建议， 请在 [社区Slack](https://join.slack.com/t/chaosgenius/shared_invite/zt-140042uac-rrm~xbx9o_aydi6PTmp_Mg) 上给我们留言或提出问题。



## :seedling: 贡献

想要为项目做贡献吗？从这里开始：

-   给我们一些爱心 - 给我们一个 :star2:!
    
-   在Issues中提交问题。

-   分享文档中您觉得难以理解的部分。

-   [翻译Readme](https://github.com/chaos-genius/chaos_genius/blob/main/README.md).

-   创建拉取请求。下面是要开始的问题列表。请求之前查看我们的贡献指南。感谢您的贡献！提交Pull Request。 可以从这个[问题列表](https://github.com/chaos-genius/chaos_genius/issues)开始。 请在打开请求之前查看 [贡献指南](https://github.com/chaos-genius/chaos_genius/blob/main/CONTRIBUTING.md)。感谢您的贡献！



## :heart: 贡献者

感谢这些很棒的人 ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

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

该项目遵循[all-contributors](https://github.com/all-contributors/all-contributors) 规范。欢迎任何形式的贡献！

## 📜 许可证

Chaos Genius is licensed under the [MIT license](https://github.com/chaos-genius/chaos_genius/blob/main/LICENSE.md).
