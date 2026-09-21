import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export interface EmailRequestBody {
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}

/**
 * Valida el ID token de Firebase contra la API REST de Firebase Auth y devuelve
 * el email verificado del usuario, o null si el token es inválido o expiró.
 * Usa la API key pública del proyecto: no requiere ninguna credencial secreta.
 */
const verifyFirebaseIdToken = async (idToken: string): Promise<string | null> => {
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('missing-firebase-api-key');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  return data?.users?.[0]?.email ?? null;
};

/**
 * Vercel Serverless Function para enviar correos electrónicos usando AWS SES
 * Ruta: /api/sendEmail
 *
 * Seguridad:
 * - Requiere un ID token de Firebase (Authorization: Bearer <token>).
 * - El destinatario NUNCA viene del cliente: siempre es el email del token.
 * - Frontend y API comparten origen en Vercel, por eso no se habilita CORS.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Método no permitido. Utilizar POST.' });
  }

  // 1. Autenticación: solo usuarios con sesión de Firebase pueden enviar correos
  const authHeader: string = req.headers?.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!idToken) {
    return res.status(401).json({ success: false, error: 'Autenticación requerida.' });
  }

  let recipient: string | null;
  try {
    recipient = await verifyFirebaseIdToken(idToken);
  } catch (error) {
    console.error('Error verificando el token de Firebase:', error);
    return res.status(500).json({ success: false, error: 'El servidor no está configurado correctamente.' });
  }

  if (!recipient) {
    return res.status(401).json({ success: false, error: 'Sesión inválida o expirada.' });
  }

  // 2. Validación del contenido
  let body: EmailRequestBody;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ success: false, error: 'El cuerpo de la petición no es un JSON válido.' });
  }

  const { subject, bodyText, bodyHtml } = body || ({} as Partial<EmailRequestBody>);

  if (!subject || !bodyText) {
    return res.status(400).json({
      success: false,
      error: 'Campos requeridos faltantes: subject, bodyText',
    });
  }

  // 3. Las credenciales de AWS se leen exclusivamente en el entorno del servidor
  const region = process.env.AWS_REGION || 'us-east-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sourceEmail = process.env.AWS_SES_SOURCE_EMAIL || 'notifications@matecode.com';

  // Si no hay credenciales de AWS configuradas en el servidor, operar en modo simulación
  if (!accessKeyId || !secretAccessKey || accessKeyId === 'your_aws_access_key_id') {
    console.info(`[AWS SES Serverless SIMULATOR] Correo simulado para: ${recipient} | Asunto: ${subject}`);
    return res.status(200).json({
      success: true,
      messageId: `sim-${Date.now()}`,
      isSimulated: true,
      message: 'Email simulado (configura AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY en Vercel para envío real).',
    });
  }

  try {
    const sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new SendEmailCommand({
      Source: sourceEmail,
      Destination: {
        ToAddresses: [recipient],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: bodyText,
            Charset: 'UTF-8',
          },
          ...(bodyHtml && {
            Html: {
              Data: bodyHtml,
              Charset: 'UTF-8',
            },
          }),
        },
      },
    });

    const response = await sesClient.send(command);
    return res.status(200).json({
      success: true,
      messageId: response.MessageId,
      isSimulated: false,
    });
  } catch (error: any) {
    console.error('Error enviando email con AWS SES:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al conectar con AWS SES',
      isSimulated: false,
    });
  }
}
