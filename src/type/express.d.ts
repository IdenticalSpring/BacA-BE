declare namespace Express {
  export interface Request {
    user?: { userId: number; username: string };
  }
}
