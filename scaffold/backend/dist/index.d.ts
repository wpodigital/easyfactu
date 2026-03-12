interface JwtPayload {
    userId: number;
    email: string;
    rol: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export {};
//# sourceMappingURL=index.d.ts.map