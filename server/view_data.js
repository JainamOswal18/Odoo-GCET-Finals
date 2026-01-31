
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database/shiv_furniture.db');

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

async function showData() {
    try {
        console.log('\n--- 👥 PORTAL USERS ---');
        const users = await query(`
            SELECT u.login_id, u.email, u.role, c.name as contact_name, c.id as contact_id 
            FROM users u 
            JOIN contacts c ON u.contact_id = c.id 
            WHERE u.role = 'portal'
        `);
        console.table(users);

        for (const user of users) {
            console.log(`\n--- 📄 INVOICES for ${user.contact_name} (ID: ${user.contact_id}) ---`);
            const invoices = await query(`
                SELECT invoice_number, invoice_date, total_amount, status, payment_status 
                FROM invoices 
                WHERE customer_id = ?`, [user.contact_id]);
            console.table(invoices);

            console.log(`\n--- 📦 SALES ORDERS for ${user.contact_name} (ID: ${user.contact_id}) ---`);
            const orders = await query(`
                SELECT so_number, order_date, total_amount, status 
                FROM sales_orders 
                WHERE customer_id = ?`, [user.contact_id]);
            console.table(orders);

            console.log(`\n--- 💰 PAYMENTS for ${user.contact_name} (ID: ${user.contact_id}) ---`);
            const payments = await query(`
                SELECT payment_number, payment_date, amount, payment_method 
                FROM payments 
                WHERE contact_id = ?`, [user.contact_id]);
            console.table(payments);
        }

    } catch (err) {
        console.error(err);
    } finally {
        db.close();
    }
}

showData();
