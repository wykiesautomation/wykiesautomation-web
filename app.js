
import { CONFIG } from './config.js';

const products = [
  { id: 'WA-01', name: 'Gate Opener (GSM)',  price: 1499, img: 'assets/products/wa01.webp', summary: 'GSM-based gate opener unit.' },
  { id: 'WA-02', name: 'Gate Opener (ESP32)', price: 2499, img: 'assets/products/wa02.webp', summary: 'Wi‑Fi/Bluetooth ESP32 version.' },
  { id: 'WA-03', name: 'Plasma Cutter Control GUI', price: 6499, img: 'assets/products/wa03.webp', summary: 'Desktop GUI and controller package.' },
  { id: 'WA-04', name: '16-Channel Alarm (ESP32)', price:  899, img: 'assets/products/wa04.webp', summary: 'ESP32-only alarm board and firmware.' },
  { id: 'WA-05', name: '12-Channel Hybrid Alarm',   price:  800, img: 'assets/products/wa05.webp', summary: 'Wi‑Fi primary with GSM fallback.' },
  { id: 'WA-06', name: '3D Printer GUI',            price: 3999, img: 'assets/products/wa06.webp', summary: 'Modern cross-platform 3D printer GUI.' },
  { id: 'WA-07', name: 'GSM Alarm Admin',           price: 1800, img: 'assets/products/wa07.webp', summary: 'Admin and monitoring tools.' },
  { id: 'WA-08', name: 'Universal Gate Board',      price:  999, img: 'assets/products/wa08.webp', summary: 'No custom PCB; off-the-shelf modules.' },
  { id: 'WA-09', name: 'ESP32 H-Bridge Kit',        price: 1009, img: 'assets/products/wa09.webp', summary: 'Drive module kit for motors.' },
  { id: 'WA-10', name: 'Advanced ECU/TCU GUI',      price: 1299, img: 'assets/products/wa10.webp', summary: 'Modern vehicle control UI.' },
  { id: 'WA-11', name: 'VanWyk DriveBench',         price: 5499, img: 'assets/products/wa11.webp', summary: 'Shifter testing and logging suite.' }
];

function formatPriceZAR(v) { return 'R' + v.toLocaleString('en-ZA'); }

function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = products.map(p => `
    <article class="card">
      <img src="${p.img}" alt="${p.name}" onerror="this.src='assets/placeholder.webp'">
      <div class="body">
        <h3>${p.name}</h3>
        <p class="muted">${p.summary}</p>
        <p class="price">${formatPriceZAR(p.price)} (VAT incl.)</p>
        <a class="btn" href="product.html?id=${p.id}">View Details</a>
      </div>
    </article>`).join('');

  const select = document.getElementById('productSelect');
  products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id; opt.textContent = p.name; select.appendChild(opt);
  });
}

function initWhatsApp() {
  const num = CONFIG.WHATSAPP_NUMBER.replace(/\D/g, '');
  const wa = document.getElementById('whatsappBtn');
  wa.href = `https://wa.me/27${num.startsWith('0')?num.slice(1):num}`;
}

async function submitContact(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  const status = document.getElementById('status');
  status.textContent = 'Sending…';
  try {
    const resp = await fetch(CONFIG.APP_SCRIPT_URL + '?action=contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, sheet: CONFIG.GOOGLE_SHEET_ID })
    });
    const json = await resp.json();
    status.textContent = json.message || 'Sent!';
    form.reset();
  } catch (err) { status.textContent = 'Failed to send. Please try again.'; }
}

window.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  initWhatsApp();
  document.getElementById('contactForm').addEventListener('submit', submitContact);
});
