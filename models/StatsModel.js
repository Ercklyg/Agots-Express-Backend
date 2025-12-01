import pool from "../config/db.js";

export const getDashboardStats = async () => {
  // ------------------------- CUSTOMERS -------------------------
  // Total customers (all-time)
  const [totalCustomersResult] = await pool.query(`
    SELECT COUNT(*) AS totalCustomers
    FROM users
    WHERE role='customer'
  `);
  const totalCustomers = totalCustomersResult[0]?.totalCustomers || 0;

  // Customers created yesterday (full day)
  const [yesterdayCustomersResult] = await pool.query(`
    SELECT COUNT(*) AS yesterdayCustomers
    FROM users
    WHERE role='customer'
      AND DATE(created_at) = CURDATE() - INTERVAL 1 DAY
  `);
  const yesterdayCustomers =
    yesterdayCustomersResult[0]?.yesterdayCustomers || 0;

  // Customers created the day before yesterday
  const [dayBeforeYesterdayCustomersResult] = await pool.query(`
    SELECT COUNT(*) AS dayBeforeYesterdayCustomers
    FROM users
    WHERE role='customer'
      AND DATE(created_at) = CURDATE() - INTERVAL 2 DAY
  `);
  const dayBeforeYesterdayCustomers =
    dayBeforeYesterdayCustomersResult[0]?.dayBeforeYesterdayCustomers || 0;

  // Customer growth percentage (yesterday vs day before yesterday)
  let customerPercentage = 0;
  if (dayBeforeYesterdayCustomers === 0) {
    if (yesterdayCustomers === 0) customerPercentage = 0;
    else customerPercentage = 100; // all new customers
  } else {
    customerPercentage =
      ((yesterdayCustomers - dayBeforeYesterdayCustomers) /
        dayBeforeYesterdayCustomers) *
      100;
  }

  // ------------------------- ORDERS -------------------------
  const [todayOrdersResult] = await pool.query(`
    SELECT COUNT(*) AS totalOrders
    FROM orders
    WHERE DATE(created_at) = CURDATE()
  `);

  const [yesterdayOrdersResult] = await pool.query(`
    SELECT COUNT(*) AS totalOrdersPrevious
    FROM orders
    WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY
  `);

  const totalOrders = todayOrdersResult[0]?.totalOrders || 0;
  const totalOrdersPrevious =
    yesterdayOrdersResult[0]?.totalOrdersPrevious || 0;

  // ------------------------- REVENUE -------------------------
  const [todayRevenueResult] = await pool.query(`
    SELECT IFNULL(SUM(total_amount),0) AS todayRevenue
    FROM orders
    WHERE status='completed' AND DATE(created_at) = CURDATE()
  `);

  const [revenuePreviousResult] = await pool.query(`
    SELECT IFNULL(SUM(total_amount),0) AS revenuePrevious
    FROM orders
    WHERE status='completed' AND DATE(created_at) = CURDATE() - INTERVAL 1 DAY
  `);

  const todayRevenue = Number(
    todayRevenueResult[0]?.todayRevenue.toFixed(2) || 0
  );
  const revenuePrevious = Number(
    revenuePreviousResult[0]?.revenuePrevious.toFixed(2) || 0
  );

  // ------------------------- FEEDBACK -------------------------
  const [newFeedbackTodayResult] = await pool.query(`
    SELECT COUNT(*) AS newFeedbackToday
    FROM feedback
    WHERE DATE(created_at) = CURDATE()
  `);

  const [feedbackPreviousResult] = await pool.query(`
    SELECT COUNT(*) AS feedbackPrevious
    FROM feedback
    WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY
  `);

  const newFeedbackToday = newFeedbackTodayResult[0]?.newFeedbackToday || 0;
  const feedbackPrevious = feedbackPreviousResult[0]?.feedbackPrevious || 0;

  const satisfactionPercentage = feedbackPrevious
    ? (newFeedbackToday / feedbackPrevious) * 100
    : 0;

  return {
    totalOrders,
    totalOrdersPrevious,
    totalCustomers,
    todayCustomers: yesterdayCustomers, // use yesterday for dashboard display
    yesterdayCustomers: dayBeforeYesterdayCustomers,
    customerPercentage: Number(customerPercentage.toFixed(1)),
    todayRevenue,
    revenuePrevious,
    newFeedbackToday,
    feedbackPrevious,
    satisfactionPercentage: Number(satisfactionPercentage.toFixed(1)),
  };
};
