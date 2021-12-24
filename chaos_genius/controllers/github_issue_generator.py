"""Utilities related to generating and pre-filling GitHub issue links."""

import logging
import platform
import pprint
from typing import cast
from urllib.parse import quote_plus

from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.task_model import Task
from chaos_genius.settings import CHAOSGENIUS_VERSION, IN_DOCKER

logger = logging.getLogger(__name__)

_GITHUB_ISSUE_TEMPLATE = """
# Error Report

<!--This issue template has been created for you. Please fill in the required sections.-->

An error was caught when running analytics.
Exception message: `{exception_message}`

## Environment

- **Instance/System type**: <!--Laptop/MacBook/Desktop/AWS EC2/GCP VM-->
- **Chaos Genius version**: {cg_version}
- **OS Version**: {os_info}
- **Deployment type**: {deployment_type}
- **Python version**: {python_version}

## Additional context

<!--Add any other context about the problem here if required.-->

## Additional information

<!--Please check and remove information which should not be made public-->

<details>
  <summary>Exception traceback</summary>

  ```
  {exception_traceback}
  ```

</details>

<details>
  <summary>KPI Info</summary>

  ```
  {kpi_info}
  ```

</details>

<details>
  <summary>Data Source Info</summary>

  ```
  {data_source}
  ```

</details>
"""


_GITHUB_ISSUE_LABELS = ["🐛 bug", "generated"]


_GITHUB_ISSUE_TITLE = "Error in Analytics: {exception_message}"


def generate_github_issue_link(task: Task) -> str:
    """Generates a pre-filled GitHub issue link for given failed Task.

    Args:
        task (Task): failed task for which to generate issue.

    Raises:
        Exception if given task does not have an error associated with it.
    """
    full_error = task.error

    if full_error:
        exception_message, exception_traceback = full_error.split("\n", maxsplit=1)
    else:
        raise Exception(
            "No error associated with given task to generate GitHub issue link."
            f"Task ID: {task.task_id}, Checkpoint ID: {task.checkpoint_id}"
        )

    if len(exception_traceback) > 2000:
        logger.warning(
            "Trimming traceback due to URL length limits for "
            "(Task ID: %d, Checkpoint ID: %d).",
            task.task_id,
            task.checkpoint_id,
        )
        exception_traceback = (
            exception_traceback[:2000]
            + "\n...[Traceback trimmed due to length limits."
            + " Please provide the relevant logs for debugging.]"
        )

    deployment_type = "Non-docker"
    if IN_DOCKER:
        deployment_type = "Docker (inferred)"

    kpi = cast(Kpi, Kpi.get_by_id(task.kpi_id))
    data_source = cast(DataSource, DataSource.get_by_id(kpi.data_source))

    issue_title = _GITHUB_ISSUE_TITLE.format(exception_message=exception_message)

    issue_body = _GITHUB_ISSUE_TEMPLATE.format(
        exception_message=exception_message,
        exception_traceback=exception_traceback,
        deployment_type=deployment_type,
        kpi_info=pprint.pformat(kpi.safe_dict),
        data_source=pprint.pformat(data_source.safe_dict),
        python_version=platform.python_version(),
        os_info=platform.platform(aliased=True, terse=True),
        cg_version=CHAOSGENIUS_VERSION,
    )

    issue_title = quote_plus(issue_title)
    issue_body = quote_plus(issue_body)
    labels = quote_plus(",".join(_GITHUB_ISSUE_LABELS))

    url = (
        "https://github.com/chaos-genius/chaos_genius/issues/new?"
        f"labels={labels}&title={issue_title}&body={issue_body}"
    )

    return url
