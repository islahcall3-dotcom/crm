import sqlite3
import uuid
import time
from datetime import datetime, timedelta

def seed_rich_data():
    con = sqlite3.connect('elgammal.db')
    cur = con.cursor()

    # 1. Update filter_types with clean UTF-8
    filter_data = [
        ("فلتر 7 مراحل تايواني أمريكي (دورية 3 أشهر)", 3),
        ("فلتر 5 مراحل ألترا فلتريشن (دورية 4 أشهر)", 4),
        ("فلتر 3 مراحل كلاسيك (دورية 6 أشهر)", 6),
        ("فلتر محطة تحلية تجاري (دورية 3 أشهر)", 3),
    ]
    cur.execute("DELETE FROM filter_types")
    cur.execute("DELETE FROM maintenance_intervals")

    filter_ids = {}
    interval_ids = {}

    for name, months in filter_data:
        fid = str(uuid.uuid4())
        cur.execute("INSERT INTO filter_types (id, name, is_active) VALUES (?, ?, 1)", (fid, name))
        filter_ids[name] = fid

        # Check or insert interval
        cur.execute("SELECT id FROM maintenance_intervals WHERE months = ?", (months,))
        row = cur.fetchone()
        if row:
            interval_ids[months] = row[0]
        else:
            iid = str(uuid.uuid4())
            cur.execute("INSERT INTO maintenance_intervals (id, months, is_active) VALUES (?, ?, 1)", (iid, months))
            interval_ids[months] = iid

    # 2. Fix governorates & cities with clean UTF-8
    cur.execute("DELETE FROM cities")
    cur.execute("DELETE FROM governorates")

    egypt_data = {
        "الغربية": ["سمنود", "طنطا", "المحلة الكبرى", "زفتى", "كفر الزيات", "السنطة", "بسيون"],
        "الدقهلية": ["المنصورة", "طلخا", "أجا", "ميت غمر", "السنبلاوين", "دكرنس", "شربين", "بلقاس"],
        "القاهرة": ["مدينة نصر", "المعادي", "التجمع الخامس", "مصر الجديدة", "شبرا"],
        "الجيزة": ["الدقي", "المهندسين", "أكتوبر", "الشيخ زايد", "الهرم"],
        "القليوبية": ["بنها", "العبور", "شبرا الخيمة", "طوخ"],
        "كفر الشيخ": ["كفر الشيخ", "دسوق", "بيلا", "بلطيم"],
        "دمياط": ["دمياط", "دمياط الجديدة", "رأس البر"]
    }

    gov_map = {}
    city_map = {}

    for gov_name, cities in egypt_data.items():
        gid = str(uuid.uuid4())
        cur.execute("INSERT INTO governorates (id, name, is_active) VALUES (?, ?, 1)", (gid, gov_name))
        gov_map[gov_name] = gid
        city_map[gov_name] = {}
        for c in cities:
            cid = str(uuid.uuid4())
            cur.execute("INSERT INTO cities (id, governorate_id, name, is_active) VALUES (?, ?, ?, 1)", (cid, gid, c))
            city_map[gov_name][c] = cid

    # 3. Insert Technicians
    cur.execute("DELETE FROM employees")
    tech_names = [
        "م/ أحمد عبد الرحمن",
        "م/ محمد إبراهيم",
        "م/ محمود الشناوي",
        "م/ كريم السيد"
    ]
    tech_ids = []
    for tname in tech_names:
        tid = str(uuid.uuid4())
        cur.execute("INSERT INTO employees (id, name, is_technician, is_active) VALUES (?, ?, 1, 1)", (tid, tname))
        tech_ids.append(tid)

    # 4. Insert rich customers
    cur.execute("DELETE FROM visits")
    cur.execute("DELETE FROM customers")

    sample_customers = [
        ("د/ حسام الدسوقي", "01098765432", "الغربية", "سمنود", "فلتر 7 مراحل تايواني أمريكي (دورية 3 أشهر)", 3, "شارع البحر بجوار برج الأطباء"),
        ("م/ إسلام الشناوي", "01234567890", "الدقهلية", "المنصورة", "فلتر 7 مراحل تايواني أمريكي (دورية 3 أشهر)", 3, "شارع قناة السويس - برج الهدى"),
        ("أ/ طارق المحلاوي", "01122334455", "الغربية", "المحلة الكبرى", "فلتر 5 مراحل ألترا فلتريشن (دورية 4 أشهر)", 4, "ميدان الشون - خلف بنك مصر"),
        ("د/ أحمد عبد الهادي", "01065432198", "الدقهلية", "طلخا", "فلتر 7 مراحل تايواني أمريكي (دورية 3 أشهر)", 3, "شارع صلاح سالم عمارة النور"),
        ("الحاج مصطفى النجار", "01555544332", "الغربية", "طنطا", "فلتر 7 مراحل تايواني أمريكي (دورية 3 أشهر)", 3, "شارع النحاس - تقاطع سعيد"),
        ("أ/ هاني البدري", "01288776655", "الدقهلية", "أجا", "فلتر 3 مراحل كلاسيك (دورية 6 أشهر)", 6, "طريق المنصورة أجا الزراعي"),
        ("م/ ممدوح شرف", "01033445566", "الغربية", "سمنود", "فلتر 7 مراحل تايواني أمريكي (دورية 3 أشهر)", 3, "شارع المحطة عمارة الزهور"),
        ("صيدلية النجاة (د/ منى)", "01144556677", "الدقهلية", "المنصورة", "فلتر محطة تحلية تجاري (دورية 3 أشهر)", 3, "المشاية السفلية أمام نادي الحوار"),
        ("أ/ وليد فودة", "01077665544", "الغربية", "زفتى", "فلتر 5 مراحل ألترا فلتريشن (دورية 4 أشهر)", 4, "شارع الجيش بجوار مجلس المدينة"),
        ("أ/ يوسف الألفي", "01211223344", "الدقهلية", "ميت غمر", "فلتر 7 مراحل تايواني أمريكي (دورية 3 أشهر)", 3, "شارع الحرية - برج النيل"),
        ("أ/ عادل كمال", "01199887766", "الغربية", "كفر الزيات", "فلتر 3 مراحل كلاسيك (دورية 6 أشهر)", 6, "شارع الجيش"),
        ("م/ رامي الباز", "01044332211", "الدقهلية", "السنبلاوين", "فلتر 7 مراحل تايواني أمريكي (دورية 3 أشهر)", 3, "شارع المعاهدة"),
        ("د/ وسام العطار", "01255667788", "الغربية", "سمنود", "فلتر 7 مراحل تايواني أمريكي (دورية 3 أشهر)", 3, "شارع النيل الجديد"),
        ("أ/ سامح الجزار", "01022113344", "الدقهلية", "شربين", "فلتر 5 مراحل ألترا فلتريشن (دورية 4 أشهر)", 4, "بجوار المستشفى المركزي"),
        ("أ/ فريد العشري", "01566778899", "الغربية", "طنطا", "فلتر 7 مراحل تايواني أمريكي (دورية 3 أشهر)", 3, "شارع الحلو أمام صيدلية مصر"),
        ("أ/ تامر البرنس", "01133224455", "الدقهلية", "بلقاس", "فلتر 7 مراحل تايواني أمريكي (دورية 3 أشهر)", 3, "شارع التحرير"),
        ("أ/ أشرف صقر", "01277665522", "القاهرة", "مدينة نصر", "فلتر 7 مراحل تايواني أمريكي (دورية 3 أشهر)", 3, "شارع الطيران"),
        ("م/ هيثم الجوهري", "01011992288", "الجيزة", "المهندسين", "فلتر 5 مراحل ألترا فلتريشن (دورية 4 أشهر)", 4, "شارع جامعة الدول العربية"),
    ]

    base_time = int(time.time()) - (180 * 86400)
    customer_ids = []

    today_date = datetime.now()

    for idx, (name, phone, gov, city, ftype, months, addr) in enumerate(sample_customers):
        cid = str(uuid.uuid4())
        code = 1001 + idx
        created_at = base_time + (idx * 5 * 86400)
        
        gid = gov_map[gov]
        ctid = city_map[gov][city]
        fid = filter_ids[ftype]
        iid = interval_ids[months]

        # Calculate last and next maintenance
        # Some are upcoming, some today, some overdue
        if idx % 5 == 0:
            # Overdue by 15-30 days
            last_dt = today_date - timedelta(days=months * 30 + 20)
            next_dt = today_date - timedelta(days=20)
        elif idx % 5 == 1:
            # Due today
            last_dt = today_date - timedelta(days=months * 30)
            next_dt = today_date
        else:
            # Upcoming in 10-60 days
            days_until = (idx * 7) % 60 + 5
            next_dt = today_date + timedelta(days=days_until)
            last_dt = next_dt - timedelta(days=months * 30)

        last_str = last_dt.strftime('%Y-%m-%d')
        next_str = next_dt.strftime('%Y-%m-%d')

        cur.execute("""
            INSERT INTO customers (
                id, customer_code, name, phone_1, governorate_id, city_id,
                address_details, filter_type_id, maintenance_interval_id,
                last_maintenance_date, next_maintenance_date, notes, is_deleted, created_at, version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1)
        """, (cid, code, name, phone, gid, ctid, addr, fid, iid, last_str, next_str, f"عميل مميز - دورية صيانة منتظمة", created_at))
        customer_ids.append((cid, name, fid, months, last_str))

    # 5. Insert rich maintenance visits (past 6 months)
    visit_dates = [
        today_date - timedelta(days=1),
        today_date - timedelta(days=3),
        today_date - timedelta(days=5),
        today_date - timedelta(days=12),
        today_date - timedelta(days=18),
        today_date - timedelta(days=25),
        today_date - timedelta(days=35),
        today_date - timedelta(days=42),
        today_date - timedelta(days=55),
        today_date - timedelta(days=68),
        today_date - timedelta(days=75),
        today_date - timedelta(days=90),
        today_date - timedelta(days=105),
        today_date - timedelta(days=120),
        today_date - timedelta(days=140),
        today_date - timedelta(days=160),
    ]

    for vidx, vdt in enumerate(visit_dates):
        vid = str(uuid.uuid4())
        cust = customer_ids[vidx % len(customer_ids)]
        tech_id = tech_ids[vidx % len(tech_ids)]
        vdate_str = vdt.strftime('%Y-%m-%d')

        item1 = 1
        item2 = 1 if (vidx % 2 == 0 or vidx % 3 == 0) else 0
        item3 = 1 if (vidx % 2 == 0 or vidx % 3 == 0) else 0
        item_salts = 1 if (vidx % 4 == 0) else 0  # membrane
        item_post = 1 if (vidx % 3 == 0) else 0
        item_calc = 1 if (vidx % 3 == 0) else 0
        item_infra = 1 if (vidx % 4 == 0) else 0

        cur.execute("""
            INSERT INTO visits (
                id, customer_id, employee_id, visit_date, workflow_status, is_baseline,
                item_1, item_2, item_3, item_salts, item_post, item_calcium, item_infrared,
                notes, is_deleted, created_at, version
            ) VALUES (?, ?, ?, ?, 'COMPLETED', 0, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1)
        """, (
            vid, cust[0], tech_id, vdate_str,
            item1, item2, item3, item_salts, item_post, item_calc, item_infra,
            f"تم تغيير الشمعات وفحص ضغط المياه ونسبة الأملاح TDS للمياه النقية، الجهاز يعمل بحالة ممتازة",
            int(vdt.timestamp())
        ))

    con.commit()
    con.close()
    print("Rich reports data successfully seeded!")

if __name__ == '__main__':
    seed_rich_data()
