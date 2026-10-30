"""Tool base class and registry for AgentX Crop Stress Advisory."""

import json
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseTool(ABC):
    """Abstract base class for all agent tools."""

    name: str = ""
    description: str = ""

    @abstractmethod
    def run(self, **kwargs) -> Any:
        """Execute the tool logic and return result."""
        pass

    def to_schema(self) -> Dict[str, Any]:
        """Return tool documentation schema for the prompt builder."""
        return {
            "name": self.name,
            "description": self.description
        }


class ToolRegistry:
    """Central registry for managing tools available to the ReAct agent."""

    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        """Register a new tool instance."""
        if not tool.name:
            raise ValueError(f"Tool {tool.__class__.__name__} must define a unique 'name'.")
        self._tools[tool.name] = tool

    def get(self, name: str) -> Optional[BaseTool]:
        """Retrieve a tool by name."""
        return self._tools.get(name)

    def list_names(self) -> List[str]:
        """List all registered tool names."""
        return list(self._tools.keys())

    def get_descriptions(self) -> str:
        """Format descriptions of all tools for inclusion in system prompt."""
        lines = []
        for name, tool in self._tools.items():
            lines.append(f"- **{name}**: {tool.description}")
        return "\n".join(lines)

    def execute(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """Execute tool safely, wrapping result or error in JSON string."""
        tool = self.get(tool_name)
        if not tool:
            return json.dumps({
                "status": "error",
                "error": f"Tool '{tool_name}' not found. Available tools: {self.list_names()}"
            }, ensure_ascii=False)
        try:
            result = tool.run(**arguments)
            if isinstance(result, (dict, list)):
                return json.dumps(result, ensure_ascii=False, indent=2)
            return str(result)
        except Exception as e:
            return json.dumps({
                "status": "error",
                "tool": tool_name,
                "error": str(e)
            }, ensure_ascii=False)


# Initialize and populate default global registry
registry = ToolRegistry()

# Import and register standard starter tools
from tools.calculator import SafeCalculator
from tools.data_query import DataQueryTool
from tools.web_search import WebSearchTool

# Import and register theme-specific agronomy tools
from tools.soil_analyzer import SoilAnalyzerTool
from tools.weather_tool import WeatherRiskTool
from tools.dosage_calculator import DosageCalculatorTool
from tools.regional_advisor import RegionalAdvisorTool

registry.register(SafeCalculator())
registry.register(DataQueryTool())
registry.register(WebSearchTool())
registry.register(SoilAnalyzerTool())
registry.register(WeatherRiskTool())
registry.register(DosageCalculatorTool())
registry.register(RegionalAdvisorTool())
