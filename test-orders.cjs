fetch('https://tapi.marmoris.store/api/cart', {
  headers: { 'Content-Type': 'application/json' }
}).then(async res => console.log(res.status, await res.text()));
