const fs = require('fs');
const path = require('path');

// from/to inclusive year ranges; each segment lists the variant(s) sold then.
const DATA = {
  vw: { make: 'פולקסווגן', models: {
    'golf-gti': { name: 'Golf GTI', segments: [
      { code: 'EA113',       disp: '1.8T',     from: 2000, to: 2003, variants: [{ hp: 150, tq: 220 }] },
      { code: 'EA113',       disp: '2.0T FSI', from: 2004, to: 2008, variants: [{ hp: 200, tq: 280 }] },
      { code: 'EA113',       disp: '2.0T TSI', from: 2009, to: 2012, variants: [{ hp: 210, tq: 280 }] },
      { code: 'EA888 Gen3',  disp: '2.0T',     from: 2013, to: 2016, variants: [{ hp: 220, tq: 350 }] },
      { code: 'EA888 Gen3b', disp: '2.0T',     from: 2017, to: 2019, variants: [{ hp: 230, tq: 350 }] },
      { code: 'EA888 Gen4',  disp: '2.0T',     from: 2020, to: 2024, variants: [{ hp: 245, tq: 370 }, { hp: 265, tq: 370 }] },
    ]},
    'golf-r': { name: 'Golf R', segments: [
      { code: 'EA113',       disp: '2.0T', from: 2010, to: 2013, variants: [{ hp: 270, tq: 350 }] },
      { code: 'EA888 Gen3',  disp: '2.0T', from: 2014, to: 2018, variants: [{ hp: 300, tq: 380 }] },
      { code: 'EA888 Gen3b', disp: '2.0T', from: 2019, to: 2020, variants: [{ hp: 310, tq: 400 }] },
      { code: 'EA888 Gen4',  disp: '2.0T', from: 2021, to: 2024, variants: [{ hp: 320, tq: 420 }] },
    ]},
  }},
  seat: { make: 'סיאט', models: {
    'leon-cupra': { name: 'Leon Cupra', segments: [
      { code: 'EA113',       disp: '2.0T', from: 2007, to: 2012, variants: [{ hp: 240, tq: 300 }] },
      { code: 'EA888 Gen3',  disp: '2.0T', from: 2013, to: 2016, variants: [{ hp: 265, tq: 350 }, { hp: 280, tq: 350 }] },
      { code: 'EA888 Gen3b', disp: '2.0T', from: 2017, to: 2019, variants: [{ hp: 290, tq: 350 }, { hp: 300, tq: 380 }] },
      { code: 'EA888 Gen4',  disp: '2.0T', from: 2020, to: 2023, variants: [{ hp: 265, tq: 370 }, { hp: 310, tq: 400 }] },
    ]},
  }},
  honda: { make: 'הונדה', models: {
    'civic-type-r': { name: 'Civic Type R', segments: [
      { code: 'K20A',  disp: '2.0 NA', from: 2007, to: 2010, variants: [{ hp: 201, tq: 193 }] },
      { code: 'K20C1', disp: '2.0T',   from: 2015, to: 2016, variants: [{ hp: 310, tq: 400 }] },
      { code: 'K20C1', disp: '2.0T',   from: 2017, to: 2021, variants: [{ hp: 320, tq: 400 }] },
      { code: 'K20C1', disp: '2.0T',   from: 2022, to: 2024, variants: [{ hp: 329, tq: 420 }] },
    ]},
    'civic-si': { name: 'Civic Si', segments: [
      { code: 'K20Z3', disp: '2.0 NA', from: 2006, to: 2011, variants: [{ hp: 197, tq: 188 }] },
      { code: 'K24Z7', disp: '2.4 NA', from: 2012, to: 2015, variants: [{ hp: 201, tq: 232 }] },
      { code: 'L15B7', disp: '1.5T',   from: 2017, to: 2021, variants: [{ hp: 205, tq: 260 }] },
      { code: 'L15CA', disp: '1.5T',   from: 2022, to: 2024, variants: [{ hp: 200, tq: 260 }] },
    ]},
  }},
  hyundai: { make: 'יונדאי', models: {
    'i30': { name: 'i30', segments: [
      { code: 'G4FC', disp: '1.6 NA', from: 2007, to: 2011, variants: [{ hp: 122, tq: 154 }] },
      { code: 'G4GC', disp: '2.0 NA', from: 2007, to: 2011, variants: [{ hp: 143, tq: 186 }] },
      { code: 'G4FC', disp: '1.6 NA', from: 2012, to: 2016, variants: [{ hp: 120, tq: 156 }] },
      { code: 'G4FJ', disp: '1.6T',   from: 2012, to: 2016, variants: [{ hp: 186, tq: 265 }] },
      { code: 'G4LC', disp: '1.4T',   from: 2017, to: 2020, variants: [{ hp: 140, tq: 242 }] },
      { code: 'G4FJ', disp: '1.6T',   from: 2017, to: 2020, variants: [{ hp: 204, tq: 265 }] },
      { code: 'G4FY', disp: '1.5T',   from: 2021, to: 2023, variants: [{ hp: 160, tq: 253 }] },
      { code: 'G4KH', disp: '2.0T',   from: 2021, to: 2023, variants: [{ hp: 204, tq: 265 }] },
    ]},
    'veloster-n': { name: 'Veloster N', segments: [
      { code: 'G4KH', disp: '2.0T', from: 2019, to: 2021, variants: [{ hp: 250, tq: 353 }] },
      { code: 'G4KH', disp: '2.0T', from: 2022, to: 2023, variants: [{ hp: 275, tq: 378 }] },
    ]},
  }},
};

const out = [];
const counts = {};

for (const [makeId, makeObj] of Object.entries(DATA)) {
  const models = [];
  for (const [modelId, m] of Object.entries(makeObj.models)) {
    const yearMap = {}; // year -> engines[]
    for (const seg of m.segments) {
      for (let y = seg.from; y <= seg.to; y++) {
        for (const v of seg.variants) {
          const id = `${modelId}-${y}-${v.hp}hp`;
          const label = `${y} ${m.name} ${seg.disp} ${seg.code} - ${v.hp} כ"ס`;
          (yearMap[y] = yearMap[y] || []).push({
            id,
            code: seg.code,
            displacement: seg.disp,
            stockHp: v.hp,
            stockTorque: v.tq,
            label,
          });
        }
      }
    }
    const years = Object.keys(yearMap)
      .map(Number)
      .sort((a, b) => a - b)
      .map(y => ({ year: y, engines: yearMap[y] }));
    const engineCount = years.reduce((s, y) => s + y.engines.length, 0);
    counts[m.name] = engineCount;
    models.push({ id: modelId, name: m.name, years });
  }
  out.push({ id: makeId, make: makeObj.make, models });
}

const target = path.join(__dirname, '..', 'src', 'data', 'cars.json');
fs.writeFileSync(target, JSON.stringify(out, null, 2) + '\n', 'utf8');

let total = 0;
console.log('=== Records per model (engine variant-year rows) ===');
for (const [name, c] of Object.entries(counts)) { console.log(`${name}: ${c}`); total += c; }
console.log(`TOTAL: ${total}`);
