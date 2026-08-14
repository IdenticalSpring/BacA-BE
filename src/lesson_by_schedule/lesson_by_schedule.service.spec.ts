import { Class } from '../class/class.entity';
import { ClassSchedule } from '../classSchedule/classSchedule.entity';
import { Schedule } from '../schedule/schedule.entity';
import { LessonBySchedule } from './lesson_by_schedule.entity';
import { LessonByScheduleService } from './lesson_by_schedule.service';

describe('LessonByScheduleService', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  const classEntity = { id: 67, isDelete: false } as Class;
  const schedule = {
    id: 23,
    isDelete: false,
    dayOfWeek: 4,
    startTime: '17:30:00',
    endTime: '19:30:00',
  } as Schedule;

  const createHarness = (existingLessons: LessonBySchedule[] = []) => {
    const classQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([classEntity]),
    };
    const lessonRepository = {
      find: jest.fn().mockResolvedValue(existingLessons),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    };
    const scheduleRepository = {
      find: jest.fn().mockResolvedValue([schedule]),
    };
    const classRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(classQueryBuilder),
    };
    const manager = {
      getRepository: jest.fn((entity) => {
        if (entity === Class) return classRepository;
        if (entity === Schedule) return scheduleRepository;
        if (entity === LessonBySchedule) return lessonRepository;
        throw new Error('Unexpected repository');
      }),
    };
    const rootRepository: any = {
      manager: {
        transaction: jest.fn((callback) => callback(manager)),
      },
    };
    const service = new LessonByScheduleService(
      rootRepository,
      {} as any,
      {} as any,
      {} as any,
    );

    return {
      service,
      classQueryBuilder,
      lessonRepository,
      rootRepository,
    };
  };

  it('locks the owning class and creates a previously missing slot', async () => {
    const harness = createHarness();

    const result = await harness.service.createMany({
      lessons: [
        {
          classID: 67,
          scheduleID: 23,
          lessonID: null,
          homeWorkId: null,
          startTime: '17:30:00',
          endTime: '19:30:00',
          date: '2026-08-19' as any,
        },
      ],
    });

    expect(harness.classQueryBuilder.setLock).toHaveBeenCalledWith(
      'pessimistic_write',
    );
    expect(harness.lessonRepository.save).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
  });

  it('does not insert a slot that exists after obtaining the class lock', async () => {
    const existing = {
      id: 12816,
      class: classEntity,
      schedule,
      date: '2026-08-19',
      isDelete: false,
    } as any;
    const harness = createHarness([existing]);

    const result = await harness.service.createMany({
      lessons: [
        {
          classID: 67,
          scheduleID: 23,
          lessonID: null,
          homeWorkId: null,
          startTime: '17:30:00',
          endTime: '19:30:00',
          date: '2026-08-19' as any,
        },
      ],
    });

    expect(harness.lessonRepository.save).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('extends each configured schedule from its own latest date', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 7, 14, 12, 0, 0));

    const mondaySchedule = {
      id: 19,
      isDelete: false,
      dayOfWeek: 2,
      startTime: '17:30:00',
      endTime: '19:30:00',
    } as Schedule;
    const wednesdaySchedule = {
      id: 23,
      isDelete: false,
      dayOfWeek: 4,
      startTime: '17:30:00',
      endTime: '19:30:00',
    } as Schedule;
    const existingLessons = [
      {
        id: 1,
        class: classEntity,
        schedule: mondaySchedule,
        date: '2027-04-05',
        isDelete: false,
      },
      {
        id: 2,
        class: classEntity,
        schedule: wednesdaySchedule,
        date: '2026-09-30',
        isDelete: false,
      },
    ] as any[];
    const configuredClassSchedules = [
      {
        id: 88,
        class: classEntity,
        schedule: mondaySchedule,
        isDelete: false,
      },
      {
        id: 89,
        class: classEntity,
        schedule: wednesdaySchedule,
        isDelete: false,
      },
    ] as ClassSchedule[];
    const classQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([classEntity]),
    };
    const transactionLessonRepository = {
      find: jest.fn().mockResolvedValue(existingLessons),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    };
    const transactionClassScheduleRepository = {
      find: jest.fn().mockResolvedValue(configuredClassSchedules),
    };
    const manager = {
      getRepository: jest.fn((entity) => {
        if (entity === Class) {
          return {
            createQueryBuilder: jest.fn().mockReturnValue(classQueryBuilder),
          };
        }
        if (entity === LessonBySchedule) return transactionLessonRepository;
        if (entity === ClassSchedule) return transactionClassScheduleRepository;
        throw new Error('Unexpected repository');
      }),
    };
    const rootLessonRepository: any = {
      find: jest.fn().mockResolvedValue(existingLessons),
      manager: {
        transaction: jest.fn((callback) => callback(manager)),
      },
    };
    const classScheduleRepository = {
      find: jest.fn().mockResolvedValue(configuredClassSchedules),
    };
    const service = new LessonByScheduleService(
      rootLessonRepository,
      {} as any,
      {} as any,
      classScheduleRepository as any,
    );

    await service.findAllLessonByScheduleOfClass(67);

    const createdLessons = transactionLessonRepository.save.mock.calls[0][0];
    expect(createdLessons.length).toBeGreaterThan(0);
    expect(
      createdLessons.every(
        (lesson: LessonBySchedule) => lesson.schedule.id === 23,
      ),
    ).toBe(true);
    expect(
      createdLessons.some(
        (lesson: LessonBySchedule) => String(lesson.date) === '2026-10-07',
      ),
    ).toBe(true);
    expect(existingLessons[0].date).toBe('2027-04-05');
    expect(existingLessons[1].date).toBe('2026-09-30');
  });
});
