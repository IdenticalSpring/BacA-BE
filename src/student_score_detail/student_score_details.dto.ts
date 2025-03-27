export class CreateStudentScoreDetailsDto {
  studentScoreID: number;
  testSkillID: number;
  score: number;
  avgScore: number;
}

export class UpdateStudentScoreDetailsDto {
  score?: number;
  avgScore?: number;
}
