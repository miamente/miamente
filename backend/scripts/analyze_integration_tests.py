#!/usr/bin/env python3
"""
Script para analizar tests de integración y detectar uso incorrecto de mocks.
"""

import os
import re
from pathlib import Path
from typing import List, Dict


def find_integration_test_files() -> List[Path]:
    """Encuentra todos los archivos de tests de integración."""
    integration_dir = Path("tests/integration")
    test_files = []

    for file_path in integration_dir.rglob("test_*.py"):
        if file_path.is_file():
            test_files.append(file_path)

    return test_files


def analyze_file_for_mocks(file_path: Path) -> Dict[str, List[str]]:
    """Analiza un archivo en busca de patrones de mocking problemáticos."""
    issues = {
        "mock_imports": [],
        "patch_decorators": [],
        "mock_objects": [],
        "dependency_overrides": [],
        "mock_services": [],
        "mock_db": [],
    }

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            lines = content.split("\n")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return issues

    for i, line in enumerate(lines, 1):
        line_lower = line.lower().strip()

        # Detectar imports de mock
        if re.search(r"from unittest\.mock import|import.*mock", line):
            issues["mock_imports"].append(f"Line {i}: {line.strip()}")

        # Detectar decoradores @patch
        if line.strip().startswith("@patch"):
            issues["patch_decorators"].append(f"Line {i}: {line.strip()}")

        # Detectar objetos Mock
        if re.search(r"Mock\(|mock\.", line):
            issues["mock_objects"].append(f"Line {i}: {line.strip()}")

        # Detectar dependency overrides
        if "dependency_overrides" in line:
            issues["dependency_overrides"].append(f"Line {i}: {line.strip()}")

        # Detectar mock de servicios
        if re.search(r"patch.*Service|mock.*service", line_lower):
            issues["mock_services"].append(f"Line {i}: {line.strip()}")

        # Detectar mock de DB
        if re.search(r"mock.*db|patch.*get_db", line_lower):
            issues["mock_db"].append(f"Line {i}: {line.strip()}")

    return issues


def generate_report(test_files: List[Path]) -> str:
    """Genera un reporte completo del análisis."""
    report = []
    report.append("# Reporte de Análisis de Tests de Integración")
    report.append("=" * 60)
    report.append("")

    total_files = len(test_files)
    problematic_files = 0

    for file_path in test_files:
        issues = analyze_file_for_mocks(file_path)

        # Contar si el archivo tiene problemas
        has_issues = any(issues.values())
        if has_issues:
            problematic_files += 1

        status = "❌ PROBLEMÁTICO" if has_issues else "✅ CORRECTO"
        report.append(f"## {file_path}")
        report.append(f"**Estado**: {status}")
        report.append("")

        if has_issues:
            for issue_type, issue_list in issues.items():
                if issue_list:
                    report.append(f"### {issue_type.replace('_', ' ').title()}")
                    for issue in issue_list:
                        report.append(f"- {issue}")
                    report.append("")
        else:
            report.append("No se encontraron problemas de mocking.")
            report.append("")

        report.append("---")
        report.append("")

    # Resumen
    report.append("## Resumen")
    report.append(f"- **Total de archivos analizados**: {total_files}")
    report.append(f"- **Archivos problemáticos**: {problematic_files}")
    report.append(f"- **Archivos correctos**: {total_files - problematic_files}")
    report.append("")

    if problematic_files > 0:
        report.append("### Recomendaciones")
        report.append("1. Refactorizar archivos problemáticos para eliminar mocks")
        report.append("2. Usar base de datos real en tests de integración")
        report.append("3. Separar claramente unit tests (con mocks) de integration tests (sin mocks)")
        report.append("")

    return "\n".join(report)


def main():
    """Función principal."""
    print("🔍 Analizando tests de integración...")

    # Cambiar al directorio del backend
    backend_dir = Path(__file__).parent.parent
    os.chdir(backend_dir)

    test_files = find_integration_test_files()
    print(f"📁 Encontrados {len(test_files)} archivos de test")

    report = generate_report(test_files)

    # Guardar reporte
    report_path = backend_dir / "INTEGRATION_TESTS_ANALYSIS_REPORT.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"📊 Reporte generado: {report_path}")
    print("\n" + "=" * 60)
    print(report)


if __name__ == "__main__":
    main()
