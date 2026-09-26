# -*- coding: utf-8 -*-
import sqlite3

conn = sqlite3.connect('elgammal.db')
cur = conn.cursor()

# Clear corrupted inventory items and re-seed cleanly with pure UTF-8
cur.execute("DELETE FROM inventory;")

items = [
    ('شمعة مرحلة 1 (بولي بروبلين 5 ميكرون)', 'candle', 120, 45.0),
    ('شمعة مرحلة 2 (كربون نشط حبيبي GAC)', 'candle', 95, 65.0),
    ('شمعة مرحلة 3 (كربون صلب كتلوي CTO)', 'candle', 85, 65.0),
    ('شمعة مرحلة 4 (ممبرين تحلية 75 جالون)', 'candle', 35, 350.0),
    ('شمعة مرحلة 5 (بوست كربون نشط)', 'candle', 50, 85.0),
    ('شمعة مرحلة 6 (كالسيت / كالسيوم)', 'candle', 40, 95.0),
    ('شمعة مرحلة 7 (إنفراريد الأشعة تحت الحمراء)', 'candle', 30, 110.0),
    ('طقم شمع اقتصادي (1 + 2 + 3)', 'candle', 60, 160.0),
    ('طقم شمع كامل (7 مراحل)', 'candle', 25, 750.0),
    ('موتور / مضخة فلتر تايواني كوانتك', 'spare', 12, 850.0),
    ('خزان فلتر فايبر جلاس 12 لتر', 'spare', 8, 650.0),
    ('صنبور / حنفية فلتر استانلس تركي', 'spare', 20, 220.0),
    ('هاوسنج شمع شفاف أصلي مرحلة 1', 'spare', 15, 180.0),
    ('محبس تغذية مياه نحاس 1/2 إلى 1/4', 'spare', 35, 75.0),
    ('محول كهرباء (ترانس أصلي 24V)', 'spare', 14, 280.0)
]

import uuid
for name, cat, qty, price in items:
    cur.execute(
        "INSERT INTO inventory (id, item_name, category, quantity, unit_price) VALUES (?, ?, ?, ?, ?)",
        (str(uuid.uuid4()), name, cat, qty, price)
    )

conn.commit()
print("Successfully re-seeded inventory with pure UTF-8 strings!")

cur.execute("SELECT item_name, category, quantity, unit_price FROM inventory;")
for row in cur.fetchall():
    print(row[0], "|", row[1], "| Qty:", row[2], "| Price:", row[3])

conn.close()
