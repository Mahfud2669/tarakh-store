const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    const email = 'mahfud@yopmail.com';
    const password = '123456';
    const name = 'Mahfud Admin';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Admin User Setup');
    console.log('================');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${name}`);
    console.log(`\nHashed Password:`);
    console.log(hashedPassword);
    console.log('\n✅ Use this hashed password when inserting into database:');
    console.log(`INSERT INTO admin_users (email, password, name, created_at, updated_at) VALUES ('${email}', '${hashedPassword}', '${name}', NOW(), NOW());`);
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser();
