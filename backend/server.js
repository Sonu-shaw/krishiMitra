const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, 'data', 'sample_prices.csv');

// Simple helper: load CSV into memory (cached)
let cache = null;
function loadData() {
  if (cache) return cache;
  const raw = fs.readFileSync(DATA_FILE, 'utf8').trim().split('\n');
  const header = raw[0].split(',');
  const rows = raw.slice(1).map(line => {
    const cols = line.split(',');
    return {
      date: cols[0],
      crop: cols[1],
      location: cols[2],
      price: parseFloat(cols[3])
    };
  });
  cache = rows;
  return rows;
}

// Basic health
app.get('/api/health', (req, res) => res.json({status: 'ok'}));

/*
Predict endpoint (naive but explainable baseline):
POST /api/predict
body: { crop: 'Sugarcane', location: 'DistrictA', date: '2025-08-15' }
response: { requestedDate: '2025-08-15', predictedPrice: 2034.12, recommendedDate: '2025-08-18', window: [...] }
*/
app.post('/api/predict', (req, res) => {
  try {
    const { crop, location, date } = req.body;
    if (!crop || !location || !date) return res.status(400).json({error: 'crop, location, date required'});

    const rows = loadData().filter(r => r.crop.toLowerCase() === crop.toLowerCase() && r.location.toLowerCase() === location.toLowerCase());
    if (rows.length === 0) return res.status(404).json({error: 'no data for crop/location in sample dataset'});

    // Convert rows to date-sorted array
    rows.sort((a,b) => new Date(a.date) - new Date(b.date));

    const targetDate = new Date(date);
    // Use last 30 days before targetDate for baseline
    const windowEnd = new Date(targetDate);
    windowEnd.setDate(windowEnd.getDate() - 1);
    const windowStart = new Date(windowEnd);
    windowStart.setDate(windowStart.getDate() - 29);

    const pastWindow = rows.filter(r => {
      const d = new Date(r.date);
      return d >= windowStart && d <= windowEnd;
    });

    // If insufficient data, fallback to last 30 available days
    let baselinePrices = pastWindow;
    if (baselinePrices.length < 10) {
      baselinePrices = rows.slice(-30);
    }

    const avg = baselinePrices.reduce((s,x)=>s+x.price,0)/baselinePrices.length;

    // compute simple linear trend (slope per day) using last 90 points if available
    const lastPoints = rows.slice(-90);
    function linearSlope(points) {
      if (points.length < 2) return 0;
      const xs = points.map((p,i)=>i); // indices
      const ys = points.map(p=>p.price);
      const n = xs.length;
      const meanX = xs.reduce((a,b)=>a+b,0)/n;
      const meanY = ys.reduce((a,b)=>a+b,0)/n;
      let num=0, den=0;
      for (let i=0;i<n;i++){ num += (xs[i]-meanX)*(ys[i]-meanY); den += (xs[i]-meanX)*(xs[i]-meanX); }
      if (den === 0) return 0;
      return num/den;
    }
    const slope = linearSlope(lastPoints); // price change per index (~per day)

    // Seasonal adjustment: average price for same day-of-year across years
    function dayOfYear(d){ const start = new Date(d.getFullYear(),0,0); const diff = d - start; return Math.floor(diff / (1000*60*60*24)); }
    const doy = dayOfYear(targetDate);
    const doyPrices = rows.filter(r => {
      const d = new Date(r.date);
      return dayOfYear(d) === doy;
    }).map(r=>r.price);
    const seasonal = doyPrices.length ? (doyPrices.reduce((a,b)=>a+b,0)/doyPrices.length - avg) : 0;

    // Predict for requested date (naive)
    const daysAhead = Math.round((targetDate - new Date(rows[rows.length-1].date))/(1000*60*60*24));
    const lastPrice = rows[rows.length-1].price;
    const predictedPrice = Math.max(0, lastPrice + slope * daysAhead + seasonal);

    // Provide 7-day window forecast using same model
    const windowForecast = [];
    for (let i=0;i<7;i++){
      const d = new Date(targetDate);
      d.setDate(d.getDate()+i);
      const daysAheadLocal = Math.round((d - new Date(rows[rows.length-1].date))/(1000*60*60*24));
      const doyLocal = dayOfYear(d);
      const doyLocalPrices = rows.filter(r => {
        const dd = new Date(r.date);
        return dayOfYear(dd) === doyLocal;
      }).map(r=>r.price);
      const seasonalLocal = doyLocalPrices.length ? (doyLocalPrices.reduce((a,b)=>a+b,0)/doyLocalPrices.length - avg) : 0;
      const p = Math.max(0, lastPrice + slope * daysAheadLocal + seasonalLocal);
      windowForecast.push({date: d.toISOString().slice(0,10), predicted: Math.round(p*100)/100});
    }

    // Choose recommended date in window (max price)
    let max = windowForecast[0];
    for (const w of windowForecast) if (w.predicted > max.predicted) max = w;

    res.json({
      requestedDate: date,
      predictedPrice: Math.round(predictedPrice*100)/100,
      recommendedDate: max.date,
      window: windowForecast
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'internal error', details: err.message});
  }
});

// Simple registration/listing endpoints storing data to JSON files (demo)
app.post('/api/register', (req,res) => {
  const body = req.body;
  const file = path.join(__dirname, 'data', 'farmers.json');
  let arr = [];
  if (fs.existsSync(file)) arr = JSON.parse(fs.readFileSync(file,'utf8'));
  arr.push({...body, id: Date.now()});
  fs.writeFileSync(file, JSON.stringify(arr,null,2));
  res.json({status:'ok'});
});

app.post('/api/listing', (req,res) => {
  const body = req.body;
  const file = path.join(__dirname, 'data', 'listings.json');
  let arr = [];
  if (fs.existsSync(file)) arr = JSON.parse(fs.readFileSync(file,'utf8'));
  arr.push({...body, id: Date.now()});
  fs.writeFileSync(file, JSON.stringify(arr,null,2));
  res.json({status:'ok'});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log('API server listening on port',PORT));
