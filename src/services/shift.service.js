import prisma from '../config/database.js';
import logger from '../utils/logger.js';
import ApiError from '../middleware/errorHandler.js';

class ShiftService {
  // Find or create locomotive
  async findOrCreateLocomotive(locomotiveNo) {
    try {
      let locomotive = await prisma.locomotive.findUnique({
        where: { locomotiveNo },
      });

      if (!locomotive) {
        logger.info(`Creating new locomotive: ${locomotiveNo}`);
        locomotive = await prisma.locomotive.create({
          data: {
            locomotiveNo,
            autoCreated: true,
          },
        });
        logger.info(`✅ Locomotive created: ${locomotiveNo}`);
      }

      return locomotive;
    } catch (error) {
      logger.error('Error in findOrCreateLocomotive:', error);
      throw error;
    }
  }

  // Find or create staff (loco pilot or train manager)
  async findOrCreateStaff(employeeId, name, staffType, phone = null) {
    try {
      let staff = await prisma.staff.findUnique({
        where: { employeeId },
      });

      if (!staff) {
        logger.info(`Creating new staff: ${name} (${employeeId}) - ${staffType}`);
        staff = await prisma.staff.create({
          data: {
            employeeId,
            name,
            staffType,
            phone,
            autoCreated: true,
          },
        });
        logger.info(`✅ Staff created: ${name} (${employeeId})`);
      } else {
        // Update name and phone if they have changed
        const updateData = {};
        if (staff.name !== name) {
          updateData.name = name;
        }
        if (phone && staff.phone !== phone) {
          updateData.phone = phone;
        }
        
        if (Object.keys(updateData).length > 0) {
          staff = await prisma.staff.update({
            where: { employeeId },
            data: updateData,
          });
          logger.info(`Updated staff: ${name} - ${Object.keys(updateData).join(', ')}`);
        }
      }

      return staff;
    } catch (error) {
      logger.error('Error in findOrCreateStaff:', error);
      throw error;
    }
  }

  // Calculate duty hours from sign on time
  calculateDutyHours(signOnTime, currentTime = new Date()) {
    const signOn = new Date(signOnTime);
    const current = new Date(currentTime);
    const diffMs = current - signOn;
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, diffHours);
  }

  // Create shift
  async createShift(data, userId) {
    try {
      // Find or create locomotive
      const locomotive = await this.findOrCreateLocomotive(data.locomotiveNo);

      // Find or create loco pilot
      const locoPilot = await this.findOrCreateStaff(
        data.locoPilot.employeeId,
        data.locoPilot.name,
        'LOCO_PILOT',
        data.locoPilot.phone
      );

      // Find or create train manager
      const trainManager = await this.findOrCreateStaff(
        data.trainManager.employeeId,
        data.trainManager.name,
        'TRAIN_MANAGER',
        data.trainManager.phone
      );

      // Check if staff are already on duty
      const activeShifts = await prisma.shift.findMany({
        where: {
          OR: [
            { locoPilotId: locoPilot.id },
            { trainManagerId: trainManager.id },
          ],
          status: {
            in: ['SCHEDULED', 'IN_PROGRESS'],
          },
          signOffDateTime: null,
        },
      });

      if (activeShifts.length > 0) {
        const busyStaff = [];
        activeShifts.forEach(shift => {
          if (shift.locoPilotId === locoPilot.id) {
            busyStaff.push(`Loco Pilot ${locoPilot.name}`);
          }
          if (shift.trainManagerId === trainManager.id) {
            busyStaff.push(`Train Manager ${trainManager.name}`);
          }
        });
        throw new ApiError(
          400,
          `Staff already on duty: ${[...new Set(busyStaff)].join(', ')}`
        );
      }

      // Calculate initial duty hours
      const dutyHours = this.calculateDutyHours(data.signOnDateTime);

      // Create shift
      const shift = await prisma.shift.create({
        data: {
          trainNumber: data.trainNumber,
          trainName: data.trainName,
          locomotiveId: locomotive.id,
          locoPilotId: locoPilot.id,
          trainManagerId: trainManager.id,
          trainArrivalDateTime: new Date(data.trainArrivalDateTime),
          signOnDateTime: new Date(data.signOnDateTime),
          timeOfTO: data.timeOfTO ? new Date(data.timeOfTO) : null,
          departureDateTime: data.departureDateTime ? new Date(data.departureDateTime) : null,
          signOnStation: data.signOnStation,
          signOffStation: data.signOffStation || null,
          section: data.section,
          dutyType: data.dutyType,
          signOffDateTime: data.signOffDateTime ? new Date(data.signOffDateTime) : null,
          dutyHours,
          status: 'IN_PROGRESS',
          createdById: userId,
        },
        include: {
          locomotive: true,
          locoPilot: true,
          trainManager: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              employeeId: true,
            },
          },
        },
      });

      // Create duty log for sign-on
      await prisma.dutyLog.create({
        data: {
          shiftId: shift.id,
          staffId: locoPilot.id,
          logType: 'SIGN_ON',
          dutyHoursAtLog: 0,
          remarks: 'Shift started',
        },
      });

      await prisma.dutyLog.create({
        data: {
          shiftId: shift.id,
          staffId: trainManager.id,
          logType: 'SIGN_ON',
          dutyHoursAtLog: 0,
          remarks: 'Shift started',
        },
      });

      // Update staff status to ON_DUTY
      await prisma.staff.updateMany({
        where: {
          id: {
            in: [locoPilot.id, trainManager.id],
          },
        },
        data: {
          status: 'ON_DUTY',
        },
      });

      logger.info(`Shift created successfully: ${shift.id}`);
      return shift;
    } catch (error) {
      logger.error('Error creating shift:', error);
      throw error;
    }
  }

  // Get shift by ID
  async getShiftById(shiftId) {
    try {
      const shift = await prisma.shift.findUnique({
        where: { id: shiftId },
        include: {
          locomotive: true,
          locoPilot: true,
          trainManager: true,
          notifications: {
            orderBy: { createdAt: 'desc' },
          },
          dutyLogs: {
            orderBy: { logTime: 'desc' },
            include: {
              staff: {
                select: {
                  id: true,
                  name: true,
                  employeeId: true,
                  staffType: true,
                  phone: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              employeeId: true,
            },
          },
        },
      });

      if (!shift) {
        throw new ApiError(404, 'Shift not found');
      }

      // Calculate current duty hours
      if (shift.status === 'IN_PROGRESS' && !shift.signOffDateTime) {
        shift.dutyHours = this.calculateDutyHours(shift.signOnDateTime);
      }

      return shift;
    } catch (error) {
      logger.error('Error fetching shift:', error);
      throw error;
    }
  }

  // List shifts with filters
  async listShifts(filters = {}, page = 1, limit = 20) {
    try {
      const where = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.trainNumber) {
        where.trainNumber = {
          contains: filters.trainNumber,
          mode: 'insensitive',
        };
      }

      if (filters.locoPilotId) {
        where.locoPilotId = filters.locoPilotId;
      }

      if (filters.trainManagerId) {
        where.trainManagerId = filters.trainManagerId;
      }

      if (filters.startDate || filters.endDate) {
        where.trainArrivalDateTime = {};
        if (filters.startDate) {
          where.trainArrivalDateTime.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.trainArrivalDateTime.lte = new Date(filters.endDate);
        }
      }

      const skip = (page - 1) * limit;

      const [shifts, total] = await Promise.all([
        prisma.shift.findMany({
          where,
          include: {
            locomotive: true,
            locoPilot: true,
            trainManager: true,
            _count: {
              select: {
                notifications: true,
                dutyLogs: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.shift.count({ where }),
      ]);

      // Calculate current duty hours for in-progress shifts
      const shiftsWithDutyHours = shifts.map(shift => {
        if (shift.status === 'IN_PROGRESS' && !shift.signOffDateTime) {
          return {
            ...shift,
            dutyHours: this.calculateDutyHours(shift.signOnDateTime),
          };
        }
        return shift;
      });

      return {
        shifts: shiftsWithDutyHours,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error listing shifts:', error);
      throw error;
    }
  }

  // Update shift
  async updateShift(shiftId, data, userId) {
    try {
      const shift = await prisma.shift.findUnique({
        where: { id: shiftId },
        include: {
          locoPilot: true,
          trainManager: true,
        },
      });

      if (!shift) {
        throw new ApiError(404, 'Shift not found');
      }

      const updateData = {
        updatedById: userId,
      };

      // Update time fields
      if (data.timeOfTO) {
        updateData.timeOfTO = new Date(data.timeOfTO);
        
        // Log take over
        await prisma.dutyLog.create({
          data: {
            shiftId: shift.id,
            staffId: shift.locoPilotId,
            logType: 'TAKE_OVER',
            dutyHoursAtLog: this.calculateDutyHours(shift.signOnDateTime),
            remarks: 'Train take over',
          },
        });
      }

      if (data.departureDateTime) {
        updateData.departureDateTime = new Date(data.departureDateTime);
        
        // Log departure
        await prisma.dutyLog.create({
          data: {
            shiftId: shift.id,
            staffId: shift.locoPilotId,
            logType: 'DEPARTURE',
            dutyHoursAtLog: this.calculateDutyHours(shift.signOnDateTime),
            remarks: 'Train departed',
          },
        });
      }

      // Update new fields
      if (data.signOffDateTime) {
        updateData.signOffDateTime = new Date(data.signOffDateTime);
      }

      if (data.signOffStation) {
        updateData.signOffStation = data.signOffStation;
      }

      if (data.section) {
        updateData.section = data.section;
      }

      if (data.dutyType) {
        updateData.dutyType = data.dutyType;
      }

      // lobbySignOn/lobbySignOff removed from schema

      // Handle shift completion with signOffDateTime
      if (data.signOffDateTime) {
        updateData.signOffDateTime = new Date(data.signOffDateTime);
        updateData.status = 'COMPLETED';
        updateData.dutyHours = this.calculateDutyHours(
          shift.signOnDateTime,
          data.signOffDateTime
        );

        // Log release
        await prisma.dutyLog.createMany({
          data: [
            {
              shiftId: shift.id,
              staffId: shift.locoPilotId,
              logType: 'RELEASE',
              dutyHoursAtLog: updateData.dutyHours,
              remarks: 'Shift completed',
            },
            {
              shiftId: shift.id,
              staffId: shift.trainManagerId,
              logType: 'RELEASE',
              dutyHoursAtLog: updateData.dutyHours,
              remarks: 'Shift completed',
            },
          ],
        });

        // Update staff status to AVAILABLE
        await prisma.staff.updateMany({
          where: {
            id: {
              in: [shift.locoPilotId, shift.trainManagerId],
            },
          },
          data: {
            status: 'AVAILABLE',
          },
        });
      }

      if (data.status) {
        updateData.status = data.status;
      }

      if (data.reliefPlanned !== undefined) {
        updateData.reliefPlanned = data.reliefPlanned;
        
        if (data.reliefPlanned) {
          updateData.status = 'RELIEF_PLANNED';
          
          // Log relief planned
          await prisma.dutyLog.createMany({
            data: [
              {
                shiftId: shift.id,
                staffId: shift.locoPilotId,
                logType: 'RELIEF_PLANNED',
                dutyHoursAtLog: this.calculateDutyHours(shift.signOnDateTime),
                remarks: data.reliefReason || 'Relief planned',
              },
              {
                shiftId: shift.id,
                staffId: shift.trainManagerId,
                logType: 'RELIEF_PLANNED',
                dutyHoursAtLog: this.calculateDutyHours(shift.signOnTime),
                remarks: data.reliefReason || 'Relief planned',
              },
            ],
          });
        }
      }

      if (data.reliefReason) {
        updateData.reliefReason = data.reliefReason;
      }

      const updatedShift = await prisma.shift.update({
        where: { id: shiftId },
        data: updateData,
        include: {
          locomotive: true,
          locoPilot: true,
          trainManager: true,
          updatedBy: {
            select: {
              id: true,
              name: true,
              employeeId: true,
            },
          },
        },
      });

      logger.info(`✅ Shift updated successfully: ${shiftId}`);
      return updatedShift;
    } catch (error) {
      logger.error('Error updating shift:', error);
      throw error;
    }
  }

  // Delete shift
  async deleteShift(shiftId) {
    try {
      const shift = await prisma.shift.findUnique({
        where: { id: shiftId },
      });

      if (!shift) {
        throw new ApiError(404, 'Shift not found');
      }

      if (shift.status === 'IN_PROGRESS') {
        throw new ApiError(400, 'Cannot delete an in-progress shift');
      }

      await prisma.shift.delete({
        where: { id: shiftId },
      });

      logger.info(`✅ Shift deleted successfully: ${shiftId}`);
      return { message: 'Shift deleted successfully' };
    } catch (error) {
      logger.error('Error deleting shift:', error);
      throw error;
    }
  }

  // Get active shifts summary
  async getActiveShiftsSummary() {
    try {
      const activeShifts = await prisma.shift.findMany({
        where: {
          status: 'IN_PROGRESS',
          signOffTime: null,
        },
        include: {
          locomotive: true,
          locoPilot: true,
          trainManager: true,
        },
      });

      const summary = activeShifts.map(shift => {
        const dutyHours = this.calculateDutyHours(shift.signOnTime);
        let alertLevel = 'normal';
        
        if (dutyHours >= 14) alertLevel = 'critical';
        else if (dutyHours >= 12) alertLevel = 'high';
        else if (dutyHours >= 9) alertLevel = 'warning';
        else if (dutyHours >= 8) alertLevel = 'info';

        return {
          ...shift,
          dutyHours,
          alertLevel,
        };
      });

      return {
        totalActive: summary.length,
        shifts: summary,
      };
    } catch (error) {
      logger.error('Error fetching active shifts summary:', error);
      throw error;
    }
  }
}

export default new ShiftService();
