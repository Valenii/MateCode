import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

// Mock del SDK de AWS SES: ningún test envía correos reales
vi.mock('@aws-sdk/client-ses', () => ({
  SESClient: vi.fn(function () {
    return { send: sendMock };
  }),
  SendEmailCommand: vi.fn(function (this: any, input: unknown) {
    this.input = input;
  }),
}));

import handler from '../../api/sendEmail';

const createRes = () => {
  const res: any = { statusCode: 0, body: undefined };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((payload: unknown) => {
    res.body = payload;
    return res;
  });
  res.setHeader = vi.fn();
  return res;
};

const validReq = (overrides: Record<string, unknown> = {}) => ({
  method: 'POST',
  headers: { authorization: 'Bearer valid-token' },
  body: { subject: 'Resumen', bodyText: 'Hola', bodyHtml: '<p>Hola</p>' },
  ...overrides,
});

const mockFirebaseLookup = (email: string | null, ok = true) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => (email ? { users: [{ email }] } : {}),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('api/sendEmail (Vercel Function)', () => {
  beforeEach(() => {
    sendMock.mockReset();
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-firebase-key');
    vi.stubEnv('AWS_ACCESS_KEY_ID', 'AKIATESTKEY');
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'test-secret');
    vi.stubEnv('AWS_SES_SOURCE_EMAIL', 'sender@matecode.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('rechaza métodos distintos de POST con 405', async () => {
    const res = createRes();
    await handler(validReq({ method: 'GET' }), res);

    expect(res.statusCode).toBe(405);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('rechaza con 401 si no hay token de autenticación', async () => {
    const fetchMock = mockFirebaseLookup('user@example.com');
    const res = createRes();
    await handler(validReq({ headers: {} }), res);

    expect(res.statusCode).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('rechaza con 401 si Firebase no reconoce el token', async () => {
    mockFirebaseLookup(null, false);
    const res = createRes();
    await handler(validReq(), res);

    expect(res.statusCode).toBe(401);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('responde 500 si el servidor no tiene la API key de Firebase', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', '');
    mockFirebaseLookup('user@example.com');
    const res = createRes();
    await handler(validReq(), res);

    expect(res.statusCode).toBe(500);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('rechaza con 400 si faltan subject o bodyText', async () => {
    mockFirebaseLookup('user@example.com');
    const res = createRes();
    await handler(validReq({ body: { subject: 'Solo asunto' } }), res);

    expect(res.statusCode).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('simula el envío si no hay credenciales de AWS', async () => {
    vi.stubEnv('AWS_ACCESS_KEY_ID', '');
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', '');
    mockFirebaseLookup('user@example.com');
    const res = createRes();
    await handler(validReq(), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ success: true, isSimulated: true });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('envía SIEMPRE al email del token e ignora el destinatario del body', async () => {
    mockFirebaseLookup('user@example.com');
    sendMock.mockResolvedValueOnce({ MessageId: 'msg-123' });
    const res = createRes();
    await handler(
      validReq({
        body: { to: 'victima@otro.com', subject: 'Resumen', bodyText: 'Hola' },
      }),
      res
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ success: true, messageId: 'msg-123', isSimulated: false });

    const command = sendMock.mock.calls[0][0];
    expect(command.input.Destination.ToAddresses).toEqual(['user@example.com']);
    expect(command.input.Source).toBe('sender@matecode.test');
  });

  it('responde 500 si AWS SES falla', async () => {
    mockFirebaseLookup('user@example.com');
    sendMock.mockRejectedValueOnce(new Error('Email address is not verified'));
    const res = createRes();
    await handler(validReq(), res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toMatchObject({ success: false, error: 'Email address is not verified' });
  });
});
