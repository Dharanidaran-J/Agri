"""Data query tool: list_files, read_file, sql_query over CSVs."""

import os
import sqlite3
import pandas as pd
from typing import Any, Dict, List, Optional
from config import DATA_DIR
from tools import BaseTool


class DataQueryTool(BaseTool):
    """Tool to inspect data directory, read files, and run SQL queries across tabular CSVs."""

    name = "data_query"
    description = (
        "Inspect and query farm datasets. Operations: "
        "1) list_files: {'action': 'list_files', 'directory': optional_path} "
        "2) read_file: {'action': 'read_file', 'filename': 'crop_recommendation.csv', 'limit': 10} "
        "3) sql_query: {'action': 'sql_query', 'query': 'SELECT label, AVG(N), AVG(rainfall) FROM crops GROUP BY label', 'csv_name': 'crop_recommendation.csv'}"
    )

    def __init__(self, data_dir: Optional[str] = None):
        self.data_dir = data_dir or DATA_DIR

    def _resolve_path(self, filename: str) -> str:
        if os.path.isabs(filename):
            return filename
        return os.path.join(self.data_dir, filename)

    def list_files(self, directory: Optional[str] = None) -> Dict[str, Any]:
        target = directory or self.data_dir
        if not os.path.exists(target):
            return {"status": "error", "error": f"Directory not found: {target}"}
        items = []
        for f in os.listdir(target):
            p = os.path.join(target, f)
            items.append({
                "filename": f,
                "is_dir": os.path.isdir(p),
                "size_bytes": os.path.getsize(p) if os.path.isfile(p) else 0
            })
        return {"status": "success", "directory": target, "files": items}

    def read_file(self, filename: str, limit: int = 10, offset: int = 0) -> Dict[str, Any]:
        path = self._resolve_path(filename)
        if not os.path.exists(path):
            return {"status": "error", "error": f"File '{filename}' not found in {self.data_dir}"}

        if filename.endswith(".json"):
            import json
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return {"status": "success", "filename": filename, "data": data}

        try:
            df = pd.read_csv(path)
            total_rows = len(df)
            sliced = df.iloc[offset:offset + limit]
            return {
                "status": "success",
                "filename": filename,
                "total_rows": total_rows,
                "columns": list(df.columns),
                "rows": sliced.to_dict(orient="records")
            }
        except Exception as e:
            return {"status": "error", "error": f"Failed to read file: {str(e)}"}

    def sql_query(self, query: str, csv_name: str = "crop_recommendation.csv") -> Dict[str, Any]:
        path = self._resolve_path(csv_name)
        if not os.path.exists(path):
            return {"status": "error", "error": f"CSV '{csv_name}' not found."}

        # Prevent unsafe destructive operations
        clean_query = query.strip()
        upper_query = clean_query.upper()
        for forbidden in ["DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "CREATE", "TRUNCATE"]:
            if forbidden in upper_query.split():
                return {"status": "error", "error": f"Destructive SQL statement '{forbidden}' not allowed."}

        try:
            df = pd.read_csv(path)
            # Create in-memory SQLite table
            conn = sqlite3.connect(":memory:")
            # Use table name 'crops' or 'data' or file basename
            table_name = "crops" if "crop" in csv_name.lower() else "telemetry"
            df.to_sql(table_name, conn, index=False, if_exists="replace")

            # Also alias generic 'data' table name
            df.to_sql("data", conn, index=False, if_exists="replace")

            cursor = conn.cursor()
            cursor.execute(clean_query)
            cols = [desc[0] for desc in cursor.description] if cursor.description else []
            rows = cursor.fetchall()
            results = [dict(zip(cols, row)) for row in rows[:50]]
            conn.close()

            return {
                "status": "success",
                "query": clean_query,
                "matched_count": len(rows),
                "results": results
            }
        except Exception as e:
            return {"status": "error", "query": clean_query, "error": f"SQL execution error: {str(e)}"}

    def run(self, action: str = "list_files", **kwargs) -> Dict[str, Any]:
        """Dispatch query action."""
        if action == "list_files":
            return self.list_files(kwargs.get("directory"))
        elif action == "read_file":
            filename = kwargs.get("filename", "crop_recommendation.csv")
            limit = int(kwargs.get("limit", 10))
            offset = int(kwargs.get("offset", 0))
            return self.read_file(filename, limit, offset)
        elif action == "sql_query":
            query = kwargs.get("query", "SELECT * FROM crops LIMIT 5")
            csv_name = kwargs.get("csv_name", "crop_recommendation.csv")
            return self.sql_query(query, csv_name)
        else:
            return {"status": "error", "error": f"Unknown action: '{action}'. Must be list_files, read_file, or sql_query."}
