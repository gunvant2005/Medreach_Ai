import os
import shutil
import sqlite3
import glob

def restore_database(snapshot_file=None):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, "medreach.db")
    backup_dir = os.path.join(base_dir, "backups")

    if not snapshot_file:
        # Find most recent backup
        backups = sorted(glob.glob(os.path.join(backup_dir, "medreach_backup_*.db")), reverse=True)
        if not backups:
            print("[ERROR] No database backups found to restore.")
            return False
        snapshot_file = backups[0]

    if not os.path.exists(snapshot_file):
        print(f"[ERROR] Backup file not found: {snapshot_file}")
        return False

    # Create safety copy of current DB if exists
    if os.path.exists(db_path):
        safety_copy = os.path.join(backup_dir, "medreach_pre_restore_safety.db")
        shutil.copy2(db_path, safety_copy)

    shutil.copy2(snapshot_file, db_path)

    # Verify restored DB integrity
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA integrity_check")
    res = cursor.fetchone()
    conn.close()

    if res[0] == "ok":
        print(f"[OK] Successfully restored database from {snapshot_file} (Integrity: OK)")
        return True
    else:
        print(f"[WARN] Restored DB failed integrity check: {res}")
        return False

if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else None
    restore_database(target)
