from pathlib import Path

from tests.boundaries import find_violations

APP = Path(__file__).resolve().parent.parent / "app"


def test_module_boundaries():
    assert find_violations(APP) == []


def test_detector_catches_private_import(tmp_path):
    folder = tmp_path / "module_social"
    folder.mkdir()
    (folder / "x.py").write_text("from app.module_users.models import User\n")
    assert len(find_violations(tmp_path)) == 1


def test_detector_allows_public_import(tmp_path):
    folder = tmp_path / "module_social"
    folder.mkdir()
    (folder / "x.py").write_text("from app.module_users.public import get_auth_state\n")
    assert find_violations(tmp_path) == []


def test_detector_catches_plain_import(tmp_path):
    folder = tmp_path / "module_social"
    folder.mkdir()
    (folder / "x.py").write_text("import app.module_users.service\n")
    assert len(find_violations(tmp_path)) == 1
