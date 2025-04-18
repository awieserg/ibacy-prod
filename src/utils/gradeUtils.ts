export function getAppreciationFromGrade(grade: number): string {
  if (grade >= 19) return 'Excellent';
  if (grade >= 17) return 'Très bien';
  if (grade >= 15) return 'Bien';
  if (grade >= 13) return 'Assez bien';
  if (grade >= 11) return 'Passable';
  if (grade >= 9) return 'Faible';
  return 'Insuffisant';
}