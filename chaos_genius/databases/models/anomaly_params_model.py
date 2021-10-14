"""Schema for anomaly params field of Kpi."""

from typing import Any, Dict, Optional, Tuple, cast

from marshmallow import EXCLUDE, fields, pre_load, validates
from marshmallow.exceptions import ValidationError
from sqlalchemy.orm.attributes import flag_modified

from chaos_genius.core.anomaly.constants import MODEL_NAME_MAPPING
from chaos_genius.databases.base_model import BaseSchema
from chaos_genius.databases.models.kpi_model import Kpi


class AnomalyParamsSchema(BaseSchema):
    """Schema for the anomaly params field of Kpi."""

    # different names of certain fields
    # the format is: alias -> original name
    _aliases = {"period": "anomaly_period", "ts_frequency": "frequency"}

    # valid values for fields
    _valid_model_names = MODEL_NAME_MAPPING
    _valid_sensitivity = {
        "high": "High",
        "medium": "Medium",
        "low": "Low",
    }
    _valid_seasonality = {
        "M": "Monthly",
        "W": "Weekly",
        "D": "Daily",
    }
    _valid_frequency = {
        "D": "Daily",
        "H": "Hourly",
    }

    anomaly_period = fields.Integer(
        default=None,
        missing=None,
    )
    model_name = fields.String(
        default=None,
        missing=None,
        validate=BaseSchema._validate_oneof_maker(_valid_model_names.keys()),
    )
    sensitivity = fields.String(
        default=None,
        missing=None,
        validate=BaseSchema._validate_oneof_maker(_valid_sensitivity.keys()),
    )
    seasonality = fields.List(
        fields.String(),
        default=lambda: [],
        missing=lambda: [],
    )
    frequency = fields.String(
        default=None,
        missing=None,
        validate=BaseSchema._validate_oneof_maker(_valid_frequency.keys()),
    )

    @pre_load
    def _preprocess_sensitivity(self, in_data: dict, **kwargs):
        in_data["sensitivity"] = in_data["sensitivity"].lower()
        return in_data

    _validate_seasonality_individual = staticmethod(
        BaseSchema._validate_oneof_maker(_valid_seasonality.keys())
    )

    @validates("seasonality")
    def _validate_seasonality(self, values: list):
        for val in values:
            self._validate_seasonality_individual(val)


anomaly_params_schema = AnomalyParamsSchema()


class AnomalyParamsAPISchema(AnomalyParamsSchema):
    """Schema for API response/request of anomaly-params."""

    _valid_scheduler_frequency = {"D": "Daily"}

    scheduler_params_time = fields.String(default="11:00:00", missing="11:00:00")
    scheduler_frequency = fields.String(
        default="D",
        missing="D",
        validator=BaseSchema._validate_oneof_maker(_valid_scheduler_frequency.keys()),
    )

    @validates("scheduler_params_time")
    def _validate_scheduler_time(self, time: str):
        times = time.split(":")

        err_msg = "time must be in the format HH:MM:SS"

        if len(times) != 3:
            raise ValidationError(f"{err_msg}. Got: {time}")

        hour, minute, second = times

        if not hour.isdigit() or not minute.isdigit() or not second.isdigit():
            raise ValidationError(
                f"hour, minute, second must be numbers. Got: {hour}, {minute}, {second}"
            )

        hour = int(hour)

        if hour < 0 or hour > 23:
            raise ValidationError(
                f"hour must be between 0 and 23 (inclusive). Got: {hour}"
            )

        minute, second = int(minute), int(second)

        if minute < 0 or minute > 60:
            raise ValidationError(
                f"minute must be between 0 and 60 (inclusive). Got: {minute}"
            )

        if second < 0 or second > 60:
            raise ValidationError(
                f"second must be between 0 and 60 (inclusive). Got: {second}"
            )

    def load_from_kpi(self, kpi: Kpi, validate=False):
        """Load anomaly params from given Kpi object."""
        data: dict = kpi.anomaly_params or {}
        data.update(kpi.scheduler_params or {})

        if not validate:
            return self.dump(data)
        else:
            processed = self.load(data, partial=True, unknown=EXCLUDE)
            return self.dump(processed)

    def field_is_editable(self, field_name: str):
        """Return whether the given field is editable after 1st-time setup."""
        for field in self._meta_info["fields"]:
            if field["name"] == field_name:
                return field["is_editable"]

        return False

    def update_anomaly_params(
        self,
        kpi: Kpi,
        new_anomaly_params: Dict[str, Any],
        run_anomaly=True,
        check_editable=False,
    ) -> Tuple[str, Kpi]:
        """Update anomaly_params for the kpi with the given *partial* *validated* anomaly parameters.

        The new_anomaly_params must be validated using validate_partial_anomaly_params.

        run_anomaly is also set to True in the Kpi table, by default.

        If check_editable is set to True, only the editable fields are allowed to be updated.
        """
        fields = set(self.fields.keys())

        anomaly_params: dict = kpi.anomaly_params or {}

        def is_editable(field_name: str, old_val, new_val):
            if not check_editable:
                return ""

            if not self.field_is_editable(field_name):
                if old_val != new_val:
                    return f"{field_name} is not editable. Old value: {old_val}, New value: {new_val}"

            return ""

        # update the non-nested fields directly
        # currently the only nested field is scheduler_params
        for field in (
            fields - {"scheduler_params_time", "scheduler_frequency"}
        ) & new_anomaly_params.keys():
            err = is_editable(
                field, anomaly_params.get(field), new_anomaly_params[field]
            )
            if err != "":
                return err, kpi

            anomaly_params[field] = new_anomaly_params[field]

        if "scheduler_params_time" in new_anomaly_params:
            # TODO: use JSONB functions to update these, to avoid data races
            scheduler_params: Optional[dict] = kpi.scheduler_params

            if scheduler_params is None:
                scheduler_params = {}

            err = is_editable(
                "scheduler_params_time",
                scheduler_params.get("time"),
                new_anomaly_params["scheduler_params_time"],
            )
            if err != "":
                return err, kpi

            scheduler_params["time"] = new_anomaly_params["scheduler_params_time"]

            kpi.scheduler_params = scheduler_params
            flag_modified(kpi, "scheduler_params")

        if "scheduler_frequency" in new_anomaly_params:
            # TODO: use JSONB functions to update these, to avoid data races
            scheduler_params: Optional[dict] = kpi.scheduler_params

            if scheduler_params is None:
                scheduler_params = {}

            err = is_editable(
                "scheduler_frequency",
                scheduler_params.get("scheduler_frequency"),
                new_anomaly_params["scheduler_frequency"],
            )
            if err != "":
                return err, kpi

            scheduler_params["scheduler_frequency"] = new_anomaly_params[
                "scheduler_frequency"
            ]

            kpi.scheduler_params = scheduler_params
            flag_modified(kpi, "scheduler_params")

        flag_modified(kpi, "anomaly_params")
        new_kpi = cast(
            Kpi,
            kpi.update(
                commit=True, anomaly_params=anomaly_params, run_anomaly=run_anomaly
            ),
        )

        return "", new_kpi

    _meta_info = {
        "name": "anomaly_params",
        "fields": [
            {
                "name": "anomaly_period",
                "is_editable": False,
                "is_sensitive": False,
                "type": "integer",
            },
            {
                "name": "model_name",
                "is_editable": False,
                "is_sensitive": False,
                "type": "select",
                "options": [
                    {
                        "value": key,
                        "name": value,
                    }
                    for key, value in AnomalyParamsSchema._valid_model_names.items()
                ],
            },
            {
                "name": "sensitivity",
                "is_editable": True,
                "is_sensitive": False,
                "type": "select",
                "options": [
                    {
                        "value": key,
                        "name": value,
                    }
                    for key, value in AnomalyParamsSchema._valid_sensitivity.items()
                ],
            },
            {
                "name": "seasonality",
                "is_editable": False,
                "is_sensitive": False,
                "type": "multiselect",
                "options": [
                    {
                        "value": key,
                        "name": value,
                    }
                    for key, value in AnomalyParamsSchema._valid_seasonality.items()
                ],
            },
            {
                "name": "frequency",
                "is_editable": False,
                "is_sensitive": False,
                "type": "select",
                "options": [
                    {
                        "value": key,
                        "name": value,
                    }
                    for key, value in AnomalyParamsSchema._valid_frequency.items()
                ],
            },
            {
                "name": "scheduler_params_time",
                "is_editable": True,
                "is_sensitive": False,
                "type": "time",
            },
            {
                "name": "scheduler_frequency",
                "is_editable": True,
                "is_sensitive": False,
                "type": "select",
                "options": [
                    {
                        "value": key,
                        "name": value,
                    }
                    for key, value in AnomalyParamsSchema._valid_frequency.items()
                ],
            },
        ],
    }

    @classmethod
    def get_meta_info(cls):
        """Get meta info dictionary."""
        return cls._meta_info


anomaly_params_api_schema = AnomalyParamsAPISchema()


if __name__ == "__main__":
    # some rudimentary tests
    # TODO: move this to tests

    schema = AnomalyParamsSchema()
    empty = schema.load({})

    print(empty)

    empty["seasonality"].append(123)

    # check if default list persists
    empty2 = schema.load({})
    print(empty2)

    ex1 = schema.load({"seasonality": ["D"]})
    print(ex1)

    # ex2 = schema.load({"sensitivity": "brr"})
    # print(ex2)

    ex3 = schema.load({"sensitivity": "high"})
    print(ex3)

    schema2 = AnomalyParamsAPISchema()
    ex_2_1 = schema2.load({"scheduler_params_time": "5:11:10"})
    print(ex_2_1)

    ex_2_2 = schema2.load({})
    print(ex_2_2)

    # print(schema2.load({"scheduler_params_time": "a:11:10"}))
