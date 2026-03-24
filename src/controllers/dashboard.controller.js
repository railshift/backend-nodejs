import prisma from '../config/database.js';
import logger from '../utils/logger.js';
import { calculateDutyHours } from '../services/dutyHours.service.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/dashboard/stats
 * @access  Private
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

      const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Base query filters based on role
    const baseFilter = userRole === 'USER' 
      ? {
          OR: [
            { locoPilotId: userId },
            { trainManagerId: userId }
          ]
        }
      : {}; // Admin/SuperAdmin can see all

    // 1. Total Shifts  Statistics
    const [
      totalShifts,
      activeShifts,
      completedShifts,
      scheduledShifts,
      reliefPlannedShifts,
      cancelledShifts
    ] = await Promise.all([
      prisma.shift.count({ where: baseFilter }),
      prisma.shift.count({ where: { ...baseFilter, status: 'IN_PROGRESS' } }),
      prisma.shift.count({ where: { ...baseFilter, status: 'COMPLETED' } }),
      prisma.shift.count({ where: { ...baseFilter, status: 'SCHEDULED' } }),
      prisma.shift.count({ where: { ...baseFilter, status: 'RELIEF_PLANNED' } }),
      prisma.shift.count({ where: { ...baseFilter, status: 'CANCELLED' } })
    ]);

    // 2. Today's Statistics
    const [todayShifts, todayCompleted, todayActive] = await Promise.all([
      prisma.shift.count({
        where: {
          ...baseFilter,
          createdAt: { gte: today }
        }
      }),
      prisma.shift.count({
        where: {
          ...baseFilter,
          status: 'COMPLETED',
          signOffDateTime: { gte: today }
        }
      }),
      prisma.shift.count({
        where: {
          ...baseFilter,
          status: 'IN_PROGRESS',
          signOnDateTime: { gte: today }
        }
      })
    ]);

    // 3. This Week's Statistics
    const [weekShifts, weekCompleted] = await Promise.all([
      prisma.shift.count({
        where: {
          ...baseFilter,
          createdAt: { gte: thisWeekStart }
        }
      }),
      prisma.shift.count({
        where: {
          ...baseFilter,
          status: 'COMPLETED',
          signOffDateTime: { gte: thisWeekStart }
        }
      })
    ]);

    // 4. This Month's Statistics
    const [monthShifts, monthCompleted] = await Promise.all([
      prisma.shift.count({
        where: {
          ...baseFilter,
          createdAt: { gte: thisMonthStart }
        }
      }),
      prisma.shift.count({
        where: {
          ...baseFilter,
          status: 'COMPLETED',
          signOffDateTime: { gte: thisMonthStart }
        }
      })
    ]);

    // 5. Alert Statistics
    const alertStats = await prisma.shift.findMany({
      where: {
        ...baseFilter,
        status: { in: ['IN_PROGRESS', 'RELIEF_PLANNED'] }
      },
      select: {
        alert7HrSent: true,
        alert8HrSent: true,
        alert9HrSent: true,
        alert10HrSent: true,
        alert11HrSent: true,
        alert14HrSent: true
      }
    });

    const alertCounts = {
      alert7Hr: alertStats.filter(s => s.alert7HrSent).length,
      alert8Hr: alertStats.filter(s => s.alert8HrSent).length,
      alert9Hr: alertStats.filter(s => s.alert9HrSent).length,
      alert10Hr: alertStats.filter(s => s.alert10HrSent).length,
      alert11Hr: alertStats.filter(s => s.alert11HrSent).length,
      alert14Hr: alertStats.filter(s => s.alert14HrSent).length,
      totalAlerts: alertStats.reduce((sum, s) => 
        sum + (s.alert7HrSent ? 1 : 0) + (s.alert8HrSent ? 1 : 0) + 
        (s.alert9HrSent ? 1 : 0) + (s.alert10HrSent ? 1 : 0) + 
        (s.alert11HrSent ? 1 : 0) + (s.alert14HrSent ? 1 : 0), 0
      )
    };

    // 6. Duty Hours Statistics for competed shifts 
    const completedShiftsWithHours = await prisma.shift.findMany({
      where: {
        ...baseFilter,
        status: 'COMPLETED',
        dutyHours: { not: null }
      },
      select: {
        dutyHours: true
      }
    });

    const dutyHoursStats = {
      totalShifts: completedShiftsWithHours.length,
      totalHours: completedShiftsWithHours.reduce((sum, s) => sum + (s.dutyHours || 0), 0),
      averageHours: completedShiftsWithHours.length > 0 
        ? (completedShiftsWithHours.reduce((sum, s) => sum + (s.dutyHours || 0), 0) / completedShiftsWithHours.length)
        : 0,
      maxHours: completedShiftsWithHours.length > 0 
        ? Math.max(...completedShiftsWithHours.map(s => s.dutyHours || 0))
        : 0,
      minHours: completedShiftsWithHours.length > 0 
        ? Math.min(...completedShiftsWithHours.map(s => s.dutyHours || 0))
        : 0
    };

    // 7. Current Active Shifts with Duty Hours
    const currentActiveShifts = await prisma.shift.findMany({
      where: {
        ...baseFilter,
        status: { in: ['IN_PROGRESS', 'RELIEF_PLANNED'] },
        signOffDateTime: null
      },
      select: {
        id: true,
        trainNumber: true,
        signOnDateTime: true,
        status: true
      }
    });

    const activeShiftsWithDutyHours = currentActiveShifts.map(shift => ({
      id: shift.id,
      trainNumber: shift.trainNumber,
      status: shift.status,
      currentDutyHours: calculateDutyHours(shift.signOnDateTime)
    }));

    // 8. User Statistics (for Admin/SuperAdmin)
    let userStats = null;
    if (userRole === 'ADMIN' || userRole === 'SUPERADMIN') {
      const [totalUsers, activeUsers, pendingUsers] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count({ where: { isVerified: false } })
      ]);

      userStats = {
        total: totalUsers,
        active: activeUsers,
        pendingApproval: pendingUsers
      };
    }

    // 9. Staff Statistics
    const [totalStaff, availableStaff, onDutyStaff] = await Promise.all([
      prisma.staff.count(),
      prisma.staff.count({ where: { status: 'AVAILABLE' } }),
      prisma.staff.count({ where: { status: 'ON_DUTY' } })
    ]);

    const staffStats = {
      total: totalStaff,
      available: availableStaff,
      onDuty: onDutyStaff,
      unavailable: totalStaff - availableStaff - onDutyStaff
    };

    // 10. Shifts by Section (Top 5)
    const shiftsBySection = await prisma.shift.groupBy({
      by: ['section'],
      where: baseFilter,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    // 11. Shifts by Duty Type
    const shiftsByDutyType = await prisma.shift.groupBy({
      by: ['dutyType'],
      where: baseFilter,
      _count: {
        id: true
      }
    });

    // Compile response
    const stats = {
      overview: {
        totalShifts,
        activeShifts,
        completedShifts,
        scheduledShifts,
        reliefPlannedShifts,
        cancelledShifts
      },
      today: {
        shiftsCreated: todayShifts,
        shiftsCompleted: todayCompleted,
        activeShifts: todayActive
      },
      thisWeek: {
        shiftsCreated: weekShifts,
        shiftsCompleted: weekCompleted
      },
      thisMonth: {
        shiftsCreated: monthShifts,
        shiftsCompleted: monthCompleted
      },
      alerts: alertCounts,
      dutyHours: {
        ...dutyHoursStats,
        averageHours: parseFloat(dutyHoursStats.averageHours.toFixed(2)),
        totalHours: parseFloat(dutyHoursStats.totalHours.toFixed(2)),
        maxHours: parseFloat(dutyHoursStats.maxHours.toFixed(2)),
        minHours: parseFloat(dutyHoursStats.minHours.toFixed(2))
      },
      activeShiftsDetails: activeShiftsWithDutyHours.map(shift => ({
        ...shift,
        currentDutyHours: parseFloat(shift.currentDutyHours.toFixed(2))
      })),
      staff: staffStats,
      topSections: shiftsBySection.map(s => ({
        section: s.section,
        count: s._count.id
      })),
      dutyTypeDistribution: shiftsByDutyType.map(s => ({
        dutyType: s.dutyType,
        count: s._count.id
      }))
    };

    // Add user stats for admin
    if (userStats) {
      stats.users = userStats;
    }

    logger.info(`Dashboard stats retrieved for user ${userId}`);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get recent activities
 * @route   GET /api/v1/dashboard/recent-activities
 * @access  Private
 */
export const getRecentActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { limit = 20, offset = 0, type } = req.query;

    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    const baseFilter = userRole === 'USER'
      ? {
          shift: {
            OR: [
              { locoPilotId: userId },
              { trainManagerId: userId }
            ]
          }
        }
      : {}; // Admin/SuperAdmin can see all

    const typeFilter = type ? { logType: type } : {};

    const activities = await prisma.dutyLog.findMany({
      where: {
        ...baseFilter,
        ...typeFilter
      },
      include: {
        shift: {
          select: {
            id: true,
            trainNumber: true,
            trainName: true,
            status: true,
            section: true
          }
        },
        staff: {
          select: {
            name: true,
            employeeId: true
          }
        }
      },
      orderBy: {
        logTime: 'desc'
      },
      take: limitNum,
      skip: offsetNum
    });

    const totalCount = await prisma.dutyLog.count({
      where: {
        ...baseFilter,
        ...typeFilter
      }
    });

    // Format activities
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.logType,
      timestamp: activity.logTime,
      dutyHours: activity.dutyHoursAtLog,
      remarks: activity.remarks,
      shift: {
        id: activity.shift.id,
        trainNumber: activity.shift.trainNumber,
        trainName: activity.shift.trainName,
        status: activity.shift.status,
        section: activity.shift.section
      },
      staff: {
        name: activity.staff.name,
        employeeId: activity.staff.employeeId
      },
      metadata: activity.metadata
    }));

    logger.info(`Recent activities retrieved for user ${userId}`);

    res.status(200).json({
      success: true,
      data: {
        activities: formattedActivities,
        pagination: {
          total: totalCount,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < totalCount
        }
      }
    });
  } catch (error) {
    logger.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get shift trends (for charts)
 * @route   GET /api/v1/dashboard/trends
 * @access  Private
 */
export const getShiftTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { days = 7 } = req.query;

    const daysNum = parseInt(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const baseFilter = userRole === 'USER'
      ? {
          OR: [
            { locoPilotId: userId },
            { trainManagerId: userId }
          ]
        }
      : {};


    const shifts = await prisma.shift.findMany({
      where: {
        ...baseFilter,
        createdAt: {
          gte: startDate
        }
      },
      select: {
        createdAt: true,
        status: true,
        dutyHours: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date
    const trendData = {};
    
    for (let i = 0; i < daysNum; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (daysNum - 1 - i));
      const dateKey = date.toISOString().split('T')[0];
      trendData[dateKey] = {
        date: dateKey,
        total: 0,
        completed: 0,
        active: 0,
        scheduled: 0,
        cancelled: 0,
        averageDutyHours: 0
      };
    }


    shifts.forEach(shift => {
      const dateKey = shift.createdAt.toISOString().split('T')[0];
      if (trendData[dateKey]) {
        trendData[dateKey].total++;
        if (shift.status === 'COMPLETED') trendData[dateKey].completed++;
        if (shift.status === 'IN_PROGRESS') trendData[dateKey].active++;
        if (shift.status === 'SCHEDULED') trendData[dateKey].scheduled++;
        if (shift.status === 'CANCELLED') trendData[dateKey].cancelled++;
      }
    });


    for (const dateKey in trendData) {
      const dayShifts = shifts.filter(
        s => s.createdAt.toISOString().split('T')[0] === dateKey && s.dutyHours
      );
      if (dayShifts.length > 0) {
        const totalHours = dayShifts.reduce((sum, s) => sum + (s.dutyHours || 0), 0);
        trendData[dateKey].averageDutyHours = parseFloat((totalHours / dayShifts.length).toFixed(2));
      }
    }

    const trends = Object.values(trendData);

    logger.info(`Shift trends retrieved for user ${userId} (${daysNum} days)`);

    res.status(200).json({
      success: true,
      data: {
        trends,
        period: {
          days: daysNum,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    logger.error('Get shift trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shift trends',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get alert summary
 * @route   GET /api/v1/dashboard/alerts-summary
 * @access  Private
 */
export const getAlertsSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const baseFilter = userRole === 'USER'
      ? {
          OR: [
            { locoPilotId: userId },
            { trainManagerId: userId }
          ]
        }
      : {};

    const activeShiftsWithAlerts = await prisma.shift.findMany({
      where: {
        ...baseFilter,
        status: { in: ['IN_PROGRESS', 'RELIEF_PLANNED'] },
        signOffDateTime: null
      },
      select: {
        id: true,
        trainNumber: true,
        trainName: true,
        signOnDateTime: true,
        status: true,
        section: true,
        alert7HrSent: true,
        alert7HrSentAt: true,
        alert8HrSent: true,
        alert8HrSentAt: true,
        alert8HrResponse: true,
        alert9HrSent: true,
        alert9HrSentAt: true,
        alert9HrResponse: true,
        alert10HrSent: true,
        alert10HrSentAt: true,
        alert10HrResponse: true,
        alert11HrSent: true,
        alert11HrSentAt: true,
        alert11HrResponse: true,
        alert14HrSent: true,
        alert14HrSentAt: true,
        alert14HrResponse: true,
        locomotive: {
          select: {
            locomotiveNo: true
          }
        },
        locoPilot: {
          select: {
            name: true,
            employeeId: true,
            phone: true,
            division: true
          }
        },
        trainManager: {
          select: {
            name: true,
            employeeId: true,
            phone: true,
            division: true
          }
        }
      },
      orderBy: {
        signOnDateTime: 'asc'
      }
    });

    const alerts = [];
    
    activeShiftsWithAlerts.forEach(shift => {
      const dutyHours = calculateDutyHours(shift.signOnDateTime);

      const createAlert = (type, sentAt, response) => ({
        id: `${shift.id}-${type}`,
        shiftId: shift.id,
        type: `DUTY_${type}`,
        title: `${type} Alert - Train #${shift.trainNumber}`,
        message: `Duty hours: ${dutyHours.toFixed(2)} - Action required`,
        dutyHours: parseFloat(dutyHours.toFixed(2)),
        targetDivision: shift.locoPilot?.division || shift.trainManager?.division || 'GENERAL',
        status: 'SENT',
        sentAt: sentAt,
        createdAt: sentAt,
        responseAction: response,
        shift: {
          trainNumber: shift.trainNumber,
          trainName: shift.trainName,
          section: shift.section,
          status: shift.status,
          locoPilot: shift.locoPilot?.name,
          trainManager: shift.trainManager?.name,
          locomotiveNo: shift.locomotive?.locomotiveNo || 'N/A'
        }
      });

      if (shift.alert7HrSent) alerts.push(createAlert('7HR', shift.alert7HrSentAt, null));
      if (shift.alert8HrSent) alerts.push(createAlert('8HR', shift.alert8HrSentAt, shift.alert8HrResponse));
      if (shift.alert9HrSent) alerts.push(createAlert('9HR', shift.alert9HrSentAt, shift.alert9HrResponse));
      if (shift.alert10HrSent) alerts.push(createAlert('10HR', shift.alert10HrSentAt, shift.alert10HrResponse));
      if (shift.alert11HrSent) alerts.push(createAlert('11HR', shift.alert11HrSentAt, shift.alert11HrResponse));
      if (shift.alert14HrSent) alerts.push(createAlert('14HR', shift.alert14HrSentAt, shift.alert14HrResponse));
    });

    alerts.sort((a, b) => {
      if (b.dutyHours !== a.dutyHours) {
        return b.dutyHours - a.dutyHours;
      }
      return new Date(b.sentAt) - new Date(a.sentAt);
    });

    logger.info(`Alert summary retrieved for user ${userId}: ${alerts.length} alerts`);

    res.status(200).json({
      success: true,
      data: {
        alerts,
        totalAlerts: alerts.length,
        pendingResponses: alerts.filter(a => !a.responseAction && 
          (a.type === 'DUTY_8HR' || a.type === 'DUTY_9HR' || a.type === 'DUTY_11HR' || a.type === 'DUTY_14HR')
        ).length
      }
    });
  } catch (error) {
    logger.error('Get alerts summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve alerts summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
