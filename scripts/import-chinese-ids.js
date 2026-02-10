const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read Excel file
const filePath = process.argv[2] || "/Users/luizhsena/Downloads/ID's chineses.xlsx";
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log(`Found ${data.length} IDs in the Excel file`);

// Generate SQL inserts
let sql = `-- Auto-generated SQL to insert Chinese IDs
-- Generated at: ${new Date().toISOString()}
-- Total IDs: ${data.length}

-- Clear existing data (optional - comment out if you want to keep existing)
-- TRUNCATE TABLE chinese_ids RESTART IDENTITY;

-- Insert IDs
INSERT INTO chinese_ids (identity_number) VALUES
`;

const values = data
  .filter(row => row[0] && String(row[0]).trim().length > 0)
  .map(row => `  ('${String(row[0]).trim()}')`);

sql += values.join(',\n');
sql += '\nON CONFLICT (identity_number) DO NOTHING;\n';

// Write SQL file
const outputPath = path.join(__dirname, '..', 'supabase', 'migrations', 'seed_chinese_ids.sql');
fs.writeFileSync(outputPath, sql);

console.log(`SQL file generated: ${outputPath}`);
console.log(`Total valid IDs: ${values.length}`);
