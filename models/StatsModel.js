import pool from "../config/db.js";

export const getDashboardStats = async () => {
  try {
    // ------------------------- CUSTOMERS -------------------------
    const [totalCustomersResult] = await pool.query(`
      SELECT COUNT(*) AS totalCustomers
      FROM users
      WHERE role='customer'
    `);
    const totalCustomers = Number(totalCustomersResult[0]?.totalCustomers || 0);

    const [yesterdayCustomersResult] = await pool.query(`
      SELECT COUNT(*) AS yesterdayCustomers
      FROM users
      WHERE role='customer' AND DATE(created_at) = CURDATE() - INTERVAL 1 DAY
    `);
    const yesterdayCustomers = Number(
      yesterdayCustomersResult[0]?.yesterdayCustomers || 0
    );

    const [dayBeforeYesterdayCustomersResult] = await pool.query(`
      SELECT COUNT(*) AS dayBeforeYesterdayCustomers
      FROM users
      WHERE role='customer' AND DATE(created_at) = CURDATE() - INTERVAL 2 DAY
    `);
    const dayBeforeYesterdayCustomers = Number(
      dayBeforeYesterdayCustomersResult[0]?.dayBeforeYesterdayCustomers || 0
    );

    const customerPercentage =
      dayBeforeYesterdayCustomers === 0
        ? yesterdayCustomers === 0
          ? 0
          : 100
        : ((yesterdayCustomers - dayBeforeYesterdayCustomers) /
            dayBeforeYesterdayCustomers) *
          100;

    // ------------------------- ORDERS -------------------------
    const [todayOrdersResult] = await pool.query(`
      SELECT COUNT(*) AS totalOrders
      FROM orders
      WHERE DATE(created_at) = CURDATE()
    `);
    const totalOrders = Number(todayOrdersResult[0]?.totalOrders || 0);

    const [yesterdayOrdersResult] = await pool.query(`
      SELECT COUNT(*) AS totalOrdersPrevious
      FROM orders
      WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY
    `);
    const totalOrdersPrevious = Number(
      yesterdayOrdersResult[0]?.totalOrdersPrevious || 0
    );

    // ------------------------- REVENUE -------------------------
    const [todayRevenueResult] = await pool.query(`
      SELECT IFNULL(SUM(total_amount), 0) AS todayRevenue
      FROM orders
      WHERE status='completed' AND DATE(created_at) = CURDATE()
    `);
    const todayRevenue = Number(todayRevenueResult[0]?.todayRevenue || 0);

    const [revenuePreviousResult] = await pool.query(`
      SELECT IFNULL(SUM(total_amount), 0) AS revenuePrevious
      FROM orders
      WHERE status='completed' AND DATE(created_at) = CURDATE() - INTERVAL 1 DAY
    `);
    const revenuePrevious = Number(
      revenuePreviousResult[0]?.revenuePrevious || 0
    );

    // ------------------------- FEEDBACK -------------------------
    const [newFeedbackTodayResult] = await pool.query(`
      SELECT COUNT(*) AS newFeedbackToday
      FROM feedback
      WHERE DATE(created_at) = CURDATE()
    `);
    const newFeedbackToday = Number(
      newFeedbackTodayResult[0]?.newFeedbackToday || 0
    );

    const [feedbackPreviousResult] = await pool.query(`
      SELECT COUNT(*) AS feedbackPrevious
      FROM feedback
      WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY
    `);
    const feedbackPrevious = Number(
      feedbackPreviousResult[0]?.feedbackPrevious || 0
    );

    const satisfactionPercentage = feedbackPrevious
      ? (newFeedbackToday / feedbackPrevious) * 100
      : 0;

    // ------------------------- RETURN -------------------------
    return {
      totalOrders,
      totalOrdersPrevious,
      totalCustomers,
      todayCustomers: yesterdayCustomers, // for dashboard display
      yesterdayCustomers: dayBeforeYesterdayCustomers,
      customerPercentage: Number(customerPercentage.toFixed(1)),
      todayRevenue: Number(todayRevenue.toFixed(2)),
      revenuePrevious: Number(revenuePrevious.toFixed(2)),
      newFeedbackToday,
      feedbackPrevious,
      satisfactionPercentage: Number(satisfactionPercentage.toFixed(1)),
    };
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    return {
      totalOrders: 0,
      totalOrdersPrevious: 0,
      totalCustomers: 0,
      todayCustomers: 0,
      yesterdayCustomers: 0,
      customerPercentage: 0,
      todayRevenue: 0,
      revenuePrevious: 0,
      newFeedbackToday: 0,
      feedbackPrevious: 0,
      satisfactionPercentage: 0,
    };
  }
};
