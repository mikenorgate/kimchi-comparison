// Weather — current conditions + hourly + daily forecast (mocked data).
export const windowConfig = { width: 720, height: 540 };

export function mount(el) {
  const temp = 72;
  el.innerHTML = `
    <div style="position:relative;height:100%;overflow:auto;background:linear-gradient(180deg,#5ec8ff 0%,#2a7fd6 60%,#0a4a8f 100%);color:#fff">
      <div style="padding:30px 20px;text-align:center">
        <div style="font-size:24px;font-weight:600">Cupertino</div>
        <div style="font-size:72px;font-weight:200;line-height:1;margin:6px 0">${temp}°</div>
        <div style="font-size:16px;opacity:.9">Mostly Sunny</div>
        <div style="font-size:13px;opacity:.8;margin-top:2px">H:78°  L:62°</div>
      </div>
      <div style="margin:10px 14px;background:rgba(255,255,255,0.18);backdrop-filter:blur(20px);border-radius:16px;padding:14px;border:0.5px solid rgba(255,255,255,0.25)">
        <div style="font-size:11px;text-transform:uppercase;opacity:.7;letter-spacing:.04em;margin-bottom:8px">Hourly Forecast</div>
        <div style="display:flex;justify-content:space-between;overflow:auto" data-hourly></div>
      </div>
      <div style="margin:10px 14px;background:rgba(255,255,255,0.18);backdrop-filter:blur(20px);border-radius:16px;padding:14px;border:0.5px solid rgba(255,255,255,0.25)">
        <div style="font-size:11px;text-transform:uppercase;opacity:.7;letter-spacing:.04em;margin-bottom:8px">10-Day Forecast</div>
        <div data-daily></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 14px;padding-bottom:20px">
        ${metric('UV Index','5','Moderate')}
        ${metric('Humidity','62%','Dew point 58°')}
        ${metric('Wind','7 mph','NE')}
        ${metric('Visibility','10 mi','Clear')}
        ${metric('Pressure','29.92','Rising')}
        ${metric('Sunset','8:12 PM','Sunrise 6:14 AM')}
      </div>
    </div>
  `;
  const days = ['Now','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM','9PM','10PM'];
  const temps = [72,74,75,76,75,73,70,67,65,63,61];
  const icons = ['☀️','☀️','⛅','⛅','⛅','☁️','☁️','🌙','🌙','🌙','🌙'];
  el.querySelector('[data-hourly]').innerHTML = days.map((d,i) => `
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;min-width:42px;padding:2px 4px">
      <div style="font-size:12px;opacity:.85">${d}</div>
      <div style="font-size:20px">${icons[i]}</div>
      <div style="font-size:14px;font-weight:600">${temps[i]}°</div>
    </div>
  `).join('');

  const dnames = ['Today','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dh = [78,79,80,77,75,72,70];
  const dl = [62,63,64,60,58,55,54];
  const dicon = ['☀️','☀️','⛅','⛅','☁️','🌧️','☁️'];
  el.querySelector('[data-daily]').innerHTML = dnames.map((d,i) => `
    <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:0.5px solid rgba(255,255,255,0.15);font-size:14px">
      <div style="width:44px">${d}</div>
      <div style="font-size:18px;width:28px">${dicon[i]}</div>
      <div style="opacity:.7;width:30px">${dl[i]}°</div>
      <div style="flex:1;height:4px;border-radius:2px;background:linear-gradient(90deg,#5ec8ff,#ffc840,#ff6a5e);position:relative;margin:0 6px">
        <div style="position:absolute;left:${(dl[i]-50)*2}%;width:${(dh[i]-dl[i])*2}%;height:100%;background:rgba(255,255,255,0.4);border-radius:2px"></div>
      </div>
      <div style="width:30px;text-align:right">${dh[i]}°</div>
    </div>
  `).join('');
}

function metric(label, val, sub) {
  return `<div style="background:rgba(255,255,255,0.18);backdrop-filter:blur(20px);border-radius:14px;padding:12px;border:0.5px solid rgba(255,255,255,0.25)">
    <div style="font-size:11px;text-transform:uppercase;opacity:.7;letter-spacing:.04em">${label}</div>
    <div style="font-size:26px;font-weight:300;margin:4px 0">${val}</div>
    <div style="font-size:12px;opacity:.8">${sub}</div>
  </div>`;
}
