import pool from "../config/db.js";

export const getDashboardStats = async () => {
  // Total Orders
  const [ordersResult] = await pool.query("SELECT COUNT(*) AS totalOrders, SUM(total_price) AS totalRevenue, AVG(feedback) AS averageFeedback FROM orders");
  const ordersStats = ordersResult[0];

  // Total Customers
  const [customersResult] = await pool.query("SELECT COUNT(*) AS totalCustomers FROM user WHERE role = 'customer'");
  const totalCustomers = customersResult[0].totalCustomers;

  return {
    totalOrders: ordersStats.totalOrders || 0,
    totalRevenue: ordersStats.totalRevenue || 0,
    averageFeedback: ordersStats.averageFeedback ? Number(ordersStats.averageFeedback.toFixed(1)) : 0,
    totalCustomers,
  };
};
