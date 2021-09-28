import json

from datetime import datetime, timedelta
import numpy as np

import pandas as pd

from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.core.rca.root_cause_analysis import RootCauseAnalysis
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.rca_data_model import RcaData, db

TIMELINES = [
    "mom",
    "wow",
    "dod"
]

TIMELINE_NUM_DAYS_MAP = {
    "mom": 30,
    "wow": 7,
    "dod": 1
}

LINE_DATA_TIMESTAMP_FORMAT = '%Y/%m/%d %H:%M:%S'

STATIC_END_DATA_FORMAT = '%Y-%m-%d'


class RootCauseAnalysisController:
    def __init__(self, kpi_info: dict, end_date: datetime = None):
        self.kpi_info = kpi_info

        if end_date is None and self.kpi_info['is_static']:
            end_date = self.kpi_info['static_params'].get("end_date")
            if end_date is not None:
                end_date = datetime.strptime(end_date, STATIC_END_DATA_FORMAT)

        if end_date is None:
            end_date = datetime.today()

        self.end_date = end_date
        self.connection_info = DataSource.get_by_id(kpi_info["data_source"])
        self.connection_info = self.connection_info.as_dict

        self.metric = kpi_info["metric"]
        self.dimensions = kpi_info["dimensions"]
        self.dt_col = kpi_info["datetime_column"]
        self.agg = kpi_info["aggregation"]

        self.num_dim_combs_to_consider = list(
            range(1, min(4, len(kpi_info['dimensions']) + 1)))

    def _load_data(self, timeline="mom", tail: int = None):
        end_dt_obj = datetime.today() if self.end_date is None else self.end_date
        num_days = TIMELINE_NUM_DAYS_MAP[timeline]

        base_dt_obj = end_dt_obj - timedelta(days=2 * num_days)
        mid_dt_obj = end_dt_obj - timedelta(days=num_days)

        base_dt = str(base_dt_obj.date())
        mid_dt = str(mid_dt_obj.date())
        end_dt = str(end_dt_obj.date())

        if self.kpi_info['kpi_type'] == 'table':
            base_df, rca_df = self._get_kpi_table_data(base_dt, mid_dt, end_dt, tail)

        elif self.kpi_info['kpi_type'] == 'query':
            base_df, rca_df = self._get_kpi_query_data(
                end_dt_obj, base_dt_obj, mid_dt_obj, tail)

        return base_df, rca_df

    def _get_kpi_query_data(self, end_dt_obj, base_dt_obj, mid_dt_obj, tail: int = None):
        # TODO: Fix hack to insert tail in query
        query = self.kpi_info['kpi_query']
        if tail is not None:
            limit_query = f" limit {tail} "
            query = query.split(";")
            query[0] += limit_query
            query = ";".join(query)

        query_df = get_df_from_db_uri(
            self.connection_info["db_uri"], query)
        query_df[self.dt_col] = pd.to_datetime(query_df[self.dt_col])
        base_df = query_df[(query_df[self.dt_col] > base_dt_obj) & (
            query_df[self.dt_col] <= mid_dt_obj)]
        rca_df = query_df[(query_df[self.dt_col] > mid_dt_obj)
                          & (query_df[self.dt_col] <= end_dt_obj)]

        return base_df, rca_df

    def _get_kpi_table_data(self, base_dt, mid_dt, end_dt, tail: int = None):
        indentifier = ''
        if self.connection_info["connection_type"] == "mysql":
            indentifier = '`'
        elif self.connection_info["connection_type"] == "postgresql":
            indentifier = '"'

        base_filter = f" where {indentifier}{self.dt_col}{indentifier} > '{base_dt}' and {indentifier}{self.dt_col}{indentifier} <= '{mid_dt}' "
        rca_filter = f" where {indentifier}{self.dt_col}{indentifier} > '{mid_dt}' and {indentifier}{self.dt_col}{indentifier}<= '{end_dt}' "

        kpi_filters = self.kpi_info['filters']
        kpi_filters_query = " "
        if kpi_filters:
            kpi_filters_query = " "
            for key, values in kpi_filters.items():
                if values:
                    # TODO: Bad Hack to remove the last comma, fix it
                    values_str = str(tuple(values))
                    values_str = values_str[:-2] + ')'
                    kpi_filters_query += f" and {indentifier}{key}{indentifier} in {values_str}"

        base_query = f"select * from {self.kpi_info['table_name']} {base_filter} {kpi_filters_query} "
        rca_query = f"select * from {self.kpi_info['table_name']} {rca_filter} {kpi_filters_query} "

        if tail is not None:
            limit_query = f" limit {tail} "
            base_query += limit_query
            rca_query += limit_query

        base_df = get_df_from_db_uri(
            self.connection_info["db_uri"], base_query)
        rca_df = get_df_from_db_uri(self.connection_info["db_uri"], rca_query)

        return base_df, rca_df

    def _output_to_row(self,
                       data_type,
                       data,
                       timeline="mom",
                       dimension=None
                       ):
        return {
            "kpi_id": self.kpi_info["id"],
            "end_date": self.end_date.date(),
            "data_type": data_type,
            "timeline": timeline,
            "dimension": dimension,
            "data": json.dumps(data)
        }

    def _get_line_data(self, timeline="mom"):
        _, rca_df = self._load_data(timeline)
        rca_df = rca_df.resample("D", on=self.dt_col)\
            .agg({self.metric: self.agg}).reset_index()
        rca_df = rca_df.round(self.kpi_info.get("metric_precision", 3))

        rca_df[self.dt_col] = rca_df[self.dt_col].dt\
            .strftime(LINE_DATA_TIMESTAMP_FORMAT)

        rca_df = rca_df.rename(columns={
            self.dt_col: "date",
            self.metric: "value"
        })

        return rca_df.to_dict(orient="records")

    def _load_rca_obj(self, timeline):
        base_df, rca_df = self._load_data(timeline)
        return RootCauseAnalysis(
            base_df, rca_df,
            dims=self.dimensions,
            metric=self.metric,
            agg=self.agg,
            num_dim_combs_to_consider=self.num_dim_combs_to_consider,
            precision=self.kpi_info.get("metric_precision", 3),
        )

    def _get_aggregation(self, rca):
        panel_metrics = rca.get_panel_metrics()

        return {
            "panel_metrics": panel_metrics,
            "line_chart_data": [],
            "insights": []
        }

    def _process_rca_output(self, impact_table):
        rename_dict = {
            'string': "subgroup",
            "size_g1": "g1_size",
            "val_g1": "g1_agg",
            "count_g1": "g1_count",
            "size_g2": "g2_size",
            "val_g2": "g2_agg",
            "count_g2": "g2_count",
            "impact": "impact",
            "id": "id",
            "parentId": "parentId",
        }
        df = pd.DataFrame(impact_table).rename(columns=rename_dict)
        df = df.drop(set(df.columns) - set(rename_dict.values()), axis=1)
        df = df.fillna(np.nan).replace([np.nan], [None])
        return df.to_dict(orient="records")

    def _get_rca(self, rca, dimension=None, timeline="mom"):
        impact_table, impact_table_col_map = rca.get_impact_rows_with_columns(
            dimension, timeline)
        impact_table = self._process_rca_output(impact_table)

        waterfall_table = rca.get_waterfall_table_rows(dimension)
        waterfall_data, y_axis_lim = rca.get_waterfall_plot_data(dimension)

        return {
            "data_table": impact_table,
            "data_columns": impact_table_col_map,
            "chart": {
                "chart_table": waterfall_table,
                "chart_data": waterfall_data,
                "y_axis_lim": y_axis_lim
            }
        }

    def _get_htable(self, rca, dimension=None):
        htable = rca.get_hierarchical_table(dimension)
        return {
            'data_table': self._process_rca_output(htable)
        }

    def compute(self):  # sourcery skip: merge-list-append
        output = []

        # Line Data
        line_data = self._get_line_data()
        output.append(self._output_to_row("line", line_data))

        for timeline in TIMELINES:
            # Get RCA Object
            rca = self._load_rca_obj(timeline)

            try:
                # Aggregations
                agg_data = self._get_aggregation(rca)
                output.append(self._output_to_row("agg", agg_data, timeline))
            except:
                print(f"Error in agg for {timeline}. Skipping timeline.")
                continue

            dims = [None] + self.dimensions
            for dim in dims:
                # RCA
                try:
                    rca_data = self._get_rca(rca, dim, timeline)
                    output.append(
                        self._output_to_row("rca", rca_data, timeline, dim))
                except:
                    print(f"Error in RCA for {timeline, dim}")
                # Hierarchical Table
                if dim is not None:
                    try:
                        htable_data = self._get_htable(rca, dim)
                        output.append(
                            self._output_to_row("htable", htable_data, timeline, dim))
                    except:
                        print(f"Error in htable for {timeline, dim}")

        # Store Output
        output = pd.DataFrame(output)
        output["created_at"] = datetime.now()
        output.to_sql(RcaData.__tablename__, db.engine, if_exists="append", index= False)
