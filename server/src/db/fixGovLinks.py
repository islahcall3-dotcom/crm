# -*- coding: utf-8 -*-
import sqlite3
import uuid
import time
from datetime import datetime, timedelta

def fix_and_enrich_data():
    con = sqlite3.connect('elgammal.db')
    cur = con.cursor()

    # Get governorate and city lookup dicts
    cur.execute("SELECT id, name FROM governorates")
    gov_name_to_id = {row[1]: row[0] for row in cur.fetchall()}

    cur.execute("SELECT id, governorate_id, name FROM cities")
    # (gov_id, city_name) -> city_id
    city_lookup = {}
    for cid, gid, cname in cur.fetchall():
        city_lookup[(gid, cname)] = cid

    # Filter types
    cur.execute("SELECT id, name FROM filter_types")
    ftypes = cur.fetchall()
    ftype_7 = next((f[0] for f in ftypes if "7" in f[1]), ftypes[0][0])
    ftype_5 = next((f[0] for f in ftypes if "5" in f[1]), ftypes[0][0])
    ftype_3 = next((f[0] for f in ftypes if "3" in f[1]), ftypes[0][0])

    # Intervals
    cur.execute("SELECT id, months FROM maintenance_intervals")
    intervals = {row[1]: row[0] for row in cur.fetchall()}
    int_3 = intervals.get(3, list(intervals.values())[0])
    int_4 = intervals.get(4, list(intervals.values())[0])
    int_6 = intervals.get(6, list(intervals.values())[0])

    # Ensure technicians exist
    cur.execute("SELECT id, name FROM employees WHERE is_technician = 1")
    techs = cur.fetchall()
    if len(techs) < 4:
        tech_names = ["م/ أحمد عبد الرحمن", "م/ محمد إبراهيم", "م/ محمود الشناوي", "م/ كريم السيد"]
        for tname in tech_names:
            tid = str(uuid.uuid4())
            cur.execute("INSERT OR IGNORE INTO employees (id, name, is_technician, is_active) VALUES (?, ?, 1, 1)", (tid, tname))
        cur.execute("SELECT id, name FROM employees WHERE is_technician = 1")
        techs = cur.fetchall()
    tech_ids = [t[0] for t in techs]

    # Clear existing customers and visits to ensure clean, consistent data
    cur.execute("DELETE FROM visits")
    cur.execute("DELETE FROM customers")

    # Comprehensive customers list covering multiple Egyptian governorates
    # Priority: الغربية (سمنود الأول)، الدقهلية (المنصورة)، القاهرة، الإسكندرية، الجيزة، كفر الشيخ، الشرقية، دمياط، البحيرة، القليوبية
    customer_definitions = [
        # الغربية (سمنود + طنطا + المحلة + زفتى + كفر الزيات)
        ("د/ حسام الدسوقي", "01098765432", "الغربية", "سمنود", ftype_7, int_3, "شارع البحر بجوار برج الأطباء"),
        ("م/ ممدوح شرف", "01033445566", "الغربية", "سمنود", ftype_7, int_3, "شارع المحطة عمارة الزهور"),
        ("د/ وسام العطار", "01255667788", "الغربية", "سمنود", ftype_7, int_3, "شارع النيل الجديد"),
        ("الحاج مصطفى النجار", "01555544332", "الغربية", "طنطا", ftype_7, int_3, "شارع النحاس - تقاطع سعيد"),
        ("أ/ فريد العشري", "01566778899", "الغربية", "طنطا", ftype_7, int_3, "شارع الحلو أمام صيدلية مصر"),
        ("أ/ طارق المحلاوي", "01122334455", "الغربية", "المحلة الكبرى", ftype_5, int_4, "ميدان الشون - خلف بنك مصر"),
        ("أ/ وليد فودة", "01077665544", "الغربية", "زفتى", ftype_5, int_4, "شارع الجيش بجوار مجلس المدينة"),
        ("أ/ عادل كمال", "01199887766", "الغربية", "كفر الزيات", ftype_3, int_6, "شارع الجيش عمارة النصر"),

        # الدقهلية (المنصورة + طلخا + أجا + ميت غمر + السنبلاوين + شربين + بلقاس)
        ("م/ إسلام الشناوي", "01234567890", "الدقهلية", "المنصورة", ftype_7, int_3, "شارع قناة السويس - برج الهدى"),
        ("صيدلية النجاة (د/ منى)", "01144556677", "الدقهلية", "المنصورة", ftype_7, int_3, "المشاية السفلية أمام نادي الحوار"),
        ("د/ أحمد عبد الهادي", "01065432198", "الدقهلية", "طلخا", ftype_7, int_3, "شارع صلاح سالم عمارة النور"),
        ("أ/ هاني البدري", "01288776655", "الدقهلية", "أجا", ftype_3, int_6, "طريق المنصورة أجا الزراعي"),
        ("أ/ يوسف الألفي", "01211223344", "الدقهلية", "ميت غمر", ftype_7, int_3, "شارع الحرية - برج النيل"),
        ("م/ رامي الباز", "01044332211", "الدقهلية", "السنبلاوين", ftype_7, int_3, "شارع المعاهدة"),
        ("أ/ سامح الجزار", "01022113344", "الدقهلية", "شربين", ftype_5, int_4, "بجوار المستشفى المركزي"),
        ("أ/ تامر البرنس", "01133224455", "الدقهلية", "بلقاس", ftype_7, int_3, "شارع التحرير"),

        # القاهرة
        ("أ/ أشرف صقر", "01277665522", "القاهرة", "مدينة نصر", ftype_7, int_3, "شارع الطيران - عمارات العبور"),
        ("م/ شريف عبد الحميد", "01055443322", "القاهرة", "المعادي", ftype_7, int_3, "شارع دجلة 233"),
        ("د/ حازم الشافعي", "01188990011", "القاهرة", "التجمع الخامس", ftype_7, int_3, "شارع التسعين الشمالي"),

        # الإسكندرية
        ("د/ ماجد فهمي", "01288223344", "الإسكندرية", "سموحة", ftype_7, int_3, "شارع ألبرت الأول"),
        ("أ/ هشام منصور", "01099334455", "الإسكندرية", "ميامي", ftype_5, int_4, "شارع إسكندر إبراهيم"),

        # الجيزة
        ("م/ هيثم الجوهري", "01011992288", "الجيزة", "المهندسين", ftype_5, int_4, "شارع جامعة الدول العربية"),
        ("أ/ خالد بدر الدين", "01166554433", "الجيزة", "الشيخ زايد", ftype_7, int_3, "الحي الثامن المجاورة الثالثة"),

        # كفر الشيخ
        ("أ/ عصام رضوان", "01012345678", "كفر الشيخ", "دسوق", ftype_7, int_3, "شارع سعد زغلول"),
        ("د/ شادي الدالي", "01234561234", "كفر الشيخ", "كفر الشيخ", ftype_5, int_4, "شارع الخليفة المأمون"),

        # الشرقية
        ("م/ عمر الخطيب", "01098712345", "الشرقية", "الزقازيق", ftype_7, int_3, "شارع المحافظة - برج النخيل"),

        # القليوبية
        ("أ/ محمود زكي", "01123459876", "القليوبية", "بنها", ftype_7, int_3, "شارع كورنيش النيل"),

        # دمياط
        ("الحاج فتحي أبو العلا", "01245678901", "دمياط", "دمياط الجديدة", ftype_7, int_3, "المنطقة الصناعية شارع 100"),
    ]

    base_time = int(time.time()) - (180 * 86400)
    customer_records = []
    today_date = datetime.now()

    for idx, (name, phone, gov, city, fid, iid, addr) in enumerate(customer_definitions):
        cid = str(uuid.uuid4())
        code = 1001 + idx
        created_at = base_time + (idx * 5 * 86400)

        gid = gov_name_to_id.get(gov)
        if not gid:
            print(f"Warning: Gov {gov} not found!")
            continue

        ctid = city_lookup.get((gid, city))
        if not ctid:
            # Fallback: get any city in that governorate
            cur.execute("SELECT id FROM cities WHERE governorate_id = ? LIMIT 1", (gid,))
            r = cur.fetchone()
            ctid = r[0] if r else None

        months = 3 if fid == ftype_7 else (4 if fid == ftype_5 else 6)

        # Distribute maintenance dates: 3 overdue, 2 due today, rest upcoming
        if idx in [0, 4, 9]:
            # Overdue
            last_dt = today_date - timedelta(days=months * 30 + 15)
            next_dt = today_date - timedelta(days=15)
        elif idx in [1, 8]:
            # Due Today
            last_dt = today_date - timedelta(days=months * 30)
            next_dt = today_date
        else:
            # Upcoming
            days_ahead = ((idx * 8) % 75) + 3
            next_dt = today_date + timedelta(days=days_ahead)
            last_dt = next_dt - timedelta(days=months * 30)

        last_str = last_dt.strftime('%Y-%m-%d')
        next_str = next_dt.strftime('%Y-%m-%d')

        cur.execute("""
            INSERT INTO customers (
                id, customer_code, name, phone_1, governorate_id, city_id,
                address_details, filter_type_id, maintenance_interval_id,
                last_maintenance_date, next_maintenance_date, notes, is_deleted, created_at, version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1)
        """, (cid, code, name, phone, gid, ctid, addr, fid, iid, last_str, next_str, "عميل معتمد في المنظومة", created_at))

        customer_records.append({
            'id': cid,
            'name': name,
            'last_date': last_str,
            'created_at': created_at,
            'filter_id': fid
        })

    print(f"Inserted {len(customer_records)} customers across {len(set(c[2] for c in customer_definitions))} governorates.")

    # Insert realistic visits tied to customers
    # Distribute visits across technicians and dates in the past 6 months
    visit_plans = [
        # (cust_index, tech_index, days_ago, [candles_replaced])
        (0, 0, 105, [1, 2, 3]),
        (1, 1, 90, [1, 2, 3, 5, 6]),
        (2, 2, 12, [1, 2, 3]),
        (3, 0, 95, [1, 2, 3, 4]), # salts
        (4, 3, 105, [1, 2, 3]),
        (5, 1, 18, [1, 2, 3]),
        (6, 2, 75, [1, 2, 3]),
        (7, 0, 110, [1, 2, 3]),
        (8, 1, 90, [1, 2, 3, 5, 6, 7]),
        (9, 3, 85, [1, 2, 3]),
        (10, 2, 60, [1, 2, 3, 4]), # salts
        (11, 0, 140, [1, 2, 3]),
        (12, 1, 45, [1, 2, 3]),
        (13, 3, 50, [1, 2, 3]),
        (14, 2, 30, [1, 2, 3]),
        (15, 0, 25, [1, 2, 3, 5, 6]),
        (16, 1, 15, [1, 2, 3]),
        (17, 3, 8, [1, 2, 3]),
        (18, 2, 5, [1, 2, 3, 7]),
        (19, 0, 3, [1, 2, 3]),
    ]

    for c_idx, t_idx, d_ago, stages in visit_plans:
        if c_idx >= len(customer_records):
            continue
        cust = customer_records[c_idx]
        tid = tech_ids[t_idx % len(tech_ids)]
        vdate = (today_date - timedelta(days=d_ago)).strftime('%Y-%m-%d')
        vid = str(uuid.uuid4())

        i1 = 1 if 1 in stages else 0
        i2 = 1 if 2 in stages else 0
        i3 = 1 if 3 in stages else 0
        isalts = 1 if 4 in stages else 0
        ipost = 1 if 5 in stages else 0
        icalc = 1 if 6 in stages else 0
        iinfra = 1 if 7 in stages else 0

        note = f"صيانة دورية ناجحة - تم تغيير شمعات {', '.join(str(s) for s in stages)} وفحص ضغط المياه وجودة الجهاز"

        cur.execute("""
            INSERT INTO visits (
                id, customer_id, employee_id, visit_date, workflow_status, is_baseline,
                item_1, item_2, item_3, item_salts, item_post, item_calcium, item_infrared,
                notes, is_deleted, created_at, version
            ) VALUES (?, ?, ?, ?, 'COMPLETED', 0, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1)
        """, (vid, cust['id'], tid, vdate, i1, i2, i3, isalts, ipost, icalc, iinfra, note, cust['created_at']))

    cur.execute("SELECT count(*) FROM visits")
    v_count = cur.fetchone()[0]
    print(f"Successfully created {v_count} verified visits linked to customers and inventory!")

    con.commit()
    con.close()

if __name__ == '__main__':
    fix_and_enrich_data()
