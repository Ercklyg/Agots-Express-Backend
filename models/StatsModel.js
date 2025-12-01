import pool from "../config/db.js";

/**
 * Fetch dashboard statistics
 */
export const getDashboardStats = async () => {
  // ------------------------- ORDERS -------------------------
  const [todayOrdersResult] = await pool.query(`
    SELECT COUNT(*) AS totalOrders
    FROM orders
    WHERE DATE(created_at) = CURDATE()
  `);
  const totalOrders = todayOrdersResult[0].totalOrders || 0;

  const [yesterdayOrdersResult] = await pool.query(`
    SELECT COUNT(*) AS totalOrdersPrevious
    FROM orders
    WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY
  `);
  const totalOrdersPrevious = yesterdayOrdersResult[0].totalOrdersPrevious || 0;

  // ------------------------- CUSTOMERS -------------------------
  // Total customers
  const [totalCustomersResult] = await pool.query(`
    SELECT COUNT(*) AS totalCustomers
    FROM users
    WHERE role='customer'
  `);
  const totalCustomers = totalCustomersResult[0].totalCustomers || 0;

  // Current week customers (Mon-Sun)
  const [currentWeekResult] = await pool.query(`
    SELECT COUNT(*) AS currentWeekCustomers
    FROM users
    WHERE role='customer'
      AND created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
      AND created_at < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
  `);
  const currentWeekCustomers = currentWeekResult[0].currentWeekCustomers || 0;

  // Previous week customers
  const [previousWeekResult] = await pool.query(`
    SELECT COUNT(*) AS previousWeekCustomers
    FROM users
    WHERE role='customer'
      AND created_at >= DATE_SUB(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
      AND created_at < DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
  `);
  const previousWeekCustomers =
    previousWeekResult[0].previousWeekCustomers || 0;

  // Customer growth percentage (week-over-week)
  let customerPercentage = 0;
  if (previousWeekCustomers === 0) {
    customerPercentage = currentWeekCustomers > 0 ? 100 : 0;
  } else {
    customerPercentage =
      ((currentWeekCustomers - previousWeekCustomers) / previousWeekCustomers) *
      100;
  }

  // ------------------------- REVENUE -------------------------
  const [todayRevenueResult] = await pool.query(`
    SELECT IFNULL(SUM(total_amount),0) AS todayRevenue
    FROM orders
    WHERE status='completed' AND DATE(created_at) = CURDATE()
  `);
  const todayRevenue = Number(todayRevenueResult[0].todayRevenue.toFixed(2));

  const [revenuePreviousResult] = await pool.query(`
    SELECT IFNULL(SUM(total_amount),0) AS revenuePrevious
    FROM orders
    WHERE status='completed' AND DATE(created_at) = CURDATE() - INTERVAL 1 DAY
  `);
  const revenuePrevious = Number(
    revenuePreviousResult[0].revenuePrevious.toFixed(2)
  );

  // ------------------------- FEEDBACK -------------------------
  const [newFeedbackTodayResult] = await pool.query(`
    SELECT COUNT(*) AS newFeedbackToday
    FROM feedback
    WHERE DATE(created_at) = CURDATE()
  `);
  const newFeedbackToday = newFeedbackTodayResult[0].newFeedbackToday || 0;

  const [feedbackPreviousResult] = await pool.query(`
    SELECT COUNT(*) AS feedbackPrevious
    FROM feedback
    WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY
  `);
  const feedbackPrevious = feedbackPreviousResult[0].feedbackPrevious || 0;

  const satisfactionPercentage = feedbackPrevious
    ? (newFeedbackToday / feedbackPrevious) * 100
    : 0;

  // ------------------------- RETURN -------------------------
  return {
    // Orders
    totalOrders,
    totalOrdersPrevious,

    // Customers
    totalCustomers,
    currentWeekCustomers,
    previousWeekCustomers,
    customerPercentage: Number(customerPercentage.toFixed(1)),

    // Revenue
    todayRevenue,
    revenuePrevious,

    // Feedback
    newFeedbackToday,
    feedbackPrevious,
    satisfactionPercentage: Number(satisfactionPercentage.toFixed(1)),
  };
};
