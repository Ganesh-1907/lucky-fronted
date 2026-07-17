const fs = require('fs');
const files = [
  'src/app/admin/page.tsx', 
  'src/app/admin/payments/page.tsx', 
  'src/app/admin/reports/page.tsx', 
  'src/app/admin/services/page.tsx', 
  'src/app/admin/users/page.tsx', 
  'src/app/admin/vendors/page.tsx',
  'src/app/vendor/page.tsx',
  'src/app/vendor/bookings/page.tsx',
  'src/app/vendor/earnings/page.tsx',
  'src/app/employee/bookings/page.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes('<table className="w-full">')) {
      content = content.replace(/<table className="w-full">/g, '<table className="w-full whitespace-nowrap">');
      fs.writeFileSync(f, content);
      console.log('Fixed:', f);
    }
  }
});
