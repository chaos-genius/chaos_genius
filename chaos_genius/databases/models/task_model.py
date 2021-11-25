"""Model for Tasks (anomaly, deepdrills, etc.)."""

from datetime import datetime
from typing import Optional

from sqlalchemy.schema import PrimaryKeyConstraint

from chaos_genius.databases.base_model import Column, Model, db


class Task(Model):
    """Stores a checkpoint for a Task."""

    task_id = Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    checkpoint_id = Column(
        db.Integer, primary_key=True, nullable=False, autoincrement=False, default=1
    )
    kpi_id = Column(db.Integer, nullable=False)
    analytics_type = Column(db.String(80), nullable=False)
    checkpoint = Column(db.Text(), nullable=False)
    status = Column(db.String(80), nullable=False)
    error = Column(db.Text(), nullable=True)
    timestamp = Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # set by get_checkpoints
    kpi_name: Optional[str] = None

    # set PK to (checkpoint_id, task_id)
    __table_args__ = (
        PrimaryKeyConstraint('task_id', 'checkpoint_id'),
    )

    def __repr__(self) -> str:
        """String representation showing only the task ID."""
        return f"<Task ({self.task_id} - {self.checkpoint_id})>"

    @property
    def as_dict(self):
        """Return a dict representation of the Task checkpoint data."""
        d = {
            "task_id": self.task_id,
            "checkpoint_id": self.checkpoint_id,
            "kpi_id": self.kpi_id,
            "analytics_type": self.analytics_type,
            "checkpoint": self.checkpoint,
            "status": self.status,
            "timestamp": self.timestamp,
            "error": self.error,
        }
        if self.kpi_name is not None:
            d["kpi_name"] = self.kpi_name
        return d
