import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { faker } from '@faker-js/faker';
import { Clocking } from '../../shared/models/clocking.model';
import { User } from '../../shared/models/user.model';
import { MonthlyReportItem } from '../../shared/models/report.model';
import { Role } from '../../shared/models/roles.enum';

let mockUsers: User[] = [
    { id: '1', name: 'Admin Chronos', email: 'admin@chronos.dev', roles: [Role.SYSTEM_ADMIN] },
    { id: '2', name: 'Laura RRHH', email: 'rrhh@chronos.dev', roles: [Role.RRHH, Role.EMPLOYEE] },
    { id: '3', name: 'Juan Empleado', email: 'juan@chronos.dev', roles: [Role.EMPLOYEE] },
    { id: '4', name: 'Maria Desarrolladora', email: 'maria@chronos.dev', roles: [Role.EMPLOYEE] },
    { id: '5', name: 'Carlos Soporte', email: 'carlos@chronos.dev', roles: [Role.EMPLOYEE, Role.CLOCKING_ADMIN] },
    { id: '6', name: 'Pedro Fichador', email: 'fichador@chronos.dev', roles: [Role.FICHADOR] }
];

let mockClockings: Clocking[] = [];

mockUsers.forEach(user => {
    for (let i = 0; i < faker.number.int({ min: 15, max: 40 }); i++) {
        const date = faker.date.recent({ days: 60 });
        const startTime = faker.date.between({ from: new Date(date.getFullYear(), date.getMonth(), 1), to: new Date(date.getFullYear(), date.getMonth() + 1, 0) });
        const inProgress = i < 2 && user.id === '3';
        const endTime = inProgress ? null : faker.date.between({ from: startTime, to: new Date(startTime.getTime() + faker.number.int({min: 1, max: 9}) * 60 * 60 * 1000) });
        mockClockings.push({
            id: faker.string.uuid(),
            userId: user.id,
            userName: user.name,
            startTime: startTime.toISOString(),
            endTime: endTime?.toISOString() ?? null,
            description: faker.lorem.sentence(),
            status: inProgress ? 'in-progress' : 'completed',
        });
    }
});
mockClockings.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());


const handleGetClockings = () => {
    return of(new HttpResponse({ status: 200, body: mockClockings })).pipe(delay(600));
};

const handleAddClocking = (req: HttpRequest<any>) => {
    const requestUserId = req.body.userId;
    const targetUserId = requestUserId || '3';
    const targetUser = mockUsers.find(u => u.id === targetUserId);

    if (!targetUser) {
        return of(new HttpResponse({
            status: 404,
            statusText: 'User Not Found',
            body: { error: 'Usuario no encontrado' }
        })).pipe(delay(600));
    }

    const newClocking: Clocking = {
        id: faker.string.uuid(),
        userId: targetUser.id,
        userName: targetUser.name,
        startTime: new Date().toISOString(),
        endTime: null,
        description: req.body.description,
        status: 'in-progress',
    };
    mockClockings = [newClocking, ...mockClockings];
    return of(new HttpResponse({ status: 201, body: newClocking })).pipe(delay(600));
};

const handleEndClocking = (id: string) => {
    const clocking = mockClockings.find(c => c.id === id);
    if (clocking) {
        clocking.endTime = new Date().toISOString();
        clocking.status = 'completed';
        return of(new HttpResponse({ status: 200, body: clocking })).pipe(delay(600));
    }
    return throwError(() => new HttpResponse({ status: 404, statusText: 'Not Found' }));
};

const handleDeleteClocking = (id: string) => {
    const initialLength = mockClockings.length;
    mockClockings = mockClockings.filter(c => c.id !== id);
    if (mockClockings.length < initialLength) {
        return of(new HttpResponse({ status: 204 })).pipe(delay(600));
    }
    return throwError(() => new HttpResponse({ status: 404, statusText: 'Not Found' }));
};

const handleGetUsers = () => {
    return of(new HttpResponse({ status: 200, body: mockUsers })).pipe(delay(300));
};

const handleCreateUser = (req: HttpRequest<any>) => {
    const data = req.body as Omit<User, 'id'>;
    const newUser: User = {
        id: faker.string.uuid(),
        name: data.name,
        email: data.email,
        roles: data.roles,
    };
    mockUsers.push(newUser);
    return of(new HttpResponse({ status: 201, body: newUser })).pipe(delay(400));
};

const handleUpdateUser = (req: HttpRequest<any>, id: string) => {
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...req.body };
        return of(new HttpResponse({ status: 200, body: mockUsers[index] })).pipe(delay(400));
    }
    return throwError(() => new HttpResponse({ status: 404, statusText: 'User Not Found' }));
};

const handleDeleteUser = (id: string) => {
    const initialLength = mockUsers.length;
    mockUsers = mockUsers.filter(u => u.id !== id);
    if (mockUsers.length < initialLength) {
        return of(new HttpResponse({ status: 204 })).pipe(delay(400));
    }
    return throwError(() => new HttpResponse({ status: 404, statusText: 'User Not Found' }));
};

const handleGetUserHistory = (userId: string) => {
    const userClockings = mockClockings.filter(c => c.userId === userId);
    return of(new HttpResponse({ status: 200, body: userClockings })).pipe(delay(700));
};

const handleGetReports = (req: HttpRequest<any>) => {
    const month = Number(req.params.get('month'));
    const year = Number(req.params.get('year'));
    const userId = req.params.get('userId');

    let filteredClockings = mockClockings.filter(c => {
        const clockingDate = new Date(c.startTime);
        return clockingDate.getFullYear() === year && clockingDate.getMonth() === month && c.status === 'completed';
    });

    if (userId) {
        filteredClockings = filteredClockings.filter(c => c.userId === userId);
    }

    const reportData: MonthlyReportItem[] = filteredClockings.map(clocking => {
        const durationMs = new Date(clocking.endTime!).getTime() - new Date(clocking.startTime).getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        const standardDayHours = 8;
        const exceededHours = Math.max(0, durationHours - standardDayHours);

        return {
            id: clocking.id,
            userId: clocking.userId,
            userName: clocking.userName,
            date: clocking.startTime,
            totalHours: parseFloat(durationHours.toFixed(2)),
            exceededHours: parseFloat(exceededHours.toFixed(2)),
            deductibleTime: parseFloat(exceededHours.toFixed(2)),
        };
    });

    return of(new HttpResponse({ status: 200, body: reportData })).pipe(delay(800));
};


export const mockHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const { url, method } = req;
  const apiPrefix = '/api';

  if (url.endsWith(`${apiPrefix}/clockings`) && method === 'GET') return handleGetClockings();
  if (url.endsWith(`${apiPrefix}/clockings`) && method === 'POST') return handleAddClocking(req);
  if (url.match(new RegExp(`${apiPrefix}/clockings/.+$`)) && method === 'PUT') {
    const id = url.split('/').pop()!;
    return handleEndClocking(id);
  }
  if (url.match(new RegExp(`${apiPrefix}/clockings/.+$`)) && method === 'DELETE') {
    const id = url.split('/').pop()!;
    return handleDeleteClocking(id);
  }

  if (url.match(new RegExp(`${apiPrefix}/users/.+/history`)) && method === 'GET') {
    const parts = url.split('/');
    const userId = parts[parts.length - 2];
    return handleGetUserHistory(userId);
  }
  if (url.endsWith(`${apiPrefix}/users`) && method === 'GET') return handleGetUsers();
  if (url.endsWith(`${apiPrefix}/users`) && method === 'POST') return handleCreateUser(req);
  if (url.match(new RegExp(`${apiPrefix}/users/.+$`)) && method === 'PUT') {
    const id = url.split('/').pop()!;
    return handleUpdateUser(req, id);
  }
  if (url.match(new RegExp(`${apiPrefix}/users/.+$`)) && method === 'DELETE') {
    const id = url.split('/').pop()!;
    return handleDeleteUser(id);
  }

  if (url.startsWith(`${apiPrefix}/reports`) && method === 'GET') {
    return handleGetReports(req);
  }

  console.warn(`[MockHttpInterceptor]: Unhandled request to ${req.url}. Returning 404.`);
  return of(new HttpResponse({ status: 404, statusText: 'Not Found' }));
};
