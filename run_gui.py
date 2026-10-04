"""Convenience entry point to launch the Laya Email Classifier Web GUI."""
import sys
from pathlib import Path

gui_dir = Path(__file__).parent / "gui"
sys.path.insert(0, str(gui_dir))

from server import launch_gui

if __name__ == "__main__":
    launch_gui()
