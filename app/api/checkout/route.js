import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configura tu Access Token de Mercado Pago
// Preferentemente, guarda esto en un archivo .env.local como MERCADOPAGO_ACCESS_TOKEN
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const client = new MercadoPagoConfig({ accessToken });

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Mapear los items recibidos desde el carrito a la estructura que requiere Mercado Pago
    const items = body.items.map(item => ({
      title: item.nombre,
      unit_price: Number(item.precio),
      quantity: Number(item.quantity),
      currency_id: 'ARS', // Moneda (Pesos Argentinos)
    }));

    // Obtener la URL base asegurando que sea absoluta
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: items,
        back_urls: {
          success: `${origin}?status=success`,
          failure: `${origin}?status=failure`,
          pending: `${origin}?status=pending`
        },
        // Solo activamos auto_return automático si NO estamos en localhost
        ...(origin.includes('localhost') ? {} : { auto_return: 'approved' }),
      }
    });

    // Devolver el link de pago (init_point)
    return Response.json({ init_point: result.init_point });
  } catch (error) {
    console.error("Error detallado al crear preferencia:", error);
    // Extraemos el mensaje real del error si existe
    const errorMessage = error.message || error.cause?.message || 'Error desconocido en Mercado Pago';
    return Response.json({ error: `Fallo en Mercado Pago: ${errorMessage}` }, { status: 500 });
  }
}

