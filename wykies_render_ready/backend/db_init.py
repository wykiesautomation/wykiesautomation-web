import sqlite3, os, hashlib, hmac, secrets
DB_PATH = os.path.join(os.path.dirname(__file__), 'wykies.db')
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("""
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin'
)
""")
cur.execute("""
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  vat_inclusive INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")
cur.execute("""
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  alt TEXT DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
)
""")
conn.commit()
username = os.getenv('ADMIN_DEFAULT_USER')
password = os.getenv('ADMIN_DEFAULT_PASS')
if username and password:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 200000)
    pass_hash = dk.hex()
    try:
        cur.execute('INSERT INTO users (username, pass_hash, salt, role) VALUES (?, ?, ?, ?)', (username, pass_hash, salt, 'admin'))
        conn.commit()
        print('Seeded admin user:', username)
    except sqlite3.IntegrityError:
        print('Admin user already exists')
seed = [
    ('Plasma Cutter GUI','plasma-cutter','Advanced CNC plasma cutting interface',349900,'ZAR',1,1),
    ('Hybrid Gate Controller','hybrid-gate','Wi-Fi + GSM fallback gate control',299900,'ZAR',1,1),
    ('Battery Charger GUI','battery-charger','Smart charging with health monitoring',199900,'ZAR',1,1),
    ('IoT Freezer Control','iot-freezer','Smart refrigeration monitoring',149900,'ZAR',1,1),
    ('Van Wyk ECU/TCU Dashboard','ecu-tcu','Automotive tuning and diagnostics',499900,'ZAR',1,1),
    ('SEMS','sems','Solar energy management system',399900,'ZAR',1,1),
    ('Nano GSM Gate Controller','nano-gate','GSM-based gate automation',199900,'ZAR',1,1),
    ('3D Printer GUI','3d-printer','Advanced 3D printing control',349900,'ZAR',1,1),
    ('16-Channel GSM Alarm','16-gsm-alarm','Hybrid Wi-Fi + GSM alarm system',249900,'ZAR',1,1)
]
for row in seed:
    try:
        cur.execute('INSERT INTO products (name, slug, description, price_cents, currency, vat_inclusive, active) VALUES (?,?,?,?,?,?,?)', row)
    except sqlite3.IntegrityError:
        pass
conn.commit()
print('DB initialized at', DB_PATH)
