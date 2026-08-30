import os
import shutil
import sqlite3
from datetime import datetime

def backup_database():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, "medreach.db")
    backup_dir = os.path.join(base_dir, "backups")
    os.makedirs(backup_dir, exist_ok=True)

    if not os.path.exists(db_path):
        print(f"[ERROR] Database not found at {db_path}")
        return False

    # Check SQLite integrity before snapshotting
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA integrity_check")
        result = cursor.fetchone()
        conn.close()
        if result[0] != "ok":
            print(f"[WARN] Integrity check warning: {result}")
    except Exception as e:
        print(f"[WARN] Could not verify integrity: {e}")

    # Generate timestamped backup
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"medreach_backup_{timestamp}.db"
    backup_filepath = os.path.join(backup_dir, backup_filename)

    shutil.copy2(db_path, backup_filepath)
    print(f"[OK] Database backup successful: {backup_filepath} ({os.path.getsize(backup_filepath)} bytes)")
    return backup_filepath

if __name__ == "__main__":
    backup_database()
