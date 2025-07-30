"""
Utility functions for standardized timestamp handling across the application.
Uses ISO 8601 format with UTC timezone for consistency.
"""

from datetime import datetime, timezone
from typing import Optional


def get_current_timestamp() -> str:
    """
    Get current timestamp in standardized ISO 8601 format with UTC timezone.
    
    Returns:
        str: Current timestamp in format "YYYY-MM-DDTHH:MM:SS.fffffZ"
    """
    return datetime.now(timezone.utc).isoformat()


def parse_timestamp(timestamp_str: Optional[str]) -> Optional[datetime]:
    """
    Parse timestamp string to datetime object, handling various formats.
    
    Args:
        timestamp_str: Timestamp string in various formats
        
    Returns:
        datetime object or None if parsing fails
    """
    if not timestamp_str:
        return None
    
    try:
        # Handle different timestamp formats
        if 'T' in timestamp_str:
            # ISO format with T separator
            if timestamp_str.endswith('Z'):
                # Replace Z with +00:00 for fromisoformat compatibility
                return datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            elif '+' in timestamp_str or timestamp_str.count(':') > 2:
                # With timezone info
                return datetime.fromisoformat(timestamp_str)
            else:
                # Without timezone, assume UTC
                dt = datetime.fromisoformat(timestamp_str)
                return dt.replace(tzinfo=timezone.utc)
        else:
            # Space-separated format, assume UTC if no timezone
            dt = datetime.fromisoformat(timestamp_str)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
    except (ValueError, AttributeError) as e:
        print(f"Error parsing timestamp '{timestamp_str}': {e}")
        return None


def format_timestamp_for_db(dt: Optional[datetime]) -> Optional[str]:
    """
    Format datetime object for database storage in standardized format.
    
    Args:
        dt: datetime object
        
    Returns:
        str: Formatted timestamp string or None
    """
    if not dt:
        return None
    
    # Ensure timezone info exists, assume UTC if missing
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    
    return dt.isoformat()


def compare_timestamps(ts1: Optional[str], ts2: Optional[str]) -> Optional[int]:
    """
    Compare two timestamp strings.
    
    Args:
        ts1: First timestamp string
        ts2: Second timestamp string
        
    Returns:
        int: -1 if ts1 < ts2, 0 if ts1 == ts2, 1 if ts1 > ts2, None if comparison fails
    """
    dt1 = parse_timestamp(ts1)
    dt2 = parse_timestamp(ts2)
    
    if dt1 is None or dt2 is None:
        return None
    
    if dt1 < dt2:
        return -1
    elif dt1 > dt2:
        return 1
    else:
        return 0


def is_timestamp_newer(newer_ts: Optional[str], older_ts: Optional[str]) -> bool:
    """
    Check if first timestamp is newer than second timestamp.
    
    Args:
        newer_ts: Timestamp that should be newer
        older_ts: Timestamp that should be older
        
    Returns:
        bool: True if newer_ts > older_ts, False otherwise
    """
    comparison = compare_timestamps(newer_ts, older_ts)
    return comparison == 1 if comparison is not None else False