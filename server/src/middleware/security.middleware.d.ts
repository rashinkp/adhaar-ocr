import type { Request, Response, NextFunction } from 'express';
export declare const corsOptions: {
    origin: string[];
    credentials: boolean;
};
export declare const rateLimiter: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=security.middleware.d.ts.map