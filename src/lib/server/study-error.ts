export class StudyError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'StudyError';
  }
}
