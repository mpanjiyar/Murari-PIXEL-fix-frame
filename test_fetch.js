import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/fetch-amazon-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: 'https://www.amazon.com/dp/B0CQTMRM57' })
    });
    console.log('POST status:', res.status);
    const text = await res.text();
    console.log('POST body first 200 chars:', text.substring(0, 200));
  } catch (err) {
    console.error('POST error:', err);
  }
}

test();
