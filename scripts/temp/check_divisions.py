import csv
from pathlib import Path

path = Path(r"C:/Users/johns/OneDrive/Downloads/compare/master.summerball.csv")

with path.open(encoding="utf-8-sig", newline="") as f:
    reader = csv.reader(f)
    header = next(reader)
    idx_progname = header.index("programName ")
    idx_program = header.index(" Program ")
    idx_division = header.index(" Division                                                    ")

    total = 0
    missing = []
    for row in reader:
        if row[idx_progname].strip() == "Summerball25":
            total += 1
            program = row[idx_program].strip()
            division = row[idx_division].strip()
            if not division or not program or not division.startswith(f"{program} - "):
                missing.append((row[idx_progname].strip(), program, division))

print(f"Summerball25 rows: {total}")
print(f"Missing prefix: {len(missing)}")
if missing:
    print("Examples:")
    for sample in missing[:5]:
        print(sample)
