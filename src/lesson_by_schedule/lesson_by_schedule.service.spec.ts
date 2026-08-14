import { Class } from '../class/class.entity';
import { Schedule } from '../schedule/schedule.entity';
import { LessonBySchedule } from './lesson_by_schedule.entity';
import { LessonByScheduleService } from './lesson_by_schedule.service';

describe('LessonByScheduleService', () => {
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
});
