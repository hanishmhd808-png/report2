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

const adminDate = document.getElementById("adminDate");
const adminEmployees = document.getElementById("adminEmployees");
const adminWorks = document.getElementById("adminWorks");
const adminShares = document.getElementById("adminShares");
const adminTotals = document.getElementById("adminTotals");
const adminDates = document.getElementById("adminDates");
const adminTable = document.getElementById("adminTable");

const todayKey = () => new Date().toISOString().slice(0, 10);
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
  data[activeDate].uploads ||= [];
  data[activeDate].whatsappShares ||= [];
  data[activeDate].whatsappAdShares ||= [];
  return data[activeDate];
}

function total(items, field = "count") {
  return items.reduce((sum, item) => sum + Number(item[field] || 0), 0);
}

function employeeTotal(collection, name) {
  return collection
    .filter(item => item.employee === name)
    .reduce((sum, item) => sum + Number(item.count || 0), 0);
}

function render() {
  const day = getDay();
  const workTotal = total(day.works);
  const videoTotal = Object.values(day.social).reduce((sum, count) => sum + Number(count || 0), 0);
  const newsShareTotal = total(day.whatsappShares);
  const adShareTotal = total(day.whatsappAdShares);

  adminEmployees.textContent = employees.length;
  adminWorks.textContent = workTotal;
  adminShares.textContent = newsShareTotal + adShareTotal;

  adminTotals.innerHTML = [
    ["In office", Object.values(day.attendance).filter(record => record.in && !record.out).length],
    ["Works completed", workTotal],
    ["Social media videos", videoTotal],
    ["WhatsApp news shares", newsShareTotal],
    ["WhatsApp ad shares", adShareTotal]
  ].map(([label, value]) => `<span><strong>${value}</strong>${label}</span>`).join("");

  const dates = Object.keys(data).sort().reverse();
  adminDates.innerHTML = dates.length
    ? dates.map(date => `<button type="button" class="quiet" data-admin-date="${date}">${date}</button>`).join("")
    : `<span>No saved reports yet</span>`;

  adminDates.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      activeDate = button.dataset.adminDate;
      adminDate.value = activeDate;
      render();
    });
  });

  adminTable.innerHTML = employees.map(employee => {
    const record = day.attendance[employee.name] || { in: "", out: "" };
    const works = day.works
      .filter(work => work.employee === employee.name)
      .reduce((sum, work) => sum + Number(work.count || 0), 0);
    return `
      <tr>
        <td><strong>${employee.name}</strong></td>
        <td>${record.in || "--"}</td>
        <td>${record.out || "--"}</td>
        <td>${works}</td>
        <td>${employeeTotal(day.whatsappShares, employee.name)}</td>
        <td>${employeeTotal(day.whatsappAdShares, employee.name)}</td>
      </tr>
    `;
  }).join("");
}

adminDate.addEventListener("change", () => {
  activeDate = adminDate.value || todayKey();
  render();
});

document.getElementById("adminResetDay").addEventListener("click", () => {
  data[activeDate] = defaultDay();
  saveData();
  render();
});

document.getElementById("adminClearAll").addEventListener("click", () => {
  data = {};
  saveData();
  render();
});

adminDate.value = activeDate;
render();
