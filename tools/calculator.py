"""Safe arithmetic calculator tool for agronomic calculations and dosage math."""

import ast
import math
import operator
from typing import Any, Dict, Union
from tools import BaseTool


class SafeCalculator(BaseTool):
    """Safe arithmetic evaluator for agricultural dosage, unit conversions, and stats."""

    name = "calculator"
    description = (
        "Safe mathematical calculator. Evaluates arithmetic expressions, agronomic ratios, "
        "and unit conversions. Input: {'expression': 'string', 'formula_type': optional 'custom'|'urea'|'water_volume'}"
    )

    # Allowed AST operators
    _OPERATORS = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.FloorDiv: operator.floordiv,
        ast.Mod: operator.mod,
        ast.Pow: operator.pow,
        ast.USub: operator.neg,
        ast.UAdd: operator.pos,
    }

    _FUNCTIONS = {
        "round": round,
        "abs": abs,
        "min": min,
        "max": max,
        "sqrt": math.sqrt,
        "ceil": math.ceil,
        "floor": math.floor,
        "pow": pow,
    }

    def _eval(self, node: ast.AST) -> Union[int, float]:
        if isinstance(node, ast.Expression):
            return self._eval(node.body)
        elif isinstance(node, ast.Constant):
            if isinstance(node.value, (int, float)):
                return node.value
            raise ValueError(f"Unsupported constant type: {type(node.value)}")
        elif isinstance(node, ast.UnaryOp):
            op_type = type(node.op)
            if op_type in self._OPERATORS:
                return self._OPERATORS[op_type](self._eval(node.operand))
            raise ValueError(f"Unsupported unary operator: {op_type}")
        elif isinstance(node, ast.BinOp):
            op_type = type(node.op)
            if op_type in self._OPERATORS:
                left = self._eval(node.left)
                right = self._eval(node.right)
                return self._OPERATORS[op_type](left, right)
            raise ValueError(f"Unsupported binary operator: {op_type}")
        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id in self._FUNCTIONS:
                args = [self._eval(arg) for arg in node.args]
                return self._FUNCTIONS[node.func.id](*args)
            raise ValueError(f"Unsupported function call: {ast.dump(node.func)}")
        else:
            raise ValueError(f"Unsupported expression node: {ast.dump(node)}")

    def run(self, expression: str = "", formula_type: str = "custom", **kwargs) -> Dict[str, Any]:
        """Safely evaluate expression or compute standard agronomic formula."""
        if not expression and kwargs:
            # Handle shortcuts
            if "urea_for_n" in kwargs:
                # Urea contains 46% N -> urea_kg = n_deficit_kg / 0.46
                n_def = float(kwargs["urea_for_n"])
                urea_kg = round(n_def / 0.46, 2)
                return {"urea_for_n": n_def, "urea_required_kg": urea_kg, "formula": "n_deficit / 0.46"}
            if "water_mm_to_liters" in kwargs:
                # 1 mm rainfall / irrigation over 1 acre = 4,046.86 Liters
                mm = float(kwargs["water_mm_to_liters"])
                liters = round(mm * 4046.86, 2)
                return {"depth_mm": mm, "liters_per_acre": liters, "cubic_meters_per_acre": round(liters / 1000, 2)}

        clean_expr = expression.strip().replace(" ", "").replace("^", "**")
        if not clean_expr:
            return {"error": "Empty mathematical expression provided."}

        try:
            tree = ast.parse(clean_expr, mode="eval")
            result = self._eval(tree)
            return {
                "status": "success",
                "expression": expression,
                "result": round(result, 4) if isinstance(result, float) else result
            }
        except Exception as e:
            return {
                "status": "error",
                "expression": expression,
                "error": f"Arithmetic calculation failed: {str(e)}"
            }
