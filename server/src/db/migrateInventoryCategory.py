import sqlite3

conn = sqlite3.connect('elgammal.db')
cur = conn.cursor()

cur.execute('PRAGMA table_info(inventory);')
cols = [col[1] for col in cur.fetchall()]
print('Columns:', cols)

if 'category' not in cols:
    cur.execute("ALTER TABLE inventory ADD COLUMN category TEXT DEFAULT 'spare';")
    conn.commit()
    print('Added category column!')

# Set candles
cur.execute("""
    UPDATE inventory 
    SET category = 'candle' 
    WHERE item_name LIKE '%شمع%' 
       OR item_name LIKE '%ممبرين%' 
       OR item_name LIKE '%كربون%' 
       OR item_name LIKE '%كالسيت%' 
       OR item_name LIKE '%إنفراريد%' 
       OR item_name LIKE '%طقم%';
""")
conn.commit()

cur.execute('SELECT item_name, category, quantity FROM inventory;')
for row in cur.fetchall():
    print(row)
conn.close()
