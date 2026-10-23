import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('about page has shared shell and all four engineering tools',()=>{
 const html=read('about.html');
 for(const value of ['osint-redesign.css','class="os-sidebar"','class="os-footer"','Mission','About Hephzibah','voltpro-plc/','voltPro-ElectCAD/','/simulator','/breadboard'])assert.ok(html.includes(value),value);
});
test('contact page has a usable email form, social links, location, and privacy note',()=>{
 const html=read('contact.html');
 for(const value of ['name="name"','name="email"','name="message"','type="email"','mailto:isaacadigunoluwole@gmail.com','Hamburg, Germany','GitHub','LinkedIn','Privacy:'])assert.ok(html.includes(value),value);
});
