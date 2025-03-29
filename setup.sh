#!/bin/bash

# Setup virtual environment and Hatch environment
python3 -m venv .venv
source .venv/bin/activate
hatch env create
