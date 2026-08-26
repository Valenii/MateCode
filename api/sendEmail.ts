import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export interface EmailRequestBody {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}

/**
 * Vercel Serverless Function para enviar correos electrónicos usando AWS SES
 * Ruta: /api/sendEmail
 */
export default async function handler(req: any, res: any) {
  // Configuración de cabeceras CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido. Utilizar POST.' });
  }

  // Las credenciales de AWS se leen exclusivamente en el entorno del servidor
  const region = process.env.AWS_REGION || process.env.VITE_AWS_REGION || 'us-east-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.VITE_AWS_SECRET_ACCESS_KEY;
  const sourceEmail = process.env.AWS_SES_SOURCE_EMAIL || process.env.VITE_AWS_SES_SOURCE_EMAIL || 'notifications@matecode.com';

  const body: EmailRequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { to, subject, bodyText, bodyHtml } = body || {};

  if (!to || !subject || !bodyText) {
    return res.status(400).json({
      success: false,
      error: 'Campos requeridos faltantes: to, subject, bodyText',
    });
  }

  // Si no hay credenciales de AWS configuradas en el servidor, operar en modo simulación
  if (!accessKeyId || !secretAccessKey || accessKeyId === 'your_aws_access_key') {
    console.info(`[AWS SES Serverless SIMULATOR] Correo enviado a: ${to} | Asunto: ${subject}`);
    return res.status(200).json({
      success: true,
      messageId: `sim-${Date.now()}`,
      isSimulated: true,
      message: 'Email simulado exitosamente (configura AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY en Vercel para envío real).',
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
        ToAddresses: [to],
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
