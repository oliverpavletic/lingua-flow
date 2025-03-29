from datetime import datetime


def get_curr_time_str() -> str:
    # Generate current time string in "yyyymmdd_hhmmss" format
    return datetime.now().strftime("%Y%m%d_%H%M%S")
