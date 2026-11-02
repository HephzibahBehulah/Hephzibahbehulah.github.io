import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('about page retains its shared company shell without retired workspaces',()=>{
 const html=read('apps/public/about.html');
 for(const value of ['osint-redesign.css','class="os-sidebar"','class="os-footer"','Mission','About Hephzibah'])assert.ok(html.includes(value),value);
 assert.doesNotMatch(html,/engineering\.hephzibahbehulah\.com|voltpro-plc|voltPro-ElectCAD|href="\/(?:simulator|breadboard|plc|electcad|electrical|oscilloscope)(?:\/|"|\?)/i);
});
test('contact page has a usable email form, social links, location, and privacy note',()=>{
 const html=read('apps/public/contact.html');
 for(const value of ['name="name"','name="email"','name="message"','type="email"','mailto:isaacadigunoluwole@gmail.com','Hamburg, Germany','GitHub','LinkedIn','Privacy:','href="contact.html" aria-current="page"'])assert.ok(html.includes(value),value);
 assert.doesNotMatch(html,/engineering\.hephzibahbehulah\.com|VoltPro/i);
});
