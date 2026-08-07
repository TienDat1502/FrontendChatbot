const XLSX = require('xlsx');

const csvData = `Ngày nghỉ,Loại nghỉ,Số giờ nghỉ
"11/01/2025","Nghỉ phép năm","3.5"`;

try {
  const wb = XLSX.read(csvData, { type: 'string' });
  console.log("Success! Sheet names:", wb.SheetNames);
} catch (e) {
  console.error("Error:", e.message);
}
