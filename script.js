const employees = [
  { name: "Hanish", role: "Editor and Social Media Manager" },
  { name: "Azlam", role: "Editor" },
  { name: "Rizwan", role: "Camera Man" },
  { name: "Sarath", role: "Camera Man" },
  { name: "Aswathy", role: "Editor and Anchor" },
  { name: "Jeena", role: "Poster Designing and Anchor" },
  { name: "Sneha", role: "Anchor" },
  { name: "Shafi", role: "Employee" }
];

const socialAccounts = [
  "Instagram - changaramkulam1",
  "Instagram - changaramkulam stories",
  "Facebook - changaramkulam",
  "Facebook - cntv",
  "YouTube - cntv",
  "YouTube - cntv live"
];

const reportDate = document.getElementById("reportDate");
const employeeList = document.getElementById("employeeList");
const workEmployee = document.getElementById("workEmployee");
const workForm = document.getElementById("workForm");
const workLog = document.getElementById("workLog");
const socialGrid = document.getElementById("socialGrid");
const whatsappForm = document.getElementById("whatsappForm");
const whatsappEmployee = document.getElementById("whatsappEmployee");
const whatsappLog = document.getElementById("whatsappLog");
const whatsappAdForm = document.getElementById("whatsappAdForm");
const whatsappAdEmployee = document.getElementById("whatsappAdEmployee");
const whatsappAdLog = document.getElementById("whatsappAdLog");
const reportTable = document.getElementById("reportTable");
const presentCount = document.getElementById("presentCount");
const workCount = document.getElementById("workCount");
const videoCount = document.getElementById("videoCount");
const todayLabel = document.getElementById("todayLabel");
const liveClock = document.getElementById("liveClock");
const shareText = document.getElementById("shareText");
const shareStatus = document.getElementById("shareStatus");

const pad = value => String(value).padStart(2, "0");
const todayKey = () => new Date().toISOString().slice(0, 10);
const currentTime = () => {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

let activeDate = todayKey();
let data = loadData();

function defaultDay() {
  return {
    attendance: Object.fromEntries(employees.map(employee => [employee.name, { in: "", out: "" }])),
    works: [],
    social: Object.fromEntries(socialAccounts.map(account => [account, 0])),
    uploads: [],
    whatsappShares: [],
    whatsappAdShares: []
  };
}

function loadData() {
  const saved = localStorage.getItem("newsroom-report-data");
  return saved ? JSON.parse(saved) : {};
}

function saveData() {
  localStorage.setItem("newsroom-report-data", JSON.stringify(data));
}

function getDay() {
  if (!data[activeDate]) {
    data[activeDate] = defaultDay();
  }
  if (!data[activeDate].uploads) {
    data[activeDate].uploads = [];
  }
  if (!data[activeDate].whatsappShares) {
    data[activeDate].whatsappShares = [];
  }
  if (!data[activeDate].whatsappAdShares) {
    data[activeDate].whatsappAdShares = [];
  }
  socialAccounts.forEach(account => {
    if (typeof data[activeDate].social[account] !== "number") {
      data[activeDate].social[account] = 0;
    }
  });
  return data[activeDate];
}

function updateClock() {
  const now = new Date();
  todayLabel.textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  liveClock.textContent = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderEmployeeOptions() {
  workEmployee.innerHTML = employees
    .map(employee => `<option value="${employee.name}">${employee.name}</option>`)
    .join("");
  whatsappEmployee.innerHTML = employees
    .map(employee => `<option value="${employee.name}">${employee.name}</option>`)
    .join("");
  whatsappAdEmployee.innerHTML = employees
    .map(employee => `<option value="${employee.name}">${employee.name}</option>`)
    .join("");
}

function renderAttendance() {
  const day = getDay();
  const template = document.getElementById("employeeTemplate");
  employeeList.innerHTML = "";

  employees.forEach(employee => {
    const card = template.content.firstElementChild.cloneNode(true);
    const record = day.attendance[employee.name] || { in: "", out: "" };
    card.querySelector(".avatar").textContent = employee.name.slice(0, 2).toUpperCase();
    card.querySelector("h3").textContent = employee.name;
    card.querySelector("p").textContent = employee.role;
    card.querySelector(".in-time").textContent = `In: ${record.in || "--"}`;
    card.querySelector(".out-time").textContent = `Out: ${record.out || "--"}`;
    card.querySelector(".in-btn").addEventListener("click", () => setAttendance(employee.name, "in"));
    card.querySelector(".out-btn").addEventListener("click", () => setAttendance(employee.name, "out"));
    employeeList.appendChild(card);
  });
}

function setAttendance(name, field) {
  const day = getDay();
  day.attendance[name][field] = currentTime();
  saveData();
  render();
}

function renderSocial() {
  const day = getDay();
  socialGrid.innerHTML = socialAccounts.map(account => `
    <article class="mini-count social-upload-card">
      <div>
        <h3>${account}</h3>
        <p>${day.social[account] || 0} videos posted today</p>
        <label>
          Uploaded by
          <select data-social-uploader="${account}">
            ${employees.map(employee => `<option value="${employee.name}">${employee.name}</option>`).join("")}
          </select>
        </label>
        <div class="uploader-list">${uploadSummaryForAccount(account)}</div>
      </div>
      <div class="counter">
        <strong>${day.social[account] || 0}</strong>
        <button type="button" data-social="${account}" data-action="plus">Add</button>
      </div>
    </article>
  `).join("");

  socialGrid.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      const account = button.dataset.social;
      const uploader = socialGrid.querySelector(`[data-social-uploader="${account}"]`).value;
      day.social[account] = (day.social[account] || 0) + 1;
      day.uploads.push({
        account,
        uploader,
        time: currentTime()
      });
      saveData();
      render();
    });
  });
}

function uploadSummaryForAccount(account) {
  const uploads = getDay().uploads.filter(upload => upload.account === account);
  if (!uploads.length) {
    return `<span>No uploader added yet</span>`;
  }
  const counts = uploads.reduce((summary, upload) => {
    summary[upload.uploader] = (summary[upload.uploader] || 0) + 1;
    return summary;
  }, {});
  return Object.entries(counts)
    .map(([uploader, count]) => `<span>${uploader}: ${count}</span>`)
    .join("");
}

function renderWorkLog() {
  const works = getDay().works;
  if (!works.length) {
    workLog.innerHTML = `<p class="empty-state">No work added for this date yet.</p>`;
    return;
  }

  workLog.innerHTML = works.slice().reverse().map(work => `
    <article class="log-item">
      <strong>${work.employee} - ${work.type} (${work.count})</strong>
      <p>${work.details}</p>
      <span>${work.time}</span>
    </article>
  `).join("");
}

function whatsappShareTotal(name) {
  return getDay().whatsappShares
    .filter(share => share.employee === name)
    .reduce((total, share) => total + Number(share.count || 0), 0);
}

function whatsappAdShareTotal(name) {
  return getDay().whatsappAdShares
    .filter(share => share.employee === name)
    .reduce((total, share) => total + Number(share.count || 0), 0);
}

function renderShareLog(container, shares, emptyText) {
  if (!shares.length) {
    container.innerHTML = `<span>${emptyText}</span>`;
    return;
  }
  const totals = shares.reduce((summary, share) => {
    summary[share.employee] = (summary[share.employee] || 0) + Number(share.count || 0);
    return summary;
  }, {});
  container.innerHTML = Object.entries(totals)
    .map(([employee, count]) => `<span>${employee}: ${count}</span>`)
    .join("");
}

function renderWhatsappLog() {
  renderShareLog(whatsappLog, getDay().whatsappShares, "No WhatsApp news shares added yet");
  renderShareLog(whatsappAdLog, getDay().whatsappAdShares, "No WhatsApp ad shares added yet");
}

function employeeWorkTotal(name) {
  return getDay().works
    .filter(work => work.employee === name)
    .reduce((total, work) => total + Number(work.count || 0), 0);
}

function renderTable() {
  const day = getDay();
  reportTable.innerHTML = employees.map(employee => {
    const record = day.attendance[employee.name] || { in: "", out: "" };
    const statusText = record.out ? "Left" : record.in ? "Present" : "Not in";
    const statusClass = record.out ? "left" : record.in ? "present" : "";
    return `
      <tr>
        <td><strong>${employee.name}</strong></td>
        <td>${employee.role}</td>
        <td>${record.in || "--"}</td>
        <td>${record.out || "--"}</td>
        <td>${employeeWorkTotal(employee.name)}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
      </tr>
    `;
  }).join("");
}

function renderSummary() {
  const day = getDay();
  presentCount.textContent = Object.values(day.attendance).filter(record => record.in && !record.out).length;
  workCount.textContent = day.works.reduce((total, work) => total + Number(work.count || 0), 0);
  videoCount.textContent = Object.values(day.social).reduce((total, count) => total + Number(count || 0), 0);
}

function buildShareMessage() {
  const day = getDay();
  const present = Object.entries(day.attendance)
    .filter(([, record]) => record.in && !record.out)
    .map(([name]) => name);
  const left = Object.entries(day.attendance)
    .filter(([, record]) => record.out)
    .map(([name]) => name);
  const totalWorks = day.works.reduce((total, work) => total + Number(work.count || 0), 0);
  const totalVideos = Object.values(day.social).reduce((total, count) => total + Number(count || 0), 0);
  const totalWhatsappShares = day.whatsappShares.reduce((total, share) => total + Number(share.count || 0), 0);
  const totalWhatsappAdShares = day.whatsappAdShares.reduce((total, share) => total + Number(share.count || 0), 0);
  const workLines = employees.map(employee => {
    const count = employeeWorkTotal(employee.name);
    return `${employee.name}: ${count}`;
  });
  const whatsappLines = employees
    .map(employee => `${employee.name}: ${whatsappShareTotal(employee.name)}`)
    .filter(line => !line.endsWith(": 0"));
  const whatsappAdLines = employees
    .map(employee => `${employee.name}: ${whatsappAdShareTotal(employee.name)}`)
    .filter(line => !line.endsWith(": 0"));
  const socialLines = socialAccounts.map(account => `${account}: ${day.social[account] || 0}`);
  const uploaderLines = day.uploads.length
    ? day.uploads.map(upload => `${upload.account} - ${upload.uploader} (${upload.time})`)
    : ["No uploader entries"];

  return [
    `News Channel Daily Work Report - ${activeDate}`,
    "",
    `In office: ${present.length ? present.join(", ") : "None"}`,
    `Out from office: ${left.length ? left.join(", ") : "None"}`,
    `Total works completed: ${totalWorks}`,
    `Total social media videos: ${totalVideos}`,
    `Total WhatsApp news shares: ${totalWhatsappShares}`,
    `Total WhatsApp ad shares: ${totalWhatsappAdShares}`,
    "",
    "Employee work count:",
    ...workLines,
    "",
    "WhatsApp news shared by:",
    ...(whatsappLines.length ? whatsappLines : ["No WhatsApp shares"]),
    "",
    "WhatsApp ads shared by:",
    ...(whatsappAdLines.length ? whatsappAdLines : ["No WhatsApp ad shares"]),
    "",
    "Social media video count:",
    ...socialLines,
    "",
    "Uploaded by:",
    ...uploaderLines
  ].join("\n");
}

function renderShareOptions() {
  const message = buildShareMessage();
  shareText.value = message;
  document.getElementById("whatsappShare").href = `https://wa.me/?text=${encodeURIComponent(message)}`;
  document.getElementById("emailShare").href = `mailto:?subject=${encodeURIComponent(`Daily Work Report - ${activeDate}`)}&body=${encodeURIComponent(message)}`;
}

function render() {
  renderAttendance();
  renderSocial();
  renderWhatsappLog();
  renderWorkLog();
  renderTable();
  renderSummary();
  renderShareOptions();
}

function downloadCsv() {
  const day = getDay();
  const rows = [
    ["Date", activeDate],
    [],
    ["Employee", "Role", "In Time", "Out Time", "Work Count", "Status"],
    ...employees.map(employee => {
      const record = day.attendance[employee.name] || { in: "", out: "" };
      const status = record.out ? "Left" : record.in ? "Present" : "Not in";
      return [employee.name, employee.role, record.in || "", record.out || "", employeeWorkTotal(employee.name), status];
    }),
    [],
    ["Work Log"],
    ["Employee", "Type", "Details", "Count", "Time"],
    ...day.works.map(work => [work.employee, work.type, work.details, work.count, work.time]),
    [],
    ["Social Media"],
    ["Account", "Videos Posted"],
    ...socialAccounts.map(account => [account, day.social[account] || 0]),
    [],
    ["Social Uploaders"],
    ["Account", "Uploaded By", "Time"],
    ...day.uploads.map(upload => [upload.account, upload.uploader, upload.time]),
    [],
    ["WhatsApp Shares"],
    ["Employee", "Count", "Note", "Time"],
    ...day.whatsappShares.map(share => [share.employee, share.count, share.note, share.time]),
    [],
    ["WhatsApp Ad Shares"],
    ["Employee", "Count", "Note", "Time"],
    ...day.whatsappAdShares.map(share => [share.employee, share.count, share.note, share.time])
  ];

  const csv = rows
    .map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `work-report-${activeDate}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

workForm.addEventListener("submit", event => {
  event.preventDefault();
  const details = document.getElementById("workDetails");
  const amount = document.getElementById("workAmount");
  const day = getDay();
  day.works.push({
    employee: workEmployee.value,
    type: document.getElementById("workType").value,
    details: details.value.trim() || "Work completed",
    count: Number(amount.value || 1),
    time: currentTime()
  });
  details.value = "";
  amount.value = "1";
  saveData();
  render();
});

whatsappForm.addEventListener("submit", event => {
  event.preventDefault();
  const count = document.getElementById("whatsappCount");
  const note = document.getElementById("whatsappNote");
  getDay().whatsappShares.push({
    employee: whatsappEmployee.value,
    count: Number(count.value || 1),
    note: note.value.trim() || "News shared in WhatsApp",
    time: currentTime()
  });
  count.value = "1";
  note.value = "";
  saveData();
  render();
});

whatsappAdForm.addEventListener("submit", event => {
  event.preventDefault();
  const count = document.getElementById("whatsappAdCount");
  const note = document.getElementById("whatsappAdNote");
  getDay().whatsappAdShares.push({
    employee: whatsappAdEmployee.value,
    count: Number(count.value || 1),
    note: note.value.trim() || "Ad shared in WhatsApp",
    time: currentTime()
  });
  count.value = "1";
  note.value = "";
  saveData();
  render();
});

reportDate.addEventListener("change", () => {
  activeDate = reportDate.value || todayKey();
  render();
});

document.getElementById("exportBtn").addEventListener("click", downloadCsv);
document.getElementById("shareBtn").addEventListener("click", async () => {
  const message = buildShareMessage();
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Daily Work Report - ${activeDate}`,
        text: message
      });
      shareStatus.textContent = "Report shared.";
      return;
    } catch (error) {
      shareStatus.textContent = "Share cancelled. You can copy the message below.";
    }
  }
  await copyShareMessage();
});
document.getElementById("copyShareBtn").addEventListener("click", copyShareMessage);
async function copyShareMessage() {
  shareText.select();
  shareText.setSelectionRange(0, shareText.value.length);
  try {
    await navigator.clipboard.writeText(shareText.value);
  } catch (error) {
    document.execCommand("copy");
  }
  shareStatus.textContent = "Report message copied.";
}

reportDate.value = activeDate;
renderEmployeeOptions();
updateClock();
render();
setInterval(updateClock, 30000);
