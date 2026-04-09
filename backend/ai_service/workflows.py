"""Workflow registry for AI service.

Pattern 1: a single endpoint with a `workflow` parameter.
Adding a new workflow should not require changing the router.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class WorkflowSpec:
    workflow_id: str
    description: str
    # Which subagents to register for this workflow
    agent_names: tuple[str, ...]


WORKFLOWS: dict[str, WorkflowSpec] = {
    "advisor_chat": WorkflowSpec(
        workflow_id="advisor_chat",
        description="Agentic chat with the Advisor subagent (tools + synthesis).",
        agent_names=("advisor",),
    ),
}


_agent_loop_singletons: dict[str, Any] = {}


def get_workflow_spec(workflow_id: str) -> WorkflowSpec:
    if workflow_id not in WORKFLOWS:
        raise ValueError(
            f"Unknown workflow '{workflow_id}'. Available: {sorted(WORKFLOWS.keys())}"
        )
    return WORKFLOWS[workflow_id]


def get_agent_loop_for_workflow(workflow_id: str):
    """Lazy-init AgentLoop per workflow."""
    if workflow_id in _agent_loop_singletons:
        return _agent_loop_singletons[workflow_id]

    from app.agents.agent_loop import AgentLoop
    from app.agents.subagents.advisor import AdvisorAgent

    spec = get_workflow_spec(workflow_id)
    agents: dict[str, Any] = {}
    if "advisor" in spec.agent_names:
        agents["advisor"] = AdvisorAgent()

    loop = AgentLoop(agents=agents)
    _agent_loop_singletons[workflow_id] = loop
    logger.info(
        "[AIService] AgentLoop initialized for workflow=%s with agents=%s",
        workflow_id,
        list(agents.keys()),
    )
    return loop

