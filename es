[33mcommit dbf101b08e03ee4c909272daece67a255074b1d9[m[33m ([m[1;36mHEAD -> [m[1;32mkpi-validation-fix-datetime[m[33m, [m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m, [m[1;32mmain[m[33m)[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sat Nov 13 15:42:31 2021 +0530

    fix: fixes #311

[33mcommit 561cc0d0e5525a10854bfd2be411cfff5b88fe11[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sat Nov 13 15:38:08 2021 +0530

    fix: fixes #400

[33mcommit 4da904d9f6bafd7cf89b88a9793f497c6464e4e0[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sat Nov 13 15:35:03 2021 +0530

    chore: added query log for getting count

[33mcommit c42e92b3e24dfefb9d480158c60c9761c7eb051e[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sat Nov 13 12:31:38 2021 +0530

    chore: updated test for get_end_date

[33mcommit 9df24477e08c3df65226b5b8ce3f148fc83f3481[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sat Nov 13 12:13:14 2021 +0530

    fix: fixes #399
    
    anomaly graph end date is now end date of available data
    instead of today's date

[33mcommit 937d240c96fa1db49dfed70323272b6fb2f5ff49[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sat Nov 13 11:44:58 2021 +0530

    fix: fixes #398
    
    updated multiline strings

[33mcommit e1956ff576c04eab699e6901bd9e6d24ae44e726[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sat Nov 13 11:43:31 2021 +0530

    fix: fixes #397
    
    removed incorrect identifier for snowflake

[33mcommit ea2380803892b9cfd2a23c96b65e145f3853b832[m
Merge: 1b2701b c3d8c2d
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Nov 12 19:48:28 2021 +0530

    Merge pull request #394 from chaos-genius/sb-frontend-bugfix
    
    fix: Routing issues fixed and Zero issues fixed in homepage

[33mcommit c3d8c2d6229e4dc0325b00f59ceaa4f3cc2b2653[m[33m ([m[1;31morigin/sb-frontend-bugfix[m[33m)[m
Merge: ec5a50c 81e1a6a
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Fri Nov 12 18:42:51 2021 +0530

    Merge branch 'sb-frontend-bugfix' of github.com:chaos-genius/chaos_genius into sb-frontend-bugfix

[33mcommit ec5a50ca257acb1ec9048c6fd395820341455972[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Fri Nov 12 18:42:21 2021 +0530

    fix: Empty name isn’t being shown if the channel name is empty while selecting the destination in the add alert.

[33mcommit 6e8abb19c8eda9bb2fedd239d14296420f1f1e1b[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Fri Nov 12 18:41:52 2021 +0530

    fix: Empty name isn’t being shown if the channel name is empty while selecting the destination in the add alert.

[33mcommit 81e1a6a89ae56af2d94160c4abbeda6c27f6c9d4[m
Author: Sameer <codetrappers.sameer@gmail.com>
Date:   Fri Nov 12 17:52:05 2021 +0530

    Fixed issue with resetting fields after test query

[33mcommit 1b2701bcfce3de314b05aff21b68a4790ca59670[m
Merge: 0f1f7f5 1ff4776
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Nov 12 17:32:06 2021 +0530

    Merge pull request #358 from chaos-genius/frontend-docker
    
    feat: change the frontend docker implementation

[33mcommit 0f1f7f5b239eddad540c2e7617aa9901d4d408e9[m
Merge: 5165052 95548fe
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Nov 12 17:30:46 2021 +0530

    Merge pull request #389 from chaos-genius/multidim-api
    
    feat: add API endpoint to check if KPI is multi-dimensional.

[33mcommit 1ff47767537cc038ba3380863044d8db117c0ccd[m[33m ([m[1;31morigin/frontend-docker[m[33m)[m
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Fri Nov 12 16:30:21 2021 +0530

    fix: restore stable release compose file and create new Dockerfile.prod
    
    Restored `docker-compose.yml` so that it does not use nginx
    configuration.
    
    Restored Dockerfile so that it does not use nginx. created new
    Dockerfile.prod which uses nginx.
    
    Changed from `Dockerfile` to `Dockerfile.prod` in build
    context of `docker-compose.dev.yml`

[33mcommit 95548fea7a51f4cb3cd1303c3cf39de4afa61126[m[33m ([m[1;31morigin/multidim-api[m[33m)[m
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Fri Nov 12 14:45:42 2021 +0530

    fix: move get_kpi_data_from_id function and  and change API Endpoint
    
    Moved `get_kpi_data_from_id` from `kpi_view.py` to `kpi_controller.py`
    and changed all imports of the same function in
    `kpi_view.py`,`anomaly_data_view.py` and `config_setting_view.py`
    
    changed the API Endpoint from `/config/<kpi_id>/multidim_status` to
    `/config/dashboard_config`. Modified the API to take input parameters from
    Args and modified the return object so facilitate accomodation of more
    data.

[33mcommit 5165052b23548e6d6afaf9fd599e2946b6bf348c[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Nov 12 15:56:55 2021 +0530

    fix: anomaly end date is  datetime internally
    
    since anomaly needs to deal with hourly level data,
    end date should be stored as datetime internally.

[33mcommit 55b34a89efa80b7439b838a8348566f25ab8ecc6[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Fri Nov 12 15:53:12 2021 +0530

    fix: remove cache from anomaly data views
    
    Anomaly output was cached, leading to stale data issues in the frontend
    (the anomaly graph and status would not show up).
    
    Removed imports as well as memoize statements from all the routes in anomaly_data_view

[33mcommit 765d800091423541226539abfa38f1cfa4dd07e1[m
Merge: 9c1d580 548143a
Author: Sameer <codetrappers.sameer@gmail.com>
Date:   Fri Nov 12 15:32:41 2021 +0530

    Merge branch 'sb-frontend-bugfix' of https://github.com/chaos-genius/chaos_genius into sb-frontend-bugfix

[33mcommit 9c1d5801e589746d4904668ff2bbc0a0c7d01283[m
Author: Sameer <codetrappers.sameer@gmail.com>
Date:   Fri Nov 12 15:32:30 2021 +0530

    Field reset on onChange Table Name in New KPI form

[33mcommit 548143a01cb81fc84deb7567118428e8ddfe8abd[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Fri Nov 12 15:29:59 2021 +0530

    fix: minor fixes in channel configuration

[33mcommit 8bfb6996e7919c3c2f48dfda9b3dfbbd139e8f6b[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Nov 12 15:11:32 2021 +0530

    fix: minor fixes

[33mcommit b9cd9c7c70b299c04b8c003b77d3b8b29bee98f1[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Fri Nov 12 15:09:41 2021 +0530

    fix: env localhost fix

[33mcommit 4adf3dc390ec5085d3e7b6f41156cfbd8160a0ad[m
Merge: 44ef195 a4112e3
Author: Harshit Surana <surana.h@gmail.com>
Date:   Fri Nov 12 15:08:55 2021 +0530

    Merge pull request #392 from chaos-genius/fix-kpi-validation-data-loader
    
    fix: fixes #391

[33mcommit 44ef195ee7be9d079474c60f0904811259da0d17[m
Merge: 425f5e9 0adba25
Author: Harshit Surana <surana.h@gmail.com>
Date:   Fri Nov 12 15:08:41 2021 +0530

    Merge pull request #393 from chaos-genius/fix-rca-dod-and-line-graph
    
    fix: fixes #390

[33mcommit 3ecfbc9ffc1a275056642b7683c1e5adb0828d46[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Nov 12 14:29:09 2021 +0530

    fix:kpi filter change datasource type

[33mcommit 310386374f63660a2d0c9e6e8197c8303217fcbd[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Fri Nov 12 14:27:47 2021 +0530

    fix: Channel Name isn’t being set for the slack config

[33mcommit 60992fa36e76fdd7e2785bc1c11225c3caf79844[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Nov 12 13:35:21 2021 +0530

    fix:validation channel config and kpi alert

[33mcommit 425f5e95885f939311e80dc7a5b5e18ca76d8495[m
Merge: d7f6e9e 0660400
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Nov 12 12:41:16 2021 +0530

    Merge pull request #395 from chaos-genius/onboarding-status-fix
    
    fix: modify the logic in onboarding-status api endpoint

[33mcommit 06604005df308ce68dedf525f4516e761e0c75a6[m[33m ([m[1;31morigin/onboarding-status-fix[m[33m)[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Fri Nov 12 12:16:09 2021 +0530

    fix: fix the logic for filtering kpi's

[33mcommit aad5654a47bfb0bdc6fd4db6d43764c5a8319fb7[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Nov 12 12:07:59 2021 +0530

    fix: datasource to datasource name

[33mcommit ac3780d30ff258a23c97db97c7e670ab539a89b6[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Nov 12 12:02:10 2021 +0530

    fix:minor fixes

[33mcommit 703adc4956e27b1fe11c695ac6e2e91c081920c9[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Fri Nov 12 11:51:06 2021 +0530

    fix: modify the logic for assigning
    boolean value True to analytics variable

[33mcommit 69b6d2f3a2e4c28da29309bf3b58c5b574cae6b2[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Nov 12 11:05:04 2021 +0530

    sb-frontend-bugfix

[33mcommit 0adba257def58fc185fca3da5359d97bb7cac763[m[33m ([m[1;31morigin/fix-rca-dod-and-line-graph[m[33m)[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Nov 12 11:02:22 2021 +0530

    fix: data loader now loads data till end_date (exclusive)

[33mcommit 67b4b9b1883213dc86d9d80dddfeca7ad62c7239[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Nov 12 11:01:49 2021 +0530

    fix: anomaly end_date is date instead of datetime
    
    This is to avoid getting partial datafor hourly level KPIs

[33mcommit ea4ba27f9a2212488c9cce1355b90d7ef569cd83[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Nov 12 00:47:11 2021 +0530

    fix: fixes #390
    
    Moved rca data load logic inside the class itself
    
    Ensured rca uses only date objects
    
    Fixed splitting of data in rca load data which caused data to be split
    incorrectly by giving extra rows to the base_df
    
    Fixed comparison operator in data loader to include start date as well,
    otherwise we get less data for the first data point

[33mcommit a4112e3816f978d2ec75965b5ab21b4b0d714e0a[m[33m ([m[1;31morigin/fix-kpi-validation-data-loader[m[33m)[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Nov 11 23:47:37 2021 +0530

    fix: fixes #391
    
    Data loader class now has a new param validation which tells it whether to
    preprocess and log data stats
    
    If both days before and start date are none, data loader will not create
    a query which filters data based on datetime

[33mcommit d7f6e9e45979a79ba9e69951ee84692e24b3f9f1[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Nov 11 18:08:24 2021 +0530

    fix: fixed key names for connection types

[33mcommit 5de68885ed70e08d8cd3770972570d65ba3aa035[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Thu Nov 11 17:48:51 2021 +0530

    fix: minor fixes

[33mcommit 3a3ee1a7698698ef048ffbed9662319cca11d657[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Thu Nov 11 15:20:14 2021 +0530

    fix: minor fixes

[33mcommit b11e1605fed7c52b41cc452746cedaf0ac47cd3f[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Thu Nov 11 15:01:38 2021 +0530

    fix: kpi home zero bug fixed

[33mcommit 1c2972f5dacdfdec462ef1e12c1c475c5c063775[m
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Wed Nov 10 20:59:15 2021 +0530

    fix: delete docker-compose.nginx.yml

[33mcommit 2a900afaf83c4bc1e783bdaec01f9dc308f7b0e1[m
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Wed Nov 10 15:23:00 2021 +0530

    fix: change all compose files to support nginx configuration

[33mcommit e9145dc1309d4b7bfb6bb24fc4f3b49731d3e441[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Nov 10 15:31:51 2021 +0530

    fix: fixes #388
    
    The issue stemmed from data loading where start date was set
    to last date for which anomaly ran instead of last date minus the period

[33mcommit 66eacd0626151eff05132b9aaf8d985f09745e91[m
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Wed Nov 10 14:26:07 2021 +0530

    fix: Replace old Dockerfile with the new one that uses nginx
    
    Removed old Dockerfile and renamed Dockerfile.prod to Dockerfile

[33mcommit a455a6d8e5f2748b2ec80c4776ce26f69f595fa8[m
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Fri Nov 5 18:31:59 2021 +0530

    fix: wrong redirect in frontend through nginx in docker
    
    In nginx-default.conf set Host header to original http request's host
    and changed the listen port to 8080 as gunicorn was redirecting to port
    80 where nginx was running.
    
    In frontend/Dockerfile.prod set REACT_APP_BASE_URL to empty string so
    that the frontend considers the current window's url as the backend url
    
    In new compose file 'docker-compose.nginx.yml' removed port bindings for
    the server and mounted volume onto the webapp container to make the nginx-default.conf editable.

[33mcommit 41efce955f94e54f838f36649dcac3203f048fbb[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sun Oct 31 14:27:18 2021 +0530

    feat: change the frontend docker implementation

[33mcommit a86714c1eb7e2672129ea960e7246d03499725c5[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Nov 10 15:24:46 2021 +0530

    fix: fixed typo in data stats logs for data loader

[33mcommit 3a0ebbeef897197a2389f2a526cde9f3e46bd4e7[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Nov 10 15:24:13 2021 +0530

    chore: added processor data stat logs for anomaly

[33mcommit 4e5191858987978f4087d4df8bc98b2489b93c4e[m
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Wed Nov 10 13:01:54 2021 +0530

    feat: add API endpoint to check if KPI is multi-dimensional.
    
    Added Helper function(get_kpi_data_from_id) to get info about the KPI.
    
    Added API Endpoint ( /api/config/<kpi-id>/multidim_status ) which
    returns a json object in which the value corresponding to 'multidim_status' key
    is True if the KPI has more than one dimension , False otherwise.

[33mcommit 2401ff492a76531bf78346b1c6ab14fb403fa0ae[m
Merge: 144a3e3 fc947f3
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Nov 9 18:14:15 2021 +0530

    Merge pull request #373 from chaos-genius/events-alerts-fix
    
    fix: fix the functionality of static event alerts and change the layout.html file

[33mcommit 144a3e3ca20b431c7dec4e153550cda99d42fce8[m
Merge: 5ba51da e1b6e90
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Nov 9 18:12:58 2021 +0530

    Merge pull request #380 from chaos-genius/sb-frontend-sidebar
    
    fix: disable sidebar dashboard option incase of kpi count is 0

[33mcommit 5ba51da9c08e9e82f3c4452fae2ced051a96edf7[m
Merge: e514e74 d77e9db
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Nov 9 18:11:17 2021 +0530

    Merge pull request #387 from chaos-genius/anom-static-x-lim
    
    fix: anomaly graphs now have a fixed x axis range

[33mcommit d77e9db2e3d44c591e2b8f8f58d2166b9f4d15c1[m[33m ([m[1;31morigin/anom-static-x-lim[m[33m)[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Nov 9 17:54:38 2021 +0530

    chore(anomaly): unified logs and api response

[33mcommit bbd9890432ee1aa220469f1aad395bc4c4e7b255[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Nov 9 17:51:26 2021 +0530

    fix: anomaly graphs now have a fixed x axis range

[33mcommit e1b6e9023d853f781c154f946df28cbf3b980355[m[33m ([m[1;31morigin/sb-frontend-sidebar[m[33m)[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Tue Nov 9 17:20:52 2021 +0530

    fix: dashboard unwanted code remove

[33mcommit 6af625d56c6ba10940983693271e05d771e3638a[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Tue Nov 9 17:06:14 2021 +0530

    fix: dashboard fixes

[33mcommit a6fe72488549ab543965d84ffc28749b0e4b9512[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Tue Nov 9 17:04:39 2021 +0530

    fix: env PR change fix

[33mcommit a5bb327460f4fc824276fcb17baac0881dfd64b1[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Tue Nov 9 14:30:40 2021 +0530

    fixed redundant api calls

[33mcommit e514e7460e5cc748695b2de5a79ca7071a1199c2[m
Merge: 0a5f6f2 6558220
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Nov 9 11:36:08 2021 +0530

    Merge pull request #386 from chaos-genius/alert-fix
    
    fix: change in the alert message and the order of the alert records

[33mcommit 65582207a0eac17fb089da4b773b2453e6fe1b0b[m[33m ([m[1;31morigin/alert-fix[m[33m)[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Nov 9 11:30:17 2021 +0530

    fix: change in the alert message and the order of the alert records

[33mcommit 035bd34b5944c7e397c43f3e1ed53e1a191834ee[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Mon Nov 8 12:56:47 2021 +0530

    fix: changed endpoint for kpi count

[33mcommit 383c0f2147f1f413f5e68f8040b4a7969a386f6d[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Mon Nov 8 12:28:30 2021 +0530

    fix: disabled button conditions

[33mcommit e384da33d9d96bd1477f08e45f043f5b1632d48d[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Nov 8 12:14:57 2021 +0530

    fix: disable sidebar fixes

[33mcommit d489e140fc7ff7ab57870f6baf6a8f33db8b23f1[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Nov 8 12:06:14 2021 +0530

    fix: sidebar css fixes

[33mcommit 0a5f6f274435beff246858d0b2487f302cd14313[m
Merge: da9898a 16a8bd9
Author: Amogh Dhar Diwan <41579921+Fletchersan@users.noreply.github.com>
Date:   Mon Nov 8 12:03:17 2021 +0530

    Merge pull request #379 from chaos-genius/anomaly-missing-data-fix
    
    fix(anomaly): Handle missing dates + Resolves #367

[33mcommit 16a8bd91f10581b7ad1bb78195c34e6503a13e32[m
Author: Amatullah <amatullahsethji@gmail.com>
Date:   Mon Nov 8 10:03:26 2021 +0400

    fix(anomaly): Handle missing dates + Resolves #367

[33mcommit c9d20a68ba1f42b246d6995f5ad86fffc45be55d[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Mon Nov 8 11:32:07 2021 +0530

    fix: sidebar dasboard button disable

[33mcommit da9898a0231834a0c4221a743d1d38106632e8bc[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Nov 8 11:26:57 2021 +0530

    fix(rca): line data now uses data loader
    
    Earlier line data used to load both rca and base df which is inefficient
    Now it directly loads the rca df through the DataLoader

[33mcommit cdcfac531ee767a42afee8bea852c134abe7b8a7[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Nov 8 11:25:56 2021 +0530

    chore: improved logging of data loading
    
    * data loading logs now include statistics about the data
    * added anomaly slack calculation logs
    * added anomaly subgroup filtering logs

[33mcommit 5d4c675eafc9ead7d9ce58dc3ee4b53c71577188[m
Merge: 68189cf 51cd0de
Author: Amogh Dhar Diwan <41579921+Fletchersan@users.noreply.github.com>
Date:   Mon Nov 8 10:44:27 2021 +0530

    Merge pull request #378 from chaos-genius/ui-graphs-renaming
    
    fix (ui, analytics): partially fixes #372

[33mcommit 51cd0de004a1c64919fd1f63f94d34a105684605[m[33m ([m[1;31morigin/ui-graphs-renaming[m[33m)[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Sun Nov 7 09:20:01 2021 +0530

    fix (ui, analytics): partially fixes #372
    - Title for DQ is the type of data quality
    - Y-axis label is the KPI name

[33mcommit fc947f3949142fcc821fd4594f93f2c67dd8dc39[m[33m ([m[1;31morigin/events-alerts-fix[m[33m)[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Sat Nov 6 13:12:05 2021 +0530

    fix:
    - fix the functionality of static event alerts
    - fix the layout.html file which is the
    base of all email alerts

[33mcommit 68189cf5933736b50eeacb744ee284fe89199b40[m
Merge: a64a39f 849fe5c
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Nov 5 10:37:04 2021 +0530

    Merge pull request #363 from chaos-genius/data_loader_refactor
    
    refactor: generalized data loading class

[33mcommit 849fe5c98b7e44968ea5a22c0f3795d33ec57907[m[33m ([m[1;31morigin/data_loader_refactor[m[33m)[m
Merge: 70a7f03 a64a39f
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Nov 5 10:13:00 2021 +0530

    Merge branch 'main' into data_loader_refactor

[33mcommit a64a39f128fd025e0eb6673356d8c6ad6318ce69[m
Merge: 4a676f6 525c52d
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Nov 3 19:33:26 2021 +0530

    Merge pull request #364 from chaos-genius/rca-tests
    
    chore: added tests for rca string utils

[33mcommit 4a676f6ce655c8cf391b0ea9a6431b09e2ec1dc5[m
Merge: d76cfe2 854bc1e
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Nov 3 19:32:39 2021 +0530

    Merge pull request #365 from chaos-genius/logging
    
    chore: improved logging throughout Anomaly, Deepdrills and their API responses.

[33mcommit 854bc1ec4c5f28fc227f26e8ac9d66d93ff570a5[m[33m ([m[1;31morigin/logging[m[33m)[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Nov 3 15:36:05 2021 +0530

    chore: removed unused import

[33mcommit 0a1649335cafffc975d74874aa2a51c3317cbdb3[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Nov 3 15:35:48 2021 +0530

    chore: updated logging in kpi view and formatting

[33mcommit 3dbc6e0094fd43551b4c4ee28a0771d40468fd86[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Nov 3 15:30:46 2021 +0530

    chore: added more logging and formatted code

[33mcommit 525c52d3431a404194d9d0960a85b764d2e02471[m[33m ([m[1;31morigin/rca-tests[m[33m)[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Nov 3 11:17:34 2021 +0530

    chore: added tests for rca string utils

[33mcommit d76cfe21cc083a8618fcef22953e6f148463dc5a[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Nov 3 11:14:49 2021 +0530

    chore: added 88 chars limit for black

[33mcommit 70a7f0329e5ffe0c88e1b33f86386eb55fdf6a8b[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Nov 3 11:11:03 2021 +0530

    chore: fixed formatting

[33mcommit 2a393e75701cb2fb6ad0f0e4c469089a349f88d5[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Nov 3 10:55:41 2021 +0530

    fix: updated function name

[33mcommit dbd5b0494f6f53258fb37f253eca161d6b18fa3b[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Nov 3 10:30:38 2021 +0530

    fix: updated variable name
    
    Co-authored-by: Samyak Sarnayak <samyak201@gmail.com>

[33mcommit 2efe15b1721143f7669c079000201a85d99b21e1[m
Merge: fb22787 dd62dda
Author: Varun P <46447751+varunp2k@users.noreply.github.com>
Date:   Wed Nov 3 10:22:46 2021 +0530

    Merge pull request #335 from chaos-genius/scheduler-fix-rca-time
    
    fix(scheduler): use kpi creation time when rca_time is not setup

[33mcommit dd62dda0c35733e56a182dd2cd09e689ee4eb8a0[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Sat Oct 16 18:27:34 2021 +0530

    fix(scheduler): use kpi creation time when rca_time is not setup
    
    Before this fix, 11:00:00 was considered for running RCA instead of the
    KPI creation time.

[33mcommit 635c263ee9a59cfc3273a6b473e99939489fa044[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Nov 2 22:53:19 2021 +0530

    chore: minor formatting and refactoring
    
    Made some constants and functions private.
    Renamed unused iterator variable.
    Moved item-in-list to item-in-set checks.
    
    Co-authored-by: Samyak Sarnayak <samyak201@gmail.com>

[33mcommit 339a6fc64d7f0ad873ccdeb077ccafaed8009cc8[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Nov 2 20:56:08 2021 +0530

    fix: added missing argument

[33mcommit 9b795d3e088c51e59646eb376dce5b23eda10a0a[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Nov 2 20:55:46 2021 +0530

    fix: fixed argument ordering

[33mcommit fbe07dbce6d7583dc165f641581e88842195e729[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Nov 2 20:36:14 2021 +0530

    refactor: generalized data loading class
    
    data loading class is now consistent for anomaly detection, RCA
    and kpi validation

[33mcommit fb22787ecc13062b72dbaf12f0d6ad0be71cedd2[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Nov 2 18:55:33 2021 +0530

    chore: fix formatting

[33mcommit 789c7319a99aaeac21cb2b1b8066c94b1844cc6c[m
Merge: 3af337e 8fa52d0
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Nov 2 15:40:49 2021 +0530

    Merge pull request #361 from chaos-genius/error-handling
    
    handle only the error in the exception

[33mcommit 8fa52d028dc4801bb7e38f354800331933bfa150[m[33m ([m[1;31morigin/error-handling[m[33m)[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Nov 2 15:23:56 2021 +0530

    fix: suppress the prohet warning

[33mcommit 1fced779ea13fcd3b07224449e14934c13704815[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Nov 2 15:15:16 2021 +0530

    fix: handle only the error in the exception

[33mcommit 3af337ef577e6f8d55a0e23a56ae7e6d0dd46a2a[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Nov 2 12:47:42 2021 +0530

    add the blinker in the requirement

[33mcommit d863e4a54b3a3e72a3ee65356356dc4d059d5bc6[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Nov 2 12:23:21 2021 +0530

    add the sentry dsn

[33mcommit a32042e8a926a06759578c2e4b8294f3c89f4b39[m
Merge: 8d4507b aab7d9f
Author: Harshit Surana <surana.h@gmail.com>
Date:   Tue Nov 2 11:29:57 2021 +0530

    Merge pull request #356 from chaos-genius/fluentd-logging
    
    feat(logging): add fluentd based logging

[33mcommit 8d4507be6a05f8232439dc22d312f86d24ce78b3[m
Merge: 5d61b6e 0f2de00
Author: Harshit Surana <surana.h@gmail.com>
Date:   Tue Nov 2 11:29:12 2021 +0530

    Merge pull request #360 from chaos-genius/analytics-env-vars
    
    fix: added env vars for analytics and server contianers

[33mcommit 5d61b6e0e781c007c09e3283b3082a47007317b4[m
Merge: c69e41f 7f2deb0
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Nov 2 11:27:43 2021 +0530

    Merge pull request #357 from chaos-genius/sentry-logger
    
    feat: init the sentry integration

[33mcommit 0f2de0088488c3537d4f637891a0caba2bb9ea22[m[33m ([m[1;31morigin/analytics-env-vars[m[33m)[m
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Tue Nov 2 10:45:18 2021 +0530

    fix: added env vars for analytics and server contianers

[33mcommit aab7d9f9413a8d4a6a93329e2fd86b43430fe80c[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Mon Nov 1 12:05:36 2021 +0530

    feat(logging): add fluentd based logging
    
     - a new docker-compose.fluentd.yml
     - all containers (except `fluentd` and `chaosgenius-init`) use the new fluentd logger
     - fluentd itself is a service in the docker compose
     - logs are stored in a local `logs/` directory
         - a separate directory is created for each container
         - logs are initially stored in the `buffer` directory before being flushed to the actual log directory - every ~10 mins
         - see `setup/fluentd/log.conf` for more details
     - some caveats:
         - fluentd itself does not perform any log rotation, so there is no bound on the size or number of log files
         - if the fluentd container does not start successfully, it leads to the other containers hanging. This is a bug in the fluentd driver.
            - Refer: moby/moby#40063
            - The only solution we have found to this is to stop the docker service and manually delete these containers in `/var/run/docker/containers` and `/var/run/docker/containerd`
    
    Co-authored-by: Bhargav <bhargavskumar51703@gmail.com>

[33mcommit 7f2deb03944f7c09ac448b3e68f3ef348a5a92a4[m[33m ([m[1;31morigin/sentry-logger[m[33m)[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Nov 1 01:44:20 2021 +0530

    fix: add the sentry requirement

[33mcommit c69e41f418ec5544d63456fba9e4cce9a3db6fe9[m
Author: Varun P <46447751+varunp2k@users.noreply.github.com>
Date:   Mon Nov 1 01:35:07 2021 +0530

    fix: fixed typo in constant name

[33mcommit 645983a9f872fa037263676f915faa08e8085c45[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Nov 1 01:26:19 2021 +0530

    feat: changes in the logger for initiating the sentry

[33mcommit 96bf565d3b6db1b9ca6c85ce1be7ea7ca3c2c55e[m
Merge: 7a47d67 6ebda65
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Nov 1 00:27:43 2021 +0530

    Merge branch 'main' into sentry-logger

[33mcommit 7a47d671422d6f7dcba4cc2fcbd04ef1c3f45f6e[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Nov 1 00:24:13 2021 +0530

    feat: init the sentry integration

[33mcommit 6ebda6509e402fdd19bb796bd7ce9041d3bc352a[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Mon Nov 1 00:12:04 2021 +0530

    chore: rename env variables

[33mcommit ad687944931d65fea1b51fbf05f4e5ec5ee1436c[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sun Oct 31 19:03:36 2021 +0530

    fix: increase the gunicorn timeout

[33mcommit 392aa55af2dc9328581b6798a19d72d44528e0a1[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Sun Oct 31 18:26:17 2021 +0530

    chore: logging level is now based on env

[33mcommit 6ed70026fe18b7b3e231e5b2ec233563fd1fa8df[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Sun Oct 31 18:16:29 2021 +0530

    chore: updated max rows to 10 million

[33mcommit 30e9a66943ea4b228b16474acdc8672a4d8de40d[m
Merge: dc28b7f ef4425a
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sun Oct 31 18:09:20 2021 +0530

    Merge pull request #355 from chaos-genius/kpi-validation-optimize
    
    feat: kpi validation max rows now uses count

[33mcommit dc28b7fb0ce2ecdd41a8112696174e3e8678f9eb[m
Merge: 13aab4c 0d6423d
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sun Oct 31 18:03:56 2021 +0530

    Merge pull request #354 from chaos-genius/anomaly-pad-data-fix
    
    fix(anomaly): closes #353

[33mcommit ef4425ab5c379e0179058c870adad8978507439b[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Sun Oct 31 17:56:51 2021 +0530

    feat: kpi validation max rows now uses count
    
    For kpi validation, when we check for max number of rows,
    we now load count of rows instead of loading entire data and
    then counting.
    
    Co-authored-by: Kartikay Bagla <kartikaybagla@gmail.com>

[33mcommit 0d6423da543808b44381b255dc10d50886208dd8[m[33m ([m[1;31morigin/anomaly-pad-data-fix[m[33m)[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Sun Oct 31 17:46:10 2021 +0530

    fix(anomaly): closes #353

[33mcommit 13aab4cb5f14852c296f2e117da553b0e72bc402[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sun Oct 31 12:25:12 2021 +0530

    fix: add the env for the frontend docker

[33mcommit 5924e88646c7302ac15823ab35c30f1ec6f61b8c[m
Merge: d5e6892 efdff56
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sat Oct 30 07:27:34 2021 +0530

    Merge pull request #352 from chaos-genius/update-generation-logic
    
    Update generation logic. Closes #351

[33mcommit efdff56320fde620731540194ad9e2da7d7bd346[m
Author: Amogh Dhar Diwan <41579921+Fletchersan@users.noreply.github.com>
Date:   Fri Oct 29 21:13:06 2021 +0530

    feat(anomaly): add new subgroup generation algorithm. Closes #351.

[33mcommit 211c82aba616f57025c0d305183fdbba940848be[m
Author: Amogh Dhar Diwan <41579921+Fletchersan@users.noreply.github.com>
Date:   Fri Oct 29 21:08:59 2021 +0530

    fix(settings): parse value of env variable fix
    
    MULTIDIM_ANALYSIS is supposed to be boolean variable,
    currently parsed as string. This commit fixes that.

[33mcommit d5e689270c54612f1534353eb2e67a8646a676b9[m
Merge: 332e22b 4ef85e7
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Oct 29 20:46:38 2021 +0530

    Merge pull request #349 from chaos-genius/analytics-configurable-settings
    
    feat(anomaly) : congfigurable subdimension settings + Closes #340 & #341

[33mcommit 4ef85e78e5ac08c1efbccf2d676e2aae68fbadc7[m
Author: Amogh Dhar Diwan <41579921+Fletchersan@users.noreply.github.com>
Date:   Fri Oct 29 20:43:32 2021 +0530

    fix(.env): fix spacing issue in .env file

[33mcommit 332e22b72e610544a2b3aa5e344cb0131bfc4295[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 28 19:59:55 2021 +0530

    fix: rename the frontend-new to frontend

[33mcommit fd36af5cbebb4f50d75130533d75203c43481761[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Oct 28 19:09:21 2021 +0530

    chore: updated log format
    
    it now includes module name and asctime

[33mcommit 0ccbb6a9416cc0bb462eecd39a34e164a1e1a7ae[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Oct 28 19:05:45 2021 +0530

    chore: updated log values for anomaly controller

[33mcommit 5fec64f455e9d0d269274f42b0bff7858f9202d6[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Oct 28 19:00:33 2021 +0530

    fix: fixed incorrect log statements

[33mcommit 503e6f4da2c73e9d8fb0f45f67cce23234e13133[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Oct 28 18:50:50 2021 +0530

    chore(rca): added validation to rca data loading

[33mcommit cfe539db7dd9b6be9f49df94ae528e4eacdacddd[m
Author: Amatullah <amatullahsethji@gmail.com>
Date:   Thu Oct 28 15:20:53 2021 +0400

    feat(anomaly) : configurable subdimension settings + Closes #340 & #341

[33mcommit 5d634e60f5e26892f2e5bf4ec2f3c7911ee6ff5a[m
Merge: 7f49e4e 2ca2c62
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 28 14:13:41 2021 +0530

    Merge pull request #348 from chaos-genius/redshift-connector
    
    feat: add the redshift connector

[33mcommit 2ca2c62117400edf1ecfa13696211bf45c6ad45f[m[33m ([m[1;31morigin/redshift-connector[m[33m)[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 28 14:13:18 2021 +0530

    add the chunksize in the redshift connector

[33mcommit 653fa4cb67797532c59a03b27f923468cd4cd5a9[m
Merge: d17a406 7f49e4e
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 28 14:10:59 2021 +0530

    Merge branch 'main' into redshift-connector

[33mcommit 7f49e4e93c1b107b14d55cd0acd65b8632cef21c[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 28 12:55:11 2021 +0530

    fix: update in the install from scratch script

[33mcommit f741dec76b35a4ca24d8724fa98d24410f2fa230[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Oct 28 11:58:41 2021 +0530

    chore(log): added logging in kpi validation

[33mcommit 3b0977bae8615745a17307981a2168ebf60e53c1[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 27 20:46:24 2021 +0530

    feat: add the optional debug in the db/dw connector

[33mcommit d899a80217f5d317fab0c3c76844279a8ee442ca[m
Author: Kshitij Agarwal <42891697+kshitij123456@users.noreply.github.com>
Date:   Wed Oct 27 19:01:20 2021 +0530

    chore(rca): added data loading size logs

[33mcommit 2ca5c1b81a5caa898a52cf0969e282f160ffa51c[m
Author: Kshitij Agarwal <42891697+kshitij123456@users.noreply.github.com>
Date:   Wed Oct 27 18:59:20 2021 +0530

    fix(rca): fixes #347
    
    We fill all NaN values in get line data with zeros

[33mcommit 47202a48c7cf7c4f330eecfff1f41ec0ef41f7f0[m
Author: Amogh Dhar Diwan <41579921+Fletchersan@users.noreply.github.com>
Date:   Wed Oct 27 18:13:56 2021 +0530

    fix(connectors): fixed typo in base_connector.py

[33mcommit 20533bf654c6fe79d48b2ef04f4da3edd3a93373[m
Merge: fbc19c3 a7ba32e
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 27 18:04:34 2021 +0530

    Merge pull request #338 from chaos-genius/chunksize-queries
    
    fix(backend): #332 added chunk_size param for data fetching

[33mcommit a7ba32e2910c0c8ed38a4c68c27056bcbf12d97a[m
Author: Amogh Dhar Diwan <41579921+Fletchersan@users.noreply.github.com>
Date:   Wed Oct 27 17:31:32 2021 +0530

    fix(connectors): define constant for chunksize

[33mcommit fbc19c3779dd2e568d52b40c692eeaced9bbc991[m
Merge: e1c2373 295c70b
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 27 17:18:32 2021 +0530

    Merge pull request #345 from chaos-genius/fix-rca-kpi-query
    
    fix: fixes #344 by removing infinite loop and updating kpi query code

[33mcommit fbe9fd01979925885162784dccd5fb4ded2f8245[m
Author: Amogh Dhar Diwan <41579921+Fletchersan@users.noreply.github.com>
Date:   Wed Oct 27 16:44:21 2021 +0530

    fix(connectors): ignore index for chunk concat

[33mcommit e1c237345201aba86b509dfbe04aae618fb2f560[m
Merge: 0045445 837a078
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 27 16:24:18 2021 +0530

    Merge pull request #346 from chaos-genius/fix-rca-single-subgroup
    
    fix: fixes #342 by assigning curr_loc with a constant value

[33mcommit 295c70bb712b9a3a1d0e4aef98b54aaa00de32f1[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 27 15:23:13 2021 +0530

    fix: fixes #344 by updating code for kpi query

[33mcommit c2168024e32b32b271dd2fa92d7b7c7ffc83a8e1[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 27 15:20:55 2021 +0530

    fix: fix incorrect f string

[33mcommit ee18a720ee0fc2564e5278f61716d5931172c358[m
Author: Amogh Dhar Diwan <41579921+Fletchersan@users.noreply.github.com>
Date:   Wed Oct 27 15:11:29 2021 +0530

    fix(connectors): changed chunksize to 20k from 50k

[33mcommit 53f710b59a6458ca692d78a583c9a76144f514e6[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 27 14:09:55 2021 +0530

    fix: fix infinite loop in #344

[33mcommit 837a078db9f3be494c8684db7dde6b88f2784910[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 27 13:58:55 2021 +0530

    fix: fixes #342
    
    Initialized curr_loc with a constant value

[33mcommit 0ae6048d693bc048f3ec26b699d8a5b276a24f89[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 27 13:49:30 2021 +0530

    fix: import error caused by pandas

[33mcommit 0045445a97e06d6bbbfbe8994a6b63e42b791514[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 27 12:57:57 2021 +0530

    fix: add the flake8 config and minor fix in neural prophet

[33mcommit 9c98731d7383c1bc39d858ea786fae2b5687511b[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 27 12:56:36 2021 +0530

    add the flake8 and pytest for code formatting

[33mcommit 8e0202cbf946d543b0621cb53f35eaf1542a331c[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 27 12:18:50 2021 +0530

    add the greeting bot

[33mcommit b34d3c01e55c946f14999a39afe2bb2fd415bc5e[m
Merge: ab7a294 e6ddc8a
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 27 12:14:39 2021 +0530

    Merge pull request #339 from chaos-genius/sb-frontend-eventalert
    
    feat: Event alert add and edit flow

[33mcommit ab7a2949bd0ac88e43d3881e51049ec8ac26e3ea[m
Merge: 8d5c753 62531d7
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 27 12:13:04 2021 +0530

    Merge pull request #326 from chaos-genius/test-pytest-setup
    
    test: pytest setup, a basic unit test for a helper

[33mcommit 8d5c75342f8958e737ac5cf79c8476772e755c3c[m
Merge: ca772cf 93d5c12
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 27 12:11:30 2021 +0530

    Merge pull request #337 from chaos-genius/frequency-period-fix
    
    fix(anomaly): Closes #336. fix period value measurement wrt frequency

[33mcommit ca772cf7abeb57b7faeab19bc33b33809ef4f1cd[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Wed Oct 27 11:43:57 2021 +0530

    docs: update bug issue template

[33mcommit a3783516218d06109adf155217c6a71bbda3dbee[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Wed Oct 27 11:42:11 2021 +0530

    docs: update new feature issue template

[33mcommit d17a4065dfb3a3c136bf59c0042a3ffaa2ab11fe[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Oct 26 18:56:23 2021 +0530

    feat: add the redshift connector

[33mcommit 09519d1de78d962d78ccf66d3158d37cec50762e[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Mon Oct 25 19:54:04 2021 +0530

    fix(backend): #332 added chunk_size param for data fetching
    - enabled chunk_size during data fetching
    - added file connectors_utils.py, utils for connectors
    - data is fetched in chunks and then merged into a single dataframe

[33mcommit 93d5c1293e0c1481b9e80b8c458a96076b89f3be[m[33m ([m[1;31morigin/frequency-period-fix[m[33m)[m
Author: Amogh Dhar Diwan <41579921+Fletchersan@users.noreply.github.com>
Date:   Mon Oct 25 19:29:19 2021 +0530

    fix(anomaly): fixed typo

[33mcommit df8a5dd3149ef819c3cea7209d326f68d7239879[m
Author: Amogh Dhar Diwan <41579921+Fletchersan@users.noreply.github.com>
Date:   Mon Oct 25 19:23:59 2021 +0530

    fix(anomaly): Closes #336.
    fix period value measurement wrt frequency
    
    Measures anomaly period value in days only, irrespective of frequency of
    data

[33mcommit 529078829b1a882a8b64ef347e483a8e1d01ec82[m
Merge: b06bb61 af923b9
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Oct 25 17:08:23 2021 +0530

    Merge pull request #330 from chaos-genius/event-alerts
    
    feat: add support of templated emails to event alerts

[33mcommit b06bb61cc04f7ac623e91d3daaa1f2a84f98af33[m
Merge: 7cb6002 f84ad7d
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Oct 25 17:05:45 2021 +0530

    Merge pull request #329 from chaos-genius/sb-frontend-validation
    
    fix: configuration anomaly setting fixes

[33mcommit 7cb60024c5409e831cd82dd7c911f4a785da8d36[m
Merge: 02408e1 0707972
Author: Harshit Surana <surana.h@gmail.com>
Date:   Sat Oct 23 14:35:50 2021 +0530

    Merge pull request #331 from chaos-genius/celerybeat-schedule-update
    
    Comment out certain portions of CELERYBEAT_SCHEDULE in celery_config.py

[33mcommit 0707972520a94a2fcf754ec9c70b6a314de37a12[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Sat Oct 23 14:19:40 2021 +0530

    fix: comment out hourly, every_15_minute
    and every minute tasks

[33mcommit af923b97c9838f0e372747d5eda11fc5159cea49[m[33m ([m[1;31morigin/event-alerts[m[33m)[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Fri Oct 22 17:25:05 2021 +0530

    feat: add support of templated emails
    to event alerts

[33mcommit e6ddc8a5db2e778b2405d3c6f7a3a376e9011dab[m[33m ([m[1;31morigin/sb-frontend-eventalert[m[33m)[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 22 15:13:21 2021 +0530

    fix: minor fixes

[33mcommit ef3250c14fed535e4f23ec354f794aeb19884957[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 22 14:47:19 2021 +0530

    fix:event alert alert setting disable actions

[33mcommit 4f527ee9fb82e2b5faed47e5738710160d056745[m
Merge: 2878568 f84ad7d
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 22 12:39:08 2021 +0530

    Merge branch 'sb-frontend-validation' of https://github.com/chaos-genius/chaos_genius into sb-frontend-eventalert

[33mcommit 287856818b1b6693b8a477083e9b40f5a2878816[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 22 12:38:32 2021 +0530

    fix:test query toaster added

[33mcommit f84ad7d2acb8d6e0904dd62b57ec08e529215e3c[m[33m ([m[1;31morigin/sb-frontend-validation[m[33m)[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Fri Oct 22 12:37:30 2021 +0530

    fix: frequency tip added for configure analytics

[33mcommit 11984fcd325a506fec12f46e9ee56e3ce441436a[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Fri Oct 22 09:11:11 2021 +0530

    fix: configure time window validate error fixes

[33mcommit 99f4c7623893698bdc1b4bde3b563d4fd40a7420[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Thu Oct 21 17:55:39 2021 +0530

    fix: schedule issues fixed

[33mcommit 25cf185b88d27ce7b3f4a517823d7875907b8eb4[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Thu Oct 21 17:44:30 2021 +0530

    fix: Validation and conversion for the Time Window on basic of the Time Series Frequency

[33mcommit 84fd02c93c5487c8102e67a3ab13e0a78c714aca[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Thu Oct 21 12:34:18 2021 +0530

    fix:datasource disable save changes

[33mcommit b1e40927a9b57ca99b8da66648f65ca2a5ee4a48[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Thu Oct 21 12:24:11 2021 +0530

    fix: Change the error message toaster timeout to 30 seconds

[33mcommit 8d90f6aa537877d2e392194b4ae25d411d989206[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Thu Oct 21 11:49:13 2021 +0530

    fix:toaster for event alert

[33mcommit 3434e14a6e8c2da52e4671c698d680020dc53d91[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Oct 20 18:45:32 2021 +0530

    fix: kpi validations fixed and datasource edit disable button

[33mcommit 02408e170be52c70cee8a8268513ff792b6e2544[m
Merge: aab621e 1c53a54
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 20 17:06:39 2021 +0530

    Merge pull request #328 from chaos-genius/sb-frontend-posthog
    
    Integrate posthog and set into env variable

[33mcommit 1c53a54198445325883965ef1e8d67131da1483a[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 20 17:04:49 2021 +0530

    fix: add the frontend .env into the gitignore

[33mcommit 1a8d9cd9f06fa6b85dc904ba94a852572d3a0530[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 20 16:58:25 2021 +0530

    Delete .env

[33mcommit 44f14836ca0f88f8d11135e08e209e89ad81f5b9[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Oct 20 16:56:15 2021 +0530

    fix: remove process env in url helper

[33mcommit 89c5d0b346e9435567fcea1579a677f0dc6a0aef[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Oct 20 16:55:02 2021 +0530

    fix: gitignore .env added and remove console

[33mcommit d037db4d2150b742e132545912b3af39e65ea678[m[33m ([m[1;31morigin/sb-frontend-posthog[m[33m)[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Oct 20 16:45:16 2021 +0530

    fix:posthog integration and env variable name changed

[33mcommit dd9e853798080b525cca24bdc9e2bae0fcea89f3[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Oct 20 13:04:39 2021 +0530

    fix: env variable fix

[33mcommit aab621eb752cbeaca8b8751154fecd17b8249b33[m
Merge: 7625026 abdd9ea
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 20 12:54:36 2021 +0530

    Merge pull request #327 from chaos-genius/sb-frontend-datasourcefixes
    
    toaster fixes

[33mcommit d290c81f3ad3689629c523475b20655ac6fe0547[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Oct 20 12:07:07 2021 +0530

    fix:posthog added

[33mcommit df68f980f51054947741532ec2f65d97cd31c583[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Oct 20 11:46:26 2021 +0530

    fix:edit functionality

[33mcommit 4ee69000a26445846d43c84a66c85da951aedbee[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Oct 20 10:41:40 2021 +0530

    fix: edit data integrations

[33mcommit 62531d7f045b9841fae8afeff8c83d535bbc371e[m[33m ([m[1;31morigin/test-pytest-setup[m[33m)[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Oct 19 18:53:43 2021 +0530

    test: pytest setup, a basic unit test for a helper
    
     - add pytest.ini for pytest setup
        - only the `tests` folder is searched for tests
     - pytest was already in dev requirements
     - add a simple unit test for get_end_date helper in anomaly_data_view

[33mcommit a47c17067fd79b25916a270dc47ea7fbb882b20e[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Tue Oct 19 15:30:32 2021 +0530

    fix: event alert  add fix

[33mcommit abdd9ea6398b4b84223014e264900c02be77d105[m[33m ([m[1;31morigin/sb-frontend-datasourcefixes[m[33m)[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Tue Oct 19 14:10:19 2021 +0530

    fix:  datasource saving fix

[33mcommit 5562c77d776628ed5ae25761152d217c0c5a5168[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Tue Oct 19 14:08:05 2021 +0530

    fix: validation and functionality

[33mcommit 8fc66aa0d51580424e319e93873b066bb9aa1f5a[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Tue Oct 19 12:35:03 2021 +0530

    fix:event alert add alert functionality

[33mcommit 7625026470eaf9a650c59c1926046cb7b7e5a470[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Oct 18 20:26:15 2021 +0530

    fix: use the sqlalchemy resultproxy for reading the metadata instead of the DB cursor, fix #320

[33mcommit 9aac31188948747fe7b2750d6aa25241175195da[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Oct 18 18:44:11 2021 +0530

    fix: test and update the data source credentials, fix #308

[33mcommit 8b5dc4a6f3831271904c132e36851c5a67225233[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Mon Oct 18 16:16:26 2021 +0530

    fix: datasource and testquery api integrations

[33mcommit 39fe52ca23267e702a86cb5365f145ba9b831198[m
Merge: d083c00 be9fe5e
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Oct 18 15:10:49 2021 +0530

    Merge pull request #321 from chaos-genius/sb-frontend-errorfixes
    
    fix: Update the error messages, disable event kpi alert fix, anomaly setting fixes

[33mcommit be9fe5e901f78d6d8dd09a4fb515a63edadb5267[m[33m ([m[1;31morigin/sb-frontend-errorfixes[m[33m)[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Oct 18 10:51:49 2021 +0530

    fix: Alert Frequency should be daily incase of Anomaly Alert

[33mcommit d083c0069734c800b056e363887d4328592d2e63[m
Merge: 6a29ec3 4ead6d8
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Oct 16 20:47:11 2021 +0530

    Merge pull request #325 from chaos-genius/optional-subdim-dq-run
    
    Fixes issue #324: Optional subdim dq run

[33mcommit 4ead6d834e12577d03b7ccea8140c18049db6aeb[m[33m ([m[1;31morigin/optional-subdim-dq-run[m[33m)[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Sat Oct 16 17:15:31 2021 +0530

    fix(anomaly): Fixes #324 add "run_optional" to anomaly_params
    
    - contains a series of flags for "overall", "subdim" and "data_quality"
    - will run anomaly_detection for corresponding series_type if True
    - added validation for api end as well
    - to allow backward compatibility, if "run_optional" is not present,
    will run for all series_type

[33mcommit 6a29ec3a33fc2e9de24a9cce8ab2b9e14c739073[m
Merge: 7993c94 bab9bfb
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Oct 16 15:01:39 2021 +0530

    Merge pull request #323 from chaos-genius/docker-testing-scripts
    
    feat: added scripts for docker testing

[33mcommit bab9bfb2509cbd6519864c515163f8ab6f10c43b[m[33m ([m[1;31morigin/docker-testing-scripts[m[33m)[m
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Sat Oct 16 12:01:24 2021 +0530

    fix: added Shebang directive to the init script

[33mcommit 540fd17dbe4f081cb0761eb7cc1550fe0b0923e3[m
Merge: 1fe1080 7993c94
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Sat Oct 16 10:24:57 2021 +0530

    Merge branch 'main' of github.com:chaos-genius/chaos_genius into docker-testing-scripts

[33mcommit 7993c94de3f879dc572ef88997fe88a1464fd7c7[m
Merge: 4be5d6e be6d289
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Oct 15 17:46:08 2021 +0530

    Merge pull request #322 from chaos-genius/anomaly-drilldown-fix
    
    feat(anomaly): single dimensional drilldowns + Closes #319

[33mcommit 1fe1080baac8bff8557d76f65070eb8dd802ddc9[m
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Fri Oct 15 17:30:36 2021 +0530

    fix: fixed bug in docker-build script

[33mcommit 903c79c2b541d53c553436cf26b78eb62170f278[m
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Fri Oct 15 16:57:37 2021 +0530

    feat: added docker testing scripts for building and psuhing new images to dockerhub

[33mcommit 4be5d6e694b74a103f70769f638d26b00e2a8a6a[m
Merge: a0ba778 83f2123
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 14 19:53:22 2021 +0530

    Merge pull request #317 from chaos-genius/airbyte-sources-init
    
    fix: added the missing script for the chaosgenius-init container

[33mcommit be6d2896edee6b20fcd86a31dabd839abcac3d34[m
Author: Amatullah <amatullahsethji@gmail.com>
Date:   Thu Oct 14 17:43:15 2021 +0400

    feat : single dimensional drilldowns + Closes #319

[33mcommit 3ec06fd7a4fa1236fef606f2d21605470cfd5cdd[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Oct 14 17:03:10 2021 +0530

    refactor(anomaly): refactor controller detect function
    
    abstracted AnomalyDetectionController.detect function to extract subdim
    calculation and data quality calculation into different functions

[33mcommit 9985b29d2faabef22a3bcf4f74deb6455bf385c6[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Thu Oct 14 13:30:54 2021 +0530

    fix: alert error message fix

[33mcommit 7f3c98cb19fed8c5e7648dc43203a81166d1da65[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Thu Oct 14 13:18:52 2021 +0530

    fix: configuration setting error message fix

[33mcommit 6a70509bd2c0fa79593bbf7c70fff1619739c62f[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Thu Oct 14 13:15:06 2021 +0530

    fix: kpiexplorer error message fix

[33mcommit b5fa19642f17d0609d9f476f0f60c7408145677a[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Thu Oct 14 13:11:41 2021 +0530

    fix:plus image added and clickable issues fixed

[33mcommit 6137bbbf19fa7b2afdfc6c17bac8e6ad260f574b[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Thu Oct 14 12:23:04 2021 +0530

    fix: added created at and changed model name

[33mcommit e718ce998ecd104f8426a96a40449bac848ccf7b[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Thu Oct 14 12:16:21 2021 +0530

    fix: datasource error message fixes

[33mcommit 83f2123e29ed8d17640239efcaaf953fbc4be9f9[m
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Thu Oct 14 11:06:50 2021 +0530

    fix: added the missing script for the init container

[33mcommit a0ba7785f8cffba7e39eca7760f01cb4b5ad6eb6[m
Merge: d545e80 eceb1cf
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 14 10:21:22 2021 +0530

    Merge pull request #316 from chaos-genius/sb-frontend-datasourcefixes
    
    fix: Count & size columns in the DeepDrills table are swapped

[33mcommit d545e801013a78b42c24baf1f8b0b9432440183b[m
Merge: 894b5f7 5f347fc
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 14 10:20:35 2021 +0530

    Merge pull request #315 from chaos-genius/logging
    
    feat(log):  Robust and Comprehensive Logging. Closes #313.

[33mcommit 894b5f7695065cd9b66c1314d6812110b43ab97e[m
Merge: eba8827 049d88f
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 14 10:19:44 2021 +0530

    Merge pull request #307 from chaos-genius/anomaly-graph-fix
    
    Fixed rounding issue for anomaly graph output

[33mcommit eceb1cf2ad1a7162fc18dfc79c09e738e864c6d9[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Oct 13 18:22:24 2021 +0530

    fix: #310 Count & size columns in the DeepDrills table are swapped

[33mcommit 5f347fc251f36e17d44af0e15581267fdf9f394a[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 13 18:01:24 2021 +0530

    feat(log): refer #313
    
    * Centralized logging
    * Added stream handler
    * Reduced clutter in log messages

[33mcommit e1d2e8ec8601eb979d9c03838a58436804c0e351[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Oct 13 17:55:42 2021 +0530

    fix: kpi form toast fix

[33mcommit eba88276178752d118bacb8b32d1d927a84a70fe[m
Merge: 2c00396 e366fb9
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 13 17:11:19 2021 +0530

    Merge pull request #312 from chaos-genius/kpi-db-size-validation
    
    feat(kpi): add DB size validation to KPI

[33mcommit 049d88fd1dbde728e1a9e117645f7ae4be1c4602[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 13 17:09:19 2021 +0530

    fix(anomaly): updated rounding to unified method
    
    replaced round and precision with round_number

[33mcommit e366fb96b6dd9d0f70d333d326cae67982198152[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Wed Oct 13 17:02:54 2021 +0530

    chore(kpi): update docstring, fix typing

[33mcommit 2c00396dafac3c814eb19485debd5bca42b96f02[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 13 16:49:14 2021 +0530

    feat(anomaly): added day of week in tooltip
    
    Anomaly chart tooltip has been reorganized and updated with day of week.
    Closes #305

[33mcommit e8e800b88ee45dac035514997e5b61dc2bd333b8[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Wed Oct 13 16:47:39 2021 +0530

    feat(kpi): add DB size validation to KPI
    
    adds a maximum limit to the data size for the last two months,
    currently 5M rows

[33mcommit 43023f75bcaf234930468aadcf95fadab82d99f2[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Oct 13 12:06:46 2021 +0530

    change locaal storage to useContext

[33mcommit 3ba1791cdf8ebce811a13d1a772c91cf3ce6360c[m
Author: Amatullah <amatullahsethji@gmail.com>
Date:   Tue Oct 12 21:05:23 2021 +0400

    fix : Closed #306

[33mcommit cca9d637f3746fba49d0145271c9226a735574aa[m
Author: pshrimal21 <83073282+pshrimal21@users.noreply.github.com>
Date:   Mon Oct 11 23:53:30 2021 +0530

    Update README.md

[33mcommit 6ef5c402e10719a3b8b541d8f7a3cd9170be1dbf[m
Author: pshrimal21 <83073282+pshrimal21@users.noreply.github.com>
Date:   Mon Oct 11 22:17:11 2021 +0530

    Update README.md

[33mcommit a4a5ae82d71cd0b42af45b0f158840da8357000b[m
Author: pshrimal21 <83073282+pshrimal21@users.noreply.github.com>
Date:   Mon Oct 11 22:16:49 2021 +0530

    Update README.md

[33mcommit 71385e13dca5d111fdc3aa7c5d528690085cf3a0[m[33m ([m[1;33mtag: v0.1.2[m[33m)[m
Author: pshrimal21 <83073282+pshrimal21@users.noreply.github.com>
Date:   Mon Oct 11 20:41:16 2021 +0530

    Update README.md

[33mcommit 43a49625e29a377f31d265e3d27b68f30d38cd9e[m
Author: pshrimal21 <83073282+pshrimal21@users.noreply.github.com>
Date:   Mon Oct 11 20:40:40 2021 +0530

    Update README.md

[33mcommit fd93f3e1099e90786927017513cf0c48a027b643[m
Author: Aayush Naik <57558584+NaikAayush@users.noreply.github.com>
Date:   Mon Oct 11 18:16:21 2021 +0530

    refactor: move up artwork, echo before gunicorn start

[33mcommit adda5b79f2017dc257c0fdf2d691bae1e09747f9[m
Merge: 93be8a9 771074f
Author: Harshit Surana <surana.h@gmail.com>
Date:   Mon Oct 11 18:02:01 2021 +0530

    Merge pull request #302 from chaos-genius/docker-separate-latest
    
    feat(docker): separate latest and stable docker compose

[33mcommit 73da2988da94cdc5638f919a5dc9ae80dbc1ed25[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Mon Oct 11 17:18:23 2021 +0530

    fix: Bing datasource hardcoded input added

[33mcommit e66cb8cee32ec1de12cef7390385c428335c9f9f[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Oct 11 16:43:20 2021 +0530

    fix: datasource form fixes

[33mcommit 93be8a98066ce79bd2f2df22d9d9bc7f179f54ac[m
Merge: 22c04b5 d273b45
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Oct 11 15:03:08 2021 +0530

    Merge pull request #303 from chaos-genius/alert-logging
    
    fix: add logging to alert code

[33mcommit 22c04b5f1e4a10b59e9d2e4616dbd0f2cb37e399[m
Author: Aayush Naik <57558584+NaikAayush@users.noreply.github.com>
Date:   Mon Oct 11 14:59:05 2021 +0530

    refactor: echo welcome message after startup

[33mcommit 40708eb938762c07abf6231baf7f69f9e5a13d9d[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Mon Oct 11 14:43:17 2021 +0530

    fix: add frequency keys to ETS and NeuralProphet

[33mcommit d273b45863ebd2d71098237ac64961b181ba9a56[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Mon Oct 11 14:36:45 2021 +0530

    fix: add logging to alert code

[33mcommit 771074f2bae0cb95c8ad1267ce56d089cb12cbdc[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Mon Oct 11 14:21:59 2021 +0530

    feat(docker): separate latest and stable docker compose

[33mcommit 3798a7a65f6c9b3f7d6dfc7791c5487884d92673[m
Merge: aed3a89 1b220ee
Author: Harshit Surana <surana.h@gmail.com>
Date:   Mon Oct 11 14:00:05 2021 +0530

    Merge pull request #301 from chaos-genius/issue-templates
    
    Update issue templates

[33mcommit 1b220eed98cbca116d6f0c89c484599c6de49f8f[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Mon Oct 11 13:59:49 2021 +0530

    Update issue templates

[33mcommit aed3a89a09a5775842b647f7d1b9cab9144f15de[m
Merge: 744a54f ce48aee
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Oct 11 13:32:20 2021 +0530

    Merge pull request #293 from chaos-genius/sb-frontend-channelfix
    
    Drop down fixes & slack channel name value fixed

[33mcommit 744a54f824eb3e5ad464ae2077fbb50a8191acd9[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Mon Oct 11 13:28:22 2021 +0530

    Create LICENSE.md

[33mcommit ce48aee7c795f952aa9c21b9e606e5219aafdc3a[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Oct 11 13:15:18 2021 +0530

    fix: channel name in destination form

[33mcommit 0cba9544a368b23a326d4c9277cf351d574dde66[m
Merge: 9744d55 9f87b77
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Oct 11 12:01:58 2021 +0530

    Merge pull request #291 from chaos-genius/docker-fix-react-app-url
    
    fix(docker): add REACT_APP_BASE_URL in .env for server config

[33mcommit 9744d55c766330944731c0eca60db7d88db8aae0[m
Merge: 209d294 3b187b6
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Oct 11 12:00:17 2021 +0530

    Merge pull request #299 from chaos-genius/snowflake-connector
    
    feat: add the snowflake connector

[33mcommit 3b187b60a0722cb463c79364261c135856dccf22[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Oct 11 11:59:28 2021 +0530

    feat: add the snowflake connector

[33mcommit 209d294d9181367b8bd9aba8e1d706fedf756276[m
Merge: d8b5ca1 9617d2b
Author: Harshit Surana <surana.h@gmail.com>
Date:   Mon Oct 11 11:24:46 2021 +0530

    Merge pull request #298 from chaos-genius/all-contributors/add-manassolanki
    
    docs: add manassolanki as a contributor for bug

[33mcommit 9617d2b219c1c2fc278569abb279a8766e39588c[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Mon Oct 11 05:54:33 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit 1548432fec0b3b701353281d267c620609f9b35e[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Mon Oct 11 05:54:32 2021 +0000

    docs: update README.md [skip ci]

[33mcommit d8b5ca1482a664aebe531f6300622d8ab705a7cc[m
Merge: 0c92663 ff6204b
Author: Harshit Surana <surana.h@gmail.com>
Date:   Mon Oct 11 11:23:37 2021 +0530

    Merge pull request #297 from chaos-genius/all-contributors/add-suranah
    
    docs: add suranah as a contributor for bug

[33mcommit ff6204b2fdece28e5950b20df7a1119f2d056b70[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Mon Oct 11 05:53:21 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit 2324b9d4862e89877a4759a106d218ad8ea5f776[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Mon Oct 11 05:53:20 2021 +0000

    docs: update README.md [skip ci]

[33mcommit 0c92663723deda5b35cfe8e255d8c2d0d93c3a06[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Mon Oct 11 11:21:39 2021 +0530

    Update .all-contributorsrc

[33mcommit 8465e98c558a93d90063f37a70fc5745fb7b166c[m
Merge: a4c4bd0 2e329d1
Author: Harshit Surana <surana.h@gmail.com>
Date:   Mon Oct 11 11:15:06 2021 +0530

    Merge pull request #296 from chaos-genius/all-contributors/add-Fletchersan
    
    docs: add Fletchersan as a contributor for bug

[33mcommit 2e329d1e8a6af82c2566ee1faccadd7dfba7e9cb[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Mon Oct 11 05:44:48 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit 8f67549b1da5b93f2f69b735a28cf4fcdc4a152b[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Mon Oct 11 05:44:47 2021 +0000

    docs: update README.md [skip ci]

[33mcommit a4c4bd0d5a1c79e013f4fa2c7f31aa37a6eefef8[m
Merge: 2a544b1 88c3662
Author: Harshit Surana <surana.h@gmail.com>
Date:   Mon Oct 11 11:14:02 2021 +0530

    Merge pull request #295 from chaos-genius/all-contributors/add-Samyak2
    
    docs: add Samyak2 as a contributor for bug

[33mcommit 88c3662f075d46952b23b3bcd17d11be1a56d0a9[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Mon Oct 11 05:41:45 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit b23b220a44971b09afab84065cf7dbf81596a3bd[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Mon Oct 11 05:41:44 2021 +0000

    docs: update README.md [skip ci]

[33mcommit 2a544b186ed4dfeed4f4f4f3a1f3e567695b2285[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Mon Oct 11 11:07:04 2021 +0530

    docs: update README

[33mcommit 69a748e7df379d5ccf9a384403de8709a8435f6b[m
Merge: 1a160b4 c68d81b
Author: Harshit Surana <surana.h@gmail.com>
Date:   Mon Oct 11 10:41:04 2021 +0530

    Merge pull request #294 from chaos-genius/anomaly-freq-fix
    
    fix: added frequency keywords for models

[33mcommit c68d81bcaa7d7f44f5deef68d92822ba0be83475[m
Author: Amatullah <amatullahsethji@gmail.com>
Date:   Mon Oct 11 08:36:11 2021 +0400

    fix: added frequency keywords for models

[33mcommit 9f87b779d95a7cc3c006016320abf2338e73bafd[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Fri Oct 8 15:39:41 2021 +0530

    fix(docker): add REACT_APP_BASE_URL in .env for server config
    
    REACT_APP_BASE_URL needs to be set correctly when using the compose
    deployment on a server.
    
    Also moved caching timeout to the top

[33mcommit 9a0ff10525fa408f3b73078244aa2f716b086d3c[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Fri Oct 8 15:14:01 2021 +0530

    fix: graph cuts

[33mcommit 1a160b4dd26bb620a7303ce7811799dd391dcc2b[m
Merge: 11bcaf0 39cd1ce
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Oct 8 14:14:33 2021 +0530

    Merge pull request #288 from chaos-genius/refactor_slack_alert
    
    fix: remove alert_body from send_slack_alert

[33mcommit f3db20ba31d5c798a3ad7de815fd46460fc9474d[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 8 11:34:09 2021 +0530

    fix:dropdown and input fixes

[33mcommit 11bcaf060b8177b41ac272a347a4273436cca579[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Fri Oct 8 02:54:27 2021 +0530

    docs: update README

[33mcommit d834bdd5a59672c5aef0c0dc5a2269aaacd31e56[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Fri Oct 8 02:48:03 2021 +0530

    docs: updating readme

[33mcommit 9b2a519398f693952f05726ebc894d1954ff0584[m
Merge: 5a7d3f7 4d9e9b6
Author: Harshit Surana <surana.h@gmail.com>
Date:   Fri Oct 8 02:22:00 2021 +0530

    Merge pull request #286 from chaos-genius/doc/roadmap-patch-1
    
    doc(roadmap): fix typos and add checkboxes

[33mcommit 5a7d3f7927e14b1a1279ab8cfef290ef6b057486[m
Merge: 3dfbc16 978de1f
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Oct 8 01:52:39 2021 +0530

    Merge branch 'main' of github.com:chaos-genius/chaos_genius

[33mcommit 3dfbc162701b9677e49cf945c827ab6d406a7f1b[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Oct 8 01:52:23 2021 +0530

    fix(rca): kpi load data mid date query fixed

[33mcommit 978de1f4555b3bd9426a4bbc397558c08ba75da0[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Fri Oct 8 01:33:02 2021 +0530

    fix: convert cache timeout from env to int

[33mcommit 94cb08368061be16a99e16264d5b0469539773a5[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Fri Oct 8 01:24:03 2021 +0530

    fix(docker): add CACHE_DEFAULT_TIMEOUT to compose

[33mcommit d3f1fbb9c899682e4763c48813119ca9411c8106[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Oct 8 00:49:13 2021 +0530

    fix: changes after handling the merge conflicts

[33mcommit 14b316a7040de06b3e7338ae2227945a2601354e[m
Merge: d1a0bf9 1ccffa2
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Oct 8 00:41:22 2021 +0530

    Merge pull request #290 from chaos-genius/refactor-ds
    
    Refactor data connections

[33mcommit 1ccffa226956ceb723a081f8ecf18a9c43053716[m
Merge: 19402a4 d1a0bf9
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Oct 8 00:41:03 2021 +0530

    Merge branch 'main' into refactor-ds

[33mcommit d1a0bf9759de6da69f2eaa3015a87259d726301a[m
Merge: 316047a 382567b
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Oct 8 00:25:07 2021 +0530

    Merge branch 'main' of github.com:chaos-genius/chaos_genius

[33mcommit 316047a6aa1d2073c9e277f6ac767d95a4395f93[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Oct 8 00:23:36 2021 +0530

    fix(cache): caching now uses env variable

[33mcommit 382567bf53db613d6b6dc8d4ad00d050c8afc078[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Fri Oct 8 00:21:40 2021 +0530

    chore(docker): reorder compose and env file

[33mcommit 29091f6a5134f610e03fef56005a8ceed237b0f2[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Fri Oct 8 00:15:44 2021 +0530

    fix(docker): update env file to use new service name

[33mcommit ae259357fa49596e2dc70efaba6da3325ed577e3[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Fri Oct 8 00:14:42 2021 +0530

    fix(docker): rename services to have chaosgenius prefix

[33mcommit 22c202dec156f232942ab05ef50e0c236918d81f[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Oct 8 00:09:20 2021 +0530

    fix(anomaly): fixed outdated anomaly params

[33mcommit adc77851e86830dabf93955584bbab6d247f9e8a[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Oct 7 23:43:36 2021 +0530

    fix: change string to sourceDefinitionId dict in integration_client
    
    Co-authored-by: Manas Solanki <manassolanki@gmail.com>

[33mcommit aac7379b80d3f30825c2c5954db7ac86b05041a9[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Oct 7 23:08:50 2021 +0530

    fix(docker): use port 8080 for frontend webapp

[33mcommit e1c8e146973bb5499467b82a5640bd88c96d8806[m
Merge: b5aeecd e95252c
Author: Samyak Sarnayak <samyak201@gmail.com>
Date:   Thu Oct 7 23:02:57 2021 +0530

    Merge pull request #289 from chaos-genius/docker
    
    Add docker compose

[33mcommit e95252c0b53996891f423e8c842faf289ddc62c2[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Oct 7 23:00:01 2021 +0530

    fix: add dockerignore for frontend - node_modules

[33mcommit b5aeecdb108f3ca6db4a8e460fbc8df762b7a200[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 22:33:28 2021 +0530

    docs: add overview gif to readme

[33mcommit 4e60a6c43d460a1730090e5e8e92382b5150e386[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Oct 7 22:32:23 2021 +0530

    fix: add dockerignore with unnecessary files/folders
    
    Co-authored-by: NaikAayush <ayush@pesu.pes.edu>

[33mcommit 5cc48f884dc46557a497de94c4936bfd735060cf[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Oct 7 22:25:39 2021 +0530

    feat: add frontend Dockerfile
    
    Co-authored-by: NaikAayush <ayush@pesu.pes.edu>

[33mcommit ef6aa7dfb5208fd7c4b450d93ed80d443fa29590[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Oct 7 22:24:39 2021 +0530

    feat: add main CG dockerfile
    
    Co-authored-by: NaikAayush <ayush@pesu.pes.edu>

[33mcommit 9b51308d656fb4ab8503ec9873170f66fe356524[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Oct 7 22:18:06 2021 +0530

    fix: make separate celery worker services for image docker-compose too

[33mcommit 1f39a4f0d660164b070030f02ec893a5b62b9895[m
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Thu Oct 7 10:40:12 2021 +0530

    fix: made two seperate celery for alerts and analytics

[33mcommit 825ecd936dff822a26127174d2a39e5f8224a62f[m
Author: NaikAayush <ayush@pesu.pes.edu>
Date:   Sun Sep 19 23:09:13 2021 +0530

    feat: add chaosgenius ascii text

[33mcommit 4a4a26e5c4223e80dcc83644e4d4860003039ec9[m
Author: NaikAayush <ayush@pesu.pes.edu>
Date:   Sat Sep 18 18:09:01 2021 +0530

    feat: backend script for docker

[33mcommit 948d9cce743c5803e91f7baa2b78ba1f2694a9f7[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Oct 7 22:07:47 2021 +0530

    feat: add docker compose files, .env and update gitignore
    
    docker-compose.yml - pulls from dockerhub
    docker-compose.dev.yml - builds from local repo
    .env - docker-compose related env vars
    
    Co-authored-by: NaikAayush <aayushnai@gmail.com>
    Co-authored-by: bhargav <bhargavskumar51703@gmail.com>

[33mcommit 39cd1cebcf911292104961233546bd4f9f71f819[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Thu Oct 7 22:09:24 2021 +0530

    fix: remove alert_body from send_slack_alert

[33mcommit 02e8af32f69793de5ef3bc058920d58197389098[m
Merge: b5a0cd3 2c58284
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 7 21:54:55 2021 +0530

    Merge pull request #287 from chaos-genius/Init_refactor
    
    feat: added code for retries at intervals for sources initialization

[33mcommit 2c582845d1465c707617fa3af38e8b69140c46da[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 7 21:54:33 2021 +0530

    fix: add the snowflake while pulling the container

[33mcommit 88cbf4be799bdeb59d9c104e5c226943337c536b[m
Author: bhargav <bhargavskumar51703@gmail.com>
Date:   Thu Sep 30 21:30:02 2021 +0530

    feat: added code for retries at intervals for sources initialization

[33mcommit b5a0cd3ff2bd5f06802535f38993e2b0e315cc11[m
Author: pshrimal21 <83073282+pshrimal21@users.noreply.github.com>
Date:   Thu Oct 7 21:27:00 2021 +0530

    Update README.md

[33mcommit 36a292053f78a4b614cdc25fd159ee0d6c57c474[m
Merge: 27a31ce 92767c3
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 7 21:13:31 2021 +0530

    Merge pull request #285 from chaos-genius/refactor_alert_creds
    
    fix: refactor the alert code

[33mcommit 4d9e9b6d461bc24ccdaea0b8c696e227641ac523[m
Author: Samyak Sarnayak <samyak201@gmail.com>
Date:   Thu Oct 7 20:23:07 2021 +0530

    doc(roadmap): fix typos and add checkboxes

[33mcommit 92767c3f3f06f75e42fae6df1f88176f351d04c8[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 7 19:59:33 2021 +0530

    fix: minor code changes

[33mcommit 27a31ce5788109d2f0704be06772aebe292c5a95[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Oct 7 19:29:04 2021 +0530

    chore: commented neuralprophet and greykite
    
    These models have been commented for this release.

[33mcommit 74066da0c5d9cc5860eed2132a4e99a24a738a9b[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Thu Oct 7 19:17:40 2021 +0530

    fix: refactor the alert code
    - The channel credentials are now picked from db
    - Earlier env file was used

[33mcommit 03553b99354c3c03420bc3f26f7cba6659eebe48[m
Merge: a0f4bfe 2225cc8
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 7 19:02:55 2021 +0530

    Merge pull request #284 from chaos-genius/sb-frontend-analyticsfixes
    
    Error message & integer type changed

[33mcommit 2225cc8d97166e80590653377374847384f601ff[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Thu Oct 7 18:34:57 2021 +0530

    fix:error message and integer type changed

[33mcommit a0f4bfef3815afb8b80b2cfd46e0e60334d62d9d[m
Merge: ff9b2bc e3a2f52
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Oct 7 18:13:24 2021 +0530

    Merge branch 'main' of https://github.com/chaos-genius/chaos_genius into main

[33mcommit ff9b2bc85f8ad9cfc930818c239d3f0b81a236ca[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Oct 7 18:13:02 2021 +0530

    fix(anomaly): quick fix for Frequency Constants

[33mcommit e3a2f52995793ef2856e37533523afa67eb96fdf[m
Merge: 548f034 79362b5
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 7 16:59:51 2021 +0530

    Merge pull request #282 from chaos-genius/sb-frontend-fixesanomaly
    
    fix: anomaly dashboard minor fixes

[33mcommit 79362b5cd11e1637088ecb87e5c1987a208a882c[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Thu Oct 7 16:44:00 2021 +0530

    fix: kpi alert destination tip makes link

[33mcommit 8d806554a9d1b09eb032f47f4a6f1f64a50febc8[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Thu Oct 7 16:29:48 2021 +0530

    fix: anomaly dashboard minor fixes

[33mcommit 548f034a85515f00fb553ee96c5ab00b42083379[m
Merge: a212680 575a269
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 7 16:27:23 2021 +0530

    Merge pull request #281 from chaos-genius/sb-frontend-kpialert
    
    fix: anomaly setting, destination form tip added

[33mcommit a21268022ad29b61e5fe2cc2ff0442c721a91114[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 7 16:26:01 2021 +0530

    fix: issue in saving settings

[33mcommit 575a26944ada22ad792cf14f2426df65fca0729f[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Thu Oct 7 16:18:00 2021 +0530

    fix: destination form channel tip added

[33mcommit 339715519081e769004011b547912c32683490a1[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 15:11:27 2021 +0530

    docs: minor edits to README

[33mcommit b879d47e945664ee6f8b69cffc95e1a72972f551[m
Merge: e69dda4 ea2723f
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 15:05:31 2021 +0530

    Merge pull request #280 from chaos-genius/all-contributors/add-Mansi-Chauhan27
    
    docs: add Mansi-Chauhan27 as a contributor for plugin

[33mcommit ea2723f1ab5949d3f89988024e39a854fed9e353[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:35:09 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit 22f894f94a4a8d559f0822b27a17c92558fe2ef6[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:35:08 2021 +0000

    docs: update README.md [skip ci]

[33mcommit e69dda400dbf8b2fb9bf096bee28f70aac6d4357[m
Merge: d852937 177bfe3
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 15:04:18 2021 +0530

    Merge pull request #279 from chaos-genius/all-contributors/add-Santhoshkumar1023
    
    docs: add Santhoshkumar1023 as a contributor for code, design

[33mcommit 177bfe3cfd1307d5a61dafe37e0a92ec18b523ed[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:33:55 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit f538868c9b68ada38835db174c0a88ee74953289[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:33:54 2021 +0000

    docs: update README.md [skip ci]

[33mcommit d852937d0c3a070ff94933a63c1d2c4a95f22dd5[m
Merge: 920c6a2 abf9ffd
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 15:03:11 2021 +0530

    Merge pull request #278 from chaos-genius/all-contributors/add-moghankumar06
    
    docs: add moghankumar06 as a contributor for code, design

[33mcommit 920c6a278ff3c607edf7061863e31ded0d8d1696[m
Merge: ccd1b5f bb9885c
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 7 15:02:40 2021 +0530

    Merge pull request #249 from chaos-genius/slack-email-alerts
    
    Slack email alerts

[33mcommit abf9ffdf9983d1338a42d749c205f04017e717f6[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:32:01 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit 0055038d3e85c3039c2ed6065bd6a2e06914f75f[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:32:00 2021 +0000

    docs: update README.md [skip ci]

[33mcommit ccd1b5f131399bf33dc55cb0eef7fd3d6fa32e17[m
Merge: fd996a7 aec0ba7
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 14:59:08 2021 +0530

    Merge pull request #277 from chaos-genius/all-contributors/add-bhargavsk1077
    
    docs: add bhargavsk1077 as a contributor for code, platform, bug

[33mcommit aec0ba7e97cb4f68bb9b2d0da16c02f37fbd6004[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:28:52 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit fc508bbf4ad1564879adbab0e39955647e527b6f[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:28:51 2021 +0000

    docs: update README.md [skip ci]

[33mcommit fd996a7e28583124e4697e0357727d3dcc26872a[m
Merge: b65e1cd 0fc4d75
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 14:58:16 2021 +0530

    Merge pull request #276 from chaos-genius/all-contributors/add-kshitij123456
    
    docs: add kshitij123456 as a contributor for code, tool, bug

[33mcommit 0fc4d755dbf6e8fcb227e7a56e8396fc68618daa[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:27:59 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit c02d871919ce546df371ea6917b4d45c1099e0b4[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:27:58 2021 +0000

    docs: update README.md [skip ci]

[33mcommit c253b8c6cdb5e2215c283ff400c5f4cc39a5d7fb[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Thu Oct 7 14:57:57 2021 +0530

    fix: alert fixes

[33mcommit b65e1cd903048b9f24c871bec233f61f7f565863[m
Merge: 44ec2bb eeb85d2
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 14:55:36 2021 +0530

    Merge pull request #275 from chaos-genius/all-contributors/add-NaikAayush
    
    docs: add NaikAayush as a contributor for code, tool, platform

[33mcommit eeb85d22bf948f08dd0c51ff69a24342f7bb88ce[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:25:20 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit 827d63b9a7131302d6839e08980eebeaabbbea23[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:25:19 2021 +0000

    docs: update README.md [skip ci]

[33mcommit 44ec2bbc169bd3666a1bc0138c96ec77391c7f33[m
Merge: e8d7296 5757a60
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 14:53:28 2021 +0530

    Merge pull request #274 from chaos-genius/all-contributors/add-Samyak2
    
    docs: add Samyak2 as a contributor for code, tool, platform

[33mcommit 5757a60f01bccfdb17b3b8fcd42dbea469ba9060[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:23:01 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit d6b5c8d3006786c9d74f2fe62269c99d5ea93e90[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:23:01 2021 +0000

    docs: update README.md [skip ci]

[33mcommit e8d7296995a673c5b730ef97b13e345a23266c2e[m
Merge: 420c0f6 281f022
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 14:51:52 2021 +0530

    Merge pull request #273 from chaos-genius/all-contributors/add-Fletchersan
    
    docs: add Fletchersan as a contributor for code, tool, data

[33mcommit 281f022a3eabed7a25bb50a395e705905d60b049[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:21:26 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit 278114a3b35657fbd80985a0bd95af7ef083e93d[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:21:25 2021 +0000

    docs: update README.md [skip ci]

[33mcommit 420c0f6f507776fa761dab9aa10ef1970bd68d89[m
Merge: 4e1f93d 61fc755
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 14:50:19 2021 +0530

    Merge pull request #272 from chaos-genius/all-contributors/add-juzarbhori
    
    docs: add juzarbhori as a contributor for code, design

[33mcommit 61fc7557a2068de8cc145ba3bbcb18ac896870fc[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:19:41 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit 80083eb04fa4da92d9fa6882b94af30e6dd9389b[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:19:40 2021 +0000

    docs: update README.md [skip ci]

[33mcommit 4e1f93dfa2e8988c09ee8d7aaaa162f90630034f[m
Merge: bbfdb24 2ecce08
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 14:47:41 2021 +0530

    Merge pull request #271 from chaos-genius/all-contributors/add-Amatullah
    
    docs: add Amatullah as a contributor for code, data, test

[33mcommit 2ecce087a1cf413211dce7b1c5f394a16fd6f0cf[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:17:17 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit 21b2c3237810c025f17162ffc74244b94cc05960[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:17:16 2021 +0000

    docs: update README.md [skip ci]

[33mcommit bbfdb24e33357d378e1ca30433724dce766cb80b[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 14:45:42 2021 +0530

    docs: update contributors

[33mcommit 548a8f62b5ccffe9ab5e88105e0790016e52a2c8[m
Merge: 7f27f41 0d2b014
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 14:44:42 2021 +0530

    Merge pull request #270 from chaos-genius/all-contributors/add-pshrimal21
    
    docs: add pshrimal21 as a contributor for design

[33mcommit 0d2b014e4d0ceebcccd0f2aef03b46e090fa033e[m
Merge: 6b7d444 7f27f41
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 14:44:31 2021 +0530

    Merge branch 'main' into all-contributors/add-pshrimal21

[33mcommit 6b7d444bab26272a336fa0aa35e6aafceab5796d[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:13:22 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit 9e72271f3d4f732e3734709d1f636f8d4405bc9a[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:13:21 2021 +0000

    docs: update README.md [skip ci]

[33mcommit 7f27f41bac5ca97439f884bd9cc2f88c9fc0513e[m
Merge: a428f57 1cd4e55
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 14:42:46 2021 +0530

    Merge pull request #269 from chaos-genius/all-contributors/add-dajkatal
    
    docs: add dajkatal as a contributor for plugin, doc

[33mcommit 1cd4e55086d4020b5fa933f9ae40c81bdc83f257[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:12:22 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit 1f513adcfab1cd8d9b3ea0ca0f8c77919d039e52[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:12:21 2021 +0000

    docs: update README.md [skip ci]

[33mcommit a428f5766fc026806322c59a78a3dda098a7aaf1[m
Merge: 52b4140 79502d2
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 14:35:05 2021 +0530

    Merge pull request #268 from chaos-genius/all-contributors/add-keshprad
    
    docs: add keshprad as a contributor for code, data, doc

[33mcommit 79502d247b1e7adbbd2cee46096a5096a0d8ba06[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:04:45 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit bbfa98d2504b53e49d28d3417a18cb386aed35b4[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 09:04:44 2021 +0000

    docs: update README.md [skip ci]

[33mcommit 52b4140868c3595fdcb266527b41e819b466286e[m
Merge: e06db0d f3288a6
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 13:08:06 2021 +0530

    Merge pull request #266 from chaos-genius/all-contributors/add-varunp2k
    
    docs: add varunp2k as a contributor for code, maintenance

[33mcommit f3288a6b7e51f3e1c500f8199913f159842dc851[m
Merge: 00dd6d0 e06db0d
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 13:07:55 2021 +0530

    Merge branch 'main' into all-contributors/add-varunp2k

[33mcommit e06db0d29f2fbb527809b148813e7d7c1d43d09a[m
Merge: 7cbe818 acd7e9d
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 13:00:57 2021 +0530

    Merge pull request #267 from chaos-genius/all-contributors/add-kartikay-bagla
    
    docs: add kartikay-bagla as a contributor for code, maintenance

[33mcommit acd7e9ded2b14eddf3b42ef819ef2454cb9c8983[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 07:30:14 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit ffd77f4c233f285a583223dc6f4a4fadf1388f79[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 07:30:13 2021 +0000

    docs: update README.md [skip ci]

[33mcommit 00dd6d0857652784e625c0433e335d5ce02a839d[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 07:29:17 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit 3aced678bfd9497253a0e1efd36cdb3dd93ba82f[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 07:29:16 2021 +0000

    docs: update README.md [skip ci]

[33mcommit 7cbe8180a7cc86eb5553b0c83ec67d16da97293d[m
Merge: 259db92 b0b19ca
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 12:55:28 2021 +0530

    Merge pull request #265 from chaos-genius/all-contributors/add-manassolanki
    
    docs: add manassolanki as a contributor for code, review, tool

[33mcommit b0b19ca7243874cc77941aca81bd6411eff53367[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 07:24:00 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit d17615ba03230c731ff26f3dc053f2b0d23ca792[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 07:23:59 2021 +0000

    docs: update README.md [skip ci]

[33mcommit 259db92a1665556fae5a6b703a14a933188329fe[m
Merge: 4cb8d86 8f23481
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 12:51:34 2021 +0530

    Merge pull request #264 from chaos-genius/all-contributors/add-suranah
    
    docs: add suranah as a contributor for code, content, review

[33mcommit 8f23481ea70d7c94b74d24d407d330d00367e39b[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 07:20:54 2021 +0000

    docs: update .all-contributorsrc [skip ci]

[33mcommit 1156343d0ee40c878164baf10a5cc871d0321f9b[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 07:20:53 2021 +0000

    docs: update README.md [skip ci]

[33mcommit 4cb8d861cd4d71319d4df6984762c6a24c3962c7[m
Merge: 52b4b1d d0dcd20
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 12:50:41 2021 +0530

    Merge pull request #263 from chaos-genius/all-contributors/add-pshrimal21
    
    docs: add pshrimal21 as a contributor for projectManagement, doc, ideas

[33mcommit d0dcd20d83d605ef739aa5d7a16f510058b5fff2[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 07:20:12 2021 +0000

    docs: create .all-contributorsrc [skip ci]

[33mcommit 7629cfaa0a95dd67a0c0e8d580b213c4daec4caf[m
Author: allcontributors[bot] <46447321+allcontributors[bot]@users.noreply.github.com>
Date:   Thu Oct 7 07:20:11 2021 +0000

    docs: update README.md [skip ci]

[33mcommit 4ec1e49f236e90564775c5b514dd43ef442b8336[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Thu Oct 7 12:33:48 2021 +0530

    fix: dashboard anomaly precomputed fixed

[33mcommit f06c2499ab2de2c01b44c52601ffc849094bebe7[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Thu Oct 7 11:53:01 2021 +0530

    fix: update content for channel configuration

[33mcommit 52b4b1de927ffe1db6283e3b7a561a6fd23fec6f[m
Merge: 0465d0e feb88b8
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 7 11:44:19 2021 +0530

    Merge pull request #260 from chaos-genius/api/anomaly-settings-check-computed
    
    feat(anomaly-params): add field to check if anomaly data exists

[33mcommit 0465d0ea7afc5ad113e38180d16e586753286092[m
Merge: 63cdbcc 33f5457
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Oct 7 11:34:25 2021 +0530

    Merge pull request #261 from chaos-genius/sb-frontend-analytics
    
    anomaly setting  edit flow & minor fixes

[33mcommit feb88b84958176732868045c90285d0ae5b137ac[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Oct 7 11:10:41 2021 +0530

    feat(anomaly-params): add field to check if anomaly data exists
    
    is_anomaly_precomputed is returned in the settings endpoint that
    indicates if anomaly output data exists.
    
    Also removed is_anomaly_setup from anomaly-params GET output since it
    always returned false.

[33mcommit 63cdbcc65c64789bd2fc1f7eab420e79e22ec4fc[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 10:52:28 2021 +0530

    docs: update formatting for roadmap

[33mcommit 421f4057b26a9761c073a62cf5a7a06cbd8e6734[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Oct 7 06:14:27 2021 +0530

    feat(anomaly): drilldowns filtered by direction of anomaly

[33mcommit addef9728298d9049ea580f64409ba861584a5df[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 01:11:14 2021 +0530

    docs: update README.md

[33mcommit f9371a5cbd408491a18602d575440ef25a7a40a3[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Oct 7 01:06:00 2021 +0530

    docs: adding roadmap

[33mcommit 19402a40981aafaba12424149e190427e56e9fb1[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 6 19:23:17 2021 +0530

    fix: add the google bigquery version

[33mcommit cb00f8cc7e8548215dec090fe9e3626756d9afde[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 6 18:43:42 2021 +0530

    fix: refactor the data connection and remove some dependancy

[33mcommit f12d07ea60da36b2f41f463368f0d2d266f3d914[m
Merge: 268db97 f5310a5
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 6 17:18:13 2021 +0530

    Merge pull request #238 from chaos-genius/anomaly-refactor
    
    Anomaly Refactor with Docstrings and Logging

[33mcommit 33f54577ed39227d863e3794873d44e60a824f43[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Oct 6 17:17:09 2021 +0530

    fix: modal view navigation fixed

[33mcommit bc85c756be9cbebb7d567d8c1e542aa7d518c000[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Oct 6 17:15:51 2021 +0530

    fix: analytics modal navigation fixed

[33mcommit 431ad8f774a780730a6e5b0c48cef4fba6cbc0d9[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Oct 6 17:08:55 2021 +0530

    fix: minor fixes

[33mcommit 6304950378c1e7ccc80b63cf2adb1a6ee6578a00[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Oct 6 16:53:29 2021 +0530

    fix: minor css

[33mcommit 8b620b577786443d07b2bd7da7ab2a763c3f3d64[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Oct 6 16:47:41 2021 +0530

    fix: time picker close and css fixes

[33mcommit b87890343cc0c62be8ee63b693f1dd57e1152e9a[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Oct 6 16:45:17 2021 +0530

    fix: checkbox functionality added

[33mcommit 268db973a732c2c1bfa8bf5052aba36c6285e1fe[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 6 16:05:14 2021 +0530

    remove the connection_type until fix in backend API

[33mcommit f404569f32bfb2fd0fee6739804cb9465044f041[m
Merge: 645eb71 18d5935
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 6 16:00:52 2021 +0530

    Merge pull request #246 from chaos-genius/sb-frontend-setting
    
    fix: deepdrills and anomaly integration for empty states, configure setting meta info integration

[33mcommit 18d59352bbdb86793429bb10cdb3d4d76de39e72[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Oct 6 15:49:27 2021 +0530

    fix: connection_type added

[33mcommit af6d435ff44fe548960cd7b997d9716c5a2e448e[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Oct 6 15:26:30 2021 +0530

    fix: configure setting edit fixes

[33mcommit f5310a58ffa1a3f3becac8bc4eb1bfcdb7d4f1c0[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 6 15:16:55 2021 +0530

    chore(log): added logging in anomaly

[33mcommit 1ea9cde6292939ecb5df7492d5c6d79d7f614978[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 6 15:16:30 2021 +0530

    fix(anomaly): circular import in constants

[33mcommit 39b372ce50027e6558831295d4ecdbc0cc5d95b9[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 6 15:14:55 2021 +0530

    fix(anomaly): tuple typo in processor

[33mcommit 80ef0add62fa5fa45f9f423b8a3fd57b6136a76e[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Oct 6 13:56:50 2021 +0530

    fix:edit flow checkbox functionality

[33mcommit 5a5d5a32addd40df4e08dab84a5b6806ffd3fa40[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Oct 6 12:28:05 2021 +0530

    fix:edit flow disable field

[33mcommit 645eb710b8ce84c6e8cfcb6e236cf10c94def6fa[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Wed Oct 6 10:38:22 2021 +0530

    fix: List typing issue, add python-json-logger to reqs
    
     - List takes only one type parameter, but 2 were given. This lead to
       the API server not starting up.
     - python-json-logger was missing in prod requirements

[33mcommit bb9885c528de355190a1b998594e3c6d422d4f6b[m
Merge: 4ec1026 3307296
Author: Kshitij Agarwal <42891697+kshitij123456@users.noreply.github.com>
Date:   Wed Oct 6 10:16:42 2021 +0530

    Merge branch 'main' into slack-email-alerts

[33mcommit 6b446806e39ca20fad4ce4e2f94df9ec4b34c7cc[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Oct 6 10:16:31 2021 +0530

    fix: setting and anomaly deepdrills api fixes

[33mcommit 0727eb29e551bb0718a3861ff672e1c304cbad3d[m
Merge: b3f5da3 3307296
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 6 09:38:19 2021 +0530

    Merge branch 'main' into anomaly-refactor

[33mcommit 3307296564c340144aa3c42727a2b07a401810e6[m
Merge: 040bee3 e41e1e2
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Oct 6 09:18:42 2021 +0530

    Merge pull request #251 from chaos-genius/rca-refactor
    
    Refactor RCA Code + JSON Logging

[33mcommit e41e1e2f8329009d78929c5cccda13645f0cc321[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 6 08:36:38 2021 +0530

    docs(rca): updated docs for rca data loader

[33mcommit 8bfd19bbf40000040855a031a26dfac8609a13ad[m
Merge: 204aa9b 4e42d32
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 6 08:26:44 2021 +0530

    Merge pull request #248 from chaos-genius/logging
    
    Adding JSON based logging

[33mcommit 204aa9b67b9196a88639707b47319f37228430ff[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 6 08:25:44 2021 +0530

    docs(rca): added docs for rca processor

[33mcommit 4e42d32150e6c1b4c38614ac9c078f68301a8c69[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 6 08:13:22 2021 +0530

    chore(rca): added logging to controller

[33mcommit f718c9311b9bb0055b16d16e3587aa9ffb2efe5f[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 6 08:13:10 2021 +0530

    chore(log): removed streamhandler

[33mcommit 6da27d79ecc9ec0d89a43f5cb7db689b7c33ccb3[m
Merge: dbd505c 3cd2e3c
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Oct 6 05:52:40 2021 +0530

    Merge branch 'rca-refactor' into logging

[33mcommit 040bee39ee2c0310a6bb05b31672da3c52e81d1e[m
Merge: 8d5a559 9c85a82
Author: Harshit Surana <surana.h@gmail.com>
Date:   Tue Oct 5 19:59:22 2021 +0530

    Merge pull request #250 from chaos-genius/api/anomaly-params-revamp
    
    Update anomaly params GET and settings endpoints to match frontend requirements

[33mcommit 9c85a82fdf7cb27a398cef99734ade686a7a7afc[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Oct 5 19:39:42 2021 +0530

    feat(anomaly-params): check editable fields when updating
    
    When updating existing anomaly-params, check if fields marked as
    non-editable are being updated.
    
    Fields are considered to be edited when the old value of that field does
    not match the given (new) value. If the same value is passed, we ignore
    and consider it to not be edited.

[33mcommit 50545a76272b2f437eeec83bd0dcd9b8bce036c1[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Oct 5 19:11:34 2021 +0530

    refactor(anomaly-params): move constants and helpers together

[33mcommit 7751f906ee8870d423a11b4c64e379d00c488f67[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Oct 5 18:47:55 2021 +0530

    fix(anomaly-params): settings endpoint returns only required fields
    
     - refactor settings endpoint to use saner error checking
     - now returns only the required fields, instead of all anomaly-params

[33mcommit 8a1e9d4158febbcfc2617bbe40651a77ba275652[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Oct 5 18:36:40 2021 +0530

    fix(anomaly-params): made GET return same structure as POST
    
     - add a helper function to get anomaly_params as required by the
       anomaly_params GET method
     - the structure is the exact same as the one passed in the POST method,
       no additional fields
        - unset fields have default value

[33mcommit dbd505c92f20b5d469c7603f96bfaf9df43b41af[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Oct 5 18:03:05 2021 +0530

    feat(log): added logging

[33mcommit 3cd2e3c38e04916580d13eb8d46d2a3491f7f654[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Oct 5 18:02:09 2021 +0530

    refactor (rca): moved data loading to new file

[33mcommit 4ec1026ba452b77b75c1dd24e0cb7ae523f66334[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Tue Oct 5 17:36:59 2021 +0530

    fix: change a filter parameter while querying
    for anomalies

[33mcommit 2b53e4f5f31bbccf50c232ee7e5b1ad0c440de15[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Tue Oct 5 17:33:54 2021 +0530

    fix: format the email and slack alerts

[33mcommit 8d5a559de054d1623b16be77ea461997966b5719[m
Merge: 93cc575 088f04e
Author: Harshit Surana <surana.h@gmail.com>
Date:   Tue Oct 5 16:48:18 2021 +0530

    Merge pull request #247 from chaos-genius/api/anomaly-params-flat-1
    
    fix(anomaly-params): make request and response flat and some fixes

[33mcommit c2d225fbe6b63cf8b785515edd52143cbd89a5f0[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Tue Oct 5 16:14:30 2021 +0530

    fix:fix add alert

[33mcommit 088f04e9bc0b84480cd375cec550deaccf0b68dc[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Oct 5 16:04:25 2021 +0530

    fix(anomaly-params): add separate scheduler_frequency
    
     - scheduler_frequency is the frequency at which anomaly/RCA tasks are
       executed
        - While frequency is the frequency at which data is ingested
        - only allows D (daily) for now since hourly scheduler has not been
          implemented yet
     - this field is named "Model frequency" in the frontend
     - also set the default scheduled time to 11:00:00 and default
       scheduler_frequency to D (daily)

[33mcommit d1b621070f773fd61928d5046f7d2ab48e665a26[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Tue Oct 5 16:05:15 2021 +0530

    fix: configure setting toaster fixes

[33mcommit 2e369e73262d6edf422df49a7b7ffa9b20150c0d[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Oct 5 13:12:11 2021 +0530

    fix(anomaly-params): make req and resp flat, fix format
    
     - made anomaly-params update and view endpoints return a flat JSON
     - "scheduler_params_time" is used instead of using the entire
       scheduler_params as a nested value
     - fixed frequency validation - use D/H instead of daily/hourly
     - also fixed settings view to use new, separate scheduler_params column
       instead of the one inside anomaly-params
        - should fix inconsistent data issues

[33mcommit fb0066faa04274f1a4e40b0e8fcf7bc75b352015[m
Merge: f08479e 93cc575
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Oct 5 10:46:34 2021 +0530

    Merge branch 'main' into rca-refactor

[33mcommit f08479e21f567e0862c9d744f18b94e396108e69[m
Merge: 46a7607 9325d11
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Oct 5 10:45:23 2021 +0530

    Merge branch 'main' into rca-refactor

[33mcommit b3cea8d8ce54b547d248d5461df7e1878a53ccbd[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Tue Oct 5 10:20:25 2021 +0530

    fix: setting time format and loader fixes

[33mcommit 4f1f3b9fa2484ff24e648f968337ee7f0e675492[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Mon Oct 4 17:50:48 2021 +0530

    fix:mionr changes

[33mcommit 55f2d53edb6690e5cbc4a83cee02281d0c4990ca[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Oct 4 17:45:30 2021 +0530

    fix: setting time picker value fixes

[33mcommit ec0278350b11418799cbcd6653ef3535fb75597b[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Mon Oct 4 17:11:45 2021 +0530

    fix:minor changes

[33mcommit a5c6fdf1c6a679bad5406c88b5f93b7bbeb86b71[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Oct 4 17:08:48 2021 +0530

    fix: setting number type input fixes

[33mcommit e078a7bff1b4153e5312217e1860dd94eb5415de[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Mon Oct 4 16:51:56 2021 +0530

    fix:functional integrations added

[33mcommit 3ab66f09872f4dfb1ac4b8181ce6050791a11bc9[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Oct 4 15:58:58 2021 +0530

    fix: time stamp for deepdrills

[33mcommit 2def19cc7ed5d9d88c6c066f5eed798fe521bcee[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Mon Oct 4 15:54:48 2021 +0530

    fix:meta api integrations

[33mcommit 2cdaa2973d73f1949cb7443d9e85e47661a1ba19[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Oct 4 15:53:13 2021 +0530

    fix: empty screen integration for anomaly and time stamp

[33mcommit 93cc5758fb46b677c38b67034ab0ae2e1f37ae8a[m
Merge: 7cedc32 796242c
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Oct 4 13:43:02 2021 +0530

    Merge pull request #244 from chaos-genius/api/anomaly-params-meta-fix-1
    
    fix(anomaly-params): make meta info a flat structure

[33mcommit 796242c49811a7296f60dd634f4cae07ad8dfe52[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Mon Oct 4 13:34:31 2021 +0530

    fix(anomaly-params): make meta info a flat structure
    
    the field name ("time") has been changed to include the parent field as
    well.

[33mcommit 0f952ee41c52e5ed673a3b541e03b90c88a0931a[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Oct 4 12:51:41 2021 +0530

    fix: anomaly setting id fixes

[33mcommit 1761a4fab98e01d67cf5c565adf2b75fb77df37e[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Oct 4 12:44:58 2021 +0530

    fix: minor fixes

[33mcommit 4fa06c9b41b8aa0a30d04bda2112df290c35bee3[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Oct 4 12:41:57 2021 +0530

    fix: add reducer for anomaly setting

[33mcommit 963de0165e9d94e1dc431ce1a840685c1ddc3bca[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Mon Oct 4 12:20:38 2021 +0530

    fix:add redux setup

[33mcommit 7cedc32407d83c3b7ceeb1f6d5bafd6abd2bd9ae[m
Merge: 462786c f0e8250
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Oct 4 12:05:35 2021 +0530

    Merge pull request #240 from chaos-genius/sb-frontend-toaster
    
    fix: new toaster integration, minor fixes

[33mcommit 462786ced702f039a093bae898ef7501b98ae09a[m
Merge: f6e6ae6 46b1104
Author: Kshitij Agarwal <42891697+kshitij123456@users.noreply.github.com>
Date:   Mon Oct 4 11:04:54 2021 +0530

    Merge pull request #195 from chaos-genius/scheduler-alerts
    
    Scheduler alerts branch

[33mcommit f0e825028e81a5a651ba08515d64cfedd7e63474[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Oct 4 10:57:26 2021 +0530

    fix: slack channel name fix

[33mcommit f6e6ae6eca05e9eb3a3b70a573daa435506aa00e[m
Merge: 9325d11 324f5e6
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Oct 4 10:17:24 2021 +0530

    Merge pull request #242 from chaos-genius/scheduler-revamp-2
    
    Moved scheduler_params outside anomaly_params

[33mcommit 81ec3fcef7e2e65ec40192b074b9a13a4ceec8f4[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Oct 4 09:37:26 2021 +0530

    fix: datasource table error fixes

[33mcommit cdf75af303941e9538e5cccf9233acdc6fe6c380[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Sat Oct 2 20:50:04 2021 +0530

    feat: add html template
    - This was done in place of the orignial plain text in the email alerts

[33mcommit 037e78143e5fed9acac6aded97e9ebfabfff5b1a[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Sat Oct 2 18:14:46 2021 +0530

    fix: add slack alert to AnomalyAlerts
    - add code to the send_slack_alert function in base_alerts.py
    - add anomaly_alert_slack to slack.py

[33mcommit b5249173d252f500310359ed79ff2b44dea8b22f[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Sat Oct 2 11:33:21 2021 +0530

    fix: change alert structure in AnomalyAlertController
    - alert now sent on basis of alert_channel field
    - created skeleteon for send_slack_alert

[33mcommit b3f5da3420756d9dba09ce8697f28d417d06d97f[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Fri Oct 1 20:37:09 2021 +0530

    fix: add edge_case to end_date retrieval function
    edge case when anomaly has not been run but configured, leading to
    None value for end_date

[33mcommit 620c62efac5490c9d0ad48b0be8fe9adee385bfb[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Fri Oct 1 20:33:08 2021 +0530

    fix(anomaly): change operator in return type from '|' to 'or'

[33mcommit c138859a90e09376dacb27060ac0b16877c34cbe[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Oct 1 18:51:42 2021 +0530

    fix (anomaly): fix circular import

[33mcommit 9325d11728d8cfc4dc4fbad6beaca470c78dc68b[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Oct 1 17:52:09 2021 +0530

    fix(anomaly): fixed values to items

[33mcommit 26cb76880835c34400be25d9136a87688d6f251d[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Oct 1 17:50:36 2021 +0530

    fix(anomaly): added dict values for model name mapping

[33mcommit d47c06f048703833c238ca6ff053d89e70d4cc76[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Oct 1 17:46:12 2021 +0530

    feat(anomaly): Added value information to meta api

[33mcommit d1551bfaeaf0002b4298011c41cfc003726fe52b[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Oct 1 17:23:33 2021 +0530

    fix: change the field type in config

[33mcommit fd8db2a5863c513f40ef15e4f59b81b57e48e46f[m
Merge: 07b6165 507ec0f
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Oct 1 17:16:31 2021 +0530

    Merge pull request #236 from chaos-genius/anomaly-kpi-fix
    
    fix: add api to GET anomaly_params for kpi

[33mcommit 507ec0f076122f5a2fd0be6a23d9cc525d577770[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Oct 1 17:16:05 2021 +0530

    fix: remove the git merge code line

[33mcommit 98720bdb1467909e625ce6173a3656e2da6bdff8[m
Merge: 307be82 07b6165
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Oct 1 16:11:21 2021 +0530

    Merge branch 'main' into anomaly-refactor

[33mcommit 2610feb469868992842120ce4a68206348525e0b[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 1 16:02:37 2021 +0530

    fix: delete error screen issues resolved

[33mcommit d05123a0dd49530c608ac7afda2fd85d82a78631[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 1 15:35:07 2021 +0530

    fix:kpi and datasource delted toaster added

[33mcommit eaa080eb8bd3beb474e484629d44743adc1f9fe3[m
Merge: e871a01 07b6165
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Fri Oct 1 14:49:39 2021 +0530

    Merge branch 'main' of https://github.com/chaos-genius/chaos_genius into anomaly-kpi-fix

[33mcommit b7c78ec77e16a08fd8f598849f0ab7829b236947[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 1 14:10:02 2021 +0530

    fix:minor fixes

[33mcommit d741ef6118c4349a4f7b0052c7598836220c870b[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Fri Oct 1 14:07:20 2021 +0530

    fix: toaster error 60second change

[33mcommit 9964b9d411e1beacdd1df570e20c1b69c0a3b846[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 1 14:06:26 2021 +0530

    fix:removed commented code in kpi

[33mcommit a153b53b199e2134ec4bc00ad1c12465987628ee[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 1 14:01:17 2021 +0530

    fix:home page details path to deepdrills

[33mcommit 04cfa22a4ec33560b767ea35deb5ed3c9af28027[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 1 13:58:45 2021 +0530

    fix:path changed deepdrills

[33mcommit c2a26a7539e3e8e9a71b0fc1666ffcec74776c46[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 1 13:52:42 2021 +0530

    fix:removed dashboard commented code

[33mcommit fdf545c19b0f9f981831da1b6af5991c7ab22fbf[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 1 13:45:56 2021 +0530

    fix:removed commented code

[33mcommit dec896e4b019f5d48dce717061c6b471309099de[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Fri Oct 1 13:13:45 2021 +0530

    fix: test query toaster css fix

[33mcommit 686a838f147a88a57477b4d789f123384ac0c21f[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 1 12:44:15 2021 +0530

    fix:add vertical line

[33mcommit d2f099cba977aacccb491920a18d20b9ae6b02bb[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Oct 1 11:14:39 2021 +0530

    fix: changed text test connection

[33mcommit 4246714a2ce8d91749413e5fd665dd77c15206a1[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Fri Oct 1 10:19:07 2021 +0530

    fix: new toaster integration for kpi, datasource, alert, configure setting

[33mcommit 307be82601c1377b2b0c99ada5f029a918d6d977[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Sep 30 23:13:47 2021 +0530

    docs(anomaly): added docstrings

[33mcommit 9d3a9afe0fa8afd79e61c5f4d9ae55bd7eb4f826[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Sep 30 22:10:29 2021 +0530

    refactor (anomaly): renamed vars with devi to dev

[33mcommit 07b6165c2b3a000a5d5f72b9369845d4d3b3ad74[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Sep 30 17:52:04 2021 +0530

    fix: anomaly api now return end_date for anomaly
    Thre api's in anomaly_data_view now return anomaly_end_date parameter, indicating
    the last date anomaly was run for, the api's are
    - anomaly-detection
    - anomaly-drilldown
    - anomaly-data-quality

[33mcommit 5e1e50cd6c2420fcc4bd76920c3f682ba6d10e30[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Sep 30 15:28:08 2021 +0530

    fix(anomaly):  controller accepts alternate params
    - period and anomaly_period both are accepted,
    precedence given to anomaly_period
    - frequency and ts_frequency both are accepted,
    precedence given to frequency

[33mcommit e871a0195cfe528e3ce74626b60a45b01ab576e3[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Sep 30 14:49:43 2021 +0530

    fix: add is_rca_precompute response to the api
    change is_setup to is_anomaly_setup

[33mcommit c05b742dd460643b1d7f7d3048118be40a43b6b3[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Thu Sep 30 13:39:56 2021 +0530

    fix:minor changes

[33mcommit 63bf5b04c8a393326ca66eff2546f96f9f4d2752[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Thu Sep 30 13:36:06 2021 +0530

    fix:sb-frontend-toaster

[33mcommit 94a6c68962c242b197cef3d049901ba110abc984[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Thu Sep 30 12:08:59 2021 +0530

    fix: Auto Rca to Deepdrills changed

[33mcommit 24ff250868269cbb1a1a270fc4f2fc6406e96596[m
Merge: df7f8ac 7db5d13
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 30 11:02:43 2021 +0530

    Merge pull request #237 from chaos-genius/sb-frontend-fixes
    
    fix: placeholder values for slack and email fixes, disabling fixes

[33mcommit 7db5d13e397499c55bf0f2091f2fed0ed828a4af[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Thu Sep 30 09:22:05 2021 +0530

    fix: removed comment code and variable name changed

[33mcommit 12b5a7f5778b1c5af51480c8f4610460a844206d[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Sep 30 04:20:45 2021 +0530

    fix(anomaly): updated anomaly settings route
    
    Co-authored-by: Manas Solanki <manassolanki@gmail.com>

[33mcommit df7f8ac617bd8dfe751b9c4e9c1f42fb428108a1[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Sep 30 04:18:46 2021 +0530

    feat(rca): added slack variable

[33mcommit ecd9aa11d03f5361e4905239a12d0a70488968e9[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Sep 29 20:35:59 2021 +0530

    fix: typo in different page

[33mcommit 47039ef523cd071309eb4d944455d20d62b32d0e[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Sep 29 19:37:54 2021 +0530

    fix: edit email add receipts

[33mcommit 86365784a2966d23837dc4acf92e4fafec68c2e4[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Sep 29 19:18:54 2021 +0530

    fix: email and slack configuration edit

[33mcommit 34ebede4e1001b2866cc97a7331f28129307b525[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Sep 29 18:25:52 2021 +0530

    fix: slack disable recepients and disabled request channel

[33mcommit 343a5c7ba66abe2a36fe850c7f34b88ff1020ee6[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Sep 29 18:14:29 2021 +0530

    fix: minor changes in the backend api for kpi, data source, alert and config settings

[33mcommit 569f3299b7455459d72ec3622dca4afcb0622b56[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Wed Sep 29 17:08:16 2021 +0530

    fix: add api to GET anomaly_params for kpi

[33mcommit 324f5e681635e1732f8ad2b9bb083c5447689f08[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Wed Sep 29 15:43:58 2021 +0530

    chore: format anomaly_tasks with black
    
    and isort

[33mcommit 03ff6b5bc1c430cd49cef5185ee592d38c11045a[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Wed Sep 29 15:42:11 2021 +0530

    fix(celery): separate last_scheduled_time for anomaly and RCA
    
     - Both can be scheduled separately now
     - Also fixed last_scheduled_time update issue with ready_rca_task

[33mcommit 4b54189b92b7ce8a6917692f9e2b2bae7ff75f62[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Sep 29 13:30:41 2021 +0530

    fix: slack form channel name field added

[33mcommit d611c7bff298754b6aa38b37dc3ec5c8e6240473[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Sep 29 13:26:03 2021 +0530

    fix: channel configuration pagerduty added

[33mcommit 914da898cf041534c9a67f2de7912ae491d25bec[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Sep 29 13:15:49 2021 +0530

    fix: add placeholder

[33mcommit 8cbf6d5aa1db4e576aa65ece15c98e02cc2d3fbb[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Sep 29 12:59:43 2021 +0530

    fix: channel configuration datadog and asana coming soon fix

[33mcommit c2111f5dae85ab4d11124c389fdfc4182664c6ef[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Sep 29 12:05:52 2021 +0530

    fix:minor fix

[33mcommit e9b92f41297ca3c2f4104ac7f19a6c1a316f1832[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Sep 29 12:03:35 2021 +0530

    fix: add another channel disable

[33mcommit 777146b7c0fc3814aa6947d100acb6ca9f6c5cf6[m
Merge: bb33b23 855e664
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Sep 29 11:41:16 2021 +0530

    Merge pull request #235 from chaos-genius/sb-frontend-dashboardheader
    
    fix: dashboard minor fixes

[33mcommit 855e66436f2ae84d217939cd356b24c8a114bc10[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Wed Sep 29 09:03:35 2021 +0530

    fix: dashboard minor fixes

[33mcommit e854560cda726d85733de5e215dcd726d814a62d[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Wed Sep 29 00:00:40 2021 +0530

    feat(cli): add subcommand to run our scheduler
    
    Calling this runs the anomaly/RCA scheduler separately from the beat
    scheduler.

[33mcommit 14363a3d74ad1a6bd8dac510df7c05f268c788f9[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Sep 28 23:55:25 2021 +0530

    refactor(scheduler): move scheduler_params to a separate field
    
     - Moved scheduler_params to a separate JSONB field
     - Updated the scheduler to use this field instead of anomaly_params
        - Used JSONB postgres functions to update the key-values inside it
            - This will avoid data races
        - added a helper update_scheduler_params
            - caveat: it can update only one field at a time
     - the anomaly-params API endpoint has been modified to work the same as
       before
        - to avoid updating frontend for this change
     - tested locally, will need more testing

[33mcommit bb33b23447d5eb89fb4a71bb966dc7be2bbc217d[m
Merge: 132b024 354cbf5
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Sep 28 21:06:38 2021 +0530

    Merge pull request #234 from chaos-genius/sb-frontend-dashboardemptyfixes
    
    fix: Alert Enable and disable fix, Dashboard Table fix, Kpi Table Datasouce name fixed

[33mcommit 132b0245e2ce4059e845c9e3cb1dfd984905056f[m
Merge: 095c5f6 827698d
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Sep 28 21:01:54 2021 +0530

    Merge pull request #231 from chaos-genius/ab-api-bottleneck
    
    initialise the source configuration during init

[33mcommit 354cbf51e85e2eec54caf2b95c9ae287cebac34d[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Tue Sep 28 19:13:03 2021 +0530

    fix: enable disable toaster fix

[33mcommit 267e6cad9c4da6ce9da237cf3fd2e745f39dd5bc[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Tue Sep 28 18:13:50 2021 +0530

    fix: kpi table datasource name added

[33mcommit e84e7ec82677f947fe4f8445da34647a4c609091[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Tue Sep 28 18:04:36 2021 +0530

    fix: hierarchical table fix

[33mcommit afdbb832191c30db66630a34bda28034bd1d172c[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Tue Sep 28 17:42:05 2021 +0530

    fix: alert enable and disable fix

[33mcommit 095c5f6d3680c24f3368358c6eed8dd14a601bc2[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Sep 28 17:41:59 2021 +0530

    fix(rca): hierarchical table added timeline

[33mcommit 70a8fbc251fcb31fed227bee3e660af5ca7a5556[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Sep 28 17:33:18 2021 +0530

    fix(rca): added columns for hierarchical table

[33mcommit 5e738763e678fab36298fb9485e524f3b77c6c44[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Sep 28 17:24:51 2021 +0530

    fix(rca): Removed comma from week in rca table

[33mcommit 1b51bba8e0c53a8a27362f68fc9fc1d5f74e4685[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Sep 28 17:21:29 2021 +0530

    fix(rca): Added timeline to rca table output

[33mcommit 67d62c775ced06fc4282f6c6b06ad744d8eac35b[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Sep 28 17:11:07 2021 +0530

    fix(kpi): kpi endpoint now returns kpi info with datasource attached

[33mcommit 051dead0b99b5e5df694efa2c144c5d969c76faf[m
Merge: 799429f 033971d
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Sep 28 16:49:41 2021 +0530

    Merge pull request #233 from chaos-genius/kpi-api-fixes
    
    Kpi api fixes

[33mcommit 033971d7a4daad912ac8e05c33cac44800977a9f[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Tue Sep 28 16:46:06 2021 +0530

    fix: add is_critical to error response

[33mcommit 799429f3e8f84696a0bab7e5b798ccff353ed4b3[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Sep 28 16:40:40 2021 +0530

    fix(rca): rca table columns fixed

[33mcommit 4641783b5f2b25a66f0867d787b68359a4f4974e[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Sep 28 14:26:27 2021 +0530

    feat: add the api for enable the alert and add the masked value in some of the API endpoints

[33mcommit 1b6763df5d19c9cd460853bc38590ba8f4133eca[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Tue Sep 28 14:08:04 2021 +0530

    fix: split kpi and data_souce info into 2
    the api/kpi end point get request returns a dictionary with kpi and data
    source info instead of both information combined

[33mcommit 339bd122018777b145165f3e93cb8b3f89d26f4d[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Tue Sep 28 13:27:30 2021 +0530

    fix: anomaly empty state

[33mcommit 068ae8498845c6525dcff74d8ca6a12de355391b[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Tue Sep 28 13:16:00 2021 +0530

    fix: deepdrills empty state

[33mcommit 1eb1fd11b3b7f9e7a3a4f2a5297274fafe3094b3[m
Merge: 4ee184d 82928d8
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 27 18:38:54 2021 +0530

    Merge pull request #232 from chaos-genius/sb-frontend-fixesui
    
    fix: Error screen issues and add datasource issues fixed

[33mcommit 4ee184d6fe4b7d100b41ac5e816163a93bfcbbf0[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 27 15:19:01 2021 +0530

    fix: remove the older UI

[33mcommit 82928d83a28686a7b30f613b273b5905e8423134[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Sep 27 14:56:08 2021 +0530

    fix: kpi table last modified removed

[33mcommit 9ac6542bb0db649d3adc722c6ddccfec057f0343[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Mon Sep 27 12:03:16 2021 +0530

    fix: error screen issues fixed

[33mcommit 9a3934ef225a9319ac8f889b49e5b33e71026271[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Sep 27 11:54:04 2021 +0530

    fix: minor fixes

[33mcommit 37442b0dbdbd094a5e97bf8299a98834c2284a1c[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Sep 27 11:16:35 2021 +0530

    fix: kpi form fixes

[33mcommit e1aa4e33d46f7abc1e8fe412c0ef8717195ed3e2[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Sep 27 10:49:20 2021 +0530

    fix: textarea disabled css fixes

[33mcommit 827698df16c29f5dad726893cfcc250d4d119db9[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 27 10:45:41 2021 +0530

    initialise the source configuration during init

[33mcommit 0dbab0249fd1a54922f05952c4d7a60534fef810[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Mon Sep 27 10:28:48 2021 +0530

    fix: last modified changed

[33mcommit b3e69c07b88dc45b0debe2dd480931ed11f8870e[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Sep 27 10:18:37 2021 +0530

    fix: alert table fix

[33mcommit 84fe4fa4437fb2495dadfacab17bf835bbd46a91[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Mon Sep 27 10:16:24 2021 +0530

    fix: datasource test connection status toaster fix

[33mcommit f68602f410e5f5f51f410e21de5506ebaae6131c[m
Merge: c9e5f3d 0389e7b
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 27 09:53:29 2021 +0530

    Merge pull request #230 from chaos-genius/dev_02
    
    Add Data Source Issue Fix

[33mcommit 0389e7bf51565238293d306331c504ce56c9e63b[m
Author: Mansi-Chauhan27 <mansic@mindfiresolutions.com>
Date:   Mon Sep 27 09:25:59 2021 +0530

    Add Data Source Issue Fix

[33mcommit c9e5f3d424b3b548a398e55df6e1ba4dd756ae08[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Fri Sep 24 20:08:30 2021 +0530

    fix: add status key to response received upon testing data source

[33mcommit a0497947cd612aa074286678bfa55c121b2ec8bc[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Fri Sep 24 19:16:02 2021 +0530

    fix: bugfixes (#229)
    
    * fix: no data for kpi home
    
    * fix: configure failure msg
    
    * fix: disabled coming soon for event alert
    
    * fix: kpi setting time payload fixed
    
    * fix: percentage changed
    
    * fix: dashboard line chart fix
    
    * fix: kpi home card fix
    
    * fix: remove navbar
    
    * fix: setting page bug fixed
    
    * fix: kpi home sparkline fixes
    
    * fix: disabled view log
    
    * fix: analystics time picker fix
    
    * fix: console removed
    
    * fix:dashboard dropdown firt singledimension
    
    * fix:kpi form dimensions plus remove
    
    * fix: kpi home fixes
    
    * fix: alert triggered removed
    
    * fix: configure time fixes
    
    * fix: seconds change in configure setting~
    
    * fix: add alert event coming soon fix
    
    * fix: dashboard drilldown css fixes
    
    * fix: add another channel functionality
    
    * fix: add filter in alerts
    
    * fix: add checked changed
    
    * fix: kpi, datasource, alert tables and kpi home error screen issue fixed
    
    * fix: anomaly error screen issues fixed
    
    * fix:minor changes
    
    * fix: alert table and kpi form fix
    
    * fix: kpi test query status is changed
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit f3702e74b0c166d3d0afb05fc5754ac6e754b120[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Fri Sep 24 18:29:41 2021 +0530

    fix: add status key to response received upon testing query while KPI creation

[33mcommit 8971e3f054b377e58096d78d249a1d0e7528ebbd[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Fri Sep 24 14:07:25 2021 +0530

    fix: sort the kpi's displayed on home screen

[33mcommit 110819e31c3e77764e36082276e9cd69a0fc44ba[m
Merge: 8058ef5 3cc057d
Author: Kshitij Agarwal <42891697+kshitij123456@users.noreply.github.com>
Date:   Fri Sep 24 12:41:38 2021 +0530

    Merge pull request #228 from chaos-genius/anomaly_params_status_change
    
    Status key added to json response sent after validating anomaly params

[33mcommit 3cc057d0cfb458ca53e5d5fec33981e53df93d36[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Fri Sep 24 11:00:26 2021 +0530

    fix: add status key to json response sent after updating anomlay params

[33mcommit 8058ef5c657b046a560cf3a4c694698885d75714[m
Merge: 3cf142d 41709ef
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Sep 23 21:01:56 2021 +0530

    Merge pull request #227 from chaos-genius/kpi_view_changes
    
    Changes made to anomaly count in home screen api endpoint

[33mcommit 3cf142db5ee30a5f4c3d82e1b7e06d6939db0015[m
Merge: 55e012a d3fd03f
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Sep 23 21:01:36 2021 +0530

    Merge pull request #226 from chaos-genius/scheduler-revamp
    
    Scheduler revamp to immediately run RCA and anomaly tasks on setup

[33mcommit 46b11047fa2c24fe62b13c1c474ace11479b38c5[m
Merge: b5fb8c5 55e012a
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Sep 23 21:00:04 2021 +0530

    Merge remote-tracking branch 'origin/main' into scheduler-alerts

[33mcommit 41709ef761a719ee36d8e6d73545eee252278734[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Thu Sep 23 20:37:44 2021 +0530

    fix: change the anomaly_count key in get-dashboard-list api endpoint

[33mcommit d3fd03fb98af52fced01d7050b57c9fd396380fc[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Sep 23 16:52:39 2021 +0530

    fix: check if scheduler_params is present before validating

[33mcommit 0e12925039c190ab84b77046ec38e923adc5e596[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Sep 23 16:25:39 2021 +0530

    fix: remove run_anomaly as a filter in kpi scheduler
    
    run_anomaly is set to True only when analytics is configured, but we
    need to run RCA even when it's not

[33mcommit 22c08191ee897f8d4406de7f9dcf81cb24e357a5[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Sep 23 14:40:24 2021 +0530

    fix(scheduler): run anomaly at analytics setup time, new helpers
    
     - two new helpers functions to update anomaly/rca task status and make
       celery task ready
     - using these helpers, did this:
         - RCA is run when KPI is configured
         - both anomaly and RCA are run when analytics is configured
            - could lead to duplicate execution of RCA if analytics is
              configured just after configuring KPI

[33mcommit 55e012ab5e0283ea5a12c6c34e3b387df3617602[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Thu Sep 23 12:12:07 2021 +0530

    fix: add percentage change to home screen api

[33mcommit 79947d8a6360f1a0230977ebfb9cfcdd220e2bfa[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Thu Sep 23 11:56:17 2021 +0530

    fix: temp fix #220
    - added inline imports
    TODO: Need to move get_kpi_by_id into kpi_model.py

[33mcommit 59981f2e0a994592187b7a02d7c12839e48295ff[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Sep 23 06:21:20 2021 +0530

    fix (rca, anomaly): will now run for n-1 date

[33mcommit 49f694ab0c3d280efafb5e7805d259e266df7329[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Sep 23 05:53:19 2021 +0530

    refactor (anomaly): reformatted code

[33mcommit 226831a4e1f6ebddd556e401aa306b656ffa8903[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Wed Sep 22 23:05:58 2021 +0530

    feat: run rca soon after a kpi is added

[33mcommit ed3f6c9044dc9a41809f8904ee411962649896cc[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Wed Sep 22 22:17:24 2021 +0530

    fix: todo to for rca to run after kpi is setup

[33mcommit 341e40339847420c92be1d54d4ac5252f8191a3a[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Wed Sep 22 20:43:20 2021 +0530

    feat(celery): new scheduler that separates anomaly and RCA
    
     - RCA is run even if anomaly is not configured
     - RCA uses "rca_time" in scheduler_params
        - or kpi.created_at if that isn't set
     - if anomaly is setup, both anomaly and RCA run at the same time
        - configured as "time" in scheduler_params
     - anomaly is configured if "model_name" is set in anomaly_params
     - TODO: set rca_time at KPI setup time
     - TODO: run RCA task at KPI setup
     - TODO: run anomaly task at anomaly setup

[33mcommit 6530c05d0fe3dd9b4a6477c42a62d16e65891e93[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Wed Sep 22 18:30:56 2021 +0530

    fix: anomaly_scheduler condition (is not -> !=)
    
    `is not None` is not the correct way to check for NOT NULL in
    sqlalchemy. We use != instead.

[33mcommit b7d3e9d63146e280a30fa3d6de536a47fbd66247[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Wed Sep 22 16:50:34 2021 +0530

    fix: alert table and form fixes (#216)
    
    * fix: disable field for edit fixes
    
    * fix: css fixes
    
    * fix: added home details route
    
    * fix: active and inactive fixes
    
    * no alert ui
    
    * fix: alert form input and dropdown fix
    
    * fix: changed input pakage
    
    * fix: slack and email bradcrumbs fixed
    
    * fix: alert form new tag input customize
    
    * fix: dashboard page loader
    
    * fix: breadcrumb for set alert and dropdown fix and reset data
    
    * fix: alert table toaster
    
    * fix: console remove
    
    * fix: removed console
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 4536f864090a6ea47d2285f2735b110f49885ba8[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Wed Sep 22 15:14:59 2021 +0530

    fix: remove rca_time field from KPI table
    
    This will be moved to scheduler_params as per discussion.

[33mcommit b92ef63d4b28790f00242a3701fdd415ad160de3[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Wed Sep 22 14:40:35 2021 +0530

    feat: add rca_time in kpi model

[33mcommit b4eb1ced2540c84ca1930784dd9c0c409cd622ad[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Wed Sep 22 12:48:50 2021 +0530

    fix: kpi form fixes, home kpi charts integration (#215)
    
    * fix: kpi form add table, kpi datasource table dropdown
    
    * fix: kpi home sparkline graph integration and toaster fixes
    
    * fix: hierarchical table fix
    
    * fix: css fixes

[33mcommit e03d738d20e97570f3b696fba0319f19f1e19ae0[m
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Wed Sep 22 12:23:17 2021 +0530

    Alerts list view and Add & Modify api integrations (#214)
    
    * fix:added table integrations
    
    * fix:navigate to the kpi list
    
    * fix:add alert integrations
    
    * fix: alert table action for edit and delete
    
    * fix: updated email icon for alert table and form
    
    * fix: kpi home sparkline graph integration
    
    * fix: hide anomaly side bar and minor fixes
    
    * fix: modify api integrations alerts
    
    * fix: home page search and dates changes done
    
    * fix:minor-fixes
    
    * fix: alert form tags input css fixes
    
    * fix: alert kpi form tag input css fix
    
    * fix: alert kpi form edit actions
    
    * fix: add disable integrations
    
    * fix: update email for alert table
    
    * fix: added meta info api
    
    * fix: minor-fixes
    
    * fix: alert form dropdown fix
    
    * fix: minor-fixes
    
    * fix:minor changes
    
    * fix: minor-fixes
    
    * fix: minor-changes
    
    * fix: alert table checkbox fix
    
    * fix: alert form taginput css fix
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>
    Co-authored-by: Moghan Kumar <moghan@sketchbrahma.com>

[33mcommit 46a76074a7897cdf932f65bf532b4d46fb868bb2[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Sep 21 22:41:59 2021 +0530

    refactor (rca): added docstrings and reformatted

[33mcommit c0d64426ae52b47b889b0030327762b3f670fa66[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Sep 21 21:54:38 2021 +0530

    fix(alerts): add missing import
    
    and remove redundant assign to lower_limit_dt

[33mcommit 397ece582cbf9228e5aed7aa20a28ed074106733[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Sep 21 21:28:26 2021 +0530

    fix (kpi): fixes #208 by adding a tail size

[33mcommit f8b4970ad13a54edcf1d06f89bfb542c608b5a0e[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Sep 21 18:42:55 2021 +0530

    feat(alerts): prevent duplicate alerts on restart
    
    added a new column "last_alerted" to store the timestamp of the last
    time this alert was triggered. Based on this, the same alert will not be
    triggered again in that time frame.
    
    Also added "every_minute" as a valid alert frequency, mostly used for
    testing.

[33mcommit 1dfd0abb23fc19380aba865bdd0886cc5d4d98e9[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Sep 21 17:35:36 2021 +0530

    fix(celery): data race in rca_single_kpi
    
    By getting the kpi object after running RCA, we avoid stale KPI data.
    This lead to a data race where the anomaly_params.scheduler_params was
    overriden by RCA with the stale data and anomaly had updated it during
    that time.

[33mcommit b5fb8c56668638d52ce08107aa6ff6fcd647c631[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Sep 21 12:50:11 2021 +0530

    feat(celery): add conf files for multiple workers
    
     - the two workers are named cg_celery_worker_alerts and cg_celery_worker_anomaly_rca
     - they both listen on different queues
     - and have different log files

[33mcommit 81210b2cc387a52df6916e79a8c5cbbe2da7a903[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Tue Sep 21 11:46:11 2021 +0530

    fix: fixed scheduler adding KPIs without anomaly params

[33mcommit 5c8aec4f488374e340739d9212e349ecc094e50f[m
Merge: 9f76add 8008729
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Sep 21 11:37:18 2021 +0530

    Merge pull request #204 from chaos-genius/minimum-threshold-fix
    
    fix(anomaly): added slack to minimum threshold

[33mcommit 9f76add7e5a370cf6b80bac4d12ed292652f9fdc[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Sep 21 11:18:35 2021 +0530

    feat(anomaly-params): add meta endpoint, use time in scheduler_params
    
    use `time` in scheduler_params instead of `hour`.
    
    meta endpoint provides meta information on fields.

[33mcommit f508dc3e80166d18db41be9c0027528ae6551073[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Tue Sep 21 07:52:58 2021 +0530

    fix: round the values displayed in dashboard

[33mcommit 8008729f2461ca480e4e798c82bc9c9f070ac064[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Mon Sep 20 18:54:04 2021 +0530

    fix(anomaly): added slack to minimum threshold
    for batch training configurable variable slack added in anomaly params
    that can be used to adjust for recently missing data

[33mcommit 07fe5b51e0d4d49ab9c17064464939d809635998[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Mon Sep 20 18:31:11 2021 +0530

    fix: change made to kpi endpoint get-dashboard-list

[33mcommit a92d2bf6cb4b9c211651a8a68bb400b41d71e0ec[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Sep 20 17:55:34 2021 +0530

    fix (rca): fixes #197
    
    RCA is skipped for a timeline if agg fails as there is not enough data to compute other values.

[33mcommit 8b3a7dec5227ce6e430b7ae0a7b68a7d3d77cf34[m
Merge: 640c784 a7892d7
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 20 11:38:35 2021 +0530

    Merge pull request #202 from chaos-genius/sb-frontend-homeintegrations
    
    Functional Integration of the API in the home screen with the KPI view #128

[33mcommit 640c78461b0df70b6b40d20621a629c478060819[m
Author: NaikAayush <ayush@pesu.pes.edu>
Date:   Sun Sep 19 19:09:02 2021 +0530

    fix: circular depencency rca error pt2

[33mcommit d892f5db12b38b7941c2534b509337d31e685c83[m
Author: NaikAayush <ayush@pesu.pes.edu>
Date:   Sun Sep 19 19:00:35 2021 +0530

    fix: circular depencency in rca

[33mcommit d129aa45bdd58332b9e7264d463b3b969a737499[m
Merge: 972e2bc 52c467d
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sun Sep 19 13:24:55 2021 +0530

    Merge pull request #201 from chaos-genius/kpi-validation
    
    Added KPI Validation before adding new KPIs

[33mcommit 972e2bc680c0771553c38117747cb7e3623462c7[m
Merge: 44fb300 1533c70
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sun Sep 19 13:20:23 2021 +0530

    Merge branch 'env-refactor' into main

[33mcommit 1533c706262ed13ef73d6141fe6b5ba8716bbb0a[m
Merge: c7a7b00 44fb300
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sun Sep 19 13:20:07 2021 +0530

    Merge branch 'main' into env-refactor

[33mcommit c7a7b004b06c27504a9891fcf6e67c991c986a02[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sun Sep 19 13:19:48 2021 +0530

    fix: remove the older env library

[33mcommit 69670ed523637fb0aa970066524afe876fa45c31[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sun Sep 19 13:17:35 2021 +0530

    Update settings.py

[33mcommit a508d785b94aadb39d08b9a91430dd1e101480ba[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sun Sep 19 13:17:01 2021 +0530

    Update .gitignore

[33mcommit 44fb3006e5bdba57752731e2a2047d98f5db3df3[m
Merge: 392d142 4d803a9
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sun Sep 19 12:17:37 2021 +0530

    Merge pull request #198 from chaos-genius/ui-opacity-graph-fixes
    
    UI opacity graph fixes

[33mcommit 52c467d8507ab078178e968fe1cf12b67c5fe46c[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sun Sep 19 11:59:45 2021 +0530

    feat (rca): return most recent RCA data

[33mcommit 20fa66d19adc5231c9a4de7d62aae00aa048b9f8[m
Author: NaikAayush <ayush@pesu.pes.edu>
Date:   Sun Sep 19 11:33:14 2021 +0530

    fix: use env variables from .env.dev

[33mcommit 0479f6e0b9b65b19cf22b51e42023aee0f3e11ea[m
Author: NaikAayush <ayush@pesu.pes.edu>
Date:   Sun Sep 19 11:32:21 2021 +0530

    fix: ignore .env.dev

[33mcommit 392d142ceb58fdfe69ba3acfc9de50b6f21c3d8c[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sun Sep 19 05:57:36 2021 +0530

    fix (rca): Fixes #188
    
    Removed extra argument in rca_hierarchical_data

[33mcommit 6d90b95881d4320603e0163640430ae465bfc92a[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sun Sep 19 05:23:11 2021 +0530

    feat (kpi): Added KPI validation

[33mcommit c7317b43d88b44bf24daf772a26674806229c52a[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sun Sep 19 05:00:20 2021 +0530

    refactor, docs (rca): Reorganized utils in core

[33mcommit 4d803a9b1b038243264edfbc030302cfff363a99[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Sat Sep 18 18:39:35 2021 +0530

    fix(UI): increase opacity of CI in graphs

[33mcommit c4a979ce7ae8f1ec89b2fead0af1664a8817e0c4[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Sat Sep 18 18:37:10 2021 +0530

    fix(UI): Fixed DQ and Subdim Graphs
    -> Added datetime to the tooltip
    -> Fixed the bug where Value was equal to lower limit of CI

[33mcommit 47fad312f05085b9f03559eb00fecb2566550b0b[m
Merge: 59e2186 d6c46bf
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sat Sep 18 16:41:23 2021 +0530

    Merge pull request #182 from chaos-genius/anomaly-date-fix
    
    Anomaly date fix to fix lag in CI and actual value

[33mcommit ee47e34b0c42b10d1d4edb827cd5c14ed2f576dc[m
Author: NaikAayush <ayush@pesu.pes.edu>
Date:   Sat Sep 18 16:23:06 2021 +0530

    style: surround assignment op with single space

[33mcommit 3c803cf60bf38289de72da748a5f381c14330cae[m
Author: NaikAayush <ayush@pesu.pes.edu>
Date:   Sat Sep 18 16:21:02 2021 +0530

    refactor: use dotenv and os.getenv in settings.py

[33mcommit 3772788aa04d9d1f9f7d104f7d9e49cc9aa41507[m
Author: NaikAayush <ayush@pesu.pes.edu>
Date:   Sat Sep 18 16:19:36 2021 +0530

    refactor: import and use integration env variables from settings.py

[33mcommit ead551509ee9d0656138d88ad3a23ba143ede822[m
Author: NaikAayush <ayush@pesu.pes.edu>
Date:   Sat Sep 18 16:17:59 2021 +0530

    refactor: read integration env variables in settings.py

[33mcommit 8be058c0b98f45511a04a4dbd12196259e52ab7e[m
Author: NaikAayush <ayush@pesu.pes.edu>
Date:   Sat Sep 18 16:16:38 2021 +0530

    refactor: change SQLALCHEMY_DATABASE_URI source, as duplicate variable exists

[33mcommit a3e43e7705c169800d0f25b06614978dd53dfb85[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Sat Sep 18 15:47:47 2021 +0530

    feat(celery): use separate queues for anomaly and alerts
    
     - these queues are separate from the default "celery" queue
        - the implication is that workers need to be started with an explcit
          queue parameter set to either the anomaly/rca queue or the alerts
          queue
        - Ex: `celery -A run.celery worker --loglevel=INFO --concurrency=2 -P processes -Q alerts`
        - Ex: `celery -A run.celery worker --loglevel=INFO --concurrency=2 -P processes -Q anomaly-rca`
     - only tasks defined in anomaly_tasks.py are run on the anomaly-rca
       queue
     - only tasks defined in alert_tasks.py are run on the alerts queue
     - all tasks will be executed on the default queue

[33mcommit ec0a57964d2e40fc7e28cecf837ec91655d5aed4[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Sat Sep 18 15:25:02 2021 +0530

    fix: fix typo in code

[33mcommit 8733eefac88167a116fbc8825914a603eb001051[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Sat Sep 18 15:23:35 2021 +0530

    fix: fix the settings corresponding to frequency of emails

[33mcommit 59e21864614797486da49b8122704aaabaf979ca[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Sep 18 15:03:43 2021 +0530

    fix: typo

[33mcommit da1254662067fe49b3ca83bf6db52aca4280ebff[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Sat Sep 18 14:58:48 2021 +0530

    fix: modify the frequency parameter

[33mcommit 0e154f74881546c828e06e369575a6bc33a78158[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Sep 18 14:42:57 2021 +0530

    fix: alert only for the acitve alert records

[33mcommit e79857bd4105712b61fcf580327a416269dc8afa[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Sep 18 12:03:34 2021 +0530

    feat: add the day on day in timeline option

[33mcommit e797bf812b0dc30317862eecc15009887f8987ca[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Sep 18 12:03:00 2021 +0530

    fix: change the api endpoint

[33mcommit d6c46bf839b5931df1e277fd6d8a2a79c2249272[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Fri Sep 17 23:38:24 2021 +0530

    fix(anomaly): anomaly date lag fix
    anomaly had error where actual value and CI were not sync
    actual value was lagging by a day, that is fixed now

[33mcommit 13a7c04d47244eeb21faeb81000c44f8467af3e9[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Fri Sep 17 23:24:36 2021 +0530

    fix(anomaly): StdDev style models now predict
    Both StdDevi and EWSTDModel now predict one day into the future
    instead of generating CI of the given dataframe

[33mcommit 499f1630d6e514c4ce1b03176918774894c10e13[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Sep 17 17:28:35 2021 +0530

    feat: add the python linter

[33mcommit a7892d7335961a06df4fa30271246b49d03602cb[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Fri Sep 17 17:24:35 2021 +0530

    fix: kpi home css fixes

[33mcommit e51a580efddaefeddfd5590bcc95086f4a1404e9[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Fri Sep 17 17:17:04 2021 +0530

    fix: home kpi integrations

[33mcommit 4379623820e5a56ad0c238e06bd33dc5a87336d3[m
Merge: aae74b7 eec1baa
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Sep 17 17:08:19 2021 +0530

    Merge pull request #175 from chaos-genius/celery-alerts
    
    feat: add the alert code

[33mcommit eec1baafafcf3b5cfa517b4a1782c2e543931997[m
Merge: 2f54431 cea54df
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Sep 17 17:06:11 2021 +0530

    Merge pull request #179 from chaos-genius/celery-alerts-dev
    
    Alert: CRUD  API Creation

[33mcommit cea54dfeb2e72329a785da7cfe2de8c77de7564e[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Sep 17 17:04:53 2021 +0530

    Update alert_model.py

[33mcommit b753614d58c886e1472c165bd344f51ccba22a3e[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Sep 17 17:02:29 2021 +0530

    Update alert_controller.py

[33mcommit ab94b71bcc04f899e1dded4a0065415238dfed7c[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Sep 17 17:00:16 2021 +0530

    Update alert_controller.py

[33mcommit 2f544313ddba34ea626dd84e6056b21b1ea7f782[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Fri Sep 17 16:50:58 2021 +0530

    feat: add AnomalyAlertController for sending emails

[33mcommit aae74b7020e217aee614a59619c9b5c8313e3a64[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Sep 17 15:49:42 2021 +0530

    fix: add the error message in response

[33mcommit b860948f53c0e84fe402bf33b41194c8a2316d25[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Sep 17 15:44:43 2021 +0530

    fix: api for the kpi list for dashboard

[33mcommit 993141208c6ee44500d17a5d2c69178532571064[m
Merge: 0dd3f90 db27579
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Sep 17 13:03:36 2021 +0530

    Merge pull request #181 from chaos-genius/frontend-main
    
    frontend: updates ui latest code

[33mcommit db27579e6cdbe3741141a7ad2a7bce740f493123[m
Merge: 40c26f8 0dd3f90
Author: Hariharan. K <harinapster007@gmail.com>
Date:   Fri Sep 17 12:26:01 2021 +0530

    Merge branch 'main' into frontend-main

[33mcommit 40c26f8e67f8892ac1eba6eb73a72364b3ac8c0a[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Fri Sep 17 11:47:42 2021 +0530

    fix: toaster, slack and email integration and removed unused codes (#180)
    
    * toastify ui
    
    * fix: PR review disallow
    
    * fix:toaster for response
    
    * fix: setting toast
    
    * fix: channel configuration form breadcrumb fix
    
    * fix: toastify timinig
    
    * fix:email meta info setup
    
    * fix:slack editable setup fixed
    
    * fix: form toastify fix
    
    * fix: disabled condition changed
    
    * fix: removed unused codes
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 25ce47cf2f365ddd1f98ea6bc6ee64008c81a794[m
Author: Mansi-Chauhan27 <mansic@mindfiresolutions.com>
Date:   Fri Sep 17 10:56:49 2021 +0530

    Alert crud  Api Creation

[33mcommit 0dd3f908963fed126361cff3e8885eb07d1fe4a2[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Sep 16 21:06:24 2021 +0530

    fix(anomaly): debug parse from aonmaly_params
    json gives string values of True/False, changed this to boolean values

[33mcommit a62690d3f305fe934a9668b67a1c65d3ebc7cf6f[m
Merge: b9a426d c9541ab
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Sep 16 21:00:13 2021 +0530

    Merge branch 'main' of https://github.com/chaos-genius/chaos_genius into main

[33mcommit b9a426da2a2dfd24c8ba13338a817e9d2fdb5bd4[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Sep 16 20:59:57 2021 +0530

    fix(anomaly):enddate in data load includes HH:MM:SS

[33mcommit c9541abf1f42a81ee814471e38cd2b0070d6932e[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Sep 16 18:40:40 2021 +0530

    fix(celery): change time format to HH:MM:SS
    
     - instead of just hour, the user can specify the exact minute and
       second of scheduling
     - tested on new server

[33mcommit 745280a0104ce27a28b0fa0f0a39d34e952ee000[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 16 16:24:53 2021 +0530

    feat: api for the json fields meta info in alert destination

[33mcommit a82b9864cc1873d27cba9ef89a7577d9a270f148[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 16 15:43:06 2021 +0530

    fix: add the error message in the response

[33mcommit 827eaa6cf5e2b9db5490fc3794d902a34ca71fbf[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 16 15:35:06 2021 +0530

    fix: minor changes for the empty state response helpful in frontend

[33mcommit d634cf09ae3992926567b6285e570bdc603f27a5[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Sep 16 12:47:46 2021 +0530

    fix(anomaly): static date fix for hours

[33mcommit 8cf854ca9733be5dde3a2dd5fcbed46b63f85516[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Sep 16 12:46:45 2021 +0530

    fix(anomaly): debug option added to anomaly_params

[33mcommit 87700530bca47fe90cec6e111fe582680a5368d9[m
Merge: 4124202 6d2d4cf
Author: Amatullah Sethjiwala <amatullahsethji@gmail.com>
Date:   Thu Sep 16 10:06:05 2021 +0400

    Merge pull request #178 from chaos-genius/anomaly
    
    feat(anomaly) : added ETS Model

[33mcommit 6d2d4cffde95689265d5f0a99e74a82b467c93a7[m
Author: Amatullah <amatullahsethji@gmail.com>
Date:   Thu Sep 16 10:04:52 2021 +0400

    feat(anomaly) : added ETS Model

[33mcommit 19cb7b765c4192557b3bb39a07e131ea4c9ed922[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Thu Sep 16 10:23:58 2021 +0530

    fix: disable dropdown indicator and minor css fixes (#176)

[33mcommit 65840b70a033bd8ee7ce17e3276f25f23aa4cd25[m
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Thu Sep 16 10:23:46 2021 +0530

    fix: minor fixes (#177)
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 41242023be60848c6505844c6fd33bce5874befb[m
Merge: 591a309 8f89ef8
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 16 09:57:19 2021 +0530

    Merge pull request #155 from chaos-genius/bridge_branch
    
    feat: add adpi endpoint for kpi dashboard

[33mcommit 8f89ef8646f7a654d59b932ce54dc2367b5ccfd6[m
Merge: 273f0da 591a309
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 16 09:57:11 2021 +0530

    Merge branch 'main' into bridge_branch

[33mcommit 273f0da346df8ac7921ced945f7fd5cbe266ec35[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 16 09:56:06 2021 +0530

    Update kpi_view.py

[33mcommit bfe1662b3579598e4bfef4f22ff3f675e14bb871[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Sep 15 22:03:27 2021 +0530

    feat: add the alert code
            - add the static alert code
            - add the placeholder class for the KPI anomaly alerts
            - add the placeholder class for the KPI based static alerts
            - celery config for scheduling the alerts

[33mcommit 48d9860d1f6f3a6083dba0df16f35cbaef3f3873[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Wed Sep 15 18:57:22 2021 +0530

    fix: table, kpi form, dropdown ui fixes (#174)
    
    * fix: form, table css fixes
    
    * fix: route configuration

[33mcommit 7cf8a8fb3e015fb84e94cdd5a0ee944a6624c58f[m
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Wed Sep 15 18:55:48 2021 +0530

    Sb datasource edit (#173)
    
    * fix: minor changes
    
    * fix: update api added
    
    * fix: disable field for datasource
    
    * fix:disabled field and update datasource
    
    * fix: button space added
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 591a3091954edf1aebe445edbf0957b0ad0cc759[m
Merge: cd98558 5126894
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Sep 15 16:43:12 2021 +0530

    Merge pull request #172 from chaos-genius/anomaly-refactor
    
    Anomaly + RCA refactored with Celery Integration

[33mcommit 5126894b1fae63d5aa2b9dfebc07fd729332a058[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Sep 15 16:42:31 2021 +0530

    Update e10b2bb6682d_added_new_anomaly_data_table.py

[33mcommit bdec0df706da55bb0757251fb80c06a24411873e[m
Merge: 95bf181 cd98558
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Sep 15 16:27:54 2021 +0530

    Merge branch 'main' into anomaly-refactor

[33mcommit 95bf1817457ed85bd557c2c59e0da74a659c7108[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Wed Sep 15 16:00:07 2021 +0530

    fix(celery): ignore static KPIs
    
     - static KPIs are not considered for scheduling

[33mcommit afaae4193737df12f63c5956793808a5ebc1f053[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Wed Sep 15 12:00:27 2021 +0530

    fix: dashboard waterfall chart and loader fix (#171)
    
    * fix: edit kpi form dimension dropdown and setting dropdown fix
    
    * fix: dashboard waterfall loader

[33mcommit b4cd2c0e1c280ddb06759427870940923c4e7dd5[m
Merge: 3679d4e 06fb620
Author: Amatullah Sethjiwala <amatullahsethji@gmail.com>
Date:   Wed Sep 15 10:08:29 2021 +0400

    Merge pull request #170 from chaos-genius/anomaly
    
    fix(anomaly) : added sensitivity

[33mcommit 06fb620e024f1f2ad1d5908743ccd49334fd91a1[m
Author: Amatullah <amatullahsethji@gmail.com>
Date:   Wed Sep 15 10:03:58 2021 +0400

    fix(anomaly) : added sensitivity

[33mcommit 3679d4e72fd837a3aa18c29062520c778bbd9505[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Wed Sep 15 09:59:30 2021 +0530

    feat: add API supervisor conf and nginx conf
    
     - the backend_api conf assumes username to be `ubuntu`
     - the nginx conf is directly copied from the a-demo instance

[33mcommit 0fe580747e713ba0d8781298459b029bbfbd52e9[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Sep 14 17:03:34 2021 +0530

    feat(celery): add supervisor config files
    
     - supervisor conf files of celery scheduler (beat) and a simple worker
     - the number of worker processes are hardcoded to 2 for now
     - log files are set appropriately
     - `stopasgroup` is needed for worker since the workers are child
       processes and without this, the worker processes will keep running in
       the background even when stopped through supervisor
        - timeout is set to 10s after which they are killed

[33mcommit cd98558f9b0b7335260cc25d8bc0ff5fde76b025[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Sep 14 15:46:08 2021 +0530

    fix: handle nested dict and test connection update

[33mcommit 9b3ab88926a6836d0d5b6bb57b1b287503146c3a[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Sep 14 13:56:21 2021 +0530

    fix: details in the data source

[33mcommit 3d76f27777fa72fc8d3537c1416b83dc392b640a[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Sep 14 13:30:41 2021 +0530

    fix(rca,celery): make anomaly and RCA tasks independent
    
     - add anomaly and rca tasks in the same group
     - remove chain between anomaly and rca tasks
     - rca no longer receives anomaly status, and hence does not fail based
       on that
     - fix log message when anomaly and rca are scheduled
     - add log message when anomaly and rca are run
     - format using black

[33mcommit 746eaad6ab0143e98a1dfb759a95088785e17384[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Tue Sep 14 11:03:30 2021 +0530

    fix: kpi edit dropdown and kpi home fix (#168)

[33mcommit fc460219933375b2eb2a52cdaeb62536ea72e93e[m
Merge: 750d1e9 373eb37
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Sep 14 10:40:24 2021 +0530

    Merge branch 'anomaly-celery' into anomaly-refactor

[33mcommit 5b05b86d1a9da56269b7b15d91174e9df69db774[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Tue Sep 14 10:11:09 2021 +0530

    fix: dummy api integration for kpi home, hierarchical table fix (#167)
    
    * fix: hierarchical table, dummy api kpi home integration
    
    * fix: kpi home

[33mcommit f043d84bc8578c9b0519b94973e6ea7d79ad8630[m
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Tue Sep 14 09:55:52 2021 +0530

    Kpi form edit api and functional integrations (#166)
    
    * fix:added loader
    
    * fix: kpi edit flow done
    
    * fix:redux setup for datasource metainfo
    
    * fix:alert page loader added
    
    * fix: minor-fixes
    
    * fix:minor-fixes
    
    * fix: minor-fixes
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit dfbf8d4a5bd0dc239f28925ce3a80006a0ebd475[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Tue Sep 14 09:47:04 2021 +0530

    fix: remove hard coded portions of code

[33mcommit 373eb3784967a8118c2220524cb3b271c3932468[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Sep 13 21:43:06 2021 +0530

    fix (rca): Fixed print message

[33mcommit 2e091d197e99b85e449265bf5480c926acb4fc62[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Sep 13 21:42:34 2021 +0530

    fix (rca): added error handling and messages

[33mcommit 750d1e9ac6d81cba3cb717c02e5da8c9dee246cb[m
Merge: d6a3e73 4bc0ace
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 13 18:06:28 2021 +0530

    Merge pull request #153 from chaos-genius/anomaly-params
    
    fix(anomaly-params): add missing GET method and set run_anomaly

[33mcommit d6a3e7332979c7c8c000d99db7794ba588a2d859[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Mon Sep 13 17:56:05 2021 +0530

    fix(anomaly): add code for 3rd party connector kpi

[33mcommit fbd52cce839030e177d836f1857e6db6f473bad4[m
Merge: 5b628ab a497ddf
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Mon Sep 13 17:20:06 2021 +0530

    Merge branch 'anomaly-refactor' into anomaly-celery
    
    Update changes from anomaly-refactor

[33mcommit 5b628ab157b512ee0558c638a80efc22a943f902[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Mon Sep 13 17:01:39 2021 +0530

    fix (pre-compute, rca): updated placeholder with the rca function

[33mcommit 43e59f76ff8305a5b3ec89a99e1a016ed58cb8a4[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Sep 13 15:57:20 2021 +0530

    fix (rca): registered run_rca as flask command

[33mcommit cd5daaf1a0b6079e96997754dd393bd4bff93a04[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 13 13:10:42 2021 +0530

    fix: don't expose the data source creds

[33mcommit 75f400f8347b28a2046422d5074a486745ed401f[m
Merge: f6f3409 b77f21a
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 13 11:39:58 2021 +0530

    Merge branch 'dev_01' into main

[33mcommit b77f21ae2855c403cdafabe78b7d251a6fd9bc66[m
Merge: d8692c4 f6f3409
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 13 11:39:33 2021 +0530

    Merge branch 'main' into dev_01

[33mcommit d8692c46a7999f9f802d8ae92785e15cef74a2f6[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 13 11:39:07 2021 +0530

    fix: api endpoint and some fixes

[33mcommit e133e6e9ba5be4ca25348ef3d67ef12948152ef5[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 13 11:13:51 2021 +0530

    Update kpi_view.py

[33mcommit 7d0fd64223ae6ac095e2fbbcceb57b9afe0ae2e8[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 13 11:10:11 2021 +0530

    update the fields which can be edited

[33mcommit f6f3409729b69fc11ac127900bb2388ca3c4b5be[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 13 10:59:44 2021 +0530

    fix: add the data source

[33mcommit a497ddf5827045ec6d8ab685b0a57a36a4e2411d[m
Merge: bcb62ca 4547cc5
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Mon Sep 13 10:38:16 2021 +0530

    Merge branch 'anomaly-refactor' of https://github.com/chaos-genius/chaos_genius into anomaly-refactor

[33mcommit bcb62ca1324db6fdfabc6837632d148f2358b3a0[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Mon Sep 13 10:38:11 2021 +0530

    fix(anomaly): add freq and sensitivity to models

[33mcommit 2a92d61b55fa2dab4268deb3929b02f1b5eaf198[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Sep 13 03:55:05 2021 +0530

    feat (rca): Added precomputation for RCA

[33mcommit 4547cc5aaac6d852537ef19227ef0d45b287de2c[m
Merge: 16699c2 551cd87
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sun Sep 12 21:41:06 2021 +0530

    Merge branch 'anomaly-refactor' of https://github.com/chaos-genius/chaos_genius into anomaly-refactor

[33mcommit 551cd876cc1e3635ee6d8662d6f78f65e3bff941[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Sat Sep 11 15:53:41 2021 +0530

    fix(anomaly): set prophet yearly_seasonality False

[33mcommit fddfcc415aaf6cf0ddac7536d644e9312c26b2b8[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Sat Sep 11 14:58:20 2021 +0530

    fix(anomaly): fixed edgecase in drilldown api
    edgecase now activates if there are no drilldowns on the current date

[33mcommit e94c71c4f34bfc03dce16ade64215a02edd4775b[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Sat Sep 11 13:33:34 2021 +0530

    fix(anomaly): overall /dq api returns ordered data

[33mcommit 16d81c77d1627c038e5638819e327cbb771e42c4[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Sat Sep 11 13:18:52 2021 +0530

    fix(anomaly): removed missing from dq, and mean...
    dissapears if kpi is aggregated over mean

[33mcommit 37a8ee56bb0dcd36ac3ff11fd2677c51bc3cdf7c[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Sat Sep 11 11:13:36 2021 +0530

    fix(anomaly): added appropriate sensitivity values
    to StdDeviModel and EWSTDModel

[33mcommit a538ce9910a4ec160394286c05103a73436972e2[m
Author: Mansi-Chauhan27 <mansic@mindfiresolutions.com>
Date:   Fri Sep 10 17:30:47 2021 +0530

    Error handling issue fix

[33mcommit 4bc0acea21b7bc898fa4e2d7949d46c40d87ef14[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Fri Sep 10 17:13:03 2021 +0530

    feat(anomaly-params): init scheduler_params validator
    
     - only validates the "hour" field used by the celery scheduler for now
     - does not check if all the keys are valid
         - this leaves it open to extension without the changing the
           validator
         - this will have to be added once the scheduler_params are
           finalized

[33mcommit 6498713759535b4c32e5669fb0a319e5956945ce[m
Author: Mansi-Chauhan27 <mansic@mindfiresolutions.com>
Date:   Fri Sep 10 17:11:30 2021 +0530

    Get/Edit/MetaInfo api for kpi and Get/MetaInfo api for datasource

[33mcommit 1bbd7e56d58d343f1413e8adfbe1c93468f38245[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Fri Sep 10 17:03:03 2021 +0530

    feat(anomaly-params): validate some values too
    
     - refactored anomaly-params validation into separate functions
        - validate_partial_anomaly_params
        - update_anomaly_params
        - validate_partial_scheduler_params
     - more thorough validation of anomaly_params
        - anomaly_period must be an int
        - frequency can only be one of the specified values
            - same for sensitivity
            - these values might have to be changed as the anomaly detection
              is updated
        - seasonality must be a list with each element being one of the
          specified types
     - use a separate function to update anomaly_params in DB
        - this is used so that scheduler_params isn't overwritten by
          updating the anomaly_params directly
            - since scheduler_params has some fields currently maitained by the
              celery scheduler
        - in the future, this will also make it easier to move to JSONB and
          related functions
     - scheduler_params validator will have to be updated in the future

[33mcommit c29fdb257ec5d7c361d9a008af3c5fc61b3c03e3[m
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Thu Sep 9 17:33:35 2021 +0530

    UI and Functional fixes onboarding flow (#156)
    
    * fix: onboarding flow analytics
    
    * fix:onboarding flow
    
    * fix:setting page edit
    
    * fix: new loader and drilldown graph visibility
    
    * fix : drilldown graph css fixes
    
    * fix: home last card format
    
    * fix: setting page modal and home page column format fixes
    
    * fix: hierarchical table fix
    
    * fix: hierarchical table 2 child padding
    
    * fix:onboarding flow last message
    
    * fix:hierarchical table add classname for row
    
    Co-authored-by: Moghan Kumar <moghan@sketchbrahma.com>
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit d7a577c38bf2e44c590ec09812957123a251406b[m
Author: = <=>
Date:   Thu Sep 9 17:25:00 2021 +0530

    fix: add static data to graph_data key

[33mcommit a32549f63bab2d1022800ba2ef4bfba278b73d7f[m
Author: = <=>
Date:   Thu Sep 9 17:24:11 2021 +0530

    fix: add static data to graph_data key

[33mcommit e9893a071b61a523e3d7b485aa9535ed182c513b[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 9 17:08:27 2021 +0530

    fix: tooltip in the anomaly graph

[33mcommit e8c222efbb279dbf1a18493cb6d412c9c49ccbd9[m
Author: = <=>
Date:   Thu Sep 9 16:33:32 2021 +0530

    feat: add adpi endpoint for kpi dashboard

[33mcommit 530b9a8bf987d624c139690accabfbb9ede6096b[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 9 15:59:39 2021 +0530

    fix: change in the api for data source and config

[33mcommit b60c3941c7b71b6b928c2b2cecf28453f8d8accd[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Thu Sep 9 15:29:56 2021 +0530

    feat(celery): run dummy RCA after anomaly using chain
    
     - the RCA function is a placeholder for now. the actual RCA wrapper
       function will have to be called after it is completed.
     - the "status" field has been split into two - anomaly_status and
       rca_status
        - the possible values are the same
     - uses celery.chain to run RCA only after anomaly has finished
     - also added docstrings to anomaly and rca task fns

[33mcommit fc6ffabd9e97d96d1ce6cda0359ae9f8881e6a79[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 9 01:46:04 2021 +0530

    fix: use the active field for the data source deletion

[33mcommit 00ca7ba9a34ab23f038f52e71ff62539f5b139e3[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 9 01:14:39 2021 +0530

    fix: typo in the function call

[33mcommit 74f2d5c152793b651385f996b5803d05c30536c9[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 9 01:08:34 2021 +0530

    fix: change in the workspace

[33mcommit 4adafa444e0c7f22434acb93dc01c0a70862c816[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Wed Sep 8 16:09:09 2021 +0530

    feat(celery): add scheduler task to run at custom time
    
     - the scheduler runs every 10 mins
     - if there are any pending KPI tasks, it runs them as a celery group
     - stores a `last_scheduled_time` for each KPI, only schedules tasks if
       it hasn't been scheduled for this day
     - the status of the last task is also saved (in-progress, failed,
       completed)
     - the tasks are run at the given hour everyday. if not specified, it is
       considered to be 11am.
        - this means that the task starts within 10 mins of the given hour.
        - for example, if the KPI is scheduled to run at 4:00PM (hour=16),
          the task will be started by 4:10PM and could take longer to run.
     - TODO: move status and last_scheduled_time out of scheduler_params and
       into a new table

[33mcommit 36ca772ef9a96cd2079344791c3f923da6b72d8a[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Sep 7 22:45:59 2021 +0530

    fix(anomaly): return status based on exceptions

[33mcommit a99a853b7b68953c4681c556018e79a78a017ab9[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Sep 7 22:15:13 2021 +0530

    feat(celery): schedule all KPI-level dist. tasks
    
     - all KPI tasks are run everyday at 11am
        - for testing, we set the schedule to every 5 seconds
     - also formatted with black
     - also fixed `kpi` typo (should be `kpi_id`)

[33mcommit c3ae10312e43f366280fef4aadd1d8947d3070db[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Tue Sep 7 21:04:46 2021 +0530

    feat: partly added support for basic scheduler which runs at a specific time daily

[33mcommit fe6ddef53a4462f84006d48dee3dc966549baba0[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Sep 7 20:23:00 2021 +0530

    fix: switch on run_anomaly when params are updated

[33mcommit 0c648c944318723f23fcb674ec2cee369f7a38ac[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Tue Sep 7 19:33:53 2021 +0530

    fix: kpi form bug fixes, dashboard graph card highlight (#152)
    
    * fix: kpi form reset and loader for dashboard
    
    * fix: dashboard graph card highlight

[33mcommit 6e57928f405f5e5c249fcee91633fc66d9aa4824[m
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Tue Sep 7 19:33:40 2021 +0530

    fix: setting api and functional integrations (#151)
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 7c8589458b6f01033f2aadb8691d6bd933a78f2e[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Tue Sep 7 19:14:25 2021 +0530

    fix: add missing GET method for anomaly params endpoint
    
     - GET method retrieves anomaly params
     - returns error with code 400 when KPI does not exist
     - the response is in the same format as POST, except without the msg

[33mcommit cff6c393dfeb75e5c758b382496f078ba2c14a2c[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Tue Sep 7 18:53:11 2021 +0530

    fix(anomaly): add edge case in drilldown api
    for non existence of timestamp

[33mcommit 11654c96a5ae18587278b3b0c3d9d46c0e21109d[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Tue Sep 7 18:48:08 2021 +0530

    fix(anomaly): convert query string to user string
    and fix timestamps in anomaly_data_view

[33mcommit 4ddaf1e2514946cff42dcae522767422e38ecc45[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Tue Sep 7 18:37:18 2021 +0530

    fix(anomaly): rank subdim wrt to population size

[33mcommit 5092dcbab0077b6e3acdf0e920b1a8b71101c45a[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Tue Sep 7 18:32:53 2021 +0530

    fix(anomaly): fix timestamps to work with hourly data

[33mcommit 3fa88da4751c145868d6ae4e01f6b507e50641f0[m
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Tue Sep 7 16:34:10 2021 +0530

    fix: edit email & slack and validations done (#150)
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 5732079daa5fb5ea628bdba76c1e58c2ac0cd939[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Tue Sep 7 14:09:02 2021 +0530

    fix: dashboard anomaly data quality fix, kpi form test query (#149)
    
    * fix: kpi form query and css fixes
    
    * fix: kpi form query
    
    * fix:data quality issues
    
    * fix: kpi bug fixes
    
    * fix: kpi form loading
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 8da2923e9a1ee4dd0ae2e4e6d77845e16588e4cb[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Sep 7 14:02:19 2021 +0530

    fix: bug in the email destination api

[33mcommit bf0298fc8f380d2f760a3a2a7ae7035e328d490a[m
Merge: 241b8cc a4baed4
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Sep 7 13:39:54 2021 +0530

    Merge pull request #147 from chaos-genius/alert-destination-config
    
    Alert destination config

[33mcommit 7314e6df7026706e74f3ab8e4340925a3d12f706[m
Merge: 9dfcdc5 ff513bd
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Sep 7 12:08:05 2021 +0530

    Merge pull request #148 from chaos-genius/anomaly-params
    
    feat: add endpoint to update Anomaly KPI params

[33mcommit 16699c28ffaf49fd9e1476b65597c4b41ddbe1a9[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Mon Sep 6 22:08:35 2021 +0530

    fix (anomaly): graph data output is ordered

[33mcommit b8642ab2ce4ce30ccd9c96d1ead077caac6d5133[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Mon Sep 6 22:08:16 2021 +0530

    fix (anomaly): fill_data can take end_date as none

[33mcommit d527862230d2e93ac8db3bb0ae48a80d313faa45[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Mon Sep 6 21:41:25 2021 +0530

    fix (anomaly): severity tooltip added for overall

[33mcommit ff513bda5219a2e3040e8d6e7d97b8d3238155a5[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Mon Sep 6 20:59:31 2021 +0530

    fix: use new structure, validate fields in param endpoint
    
     - new structure of anomaly_params
     - fields of anomaly_params are validated
         - if none of the fields are given or if there are extra fields, an
           explicit error with code 400 is returned
     - the new anomaly_params is returned in the response
     - static analysis and linters don't show any new warnings

[33mcommit 233e47436fdcdd0ea793fbfa32d4957deb8c660c[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 6 20:55:14 2021 +0530

    fix (anomaly): fixes severity tooltip in #145

[33mcommit 9dfcdc560013190eae29d40db8ea0fc19ef34e1c[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Mon Sep 6 19:39:25 2021 +0530

    fix(anomaly): added appropriate senisitivity value to ProphetModel

[33mcommit a4baed4e30c74cf36d895a0013bc5457554ec62b[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Mon Sep 6 19:09:22 2021 +0530

    refactor: refactor the config controllers

[33mcommit 241b8cccd92a130dc555b2335403133f02f8b3bd[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Mon Sep 6 18:31:45 2021 +0530

    refactor (rca): improved generators, conditionals etc

[33mcommit 99f17b36ef0bfc349df7372edcf3f1776f22928d[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Mon Sep 6 18:27:13 2021 +0530

    fix(anomaly): fixed the days missing issue
    in anomaly when training in multiple batches

[33mcommit 44d29ea01d6021cd18c826a500d7a2840641f2d1[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Mon Sep 6 17:07:25 2021 +0530

    fix: check for JSON in param update endpoint
    
     - returns an appropriate error with code 400 when the body is not a
       JSON

[33mcommit 45847a41d5dc04ddf7b1768e855af1ecd77835ff[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Mon Sep 6 17:05:42 2021 +0530

    fix (anomaly): fixes severity tooltip in #145

[33mcommit b2497a68da1a51274e2d66721691158c9a63ce02[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Mon Sep 6 16:34:35 2021 +0530

    fix: modify controller code

[33mcommit 1b4f9bc3cfbab89073bc2d2dfae3183544c3756f[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Mon Sep 6 16:10:51 2021 +0530

    fix: save/commit updated object in params endpoint
    
     - The changes made in the anomaly params update API endpoint were not
       being committed to the DB, which could have lead to loss of data
     - The fix uses the `save` method provided by the CRUD Mixin

[33mcommit 28f04f4e6517251c7ba7b8b59a2e55a02640edc4[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Mon Sep 6 16:06:49 2021 +0530

    fix(anomaly): fixes title and duplication in #145

[33mcommit 9522a18224bfbc7fc2d273efe0188680ec5a4bb1[m
Author: Kshitij Agarwal <kshitij123456aga@gmail.com>
Date:   Mon Sep 6 14:43:19 2021 +0530

    feat: add controllers for config

[33mcommit 497ff54f610e9e0331f32a3daaad29831402ef7c[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Mon Sep 6 11:36:09 2021 +0530

    fix (anomaly): added cardinality upper limit..
    for dimensions in subgroup generation

[33mcommit a8a977428f54ee5cfbbbb1cfef67bb327758c876[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 6 10:44:30 2021 +0530

    feat: modify functionality for alert destination

[33mcommit ec561e543e7d930bcedf5f464cc0fed6b18631f5[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Sep 6 10:13:04 2021 +0530

    fix: handle the issue in the query

[33mcommit d00ef0689e9c1c48989f910e3a24af5ebd69b27c[m
Author: Samyak S Sarnayak <samyak201@gmail.com>
Date:   Sun Sep 5 22:29:23 2021 +0530

    feat: add endpoint to update Anomaly KPI params
    
     - untested at this point
     - most errors are handled

[33mcommit fc7bafc005c4b389e16a49bb6aa0900de29b3220[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Sat Sep 4 17:41:06 2021 +0530

    fix (anomaly): supressed Prophet Training Output

[33mcommit 0d35e70ad94b5069ade9bd7cd21019d721fd35b1[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Sat Sep 4 17:33:19 2021 +0530

    feat (anomaly): added sensitivity to anomaly_params
    and to following models:
    1. Standard Deviation
    2. Exponentially Weighted Std Dev
    3. Prophet

[33mcommit 68fb3078f388ce96d665595bea2054ee5c10b2d8[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Fri Sep 3 19:28:07 2021 +0530

    fix (anomaly): updated subgroup generation logic

[33mcommit c1799c0cb1f7affa1f87cbfd2f77d145b3946b71[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Fri Sep 3 18:43:17 2021 +0530

    activate analysis fix (#141)
    
    * configure setting
    
    * Activate Analytics dashboard

[33mcommit f68ef7ff32f34b94a2f1e5bae31b0238ddeb70f1[m
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Fri Sep 3 18:27:12 2021 +0530

    Sb alert bugfix (#142)
    
    * fix:alerts routes issues fixed
    
    * fix:datasource form integer fixed
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 6d609be84023f70c5ee560942cef738740ff3a8e[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Sep 3 16:56:13 2021 +0530

    fix: typo in the anomaly

[33mcommit 69e4b0476eae88ce8f628a97c98800f74df7cf04[m
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Fri Sep 3 15:16:16 2021 +0530

    Sb configure setting (#140)
    
    * dashboard setting
    
    * fix: alert destination integrations
    
    Co-authored-by: Moghan Kumar <moghan@sketchbrahma.com>
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 006c73835f061c648eae0a702e63f97cb4ca213c[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Sep 3 14:03:29 2021 +0530

    fix: typo in the kpi

[33mcommit 1fb3417dd85ce7bc5594788ecc24291c331bb0c2[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Fri Sep 3 12:16:51 2021 +0530

    fix:kpi table configure option disabled (#139)
    
    * activate analytics
    
    * fix: kpi table configure option disabled

[33mcommit 6891b63be474037bd212e6b81f86c94da331a3b6[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Sep 3 11:53:53 2021 +0530

    fix: make the settings as the singular records

[33mcommit 5d7389949772773a220d5ef32764e180290757b7[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Sep 3 11:37:58 2021 +0530

    fix: change the api response

[33mcommit e29d427950b9ddba6bd0e29133911d9d093ffd57[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Fri Sep 3 11:16:49 2021 +0530

    fix: kpi table delete integration, alert email integration, minor fixes (#137)
    
    * fix: kpi table action
    
    * fix: dashboard and anomaly routes fixed
    
    * fix:add filter flow hide
    
    * fix: kpi table action setting
    
    * fix:line chart xaxis date format
    
    * fix: kpi and datasourcde table noresult with search data
    
    * fix:data connection type on every refresh
    
    * fix:added disable kpi integration
    
    * fix:datasource form object issues
    
    * onboarding modal fixes
    
    * fix: datsource added status
    
    * fix: alert action
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 2bc00c6fabc924980c97e332a7f8a67b0fbc1c25[m
Merge: 54e51ab 4b83c3a
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Sep 3 10:17:09 2021 +0530

    Merge pull request #136 from chaos-genius/alert-destination-conf
    
    merge alert branch on main

[33mcommit 4b83c3ac75b5092e38fc3a1c5741cc50c9762a4b[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 2 18:46:55 2021 +0530

    feat: add the kpi for the alert destination

[33mcommit 768c84bac1c9732a00c22efc978fb41ff2426880[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Sep 2 20:40:38 2021 +0530

    fix (anomaly): fixed data retrival for dq, missing series

[33mcommit 54e51ab2427b2b5ff32e31cc8d300b7b4af35673[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 2 19:04:39 2021 +0530

    fix: test client connection

[33mcommit 5e15c90c1e374a86c6e9a33ff3d84f44919c12b7[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Sep 2 18:34:00 2021 +0530

    fix (anomaly): fixed end date and data loading

[33mcommit 656ad247ab32228f0718d1d89d157f6cd0ab24c1[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Sep 2 15:23:26 2021 +0530

    feat (anomaly): added manual date specification

[33mcommit 7ea2874bd9cffdd8dba48c70f69e7e6323d63629[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Sep 2 15:21:40 2021 +0530

    feat (anomaly): added anomaly_params to the architecture

[33mcommit 501b3059f645ff632e35eb7f80268fc7cc7fc841[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Sep 2 14:41:36 2021 +0530

    feat (anomaly): added anomaly config

[33mcommit 7d8f9940c7ef06e7e1ee5e5ee2ae56a890bea9ca[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Sep 2 14:04:09 2021 +0530

    style (anomaly): fixed extra whitespace, formatting and style consistency

[33mcommit 2d18a96c8c236adbec1f336be2258013f0ac063b[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Sep 2 13:31:34 2021 +0530

    refactor (anomaly): removed nested function and extra comments

[33mcommit febb2c6c8a04e2a031e4d144d0cbe249a2764386[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Sep 2 13:30:26 2021 +0530

    fix (anomaly): views now use static params in kpi

[33mcommit 16fdc64df550953e83843efbe9bb3172eb2ac78e[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Sep 2 13:10:03 2021 +0530

    fix (anomaly): drilldowns use correct end date now

[33mcommit c64f7cf7a3d3558700f3fcce0a36a526b77770aa[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Sep 2 13:09:43 2021 +0530

    fix (anomaly): updated requirements
    
    requirements added for neuralprophet and greykite

[33mcommit 91801764226254bfbfae632c0d1041945e53ddd2[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 2 09:07:55 2021 +0530

    fix: add the ads connector

[33mcommit 6fcbf01182bb048e9fb0b49111723513996df32f[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Sep 2 08:20:26 2021 +0530

    fix: add the disable kpi

[33mcommit 58168aba0133f5edc042b89d42ad87673aed8ceb[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Wed Sep 1 17:39:48 2021 +0530

    fix (anomaly): subdim anomaly gets correct data

[33mcommit c6bb18fc6ec3ddc5b1ca6543caaffb49be21d107[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Wed Sep 1 17:32:27 2021 +0530

    fix (anomaly): removed extra call for json conversion

[33mcommit 4f06a0fd9e77ecb391730332357f5073c766874f[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Wed Sep 1 17:12:45 2021 +0530

    refactor (rca): replaced redudunant code and lines

[33mcommit e07df2d3933b2780df0cacd88160f7f64833ce48[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Wed Sep 1 17:11:20 2021 +0530

    fix (anomaly): series filtering view fixed

[33mcommit cb2f263da918ca9c149823ad8d014a06ab67b1b3[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Wed Sep 1 16:58:34 2021 +0530

    fix(anomaly): subgroup generation fix
    subgroups now include groups with only 1 dimensions, 2 dimesnions and so on

[33mcommit 54f044a9a97a736b00dbbbbbbed0ce1d29b5a965[m
Merge: 5c81d59 edeca25
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Wed Sep 1 15:37:13 2021 +0530

    Merge branch 'anomaly-refactor' of https://github.com/chaos-genius/chaos_genius into anomaly-refactor

[33mcommit 5c81d59623198441eda1b0e04cc94f8b887e9ef1[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Wed Sep 1 15:36:49 2021 +0530

    feat(anomaly): Added models
    1. EWSTDModel
    2. GreyKiteModel
    3. NeuralProphet

[33mcommit edeca25dd4d0d2dfb441b30b20ab1f9c3ef21169[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Wed Sep 1 11:21:43 2021 +0530

    fix (anomaly): dq now loads using pandas

[33mcommit fff9b90d15007f1e9b96a79f4e20b5bff4c7ea51[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Wed Sep 1 11:18:46 2021 +0530

    fix (anomaly): dq endpoint fixed

[33mcommit baeb02d2ec3d924f0ef8a7e04bb2c85bb881d69f[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Wed Sep 1 10:46:36 2021 +0530

    refactor (anomaly): fixed boolean logic, single use variables

[33mcommit 4e34d4319c62817abf5fc487ec51245dd69703da[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Wed Sep 1 09:55:25 2021 +0530

    fix (anomaly, db): series_type length increased
    
    since subdimension names can often be long, we needed longer strings

[33mcommit 1566c3e89bf032e59c6356a26c637744ab981dc1[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Wed Sep 1 09:49:22 2021 +0530

    fix (db): alembic now compares types of columns

[33mcommit a16745b83ad8b844424cf862164e29ce297a4074[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Wed Sep 1 09:41:17 2021 +0530

    refactor (anomaly): dq missing data moved to func

[33mcommit a81944fc64037223d2ba9a70d8bd846748d95855[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Wed Sep 1 09:35:55 2021 +0530

    fix (anomaly): Anomaly output is now stored via AnomalyDataOutput

[33mcommit 37a1e0abf3836c3872da839af95974eb72e44b15[m
Merge: 38ea003 227b326
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Wed Sep 1 09:14:20 2021 +0530

    Merge pull request #126 from chaos-genius/sb-bug-fix
    
    fix: resolve datasource form issue

[33mcommit 227b3263ecf12e8c7ed432d6c2b95b99713b2395[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Sep 1 09:09:28 2021 +0530

    fix: resolve datasource form issue

[33mcommit 21615d951e38fc7da49a08c1b869f3df911dbde3[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Aug 31 13:55:17 2021 +0530

    fix: add the status for the KPI response

[33mcommit 38ea00380697173cff926399b936ff8976d1e338[m
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Tue Aug 31 13:00:05 2021 +0530

    Sb login UI (#124)
    
    * datasource and kpi table no data ui
    
    * Login ui
    
    * fix:tab issues fix
    
    * anomaly no data ui
    
    * fix: anomaly css fixes
    
    * fix: refactor datasource dropdown image
    
    * home card css fixes
    
    Co-authored-by: Moghan Kumar <moghan@sketchbrahma.com>
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 92c16395ffa85d34db9c9e00267424ccce43a840[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Aug 31 12:48:24 2021 +0530

    fix: change the port from the str to int

[33mcommit 6cdf8dd4d87f0a8ed753e1895c91bdb2321d494b[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Aug 31 12:13:59 2021 +0530

    fix (anomaly, db): Added migration for new anomaly table

[33mcommit 62c599a8ea9f7e9b8182ac3c80f7aacc07d4b931[m
Merge: e786eec 2d07fec
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Aug 31 12:08:57 2021 +0530

    Merge branch 'anomaly-refactor' of github.com:chaos-genius/chaos_genius into anomaly-refactor

[33mcommit e786eec1b1e516e3ca07b1d92f6e5d6de2e4195d[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Aug 31 12:08:50 2021 +0530

    fix (anomaly, db): Added AnomalyData back for migration

[33mcommit 2d07fece4c29ea4130aeb4d860a39c1b4e3dcd7c[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Mon Aug 30 13:38:23 2021 +0530

    fix(anomaly): subgroup filtering works now

[33mcommit ba59f2530eb235ba131f3e69e32403aedbcb9e53[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Mon Aug 30 10:25:36 2021 +0530

    fix: datasource and kpi route to table after successful added, drilldown hidden until click anomaly issues (#123)
    
    * fix: datasource form redirect functional and minor css fixes
    
    * fix: datasource form submit loading and redirecting

[33mcommit aff820881717ac55a01a4e925b55f51a6b5ce462[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Aug 30 04:31:48 2021 +0530

    fix (anomaly): misc fixes for anomaly controller
    
    1. Removed extra imports
    2. Fixed no prior data case
    3. Update output table name for storage

[33mcommit dc6d083bd4d16858c7cbc9b04b2ef389b5c18f46[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Aug 30 04:28:14 2021 +0530

    fix (anomaly): dq and subdim views now use AnomalyDataOutput

[33mcommit 158fc139dfa1fc081538c7945ed824254c1552fc[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Aug 30 04:27:12 2021 +0530

    fix (anomaly): fixed anomaly drilldown view

[33mcommit 740232e50c150ab9c4cae3a4cf896d3d979126d8[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Aug 30 04:24:56 2021 +0530

    fix (anomaly): get_anomaly_df now accepts last date in db

[33mcommit c8ebb31ac421da44128412111778415c815c9d35[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Aug 30 04:23:46 2021 +0530

    fix (anomaly): get last date now uses AnomalyDataOutput

[33mcommit 1ca6e46d0030b29af5f795980f1d2894d7c92cd3[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Aug 30 04:22:39 2021 +0530

    fix (anomaly): views now use AnomalyDataOutput

[33mcommit 937bdb5d70cd4cc207590c844358503d863ee3f9[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Aug 30 04:20:35 2021 +0530

    update (anomaly): updated output table schema

[33mcommit c60b4d00afe2d744438c8af86f843432815bdfbd[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Sat Aug 28 09:50:09 2021 +0530

    fix(anomaly): no last_date fix for prophet and stddevi models

[33mcommit 7554701fe8f016694271881d4ce320701e7f3f19[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Aug 26 21:08:32 2021 +0530

    fix: set the default dataset type as the table

[33mcommit 463ccb0b252123ffd28241a6bab187fd4b8dc540[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Aug 26 20:46:39 2021 +0530

    fix: issue in the kpi post api and redirect from the home

[33mcommit 62f31aceb1989aaf2755f7d1e0647c6a7ca3b841[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Thu Aug 26 19:25:23 2021 +0530

    kpi form datasource type to name changed and ui fixes (#114)

[33mcommit 51cfcff43ac5c089262bfacb145dce22cdc9a403[m
Merge: 71b7907 67c4aea
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Aug 26 17:40:25 2021 +0530

    Merge branch 'anomaly-refactor' of https://github.com/chaos-genius/chaos_genius into anomaly-refactor

[33mcommit 71b7907a1eeeac92595657a6f7f18926562fb2b2[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Thu Aug 26 17:40:13 2021 +0530

    fix (anomaly): added case for no last_date

[33mcommit 86f8c6d890c54f6975e8ab0297d596fd07b01789[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Thu Aug 26 16:19:15 2021 +0530

    fix: New kpi home screen, datasource table action added, ui fixes (#113)
    
    * kpi home screen, ui fixes
    
    * fix:drill down data reset
    
    * fix:changed redux action type
    
    * fix: datasource more actions
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 67c4aea8be60dc997c6b378607027989bc232599[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Thu Aug 26 14:25:53 2021 +0530

    fix(anomaly, datamodel): updated the anomaly data model class to support the new DB schema

[33mcommit 683031e066f82ebd74b152428f5c617a79822289[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Wed Aug 25 18:04:15 2021 +0530

    fix(anomalu, drilldown api): added code for the drilldown api, needs to be tested though

[33mcommit 4d3a36b127c34199e088f611749837bf2cef15a8[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Wed Aug 25 14:59:56 2021 +0530

    fix(anomaly): last_date fix if no preprocessed data

[33mcommit ea43d67ea6a7f8b9ffd45362832a828f5d02eec2[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Aug 25 13:09:18 2021 +0530

    fix: set baseUrl in the env variable

[33mcommit bea931c10e2ddeeeb978b889c631637fe0ebb445[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Aug 25 12:23:56 2021 +0530

    Update url-helper.js

[33mcommit 2ac04f7d76020dfd5bfb16a9ded61712d6f368ec[m
Merge: 9f79830 ec30bd9
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Wed Aug 25 12:17:45 2021 +0530

    Merge pull request #112 from chaos-genius/sb-baseurl
    
    Sb baseurl

[33mcommit ec30bd9e044814c24dbf46dfe60390051c5a92c8[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Aug 25 12:15:11 2021 +0530

    fix: PR reviews changed

[33mcommit 8b374004d9aef5669fe81f352e909c1418ac094f[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Aug 25 12:13:19 2021 +0530

    fix: dimension issues

[33mcommit 9f7983004a527be3ca1799b7d631c0754fbd9668[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Aug 25 12:09:36 2021 +0530

    fix: change the kpi modified and manifest.json file

[33mcommit fd5cacf78cf68c0fe0ade99014eb94a8c4806b13[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Wed Aug 25 11:45:55 2021 +0530

    fix:baseurl and added kpi in url

[33mcommit d345d91e37c40f4375ac9ae3cf13587207bba19c[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Wed Aug 25 10:31:46 2021 +0530

    fix: Dashboard Anomaly, Kpi form header fix (#111)
    
    * fix: anomolies tab
    
    * anomaly ui working
    
    * fix:anomaly graph functional
    
    * fix: anomaly drilldown graph
    
    * fix: dashboard anomaly
    
    * anomaly refactoring
    
    * fix:configure route path in container
    
    * fix: anomaly graph css fixes
    
    * fix: kpi form header issue fixed
    
    * fix:kpi form filter added
    
    * fix:minor fixes
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 6477ae98f7ff14261cb9fddace397dc033ed6a73[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Aug 25 02:52:57 2021 +0530

    fix(anomaly): integration fixes
    
    1. kpi_controller.py now uses AnomalyDetectionController (ADC)
    2. ADC:
      * kpi_info placeholders added
      * get last date now gets from db
      * anomaly output now stored in db
    3. get_anomaly_df added for fetching data
    4. Updated dbUris to local system (will be changed)
    5. Anomaly data view has small fixes

[33mcommit 62e91295ffbf11f0915c7e78bc182c9bf4ee3b03[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Wed Aug 25 00:43:25 2021 +0530

    fix(anomaly): multiple fixes
    
    1. Fixed model to model_name for anomaly_controller
    2. Improved efficiency of subgroup filter logic

[33mcommit bfc700c8e3bb6d92b99db5de43821c712f334b06[m
Author: Fletchersan <amoghdhardiwan@gmail.com>
Date:   Wed Aug 25 00:06:00 2021 +0530

    feat (anomaly): Added prophet and stddevi models

[33mcommit 9dce0daacf544a6d66cf2b2fd4400943d0a6fd7b[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Tue Aug 24 23:54:12 2021 +0530

    refactor (anomaly): Added base code for anomaly

[33mcommit e593e5f6a80b68db36b9ff9dda3bc7348c798947[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Aug 24 13:32:53 2021 +0530

    fix: change the floating point in the dashboard screen

[33mcommit 6783807762a29aaee12a694e8770da7424c012ec[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Aug 24 13:02:32 2021 +0530

    fix: return only the active kpi in api

[33mcommit 4c0fc6a0ce9e7b45aa501f761e31c6df8a988db7[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Mon Aug 23 10:50:41 2021 +0530

    fix: changed material table to custom table for hierarchical  (#110)
    
    * fix: custom table logic
    
    * hierarchical table css fixes
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 6ea72d43a0ae2537066b93136802fee4bf5a1e47[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Aug 21 00:21:19 2021 +0530

    fix: read the cache timeout from the en

[33mcommit 03d53ddcf370c3eff02ed946e165dd10f40c9b9f[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Aug 20 23:57:53 2021 +0530

    fix: change the cache backend

[33mcommit 13392e0d6dffbc48386e3c6b6e8f1882bd4cf1fe[m
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Fri Aug 20 11:26:06 2021 +0530

    fix: dashboard ui fixes & functional fixes (#109)
    
    * fix: dashboard linechart and aggregations stats
    
    * removed comment code
    
    * dashboard dimension and stat card fixes
    
    * dashboard ui fixes
    
    * ui fixes
    
    * fix: hierarchical table
    
    * fix:configure route
    
    * remove configure route
    
    * hierarchical table ui and functional fixes
    
    * ui fixes
    
    * form minor ui fixes
    
    * fix:kpi and datasource table image integrations
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>
    Co-authored-by: Moghan Kumar <moghan@sketchbrahma.com>

[33mcommit 91b58028dd2a1439ccba27ed2054bec3467c3479[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Tue Aug 17 16:27:18 2021 +0530

    fix: datasource type icon, alerts form and alerts image changes (#108)
    
    * datasource type icon fix, alert form changes
    
    * ui fixes
    
    * Updates package lock json
    
    Co-authored-by: Hariharan. K <harinapster007@gmail.com>

[33mcommit 510064bd708b2b3acd967896fe42df2a6cd1c09d[m
Author: Hariharan K <54077683+hariharank696@users.noreply.github.com>
Date:   Tue Aug 17 11:55:41 2021 +0530

    Adds react progress bar package dependency (#107)
    
    Co-authored-by: Hariharan. K <harinapster007@gmail.com>

[33mcommit bf7877d0ca80b2fab4ad0aadbe4b598ab47fb2d7[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Tue Aug 17 11:39:15 2021 +0530

    progressbar fixes (#106)

[33mcommit 66daea69cb90609dece85dae0ad289b9db7b0992[m
Merge: ed78b34 af3fd9b
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Tue Aug 17 09:26:01 2021 +0530

    Merge pull request #105 from chaos-genius/sb-filter
    
    fix: Kpi table filter

[33mcommit af3fd9b4f2cb617019eaad44a8013955471b907b[m
Author: Moghan Kumar <moghan@sketchbrahma.com>
Date:   Tue Aug 17 09:22:20 2021 +0530

    kpi filter and table change

[33mcommit ed78b34b588ec11c87baa77b4f2bcca46fef3675[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Mon Aug 16 19:17:26 2021 +0530

    alerts slack and email form, delete datasource popup, ui fixes (#104)

[33mcommit f46cefb4ff929d146c1af96e0460a833bb339af3[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Mon Aug 16 11:05:10 2021 +0530

    Sb UI fixes (#102)
    
    * Alert screen Ui
    
    * fix:alers table view
    
    * alerts channel configuration and alerts screen ui
    
    * fix: alert table css fixes
    
    * kpi alert form ui
    
    * fix:added eventalert form
    
    * alert form ui
    
    * event alert form
    
    * fix: added alert destination form
    
    * alert ui
    
    * alerts ui
    
    * fix: alerts ui css fixes
    
    * alerts ui
    
    * fix: dashboard changes
    
    * fix: ui fixes
    
    * ui fixes
    
    * table fixex
    
    * ui fixes
    
    * ui fixes
    
    * home page loader
    
    * select fixes
    
    * css fixes
    
    * fixes ui
    
    * routes and ui fixes
    
    * ui fixes
    
    * ui fixes
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>
    Co-authored-by: Balasubramani <sketchbrahma@Sketchbrahmas-MacBook-Pro.local>

[33mcommit e8a6f6e990378e8cc8d2dd3d37b38b6f15df82ec[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sat Aug 14 17:37:19 2021 +0530

    fix (rca): Added max parents in hierarchical data

[33mcommit cc3fdb98ff0d009090654f60f4e637f58edcb8ab[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Fri Aug 13 11:29:32 2021 +0530

    Sb UI fixes (#100)
    
    * Alert screen Ui
    
    * fix:alers table view
    
    * alerts channel configuration and alerts screen ui
    
    * fix: alert table css fixes
    
    * kpi alert form ui
    
    * fix:added eventalert form
    
    * alert form ui
    
    * event alert form
    
    * fix: added alert destination form
    
    * alert ui
    
    * alerts ui
    
    * fix: alerts ui css fixes
    
    * alerts ui
    
    * fix: dashboard changes
    
    * fix: ui fixes
    
    * ui fixes
    
    * table fixex
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 34fa21de88a880c76a13e8b6e29ae5ba41c45910[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Aug 13 00:51:40 2021 +0530

    fix: update the column name for data source type

[33mcommit 0243b508d6a323fb881ee0639811b05466017c70[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Aug 13 00:41:13 2021 +0530

    fix: add the column in the kpi list api and fix the kpi count in data source api

[33mcommit c8f8aabceb5fdd059eed65c20c755e737d5e7cd0[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Aug 12 12:01:24 2021 +0530

    fix: activate the analytics by default

[33mcommit b14e20440594995fdc4cbff9e3d80e573798d1da[m
Author: santhosh kumar <santhosh@sketchbrama.com>
Date:   Thu Aug 12 11:47:22 2021 +0530

    resolve-warnings

[33mcommit 62f94112bbd55ccd629ee4de82bc6f967209d60c[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Aug 12 11:47:06 2021 +0530

    fix: minor fixes in these components
    - get the correct df in case of custom query
    - fix the kpi list view api
    - change the integration server issue
    - exceptional handling in rca when the data is empty

[33mcommit 2ed246d6686d9544e17eaa94fb23e7d5517cc186[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Aug 11 02:05:43 2021 +0530

    fix: add the data source details in kpi

[33mcommit 29fe57602da19c7c3f2a7258d7f3a7c613b40e78[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Aug 11 01:36:19 2021 +0530

    feat: static kpi for predefined date range

[33mcommit c25952db9c1630080496de188318123f49d75000[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Tue Aug 10 13:43:54 2021 +0530

    Sb onboarding UI, CSS fixes (#99)
    
    * fix: onboarding page ui flow, css fixes, font family changed
    
    * fix: fav icon
    
    * fix:sidebar fixes
    
    * fix: kpi table ui changes
    
    * fix: kpi table dimension functional
    
    * fix: setup flow changes
    
    * fix:kpi form cursor pointer
    
    * table tooltip added
    
    * fix: kpi list cursor pointer
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 0570f5f234ca86ad65e9a1d9905aa7586870f71a[m
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Mon Aug 9 12:02:45 2021 +0530

    Sb feedback fixes (#96)
    
    * fix: UI Fixes
    
    * fix: filter fixes done
    
    * fix: kpi filter and ui fixes
    
    * fix: overlap option css fixed
    
    Co-authored-by: Moghan Kumar <moghan@sketchbrahma.com>
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit d3f7a76ce9ec2900eb292ae1fc83b36a2988d15b[m
Author: Daj Katal <danykattouf@gemsdaa.net>
Date:   Sat Aug 7 17:59:12 2021 +0400

    Added files for Metabase export to JSON

[33mcommit cc71257c261d794511c13ab63c2584b43ce24766[m
Author: moghankumar06 <87368217+moghankumar06@users.noreply.github.com>
Date:   Fri Aug 6 10:55:50 2021 +0530

    UI fixes, loader, button loader, css fixes (#95)
    
    * fix: dashboard header fixes
    
    * fix: loader, button loader, css fixes
    
    * ui fixes
    
    * UI fixes
    
    Co-authored-by: Hariharan K <54077683+hariharank696@users.noreply.github.com>

[33mcommit 60ed70e9e55901f204c1654669dac3cd96bd2d89[m
Author: Santhoshkumar1023 <87367866+Santhoshkumar1023@users.noreply.github.com>
Date:   Fri Aug 6 10:53:46 2021 +0530

    fix  : added onboarding screen  (#94)
    
    * fix:update datasource order based input box and onboarding setup
    
    * fix: add home screen integrations
    
    * fix: add home card image and minor css fixes
    
    Co-authored-by: santhosh kumar <santhosh@sketchbrama.com>

[33mcommit 4c7a30116749eb67286db87d67fe4659ec8effd0[m
Author: Hariharan. K <harinapster007@gmail.com>
Date:   Wed Aug 4 12:24:56 2021 +0530

    Front end new app setup

[33mcommit e2ded81734997368e81851454b07ae0a05891e16[m
Author: keshprad <32313895+keshprad@users.noreply.github.com>
Date:   Tue Aug 3 20:39:37 2021 -0700

    fix (anomaly plotting): fixed bug where anomalies at end of timerange weren't highlighted #92

[33mcommit a80c58397d20ea5dbb12eea378e2928739bfef86[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Jul 30 14:30:51 2021 +0530

    fix: udpate the destination creation logic

[33mcommit 5fb84e174a0a740e121165005c3e4e35f5e52d59[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Jul 30 13:44:57 2021 +0530

    feat: add the new connector

[33mcommit 1635e1eadd6b377fdfaeaddfe02a494577be487e[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Jul 30 13:37:02 2021 +0530

    update (rca): added day on day comparison from #86

[33mcommit 43986e2176a1a9ec9d32ed0b991d8b4ecfacf812[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Jul 30 13:21:51 2021 +0530

    fix (rca): fixes tooltip and linechart in #86

[33mcommit 1d2f789a7c9e160fedec178e1159b4bed34316f9[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Jul 30 12:45:48 2021 +0530

    update (anomaly): Removed min as mentioned in #86

[33mcommit 6c2707fa603d2dfd503cd1a11c38afe907bf5bde[m
Merge: 1a1944e 3e8e4b2
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Jul 30 12:38:33 2021 +0530

    Merge branch 'main' of github.com:chaos-genius/chaos_genius

[33mcommit 3e8e4b2aa4ea3687dd696447a65f9b849b83a05f[m
Merge: 5622513 41ff152
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Fri Jul 30 08:24:30 2021 +0530

    Merge pull request #75 from chaos-genius/fix#73
    
    Fixed `get_panel_metrics` for categorical cols

[33mcommit 5622513a46f61c8a658447c9fdc31306f1fc5277[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Jul 29 21:25:37 2021 +0530

    fix: update the onboarding message

[33mcommit 08c8ce3769db34a4036a23166fac85063bef4fdd[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Jul 29 21:21:58 2021 +0530

    fix: fix the issue no #89

[33mcommit 1a1944e4c23a47e1864b567686d56fcf672da20d[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 29 19:32:23 2021 +0530

    fix (rca): fixes selection for hierarchical table

[33mcommit 5474bb27f6397ec8efc9c06dabf47494409d728d[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Jul 29 19:19:48 2021 +0530

    fix: add the email column

[33mcommit 82df0b25f4720f4e6db87b238d39153e9a79e2eb[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Jul 29 19:06:44 2021 +0530

    fix: change in the alert

[33mcommit 30817b046d111f0473a550026fcec8a7288fee7c[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Jul 29 12:38:11 2021 +0530

    feat: update the shopify

[33mcommit 4e7839ce7ef819bf756a8b625d429066edfc3beb[m
Merge: 7eb6d10 ad3a5b6
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 29 12:35:59 2021 +0530

    Merge branch 'main' of github.com:chaos-genius/chaos_genius

[33mcommit 7eb6d104e6d5481a98061ccda45cde415e9f48c3[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 29 12:35:53 2021 +0530

    fix (rca): fixed binned column query strings

[33mcommit ad3a5b6e861539abc65b765ebb008ab33bd070aa[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Jul 29 11:23:24 2021 +0530

    feat: add api for alert testing

[33mcommit dd896d54138ce51dd65a4c1ee7062726b385e763[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Jul 29 10:16:59 2021 +0530

    feat: integrate the api for the testing alert

[33mcommit d9f618d4c6d55edcd3926e18e327392da3326a88[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Jul 29 02:40:08 2021 +0530

    feat: add the anomaly alert

[33mcommit e02715d60632d8aa21259b8d9d26f69128309de8[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Jul 28 19:09:22 2021 +0530

    update (rca): increased dimensions depth

[33mcommit ba1f404f40d340102094447a1b91aea3951d7e97[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Jul 28 16:40:30 2021 +0530

    fix (rca): query string and binning

[33mcommit b8c5fb0dbecfc454ba3258d24cd1a16b69f4d932[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Jul 28 16:33:10 2021 +0530

    fix (rca): fix binning in hierarchical table

[33mcommit 4e606b41e5d733dd5e585ceb945daf4f2c39ef08[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Wed Jul 28 13:51:04 2021 +0530

    update (rca): changed logic for rounding numbers

[33mcommit 9fb6050eb343d4d8a16b99c671cfe2281ab95d22[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Jul 28 01:29:00 2021 +0530

    fix: update the cache

[33mcommit 16358e9b85f3ebceaa04f8a965f23508b6298226[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Jul 28 01:18:20 2021 +0530

    fix: use memoize instead of cache

[33mcommit efd3642fc08535a209ac23f1e6224c93003ff22b[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Jul 28 01:03:13 2021 +0530

    feat: add the cache

[33mcommit 3361fa1647c8c51a61c21e97ada70bdfa7732325[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Jul 28 00:54:09 2021 +0530

    update: add the dependency

[33mcommit 69e518093a5254d8e35df47b877fd08c491cf766[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 27 20:18:05 2021 +0530

    fix: remove the dummy data

[33mcommit ae41fbe9005a1da2c6e879393c49af3af3310e95[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 27 20:16:11 2021 +0530

    fix: linting the js code

[33mcommit e6d0d19a477a418a49a14661c272529f29af6598[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 27 20:05:18 2021 +0530

    feat: update the list view

[33mcommit 43cc0e6ce9c9e6e3ce08e2a4796a798f6c5eae0f[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 27 18:44:23 2021 +0530

    fix: remove the console.log

[33mcommit 186f3914927031ba85b125381ee0cb4d0bf0bf13[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Jul 27 17:37:22 2021 +0530

    update (anomaly): Removed hover on CI in graphs

[33mcommit 88be6dd8d9faacfc55048312d27590c7f5c74e3d[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Jul 27 17:36:38 2021 +0530

    update (anomaly): renamed labels in graphs

[33mcommit 2ac32da50b00cdeff52a0a571bfd1f3134be63aa[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Jul 27 16:14:34 2021 +0530

    fix (anomaly): Added detection zone in frontend

[33mcommit f5fdf4cc7bfb0b90830a9cb08e4582142927f822[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Jul 27 15:43:34 2021 +0530

    fix (anomaly): render single graph for overall kpi

[33mcommit c07a9179ee6e995effcc9304db2e1446402a02e4[m
Merge: e0a1b45 995f147
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Jul 27 15:17:00 2021 +0530

    Merge branch 'main' of github.com:chaos-genius/chaos_genius

[33mcommit e0a1b45966338cb57f20c3a2c080f9fa164fb197[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Jul 27 15:16:54 2021 +0530

    fix (anomaly): fixed data model init attr `name`

[33mcommit 995f1478ecd4a935d20aca861e857e0ee05642e9[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 27 14:10:54 2021 +0530

    feat: update the anomaly graph

[33mcommit b048150444d3ca3465114ee54a633144b587464f[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 27 13:13:42 2021 +0530

    fix: remove the static folder from blueprint

[33mcommit 658871782264204a5cc59092b8dc4bccbd8eceda[m
Merge: a15388e c0d9460
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Jul 27 13:11:27 2021 +0530

    Merge branch 'main' of github.com:chaos-genius/chaos_genius

[33mcommit a15388e17fd5cf278f17233d7c93b5e9e45e69b4[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Jul 27 13:11:19 2021 +0530

    update (anomaly): moved from constants to real data

[33mcommit 66fd4860a0ef4046273af549d1feeb7bcd548235[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Jul 27 13:10:39 2021 +0530

    fix (anomaly): fixed base id and overall chart data

[33mcommit c0d946083253f28a6dbe243a426b54e73e088c95[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 27 13:10:26 2021 +0530

    feat: add the commands for the db reinstallation

[33mcommit d8869a76fffb94e53a63f8c294e52f6b0963d757[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 27 12:10:39 2021 +0530

    fix: update the order of the stage in the onboarding flow

[33mcommit bb1d898f2df14f2c746dca38818202c2f31616ba[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 27 12:06:34 2021 +0530

    feat: add the api for the onboarding status

[33mcommit 63729562e54deedcbbee427c9b811e87c6a4986e[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 27 11:17:53 2021 +0530

    update the kpi model

[33mcommit 0bf28e4bf8b21bfdb60bd90b464b30f8ed3891b4[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Jul 27 10:27:17 2021 +0530

    refactor (anomaly): moved into a separate view
    
    Anomaly related routes moved from kpi_view to anomaly_data_view

[33mcommit b4ed154290fae45b142603e64eaf157466a059b9[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Jul 26 23:45:40 2021 +0530

    update (anomaly): outputs now stored in db

[33mcommit 63d0133202e40c6e863bbf1c15925f7b960c1a11[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Mon Jul 26 23:42:38 2021 +0530

    fix (anomaly): Suppresed prophet output, replace importance with severity

[33mcommit adb6f155d86bd18375a63c2bdeb8b0402a2ae81e[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jul 26 22:39:45 2021 +0530

    feat: add the view for the anomaly kpi

[33mcommit 62e92f65b4f9476708268f6afbfd45c6eb69f074[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jul 26 22:32:01 2021 +0530

    feat: update the table for the anomaly data

[33mcommit df391d5972c0d16e5eca45fe210747a946325b56[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jul 26 18:27:41 2021 +0530

    fix: add the last sync and no of kpi column in the API

[33mcommit 05c33ce8c6de4b5ba3f5bb6e89f04f818cef1137[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jul 26 13:20:44 2021 +0530

    feat: add the anomaly data table

[33mcommit 1a98691105a300b3db7824a091f031e731937ca0[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sun Jul 25 00:01:18 2021 +0530

    update (anomaly): Updated flask command logic

[33mcommit f6feb604befd2fccdbd46e90dec9cc133e5de3a3[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sun Jul 25 00:00:13 2021 +0530

    fix (anomaly): Removed cut df, importance and fixed KPI_DATA loading in anomaly

[33mcommit 4f399ace122ba22015a514e4724815bac0413911[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 24 15:49:14 2021 +0530

    update: remove the global package json

[33mcommit f3c2d8975eb27d70e08837a0d0a308bfbbc29091[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 24 15:46:49 2021 +0530

    update: remove the global yarn.lock

[33mcommit 1990861a457628d53de9d4de168ce395fbd7d64a[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 24 15:44:18 2021 +0530

    update: remove the docs from the repo

[33mcommit 73aa12422269240ea88aa68543be6db29329b7bf[m
Merge: ecd515b b72c04c
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 24 13:52:54 2021 +0530

    Merge pull request #81 from chaos-genius/ui-fixes
    
    style: Ui for anomolies, data source and kpi page with side bar added…

[33mcommit ecd515b19e429a8d7c8e35dce145603a79ff77c3[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 24 13:37:16 2021 +0530

    fix: minor changes in the kpi demo data

[33mcommit b72c04c6741e3f5a07cea793ec6298dc46a5616c[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Sat Jul 24 13:22:32 2021 +0530

    fix: constant Url commented

[33mcommit 09632fccef0000c7024fb5a4232b61ac38aa6b91[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Sat Jul 24 13:17:29 2021 +0530

    style: Ui for anomolies, data source and kpi page with side bar added, icons in datasource for autocomplete and table added

[33mcommit 60773addf3090c467ca02d434e89699ccfcea8aa[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 24 13:05:51 2021 +0530

    update: add the anomaly task

[33mcommit bdf93e7c0d8e1fcd85b47427388dea467c7a3b75[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Fri Jul 23 22:28:05 2021 +0530

     feat (anomaly): added functionality to generate dataframes which need to be stored in DB

[33mcommit 7ed339bef389e3ccb49e0f3a7d914f21804e6546[m
Merge: 47293ee 15a9926
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Jul 23 12:22:22 2021 +0530

    Merge pull request #80 from chaos-genius/manassolanki-patch-2
    
    Fix the CI/CD for the docs

[33mcommit 15a992662902b20416d12431a9b21931e1b18b5d[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Jul 23 11:59:06 2021 +0530

    Update introduction.md

[33mcommit 47293eeb3803727ffbc8268faf84d6b805da246c[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Jul 23 11:42:19 2021 +0530

    Update README.md

[33mcommit b7fcd0af7a50785f39754e8aeb5ba59a2e808d24[m
Merge: 83692b1 5e5fc2a
Author: suranah <surana.h@gmail.com>
Date:   Fri Jul 23 11:21:59 2021 +0530

    Merge branch 'main' of https://github.com/chaos-genius/chaos_genius into main

[33mcommit 5e5fc2ab7dd17cd09665d9e34aa16a7061d8adc7[m
Merge: 7152af9 c01ffc8
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Fri Jul 23 10:28:06 2021 +0530

    Merge branch 'main' of https://github.com/chaos-genius/chaos_genius

[33mcommit 7152af9c91357abca99a40b47d575b46543d98aa[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Fri Jul 23 10:28:01 2021 +0530

    fix (anomaly): Updated severity bounds

[33mcommit a4e11ba848876857918abcbd2650f2ad79d8a9c9[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Fri Jul 23 10:27:29 2021 +0530

    update (anomaly): Added severity to final output

[33mcommit 83692b14ded2fe0dd0f8055ccb2077e0cc378418[m
Author: suranah <surana.h@gmail.com>
Date:   Fri Jul 23 09:56:09 2021 +0530

    docs: refactoring documentation #77

[33mcommit c01ffc826cc4ea53cfc8ca6f72043860805c78db[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Jul 22 13:20:01 2021 +0530

    update: add the df function for anomaly

[33mcommit 77ef60ddabb555bc515a856f0f2acc5f78e3ec56[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 22 15:03:18 2021 +0530

    fix (anomaly): Fixed sensitivity calculations

[33mcommit 623a4882233d63012b98b39670c8a441d6a58f9a[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 22 15:00:29 2021 +0530

    fix (anomaly): fixed statsmodels imports

[33mcommit 907f1ba1ab8c9baac32c74b99a31f28a595adaa6[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 22 14:15:56 2021 +0530

    refactor (anomaly): indents, spacing and constants

[33mcommit 21ad7bc9152b1a6b1e414e15cc265aa565bea4f0[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Thu Jul 22 13:16:23 2021 +0530

    feat (sensitivity, anomaly): added feature to allow for computation with varying sensitivity

[33mcommit e07b7b79624e9577e968c906da7e8cf4e414e529[m
Author: keshprad <32313895+keshprad@users.noreply.github.com>
Date:   Wed Jul 21 23:13:54 2021 -0700

    feat (anomaly): calculate severity score based on CI bound

[33mcommit 4282e1fcd7d9b8133583f4a3051032f232968b34[m
Author: keshprad <32313895+keshprad@users.noreply.github.com>
Date:   Wed Jul 21 21:37:08 2021 -0700

    feat: severity plotting implementation

[33mcommit 05955f5590302b8344aed81acc444c643e802af1[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 22 01:36:50 2021 +0530

    fix (kpi): fixed an error for loading certain KPIs
    
    Caused by kpi id not matching its position in the KPI_DATA list

[33mcommit 41ff152f6a1eaaa693c891c4bd962ee1c1e3e2b7[m
Author: keshprad <32313895+keshprad@users.noreply.github.com>
Date:   Wed Jul 21 09:36:13 2021 -0700

    fix: fixed #73 by calculating panel metrics different for categorical col.

[33mcommit 457033537c24e95412bb388447bd7e9e00d56deb[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Wed Jul 21 20:58:56 2021 +0530

    feat (sensitivity, anomaly): added code to compute sensitivity threshold for an anomaly

[33mcommit 479cf4af59dd3fba0a79dbed25719ad63935ccf9[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Jul 21 13:29:54 2021 +0530

    update: add the slack alert webhook

[33mcommit 96d0cc54ecd2902f8f5760328100b7c30f99ce98[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Jul 21 10:54:43 2021 +0530

    comment the KPI

[33mcommit 0c87984cca741afe522a5055ce30b5c7c0401bd5[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Jul 21 10:32:20 2021 +0530

    fix: update the KPI

[33mcommit f9e01846169c12a9e8679bb5fdba53fdfa76e6b8[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Jul 21 10:23:34 2021 +0530

    update: change the demo kpi data

[33mcommit 22998789aa65dcb0f54a780d8627ef900c363606[m
Merge: 74b2111 531e82c
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Jul 21 10:23:04 2021 +0530

    Merge pull request #74 from chaos-genius/anomolies
    
    Anomolies

[33mcommit 531e82c4e2f7fec8a5aecffbfaedd759bdeffa14[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Wed Jul 21 10:17:09 2021 +0530

    Closes: #52

[33mcommit 129d9fbebc66d83df706c7345a071ef323644b7e[m
Merge: 4a20956 74b2111
Author: juzarbhori <mail@codetrappers.com>
Date:   Wed Jul 21 10:13:58 2021 +0530

    fix: Merge conflict resolved

[33mcommit 74b2111ff4149faa3b06b7f34b4c474036d12940[m
Merge: 3e1bcb6 288a66b
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Jul 21 10:13:00 2021 +0530

    Merge pull request #49 from chaos-genius/kpi-datasource
    
    Kpi datasource

[33mcommit 3e1bcb6721fa24fcafbcec3c3599de7f59b1c5ba[m
Author: keshprad <32313895+keshprad@users.noreply.github.com>
Date:   Tue Jul 20 21:42:32 2021 -0700

    fix (sandbox, anomaly): handle null y-vals for exporting ano df to JSON. Added plotting code

[33mcommit 4a209566743b30fddc58cd3aa82c1082250bc2b6[m
Merge: 83ed7c0 fa0facc
Author: juzarbhori <mail@codetrappers.com>
Date:   Wed Jul 21 10:03:56 2021 +0530

    fix: Fixes on anomoly charts nd reverse merged to main branch

[33mcommit e1e2cb598f4967d4265270f3ecd11c505b173e89[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 20 17:59:17 2021 +0530

    add the new branch for the sketchbrahma project

[33mcommit fa0facc56c6d1934424ff0c8d6556cad6ab91f6b[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Tue Jul 20 12:35:43 2021 +0530

    feat (non-distributed arch, anomaly): added code for data quality anomalies

[33mcommit a5c0e02ba6becfb13f1c817d704fe44390f5e6c2[m
Author: keshprad <32313895+keshprad@users.noreply.github.com>
Date:   Mon Jul 19 21:41:59 2021 -0700

    feat (kpi_validation): Use a status bool and msg, finish implementation, and create docstrings #40

[33mcommit 10c024ddebd440433eb74b6307f2cb98a0550623[m
Author: keshprad <32313895+keshprad@users.noreply.github.com>
Date:   Mon Jul 19 21:35:07 2021 -0700

    docs: Finished docstrings for monolithic anomaly file

[33mcommit 52ed1fec42e9dabd50ea04593c94949d4914122f[m
Author: varunp2k <varunp2k@gmail.com>
Date:   Mon Jul 19 10:39:09 2021 +0530

    feat (non-distributed architecture, anomaly): basic code refactoring for the overall KPI and multi-dimensional anomalies

[33mcommit 288a66bb5f4cf90c527cf9ac316eeec347c9b664[m
Merge: 3a26fc6 319777c
Author: juzarbhori <mail@codetrappers.com>
Date:   Sun Jul 18 16:12:06 2021 +0530

    fix: merge conflicts resolved

[33mcommit 3a26fc6a611d9a07df6ca1a7174253651b8fcde4[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Sun Jul 18 16:10:32 2021 +0530

    fix: Git comments resolved

[33mcommit 83ed7c053333501d477bf28aa39ba3f7e2789961[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Sun Jul 18 16:08:28 2021 +0530

    feat: Integrated anomolies with drill down using Highcharts

[33mcommit 319777c71368910b55ba309c5588c3c125671b8a[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 17 17:58:09 2021 +0530

    fix: correct the typo

[33mcommit a65a4ffc30140f388c7a89c8a3c352b165a9ea11[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 17 17:57:09 2021 +0530

    fix: check for the wget

[33mcommit cb0fbc233df321a076dc58cf7ea278ebb008d3e1[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 17 17:54:30 2021 +0530

    fix: macos script start the psql server and correct link for the docker installtion

[33mcommit bcd1bb8bcad74828164bc00b564d8ca5214f4827[m
Merge: 78d740f a2c06bf
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sat Jul 17 11:53:30 2021 +0530

    Merge branch 'main' of https://github.com/chaos-genius/chaos_genius

[33mcommit 78d740fb2ee8db840351265ad00ca6b9417653ad[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sat Jul 17 11:51:22 2021 +0530

    feat (anomaly): added drilldown dummy API

[33mcommit a127005530c3ab511aa49d51615aa4f697530c43[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sat Jul 17 11:50:08 2021 +0530

    chore (anomaly): Updated dummy API values

[33mcommit b8c2663ca4a19b752039f11fa2c3f97b5952b4fc[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Sat Jul 17 11:47:38 2021 +0530

    style: Kpi page Styling completed as per figma

[33mcommit a2c06bf85fb6def54640570fab74251e4ae9eaf5[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 17 11:31:44 2021 +0530

    fix: changes in the macos script

[33mcommit a6c8a0b2239e8c4909c76dd2fd0d2c3559da6498[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 17 10:52:13 2021 +0530

    fix: routing in the KPI

[33mcommit 69e0968bea2655cb01955286c1c8462693a29cdc[m
Author: keshprad <32313895+keshprad@users.noreply.github.com>
Date:   Thu Jul 15 21:51:09 2021 -0700

    feat (sandbox, anomaly/rca): basic KPI validation

[33mcommit d45ad0db5a14702b32716f277136032bc61dbc06[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Fri Jul 16 10:11:28 2021 +0530

    style: Breadcrumb Styling and Stepper styling Done

[33mcommit d5b4aef252fa7dbad7def3523f2597e483d31634[m
Author: Harshit Surana <surana.h@gmail.com>
Date:   Thu Jul 15 21:16:49 2021 +0530

    feat: add CONTRIBUTING.md with git practices #48

[33mcommit aff5ade836c4ca10a0f6e6532496f8fc08286484[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Jul 15 18:14:31 2021 +0530

    add the CORS on the app level

[33mcommit 9a871846fdf58e885bee4d6f742cd5e85da636ae[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 15 13:16:50 2021 +0530

    feat: added dummy anomaly detection outputs

[33mcommit d833c92a18c30c32c20e9fd8b6e4437082c3c619[m
Merge: 87f891c 9d45017
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Jul 15 11:00:35 2021 +0530

    Merge pull request #47 from chaos-genius/new-home
    
    New homepage design

[33mcommit 9d45017174fa6b671d9872e6c3c975efa42ce4aa[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Thu Jul 15 10:37:58 2021 +0530

    New homepage desing

[33mcommit 87f891cf8a7fd32e5c2664986c86aa6acfd411d7[m
Author: keshprad <32313895+keshprad@users.noreply.github.com>
Date:   Wed Jul 14 21:07:39 2021 -0700

    feat (sandbox, frontend): Create highcharts visualization for anomaly detection. #45

[33mcommit f75c532449ab615dead8a9dc59cb6772233d9fdd[m
Merge: 9c57a8b 3e3a2f7
Author: Keshav Pradeep <32313895+keshprad@users.noreply.github.com>
Date:   Wed Jul 14 10:51:23 2021 -0700

    Merge pull request #30 from chaos-genius/fix-query-string
    
    Fix binned query string and update date range selection

[33mcommit 9c57a8b91c06aa69e4403843da787a48e9464395[m
Author: suranah <surana.h@gmail.com>
Date:   Wed Jul 14 21:45:04 2021 +0530

    refactor: adding sandbox for easier iteration #45 #44 #43 #40

[33mcommit e2d403db1d7378a7aead545a151ccc1a1f1e01f6[m
Merge: 19f3a76 4965bd0
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Jul 13 18:53:50 2021 +0530

    Merge branch 'main' of github.com:chaos-genius/chaos_genius into main

[33mcommit 19f3a76e9dacb990a0c837bb34ebf503fcc859e2[m
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Tue Jul 13 18:52:40 2021 +0530

    Added setup script for ubuntu

[33mcommit 4965bd086f93c9d28e9385680f8c1f7ae1c9b052[m
Merge: 7654393 c21b9ec
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 13 16:33:49 2021 +0530

    Merge pull request #32 from chaos-genius/dashboard-ui
    
    Change in frontend UI

[33mcommit 7654393240e628b587985cad49af40815373e1a7[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 13 16:28:29 2021 +0530

    fix: minor fixes
    - fix the integration server constant name
    - add the todo

[33mcommit 4403e5bfc7fb2d7534c426ea0afc816aa7bee1e5[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 13 13:31:07 2021 +0530

    fixes: multiple setup nd frontend related fixes
    - change the env variables for integration server
    - pick the env variable from the env file for the local server and override them
    - remove the print statements
    - use the transformation in the integration server and change the api endpoint for the same
    - frontend rounte to the data source page after successfully submitting the info

[33mcommit c21b9ecd801ad1524a16af98e0a04882d150559a[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Mon Jul 12 23:24:22 2021 +0530

    sidebar css DONE

[33mcommit 18a1d1e245ba8e2957615b7bb240e6b63314bbfd[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jul 12 21:29:07 2021 +0530

    change the env management for integration server

[33mcommit c0a958eaa597f77da3ef5d64c1f21b3fba40276a[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jul 12 20:20:14 2021 +0530

    fix: correct the username

[33mcommit 52612dd1d3bb42e9d8f24517d341224d0c740fd5[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jul 12 19:58:33 2021 +0530

    setup script for the macos

[33mcommit 9d5fd8e6a7204557e621c875d40baaff6d1b56e3[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jul 12 15:34:25 2021 +0530

    wrap the install script for setup

[33mcommit 6d291ba22b67205b87fb24046bf0094249036889[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jul 12 11:17:41 2021 +0530

    minor fix for the workspace id

[33mcommit 3bee16343c8756bf6a189720e9bc59e4c7a12e1b[m
Merge: 32208a0 5995fe9
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sun Jul 11 15:12:12 2021 +0530

    Merge branch 'main' into dashboard-ui
    
    Resolved conflicts between main and dashboard-ui

[33mcommit 3670115d6077d575da7565133e318b973fdc6172[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sun Jul 11 08:30:54 2021 +0530

    db migration along db metadata script

[33mcommit 3e3a2f7759fe3128ba9be62fa81179e01bfdf4dc[m
Author: keshprad <32313895+keshprad@users.noreply.github.com>
Date:   Sat Jul 10 16:53:41 2021 -0700

    Change inclusivity of date range selection

[33mcommit 7d9724e77991e0bbc96b6779cb2afcdeebd9e1a7[m
Author: keshprad <32313895+keshprad@users.noreply.github.com>
Date:   Sat Jul 10 16:42:55 2021 -0700

    select baseline and rca group on week-to-date or month-to-date

[33mcommit 48bc147a84c5f2ba0067a7c8f6377f44c8f3f56a[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sun Jul 11 00:13:08 2021 +0530

    changed format for impact table columns in rca

[33mcommit 32208a00a5e2ffa1e4a3ba2de652436a57960e89[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Sun Jul 11 00:06:37 2021 +0530

    minor fix

[33mcommit 8830b32dd65173bbac679f5f1b41079b4588061a[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Sun Jul 11 00:04:32 2021 +0530

    toggle switch fix

[33mcommit 015f7545169259f98e9573263aab75ae82ce1519[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Sat Jul 10 23:43:19 2021 +0530

    Dashboard UI as per Figma

[33mcommit 5995fe95fc0ea5fc74cd52f9c9c5922427a002ba[m
Merge: 4c9d23e 4b25d26
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Sat Jul 10 23:42:05 2021 +0530

    Merge pull request #29 from chaos-genius/rca-plots-resyle
    
    Recolored waterfall and line charts for rca

[33mcommit 4b25d2687c93177e6eda36ced3a7075bfcceb2be[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sat Jul 10 23:38:17 2021 +0530

    Recolored waterfall and line charts for rca

[33mcommit 4c9d23efcfdf01ecd640183fc3872f25d3362d6d[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sat Jul 10 23:11:08 2021 +0530

    Added column name mapping for impact table in RCA

[33mcommit dfcf5dcef35684ce15039ec864ac4f07fea0c641[m
Author: keshprad <32313895+keshprad@users.noreply.github.com>
Date:   Sat Jul 10 09:52:40 2021 -0700

    fixed col name for RCA string query for non-cat sub-dims

[33mcommit 8e68d3248fca1c8176f1e6d54badb00e49acf475[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 10 09:30:55 2021 +0530

    restructure the integration codebase

[33mcommit 9fb01f4a211e331d56eeb9958efe285cb9348557[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 10 08:50:35 2021 +0530

    wrap the kpi frontend

[33mcommit 592145e42ba0b8c85b935a801e7d5184ea7919b1[m
Author: suranah <surana.h@gmail.com>
Date:   Sat Jul 10 15:01:55 2021 +0530

    feat: adding UX flourishes to the installation script

[33mcommit f10bc09e6193af277cf2b43e72e31cadabf49b7b[m
Author: suranah <surana.h@gmail.com>
Date:   Sat Jul 10 14:46:37 2021 +0530

    feat: adding full dependency checks & formatting for setup

[33mcommit 34b00dac2bedd7683ebcd3233d26e8cbd972b857[m
Merge: f71b215 fb480cc
Author: suranah <surana.h@gmail.com>
Date:   Sat Jul 10 10:43:43 2021 +0530

    Merge branch 'main' of https://github.com/chaos-genius/chaos_genius into main

[33mcommit f71b215fbd86b9e0730d9a96359e52fbebe2db96[m
Author: suranah <surana.h@gmail.com>
Date:   Sat Jul 10 10:43:38 2021 +0530

    feat: adding node & npm dependency checks

[33mcommit fb480cc6be70bf43f9c5daba6d806ad2d31621d2[m
Merge: 3111c11 66200be
Author: juzarbhori <49563636+juzarbhori@users.noreply.github.com>
Date:   Sat Jul 10 10:42:02 2021 +0530

    Merge pull request #27 from chaos-genius/dashboard-new
    
    Dashboard new

[33mcommit 66200bea32bf518a621981cad2a9d7f4e7987f15[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Sat Jul 10 10:37:21 2021 +0530

    Chaged the route to the main dashboard page

[33mcommit 889e3244481a46121949a8979df3e9d4e91d5304[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Fri Jul 9 22:57:46 2021 +0530

    Waterfall and Table for Both multidimension and single dimension,Dynamic Active of side bar Done

[33mcommit 3111c117ff64778c6251b0491a646c1583f8f59b[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Fri Jul 9 22:47:36 2021 +0530

    Removed total_data_points from chart_data in rca

[33mcommit 238bb039494a30a4049cb70ed059b185050a1b29[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Fri Jul 9 22:45:28 2021 +0530

    Updated chart_table with correct keys in rca

[33mcommit 91a0c62f2a10458f42c92b7ef673479c7184b31b[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Fri Jul 9 17:52:21 2021 +0530

    renamed values keys for KPI line data in rca

[33mcommit f0038826b06274f3b901ed5f4f0eec2432552357[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Fri Jul 9 17:36:39 2021 +0530

    fixed kpi line data in rca

[33mcommit dab0b1159d104572b42dd11b9265ac66b7c31268[m
Author: suranah <surana.h@gmail.com>
Date:   Fri Jul 9 15:57:55 2021 +0530

    feat: adding skeleton for setup scripts

[33mcommit 7bd8b72024ff192d3b0eb468a3b173bbdb1b80ac[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Fri Jul 9 14:07:53 2021 +0530

    Component base design for dashboard done

[33mcommit 86d2ba86b0c411663766a1006c06b189c1e80485[m
Merge: fccd2eb 24deb80
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 8 23:37:41 2021 +0530

    Merge pull request #26 from chaos-genius/rca-refactor
    
    RCA Refactor

[33mcommit 24deb8092ea7f5b26f1bdc8f50571098383494e4[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 8 23:25:57 2021 +0530

    Updated line data to match amcharts format for rca

[33mcommit eaaaa151a79d3ff3f47567230ec252b7d70e49b7[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 8 18:09:16 2021 +0530

    Added count as a supported aggregation in rca

[33mcommit 34724f25d001caf5e70d9b5bd247b9aa9aab7365[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 8 18:00:35 2021 +0530

    formatted rca library code

[33mcommit c1472f84b2e46f389857744d807550d981fb71ca[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 8 17:58:00 2021 +0530

    updated hierarchical table api for rca

[33mcommit 5c857e517a9ff63f8260da535c9ed1eef138fc81[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 8 17:55:42 2021 +0530

    Added heirarchical table for RCA

[33mcommit ced845548015ab49e73a214b8da491fae658c86f[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Jul 8 13:49:35 2021 +0530

    Updated RCA with refactor

[33mcommit f8587956c9d4f543d971cd86bdd8b8a1ab5df2ce[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Wed Jul 7 22:57:18 2021 +0530

    Data source page Seperated

[33mcommit 5d846ff51aa45e2988bc121b5351e00d0327510f[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Wed Jul 7 14:18:18 2021 +0530

    Breadcrumb added, Stepper added for add screens

[33mcommit fccd2ebbad19aa79ae4b432575ef9df02ca51a84[m
Merge: 9df4d36 de195b5
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 6 16:36:08 2021 +0530

    Merge pull request #23 from chaos-genius/loaders
    
    Loaders added in datasource page

[33mcommit 9df4d3685c0c14ce8843df324deb26884273f261[m
Merge: 689a813 7b130f6
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jul 6 16:34:09 2021 +0530

    Merge pull request #22 from chaos-genius/kpi-explorer
    
    KPI list page and add page seperated

[33mcommit de195b590bdc154c06b51b95f417f50dec4210b8[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Mon Jul 5 17:52:53 2021 +0530

    minor fixes

[33mcommit 22f4025476626b00fe719ece75779092d67f8bbb[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Mon Jul 5 17:49:47 2021 +0530

    Loaders added in datasource page

[33mcommit 7b130f66edc134785fdf626534c2c4a09cbab0de[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Sat Jul 3 14:06:34 2021 +0530

    KPI list page and add page seperated

[33mcommit 689a813f294b108e0cebb92e9efa60a4b598a8a6[m
Merge: 64982b1 c086a86
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 3 09:47:11 2021 +0530

    Merge pull request #21 from chaos-genius/kpi
    
    Kpi

[33mcommit c086a86331e39a817c4d951fb2b962f9f87d4a44[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Sat Jul 3 09:37:38 2021 +0530

    localhost url commented

[33mcommit 5fe9027bbcd22073504478500b24583b375a8fcc[m
Merge: 3747a87 c48a15b
Author: juzarbhori <mail@codetrappers.com>
Date:   Sat Jul 3 09:36:45 2021 +0530

    KPI changes merge conflits resolved

[33mcommit 64982b1cb67d5bc65a3a2c1682a074be9aa64d03[m
Merge: 5344305 c48a15b
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 3 09:29:45 2021 +0530

    Merge pull request #20 from chaos-genius/changes
    
    logs card collapsible, Success Card Done,Warnings for autocomplete re…

[33mcommit c48a15b7bd72e4ec629253775c939214ca155c1f[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Sat Jul 3 09:24:16 2021 +0530

    logs card collapsible, Success Card Done,Warnings for autocomplete removed

[33mcommit 5344305e711563af22bdb78eb9a4b2d0a3e1ee2e[m
Merge: 7f3afa0 e6108cf
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 3 09:18:21 2021 +0530

    Merge pull request #19 from chaos-genius/revert-18-kpi
    
    Revert "updated KPI UI"

[33mcommit e6108cfb7315f42c21fabc5d2f5be2404a5fb11c[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 3 09:18:01 2021 +0530

    Revert "updated KPI UI"

[33mcommit 7f3afa051a1acfa2a1db06e1624809c21303eee8[m
Merge: 20baeab 3747a87
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jul 3 09:11:49 2021 +0530

    Merge pull request #18 from chaos-genius/kpi
    
    updated KPI UI

[33mcommit 20baeab9b0daa5f3f9b048e52974c0e13ea35063[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Jul 2 19:20:26 2021 +0530

    commit: data source changes

[33mcommit cea59edf9d86c8fa95330c8639912a9a9868beff[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Jul 2 18:53:51 2021 +0530

    fix: update the warning message

[33mcommit 3747a87092e4da139f9e45e0ef4b54f35b2fcdbe[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Fri Jul 2 15:01:34 2021 +0530

    kpi UI

[33mcommit 3f137a6edbdd83f4ed697776269aaa16fcf166b1[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Jul 2 13:48:14 2021 +0530

    fix: frontend changes in the data source component

[33mcommit 77d1a902fed51f4e844727119a815bd591a3e75f[m
Merge: 9edffd0 b5c4556
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 29 18:21:58 2021 +0530

    Merge pull request #16 from chaos-genius/delete-connection
    
    delete API integrated

[33mcommit b5c45565c978994d8d38b5adff7185bfd9bd82b0[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Tue Jun 29 18:08:23 2021 +0530

    delete API integrated

[33mcommit 9edffd05e19901036ae997904f0f74bf3e9618dd[m
Merge: bb83eeb 900fafa
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 29 13:21:16 2021 +0530

    Merge pull request #15 from chaos-genius/data-source
    
    Data source

[33mcommit bb83eebb7ed6821c78c63db243075452a2cb0422[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 29 13:20:37 2021 +0530

    add the delete api endpoint

[33mcommit 900fafa5d0488ce8528004d1aa65f5bf2c79244d[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Tue Jun 29 11:34:22 2021 +0530

    Create API integrated

[33mcommit dd242a6767345c90c6837be6e97ff8de4f5d167a[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 29 11:20:30 2021 +0530

    add the logs and fix the template

[33mcommit dc933799b06a0767ee1f4e49251417053fc0f058[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 29 11:09:48 2021 +0530

    fix: change the route name

[33mcommit b3445069083907e64231a09a42c954d91378c579[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 29 08:47:44 2021 +0530

    fix: change the naming

[33mcommit a0cec4628658bebf6fda545ad2cbae142fbd584c[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jun 28 19:27:21 2021 +0530

    fix the typo

[33mcommit 56ccdab5d03491214905350c9071e36bcd10e012[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jun 28 19:17:10 2021 +0530

    update the db migration

[33mcommit 79ae538ee3623e80d62b155fc3565859ebeb4154[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jun 28 19:04:35 2021 +0530

    fix: rename connection to data source

[33mcommit ada223bc848226f6fd3d995b3517cc113ae5cc49[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jun 28 18:39:52 2021 +0530

    feat: wrap the third party

[33mcommit 1357a536ce5631c429ff11d0da5faa2551e5df6d[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jun 28 16:45:40 2021 +0530

    fix: change the names

[33mcommit 65bdda86d263c2e439461680fffc94df689ab0be[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jun 28 15:25:00 2021 +0530

    fix the typo

[33mcommit 0ef3f67fbb4dd057d0f1965400a6937c16031a32[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jun 28 15:21:30 2021 +0530

    add the cors in the connection blueprint

[33mcommit 0bb9fb58b82ff404ae0f4e1a88ecc0277145e060[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jun 28 15:13:43 2021 +0530

    create request

[33mcommit 51e44fee2e49c9b876aa7cc232dac5c22a1b7266[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon Jun 28 15:01:19 2021 +0530

    add the connection creation api

[33mcommit 011a35f803cb620eb96524757a2c35879fb26029[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Sun Jun 27 12:08:40 2021 +0530

    test connection api integrated

[33mcommit 98fa8b2ca035f9fd6ea09b146baf9575511b5302[m
Merge: c284eac 10c3e0f
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jun 26 11:29:06 2021 +0530

    Merge pull request #14 from chaos-genius/third-party
    
    Integrate the third party connector

[33mcommit 10c3e0f42fcabc24d3a49e7cdc3c7fb9d158afb3[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jun 26 11:27:57 2021 +0530

    rename the env file

[33mcommit 2cad869bae37d93a29643d8402925201fc8a9b0a[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Sat Jun 26 09:39:05 2021 +0530

    Validation with check box and number fields

[33mcommit 4dec291dd28ebf3f60f68b1e45f8fb254deb47d3[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Thu Jun 24 09:55:49 2021 +0530

    formdata with validation done

[33mcommit 4bf39228146c0c81da85876bc6f98b4689eab814[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu Jun 24 09:22:09 2021 +0530

    feat: first cut third party integration

[33mcommit fe3cfe78a1e958cb063dc3e4a97fdb5e0d1711db[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Wed Jun 23 15:15:23 2021 +0530

    Dynamic Text fields Done

[33mcommit c284eaccf039e0f532e3085a6d9079b30a60bd9f[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 22 01:19:46 2021 +0530

    fix: change in the base template for docs

[33mcommit 4a686408fcf18cb8b8b3db2c099065e5ce4e4e4b[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 22 00:26:26 2021 +0530

    feat: add the docs

[33mcommit 488abcc9185a39c0ae76d38ef96a4168b00e8947[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Mon Jun 21 18:07:45 2021 +0530

    Inidvidual loaders added

[33mcommit 41ab99b738ccaf389fa07e3f8641af2037305867[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Mon Jun 21 10:46:51 2021 +0530

    [fix] Resolves ZeroDivisionError in #12

[33mcommit 3665698cdd73ad6d9bebddd0a9c0371bc96d4dd7[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Mon Jun 21 10:44:02 2021 +0530

    [fix] Resolves #11

[33mcommit bb5bf96c7332990eb635a939cde66d37f35c1500[m
Merge: 70d958d 993bbb0
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Jun 11 19:46:28 2021 +0530

    Merge pull request #6 from Mayhem-Data/data-source-api
    
    Data source api

[33mcommit 993bbb06e321cdffa1189c22c8b6485b82e0f6b1[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Fri Jun 11 19:37:01 2021 +0530

    minor fix on kpi change

[33mcommit cb79443f51399bc07be3caa3401ea72d63672dbb[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Fri Jun 11 19:25:43 2021 +0530

    Nested Data table Done

[33mcommit 70d958d81919683f2c9cfbec95004f459c20714e[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Fri Jun 11 17:27:29 2021 +0530

    added metric aggregation in kpi view and ecom dataset

[33mcommit 0d58db110509522c7575c02f916f18f8f7f9e62e[m
Merge: 3c112c0 d436377
Author: juzarbhori <mail@codetrappers.com>
Date:   Fri Jun 11 11:02:07 2021 +0530

    merged conflics resolved

[33mcommit 3c112c048694e96e6a295334726bce5f9c2b14c6[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Fri Jun 11 11:01:00 2021 +0530

    empty data if kpi is 0

[33mcommit d436377b5f7a85bd3cfc9a424eed74b611c66be5[m
Merge: bb4fe57 fd4b3cb
Author: Kartikay Bagla <kartikaybagla@gmail.com>
Date:   Thu Jun 10 18:58:36 2021 +0530

    Merge pull request #7 from Mayhem-Data/dimension-change
    
    dimension change done

[33mcommit fd4b3cb82067498c0c0d4998cc2a2dd1e36068e3[m
Author: juzarbhori <mail@codetrappers.com>
Date:   Thu Jun 10 18:38:13 2021 +0530

    dimension change done

[33mcommit bb4fe57d426dd500ff5eeb378a1a5a1a09bb7737[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Jun 10 17:58:32 2021 +0530

    renamed dimensions to dimension in rca api

[33mcommit 68bae9fa78481e5e5c0181e1357b95e6ccb97c41[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Jun 10 17:39:32 2021 +0530

    added impact threshold in hierarchichal table

[33mcommit b4fd3b022c07fa7cc9fc7a568ecb87d21edf3986[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Thu Jun 10 15:11:59 2021 +0530

    added hierarchical table, sum agg and bins in rca

[33mcommit b805bc6d41cc908d54f915239c13c727e5b2d1bb[m
Author: Code Trappers <mail@codetrappers.com>
Date:   Thu Jun 10 14:11:32 2021 +0530

    Datasource integration done

[33mcommit cd93385a2f7549e3d7bb6b93d9a94afdb9bf2219[m
Author: Code Trappers <mail@codetrappers.com>
Date:   Wed Jun 9 12:21:39 2021 +0530

    Dashboard minor fixes done

[33mcommit 6c39c18482e217aef2c5ec6bae0515e97be052e6[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Jun 9 10:46:03 2021 +0530

    add the connection type in the connection post request

[33mcommit 56cd80d939235e6978024b8840bb8646951047dd[m
Merge: d26200e a8db923
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 8 15:22:11 2021 +0530

    Merge pull request #5 from Mayhem-Data/chart-render
    
    Chart render

[33mcommit a8db923cd1444cdf976e1d10a3111a3c7e95c9ee[m
Merge: 825f372 d26200e
Author: Code Trappers <mail@codetrappers.com>
Date:   Tue Jun 8 13:31:40 2021 +0530

    minor content added in chart and tab

[33mcommit 825f372f53acefc56cb7966417a7bc10ef46eada[m
Author: Code Trappers <mail@codetrappers.com>
Date:   Tue Jun 8 13:17:06 2021 +0530

    Tab UI done and added multidimension key

[33mcommit 8a28dbd6742cd12d3db5da6ed11775ae9442d102[m
Author: Code Trappers <mail@codetrappers.com>
Date:   Tue Jun 8 09:56:04 2021 +0530

    chart with single dimension tab done

[33mcommit d26200e9562f57a5e389aa5103cbfdcda40d7c5d[m
Merge: 160a867 72701f5
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jun 5 19:04:22 2021 +0530

    Merge pull request #4 from Mayhem-Data/minor-fix
    
    minor fix issue oncard rendering

[33mcommit 72701f52506d509a39eef9024388f89897270c12[m
Author: Code Trappers <mail@codetrappers.com>
Date:   Sat Jun 5 19:01:47 2021 +0530

    minor fix issue oncard rendering

[33mcommit 160a867b615e67d4544c875a4a12c24acbffdeda[m
Merge: 322bd6c 4906022
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jun 5 18:46:32 2021 +0530

    Merge pull request #3 from Mayhem-Data/minor-fixes
    
    Minor fixes

[33mcommit 4906022e29965de32d0b14be57a3bc06d24df76b[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jun 5 18:46:19 2021 +0530

    Update Housing.js

[33mcommit f8f6ad3ba2c1635bb048d12c392d9b87dffd40e6[m
Merge: 04c3cde 322bd6c
Author: Code Trappers <mail@codetrappers.com>
Date:   Sat Jun 5 18:41:19 2021 +0530

    main branch merged

[33mcommit 04c3cde6c40b25a4fbabf9d73a8d2c8e6233f8e7[m
Author: Code Trappers <mail@codetrappers.com>
Date:   Sat Jun 5 18:40:54 2021 +0530

    minor fixes on chart and card for kpi name

[33mcommit 322bd6c5f84e2421bfbb0f006bff2579e1623fd1[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jun 5 18:16:22 2021 +0530

    fix: add the node dependancy in the correct package.json and fix the chart lable

[33mcommit b435ac86430a7a41fced6880b43aa7ce61fdec8d[m
Merge: fe2f0b4 4246654
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jun 5 17:51:39 2021 +0530

    Merge pull request #2 from Mayhem-Data/data-source
    
    Data source

[33mcommit 424665402b928f2114e0a1fe744a46881ce76795[m
Author: Code Trappers <mail@codetrappers.com>
Date:   Sat Jun 5 17:45:13 2021 +0530

    minor fix on chart update

[33mcommit 5a77c0be718d20b0b4d7996254fa0a405f538c8a[m
Author: Code Trappers <mail@codetrappers.com>
Date:   Sat Jun 5 16:58:05 2021 +0530

    Final Integration Done

[33mcommit fe2f0b49a4a4c01493d34c2b3d2d4724ce6d7290[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jun 5 16:20:24 2021 +0530

    add the pymysql for mysql dependancy

[33mcommit 15ead01d353646f685d3116dc09273f973fce3d0[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Sat Jun 5 12:52:20 2021 +0530

    feat: add the kpi data and minor fix after mysql integration

[33mcommit 801f137c4659e1b7bb239266246682a250c466dd[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sat Jun 5 11:56:03 2021 +0530

    updated max grouping in single dimension to 3

[33mcommit 7f689ae33a65c1302076c7521ca4a9c688e11136[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sat Jun 5 11:55:39 2021 +0530

    fixed user_string to string

[33mcommit 716cd1e65eee5915ebdc444d34125fcaa52b5d79[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sat Jun 5 11:49:53 2021 +0530

    renamed "not-null counts" to "not_null_count"

[33mcommit b88fa4a257c1551c674049d4e0af341bae6936ca[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sat Jun 5 11:49:07 2021 +0530

    fixed string formatting issues for rca outputs

[33mcommit 4800c55dd1acee1920de87dafd5762d620a38ec9[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sat Jun 5 11:21:59 2021 +0530

    Added precision argument for rca

[33mcommit e5d87ba4668d7982292a314460bfaf2aa7e0d36b[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Sat Jun 5 11:10:46 2021 +0530

    fix: indexing bug causing wrong overlap calc

[33mcommit c571f66ab4a9c5a3cdc20cbd3c362f58cc7813ea[m
Merge: d07ec91 2ca1f7b
Author: Code Trappers <mail@codetrappers.com>
Date:   Sat Jun 5 09:17:13 2021 +0530

    merged main branch

[33mcommit d07ec91c1186818f9688ef5e2abec3adfb93c513[m
Author: Code Trappers <mail@codetrappers.com>
Date:   Sat Jun 5 09:16:43 2021 +0530

    Integration of Multidiemension done in dashboard

[33mcommit 2ca1f7b92b80c5535ca5881519abe93c4ee0d628[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Fri Jun 4 18:03:04 2021 +0530

    fix spelling of multidimensional

[33mcommit 071a8e6e2f97edf8a01ad57e0e20466f21cdfcfc[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Fri Jun 4 18:01:44 2021 +0530

    added back-compat with dimensions=multidimensional

[33mcommit 909be7a1d73fe69fd723c6c388aabd5bc63e916a[m
Merge: 92977cd c3a5740
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Fri Jun 4 17:38:17 2021 +0530

    Merge branch 'main' of https://github.com/Mayhem-Data/chaos_genius

[33mcommit 92977cd6ea74d98fbdce568450a91ee4730414cd[m
Author: kartikay-bagla <kartikaybagla@gmail.com>
Date:   Fri Jun 4 17:38:13 2021 +0530

    Added kpi aggregations, list of dimensions and single dimension

[33mcommit c3a5740ecf265da9b4232c28b3bc7aae5ad937a9[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Jun 4 17:09:59 2021 +0530

    fix: make the connection type as nullable for easy db migration

[33mcommit 127333b25d3bbc17624eea76a306c0334615be06[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Jun 4 15:17:51 2021 +0530

    fix: fixes for the connection and kpi entity

[33mcommit 3b1aba097089d1ae76a472b77a9cc84c72124aaf[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri Jun 4 11:55:13 2021 +0530

    feat: add the group count and corresponding changes in the table

[33mcommit 341a1e4e92f24bd868fc404b96a6dba9f16923e4[m
Author: Code Trappers <mail@codetrappers.com>
Date:   Thu Jun 3 15:50:51 2021 +0530

    Changes for data asource with material UI

[33mcommit a0974a088c75f125e8bdb34726c03ee5399cf6ae[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Wed Jun 2 11:40:29 2021 +0530

    fix:reset the df index while reading from db

[33mcommit 016ed50dd548d017413612ac155535899f660be2[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 1 20:25:50 2021 +0530

    add the alert and warnings

[33mcommit 76ec6ab2457e934194151f6b515e541cf93c451d[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 1 18:10:11 2021 +0530

    fix the filter issue

[33mcommit 8988c730d9e75ade5909f3eb68608e6919c7344a[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 1 13:58:50 2021 +0530

    fix the ui issues

[33mcommit 706f8ab340d2bd9085596372a76cedb4f3cc482a[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 1 13:57:16 2021 +0530

    fix the end chart issue

[33mcommit c648a99e725d2c388a9835f3319980f8a39c4e50[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 1 12:45:34 2021 +0530

    update the readme and change the syntax for python3.8

[33mcommit 852843fdaffae7010f2add19bfe8f44efbd12089[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Tue Jun 1 11:36:47 2021 +0530

    update the README

[33mcommit ec3d62b2e36d0f9544d2628bc729c45aca8210a2[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon May 31 21:53:42 2021 +0530

    more changes for the compatibility

[33mcommit bd98b1f581038c5105571718bdbc89d1ca8e37bb[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon May 31 21:50:57 2021 +0530

    changes for making the code python 3.8 compatiable

[33mcommit 6744af8fa5a77655a4a9f3099a880bc3652ea912[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon May 31 21:34:37 2021 +0530

    update the core rca function

[33mcommit 96a8d1e8fde9a909e32981cd0617243306da7f45[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Mon May 31 19:35:08 2021 +0530

    wrap the frontend API integration

[33mcommit debeff67d29312e204e7489e897ccd8aaf9d3685[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Fri May 28 19:11:48 2021 +0530

    created the base react web application inside the project

[33mcommit 420078f8faa31e86b5776147c2c9c4f932e85da1[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu May 27 19:24:46 2021 +0530

    change the frontend structure

[33mcommit e64c9d9fd2e986d95cacf9378452e94954e4793a[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu May 27 14:00:59 2021 +0530

    activate the virtualenv

[33mcommit 6b923bb188e0b0725abc5a8b9bfe962e94a376a3[m
Author: Manas Solanki <manassolanki@gmail.com>
Date:   Thu May 27 13:33:38 2021 +0530

    init chaos_genius
